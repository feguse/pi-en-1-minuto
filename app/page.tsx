"use client";

import { useEffect, useRef, useState } from "react";
import {
  Acordeon,
  AyudaProfesional,
  BotonCopiar,
  Button,
  Card,
  ExampleChip,
  Fundamentos,
  LoadingSteps,
  PlazoCritico,
  OfficialResourceLink,
  Prosa,
  RecommendationCard,
  SelectorModo,
  Textarea,
  type Modo,
  type RespuestaConsulta,
} from "./components";
import {
  AVISO_DATOS,
  AVISO_LEGAL,
  AVISO_MARCAS,
  CLASE_CATEGORIA,
  EJEMPLOS,
  EJEMPLOS_PROBLEMA,
  EJEMPLOS_VISIBLES,
  ETIQUETAS_CATEGORIA,
  FAMILIAS,
  GRUPOS_RECURSOS,
  LETRA_CHIQUITA,
  RECURSOS,
  type Analisis,
  type Detalle,
  type RespuestaAnalisis,
} from "./lib";

const MAXIMO = 2000;

/** Toma n elementos al azar, sin repetir. */
function alAzar<T>(lista: T[], n: number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, n);
}
const MINIMO = 15;

function comoTexto(r: Analisis, tipo: string): string {
  const lista = (t: string, xs: string[]) =>
    xs.length ? `\n${t}\n${xs.map((x) => `  · ${x}`).join("\n")}` : "";
  return [
    "PI en 1 Minuto — orientación preliminar",
    "",
    `Ruta sugerida: ${r.proteccion_principal}`,
    `Clasificación preliminar: ${tipo}`,
    `Se tramita ante: ${r.autoridad}`,
    r.plazo_critico ? `\nPLAZO QUE ATENDER: ${r.plazo_critico}` : "",
    "",
    r.explicacion,
    lista("Qué parte podrías proteger:", r.elementos_protegibles),
    lista("Tus próximos tres pasos:", r.siguientes_pasos),
    lista("Qué no cubre esta figura:", r.que_no_protege),
    lista("Información que falta:", r.advertencias),
    lista("Plazos y vigencias:", r.plazos_clave),
    lista("Clases de Niza probables:", r.clases_niza),
    "",
    AVISO_LEGAL,
    "",
    LETRA_CHIQUITA,
    "",
    "Generado en pien1minuto.com",
  ]
    .filter(Boolean)
    .join("\n");
}

export default function Pagina() {
  const [modo, setModo] = useState<Modo>("proteger");
  const [idea, setIdea] = useState("");
  const [pregunta, setPregunta] = useState("");
  const [ejemploActivo, setEjemploActivo] = useState<string | null>(null);
  // Se arranca con un corte fijo para que el servidor y el cliente pinten lo
  // mismo; el barajado ocurre ya montado.
  const [visiblesProteger, setVisiblesProteger] = useState(() =>
    EJEMPLOS.slice(0, EJEMPLOS_VISIBLES),
  );
  const [visiblesProblema, setVisiblesProblema] = useState(() =>
    EJEMPLOS_PROBLEMA.slice(0, EJEMPLOS_VISIBLES),
  );
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Analisis | null>(null);
  const [demo, setDemo] = useState(false);
  const [motivoDemo, setMotivoDemo] = useState<string | undefined>(undefined);
  const [consulta, setConsulta] = useState<RespuestaConsulta | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [dictando, setDictando] = useState(false);
  const analizador = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisiblesProteger(alAzar(EJEMPLOS, EJEMPLOS_VISIBLES));
    setVisiblesProblema(alAzar(EJEMPLOS_PROBLEMA, EJEMPLOS_VISIBLES));
  }, []);

  function otrosEjemplos() {
    if (modo === "proteger") setVisiblesProteger(alAzar(EJEMPLOS, EJEMPLOS_VISIBLES));
    else setVisiblesProblema(alAzar(EJEMPLOS_PROBLEMA, EJEMPLOS_VISIBLES));
  }

  const ejemplosVisibles = modo === "proteger" ? visiblesProteger : visiblesProblema;
  const entrada = modo === "proteger" ? idea : pregunta;
  const listo = entrada.trim().length >= MINIMO;
  const hayResultado = Boolean(resultado || consulta);

  function limpiarResultados() {
    setResultado(null);
    setConsulta(null);
    setError(null);
  }

  /**
   * Segunda fase, en segundo plano: desarrolla los apoyos mientras la persona
   * ya está leyendo el dictamen. Si falla, el resultado principal se queda.
   */
  async function pedirDetalle(texto: string, base: Analisis) {
    setCargandoDetalle(true);
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: texto,
          fase: "detalle",
          categoria: base.categoria,
          proteccion_principal: base.proteccion_principal,
        }),
      });
      const d = (await r.json()) as { detalle?: Detalle };
      if (d.detalle) {
        setResultado((previo) => (previo ? { ...previo, ...d.detalle } : previo));
      }
    } catch {
      // Silencioso a propósito: el dictamen ya está en pantalla.
    } finally {
      setCargandoDetalle(false);
    }
  }

  /**
   * Trae el dictamen por fragmentos y lo va pintando. Es lo que convierte
   * veintidós segundos de pantalla muerta en texto que aparece solo.
   */
  async function pedirDictamen(texto: string, base: Analisis) {
    setDictando(true);
    try {
      const r = await fetch("/api/dictamen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: texto,
          categoria: base.categoria,
          proteccion_principal: base.proteccion_principal,
        }),
      });
      if (!r.ok || !r.body) return;
      const lector = r.body.getReader();
      const dec = new TextDecoder();
      let acumulado = "";
      for (;;) {
        const { done, value } = await lector.read();
        if (done) break;
        acumulado += dec.decode(value, { stream: true });
        setResultado((previo) => (previo ? { ...previo, explicacion: acumulado } : previo));
      }
    } catch {
      // El resto del resultado ya está en pantalla.
    } finally {
      setDictando(false);
    }
  }

  async function enviar() {
    if (!listo) {
      setError(
        "Cuéntanos un poco más para poder orientarte. Agrega qué creaste, cómo funciona o qué parte te interesa proteger.",
      );
      return;
    }
    setCargando(true);
    limpiarResultados();

    try {
      if (modo === "proteger") {
        // Primera fase: lo indispensable. Se muestra en cuanto llega.
        const r = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea: idea.trim(), fase: "rapida" }),
        });
        const d = (await r.json()) as Partial<RespuestaAnalisis> & { error?: string };
        if (!r.ok || !d.resultado) {
          setError(d.error ?? "No pudimos completar el análisis. Intenta de nuevo.");
          return;
        }
        setResultado(d.resultado);
        setDemo(Boolean(d.demo));
        setMotivoDemo(d.motivo);
        pedirDictamen(idea.trim(), d.resultado);
        pedirDetalle(idea.trim(), d.resultado);
      } else {
        const r = await fetch("/api/consulta", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pregunta: pregunta.trim() }),
        });
        const d = (await r.json()) as Partial<RespuestaConsulta> & { error?: string };
        if (!r.ok || !d.respuesta) {
          setError(d.error ?? "No pudimos responder en este momento. Intenta de nuevo.");
          return;
        }
        setConsulta(d as RespuestaConsulta);
      }
    } catch {
      setError("No hay conexión con el servidor. Revisa tu red e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  /** Vuelve al campo con el texto intacto, para corregirlo. */
  function editar() {
    analizador.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const campo = document.getElementById(modo === "proteger" ? "idea" : "problema");
    (campo as HTMLTextAreaElement | null)?.focus();
  }

  function limpiar() {
    setIdea("");
    setPregunta("");
    setEjemploActivo(null);
    limpiarResultados();
  }

  return (
    <>
      <p className="pi-trust">Orientación preliminar con fuentes oficiales de México</p>

      <header className="pi-hero">
        <div className="pi-shell pi-hero-grid">
          <div className="pi-hero-copy">
            <img
              className="pi-logo"
              src="/brand/pi-en-1-minuto-logo.png"
              alt="PI en 1 Minuto"
              width={2172}
              height={724}
            />
            <p className="pi-eyebrow">Propiedad intelectual, explicada en humano</p>
            <h1>Tu idea tomó tiempo. Entender cómo protegerla, sólo un minuto.</h1>
            <p>
              Cuéntanos qué creaste y recibe una ruta inicial, clara y accionable, para identificar
              la figura de protección que podría corresponderte ante el IMPI o el Indautor.
            </p>
            <p className="pi-micro">
              <span>Resultado en un minuto</span>
              <span>Sin términos legales</span>
              <span>Gratis</span>
            </p>
          </div>

          <div className="pi-analyzer" ref={analizador}>
            <p className="pi-analyzer-title">Comienza aquí</p>

            <SelectorModo modo={modo} onCambio={setModo} />

            {modo === "proteger" ? (
              <>
                <Textarea
                  id="idea"
                  label="¿Qué creaste y qué te interesa proteger?"
                  hint="Descríbelo como se lo contarías a una persona de confianza. No necesitas saber de leyes."
                  value={idea}
                  maxLength={MAXIMO}
                  placeholder="Ejemplo: creé una bebida de café con nombre, logotipo y un empaque original…"
                  contador={`${idea.length} / ${MAXIMO}`}
                  onChange={(e) => {
                    setIdea(e.target.value);
                    setEjemploActivo(null);
                  }}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") enviar();
                  }}
                />
              </>
            ) : (
              <Textarea
                id="problema"
                label="Describe brevemente qué está pasando"
                hint="Incluye qué creaste, quién lo está usando o reclamando y desde cuándo, si lo sabes."
                value={pregunta}
                maxLength={MAXIMO}
                placeholder="Ejemplo: alguien está vendiendo productos con mi logotipo sin permiso. ¿Qué opciones debería revisar?"
                contador={`${pregunta.length} / ${MAXIMO}`}
                onChange={(e) => {
                  setPregunta(e.target.value);
                  setEjemploActivo(null);
                }}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") enviar();
                }}
              />
            )}

            <p className="pi-aviso-datos">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2.6 16.4 5v5c0 4-2.9 6.4-6.4 7.4C6.5 16.4 3.6 14 3.6 10V5L10 2.6Z" />
              </svg>
              {AVISO_DATOS}
            </p>

            <div className="pi-ejemplos">
              <div className="pi-ejemplos-cabeza">
                <p className="pi-ejemplos-titulo" id="etiqueta-ejemplos">
                  {modo === "proteger" ? "O empieza con un ejemplo" : "Casos que solemos ver"}
                </p>
                <button type="button" className="pi-otros" onClick={otrosEjemplos}>
                  <span aria-hidden="true">⟳</span> Otros ejemplos
                </button>
              </div>
              <div className="pi-chips" role="group" aria-labelledby="etiqueta-ejemplos">
                {ejemplosVisibles.map((ejemplo) => (
                  <ExampleChip
                    key={ejemplo.etiqueta}
                    label={ejemplo.etiqueta}
                    selected={ejemploActivo === ejemplo.etiqueta}
                    onSelect={() => {
                      if (modo === "proteger") setIdea(ejemplo.texto);
                      else setPregunta(ejemplo.texto);
                      setEjemploActivo(ejemplo.etiqueta);
                      setError(null);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="pi-actions">
              <Button onClick={enviar} disabled={cargando || !listo}>
                {cargando
                  ? "Analizando…"
                  : modo === "proteger"
                    ? "Ver mi ruta sugerida"
                    : "Orientarme sobre este problema"}
              </Button>
              {(entrada || hayResultado) && !cargando && (
                <Button variant="tertiary" onClick={limpiar}>
                  Empezar de nuevo
                </Button>
              )}
            </div>

            <p className="pi-hint" style={{ marginTop: "12px", marginBottom: 0 }}>
              Necesitamos al menos {MINIMO} caracteres para orientarte.
            </p>

            {error && (
              <p className="pi-alert" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </header>

      <main>
        {(cargando || hayResultado) && (
          <section className="pi-section pi-section--surface">
            <div className="pi-shell pi-result" aria-live="polite">
              {cargando && (
                <Card>
                  <LoadingSteps />
                </Card>
              )}

              {resultado && !cargando && (
                <>
                  {demo && (
                    <p className="pi-demo">
                      {motivoDemo === "servicio"
                        ? "Modo demo: el servicio de análisis no respondió, así que se muestra un resultado simulado localmente."
                        : "Modo demo: resultado simulado localmente porque OPENROUTER_API_KEY no está configurada."}
                    </p>
                  )}

                  {resultado.plazo_critico && <PlazoCritico texto={resultado.plazo_critico} />}

                  <RecommendationCard
                    resultado={resultado}
                    tipo={ETIQUETAS_CATEGORIA[resultado.categoria]}
                    clase={CLASE_CATEGORIA[resultado.categoria]}
                    dictando={dictando}
                  />

                  {(resultado.elementos_protegibles.length > 0 ||
                    resultado.siguientes_pasos.length > 0) && (
                    <div className="pi-grid-2">
                      {resultado.elementos_protegibles.length > 0 && (
                        <Card title="Qué parte podrías proteger" icono="escudo" color="teal">
                          <ul className="pi-list">
                            {resultado.elementos_protegibles.map((x, i) => (
                              <li key={i}>{x}</li>
                            ))}
                          </ul>
                        </Card>
                      )}
                      {resultado.siguientes_pasos.length > 0 && (
                        <Card title="Tus próximos tres pasos" icono="pasos" color="navy">
                          <ol className="pi-list">
                            {resultado.siguientes_pasos.map((x, i) => (
                              <li key={i}>{x}</li>
                            ))}
                          </ol>
                        </Card>
                      )}
                    </div>
                  )}

                  {cargandoDetalle && (
                    <p className="pi-detalle-cargando" aria-live="polite">
                      <span className="pi-detalle-punto" aria-hidden="true" />
                      Preparando los pasos, los plazos y los límites de esta figura…
                    </p>
                  )}

                  <div className="pi-acordeones">
                    {resultado.que_no_protege.length > 0 && (
                      <Acordeon titulo="Qué no cubre esta figura" icono="escudo" color="orange">
                        <ul className="pi-list">
                          {resultado.que_no_protege.map((x, i) => (
                            <li key={i}>{x}</li>
                          ))}
                        </ul>
                      </Acordeon>
                    )}
                    {resultado.advertencias.length > 0 && (
                      <Acordeon titulo="Información que falta" icono="alerta" color="orange" abierto>
                        <ul className="pi-list">
                          {resultado.advertencias.map((x, i) => (
                            <li key={i}>{x}</li>
                          ))}
                        </ul>
                      </Acordeon>
                    )}
                    {resultado.plazos_clave.length > 0 && (
                      <Acordeon titulo="Plazos y vigencias" icono="reloj" color="teal">
                        <ul className="pi-list">
                          {resultado.plazos_clave.map((x, i) => (
                            <li key={i}>{x}</li>
                          ))}
                        </ul>
                      </Acordeon>
                    )}
                    {resultado.clases_niza.length > 0 && (
                      <Acordeon titulo="Clases de Niza probables" icono="capas" color="teal">
                        <ul className="pi-list">
                          {resultado.clases_niza.map((x, i) => (
                            <li key={i}>{x}</li>
                          ))}
                        </ul>
                      </Acordeon>
                    )}
                    {resultado.figuras_complementarias.length > 0 && (
                      <Acordeon titulo="Figuras complementarias" icono="capas" color="navy">
                        <ul className="pi-list">
                          {resultado.figuras_complementarias.map((x, i) => (
                            <li key={i}>{x}</li>
                          ))}
                        </ul>
                      </Acordeon>
                    )}
                  </div>

                  <div className="pi-actions">
                    <Button variant="secondary" onClick={editar}>
                      Editar mi descripción
                    </Button>
                    <BotonCopiar
                      texto={comoTexto(resultado, ETIQUETAS_CATEGORIA[resultado.categoria])}
                    />
                  </div>

                  <p className="pi-letra-chiquita">{LETRA_CHIQUITA}</p>
                  <AyudaProfesional
                    motivo={
                      resultado.requiere_profesional ? resultado.motivo_escalamiento : undefined
                    }
                  />
                </>
              )}

              {consulta && !cargando && (
                <>
                  {consulta.demo && (
                    <p className="pi-demo">
                      Modo demo: mostramos las disposiciones localizadas, sin redacción del modelo.
                    </p>
                  )}

                  <Card tone="info" title="Respuesta preliminar" icono="escudo" color="teal">
                    <Prosa texto={consulta.respuesta} />
                  </Card>

                  {consulta.fundamentos.length > 0 && (
                    <Acordeon titulo="Fuentes oficiales relacionadas" icono="capas" color="navy" abierto>
                      <Fundamentos lista={consulta.fundamentos} />
                    </Acordeon>
                  )}

                  <div className="pi-actions">
                    <Button variant="secondary" onClick={editar}>
                      Editar mi descripción
                    </Button>
                    <BotonCopiar
                      texto={`PI en 1 Minuto — respuesta preliminar\n\n${consulta.respuesta}\n\n${AVISO_LEGAL}\n\n${LETRA_CHIQUITA}`}
                    />
                  </div>

                  <p className="pi-letra-chiquita">{LETRA_CHIQUITA}</p>
                  <AyudaProfesional
                    motivo={
                      consulta.requiere_profesional ? consulta.motivo_escalamiento : undefined
                    }
                  />
                </>
              )}
            </div>
          </section>
        )}

        <section className="pi-section">
          <div className="pi-shell">
            <div className="pi-section-intro">
              <h2>De una idea suelta a una ruta clara</h2>
              <p>
                No necesitas decidir si lo tuyo es una marca, una patente o un derecho de autor.
                Empieza por contar qué hiciste; la herramienta te ayuda a ordenar las posibilidades.
              </p>
            </div>
            <div className="pi-grid-3">
              {[
                ["Cuéntanos", "Describe tu creación o problema con tus propias palabras."],
                ["Identificamos", "Relacionamos tu caso con posibles figuras de propiedad intelectual."],
                ["Actúa", "Recibe una ruta preliminar, próximos pasos y accesos a fuentes oficiales."],
              ].map(([titulo, texto], i) => (
                <article className="pi-card" key={titulo}>
                  <span className="pi-paso" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pi-section pi-section--surface">
          <div className="pi-shell">
            <div className="pi-section-intro">
              <h2>Distintas ideas se protegen de distintas maneras</h2>
              <p>
                Una misma creación puede necesitar más de una figura. Por eso analizamos sus
                componentes, no sólo el nombre que le das.
              </p>
            </div>
            <div className="pi-grid-3">
              {FAMILIAS.map((f) => (
                <article className="pi-categoria" key={f.nombre}>
                  <strong>{f.nombre}</strong>
                  <span>{f.ejemplo}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pi-section">
          <div className="pi-shell">
            <div className="pi-section-intro">
              <h2>Verifica y continúa en fuentes oficiales</h2>
              <p>
                Consulta los buscadores, clasificadores y servicios públicos relacionados con tu
                ruta.
              </p>
            </div>
            {GRUPOS_RECURSOS.map((grupo) => (
              <div className="pi-fuentes-grupo" key={grupo.titulo}>
                <h3>{grupo.titulo}</h3>
                <div className="pi-grid-3">
                  {grupo.urls.map((url) => {
                    const r = RECURSOS.find((x) => x.url === url);
                    return r ? <OfficialResourceLink key={url} {...r} /> : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="pi-footer">
        <div className="pi-shell">
          <p>
            PI en 1 Minuto ayuda a convertir una duda inicial en una ruta más clara para proteger
            ideas en México. Es una herramienta informativa: no sustituye la revisión de un
            profesional ni determina si una creación es registrable.
          </p>
          <p className="pi-footer-marcas">{AVISO_MARCAS}</p>
          <span className="pi-footer-firma">FGS</span>
        </div>
      </footer>
    </>
  );
}
