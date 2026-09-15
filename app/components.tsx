"use client";

/* Componentes reutilizables de PI en 1 Minuto.
   Todos comparten los tokens de app/globals.css: colores, radios,
   espaciado de 8 px, estados de foco y comportamiento responsive. */

import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import type { Analisis, Confianza } from "./lib";

/* ---------- Button ---------- */

type VarianteBoton = "primary" | "secondary" | "tertiary";

export function Button({
  variant = "primary",
  children,
  ...resto
}: { variant?: VarianteBoton; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`pi-btn pi-btn--${variant}`} {...resto}>
      {children}
    </button>
  );
}

/* ---------- Card ---------- */

export function Card({
  title,
  tone = "surface",
  icono,
  color = "teal",
  className = "",
  children,
}: {
  title?: string;
  tone?: "surface" | "info" | "flat";
  icono?: Glifo;
  color?: ColorIcono;
  className?: string;
  children: ReactNode;
}) {
  const modificador = tone === "info" ? " pi-card--info" : tone === "flat" ? " pi-card--flat" : "";
  return (
    <section className={`pi-card${modificador} ${className}`.trim()}>
      {title && icono && (
        <div className="pi-card-head">
          <span className={`pi-ico pi-ico--${color}`} aria-hidden="true">
            <Icono nombre={icono} />
          </span>
          <h3>{title}</h3>
        </div>
      )}
      {title && !icono && <h3 className="pi-card-title">{title}</h3>}
      {children}
    </section>
  );
}

/* ---------- Iconos ---------- */

export type Glifo = "escudo" | "pasos" | "capas" | "alerta" | "reloj";
export type ColorIcono = "teal" | "navy" | "orange" | "violet" | "green" | "rose";

const TRAZOS: Record<Glifo, ReactNode> = {
  escudo: <path d="M10 2.5 16.5 5v5c0 4-3 6.5-6.5 7.5C6.5 16.5 3.5 14 3.5 10V5L10 2.5Z" />,
  pasos: (
    <>
      <path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h9" />
    </>
  ),
  capas: (
    <>
      <path d="M10 2.8 17 6.5 10 10.2 3 6.5l7-3.7Z" />
      <path d="m3 10.6 7 3.7 7-3.7" />
    </>
  ),
  alerta: (
    <>
      <path d="M10 3.2 17.5 16.4h-15L10 3.2Z" />
      <path d="M10 8v3.6M10 14.1v.1" />
    </>
  ),
  reloj: (
    <>
      <circle cx="10" cy="11" r="6.4" />
      <path d="M10 7.8V11l2.2 1.4M8 2.8h4" />
    </>
  ),
};

export function Icono({ nombre }: { nombre: Glifo }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {TRAZOS[nombre]}
    </svg>
  );
}

/* ---------- Badge ---------- */

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "info" | "accent";
  children: ReactNode;
}) {
  const modificador = tone === "neutral" ? "" : ` pi-badge--${tone}`;
  return <span className={`pi-badge${modificador}`}>{children}</span>;
}

/* ---------- Input ---------- */

export function Input({
  label,
  id,
  hint,
  ...resto
}: { label: string; id: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="pi-field">
      <label className="pi-label" htmlFor={id}>
        {label}
      </label>
      {hint && <p className="pi-hint">{hint}</p>}
      <input id={id} className="pi-input" {...resto} />
    </div>
  );
}

/* ---------- Textarea ---------- */

export function Textarea({
  label,
  id,
  hint,
  contador,
  ...resto
}: {
  label: string;
  id: string;
  hint?: string;
  contador?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="pi-field">
      <label className="pi-label" htmlFor={id}>
        {label}
      </label>
      {hint && <p className="pi-hint">{hint}</p>}
      <textarea id={id} className="pi-textarea" {...resto} />
      {contador && (
        <p className="pi-field-foot">
          <span />
          <span aria-hidden="true">{contador}</span>
        </p>
      )}
    </div>
  );
}

/* ---------- ExampleChip ---------- */

export function ExampleChip({
  label,
  selected = false,
  onSelect,
}: {
  label: string;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" className="pi-chip" aria-pressed={selected} onClick={onSelect}>
      {label}
    </button>
  );
}

/* ---------- ConfidenceBadge ---------- */

const TEXTO_CONFIANZA: Record<Confianza, { etiqueta: string; barras: number }> = {
  alto: { etiqueta: "Confianza alta", barras: 3 },
  medio: { etiqueta: "Confianza media", barras: 2 },
  bajo: { etiqueta: "Confianza baja", barras: 1 },
};

export function ConfidenceBadge({ nivel }: { nivel: Confianza }) {
  const { etiqueta, barras } = TEXTO_CONFIANZA[nivel];
  return (
    <span className="pi-badge">
      <span className="pi-conf">
        <span className="pi-conf-bars" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <span key={n} className={`pi-conf-bar${n <= barras ? " pi-conf-bar--on" : ""}`} />
          ))}
        </span>
        {etiqueta}
      </span>
    </span>
  );
}

/* ---------- RecommendationCard ---------- */

export function RecommendationCard({
  resultado,
  tipo,
  clase,
}: {
  resultado: Analisis;
  tipo: string;
  clase: string;
}) {
  return (
    <Card tone="info" className={`pi-reco ${clase}`}>
      <div className="pi-reco-head">
        <div>
          <p className="pi-reco-label">Ruta preliminar sugerida</p>
          <h2>{resultado.proteccion_principal}</h2>
          <p className="pi-reco-kind">Clasificación preliminar: {tipo}</p>
          <p className="pi-autoridad">Se tramita ante: {resultado.autoridad}</p>
        </div>
        <ConfidenceBadge nivel={resultado.confianza} />
      </div>
      <div className="pi-reco-why">
        <h3 className="pi-card-title">Por qué</h3>
        <p>{resultado.explicacion}</p>
      </div>
    </Card>
  );
}

/* ---------- OfficialResourceLink ---------- */

export function OfficialResourceLink({
  nombre,
  descripcion,
  url,
}: {
  nombre: string;
  descripcion: string;
  url: string;
}) {
  return (
    <a className="pi-resource" href={url} target="_blank" rel="noopener noreferrer">
      <span className="pi-resource-name">
        {nombre}
        <span aria-hidden="true">↗</span>
        <span className="pi-sr-only">(se abre en una pestaña nueva)</span>
      </span>
      <span className="pi-resource-desc">{descripcion}</span>
    </a>
  );
}

/* ---------- LegalDisclaimer ---------- */

export function LegalDisclaimer({ texto }: { texto: string }) {
  return (
    <aside className="pi-legal">
      <svg
        className="pi-legal-icon"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 9v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="10" cy="6.2" r="1" fill="currentColor" />
      </svg>
      <p>
        <strong>Aviso</strong>
        {texto}
      </p>
    </aside>
  );
}

/* ---------- LoadingSteps ---------- */

const PASOS = ["Entendiendo tu idea", "Identificando opciones", "Preparando la ruta"];

export function LoadingSteps() {
  const [activo, setActivo] = useState(0);

  useEffect(() => {
    const reducido =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducido) return;

    const id = setInterval(() => {
      setActivo((n) => (n < PASOS.length - 1 ? n + 1 : n));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="pi-loading-card">
      <div className="pi-loading" aria-live="polite">
        <svg className="pi-arc" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
          <circle className="pi-arc-track" cx="28" cy="28" r="24" />
          <circle className="pi-arc-run" cx="28" cy="28" r="24" />
          <circle className="pi-arc-run2" cx="28" cy="28" r="24" />
        </svg>
        <ol className="pi-steps">
          {PASOS.map((paso, i) => (
            <li
              key={paso}
              className={`pi-step${i === activo ? " pi-step--active" : ""}${
                i < activo ? " pi-step--done" : ""
              }`}
            >
              <span className="pi-step-dot" aria-hidden="true">
                {i < activo ? "✓" : ""}
              </span>
              {paso}
            </li>
          ))}
        </ol>
      </div>
      <p className="pi-sr-only">Analizando tu idea, espera un momento.</p>
    </Card>
  );
}

/* ---------- AyudaProfesional ---------- */

const PPM = "https://www.ppm.com.mx/";

/** Cierre de todo resultado: ofrece acompañamiento humano sin imponerlo. */
export function AyudaProfesional({ compacto = false }: { compacto?: boolean }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <Card tone={compacto ? "flat" : "surface"} className="pi-ayuda">
      {!abierto ? (
        <div className="pi-ayuda-pregunta">
          <p>
            <strong>¿Tienes más dudas? ¿Necesitas ayuda profesional?</strong>
            <span>
              Esta orientación es un punto de partida. Un abogado puede revisar tu caso concreto.
            </span>
          </p>
          <div className="pi-ayuda-botones">
            <Button onClick={() => setAbierto(true)}>Sí, quiero ayuda</Button>
            <Button variant="tertiary" onClick={() => setAbierto(false)}>
              Ahora no
            </Button>
          </div>
        </div>
      ) : (
        <div className="pi-ayuda-respuesta">
          <p>
            <strong>Panamericana de Patentes y Marcas</strong>
            <span>
              Despacho mexicano especializado en propiedad intelectual: marcas, patentes, litigio y
              aduanas.
            </span>
          </p>
          <a className="pi-btn pi-btn--primary" href={PPM} target="_blank" rel="noopener noreferrer">
            Ir a ppm.com.mx
            <span aria-hidden="true">↗</span>
            <span className="pi-sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </div>
      )}
    </Card>
  );
}

/* ---------- ConsultaLibre ---------- */

type Fundamento = {
  sigla: string;
  articulo: string;
  ordenamiento: string;
  ultima_reforma_dof: string | null;
  fuente: string;
  extracto: string;
};

type RespuestaConsulta = {
  respuesta: string;
  fundamentos: Fundamento[];
  sin_sustento: boolean;
  demo: boolean;
};

const MINIMO_CONSULTA = 15;

/**
 * Segunda vía de entrada: en lugar de describir una creación, la persona
 * plantea un problema. Se responde con los artículos vigentes del corpus.
 */
export function ConsultaLibre() {
  const [pregunta, setPregunta] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datos, setDatos] = useState<RespuestaConsulta | null>(null);

  async function preguntar() {
    const texto = pregunta.trim();
    if (texto.length < MINIMO_CONSULTA) {
      setError(`Cuéntanos con un poco más de detalle (mínimo ${MINIMO_CONSULTA} caracteres).`);
      return;
    }
    setCargando(true);
    setError(null);
    setDatos(null);
    try {
      const r = await fetch("/api/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta: texto }),
      });
      const d = (await r.json()) as Partial<RespuestaConsulta> & { error?: string };
      if (!r.ok || !d.respuesta) {
        setError(d.error ?? "No pudimos responder en este momento. Intenta de nuevo.");
        return;
      }
      setDatos(d as RespuestaConsulta);
    } catch {
      setError("No hay conexión con el servidor. Revisa tu red e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="pi-section">
      <h2>¿Tienes un problema en materia de PI? Cuéntanos</h2>
      <p className="pi-hint" style={{ marginTop: "8px" }}>
        Respondemos con los artículos vigentes de la LFPPI, la Ley Federal del Derecho de Autor y
        sus reglamentos. Si la respuesta no está ahí, te lo decimos.
      </p>

      <Card className="pi-consulta">
        <Textarea
          id="consulta"
          label="Describe tu problema"
          value={pregunta}
          maxLength={2000}
          placeholder="Por ejemplo: alguien está vendiendo playeras con mi logotipo y no le di permiso. ¿Qué puedo hacer?"
          onChange={(e) => setPregunta(e.target.value)}
        />
        <div className="pi-actions">
          <Button onClick={preguntar} disabled={cargando || pregunta.trim().length < MINIMO_CONSULTA}>
            {cargando ? "Consultando…" : "Consultar"}
          </Button>
        </div>
        {error && (
          <p className="pi-alert" role="alert">
            {error}
          </p>
        )}
      </Card>

      {datos && (
        <div className="pi-result" aria-live="polite">
          <Card tone="info" icono="escudo" color="teal" title="Respuesta preliminar">
            <p>{datos.respuesta}</p>
          </Card>

          {datos.fundamentos.length > 0 && (
            <Card title="Fundamento consultado" icono="capas" color="navy">
              <ul className="pi-fundamentos">
                {datos.fundamentos.map((f, i) => (
                  <li key={i}>
                    <a href={f.fuente} target="_blank" rel="noopener noreferrer">
                      {f.sigla} {f.articulo}
                    </a>
                    <span className="pi-fundamento-meta">
                      {f.ordenamiento}
                      {f.ultima_reforma_dof ? ` · última reforma DOF ${f.ultima_reforma_dof}` : ""}
                    </span>
                    <span className="pi-fundamento-texto">{f.extracto}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <AyudaProfesional />
        </div>
      )}
    </section>
  );
}
