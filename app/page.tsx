"use client";

import { useState } from "react";
import {
  Acordeon,
  AyudaProfesional,
  BotonCopiar,
  Button,
  Card,
  ExampleChip,
  Fundamentos,
  LegalDisclaimer,
  LoadingSteps,
  OfficialResourceLink,
  RecommendationCard,
  SelectorModo,
  Textarea,
  type Modo,
  type RespuestaConsulta,
} from "./components";
import {
  AVISO_LEGAL,
  CLASE_CATEGORIA,
  EJEMPLOS,
  ETIQUETAS_CATEGORIA,
  RECURSOS,
  type Analisis,
  type RespuestaAnalisis,
} from "./lib";

const MAXIMO = 2000;
const MINIMO = 15;

/** Versión en texto plano, para llevarse la orientación a una consulta. */
function comoTexto(r: Analisis, tipo: string): string {
  const lista = (t: string, xs: string[]) =>
    xs.length ? `\n${t}\n${xs.map((x) => `  · ${x}`).join("\n")}` : "";
  return [
    "PI en 1 Minuto — orientación preliminar",
    "",
    `Ruta sugerida: ${r.proteccion_principal}`,
    `Clasificación preliminar: ${tipo}`,
    `Se tramita ante: ${r.autoridad}`,
    `Nivel de confianza: ${r.confianza}`,
    "",
    `Por qué: ${r.explicacion}`,
    lista("Qué podrías proteger:", r.elementos_protegibles),
    lista("Siguientes pasos:", r.siguientes_pasos),
    lista("Qué NO protege:", r.que_no_protege),
    lista("Plazos y vigencias:", r.plazos_clave),
    lista("Clases de Niza probables:", r.clases_niza),
    lista("Figuras complementarias:", r.figuras_complementarias),
    lista("Advertencias e información faltante:", r.advertencias),
    "",
    AVISO_LEGAL,
    "",
    "Generado en pi-en-1-minuto.vercel.app",
  ]
    .filter(Boolean)
    .join("\n");
}

export default function Pagina() {
  const [modo, setModo] = useState<Modo>("proteger");
  const [idea, setIdea] = useState("");
  const [pregunta, setPregunta] = useState("");
  const [ejemploActivo, setEjemploActivo] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Analisis | null>(null);
  const [demo, setDemo] = useState(false);
  const [motivoDemo, setMotivoDemo] = useState<string | undefined>(undefined);
  const [consulta, setConsulta] = useState<RespuestaConsulta | null>(null);

  const entrada = modo === "proteger" ? idea : pregunta;
  const listo = entrada.trim().length >= MINIMO;

  function limpiarResultados() {
    setResultado(null);
    setConsulta(null);
    setError(null);
  }

  async function enviar() {
    if (!listo) {
      setError(`Cuéntanos con un poco más de detalle (mínimo ${MINIMO} caracteres).`);
      return;
    }
    setCargando(true);
    limpiarResultados();

    try {
      if (modo === "proteger") {
        const r = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea: idea.trim() }),
        });
        const d = (await r.json()) as Partial<RespuestaAnalisis> & { error?: string };
        if (!r.ok || !d.resultado) {
          setError(d.error ?? "No pudimos completar el análisis. Intenta de nuevo.");
          return;
        }
        setResultado(d.resultado);
        setDemo(Boolean(d.demo));
        setMotivoDemo(d.motivo);
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

  function limpiar() {
    setIdea("");
    setPregunta("");
    setEjemploActivo(null);
    limpiarResultados();
  }

  return (
    <>

      <section className="pi-hero-band">
        <div className="pi-shell pi-hero-inner">
          <div className="pi-hero-copy">
            <p className="pi-eyebrow">Propiedad intelectual en México</p>
            <h1>Descubre una ruta inicial para proteger tu idea</h1>
            <p>
              Describe con tus palabras lo que creaste. En un minuto obtienes una orientación
              preliminar sobre qué figura de propiedad intelectual podrías usar para protegerlo,
              ante el IMPI o el Indautor.
            </p>
          </div>

          <div className="pi-logomark">
            <svg className="pi-anillo" viewBox="0 0 400 400" aria-hidden="true">
              <circle className="a1" cx="200" cy="200" r="184" />
              <circle className="a2" cx="200" cy="200" r="158" />
              <circle className="a3" cx="200" cy="200" r="134" />
            </svg>
            <img
              className="pi-logo-hero"
              src="/brand/pi-en-1-minuto-logo.png"
              alt="PI en 1 Minuto"
              width={2172}
              height={724}
            />
          </div>
        </div>
      </section>

      <main className="pi-shell pi-main">
        <SelectorModo
          modo={modo}
          onCambio={(m) => {
            setModo(m);
            limpiarResultados();
          }}
        />

        <Card className="pi-entrada">
          {modo === "proteger" ? (
            <>
              <Textarea
                id="idea"
                label="¿Qué creaste y qué parte te interesa proteger?"
                hint="Cuéntalo como se lo explicarías a un amigo. No necesitas términos legales."
                value={idea}
                maxLength={MAXIMO}
                placeholder="Por ejemplo: armé un taller de pan de masa madre, le puse nombre y diseñé un empaque distinto…"
                contador={`${idea.length} / ${MAXIMO}`}
                onChange={(e) => {
                  setIdea(e.target.value);
                  setEjemploActivo(null);
                }}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") enviar();
                }}
              />

              <p className="pi-hint" style={{ marginTop: "24px", marginBottom: 0 }} id="etiqueta-ejemplos">
                O empieza con un ejemplo
              </p>
              <div className="pi-chips" role="group" aria-labelledby="etiqueta-ejemplos">
                {EJEMPLOS.map((ejemplo, i) => (
                  <ExampleChip
                    key={ejemplo.etiqueta}
                    label={ejemplo.etiqueta}
                    selected={ejemploActivo === i}
                    onSelect={() => {
                      setIdea(ejemplo.texto);
                      setEjemploActivo(i);
                      setError(null);
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <Textarea
              id="problema"
              label="Describe tu problema"
              hint="Respondemos con los artículos vigentes de la LFPPI, la Ley Federal del Derecho de Autor y sus reglamentos. Si la respuesta no está ahí, te lo decimos."
              value={pregunta}
              maxLength={MAXIMO}
              placeholder="Por ejemplo: alguien está vendiendo playeras con mi logotipo y no le di permiso. ¿Qué puedo hacer?"
              contador={`${pregunta.length} / ${MAXIMO}`}
              onChange={(e) => setPregunta(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") enviar();
              }}
            />
          )}

          <div className="pi-actions">
            <Button onClick={enviar} disabled={cargando || !listo}>
              {cargando
                ? modo === "proteger"
                  ? "Analizando…"
                  : "Consultando…"
                : modo === "proteger"
                  ? "Analizar mi idea"
                  : "Consultar"}
            </Button>
            {(entrada || resultado || consulta) && !cargando && (
              <Button variant="tertiary" onClick={limpiar}>
                Empezar de nuevo
              </Button>
            )}
          </div>

          {error && (
            <p className="pi-alert" role="alert">
              {error}
            </p>
          )}
        </Card>

        {cargando && (
          <div className="pi-result">
            <LoadingSteps />
          </div>
        )}

        {resultado && !cargando && (
          <div className="pi-result" aria-live="polite">
            {demo && (
              <p className="pi-demo">
                {motivoDemo === "servicio"
                  ? "Modo demo: el servicio de análisis no respondió, así que se muestra un resultado simulado localmente."
                  : "Modo demo: resultado simulado localmente porque OPENROUTER_API_KEY no está configurada."}
              </p>
            )}

            <RecommendationCard
              resultado={resultado}
              tipo={ETIQUETAS_CATEGORIA[resultado.categoria]}
              clase={CLASE_CATEGORIA[resultado.categoria]}
            />

            <div className="pi-grid">
              <Card title="Qué podrías proteger" icono="escudo" color="teal">
                <ul className="pi-list">
                  {resultado.elementos_protegibles.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </Card>

              <Card title="Siguientes pasos" icono="pasos" color="navy">
                <ol className="pi-list">
                  {resultado.siguientes_pasos.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
              </Card>
            </div>

            <div className="pi-acordeones">
              {resultado.que_no_protege.length > 0 && (
                <Acordeon titulo="Qué NO protege" icono="escudo" color="rose">
                  <ul className="pi-list">
                    {resultado.que_no_protege.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </Acordeon>
              )}
              {resultado.plazos_clave.length > 0 && (
                <Acordeon titulo="Plazos y vigencias" icono="reloj" color="green">
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
                <Acordeon titulo="Figuras complementarias" icono="capas" color="violet">
                  <ul className="pi-list">
                    {resultado.figuras_complementarias.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </Acordeon>
              )}
              {resultado.advertencias.length > 0 && (
                <Acordeon titulo="Advertencias e información faltante" icono="alerta" color="orange" abierto>
                  <ul className="pi-list pi-list--warn">
                    {resultado.advertencias.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </Acordeon>
              )}
            </div>

            <div className="pi-actions">
              <BotonCopiar texto={comoTexto(resultado, ETIQUETAS_CATEGORIA[resultado.categoria])} />
            </div>

            <AyudaProfesional />
          </div>
        )}

        {consulta && !cargando && (
          <div className="pi-result" aria-live="polite">
            {consulta.demo && (
              <p className="pi-demo">
                Modo demo: mostramos las disposiciones localizadas, sin redacción del modelo.
              </p>
            )}

            <Card tone="info" title="Respuesta preliminar" icono="escudo" color="teal">
              <p>{consulta.respuesta}</p>
            </Card>

            {consulta.fundamentos.length > 0 && (
              <Acordeon titulo="Fundamento consultado" icono="capas" color="navy" abierto>
                <Fundamentos lista={consulta.fundamentos} />
              </Acordeon>
            )}

            <div className="pi-actions">
              <BotonCopiar texto={`PI en 1 Minuto — respuesta preliminar\n\n${consulta.respuesta}\n\n${AVISO_LEGAL}`} />
            </div>

            <AyudaProfesional />
          </div>
        )}

        <section className="pi-section">
          <h2>Verifica en fuentes oficiales</h2>
          <p className="pi-hint" style={{ marginTop: "8px" }}>
            Consulta directa a las herramientas públicas del IMPI y del Indautor.
          </p>
          <div className="pi-resources">
            {RECURSOS.map((recurso) => (
              <OfficialResourceLink key={recurso.url} {...recurso} />
            ))}
          </div>
        </section>

        <LegalDisclaimer texto={AVISO_LEGAL} />
      </main>

      <footer className="pi-footer">
        <div className="pi-shell pi-footer-inner">
          <span className="pi-firma">FGS</span>
        </div>
      </footer>
    </>
  );
}
