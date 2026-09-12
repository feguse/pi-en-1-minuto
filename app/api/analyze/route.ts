import { NextResponse } from "next/server";
import { analisisDemo, validarAnalisis, type RespuestaAnalisis } from "../../lib";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODELO_POR_DEFECTO = "openai/gpt-4o-mini";
const LIMITE_CARACTERES = 2000;
const TIEMPO_LIMITE_MS = 25000;

const INSTRUCCIONES = `Eres un asistente que da orientación PRELIMINAR sobre propiedad industrial en México (Ley Federal de Protección a la Propiedad Industrial, IMPI).

El usuario describe en lenguaje cotidiano algo que creó o quiere lanzar. Clasifica el caso en EXACTAMENTE una de estas categorías, escrita tal cual:
- "marca o signo distintivo"
- "patente o modelo de utilidad"
- "diseno industrial"
- "secreto industrial"
- "combinacion de varias"

Usa "combinacion de varias" solo cuando la descripción contenga con claridad elementos de naturaleza distinta (por ejemplo identidad comercial y además una solución técnica).

Reglas de contenido:
- Escribe en español de México, en tono claro y profesional, dirigido a alguien sin formación jurídica.
- No prometas registrabilidad ni resultados. No cites artículos ni números de ley.
- No inventes datos del usuario: si falta información, dilo en "advertencias".
- "explicacion": máximo 80 palabras, en prosa, sin listas.
- "elementos_protegibles": de 2 a 5 elementos concretos tomados de la descripción del usuario.
- "siguientes_pasos": exactamente 3 acciones prácticas y accionables.
- "figuras_complementarias": de 1 a 3 figuras adicionales que podrían explorarse.
- "advertencias": de 1 a 3 riesgos, supuestos o datos faltantes relevantes.
- "confianza": "alto" si la descripción es clara y encaja en una sola figura; "medio" si es razonable pero incompleta; "bajo" si es vaga, ambigua o mezcla muchos temas.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni bloques de código.`;

const ESQUEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "categoria",
    "proteccion_principal",
    "explicacion",
    "elementos_protegibles",
    "siguientes_pasos",
    "figuras_complementarias",
    "advertencias",
    "confianza",
  ],
  properties: {
    categoria: {
      type: "string",
      enum: [
        "marca o signo distintivo",
        "patente o modelo de utilidad",
        "diseno industrial",
        "secreto industrial",
        "combinacion de varias",
      ],
    },
    proteccion_principal: { type: "string" },
    explicacion: { type: "string" },
    elementos_protegibles: { type: "array", items: { type: "string" } },
    siguientes_pasos: { type: "array", items: { type: "string" } },
    figuras_complementarias: { type: "array", items: { type: "string" } },
    advertencias: { type: "array", items: { type: "string" } },
    confianza: { type: "string", enum: ["alto", "medio", "bajo"] },
  },
} as const;

/** Extrae el primer objeto JSON de un texto, tolerando cercas de código. */
function extraerJSON(texto: string): unknown {
  const limpio = texto.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(limpio);
  } catch {
    const inicio = limpio.indexOf("{");
    const fin = limpio.lastIndexOf("}");
    if (inicio === -1 || fin <= inicio) {
      throw new Error("El modelo no devolvió un JSON reconocible.");
    }
    return JSON.parse(limpio.slice(inicio, fin + 1));
  }
}

export async function POST(request: Request) {
  let idea = "";

  try {
    const cuerpo = (await request.json()) as { idea?: unknown };
    idea = typeof cuerpo.idea === "string" ? cuerpo.idea.trim() : "";
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (idea.length < 15) {
    return NextResponse.json(
      { error: "Describe tu idea con un poco más de detalle (mínimo 15 caracteres)." },
      { status: 400 },
    );
  }

  idea = idea.slice(0, LIMITE_CARACTERES);

  const apiKey = process.env.OPENROUTER_API_KEY;

  // Modo demo: sin clave configurada, se devuelve un resultado simulado local.
  if (!apiKey) {
    const respuesta: RespuestaAnalisis = { resultado: analisisDemo(idea), demo: true };
    return NextResponse.json(respuesta);
  }

  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_LIMITE_MS);

  try {
    const encabezados: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    if (process.env.OPENROUTER_SITE_URL) {
      encabezados["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
    }
    if (process.env.OPENROUTER_SITE_NAME) {
      encabezados["X-Title"] = process.env.OPENROUTER_SITE_NAME;
    }

    const modelo = process.env.OPENROUTER_MODEL || MODELO_POR_DEFECTO;

    const pedir = (formato: unknown) =>
      fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: encabezados,
        signal: control.signal,
        body: JSON.stringify({
          model: modelo,
          temperature: 0.2,
          max_tokens: 1200,
          response_format: formato,
          messages: [
            { role: "system", content: INSTRUCCIONES },
            { role: "user", content: `Descripción del usuario:\n"""${idea}"""` },
          ],
        }),
      });

    // Primero con esquema estricto; si el modelo elegido no lo soporta, se reintenta
    // pidiendo solo un objeto JSON.
    let llamada = await pedir({
      type: "json_schema",
      json_schema: { name: "analisis_pi", strict: true, schema: ESQUEMA },
    });

    if (!llamada.ok) {
      console.error("OpenRouter rechazó json_schema", llamada.status);
      llamada = await pedir({ type: "json_object" });
    }

    if (!llamada.ok) {
      const detalle = await llamada.text();
      console.error("OpenRouter error", llamada.status, detalle.slice(0, 500));
      return NextResponse.json(
        { error: "El servicio de análisis no está disponible en este momento. Intenta de nuevo." },
        { status: 502 },
      );
    }

    const datos = (await llamada.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const contenido = datos.choices?.[0]?.message?.content;

    if (!contenido) {
      throw new Error("Respuesta vacía del modelo.");
    }

    const resultado = validarAnalisis(extraerJSON(contenido));
    const respuesta: RespuestaAnalisis = { resultado, demo: false };
    return NextResponse.json(respuesta);
  } catch (error) {
    const abortado = error instanceof Error && error.name === "AbortError";
    console.error("Fallo en /api/analyze", error);
    return NextResponse.json(
      {
        error: abortado
          ? "El análisis tardó demasiado. Vuelve a intentarlo."
          : "No pudimos interpretar la respuesta del análisis. Vuelve a intentarlo.",
      },
      { status: abortado ? 504 : 502 },
    );
  } finally {
    clearTimeout(temporizador);
  }
}
