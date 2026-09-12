// Tipos, validacion y modo demo compartidos entre el cliente y /api/analyze.

export const CATEGORIAS = [
  "marca o signo distintivo",
  "patente o modelo de utilidad",
  "diseno industrial",
  "secreto industrial",
  "combinacion de varias",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  "marca o signo distintivo": "Marca o signo distintivo",
  "patente o modelo de utilidad": "Patente o modelo de utilidad",
  "diseno industrial": "Diseño industrial",
  "secreto industrial": "Secreto industrial",
  "combinacion de varias": "Combinación de varias figuras",
};

export const NIVELES = ["alto", "medio", "bajo"] as const;
export type Confianza = (typeof NIVELES)[number];

export type Analisis = {
  categoria: Categoria;
  proteccion_principal: string;
  explicacion: string;
  elementos_protegibles: string[];
  siguientes_pasos: string[];
  figuras_complementarias: string[];
  advertencias: string[];
  confianza: Confianza;
};

export type RespuestaAnalisis = {
  resultado: Analisis;
  demo: boolean;
};

export const EJEMPLOS: string[] = [
  "Creé una bebida de café lista para tomar, con un nombre y un logotipo propios, y quiero venderla en tiendas de conveniencia.",
  "Desarrollé un mecanismo que permite que una bicicleta plegable se cierre con un solo movimiento y ocupe la mitad del espacio.",
  "Diseñé la forma y la apariencia exterior de una botella de vidrio distinta a todo lo que veo en el mercado.",
  "Tengo una fórmula y un proceso de producción que mantengo en reserva dentro de mi empresa y solo conocen tres personas.",
];

export const AVISO_LEGAL =
  "Esta orientación es informativa, no constituye asesoría jurídica, no garantiza que la creación sea registrable y no reemplaza una búsqueda profesional.";

export const RECURSOS: { nombre: string; descripcion: string; url: string }[] = [
  {
    nombre: "MARCia",
    descripcion: "Búsqueda rápida de marcas del IMPI",
    url: "https://marcia.impi.gob.mx/marcas/search/quick",
  },
  {
    nombre: "ClasNiza",
    descripcion: "Clasificador de productos y servicios",
    url: "https://clasniza.impi.gob.mx/",
  },
  {
    nombre: "Servicios electrónicos del IMPI",
    descripcion: "Presentación de solicitudes en línea",
    url: "https://eservicios.impi.gob.mx/seimpi/",
  },
  {
    nombre: "Información general del IMPI",
    descripcion: "Servicios que ofrece el Instituto",
    url: "https://www.gob.mx/impi/acciones-y-programas/servicios-que-ofrece-el-impi",
  },
];

// ---------------------------------------------------------------------------
// Validacion de la respuesta del modelo
// ---------------------------------------------------------------------------

const LIMITE_PALABRAS = 80;

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function aTexto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function aLista(valor: unknown, maximo: number): string[] {
  const base = Array.isArray(valor) ? valor : typeof valor === "string" ? [valor] : [];
  return base
    .map((item) => aTexto(item))
    .filter((item) => item.length > 0)
    .slice(0, maximo);
}

function recortarPalabras(texto: string, maximo: number): string {
  const palabras = texto.split(/\s+/).filter(Boolean);
  if (palabras.length <= maximo) return texto;
  return palabras.slice(0, maximo).join(" ") + "…";
}

function detectarCategoria(valor: unknown): Categoria | null {
  const texto = normalizar(aTexto(valor));
  if (!texto) return null;
  const exacta = CATEGORIAS.find((c) => normalizar(c) === texto);
  if (exacta) return exacta;
  if (texto.includes("combinac") || texto.includes("varias") || texto.includes("mixta")) {
    return "combinacion de varias";
  }
  if (texto.includes("secreto")) return "secreto industrial";
  if (texto.includes("diseno") || texto.includes("dibujo industrial")) return "diseno industrial";
  if (texto.includes("patente") || texto.includes("modelo de utilidad")) {
    return "patente o modelo de utilidad";
  }
  if (texto.includes("marca") || texto.includes("signo") || texto.includes("aviso comercial")) {
    return "marca o signo distintivo";
  }
  return null;
}

function detectarConfianza(valor: unknown): Confianza {
  const texto = normalizar(aTexto(valor));
  if (texto.includes("alt")) return "alto";
  if (texto.includes("baj")) return "bajo";
  return "medio";
}

/**
 * Convierte una respuesta arbitraria del modelo en un Analisis valido.
 * Lanza un error si faltan los campos minimos indispensables.
 */
export function validarAnalisis(datos: unknown): Analisis {
  if (!datos || typeof datos !== "object") {
    throw new Error("La respuesta del modelo no es un objeto JSON.");
  }
  const bruto = datos as Record<string, unknown>;

  const categoria = detectarCategoria(bruto.categoria);
  const explicacion = aTexto(bruto.explicacion);
  const elementos = aLista(bruto.elementos_protegibles, 6);
  const pasos = aLista(bruto.siguientes_pasos, 3);

  if (!categoria || !explicacion || elementos.length === 0 || pasos.length === 0) {
    throw new Error("La respuesta del modelo está incompleta.");
  }

  const principal = aTexto(bruto.proteccion_principal) || ETIQUETAS_CATEGORIA[categoria];

  return {
    categoria,
    proteccion_principal: principal,
    explicacion: recortarPalabras(explicacion, LIMITE_PALABRAS),
    elementos_protegibles: elementos,
    siguientes_pasos: pasos,
    figuras_complementarias: aLista(bruto.figuras_complementarias, 4),
    advertencias: aLista(bruto.advertencias, 4),
    confianza: detectarConfianza(bruto.confianza),
  };
}

// ---------------------------------------------------------------------------
// Modo demo local (sin OpenRouter)
// ---------------------------------------------------------------------------

const PLANTILLAS: Record<Categoria, Analisis> = {
  "marca o signo distintivo": {
    categoria: "marca o signo distintivo",
    proteccion_principal: "Registro de marca ante el IMPI",
    explicacion:
      "Lo que distingue a tu producto frente al consumidor es el nombre y la imagen con que lo presentas. Esa función identificadora se protege como marca. El registro se pide por clase de productos o servicios y otorga un derecho exclusivo en México por diez años renovables, siempre que el signo sea distintivo y no se confunda con marcas anteriores.",
    elementos_protegibles: [
      "El nombre comercial del producto",
      "El logotipo y su diseño gráfico",
      "La combinación de colores y la etiqueta",
      "Un eslogan publicitario, como aviso comercial",
    ],
    siguientes_pasos: [
      "Haz una búsqueda de antecedentes en MARCia para ver si alguien ya usa un signo parecido.",
      "Identifica en ClasNiza la clase o clases que cubren tus productos y servicios.",
      "Reúne el logotipo en alta resolución y los datos del titular antes de presentar la solicitud.",
    ],
    figuras_complementarias: [
      "Aviso comercial para el eslogan",
      "Nombre comercial para el establecimiento",
      "Derecho de autor sobre el diseño del logotipo",
    ],
    advertencias: [
      "No sabemos si el signo ya está registrado por un tercero; la búsqueda es indispensable.",
      "Falta definir los productos y servicios exactos y el territorio de interés.",
      "Los términos meramente descriptivos del producto suelen enfrentar objeciones.",
    ],
    confianza: "medio",
  },
  "patente o modelo de utilidad": {
    categoria: "patente o modelo de utilidad",
    proteccion_principal: "Patente o, en su caso, modelo de utilidad",
    explicacion:
      "Describes una solución técnica: un mecanismo que funciona de una manera nueva. Eso se protege por patente cuando hay novedad, actividad inventiva y aplicación industrial; si la mejora es funcional pero de menor alcance inventivo, el modelo de utilidad puede encajar mejor. Ambas figuras exigen no divulgar la invención antes de presentar la solicitud.",
    elementos_protegibles: [
      "El mecanismo y su forma de funcionar",
      "La disposición de las piezas que produce el efecto técnico",
      "El proceso de fabricación o de uso",
    ],
    siguientes_pasos: [
      "Documenta la invención con planos, fotos y fechas antes de mostrarla a terceros.",
      "Encarga una búsqueda de estado de la técnica para valorar la novedad.",
      "Firma acuerdos de confidencialidad con proveedores y socios mientras preparas la solicitud.",
    ],
    figuras_complementarias: [
      "Diseño industrial si la apariencia también es distintiva",
      "Marca para el nombre con que se comercialice",
      "Secreto industrial sobre parámetros de fabricación",
    ],
    advertencias: [
      "Divulgar la invención antes de solicitarla puede destruir la novedad.",
      "No conocemos el estado de la técnica; la viabilidad depende de esa búsqueda.",
      "Falta saber si se busca protección fuera de México y en qué plazo.",
    ],
    confianza: "medio",
  },
  "diseno industrial": {
    categoria: "diseno industrial",
    proteccion_principal: "Registro de diseño industrial",
    explicacion:
      "Lo relevante aquí es la apariencia: forma, contorno, textura u ornamentación que da un aspecto propio al producto sin responder únicamente a una función técnica. Eso se protege como diseño industrial, en su modalidad de modelo o de dibujo. Se exige novedad, por lo que conviene solicitarlo antes de lanzarlo al mercado.",
    elementos_protegibles: [
      "La forma tridimensional del producto",
      "Los ornamentos y texturas de la superficie",
      "Las vistas que definen el aspecto visual",
    ],
    siguientes_pasos: [
      "Prepara vistas del diseño (frontal, posterior, laterales, superior, inferior y en perspectiva).",
      "Verifica que el diseño no se haya divulgado públicamente de forma que afecte su novedad.",
      "Revisa diseños similares ya registrados antes de presentar la solicitud.",
    ],
    figuras_complementarias: [
      "Marca tridimensional si la forma llega a identificar el origen",
      "Marca denominativa para el nombre del producto",
      "Derecho de autor sobre elementos artísticos",
    ],
    advertencias: [
      "Si la forma responde solo a una función técnica, la vía correcta puede ser otra.",
      "Falta saber desde cuándo y dónde se ha mostrado públicamente el diseño.",
      "No se ha verificado la existencia de diseños anteriores parecidos.",
    ],
    confianza: "medio",
  },
  "secreto industrial": {
    categoria: "secreto industrial",
    proteccion_principal: "Protección como secreto industrial",
    explicacion:
      "La información que da ventaja competitiva y se mantiene reservada se protege como secreto industrial, sin registro ante el IMPI. La protección depende de que adoptes medidas razonables de confidencialidad y de que la información no sea de dominio público. Dura mientras el secreto se conserve, pero se pierde con la divulgación.",
    elementos_protegibles: [
      "La fórmula y sus proporciones",
      "El proceso y los parámetros de producción",
      "Listas de proveedores y datos comerciales reservados",
    ],
    siguientes_pasos: [
      "Documenta la información reservada y restringe el acceso por perfiles.",
      "Firma convenios de confidencialidad con empleados, proveedores y socios.",
      "Implementa medidas de control: accesos, etiquetado de documentos y bitácoras.",
    ],
    figuras_complementarias: [
      "Patente, si prefieres publicar a cambio de exclusividad temporal",
      "Marca para el producto final",
      "Cláusulas contractuales de no divulgación",
    ],
    advertencias: [
      "Sin medidas de confidencialidad documentadas, la protección se debilita.",
      "Un tercero que llegue al mismo resultado de forma independiente no infringe el secreto.",
      "Falta saber si la información ya se compartió sin convenio previo.",
    ],
    confianza: "medio",
  },
  "combinacion de varias": {
    categoria: "combinacion de varias",
    proteccion_principal: "Estrategia combinada de propiedad industrial",
    explicacion:
      "Tu proyecto reúne elementos de distinta naturaleza: identidad comercial, solución técnica y apariencia. Cada uno corresponde a una figura distinta y conviene ordenarlos por prioridad y por riesgo de divulgación. Primero lo que pierde protección al hacerse público, después lo que puede registrarse con calma.",
    elementos_protegibles: [
      "El nombre y el logotipo del producto",
      "La solución técnica que lo hace funcionar",
      "La apariencia externa del producto o su empaque",
      "La información reservada del proceso",
    ],
    siguientes_pasos: [
      "Separa por escrito qué parte es identidad, qué parte es técnica y qué parte es apariencia.",
      "Atiende primero lo que se pierde con la divulgación: invención y diseño.",
      "Programa la búsqueda de marcas y la clasificación de productos en paralelo.",
    ],
    figuras_complementarias: [
      "Aviso comercial para el eslogan",
      "Derecho de autor sobre materiales creativos",
      "Convenios de confidencialidad con terceros",
    ],
    advertencias: [
      "La descripción abarca varios frentes; conviene precisar el objetivo comercial principal.",
      "Faltan datos sobre divulgaciones previas y mercados de interés.",
      "El orden de las solicitudes afecta costos y plazos.",
    ],
    confianza: "bajo",
  },
};

const PISTAS: { categoria: Categoria; palabras: string[] }[] = [
  {
    categoria: "secreto industrial",
    palabras: ["secreto", "reserva", "confidencial", "formula", "receta", "no divulgar"],
  },
  {
    categoria: "patente o modelo de utilidad",
    palabras: ["mecanismo", "invento", "invencion", "dispositivo", "aparato", "maquina", "proceso tecnico", "funciona", "tecnologia", "algoritmo", "prototipo"],
  },
  {
    categoria: "diseno industrial",
    palabras: ["forma", "apariencia", "diseno", "estetica", "ornamental", "aspecto", "silueta", "empaque"],
  },
  {
    categoria: "marca o signo distintivo",
    palabras: ["marca", "nombre", "logo", "logotipo", "eslogan", "etiqueta", "vender", "negocio", "tienda", "identidad"],
  },
];

/** Resultado simulado para el modo demo, elegido por palabras clave. */
export function analisisDemo(idea: string): Analisis {
  const texto = normalizar(idea);
  const coincidencias = PISTAS.filter((pista) =>
    pista.palabras.some((palabra) => texto.includes(palabra)),
  );

  if (coincidencias.length === 0) return PLANTILLAS["combinacion de varias"];
  if (coincidencias.length >= 3) return PLANTILLAS["combinacion de varias"];
  return PLANTILLAS[coincidencias[0].categoria];
}
