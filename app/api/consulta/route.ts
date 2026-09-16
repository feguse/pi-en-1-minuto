import { NextResponse } from "next/server";
import { sinConfesiones, tieneConfesion } from "../../prosa";
import { comoContexto, contextoParaConsulta } from "../../corpus";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODELO_POR_DEFECTO = "openai/gpt-4o-mini";
const MAX_TOKENS = 3200;
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
  requiere_profesional: boolean;
  motivo_escalamiento: string;
  demo: boolean;
};

const INSTRUCCIONES = `Eres un abogado mexicano de propiedad intelectual. Respondes la duda de una persona sin formación jurídica. Fundamentas cada afirmación en las disposiciones que acompañan a la consulta, nunca en tu memoria.

REGLAS INQUEBRANTABLES:
- Cada afirmación se sostiene en una disposición transcrita. No uses conocimiento externo sobre plazos, requisitos o procedimientos.
- Cita los artículos entre corchetes al usarlos, así: [LFPPI Artículo 173].
- "sin_sustento" es una bandera interna para nuestro registro, no un aviso al lector: ponla en true cuando las disposiciones transcritas no sostengan la respuesta, y aun así redacta un texto útil conforme a la regla de abajo. Nunca lo menciones ni lo insinúes. No rellenes con lo que creas recordar.
- No afirmes que algo es registrable ni garantices resultados.
- No cites artículos que no estén transcritos.

LO QUE NUNCA APARECE EN TU RESPUESTA:
- Nunca hables de tus fuentes como si fueran un inventario que te entregaron:
  nada de "los artículos proporcionados", "con la información disponible",
  "según el material que tengo", "en el corpus", "con los artículos que
  tenemos". Un abogado no escribe "con los documentos que me dieron"; da su
  opinión y cita la norma. La cita entre corchetes ya dice de dónde sale.
- Nunca describas tu propio proceso, tus límites como sistema, ni el hecho de
  ser una herramienta automática.
- Nunca anuncies lo que falta ni el límite de lo que puedes decir. Prohibidas
  también las versiones elegantes: "las disposiciones que fundamentan nuestra
  opinión no contienen", "antes de explicarte el límite de lo que podemos
  decirte", "no está previsto en la normativa que consultamos". Y nada de
  "lamentablemente", "desafortunadamente" ni disculpas: la incertidumbre se
  enuncia y se sigue.
- Cuando la norma no alcance para responder toda la pregunta, responde la parte
  que sí se sostiene, y para el resto di de qué depende y quién lo resuelve
  —el IMPI, el Indautor, un abogado con los documentos a la vista—. El lector
  nunca debe notar que algo faltó; debe salir sabiendo qué sigue. Compara:
    NO: "Con los artículos disponibles no puedo determinar si es registrable."
    SÍ: "Si es registrable depende de que el diseño no se haya divulgado antes
        de la solicitud; habría que revisar cuándo se publicó por primera vez."
    NO: "Lamentablemente no contamos con la información sobre las tarifas."
    SÍ: "El costo lo fija el IMPI en su tarifa oficial, que se actualiza cada
        año y se consulta en su propio sitio; conviene verla ahí antes de
        presupuestar, porque la cifra de hace un año ya no sirve."
- Una pregunta sobre un país distinto de México se responde igual: qué alcance
  tiene el registro mexicano y a qué oficina corresponde lo demás, sin lamentar
  nada.

CÓMO ESCRIBES:
- Español de México, para alguien sin formación jurídica. Explica el término técnico la primera vez, en la misma frase.
- Primera persona del plural para el criterio: "consideramos", "identificamos", "en nuestra opinión".
- Verbo directo, no nominalización. Nada de "llevar a cabo la presentación de".
- Prohibidas las transiciones reflejas al abrir párrafo: "cabe señalar", "es importante destacar", "en ese orden de ideas". Prohibidos los adjetivos que no informan. Prohibidas las simetrías "no X, sino Y" y los tercetos.
- De 200 a 320 palabras, separadas en TRES O CUATRO párrafos con una línea en blanco entre ellos. Ningún párrafo pasa de cinco líneas. Varía la longitud de las oraciones porque el razonamiento lo pide.
- Primero qué le está pasando a la persona en sus propios términos; luego qué dice la ley al respecto; luego qué puede hacer y qué conviene primero; luego el límite, sin dramatizarlo.
- La incertidumbre se enuncia y se sigue, sin disculpas: "esto no garantiza que", "pudiera ser una opción viable".
- Cierra señalando qué haría falta saber para dar una respuesta firme.

Si el caso excede lo que una orientación preliminar puede resolver —hay un conflicto en curso, un tercero usando lo ajeno, dudas de titularidad, contratos de por medio o dinero comprometido— responde igual con lo que sí se pueda decir y pon "requiere_profesional" en true, explicando en una frase por qué.

Responde ÚNICAMENTE con un objeto JSON con estas claves: "respuesta" (string), "articulos_citados" (arreglo de strings con la forma "LFPPI Artículo 173"), "sin_sustento" (booleano), "requiere_profesional" (booleano), "motivo_escalamiento" (string, vacío si no aplica).`;

const ESQUEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "respuesta",
    "articulos_citados",
    "sin_sustento",
    "requiere_profesional",
    "motivo_escalamiento",
  ],
  properties: {
    respuesta: { type: "string" },
    articulos_citados: { type: "array", items: { type: "string" } },
    sin_sustento: { type: "boolean" },
    requiere_profesional: { type: "boolean" },
    motivo_escalamiento: { type: "string" },
  },
} as const;

/**
 * Rescata prosa utilizable de una respuesta que no parseó como JSON.
 * Vale más un texto imperfecto del modelo que una disculpa.
 */
function rescatarProsa(texto: string): string {
  const sinCercas = texto.replace(/```(?:json)?/gi, "").trim();
  const m = sinCercas.match(/"respuesta"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (m) {
    try {
      return JSON.parse(`"${m[1]}"`);
    } catch {
      /* sigue */
    }
  }
  // Sin comillas reconocibles: se limpia el andamiaje y se usa lo que quede.
  const plano = sinCercas
    .replace(/^\s*\{[\s\S]*?"respuesta"\s*:\s*/i, "")
    .replace(/[{}\[\]]/g, " ")
    .replace(/"(respuesta|articulos_citados|sin_sustento|requiere_profesional|motivo_escalamiento)"\s*:/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plano.length > 120 ? plano : "";
}

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

  const articulos = contextoParaConsulta(pregunta);

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
          ? "Lo que describes no encuentra respaldo en la Ley Federal de Protección a la Propiedad Industrial, la Ley Federal del Derecho de Autor ni sus reglamentos. Puede que el asunto quede fuera de la propiedad intelectual, o que convenga plantearlo con otras palabras."
          : "Modo de demostración: el servicio de redacción no está configurado. Abajo quedan las disposiciones aplicables al caso.",
      fundamentos,
      sin_sustento: articulos.length === 0,
      requiere_profesional: false,
      motivo_escalamiento: "",
      demo: true,
    };
    return NextResponse.json(respaldo);
  }

  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_LIMITE_MS);

  /** Respuesta de último recurso: útil, no una disculpa. */
  const conLoQueHay = (texto: string, motivo: string): RespuestaConsulta => ({
    respuesta: texto,
    fundamentos,
    sin_sustento: false,
    requiere_profesional: true,
    motivo_escalamiento: motivo,
    demo: true,
  });

  try {
    const encabezados: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    if (process.env.OPENROUTER_SITE_URL) encabezados["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
    if (process.env.OPENROUTER_SITE_NAME) encabezados["X-Title"] = process.env.OPENROUTER_SITE_NAME;

    const pedir = (formato: unknown) =>
      fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: encabezados,
        signal: control.signal,
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || MODELO_POR_DEFECTO,
          temperature: 0.45,
          max_tokens: MAX_TOKENS,
          reasoning: { effort: "low" },
          response_format: formato,
          messages: [
            { role: "system", content: INSTRUCCIONES },
            {
              role: "user",
              content:
                `DISPOSICIONES APLICABLES AL CASO:\n\n${comoContexto(articulos)}\n\n` +
                `DUDA DE LA PERSONA:\n"""${pregunta}"""`,
            },
          ],
        }),
      });

    const textoDe = async (llamada: Response): Promise<string | null> => {
      if (!llamada.ok) {
        console.error("OpenRouter /consulta", llamada.status, (await llamada.text()).slice(0, 300));
        return null;
      }
      const datos = (await llamada.json()) as {
        choices?: { message?: { content?: string }; finish_reason?: string }[];
      };
      return datos.choices?.[0]?.message?.content ?? null;
    };

    // Tres intentos, de más estructurado a más permisivo.
    let contenido = await textoDe(
      await pedir({
        type: "json_schema",
        json_schema: { name: "consulta_pi", strict: true, schema: ESQUEMA },
      }),
    );
    if (!contenido) contenido = await textoDe(await pedir({ type: "json_object" }));

    if (!contenido) {
      return NextResponse.json(
        conLoQueHay(
          "Tu caso necesita una revisión más detenida de la que alcanza una orientación preliminar. Estas son las disposiciones que lo rigen; conviene leerlas con un abogado antes de tomar una decisión.",
          "El servicio de redacción no respondió y tu caso involucra elementos que conviene revisar con documentos a la vista.",
        ),
      );
    }

    let bruto: Record<string, unknown> | null = null;
    try {
      bruto = extraerJSON(contenido) as Record<string, unknown>;
    } catch {
      console.error("JSON ilegible en /consulta:", contenido.slice(0, 300));
    }

    // Si el JSON no se pudo leer, se rescata la prosa antes de rendirse.
    if (!bruto) {
      const prosa = rescatarProsa(contenido);
      if (prosa) {
        return NextResponse.json({
          respuesta: prosa,
          fundamentos,
          sin_sustento: false,
          requiere_profesional: true,
          motivo_escalamiento:
            "La respuesta se recuperó de forma parcial; conviene que un abogado la revise antes de actuar.",
          demo: false,
        } satisfies RespuestaConsulta);
      }
      return NextResponse.json(
        conLoQueHay(
          "Tu caso necesita una revisión más detenida de la que alcanza una orientación preliminar. Estas son las disposiciones que lo rigen.",
          "El caso admite más de una lectura; conviene que un abogado revise los documentos antes de actuar.",
        ),
      );
    }

    const texto = typeof bruto.respuesta === "string" ? bruto.respuesta.trim() : "";
    if (!texto) {
      const prosa = rescatarProsa(contenido);
      return NextResponse.json(
        conLoQueHay(
          prosa ||
            "Tu caso necesita una revisión más detenida de la que alcanza una orientación preliminar. Estas son las disposiciones que lo rigen.",
          "El caso admite más de una lectura; conviene que un abogado revise los documentos antes de actuar.",
        ),
      );
    }

    const numeroDe = (articulo: string) => articulo.replace(/[^\d]/g, "");
    const citados = Array.isArray(bruto.articulos_citados)
      ? bruto.articulos_citados.map((x) => String(x).toLowerCase())
      : [];
    const usados = citados.length
      ? fundamentos.filter((f) => {
          const n = numeroDe(f.articulo);
          return citados.some((c) => c.includes(f.sigla.toLowerCase()) && numeroDe(c) === n);
        })
      : [];

    const limpio = sinConfesiones(texto);
    if (tieneConfesion(limpio)) console.log("prosa: confesión no filtrada en /consulta");

    const respuesta: RespuestaConsulta = {
      respuesta: limpio,
      fundamentos: usados.length ? usados : fundamentos.slice(0, 5),
      sin_sustento: bruto.sin_sustento === true,
      requiere_profesional: bruto.requiere_profesional === true,
      motivo_escalamiento:
        typeof bruto.motivo_escalamiento === "string" ? bruto.motivo_escalamiento : "",
      demo: false,
    };
    return NextResponse.json(respuesta);
  } catch (error) {
    console.error("Fallo en /api/consulta", error);
    return NextResponse.json(
      conLoQueHay(
        "Esta consulta pide una revisión más detenida de la que alcanza una orientación preliminar. Estas son las disposiciones aplicables a lo que describes.",
        "El caso pide una revisión profesional antes de actuar.",
      ),
    );
  } finally {
    clearTimeout(temporizador);
  }
}
