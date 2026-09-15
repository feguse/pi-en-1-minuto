// Tipos, validacion y modo demo compartidos entre el cliente y /api/analyze.

export const CATEGORIAS = [
  "marca o signo distintivo",
  "aviso comercial",
  "nombre comercial",
  "patente o modelo de utilidad",
  "diseno industrial",
  "secreto industrial",
  "derecho de autor o reserva de derechos",
  "denominacion de origen o indicacion geografica",
  "combinacion de varias",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  "marca o signo distintivo": "Marca o signo distintivo",
  "aviso comercial": "Aviso comercial",
  "nombre comercial": "Nombre comercial",
  "patente o modelo de utilidad": "Patente o modelo de utilidad",
  "diseno industrial": "Diseño industrial",
  "secreto industrial": "Secreto industrial",
  "derecho de autor o reserva de derechos": "Derecho de autor o reserva de derechos",
  "denominacion de origen o indicacion geografica": "Denominación de origen o indicación geográfica",
  "combinacion de varias": "Combinación de varias figuras",
};

/** Autoridad competente por figura. */
export const AUTORIDAD: Record<Categoria, string> = {
  "marca o signo distintivo": "IMPI",
  "aviso comercial": "IMPI",
  "nombre comercial": "IMPI",
  "patente o modelo de utilidad": "IMPI",
  "diseno industrial": "IMPI",
  "secreto industrial": "No se registra ante ninguna autoridad",
  "derecho de autor o reserva de derechos": "Indautor",
  "denominacion de origen o indicacion geografica": "IMPI",
  "combinacion de varias": "IMPI e Indautor, según el elemento",
};

/** Clase de color por figura. Alimenta las variables --cat de globals.css. */
export const CLASE_CATEGORIA: Record<Categoria, string> = {
  "marca o signo distintivo": "cat-marca",
  "aviso comercial": "cat-aviso",
  "nombre comercial": "cat-nombre",
  "patente o modelo de utilidad": "cat-patente",
  "diseno industrial": "cat-diseno",
  "secreto industrial": "cat-secreto",
  "derecho de autor o reserva de derechos": "cat-autor",
  "denominacion de origen o indicacion geografica": "cat-denominacion",
  "combinacion de varias": "cat-combinacion",
};

export const NIVELES = ["alto", "medio", "bajo"] as const;
export type Confianza = (typeof NIVELES)[number];

export type Analisis = {
  categoria: Categoria;
  proteccion_principal: string;
  autoridad: string;
  explicacion: string;
  elementos_protegibles: string[];
  siguientes_pasos: string[];
  figuras_complementarias: string[];
  advertencias: string[];
  que_no_protege: string[];
  plazos_clave: string[];
  clases_niza: string[];
  confianza: Confianza;
};

export type RespuestaAnalisis = {
  resultado: Analisis;
  demo: boolean;
  /** Por qué se devolvió un resultado simulado. */
  motivo?: "sin_llave" | "servicio";
};

export type Ejemplo = { etiqueta: string; texto: string };

export const EJEMPLOS: Ejemplo[] = [
  {
    etiqueta: "Bebida con marca propia",
    texto:
      "Creé una bebida de café lista para tomar, con un nombre y un logotipo propios, y quiero venderla en tiendas de conveniencia.",
  },
  {
    etiqueta: "Mecanismo plegable",
    texto:
      "Desarrollé un mecanismo que permite que una bicicleta plegable se cierre con un solo movimiento y ocupe la mitad del espacio.",
  },
  {
    etiqueta: "Forma de una botella",
    texto:
      "Diseñé la forma y la apariencia exterior de una botella de vidrio distinta a todo lo que veo en el mercado.",
  },
  {
    etiqueta: "Fórmula reservada",
    texto:
      "Tengo una fórmula y un proceso de producción que mantengo en reserva dentro de mi empresa y solo conocen tres personas.",
  },
  {
    etiqueta: "Personaje y revista",
    texto:
      "Dibujé un personaje para una revista digital mensual y quiero usar el nombre de la revista y el personaje en mercancía.",
  },
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
  {
    nombre: "Registro Público del Derecho de Autor",
    descripcion: "Registro de obra ante el Indautor",
    url: "https://www.indautor.gob.mx/servicios/registro/registro.php",
  },
  {
    nombre: "Reservas de Derechos",
    descripcion: "Títulos, personajes y promociones ante el Indautor",
    url: "https://www.indautor.gob.mx/servicios/reservas/dir_reservas.php",
  },
];

// ---------------------------------------------------------------------------
// Validacion de la respuesta del modelo
// ---------------------------------------------------------------------------

const LIMITE_PALABRAS = 80;

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
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
  if (texto.includes("autor") || texto.includes("reserva") || texto.includes("indautor")) {
    return "derecho de autor o reserva de derechos";
  }
  if (texto.includes("denominacion de origen") || texto.includes("indicacion geografica")) {
    return "denominacion de origen o indicacion geografica";
  }
  if (texto.includes("aviso comercial")) return "aviso comercial";
  if (texto.includes("nombre comercial")) return "nombre comercial";
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
    autoridad: aTexto(bruto.autoridad) || AUTORIDAD[categoria],
    explicacion: recortarPalabras(explicacion, LIMITE_PALABRAS),
    elementos_protegibles: elementos,
    siguientes_pasos: pasos,
    figuras_complementarias: aLista(bruto.figuras_complementarias, 4),
    advertencias: aLista(bruto.advertencias, 4),
    que_no_protege: aLista(bruto.que_no_protege, 4),
    plazos_clave: aLista(bruto.plazos_clave, 4),
    clases_niza: aLista(bruto.clases_niza, 5),
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
    autoridad: "IMPI",
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
    que_no_protege: [
      "No protege la receta ni el proceso de elaboración.",
      "No impide que otros vendan el mismo producto con otro nombre.",
      "No cubre clases distintas a las que se soliciten.",
    ],
    plazos_clave: [
      "Vigencia de diez años, renovable indefinidamente.",
      "Prioridad convencional de seis meses para solicitar en el extranjero.",
      "Declaración de uso real y efectivo a los tres años de otorgada.",
    ],
    clases_niza: [
      "Clase 30 si el producto es café preparado",
      "Clase 32 si es una bebida no alcohólica lista para tomar",
      "Clase 35 si además se comercializa en tienda propia",
    ],
    confianza: "medio",
  },
  "patente o modelo de utilidad": {
    categoria: "patente o modelo de utilidad",
    proteccion_principal: "Patente o, en su caso, modelo de utilidad",
    autoridad: "IMPI",
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
    que_no_protege: [
      "No protege la idea en abstracto, sino la solución técnica concreta.",
      "No cubre el nombre comercial del producto.",
      "No impide que un tercero llegue a una solución técnica distinta.",
    ],
    plazos_clave: [
      "Patente: vigencia de veinte años improrrogables desde la solicitud.",
      "Modelo de utilidad: quince años improrrogables.",
      "Prioridad convencional de doce meses para solicitar en el extranjero.",
    ],
    clases_niza: [],
    confianza: "medio",
  },
  "diseno industrial": {
    categoria: "diseno industrial",
    proteccion_principal: "Registro de diseño industrial",
    autoridad: "IMPI",
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
    que_no_protege: [
      "No protege la función técnica del producto.",
      "No cubre variantes de forma sustancialmente distintas.",
      "No impide el uso del mismo material o proceso.",
    ],
    plazos_clave: [
      "Vigencia de cinco años renovables hasta veinticinco.",
      "Prioridad convencional de seis meses para el extranjero.",
      "La divulgación previa compromete la novedad exigida.",
    ],
    clases_niza: [],
    confianza: "medio",
  },
  "secreto industrial": {
    categoria: "secreto industrial",
    proteccion_principal: "Protección como secreto industrial",
    autoridad: "No se registra ante ninguna autoridad",
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
    que_no_protege: [
      "No otorga exclusividad frente a quien lo descubra por cuenta propia.",
      "No sobrevive a la divulgación, ni siquiera accidental.",
      "No cubre la ingeniería inversa lícita de un producto en el mercado.",
    ],
    plazos_clave: [
      "Dura mientras la información se mantenga reservada.",
      "No hay plazo de solicitud: la protección nace de las medidas adoptadas.",
      "Conviene fechar y documentar la información desde ahora.",
    ],
    clases_niza: [],
    confianza: "medio",
  },
  "derecho de autor o reserva de derechos": {
    categoria: "derecho de autor o reserva de derechos",
    proteccion_principal: "Registro de obra y, en su caso, reserva de derechos ante el Indautor",
    autoridad: "Indautor",
    explicacion:
      "Lo que describes es una creación con expresión original: un dibujo, un texto, una publicación. El derecho de autor nace con la obra, sin registro, pero el registro ante el Indautor da prueba de autoría y fecha. Los títulos de publicaciones periódicas, los personajes y las promociones se protegen además por reserva de derechos.",
    elementos_protegibles: [
      "El dibujo del personaje como obra artística",
      "Los textos y las ilustraciones de la publicación",
      "El título de la publicación periódica, vía reserva",
      "El personaje, vía reserva de derechos",
    ],
    siguientes_pasos: [
      "Reúne los ejemplares de la obra y los datos de autoría para el registro ante el Indautor.",
      "Verifica si el título y el personaje están disponibles antes de solicitar la reserva.",
      "Si vas a usarlo en mercancía, valora además una marca ante el IMPI para esos productos.",
    ],
    figuras_complementarias: [
      "Marca ante el IMPI para el uso comercial en productos",
      "Aviso comercial para el eslogan de la publicación",
      "Contratos de cesión con ilustradores y colaboradores",
    ],
    advertencias: [
      "El derecho de autor protege la expresión, no la idea ni el concepto.",
      "Si hubo colaboradores, falta definir por escrito la titularidad.",
      "La reserva exige uso efectivo y renovación periódica.",
    ],
    que_no_protege: [
      "No protege la idea, el tema ni el género de la obra.",
      "El registro de obra no impide que otro use un nombre parecido como marca.",
      "La reserva no equivale a un registro marcario para productos.",
    ],
    plazos_clave: [
      "Derecho patrimonial: vida del autor y cien años después.",
      "Reserva de derechos: vigencia de un año, renovable acreditando uso.",
      "El registro de obra no tiene plazo para solicitarse.",
    ],
    clases_niza: [],
    confianza: "medio",
  },
  "aviso comercial": {
    categoria: "aviso comercial",
    proteccion_principal: "Registro de aviso comercial ante el IMPI",
    autoridad: "IMPI",
    explicacion:
      "Lo que quieres proteger es una frase publicitaria que anuncia tu negocio, tus productos o tus servicios y los distingue de otros. Esa función se protege como aviso comercial mediante registro ante el IMPI. En lo que no haya disposición especial, se rige por las mismas reglas que las marcas, incluidos los impedimentos de registro.",
    elementos_protegibles: [
      "La frase o el eslogan publicitario",
      "La combinación de palabras que anuncia el establecimiento",
    ],
    siguientes_pasos: [
      "Revisa en MARCia si alguien ya usa una frase igual o semejante en grado de confusión.",
      "Define a qué productos, servicios o establecimiento se refiere la frase.",
      "Valora registrar por separado la marca denominativa, porque el aviso no la sustituye.",
    ],
    figuras_complementarias: [
      "Marca para el nombre del producto o servicio",
      "Nombre comercial para el establecimiento",
      "Derecho de autor sobre la pieza publicitaria",
    ],
    advertencias: [
      "Las frases descriptivas o de uso común suelen enfrentar objeciones.",
      "Falta saber si la frase ya se usa en el mercado por un tercero.",
      "Un aviso comercial no protege el nombre del producto: eso es materia de marca.",
    ],
    que_no_protege: [
      "No protege el nombre del producto ni el logotipo.",
      "No impide que otro anuncie el mismo producto con otra frase.",
      "No cubre el diseño gráfico de la campaña.",
    ],
    plazos_clave: [
      "Diez años, renovables por periodos iguales.",
      "Le aplican las reglas de marcas en lo que no haya disposición especial.",
    ],
    clases_niza: [],
    confianza: "medio",
  },
  "nombre comercial": {
    categoria: "nombre comercial",
    proteccion_principal: "Publicación del nombre comercial ante el IMPI",
    autoridad: "IMPI",
    explicacion:
      "Hablas del nombre con el que opera tu empresa o establecimiento. El nombre comercial está protegido sin necesidad de registro, pero solo en la zona geográfica de tu clientela efectiva. La publicación ante el IMPI hace constar ese uso y amplía la certeza jurídica frente a terceros.",
    elementos_protegibles: [
      "El nombre del establecimiento o de la empresa",
      "El rótulo con el que opera frente al público",
    ],
    siguientes_pasos: [
      "Documenta desde cuándo y en qué zona geográfica usas el nombre.",
      "Verifica que no exista un nombre comercial o una marca semejante en el mismo giro.",
      "Valora registrar el nombre además como marca, para una protección nacional.",
    ],
    figuras_complementarias: [
      "Marca, si quieres exclusividad en todo el país",
      "Aviso comercial para el eslogan",
      "Derecho de autor sobre el diseño del rótulo",
    ],
    advertencias: [
      "La protección sin registro alcanza solo la zona de la clientela efectiva.",
      "Un nombre sin elementos distintivos de su género no se publica.",
      "Le aplican los impedimentos del artículo 173 en lo conducente.",
    ],
    que_no_protege: [
      "No otorga exclusividad en toda la República, solo en tu zona de clientela.",
      "No protege los productos que vendes: eso corresponde a la marca.",
      "No impide que otro registre una marca semejante si tú no la solicitaste.",
    ],
    plazos_clave: [
      "La protección nace del uso, sin plazo para solicitarla.",
      "Los efectos de la publicación duran diez años, renovables.",
    ],
    clases_niza: [],
    confianza: "medio",
  },
  "denominacion de origen o indicacion geografica": {
    categoria: "denominacion de origen o indicacion geografica",
    proteccion_principal:
      "Declaración de protección de denominación de origen o indicación geográfica ante el IMPI",
    autoridad: "IMPI",
    explicacion:
      "Describes un producto cuya calidad, características o reputación se deben al lugar del que proviene. Eso no se protege como marca sino mediante una declaración de protección ante el IMPI. El Estado mexicano es el titular de la denominación de origen; los productores obtienen después una autorización de uso.",
    elementos_protegibles: [
      "El vínculo entre el producto y su zona geográfica",
      "El nombre del lugar aplicado al producto",
      "Las características derivadas de los factores naturales y culturales de la región",
    ],
    siguientes_pasos: [
      "Documenta el vínculo del producto con la zona: materias primas, proceso y factores locales.",
      "Verifica si ya existe una declaración de protección que ampare ese producto y esa región.",
      "Si ya existe, lo que necesitas no es una declaración nueva sino la autorización de uso.",
    ],
    figuras_complementarias: [
      "Marca colectiva o de certificación para el grupo de productores",
      "Marca propia para distinguir tu producto dentro de la denominación",
      "Aviso comercial para la campaña",
    ],
    advertencias: [
      "El titular de la denominación de origen es el Estado mexicano, no el productor.",
      "Falta acreditar el vínculo entre las características del producto y la zona geográfica.",
      "Usar el nombre de un lugar sin autorización de uso puede constituir infracción.",
    ],
    que_no_protege: [
      "No te da la titularidad del nombre: solo autorización para usarlo.",
      "No protege tu marca propia ni tu receta.",
      "No impide que otros productores de la misma zona obtengan autorización.",
    ],
    plazos_clave: [
      "La declaración de protección dura mientras subsistan las condiciones que la motivaron.",
      "La autorización de uso dura diez años, renovables por periodos iguales.",
      "La autorización caduca si deja de usarse durante los tres años anteriores.",
    ],
    clases_niza: [],
    confianza: "medio",
  },
  "combinacion de varias": {
    categoria: "combinacion de varias",
    proteccion_principal: "Estrategia combinada de propiedad intelectual",
    autoridad: "IMPI e Indautor, según el elemento",
    explicacion:
      "Tu proyecto reúne elementos de distinta naturaleza: identidad comercial, solución técnica, apariencia o contenido creativo. Cada uno corresponde a una figura y a una autoridad distinta, y conviene ordenarlos por prioridad y por riesgo de divulgación. Primero lo que pierde protección al hacerse público, después lo que puede registrarse con calma.",
    elementos_protegibles: [
      "El nombre y el logotipo del producto",
      "La solución técnica que lo hace funcionar",
      "La apariencia externa del producto o su empaque",
      "El contenido creativo y la información reservada",
    ],
    siguientes_pasos: [
      "Separa por escrito qué parte es identidad, qué parte es técnica y qué parte es creativa.",
      "Atiende primero lo que se pierde con la divulgación: invención y diseño.",
      "Programa en paralelo la búsqueda de marcas ante el IMPI y el registro de obra ante el Indautor.",
    ],
    figuras_complementarias: [
      "Aviso comercial para el eslogan",
      "Reserva de derechos si hay un personaje o un título",
      "Convenios de confidencialidad con terceros",
    ],
    advertencias: [
      "La descripción abarca varios frentes; conviene precisar el objetivo comercial principal.",
      "Faltan datos sobre divulgaciones previas y mercados de interés.",
      "El orden de las solicitudes afecta costos y plazos.",
    ],
    que_no_protege: [
      "Ninguna figura por sí sola cubre todo el proyecto.",
      "Registrar una marca no protege la invención ni el contenido creativo.",
      "El derecho de autor no sustituye al registro marcario para productos.",
    ],
    plazos_clave: [
      "Lo primero es lo que pierde novedad al divulgarse: invención y diseño.",
      "Prioridad convencional: doce meses para patente, seis para marca y diseño.",
      "La marca puede solicitarse en cualquier momento, pero conviene antes del lanzamiento.",
    ],
    clases_niza: [],
    confianza: "bajo",
  },
};

const PISTAS: { categoria: Categoria; palabras: string[] }[] = [
  {
    categoria: "secreto industrial",
    palabras: ["secreto", "reserva dentro", "confidencial", "formula", "receta", "no divulgar"],
  },
  {
    categoria: "derecho de autor o reserva de derechos",
    palabras: ["personaje", "revista", "libro", "cancion", "musica", "pintura", "dibujo", "ilustracion", "fotografia", "guion", "obra", "editorial", "comic", "novela", "escribi"],
  },
  {
    categoria: "patente o modelo de utilidad",
    palabras: ["mecanismo", "invento", "invencion", "dispositivo", "aparato", "maquina", "proceso tecnico", "funciona", "tecnologia", "algoritmo", "prototipo", "sensor"],
  },
  {
    categoria: "diseno industrial",
    palabras: ["forma", "apariencia", "diseno", "estetica", "ornamental", "aspecto", "silueta", "empaque"],
  },
  {
    categoria: "denominacion de origen o indicacion geografica",
    palabras: ["denominacion de origen", "indicacion geografica", "region", "mi pueblo", "originario de", "zona geografica", "mezcal", "talavera", "artesania de"],
  },
  {
    categoria: "aviso comercial",
    palabras: ["eslogan", "slogan", "frase publicitaria", "lema", "frase que"],
  },
  {
    categoria: "nombre comercial",
    palabras: ["nombre de mi negocio", "nombre del establecimiento", "rotulo", "letrero del local"],
  },
  {
    categoria: "marca o signo distintivo",
    palabras: ["marca", "nombre", "logo", "logotipo", "eslogan", "etiqueta", "vender", "negocio", "tienda", "identidad"],
  },
];

/**
 * Clasificación barata por palabras clave. Sirve para dos cosas: el modo demo
 * y decidir qué artículos recuperar ANTES de llamar al modelo.
 */
export function preclasificar(idea: string): Categoria {
  const texto = normalizar(idea);
  const coincidencias = PISTAS.filter((pista) =>
    pista.palabras.some((palabra) => texto.includes(palabra)),
  );
  if (coincidencias.length === 0 || coincidencias.length >= 3) return "combinacion de varias";
  return coincidencias[0].categoria;
}

/** Resultado simulado para el modo demo. */
export function analisisDemo(idea: string): Analisis {
  return PLANTILLAS[preclasificar(idea)];
}
