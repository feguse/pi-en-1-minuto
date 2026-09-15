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
};

const TODOS: Articulo[] = [
  ...lfppi,
  ...reglamentoLfppi,
  ...lfda,
  ...reglamentoLfda,
  ...leyAduanera,
  ...rgce,
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
  "otros", "demas", "excepto",
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

function puntuar(articulo: Articulo, tokens: string[]): number {
  const texto = normalizar(articulo.texto);
  let punto = 0;
  for (const t of tokens) {
    const veces = texto.split(t).length - 1;
    if (veces > 0) punto += 1 + Math.min(veces, 4) * 0.25;
  }
  // penaliza artículos larguísimos para que no ganen por volumen
  return punto / Math.log(200 + articulo.texto.length);
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

/** Búsqueda abierta en los cuatro ordenamientos, para la consulta libre. */
export function buscarArticulos(pregunta: string, limite = 10): Articulo[] {
  const tokens = tokenizar(pregunta);
  if (tokens.length === 0) return [];
  let presupuesto = PRESUPUESTO;
  const salida: Articulo[] = [];
  const ordenados = TODOS.map((a) => ({ a, punto: puntuar(a, tokens) }))
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
  for (const a of buscarArticulos(descripcion, 3)) {
    if (vistos.has(a.id) || presupuesto - a.texto.length < 0) continue;
    salida.push(a);
    vistos.add(a.id);
    presupuesto -= a.texto.length;
  }
  return salida;
}
