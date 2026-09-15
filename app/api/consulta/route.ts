import { NextResponse } from "next/server";
import { buscarArticulos, comoContexto } from "../../corpus";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODELO_POR_DEFECTO = "openai/gpt-4o-mini";
const MAX_TOKENS = 2000;
const TIEMPO_LIMITE_MS = 45000;
const LIMITE_CARACTERES = 2000;

export type Fundamento = {
  sigla: string;
  articulo: string;
  ordenamiento: string;
  ultima_reforma_dof: string | null;
  fuente: string;
  extracto: string;
};

export type RespuestaConsulta = {
  respuesta: string;
  fundamentos: Fundamento[];
  sin_sustento: boolean;
  demo: boolean;
};

const INSTRUCCIONES = `Eres un abogado mexicano de propiedad intelectual. Respondes la duda de una persona sin formación jurídica apoyándote ÚNICAMENTE en los artículos que se te proporcionan.

REGLAS INQUEBRANTABLES:
- Responde solo con base en los artículos proporcionados. No uses conocimiento externo sobre plazos, requisitos o procedimientos.
- Cita los artículos entre corchetes al usarlos, así: [LFPPI Artículo 173].
- Si los artículos proporcionados NO contienen lo necesario para responder, dilo con claridad y pon "sin_sustento" en true. No rellenes con lo que creas recordar.
- No afirmes que algo es registrable ni garantices resultados.
- No cites artículos que no aparezcan en el material proporcionado.

FORMA:
- Español de México, claro, sin tecnicismos innecesarios. Explica el término técnico la primera vez.
- Máximo 180 palabras, en prosa. Nada de listas largas.
- Cierra señalando qué haría falta saber para dar una respuesta firme.

Responde ÚNICAMENTE con un objeto JSON con estas claves: "respuesta" (string), "articulos_citados" (arreglo de strings con la forma "LFPPI Artículo 173"), "sin_sustento" (booleano).`;

function extraerJSON(texto: string): unknown {
  const limpio = texto.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(limpio);
  } catch {
    const i = limpio.indexOf("{");
    const f = limpio.lastIndexOf("}");
    if (i === -1 || f <= i) throw new Error("El modelo no devolvió un JSON reconocible.");
    return JSON.parse(limpio.slice(i, f + 1));
  }
}

export async function POST(request: Request) {
  let pregunta = "";
  try {
    const cuerpo = (await request.json()) as { pregunta?: unknown };
    pregunta = typeof cuerpo.pregunta === "string" ? cuerpo.pregunta.trim() : "";
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (pregunta.length < 15) {
    return NextResponse.json(
      { error: "Cuéntanos tu problema con un poco más de detalle (mínimo 15 caracteres)." },
      { status: 400 },
    );
  }
  pregunta = pregunta.slice(0, LIMITE_CARACTERES);

  const articulos = buscarArticulos(pregunta, 10);

  const fundamentos: Fundamento[] = articulos.map((a) => ({
    sigla: a.sigla,
    articulo: a.articulo,
    ordenamiento: a.ordenamiento,
    ultima_reforma_dof: a.ultima_reforma_dof,
    fuente: a.fuente,
    extracto: a.texto.slice(0, 320) + (a.texto.length > 320 ? "…" : ""),
  }));

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || articulos.length === 0) {
    const respaldo: RespuestaConsulta = {
      respuesta:
        articulos.length === 0
          ? "No encontramos disposiciones en la Ley Federal de Protección a la Propiedad Industrial, la Ley Federal del Derecho de Autor ni sus reglamentos que se refieran a lo que describes. Puede que el tema quede fuera de la propiedad intelectual, o que convenga plantearlo con otras palabras."
          : "Modo demo: encontramos las disposiciones aplicables, pero el servicio de redacción no está configurado. Abajo puedes leer los artículos localizados.",
      fundamentos,
      sin_sustento: articulos.length === 0,
      demo: true,
    };
    return NextResponse.json(respaldo);
  }

  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_LIMITE_MS);

  try {
    const encabezados: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    if (process.env.OPENROUTER_SITE_URL) encabezados["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
    if (process.env.OPENROUTER_SITE_NAME) encabezados["X-Title"] = process.env.OPENROUTER_SITE_NAME;

    const llamada = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: encabezados,
      signal: control.signal,
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || MODELO_POR_DEFECTO,
        temperature: 0.1,
        max_tokens: MAX_TOKENS,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: INSTRUCCIONES },
          {
            role: "user",
            content:
              `ARTÍCULOS DISPONIBLES:\n\n${comoContexto(articulos)}\n\n` +
              `DUDA DE LA PERSONA:\n"""${pregunta}"""`,
          },
        ],
      }),
    });

    if (!llamada.ok) {
      console.error("OpenRouter /consulta respondió", llamada.status, (await llamada.text()).slice(0, 300));
      const respaldo: RespuestaConsulta = {
        respuesta:
          "El servicio de redacción no respondió. Abajo están las disposiciones que localizamos sobre tu caso.",
        fundamentos,
        sin_sustento: false,
        demo: true,
      };
      return NextResponse.json(respaldo);
    }

    const datos = (await llamada.json()) as { choices?: { message?: { content?: string } }[] };
    const contenido = datos.choices?.[0]?.message?.content;
    if (!contenido) throw new Error("Respuesta vacía del modelo.");

    const bruto = extraerJSON(contenido) as Record<string, unknown>;
    const texto = typeof bruto.respuesta === "string" ? bruto.respuesta.trim() : "";
    if (!texto) throw new Error("La respuesta del modelo está incompleta.");

    // Solo se muestran como fundamento los artículos que el modelo realmente citó.
    const citados = Array.isArray(bruto.articulos_citados)
      ? bruto.articulos_citados.map((x) => String(x).toLowerCase())
      : [];
    const numeroDe = (articulo: string) => articulo.replace(/[^\d]/g, "");
    const usados = citados.length
      ? fundamentos.filter((f) => {
          const n = numeroDe(f.articulo);
          return citados.some(
            (c) => c.includes(f.sigla.toLowerCase()) && numeroDe(c) === n,
          );
        })
      : [];

    const respuesta: RespuestaConsulta = {
      respuesta: texto,
      fundamentos: usados.length ? usados : fundamentos.slice(0, 5),
      sin_sustento: bruto.sin_sustento === true,
      demo: false,
    };
    return NextResponse.json(respuesta);
  } catch (error) {
    console.error("Fallo en /api/consulta", error);
    const respaldo: RespuestaConsulta = {
      respuesta:
        "No pudimos redactar la respuesta en este momento. Abajo están las disposiciones que localizamos sobre tu caso.",
      fundamentos,
      sin_sustento: false,
      demo: true,
    };
    return NextResponse.json(respaldo);
  } finally {
    clearTimeout(temporizador);
  }
}
