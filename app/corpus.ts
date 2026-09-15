// Recuperación léxica sobre el corpus legal. Sin base de datos ni servicios
// externos: los ordenamientos viven en /corpus como JSON y se consultan aquí.
//
// El mapeo figura -> artículos es curaduría humana, no búsqueda semántica:
// es auditable y se puede revisar artículo por artículo.

import lfppi from "../corpus/lfppi.json";
import reglamentoLfppi from "../corpus/reglamento-lfppi.json";
import lfda from "../corpus/lfda.json";
import reglamentoLfda from "../corpus/reglamento-lfda.json";
import leyAduanera from "../corpus/ley-aduanera.json";
import rgce from "../corpus/rgce.json";
import variedades from "../corpus/variedades-vegetales.json";
import reglamentoVariedades from "../corpus/reglamento-variedades.json";
import nizaIndice from "../corpus/niza-indice.json";
import { preclasificar, type Categoria } from "./lib";

export type Articulo = {
  id: string;
  ordenamiento: string;
  sigla: string;
  articulo: string;
  numero: number;
  ultima_reforma_dof: string | null;
  fuente: string;
  texto: string;
};

const CORPUS: Record<string, Articulo[]> = {
  LFPPI: lfppi as unknown as Articulo[],
  RLFPPI: reglamentoLfppi as unknown as Articulo[],
  LFDA: lfda as unknown as Articulo[],
  RLFDA: reglamentoLfda as unknown as Articulo[],
  LA: leyAduanera as unknown as Articulo[],
  RGCE: rgce as unknown as Articulo[],
  LFVV: variedades as unknown as Articulo[],
  RLFVV: reglamentoVariedades as unknown as Articulo[],
};

const TODOS: Articulo[] = [
  ...lfppi,
  ...reglamentoLfppi,
  ...lfda,
  ...reglamentoLfda,
  ...leyAduanera,
  ...rgce,
  ...variedades,
  ...reglamentoVariedades,
] as unknown as Articulo[];

type Rango = { sigla: keyof typeof CORPUS; desde: number; hasta: number };

/** Artículos que SIEMPRE se incluyen para la figura, sin importar la consulta. */
const NUCLEARES: Partial<Record<Categoria, Rango[]>> = {
  "marca o signo distintivo": [
    { sigla: "LFPPI", desde: 170, hasta: 173 },
  ],
  "aviso comercial": [
    { sigla: "LFPPI", desde: 200, hasta: 201 },
    { sigla: "LFPPI", desde: 173, hasta: 173 },
  ],
  "nombre comercial": [
    { sigla: "LFPPI", desde: 206, hasta: 206 },
    { sigla: "LFPPI", desde: 173, hasta: 173 },
  ],
  "patente o modelo de utilidad": [
    { sigla: "LFPPI", desde: 45, hasta: 47 },
    { sigla: "LFPPI", desde: 58, hasta: 58 },
  ],
  "diseno industrial": [{ sigla: "LFPPI", desde: 65, hasta: 67 }],
  "secreto industrial": [{ sigla: "LFPPI", desde: 163, hasta: 165 }],
  "derecho de autor o reserva de derechos": [
    { sigla: "LFDA", desde: 11, hasta: 13 },
    { sigla: "LFDA", desde: 29, hasta: 29 },
  ],
  "denominacion de origen o indicacion geografica": [
    { sigla: "LFPPI", desde: 264, hasta: 266 },
  ],
  "variedad vegetal": [
    { sigla: "LFVV", desde: 2, hasta: 5 },
  ],
  "observancia en frontera": [
    // el extracto de la fracción XXVIII, no el artículo 144 entero
    { sigla: "LA", desde: 1440, hasta: 1440 },
    { sigla: "LA", desde: 148, hasta: 149 },
    { sigla: "RGCE", desde: 2410, hasta: 2410 },
  ],
};

/** Universo de artículos por figura, del que se escogen los más pertinentes. */
const AMBITO: Record<Categoria, Rango[]> = {
  "marca o signo distintivo": [
    { sigla: "LFPPI", desde: 12, hasta: 12 },
    { sigla: "LFPPI", desde: 170, hasta: 199 },
    { sigla: "LFPPI", desde: 214, hasta: 238 },
    { sigla: "RLFPPI", desde: 55, hasta: 102 },
  ],
  "aviso comercial": [
    { sigla: "LFPPI", desde: 200, hasta: 205 },
    { sigla: "LFPPI", desde: 214, hasta: 238 },
  ],
  "nombre comercial": [{ sigla: "LFPPI", desde: 206, hasta: 213 }],
  "patente o modelo de utilidad": [
    { sigla: "LFPPI", desde: 12, hasta: 12 },
    { sigla: "LFPPI", desde: 36, hasta: 64 },
    { sigla: "LFPPI", desde: 91, hasta: 120 },
  ],
  "diseno industrial": [
    { sigla: "LFPPI", desde: 12, hasta: 12 },
    { sigla: "LFPPI", desde: 65, hasta: 82 },
  ],
  "secreto industrial": [{ sigla: "LFPPI", desde: 163, hasta: 169 }],
  "derecho de autor o reserva de derechos": [
    { sigla: "LFDA", desde: 11, hasta: 29 },
    { sigla: "LFDA", desde: 85, hasta: 114 },
    { sigla: "LFDA", desde: 162, hasta: 191 },
    { sigla: "RLFDA", desde: 53, hasta: 90 },
  ],
  "denominacion de origen o indicacion geografica": [
    { sigla: "LFPPI", desde: 264, hasta: 326 },
  ],
  "variedad vegetal": [
    { sigla: "LFVV", desde: 1, hasta: 48 },
    { sigla: "RLFVV", desde: 1, hasta: 89 },
  ],
  "observancia en frontera": [
    { sigla: "RGCE", desde: 249, hasta: 2410 },
    { sigla: "LA", desde: 144, hasta: 156 },
    { sigla: "LFPPI", desde: 386, hasta: 410 },
    { sigla: "LFPPI", desde: 170, hasta: 173 },
  ],
  "combinacion de varias": [
    { sigla: "LFPPI", desde: 12, hasta: 12 },
    { sigla: "LFPPI", desde: 36, hasta: 82 },
    { sigla: "LFPPI", desde: 163, hasta: 213 },
    { sigla: "LFDA", desde: 11, hasta: 29 },
    { sigla: "LFDA", desde: 162, hasta: 191 },
  ],
};

// ---------------------------------------------------------------------------
// Puntuación léxica
// ---------------------------------------------------------------------------

const VACIAS = new Set([
  "para", "por", "con", "sin", "que", "los", "las", "del", "una", "uno", "unos",
  "unas", "como", "mas", "muy", "este", "esta", "esto", "esos", "esas", "pero",
  "sus", "sobre", "entre", "cuando", "donde", "porque", "tiene", "tengo",
  "quiero", "hice", "cree", "mi", "me", "le", "lo", "la", "el", "en", "de", "y",
  "a", "o", "un", "es", "se", "al", "su", "no", "si", "ya", "hay", "ser", "son",
  "ademas", "tambien", "todo", "toda", "algo", "parte", "forma", "persona",
  "otros", "demas", "excepto", "otra", "otro", "nada", "dice", "pasa", "somos",
  "cosa", "caso", "hace", "hacer", "puede", "debe", "sera", "esta", "estan",
]);

function normalizar(t: string): string {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function tokenizar(t: string): string[] {
  return normalizar(t)
    .split(/[^a-z0-9ñ]+/)
    .filter((x) => x.length > 3 && !VACIAS.has(x));
}

/**
 * Índice de palabras completas por artículo y su frecuencia documental.
 * Se calcula una vez al cargar. Sin esto, "nombre" pesaba igual que
 * "obtentor", y la comparación por subcadena hacía que "nada" enganchara
 * dentro de "denominada".
 */
const PALABRAS_DOC: Set<string>[] = TODOS.map(
  (a) => new Set(normalizar(a.texto).split(/[^a-z0-9ñ]+/)),
);

const FRECUENCIA: Map<string, number> = (() => {
  const m = new Map<string, number>();
  for (const set of PALABRAS_DOC) {
    for (const w of set) m.set(w, (m.get(w) ?? 0) + 1);
  }
  return m;
})();

const TOTAL_DOCS = TODOS.length;

const POSICION: Map<string, number> = new Map(TODOS.map((a, i) => [a.id, i]));

/** Peso de un término: alto si es raro, casi nulo si está en todas partes. */
function peso(t: string): number {
  return Math.log((TOTAL_DOCS + 1) / ((FRECUENCIA.get(t) ?? 0) + 1));
}

const PESO_MINIMO = 1.2;
const ACIERTOS_MINIMOS = 2;

function puntuar(articulo: Articulo, tokens: string[]): number {
  return puntuarPorIndice(POSICION.get(articulo.id) ?? -1, tokens);
}

function puntuarPorIndice(i: number, tokens: string[]): number {
  if (i < 0) return 0;
  const pal = PALABRAS_DOC[i];
  let punto = 0;
  let aciertos = 0;
  for (const t of tokens) {
    if (!pal.has(t)) continue;
    const w = peso(t);
    if (w < PESO_MINIMO) continue; // aparece en demasiados artículos
    punto += w;
    aciertos++;
  }
  // Una sola coincidencia no sostiene una cita.
  if (aciertos < ACIERTOS_MINIMOS) return 0;
  return punto / Math.log(120 + TODOS[i].texto.length);
}


function enRango(rangos: Rango[]): Articulo[] {
  const salida: Articulo[] = [];
  for (const r of rangos) {
    for (const a of CORPUS[r.sigla]) {
      if (a.numero >= r.desde && a.numero <= r.hasta) salida.push(a);
    }
  }
  return salida;
}

/**
 * Ordenamientos en los que tiene sentido buscar para cada figura. Sin esto,
 * un caso de marca traía artículos de la Ley Aduanera y del reglamento de
 * variedades vegetales: vocabulario administrativo genérico que engancha con
 * todo y que se multiplicó al crecer el corpus a ocho ordenamientos.
 */
const ORDENAMIENTOS: Partial<Record<Categoria, string[]>> = {
  "variedad vegetal": ["LFVV", "RLFVV"],
  "observancia en frontera": ["LA", "RGCE", "LFPPI"],
  "derecho de autor o reserva de derechos": ["LFDA", "RLFDA"],
  "marca o signo distintivo": ["LFPPI", "RLFPPI"],
  "aviso comercial": ["LFPPI", "RLFPPI"],
  "nombre comercial": ["LFPPI", "RLFPPI"],
  "patente o modelo de utilidad": ["LFPPI", "RLFPPI"],
  "diseno industrial": ["LFPPI", "RLFPPI"],
  "secreto industrial": ["LFPPI", "RLFPPI"],
  "denominacion de origen o indicacion geografica": ["LFPPI", "RLFPPI"],
};

const PRESUPUESTO = 14000;

/**
 * Artículos pertinentes para la figura clasificada: primero los nucleares,
 * luego los del ámbito ordenados por coincidencia con la descripción.
 */
export function articulosPara(categoria: Categoria, descripcion: string): Articulo[] {
  const tokens = tokenizar(descripcion);
  const elegidos: Articulo[] = [];
  const vistos = new Set<string>();
  let presupuesto = PRESUPUESTO;

  for (const a of enRango(NUCLEARES[categoria] ?? [])) {
    if (vistos.has(a.id)) continue;
    vistos.add(a.id);
    elegidos.push(a);
    presupuesto -= a.texto.length;
  }

  const candidatos = enRango(AMBITO[categoria])
    .filter((a) => !vistos.has(a.id))
    .map((a) => ({ a, punto: puntuar(a, tokens) }))
    .filter((x) => x.punto > 0)
    .sort((x, y) => y.punto - x.punto);

  for (const { a } of candidatos) {
    if (presupuesto - a.texto.length < 0) continue;
    elegidos.push(a);
    vistos.add(a.id);
    presupuesto -= a.texto.length;
    if (elegidos.length >= 8) break;
  }

  return elegidos;
}

/**
 * Recuperación para la consulta libre. La búsqueda léxica sola falla cuando
 * la persona usa su vocabulario y no el de la ley: dice "receta" donde la ley
 * dice "secreto industrial". Por eso se parte de la curaduría de la figura
 * preclasificada y se completa con lo léxico.
 */
export function contextoParaConsulta(pregunta: string): Articulo[] {
  const figura = preclasificar(pregunta);
  const curados = articulosPara(figura, pregunta);
  const vistos = new Set(curados.map((a) => a.id));
  let presupuesto = PRESUPUESTO - curados.reduce((n, a) => n + a.texto.length, 0);

  const salida = [...curados];
  for (const a of buscarArticulos(pregunta, 3, ORDENAMIENTOS[figura])) {
    if (vistos.has(a.id) || presupuesto - a.texto.length < 0) continue;
    salida.push(a);
    vistos.add(a.id);
    presupuesto -= a.texto.length;
  }
  return salida;
}

/** Búsqueda abierta en los cuatro ordenamientos, para la consulta libre. */
export function buscarArticulos(
  pregunta: string,
  limite = 10,
  siglas?: string[],
): Articulo[] {
  const tokens = tokenizar(pregunta);
  if (tokens.length === 0) return [];
  const permitidas = siglas ? new Set(siglas) : null;
  let presupuesto = PRESUPUESTO;
  const salida: Articulo[] = [];
  const ordenados = TODOS.map((a, i) => ({
    a,
    punto: permitidas && !permitidas.has(a.sigla) ? 0 : puntuarPorIndice(i, tokens),
  }))
    .filter((x) => x.punto > 0)
    .sort((x, y) => y.punto - x.punto);
  for (const { a } of ordenados) {
    if (presupuesto - a.texto.length < 0) continue;
    salida.push(a);
    presupuesto -= a.texto.length;
    if (salida.length >= limite) break;
  }
  return salida;
}

/** Formatea los artículos para inyectarlos en el prompt. */
export function comoContexto(articulos: Articulo[]): string {
  return articulos
    .map(
      (a) =>
        `[${a.sigla} ${a.articulo}] (última reforma DOF ${a.ultima_reforma_dof ?? "s/d"})\n${a.texto}`,
    )
    .join("\n\n");
}

// ---------------------------------------------------------------------------
// Clasificación de Niza
// ---------------------------------------------------------------------------

type EntradaNiza = { clase: number; termino: string; lista: string };
const NIZA = nizaIndice as unknown as Record<string, EntradaNiza>;
const CLAVES_NIZA = Object.keys(NIZA);

/** Palabras significativas de un término del nomenclátor, sin calificadores. */
function palabrasClave(clave: string): string[] {
  return clave
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\*/g, " ")
    .split(/[^a-z0-9ñ]+/)
    .filter((x) => x.length > 3 && !VACIAS.has(x));
}

/** 1 si son la misma palabra, 0.6 si una deriva de la otra, 0 si no. */
function coincide(t: string, p: string): number {
  if (t === p) return 1;
  if (t.length >= 5 && p.length >= 5 && (p.startsWith(t) || t.startsWith(p))) return 0.6;
  return 0;
}

/**
 * Sugiere clases de Niza a partir de lenguaje cotidiano. Es una AYUDA, no una
 * autoridad: el término del nomenclátor manda, y la clase definitiva la
 * confirma quien presenta la solicitud.
 */
export function clasesNizaPara(descripcion: string, limite = 6): EntradaNiza[] {
  const tokens = tokenizar(descripcion);
  if (tokens.length === 0) return [];

  const puntos: { clave: string; punto: number }[] = [];
  for (const clave of CLAVES_NIZA) {
    const pal = palabrasClave(clave);
    if (pal.length === 0) continue;
    const mejores = pal.map((p) => Math.max(0, ...tokens.map((t) => coincide(t, p))));
    const aciertos = mejores.filter((m) => m > 0).length;
    if (aciertos === 0) continue;
    const cobertura = mejores.reduce((a, b) => a + b, 0) / pal.length;
    // si la primera palabra del término no coincide, el término no es el tema
    const punto = cobertura * (mejores[0] > 0 ? 1 : 0.25) + (pal.length === 1 ? 0.15 : 0);
    if (punto >= 0.35) puntos.push({ clave, punto });
  }

  puntos.sort((a, b) => b.punto - a.punto);
  const salida: EntradaNiza[] = [];
  const clasesVistas = new Set<number>();
  for (const { clave } of puntos) {
    const e = NIZA[clave];
    if (clasesVistas.has(e.clase)) continue;
    clasesVistas.add(e.clase);
    salida.push(e);
    if (salida.length >= limite) break;
  }
  return salida;
}

/**
 * Artículos a inyectar en el análisis. Une dos vías para no depender de una
 * sola: los de la figura preclasificada por palabras clave, y los que arroja
 * la búsqueda abierta sobre los cuatro ordenamientos.
 */
export function contextoParaAnalisis(descripcion: string): Articulo[] {
  const figura = preclasificar(descripcion);
  const porFigura = articulosPara(figura, descripcion);
  const vistos = new Set(porFigura.map((a) => a.id));
  let presupuesto = PRESUPUESTO - porFigura.reduce((n, a) => n + a.texto.length, 0);

  const salida = [...porFigura];
  for (const a of buscarArticulos(descripcion, 2, ORDENAMIENTOS[figura])) {
    if (vistos.has(a.id) || presupuesto - a.texto.length < 0) continue;
    salida.push(a);
    vistos.add(a.id);
    presupuesto -= a.texto.length;
  }
  return salida;
}
