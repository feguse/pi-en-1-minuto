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
  "observancia en frontera",
  "variedad vegetal",
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
  "observancia en frontera": "Observancia en frontera (aduanas)",
  "variedad vegetal": "Variedad vegetal (título de obtentor)",
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
  "observancia en frontera": "ANAM para la alerta; IMPI o FGR para la medida",
  "variedad vegetal": "SNICS, de la Secretaría de Agricultura",
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
  "observancia en frontera": "cat-frontera",
  "variedad vegetal": "cat-vegetal",
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
  /** El caso no es materia de propiedad intelectual. */
  fuera_de_materia: boolean;
  /** El caso excede lo que una orientación preliminar puede resolver. */
  requiere_profesional: boolean;
  motivo_escalamiento: string;
  /** Plazo corriendo que la persona debe atender hoy. Vacío si no hay. */
  plazo_critico: string;
  confianza: Confianza;
};

export type RespuestaAnalisis = {
  resultado: Analisis;
  demo: boolean;
  /** Por qué se devolvió un resultado simulado. */
  motivo?: "sin_llave" | "servicio";
};

export type Ejemplo = { etiqueta: string; texto: string };

/** Banco de ejemplos del modo "quiero proteger algo". Cubre las nueve figuras. */
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
  {
    etiqueta: "Eslogan de campaña",
    texto:
      "Escribí una frase publicitaria para anunciar mi negocio y la voy a usar en radio, espectaculares y redes sociales.",
  },
  {
    etiqueta: "Nombre de mi taller",
    texto:
      "Abrí un taller mecánico con un nombre propio y un rótulo en la fachada. Solo atiendo clientes de mi colonia, pero quiero crecer.",
  },
  {
    etiqueta: "Mezcal de mi región",
    texto:
      "Produzco mezcal artesanal con agave de mi región y quiero venderlo usando el nombre del pueblo donde se hace.",
  },
  {
    etiqueta: "App para veterinarias",
    texto:
      "Programé una aplicación para que las veterinarias agenden citas. Escribí el código yo y le puse nombre y un ícono propio.",
  },
  {
    etiqueta: "Empaque distinto",
    texto:
      "Diseñé un empaque con una forma poco común para que mi producto se distinga en el anaquel, y le puse una etiqueta con mi marca.",
  },
  {
    etiqueta: "Bordado tradicional",
    texto:
      "Hago bordados con motivos de mi comunidad y los aplico en prendas que vendo en ferias y por internet.",
  },
  {
    etiqueta: "La salsa de mi suegra",
    texto:
      "Hice una salsa tan picante que mi suegra dejó de opinar sobre mi sazón. La receta es un secreto de familia y quiero embotellarla y venderla con nombre propio.",
  },
  {
    etiqueta: "Mi perro es famoso",
    texto:
      "Mi perro pone una cara que se hizo viral. Con esa cara dibujé un personaje, le puse nombre y ahora me piden playeras y tazas con él.",
  },
  {
    etiqueta: "Dobla ropa (a veces)",
    texto:
      "Armé una máquina que dobla la ropa sola. Todavía falla los martes, pero el mecanismo lo inventé yo y nadie más lo tiene.",
  },
  {
    etiqueta: "Método de calibración",
    texto:
      "Encontré una manera propia de calibrar un sensor que mejora su precisión. No la he contado fuera de mi equipo.",
  },
  {
    etiqueta: "Lentes con limpiaparabrisas",
    texto:
      "Inventé un gorro con limpiaparabrisas diminutos para los lentes cuando llueve. Mis amigos se burlan, pero funciona y nadie más lo vende.",
  },
  {
    etiqueta: "Los Amparos Directos",
    texto:
      "Mi banda de garage se llama Los Amparos Directos. Ya tenemos dos canciones grabadas, un logotipo y playeras que vendemos en los tocadas.",
  },
  {
    etiqueta: "Traductor de ladridos",
    texto:
      "Hice una aplicación que dice traducir lo que ladra mi perro. Es puro invento mío, pero la gente la descarga y ya tiene nombre e ícono.",
  },
  {
    etiqueta: "Tamales de lujo",
    texto:
      "A mi puesto de tamales le puse un nombre que suena a marca italiana de lujo. Vendo afuera del metro y ya se me hizo conocido.",
  },
  {
    etiqueta: "Gelatinas del jefe",
    texto:
      "Diseñé un molde para hacer gelatinas con la cara de mi jefe. Se venden muy bien en oficinas y quiero producirlas en serie.",
  },
  {
    etiqueta: "Software de consultorios",
    texto:
      "Desarrollé un programa de facturación para consultorios médicos y lo vendo por suscripción mensual con una marca propia.",
  },
  {
    etiqueta: "Catálogo fotográfico",
    texto:
      "Tengo un catálogo de fotografías de arquitectura que licencio a revistas y despachos. Las tomé todas yo.",
  },
  {
    etiqueta: "Tueste propio",
    texto:
      "Creé una mezcla de café de especialidad y un método de tueste que desarrollé a prueba y error para mi cafetería.",
  },
  {
    etiqueta: "Mobiliario del restaurante",
    texto:
      "Diseñé las mesas y las lámparas de mi restaurante. Me las han pedido tanto que quiero venderlas por separado.",
  },
  {
    etiqueta: "Escuela de natación",
    texto:
      "Fundé una escuela de natación con nombre, logotipo y un método de enseñanza propio que documenté para mis instructores.",
  },
];

/** Banco de ejemplos del modo "tengo un problema". */
export const EJEMPLOS_PROBLEMA: Ejemplo[] = [
  {
    etiqueta: "Copian mi logotipo",
    texto:
      "Alguien está vendiendo playeras con mi logotipo y nunca le di permiso. ¿Qué opciones tengo?",
  },
  {
    etiqueta: "Me llegó una oposición",
    texto:
      "Solicité mi marca y me llegó un escrito de oposición de otra empresa que dice que se parece a la suya.",
  },
  {
    etiqueta: "Mi exsocio la registró",
    texto:
      "Un exsocio registró a su nombre la marca del negocio que construimos juntos. Yo tengo facturas y publicaciones desde antes.",
  },
  {
    etiqueta: "Mi proveedor la fabrica",
    texto:
      "El taller al que le encargaba la producción está fabricando y vendiendo el mismo producto por su cuenta.",
  },
  {
    etiqueta: "Copiaron mi empaque",
    texto:
      "Otra marca sacó un empaque casi idéntico al mío y los clientes me están confundiendo con ellos.",
  },
  {
    etiqueta: "El diseñador reclama",
    texto:
      "El diseñador que contraté para mi logotipo dice ahora que los derechos son suyos y que no puedo usarlo.",
  },
  {
    etiqueta: "Nombre parecido",
    texto:
      "Abrió un negocio del mismo giro con un nombre muy parecido al mío, a unas calles de distancia.",
  },
  {
    etiqueta: "Me bajaron la publicación",
    texto:
      "Una plataforma retiró mis publicaciones por una queja de propiedad intelectual que considero infundada.",
  },
  {
    etiqueta: "Se me venció el registro",
    texto:
      "Me di cuenta de que mi registro de marca venció y no lo renové a tiempo. Sigo usando la marca todos los días.",
  },
  {
    etiqueta: "La taquería con K",
    texto:
      "Mi vecino abrió una taquería con el mismo nombre que la mía pero escrito con K. Dice que así ya es otra cosa y que no me puedo quejar.",
  },
  {
    etiqueta: "La carne asada de 2019",
    texto:
      "Un primo dice que la idea del negocio fue suya porque la comentó en una carne asada en 2019, y ahora quiere parte de la marca.",
  },
  {
    etiqueta: "Me mandaron una carta",
    texto:
      "Recibí una carta de un despacho exigiéndome dejar de usar mi nombre comercial y darles una respuesta en diez días.",
  },
  {
    etiqueta: "Mi ex y el Instagram",
    texto:
      "Mi ex se llevó la cuenta de Instagram del negocio cuando terminamos. Dice que el nombre lo inventó ella y no me la devuelve.",
  },
  {
    etiqueta: "El influencer se adjudicó",
    texto:
      "Un influencer dijo en un video que mi producto era creación suya. Ahora la gente le compra a él pensando que es el original.",
  },
  {
    etiqueta: "Logo al revés",
    texto:
      "Mandé hacer mil playeras y el proveedor imprimió mi logotipo al revés. Ahora él las vende por su cuenta como edición limitada.",
  },
  {
    etiqueta: "Los pasteles de mi tía",
    texto:
      "Mi tía vende mis pasteles con mi receta y mi nombre en otra ciudad. Dice que no pasa nada porque somos familia.",
  },
  {
    etiqueta: "La libreta de 2015",
    texto:
      "Registré mi marca y un señor me escribió diciendo que él la tenía apuntada en una libreta desde 2015 y que se la debo.",
  },
  {
    etiqueta: "Notificación del IMPI",
    texto:
      "Me llegó una notificación del IMPI sobre un procedimiento de declaración administrativa contra mi registro de marca.",
  },
  {
    etiqueta: "Distribuidor sin contrato",
    texto:
      "Un distribuidor sigue usando mi marca en su publicidad y sus facturas, aunque el contrato con él terminó hace meses.",
  },
  {
    etiqueta: "Falsificaciones en aduana",
    texto:
      "Me avisaron que hay productos con mi marca detenidos en una aduana y yo no los fabriqué ni autoricé.",
  },
  {
    etiqueta: "Registraron mi marca antes",
    texto:
      "Una empresa extranjera registró en México la marca que yo ya usaba aquí, y ahora me exige que deje de usarla.",
  },
  {
    etiqueta: "Se fue con todo",
    texto:
      "Un empleado renunció y se llevó la base de clientes y el proceso de producción que solo él y yo conocíamos.",
  },
];

/** Cuántos ejemplos se muestran a la vez. */
export const EJEMPLOS_VISIBLES = 5;

export const AVISO_LEGAL =
  "Esta orientación es informativa, no constituye asesoría jurídica, no garantiza que la creación sea registrable y no reemplaza una búsqueda profesional.";

/**
 * Práctica operativa de los avisos aduanales por posible infracción marcaria.
 * NO es texto legal: es conocimiento de despacho. Se inyecta por separado y
 * el prompt tiene prohibido citarlo como si fuera norma.
 */
export const PRACTICA_ADUANAS = `PRÁCTICA OPERATIVA OBSERVADA (no es texto legal; nunca la cites entre corchetes como si fuera un artículo).

INSCRIPCIÓN EN LA BASE MARCARIA DE LA ANAM
- La inscripción es voluntaria. Se aportan los registros vigentes ante el IMPI, datos y fotografías de productos, empaques y etiquetado, importadores o distribuidores autorizados, y contacto del titular o su representante.
- El expediente se envía primero por correo a la ANAM para revisión. Con el visto bueno, la autoridad programa la presentación física y el cotejo de poderes e identificaciones. Después entrega una liga para capturar la información con e.firma y obtener la clave de inscripción.
- Solo pueden inscribir el titular o su representante legal. No un licenciatario, un distribuidor ni un tercero autorizado.
- Conviene designar un único correo vigilado de forma constante: ahí llegan las consultas aduanales.

CUANDO LA ADUANA DETECTA ALGO
- La ANAM envía un correo con la aduana y el folio, el contenedor o guía, la marca detectada, la descripción y cantidad de mercancía, las fotografías disponibles y datos limitados del importador, destinatario o proveedor.
- En la práctica la ANAM funciona como detector y retenedor temporal. Para un aseguramiento o una medida formal debe intervenir el IMPI o la FGR.

EL PLAZO, QUE ES LO MÁS IMPORTANTE
- La ventana normal para contestar es de 2 a 3 días, unas 48 a 72 horas desde el aviso.
- Si la información es insuficiente, hay que acusar recibo de inmediato y pedir fotografías adicionales, códigos de barras, números de serie o datos del importador.
- La prórroga debe solicitarse expresamente y antes del vencimiento. Pedir información NO suspende el plazo automáticamente.
- El poder con facultades suficientes ante autoridades aduaneras, administrativas y judiciales debe estar formalizado de antemano. En 48 horas no da tiempo de prepararlo desde cero.

QUÉ CONTESTAR
- Si no procede: decir por qué. Que la mercancía es original o licenciada, que la información no permite determinar la infracción, o que el titular decidió no actuar. Si el motivo es la cantidad, la ANAM pide señalar a partir de qué cantidad mínima sí se consideraría actuar.
- Si procede: indicar la vía. Penal ante la FGR, identificando la delegación regional o la UEIDDAPI; o administrativa ante el IMPI, pidiendo medidas en frontera o la suspensión de la libre circulación.
- Hay que adjuntar evidencia documental de que la actuación YA se inició. No basta manifestar la intención.

RESULTADOS
- Si los productos son legítimos, se comunica que no se iniciarán acciones y se pide continuar el despacho.
- Vía IMPI: se solicitan medidas provisionales, se acreditan los derechos, se presenta información del embarque y se exhibe la garantía que fije la autoridad. Después hay que dar continuidad al procedimiento de infracción.
- Vía FGR: se presenta la denuncia y se pide que la Fiscalía asegure la mercancía dentro de la investigación.
- Si no se responde a tiempo, la ANAM sigue con sus procedimientos y suele perderse la oportunidad de detener la mercancía, salvo que exista otra causa de inmovilización.
- Si el contenedor ya está asegurado en una carpeta de investigación de la FGR, la mercancía permanece inmovilizada y cualquier inspección o toma de fotografías depende de que la autoridad ministerial programe el posicionamiento.

IDEA CENTRAL: el aviso de aduanas es una alerta urgente, no el inicio automático de una acción. Lo que convierte la retención temporal en medida formal es la decisión del titular y la presentación rápida de la actuación ante el IMPI o la FGR.`;

/** Qué pasa con lo que la persona escribe. Va junto al campo, no enterrado. */
export const AVISO_DATOS =
  "Lo que escribas se procesa con un servicio de inteligencia artificial fuera de México y no se guarda en ningún lado. Evita incluir datos que debas mantener en secreto, como fórmulas completas o planos.";

/** Aviso de marcas y de independencia respecto del despacho. */
export const AVISO_MARCAS =
  "El enlace a asesoría dirige al sitio de un despacho externo, independiente de esta herramienta, que no avala ni responde por las orientaciones que aquí se generan. Las marcas y denominaciones mencionadas pertenecen a sus titulares. IMPI e Indautor son ajenos a este sitio.";

/** Letra chiquita al pie de cada resultado. El tono del dictamen lo exige. */
export const LETRA_CHIQUITA =
  "Lo anterior no es una opinión legal ni crea una relación abogado-cliente. Es una orientación preliminar generada de forma automática a partir del texto vigente de la ley, sin revisión de un abogado y sin conocer los antecedentes de tu caso. Antes de presentar una solicitud, firmar un contrato o responder a un tercero, consulta a un profesional.";

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

/** Fuentes oficiales agrupadas por objetivo, no en una lista plana. */
export const GRUPOS_RECURSOS: { titulo: string; urls: string[] }[] = [
  {
    titulo: "Marcas y signos distintivos",
    urls: [
      "https://marcia.impi.gob.mx/marcas/search/quick",
      "https://clasniza.impi.gob.mx/",
      "https://eservicios.impi.gob.mx/seimpi/",
    ],
  },
  {
    titulo: "Invenciones y diseños",
    urls: [
      "https://eservicios.impi.gob.mx/seimpi/",
      "https://www.gob.mx/impi/acciones-y-programas/servicios-que-ofrece-el-impi",
    ],
  },
  {
    titulo: "Obras, personajes y publicaciones",
    urls: [
      "https://www.indautor.gob.mx/servicios/registro/registro.php",
      "https://www.indautor.gob.mx/servicios/reservas/dir_reservas.php",
    ],
  },
];

/** Las seis familias de protección, para la sección explicativa. */
export const FAMILIAS: { nombre: string; ejemplo: string }[] = [
  { nombre: "Marcas y nombres", ejemplo: "El nombre de tu producto, tu logotipo, el eslogan." },
  { nombre: "Patentes y mecanismos", ejemplo: "Una solución técnica que funciona de una manera nueva." },
  { nombre: "Diseños industriales", ejemplo: "La forma o la apariencia de un producto o su empaque." },
  { nombre: "Derechos de autor", ejemplo: "Textos, dibujos, música, software, personajes." },
  { nombre: "Secretos industriales", ejemplo: "Una fórmula o un proceso que mantienes en reserva." },
  { nombre: "Combinaciones", ejemplo: "Un mismo proyecto puede necesitar más de una figura." },
];

// ---------------------------------------------------------------------------
// Validacion de la respuesta del modelo
// ---------------------------------------------------------------------------

// Red de seguridad, no un formato: la explicación ahora es un dictamen.
const LIMITE_PALABRAS = 600;

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
  if (texto.includes("obtentor") || texto.includes("variedad vegetal")) return "variedad vegetal";
  if (texto.includes("frontera") || texto.includes("aduana") || texto.includes("anam")) {
    return "observancia en frontera";
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

  // Solo la categoría y el dictamen son indispensables. Descartar una respuesta
  // buena porque una lista secundaria vino corta es peor que mostrarla sin ella.
  // Solo la categoría es indispensable. El dictamen llega por el flujo de
  // /api/dictamen, así que aquí puede venir vacío.
  if (!categoria) {
    throw new Error(
      `La respuesta del modelo está incompleta. Falta la categoría. ` +
        `Recibido: ${Object.keys(bruto).join(", ")}`,
    );
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
    fuera_de_materia: bruto.fuera_de_materia === true,
    requiere_profesional: bruto.requiere_profesional === true,
    motivo_escalamiento: aTexto(bruto.motivo_escalamiento),
    plazo_critico: aTexto(bruto.plazo_critico),
    confianza: detectarConfianza(bruto.confianza),
  };
}

/** Campos que produce la segunda fase, una vez decidida la figura. */
export type Detalle = Pick<
  Analisis,
  | "elementos_protegibles"
  | "siguientes_pasos"
  | "figuras_complementarias"
  | "advertencias"
  | "que_no_protege"
  | "plazos_clave"
  | "clases_niza"
>;

export function validarDetalle(datos: unknown): Detalle {
  const bruto = (datos && typeof datos === "object" ? datos : {}) as Record<string, unknown>;
  return {
    elementos_protegibles: aLista(bruto.elementos_protegibles, 6),
    siguientes_pasos: aLista(bruto.siguientes_pasos, 3),
    figuras_complementarias: aLista(bruto.figuras_complementarias, 4),
    advertencias: aLista(bruto.advertencias, 4),
    que_no_protege: aLista(bruto.que_no_protege, 4),
    plazos_clave: aLista(bruto.plazos_clave, 4),
    clases_niza: aLista(bruto.clases_niza, 5),
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
    fuera_de_materia: false,
    requiere_profesional: false,
    motivo_escalamiento: "",
    plazo_critico: "",
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
    fuera_de_materia: false,
    requiere_profesional: false,
    motivo_escalamiento: "",
    plazo_critico: "",
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
    fuera_de_materia: false,
    requiere_profesional: false,
    motivo_escalamiento: "",
    plazo_critico: "",
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
    fuera_de_materia: false,
    requiere_profesional: false,
    motivo_escalamiento: "",
    plazo_critico: "",
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
    fuera_de_materia: false,
    requiere_profesional: false,
    motivo_escalamiento: "",
    plazo_critico: "",
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
    fuera_de_materia: false,
    requiere_profesional: false,
    motivo_escalamiento: "",
    plazo_critico: "",
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
    fuera_de_materia: false,
    requiere_profesional: false,
    motivo_escalamiento: "",
    plazo_critico: "",
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
    fuera_de_materia: false,
    requiere_profesional: false,
    motivo_escalamiento: "",
    plazo_critico: "",
    confianza: "medio",
  },
  "observancia en frontera": {
    categoria: "observancia en frontera",
    proteccion_principal:
      "Inscripción en la Base Marcaria de la ANAM y, ante una detección, actuación ante el IMPI o la FGR",
    autoridad: "ANAM para la alerta; IMPI o FGR para la medida",
    explicacion:
      "Lo que describes involucra mercancía que cruza la frontera. La aduana puede detectar productos que ostentan una marca registrada, pero no asegura por sí sola: necesita una resolución previa de la autoridad de propiedad intelectual o de un juez. Para que tu marca sea visible en ese filtro conviene inscribirla en la Base Marcaria de la ANAM, y tener listo de antemano el poder para poder responder en el plazo que se abre.",
    elementos_protegibles: [
      "La marca registrada frente a importaciones que la ostenten",
      "La información del embarque y del importador",
      "Los datos de tus importadores y distribuidores autorizados",
    ],
    siguientes_pasos: [
      "Inscribe la marca en la Base Marcaria de la ANAM: solo puede hacerlo el titular o su representante legal.",
      "Formaliza desde ahora el poder con facultades ante autoridades aduaneras, administrativas y judiciales.",
      "Designa un único correo vigilado a diario: ahí llegan las consultas aduanales y el plazo es de 48 a 72 horas.",
    ],
    figuras_complementarias: [
      "Marca registrada ante el IMPI, que es el requisito previo",
      "Denuncia penal ante la FGR",
      "Procedimiento de infracción ante el IMPI",
    ],
    advertencias: [
      "La aduana detecta y retiene temporalmente; el aseguramiento formal lo ordena el IMPI o la FGR.",
      "Pedir más información a la aduana no suspende el plazo para contestar.",
      "Sin inscripción en la Base Marcaria, tu marca no aparece en el filtro aduanero.",
    ],
    que_no_protege: [
      "La inscripción no sustituye al registro de marca ante el IMPI.",
      "No detiene por sí sola la mercancía ni sustituye la resolución de la autoridad competente.",
      "No alcanza a mercancía que no ostente tu marca.",
    ],
    plazos_clave: [
      "La respuesta al aviso aduanal suele tener una ventana de 48 a 72 horas.",
      "La prórroga debe pedirse expresamente y antes del vencimiento.",
      "La información de la Base Marcaria debe actualizarse de manera permanente.",
    ],
    clases_niza: [],
    fuera_de_materia: false,
    requiere_profesional: true,
    motivo_escalamiento:
      "Los avisos aduanales corren en horas y exigen decidir entre la vía penal y la administrativa con documentación lista.",
    plazo_critico: "",
    confianza: "medio",
  },
  "variedad vegetal": {
    categoria: "variedad vegetal",
    proteccion_principal: "Título de obtentor ante el SNICS",
    autoridad: "SNICS, de la Secretaría de Agricultura",
    explicacion:
      "Lo que describes es una variedad vegetal nueva, no un producto industrial ni un signo. Esa creación se protege con un título de obtentor, que tramita el SNICS y no el IMPI. Se exige que la variedad sea nueva, distinta, estable y homogénea, y que tenga una denominación propia. El derecho a ser reconocido como obtentor es inalienable e imprescriptible.",
    elementos_protegibles: [
      "La variedad vegetal en sí, por sus caracteres pertinentes",
      "La denominación de la variedad",
      "El material de propagación o reproducción",
    ],
    siguientes_pasos: [
      "Documenta los caracteres que distinguen tu variedad de las ya conocidas.",
      "Consulta con el SNICS los requisitos de la solicitud y las pruebas de campo aplicables.",
      "Evita comercializarla antes de solicitar: la novedad depende de ello.",
    ],
    figuras_complementarias: [
      "Marca para el nombre comercial con que se venda la semilla",
      "Secreto industrial sobre líneas parentales",
      "Inscripción en el Catálogo Nacional de Variedades Vegetales",
    ],
    advertencias: [
      "El título de obtentor lo otorga el SNICS, no el IMPI: es una vía distinta.",
      "Falta saber si la variedad ya se comercializó y desde cuándo.",
      "Usar la variedad como fuente de investigación para mejorar otras no requiere tu consentimiento.",
    ],
    que_no_protege: [
      "No impide que otros investiguen a partir de tu variedad para obtener una distinta.",
      "No protege el nombre comercial: eso corresponde a la marca.",
      "No alcanza a variedades que no sean distintas de la tuya.",
    ],
    plazos_clave: [
      "La novedad se compromete si la variedad se comercializó antes de solicitar.",
      "La vigencia del título depende de la especie de que se trate.",
      "El SNICS puede requerir pruebas de campo que toman ciclos completos.",
    ],
    clases_niza: [],
    fuera_de_materia: false,
    requiere_profesional: true,
    motivo_escalamiento:
      "Los títulos de obtentor exigen pruebas técnicas de distinción, homogeneidad y estabilidad que conviene preparar con asesoría especializada.",
    plazo_critico: "",
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
    fuera_de_materia: false,
    requiere_profesional: false,
    motivo_escalamiento: "",
    plazo_critico: "",
    confianza: "bajo",
  },
};

const PISTAS: { categoria: Categoria; palabras: string[] }[] = [
  {
    categoria: "secreto industrial",
    palabras: ["secreto", "reserva dentro", "confidencial", "formula", "receta", "mezcla", "no divulgar", "no lo he contado", "no la he contado", "nadie mas lo sabe", "base de clientes", "lista de clientes", "cartera de clientes", "proceso interno", "know how", "metodo propio", "proveedores"],
  },
  {
    categoria: "derecho de autor o reserva de derechos",
    palabras: ["personaje", "revista", "libro", "cancion", "musica", "pintura", "dibujo", "ilustracion", "fotografia", "foto", "guion", "obra", "editorial", "comic", "novela", "escribi", "catalogo", "compilacion", "bordado", "software", "programa", "aplicacion", "codigo fuente", "videojuego", "curso", "manual", "mural", "grafico"],
  },
  {
    categoria: "patente o modelo de utilidad",
    // "invento" quedó fuera a propósito: al normalizar acentos es idéntica
    // al verbo "inventó", y "el nombre lo inventó ella" no es una patente.
    palabras: ["mecanismo", "invencion", "dispositivo", "aparato", "maquina", "proceso tecnico", "funciona", "tecnologia", "algoritmo", "prototipo", "sensor", "modelo de utilidad", "herramienta", "utensilio", "farmaceutico", "quimico"],
  },
  {
    categoria: "diseno industrial",
    palabras: ["forma", "apariencia", "diseno", "estetica", "ornamental", "aspecto", "silueta", "empaque", "mobiliario", "mueble", "molde", "envase", "disene", "disenar", "como se ve"],
  },
  {
    categoria: "variedad vegetal",
    palabras: ["variedad vegetal", "obtentor", "semilla", "cultivo", "hibrido", "germoplasma", "mejoramiento genetico", "planta nueva", "snics", "injerto", "porta injerto"],
  },
  {
    categoria: "observancia en frontera",
    palabras: ["aduana", "aduanal", "anam", "importacion", "importador", "contenedor", "embarque", "falsificad", "pirata", "frontera", "despacho aduanero", "mercancia detenida", "base marcaria"],
  },
  {
    categoria: "denominacion de origen o indicacion geografica",
    palabras: ["denominacion de origen", "indicacion geografica", "region", "mi pueblo", "originario de", "zona geografica", "mezcal", "talavera", "artesania de"],
  },
  {
    categoria: "aviso comercial",
    palabras: ["eslogan", "slogan", "frase publicitaria", "lema", "frase que", "campana publicitaria"],
  },
  {
    categoria: "nombre comercial",
    palabras: ["nombre comercial", "nombre de mi negocio", "nombre del establecimiento", "nombre de mi tienda", "nombre del local", "rotulo", "letrero del local"],
  },
  {
    categoria: "marca o signo distintivo",
    // Lista deliberadamente genérica: va al final y sus palabras pesan uno.
    // "eslogan" no está aquí, vive en aviso comercial, para que no empate.
    palabras: ["marca", "nombre", "logo", "logotipo", "etiqueta", "negocio", "tienda", "identidad"],
  },
];

/**
 * Clasificación barata por palabras clave. Sirve para dos cosas: el modo demo
 * y decidir qué artículos recuperar ANTES de llamar al modelo.
 *
 * Gana la figura con más señal, no la primera de la lista. Antes bastaba una
 * palabra genérica como "nombre" para que un catálogo de fotografías se fuera
 * a marcas, y tres coincidencias cualesquiera mandaban el caso a "combinación
 * de varias", que es donde la recuperación se queda sin ámbito y empieza a
 * citar cualquier ley.
 */
export function preclasificar(idea: string): Categoria {
  const texto = normalizar(idea);
  // Por palabra completa, no por subcadena: "lo inventó ella" no debe
  // engancharse con la pista "invento" y volverse una patente. El plural sí
  // cuenta: "fotografías" tenía que enganchar con "fotografia" y no lo hacía.
  const contiene = (frase: string) => {
    const escapada = frase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9ñ])${escapada}(e?s)?([^a-z0-9ñ]|$)`).test(texto);
  };

  // Una frase de varias palabras vale doble: "denominación de origen" dice
  // mucho más que "nombre".
  const puntaje = new Map<Categoria, number>();
  for (const pista of PISTAS) {
    let suma = 0;
    for (const palabra of pista.palabras) {
      if (contiene(palabra)) suma += palabra.includes(" ") ? 2 : 1;
    }
    if (suma > 0) puntaje.set(pista.categoria, suma);
  }

  // Mixto de verdad: tres figuras con señal propia, no tres palabras sueltas.
  if ([...puntaje.values()].filter((n) => n >= 2).length >= 3) {
    return "combinacion de varias";
  }
  const posicion = new Map(PISTAS.map((p, i) => [p.categoria, i]));
  const orden = [...puntaje.entries()].sort(
    (a, b) => b[1] - a[1] || posicion.get(a[0])! - posicion.get(b[0])!,
  );
  // El desempate es el orden de PISTAS, que va de lo específico a lo genérico:
  // entre "aplicación" y "nombre" gana la obra, no la marca.
  if (orden.length === 0) return "combinacion de varias";
  return orden[0][0];
}

/** Resultado simulado para el modo demo. */
export function analisisDemo(idea: string): Analisis {
  return PLANTILLAS[preclasificar(idea)];
}
