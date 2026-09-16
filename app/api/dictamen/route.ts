// Dictamen en texto plano, transmitido conforme se escribe.
//
// Va aparte de /api/analyze a propósito: ese endpoint devuelve JSON
// estructurado y no se puede transmitir a medio escribir. Aquí no hay
// esquema, solo prosa, así que cada fragmento se puede pintar en cuanto llega.

import { analisisDemo, preclasificar, type Categoria } from "../../lib";
import { comoContexto, contextoParaAnalisis } from "../../corpus";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODELO_POR_DEFECTO = "openai/gpt-4o-mini";
const MAX_TOKENS = 1200;
const LIMITE_CARACTERES = 2000;

const INSTRUCCIONES = `Eres un abogado mexicano de propiedad intelectual. Ya clasificaste el caso. Ahora escribes el dictamen preliminar que la persona va a leer.

Escribes SOLO el dictamen. Nada de JSON, nada de listas, nada de viñetas, nada de títulos. De 220 a 350 palabras.

FORMATO: separa el texto en CUATRO O CINCO párrafos, con una línea en blanco entre uno y otro. Cada párrafo desarrolla un punto del orden de abajo y no pasa de cinco o seis líneas. Un muro de texto de trescientas palabras no se lee.

ORDEN, un punto por párrafo, sin rotularlo:
primero qué tiene la persona entre manos, dicho en sus propios términos;
luego qué significa jurídicamente y por qué esa figura y no otra;
luego qué opciones existen y cuál conviene atender primero;
luego el límite o el riesgo, dicho sin dramatizarlo;
y cierra con lo que falta saber para tener certeza.

CÓMO ESCRIBES:
- Español de México. La persona no tiene formación jurídica: explica el término técnico la primera vez, en la misma frase.
- Primera persona del plural para el criterio: "consideramos", "identificamos", "en nuestra opinión".
- Verbo directo, no nominalización: "presentar", no "llevar a cabo la presentación de".
- Prohibido abrir párrafos con "cabe señalar", "es importante destacar", "en ese orden de ideas", "en ese sentido".
- Prohibidos los adjetivos que no informan: "importante", "significativo", "robusto", "integral".
- Prohibidas las simetrías "no X, sino Y" y "no sólo..., sino también", y los tercetos.
- Varía la longitud de las oraciones porque el razonamiento lo pide.
- La incertidumbre se enuncia y se sigue, sin disculpas. Máximo dos salvedades en todo el texto.
- No prometas registrabilidad ni resultados.

FUNDAMENTO:
- Fundamenta en las disposiciones que acompañan al caso y cítalas entre corchetes conforme las uses: [LFPPI Artículo 173].
LO QUE NUNCA APARECE EN TU RESPUESTA:
- Nunca hables de tus fuentes como si fueran un inventario que te entregaron:
  nada de "los artículos proporcionados", "con la información disponible",
  "según el material que tengo", "en el corpus", "con los artículos que
  tenemos". Un abogado no escribe "con los documentos que me dieron"; da su
  opinión y cita la norma. La cita entre corchetes ya dice de dónde sale.
- Nunca describas tu propio proceso, tus límites como sistema, ni el hecho de
  ser una herramienta automática.
- Cuando la norma aplicable no alcance para responder, no lo confieses como
  carencia tuya. Dilo como lo diría un abogado: de qué depende la respuesta y
  qué habría que revisar para darla. Compara:
    NO: "Con los artículos disponibles no puedo determinar si es registrable."
    SÍ: "Si es registrable depende de que el diseño no se haya divulgado antes
        de la solicitud; habría que revisar cuándo se publicó por primera vez."

- No cites artículos que no estén transcritos.
- No inventes plazos ni cifras que no estén en los artículos.`;

export async function POST(request: Request) {
  let idea = "";
  let figura = "";
  let ruta = "";

  try {
    const cuerpo = (await request.json()) as {
      idea?: unknown;
      categoria?: unknown;
      proteccion_principal?: unknown;
    };
    idea = typeof cuerpo.idea === "string" ? cuerpo.idea.trim().slice(0, LIMITE_CARACTERES) : "";
    figura = typeof cuerpo.categoria === "string" ? cuerpo.categoria : "";
    ruta = typeof cuerpo.proteccion_principal === "string" ? cuerpo.proteccion_principal : "";
  } catch {
    return new Response("Solicitud inválida.", { status: 400 });
  }

  if (idea.length < 15) {
    return new Response("Descripción demasiado corta.", { status: 400 });
  }

  const cabeceras = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Accel-Buffering": "no",
  };

  const apiKey = process.env.OPENROUTER_API_KEY;

  // Sin llave: se entrega el dictamen de la plantilla, también por fragmentos,
  // para que la interfaz se comporte igual en la demostración.
  if (!apiKey) {
    const texto = analisisDemo(idea).explicacion;
    const stream = new ReadableStream({
      async start(controlador) {
        const cod = new TextEncoder();
        for (const palabra of texto.split(" ")) {
          controlador.enqueue(cod.encode(palabra + " "));
          await new Promise((r) => setTimeout(r, 18));
        }
        controlador.close();
      },
    });
    return new Response(stream, { headers: cabeceras });
  }

  const categoria = (figura || preclasificar(idea)) as Categoria;
  const contexto = comoContexto(contextoParaAnalisis(idea));

  const encabezados: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (process.env.OPENROUTER_SITE_URL) encabezados["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  if (process.env.OPENROUTER_SITE_NAME) encabezados["X-Title"] = process.env.OPENROUTER_SITE_NAME;

  let llamada: Response;
  try {
    llamada = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: encabezados,
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || MODELO_POR_DEFECTO,
        temperature: 0.5,
        max_tokens: MAX_TOKENS,
        reasoning: { effort: "low" },
        stream: true,
        messages: [
          { role: "system", content: INSTRUCCIONES },
          {
            role: "user",
            content:
              `Descripción del usuario:\n"""${idea}"""\n\n` +
              `FIGURA YA DECIDIDA: ${categoria}\n` +
              (ruta ? `RUTA YA SUGERIDA: ${ruta}\n` : "") +
              `\nDISPOSICIONES VIGENTES APLICABLES AL CASO:\n\n${contexto}`,
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Fallo al abrir el flujo del dictamen", error);
    return new Response("", { status: 502 });
  }

  if (!llamada.ok || !llamada.body) {
    console.error("OpenRouter /dictamen respondió", llamada.status);
    return new Response("", { status: 502 });
  }

  // Se traduce el flujo de eventos de OpenRouter a texto plano.
  const stream = new ReadableStream({
    async start(controlador) {
      const lector = llamada.body!.getReader();
      const dec = new TextDecoder();
      const cod = new TextEncoder();
      let resto = "";
      try {
        for (;;) {
          const { done, value } = await lector.read();
          if (done) break;
          resto += dec.decode(value, { stream: true });
          const lineas = resto.split("\n");
          resto = lineas.pop() ?? "";
          for (const linea of lineas) {
            const l = linea.trim();
            if (!l.startsWith("data:")) continue;
            const carga = l.slice(5).trim();
            if (carga === "[DONE]") continue;
            try {
              const j = JSON.parse(carga) as {
                choices?: { delta?: { content?: string } }[];
              };
              const trozo = j.choices?.[0]?.delta?.content;
              if (trozo) controlador.enqueue(cod.encode(trozo));
            } catch {
              // fragmento incompleto: se ignora y sigue
            }
          }
        }
      } catch (error) {
        console.error("Flujo del dictamen interrumpido", error);
      } finally {
        controlador.close();
      }
    },
  });

  return new Response(stream, { headers: cabeceras });
}
