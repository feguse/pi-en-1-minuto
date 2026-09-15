"use client";

import { useState } from "react";
import {
  Button,
  Card,
  ExampleChip,
  LegalDisclaimer,
  LoadingSteps,
  AyudaProfesional,
  ConsultaLibre,
  OfficialResourceLink,
  RecommendationCard,
  Textarea,
} from "./components";
import {
  AVISO_LEGAL,
  EJEMPLOS,
  ETIQUETAS_CATEGORIA,
  CLASE_CATEGORIA,
  RECURSOS,
  type Analisis,
  type RespuestaAnalisis,
} from "./lib";

const MAXIMO = 2000;
const MINIMO = 15;

export default function Pagina() {
  const [idea, setIdea] = useState("");
  const [ejemploActivo, setEjemploActivo] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Analisis | null>(null);
  const [demo, setDemo] = useState(false);
  const [motivoDemo, setMotivoDemo] = useState<string | undefined>(undefined);

  async function analizar() {
    const texto = idea.trim();
    if (texto.length < MINIMO) {
      setError(`Describe tu idea con un poco más de detalle (mínimo ${MINIMO} caracteres).`);
      return;
    }

    setCargando(true);
    setError(null);
    setResultado(null);

    try {
      const respuesta = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: texto }),
      });

      const datos = (await respuesta.json()) as Partial<RespuestaAnalisis> & { error?: string };

      if (!respuesta.ok || !datos.resultado) {
        setError(datos.error ?? "No pudimos completar el análisis. Intenta de nuevo.");
        return;
      }

      setResultado(datos.resultado);
      setDemo(Boolean(datos.demo));
      setMotivoDemo(datos.motivo);
    } catch {
      setError("No hay conexión con el servidor. Revisa tu red e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  function limpiar() {
    setIdea("");
    setEjemploActivo(null);
    setResultado(null);
    setError(null);
  }

  return (
    <>
      <header className="pi-header">
        <div className="pi-shell pi-header-inner">
          <img
            className="pi-logo"
            src="/brand/pi-en-1-minuto-logo.png"
            alt="PI en 1 Minuto"
            width={2172}
            height={724}
          />
          <p className="pi-header-note">Orientación preliminar · México</p>
        </div>
      </header>

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
        <Card>
          <Textarea
            id="idea"
            label="¿Qué creaste y qué parte te interesa proteger?"
            hint="Cuéntalo como se lo explicarías a un amigo. No necesitas términos legales."
            value={idea}
            maxLength={MAXIMO}
            placeholder="Por ejemplo: armé un taller de pan de masa madre, le puse nombre y diseñé un empaque distinto…"
            contador={`${idea.length} / ${MAXIMO}`}
            onChange={(evento) => {
              setIdea(evento.target.value);
              setEjemploActivo(null);
            }}
            onKeyDown={(evento) => {
              if ((evento.metaKey || evento.ctrlKey) && evento.key === "Enter") analizar();
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

          <div className="pi-actions">
            <Button onClick={analizar} disabled={cargando || idea.trim().length < MINIMO}>
              {cargando ? "Analizando…" : "Analizar mi idea"}
            </Button>
            {(idea || resultado) && !cargando && (
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
                  {resultado.elementos_protegibles.map((elemento, i) => (
                    <li key={i}>{elemento}</li>
                  ))}
                </ul>
              </Card>

              <Card title="Siguientes pasos" icono="pasos" color="navy">
                <ol className="pi-list">
                  {resultado.siguientes_pasos.map((paso, i) => (
                    <li key={i}>{paso}</li>
                  ))}
                </ol>
              </Card>
            </div>

            {(resultado.que_no_protege.length > 0 ||
              resultado.plazos_clave.length > 0 ||
              resultado.clases_niza.length > 0) && (
              <div className="pi-grid--tres">
                {resultado.que_no_protege.length > 0 && (
                  <Card title="Qué NO protege" icono="escudo" color="rose">
                    <ul className="pi-list">
                      {resultado.que_no_protege.map((limite, i) => (
                        <li key={i}>{limite}</li>
                      ))}
                    </ul>
                  </Card>
                )}

                {resultado.plazos_clave.length > 0 && (
                  <Card title="Plazos y vigencias" icono="reloj" color="green">
                    <ul className="pi-list">
                      {resultado.plazos_clave.map((plazo, i) => (
                        <li key={i}>{plazo}</li>
                      ))}
                    </ul>
                  </Card>
                )}

                {resultado.clases_niza.length > 0 && (
                  <Card title="Clases de Niza probables" icono="capas" color="teal">
                    <ul className="pi-list">
                      {resultado.clases_niza.map((clase, i) => (
                        <li key={i}>{clase}</li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            )}

            <div className="pi-grid">
              {resultado.figuras_complementarias.length > 0 && (
                <Card title="Figuras complementarias" icono="capas" color="violet">
                  <ul className="pi-list">
                    {resultado.figuras_complementarias.map((figura, i) => (
                      <li key={i}>{figura}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {resultado.advertencias.length > 0 && (
                <Card title="Advertencias e información faltante" icono="alerta" color="orange">
                  <ul className="pi-list pi-list--warn">
                    {resultado.advertencias.map((advertencia, i) => (
                      <li key={i}>{advertencia}</li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            <AyudaProfesional />
          </div>
        )}

        <ConsultaLibre />

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
          <span>PI en 1 Minuto · Orientación preliminar de propiedad intelectual</span>
          <span className="pi-firma">FGS</span>
        </div>
      </footer>
    </>
  );
}
