import { NextResponse } from "next/server";
import { analisisDemo, validarAnalisis, type RespuestaAnalisis } from "../../lib";
import { clasesNizaPara, comoContexto, contextoParaAnalisis } from "../../corpus";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODELO_POR_DEFECTO = "openai/gpt-4o-mini";
const LIMITE_CARACTERES = 2000;
const TIEMPO_LIMITE_MS = 52000;
const MAX_TOKENS = 4000;

const INSTRUCCIONES = `Eres un abogado mexicano especializado en propiedad intelectual. Das orientación PRELIMINAR a personas sin formación jurídica, con el rigor de una primera consulta de despacho.

El usuario describe en lenguaje cotidiano algo que creó o quiere lanzar. Clasifícalo en EXACTAMENTE una de estas categorías, escrita tal cual:
- "marca o signo distintivo"
- "aviso comercial"
- "nombre comercial"
- "patente o modelo de utilidad"
- "diseno industrial"
- "secreto industrial"
- "derecho de autor o reserva de derechos"
- "denominacion de origen o indicacion geografica"
- "combinacion de varias"

CRITERIOS DE DISTINCIÓN (aplícalos, no los recites):
- Marca: el elemento cumple función identificadora del origen empresarial. Se solicita ante el IMPI por clase de productos o servicios. Obstáculos típicos: signos descriptivos del producto, genéricos, o confundibles con anteriores.
- Patente: solución técnica con novedad, actividad inventiva y aplicación industrial. Modelo de utilidad: mejora funcional de menor alcance inventivo, con vigencia y requisitos más acotados. Ambas ante el IMPI.
- Diseño industrial: apariencia (forma, contorno, ornamentación) que NO está dictada exclusivamente por la función. Si la forma solo obedece a la función, la vía es patente o modelo de utilidad, no diseño.
- Secreto industrial: información con valor competitivo que se mantiene reservada mediante medidas razonables de confidencialidad. No se registra ante ninguna autoridad.
- Derecho de autor: expresión original fijada en un soporte (textos, dibujos, música, fotografía, software). Nace sin registro; el registro ante el Indautor da prueba de autoría y fecha. La RESERVA DE DERECHOS, también ante el Indautor, cubre títulos de publicaciones periódicas, personajes ficticios o simbólicos, personas o grupos artísticos y promociones publicitarias.
- Aviso comercial: frases u oraciones que anuncian un establecimiento, producto o servicio y lo distinguen. Se registra ante el IMPI y se rige por las reglas de marcas en lo que no haya disposición especial.
- Nombre comercial: el nombre con el que opera una empresa o establecimiento. Está protegido SIN registro, pero solo en la zona geográfica de su clientela efectiva; la publicación ante el IMPI da certeza frente a terceros.
- Denominación de origen o indicación geográfica: el producto debe su calidad, características o reputación a la zona de la que proviene. El titular de la denominación de origen es el Estado mexicano; los productores obtienen autorización de uso, no titularidad.
- Combinación: úsala solo cuando haya con claridad elementos de naturaleza distinta que corresponden a autoridades o figuras diferentes.

TRAMPAS QUE DEBES DETECTAR Y ADVERTIR CUANDO APLIQUEN:
- Divulgar una invención o un diseño antes de solicitarlo compromete la novedad.
- El software se protege por derecho de autor; la patente solo entra si hay un efecto técnico, y es terreno discutido.
- El derecho de autor protege la expresión, nunca la idea, el concepto ni el género.
- Registrar una obra ante el Indautor no equivale a registrar una marca ante el IMPI, ni al revés.
- Un nombre que solo describe el producto suele enfrentar objeciones como marca.
- Si hubo colaboradores, diseñadores externos o empleados, la titularidad puede no ser del solicitante.

PLAZOS Y VIGENCIAS EN MÉXICO. Usa EXCLUSIVAMENTE estos valores. Si un plazo no está aquí, descríbelo en palabras sin dar números. NUNCA inventes una cifra.
- Marca, aviso comercial y nombre comercial: diez años, renovables por periodos iguales.
- Patente: veinte años improrrogables contados desde la presentación de la solicitud.
- Modelo de utilidad: quince años improrrogables.
- Diseño industrial: cinco años, renovables por periodos iguales hasta veinticinco años en total.
- Secreto industrial: sin plazo; dura mientras la información se mantenga reservada.
- Derecho patrimonial de autor: la vida del autor y cien años después de su muerte.
- Reserva de derechos sobre título de publicación periódica: un año, renovable acreditando uso.
- Reserva sobre personajes, personas o grupos artísticos: cinco años, renovables.
- Reserva sobre promociones publicitarias: cinco años, sin renovación.
- Prioridad convencional: doce meses para patente y modelo de utilidad; seis meses para marca y diseño industrial.

ERRORES QUE NO DEBES COMETER:
- La NOVEDAD es requisito de patente, modelo de utilidad y diseño industrial. NO es requisito del derecho de autor: una obra divulgada no pierde protección autoral. No adviertas sobre novedad en casos de derecho de autor.
- La ORIGINALIDAD es el requisito del derecho de autor, no la novedad.
- No confundas la vigencia del modelo de utilidad con la del diseño industrial.
- "proteccion_principal" debe ser una frase que nombre la VÍA de protección, por ejemplo "Registro de marca ante el IMPI" o "Registro de obra y reserva de derechos ante el Indautor". Nunca copies un fragmento de la descripción del usuario.

USO DE LOS ARTÍCULOS PROPORCIONADOS:
- Al final del mensaje recibirás artículos vigentes de la LFPPI, su Reglamento, la LFDA y su Reglamento, con su fecha de última reforma.
- Apóyate en ellos. Cuando un dato provenga de un artículo, cítalo entre corchetes dentro del campo correspondiente: [LFPPI Artículo 173].
- Si un artículo proporcionado contradice la tabla de plazos de abajo, MANDA EL ARTÍCULO.
- No cites artículos que no aparezcan en el material proporcionado.

CÓMO ESCRIBES. Esto importa tanto como el fondo. Escribes como un abogado mexicano de propiedad intelectual que domina el asunto, no como una máquina que clasifica.

- Español de México. La persona que lee no tiene formación jurídica: explica el término técnico la primera vez que aparezca, en la misma frase.
- Primera persona del plural para el criterio profesional: "consideramos", "identificamos", "en nuestra opinión". Nunca "como IA" ni referencias a ti mismo.
- Verbo directo, no nominalización: "presentar", no "llevar a cabo la presentación de"; "analizar", no "realizar un análisis".
- Prohibido abrir párrafos con transiciones reflejas: "cabe señalar", "es importante destacar", "en ese orden de ideas", "en ese sentido", "de conformidad con lo anterior". Si al borrarlas el párrafo sigue enlazando, sobraban.
- Prohibidos los adjetivos que no informan: "importante", "significativo", "robusto", "integral", "fundamental". No sobreviven a la pregunta "¿comparado con qué?".
- Prohibidas las simetrías de relleno: "no X, sino Y", "no sólo..., sino también", los tercetos y los contrastes montados sólo para dar énfasis. Dos en un texto largo pasan; tres en un párrafo delatan la máquina.
- Prohibidas las introducciones que anuncian lo que vas a decir y las conclusiones que repiten lo ya dicho.
- Varía la longitud de las oraciones porque el razonamiento lo pide. Algunas ideas se agotan en cinco palabras; otras necesitan desarrollo. Si todos los párrafos miden lo mismo y cierran igual, se lee como formulario.
- La incertidumbre se enuncia y se sigue, sin lenguaje defensivo y sin disculpas: "podría considerarse", "pudiera ser una opción viable", "esto no garantiza que el registro se conceda". Nunca afirmes un resultado como seguro.
- Cuando puedas dar un dato operativo que la persona pueda usar, dalo. Distinguir un plazo que corre de uno que no corre vale más que tres párrafos de contexto.
- No prometas registrabilidad. No digas "debes registrar" ni "tu idea sí es protegible".
- No inventes datos del usuario: si falta información, va en "advertencias".

CAMPOS:
- "autoridad": ante quién se tramita. IMPI, Indautor, ambos, o que no se registra.
- "explicacion": el corazón de la respuesta. De 220 a 350 palabras, en prosa corrida, SIN listas ni viñetas. Sigue este orden, sin rotularlo:
  primero qué tiene la persona entre manos, dicho en sus propios términos;
  luego qué significa jurídicamente y por qué esa figura y no otra;
  luego qué opciones existen y cuál conviene atender primero;
  luego el límite o el riesgo, dicho sin dramatizarlo;
  y cierra con lo que falta saber para tener certeza.
  Cita los artículos entre corchetes conforme los uses, no al final en bloque.
- "elementos_protegibles": de 2 a 5 elementos CONCRETOS tomados de la descripción del usuario, no genéricos.
- "siguientes_pasos": exactamente 3 acciones prácticas y accionables.
- "figuras_complementarias": de 1 a 3 figuras adicionales que podrían explorarse.
- "advertencias": de 1 a 3 riesgos, supuestos o datos faltantes relevantes para ESTE caso.
- "que_no_protege": de 2 a 3 límites reales de la figura principal. Es el campo que evita falsas expectativas.
- "plazos_clave": de 2 a 3 plazos o vigencias que importan en este caso.
- "clases_niza": solo si hay un componente marcario. De 1 a 3 clases probables con el formato "Clase 30 — café preparado". Si no aplica, arreglo vacío.
- "confianza": "alto" si la descripción es clara y encaja en una sola figura; "medio" si es razonable pero incompleta; "bajo" si es vaga, ambigua o mezcla muchos temas.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni bloques de código.`;

const ESQUEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "categoria",
    "proteccion_principal",
    "autoridad",
    "explicacion",
    "elementos_protegibles",
    "siguientes_pasos",
    "figuras_complementarias",
    "advertencias",
    "que_no_protege",
    "plazos_clave",
    "clases_niza",
    "confianza",
  ],
  properties: {
    categoria: {
      type: "string",
      enum: [
        "marca o signo distintivo",
        "aviso comercial",
        "nombre comercial",
        "patente o modelo de utilidad",
        "diseno industrial",
        "secreto industrial",
        "derecho de autor o reserva de derechos",
        "denominacion de origen o indicacion geografica",
        "combinacion de varias",
      ],
    },
    proteccion_principal: { type: "string" },
    autoridad: { type: "string" },
    explicacion: { type: "string" },
    elementos_protegibles: { type: "array", items: { type: "string" } },
    siguientes_pasos: { type: "array", items: { type: "string" } },
    figuras_complementarias: { type: "array", items: { type: "string" } },
    advertencias: { type: "array", items: { type: "string" } },
    que_no_protege: { type: "array", items: { type: "string" } },
    plazos_clave: { type: "array", items: { type: "string" } },
    clases_niza: { type: "array", items: { type: "string" } },
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
    const respuesta: RespuestaAnalisis = {
      resultado: analisisDemo(idea),
      demo: true,
      motivo: "sin_llave",
    };
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

    const articulos = contextoParaAnalisis(idea);
    const contexto = comoContexto(articulos);
    const sugerenciasNiza = clasesNizaPara(idea, 6)
      .map((n) => `- Clase ${n.clase} — ${n.termino}`)
      .join("\n");

    const modelo = process.env.OPENROUTER_MODEL || MODELO_POR_DEFECTO;

    const pedir = (formato: unknown) =>
      fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: encabezados,
        signal: control.signal,
        body: JSON.stringify({
          model: modelo,
          temperature: 0.5,
          max_tokens: MAX_TOKENS,
          response_format: formato,
          messages: [
            { role: "system", content: INSTRUCCIONES },
            {
              role: "user",
              content:
                `Descripción del usuario:\n"""${idea}"""\n\n` +
                (sugerenciasNiza
                  ? `TÉRMINOS DEL NOMENCLÁTOR DE NIZA que podrían aplicar (son una ayuda, verifícalos):\n${sugerenciasNiza}\n\n`
                  : "") +
                `ARTÍCULOS VIGENTES PARA FUNDAMENTAR TU RESPUESTA:\n\n${contexto}`,
            },
          ],
        }),
      });

    /** Devuelve el texto de la respuesta, o null si la llamada falló. */
    const contenidoDe = async (llamada: Response): Promise<string | null> => {
      if (!llamada.ok) {
        console.error("OpenRouter respondió", llamada.status, (await llamada.text()).slice(0, 400));
        return null;
      }
      const datos = (await llamada.json()) as {
        choices?: { message?: { content?: string }; finish_reason?: string }[];
      };
      const eleccion = datos.choices?.[0];
      if (eleccion?.finish_reason === "length") {
        console.error("Respuesta truncada por límite de tokens");
      }
      return eleccion?.message?.content ?? null;
    };

    const FORMATO_ESQUEMA = {
      type: "json_schema",
      json_schema: { name: "analisis_pi", strict: true, schema: ESQUEMA },
    };
    const FORMATO_OBJETO = { type: "json_object" };

    // Primer intento con esquema estricto. Si la llamada falla, o si el texto
    // devuelto no es JSON utilizable (por ejemplo, truncado), se reintenta
    // pidiendo solo un objeto JSON.
    let bruto: unknown = null;
    let contenido = await contenidoDe(await pedir(FORMATO_ESQUEMA));

    if (contenido) {
      try {
        bruto = extraerJSON(contenido);
      } catch {
        console.error("JSON ilegible en el primer intento:", contenido.slice(0, 300));
      }
    }

    if (bruto === null) {
      contenido = await contenidoDe(await pedir(FORMATO_OBJETO));
      if (!contenido) {
        // Degradación controlada: mejor una orientación local etiquetada como
        // simulada que un error en pantalla a media demostración.
        const respaldo: RespuestaAnalisis = {
          resultado: analisisDemo(idea),
          demo: true,
          motivo: "servicio",
        };
        return NextResponse.json(respaldo);
      }
      bruto = extraerJSON(contenido);
    }

    const resultado = validarAnalisis(bruto);
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
