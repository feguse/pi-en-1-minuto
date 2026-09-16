// Último filtro antes de que el texto llegue a la persona.
//
// Dos rondas de reglas en el prompt bajaron la frecuencia pero no la
// eliminaron: el modelo sigue narrando de vez en cuando lo que no tiene ("no
// encuentro entre las disposiciones citadas el monto de las tarifas"). Es el
// mismo patrón que con la clasificación de frontera: lo que el prompt no
// cierra en dos intentos, se cierra en código.
//
// La operación es conservadora a propósito: se quitan oraciones completas,
// solo las que hablan de las fuentes como de un inventario, y si el recorte
// deja el texto mutilado se devuelve el original. Más vale una respuesta con
// una frase pobre que una respuesta rota.

const CONFESIONES: RegExp[] = [
  // "no encuentro entre las disposiciones citadas...", "no contamos con la
  // información sobre...", "no dispongo del texto de..."
  /\b(?:no|sin)\s+(?:se\s+)?(?:encuentr\w+|localiz\w+|cuent\w+|dispong\w+|contamos|tengo|tenemos|hallo)\b[^.;:]*\b(?:disposicion\w*|art[íi]culo\w*|normativ\w*|informaci[óo]n|material|texto\w*)\b/i,
  // "las disposiciones que tenemos no contienen...", "los artículos
  // proporcionados no contemplan..."
  /\b(?:disposicion\w*|art[íi]culo\w*|normativ\w*|material)\b[^.;:]*\b(?:que\s+(?:tenemos|tengo|consultamos|fundamentan)|proporcionad\w+|disponible\w*|citad\w+)\b[^.;:]*\bno\s+(?:contien\w+|contempl\w+|prev[ée]\w*|se[ñn]al\w+|abord\w+)\b/i,
  // "antes de explicarte el límite de lo que podemos decirte"
  /\bel\s+l[íi]mite\s+de\s+lo\s+que\s+(?:podemos|puedo)\b/i,
  /\bno\s+(?:puedo|podemos)\s+determinar\b[^.;:]*\b(?:con|a\s+partir\s+de)\s+(?:las?|los)\b/i,
  // El mismo giro al revés: "con los artículos disponibles no puedo..."
  /\b(?:con|a\s+partir\s+de)\s+(?:las?|los)\s+(?:disposicion\w*|art[íi]culo\w*|normativ\w*|informaci[óo]n)\b[^.;:]*\bno\s+(?:puedo|podemos|se\s+puede|es\s+posible)\b/i,
  // El giro desnudo, sin negación detrás: "las disposiciones que tenemos",
  // "los artículos que se me proporcionaron". Nunca es buena prosa. Ojo: no
  // debe tocar "las disposiciones que lo rigen", que sí lo es.
  /\b(?:las?|los)\s+(?:disposicion\w*|art[íi]culo\w*|norma\w*)\s+que\s+(?:tenemos|tengo|manejamos|consultamos|nos\s+(?:dieron|proporcionaron)|se\s+me\s+(?:dieron|proporcionaron))\b/i,
  // Disculpas: la incertidumbre se enuncia y se sigue.
  /\b(?:lamentablemente|desafortunadamente|por\s+desgracia)\b/i,
  // Nombrar la máquina.
  /\b(?:en\s+el\s+corpus|en\s+nuestra\s+base\s+de\s+datos|en\s+el\s+material\s+proporcionado)\b/i,
];

const MARCA = "@@PUNTO@@";

/** Corta un párrafo en oraciones sin romper las abreviaturas del foro. */
function oraciones(parrafo: string): string[] {
  const protegido = parrafo.replace(
    /\b(art|arts|fracc|p[áa]rr|n[úu]m|inc|cfr|pp|vol|etc|Lic|Dr|Mtro|Sr|Sra)\./gi,
    `$1${MARCA}`,
  );
  return protegido
    .split(/(?<=[.?!])\s+/)
    .map((o) => o.split(MARCA).join("."))
    .filter((o) => o.trim().length > 0);
}

const palabras = (t: string) => t.split(/\s+/).filter(Boolean).length;

/**
 * Quita las oraciones donde el texto habla de sus propias fuentes como de un
 * inventario. Devuelve el original si el recorte lo deja irreconocible.
 */
export function sinConfesiones(texto: string): string {
  if (!texto.trim()) return texto;

  const limpios = texto
    .split(/\n{2,}/)
    .map((p) => oraciones(p).filter((o) => !CONFESIONES.some((r) => r.test(o))).join(" "))
    .filter((p) => p.trim().length > 0);

  const resultado = limpios.join("\n\n").trim();
  const antes = palabras(texto);
  const despues = palabras(resultado);

  // Si se fue más de un tercio, o queda demasiado corto para ser una
  // respuesta, el recorte hizo más daño que la frase.
  if (despues < 60 || despues < antes * 0.65) return texto;
  return resultado;
}

/** ¿Quedó alguna? Solo para el log: sirve para saber cuánto se nos escapa. */
export function tieneConfesion(texto: string): boolean {
  return CONFESIONES.some((r) => r.test(texto));
}

/**
 * Variante para el dictamen, que va transmitido. No se puede esperar al texto
 * completo sin perder la razón de ser del flujo —la respuesta empieza a verse
 * a los dos segundos—, así que el filtro trabaja por oración: retiene la que
 * está a medias y suelta las completas que pasan. El retraso es de una oración,
 * unas quince palabras, que no se notan.
 */
export function filtroDeOraciones() {
  let pendiente = "";

  const soltar = (fragmentos: string[]) =>
    fragmentos.filter((o) => !CONFESIONES.some((r) => r.test(o))).join("");

  return {
    empujar(trozo: string): string {
      pendiente += trozo;
      const partes = pendiente.split(/(?<=[.?!])(?=\s)/);
      pendiente = partes.pop() ?? "";
      return partes.length ? soltar(partes) : "";
    },
    cerrar(): string {
      const resto = pendiente;
      pendiente = "";
      return resto ? soltar([resto]) : "";
    },
  };
}
