"use client";

import { useState } from "react";
import {
  AVISO_LEGAL,
  EJEMPLOS,
  ETIQUETAS_CATEGORIA,
  RECURSOS,
  type Analisis,
  type RespuestaAnalisis,
} from "./lib";

const MAXIMO = 2000;

export default function Pagina() {
  const [idea, setIdea] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Analisis | null>(null);
  const [demo, setDemo] = useState(false);

  async function analizar() {
    const texto = idea.trim();
    if (texto.length < 15) {
      setError("Describe tu idea con un poco más de detalle (mínimo 15 caracteres).");
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
    } catch {
      setError("No hay conexión con el servidor. Revisa tu red e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  function limpiar() {
    setIdea("");
    setResultado(null);
    setError(null);
  }

  return (
    <main className="envoltura">
      <span className="marca">Orientación preliminar · México</span>
      <h1>
        PI en <span>1 minuto</span>
      </h1>
      <p className="subtitulo">Descubre una ruta inicial para proteger tu idea en México</p>

      <section className="tarjeta">
        <label className="pregunta" htmlFor="idea">
          ¿Qué creaste y qué parte te interesa proteger?
        </label>
        <textarea
          id="idea"
          value={idea}
          maxLength={MAXIMO}
          placeholder="Ejemplo: armé un taller de pan de masa madre, le puse nombre y diseñé un empaque distinto…"
          onChange={(evento) => setIdea(evento.target.value)}
          onKeyDown={(evento) => {
            if ((evento.metaKey || evento.ctrlKey) && evento.key === "Enter") analizar();
          }}
        />
        <div className="pie-campo">
          {idea.length} / {MAXIMO}
        </div>

        <p className="titulo-ejemplos">O empieza con un ejemplo</p>
        <div className="ejemplos">
          {EJEMPLOS.map((ejemplo) => (
            <button
              key={ejemplo}
              type="button"
              className="ejemplo"
              onClick={() => {
                setIdea(ejemplo);
                setError(null);
              }}
            >
              {ejemplo}
            </button>
          ))}
        </div>

        <div className="acciones">
          <button
            type="button"
            className="boton-principal"
            onClick={analizar}
            disabled={cargando || idea.trim().length < 15}
          >
            {cargando ? "Analizando…" : "Analizar mi idea"}
          </button>
          {(idea || resultado) && !cargando && (
            <button type="button" className="boton-texto" onClick={limpiar}>
              Empezar de nuevo
            </button>
          )}
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>

      {resultado && (
        <section className="resultado" aria-live="polite">
          {demo && (
            <p className="aviso-demo">
              Modo demo: resultado simulado localmente porque OPENROUTER_API_KEY no está
              configurada.
            </p>
          )}

          <article className="tarjeta">
            <div className="encabezado-resultado">
              <div>
                <p className="etiqueta">Protección principal sugerida</p>
                <p className="categoria">{resultado.proteccion_principal}</p>
                <p className="tipo">
                  Clasificación preliminar: {ETIQUETAS_CATEGORIA[resultado.categoria]}
                </p>
              </div>
              <span className={`confianza confianza-${resultado.confianza}`}>
                <span className="punto" aria-hidden="true" />
                Confianza: {resultado.confianza}
              </span>
            </div>
            <p className="explicacion">{resultado.explicacion}</p>
          </article>

          <div className="rejilla">
            <article className="tarjeta bloque">
              <h3>Qué podrías proteger</h3>
              <ul>
                {resultado.elementos_protegibles.map((elemento, i) => (
                  <li key={i}>{elemento}</li>
                ))}
              </ul>
            </article>

            <article className="tarjeta bloque">
              <h3>Tres siguientes pasos</h3>
              <ol>
                {resultado.siguientes_pasos.map((paso, i) => (
                  <li key={i}>{paso}</li>
                ))}
              </ol>
            </article>
          </div>

          <div className="rejilla">
            {resultado.figuras_complementarias.length > 0 && (
              <article className="tarjeta bloque">
                <h3>Figuras complementarias</h3>
                <ul>
                  {resultado.figuras_complementarias.map((figura, i) => (
                    <li key={i}>{figura}</li>
                  ))}
                </ul>
              </article>
            )}

            {resultado.advertencias.length > 0 && (
              <article className="tarjeta bloque advertencias">
                <h3>Advertencias e información faltante</h3>
                <ul>
                  {resultado.advertencias.map((advertencia, i) => (
                    <li key={i}>{advertencia}</li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        </section>
      )}

      <section className="recursos">
        <h2>Recursos oficiales</h2>
        <p className="nota">Consulta directa a las herramientas públicas del IMPI.</p>
        <div className="enlaces">
          {RECURSOS.map((recurso) => (
            <a
              key={recurso.url}
              className="enlace"
              href={recurso.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>{recurso.nombre}</strong>
              <span>{recurso.descripcion}</span>
              <em>Abrir sitio oficial →</em>
            </a>
          ))}
        </div>
      </section>

      <section className="aviso-legal">
        <strong>Aviso importante</strong>
        {AVISO_LEGAL}
      </section>

      <footer>PI en 1 minuto · Orientación preliminar de propiedad industrial</footer>
    </main>
  );
}
