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

const TEXTO_CONFIANZA: Record<
  Confianza,
  { etiqueta: string; detalle: string; barras: number }
> = {
  alto: {
    etiqueta: "Coincidencia clara",
    detalle:
      "Tu descripción contiene elementos suficientes para sugerir esta ruta como punto de partida.",
    barras: 3,
  },
  medio: {
    etiqueta: "Requiere más información",
    detalle:
      "Hay indicios de esta figura, pero faltan datos para distinguirla de otras opciones.",
    barras: 2,
  },
  bajo: {
    etiqueta: "Caso mixto",
    detalle:
      "Tu descripción reúne componentes que podrían protegerse por vías diferentes.",
    barras: 1,
  },
};

export function ConfidenceBadge({ nivel }: { nivel: Confianza }) {
  const { etiqueta, detalle, barras } = TEXTO_CONFIANZA[nivel];
  return (
    <div className="pi-conf">
      <span className="pi-conf-barras" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`pi-conf-barra${n <= barras ? " pi-conf-barra--on" : ""}`} />
        ))}
      </span>
      <span className="pi-conf-texto">
        <strong>{etiqueta}</strong>
        <span>{detalle}</span>
      </span>
    </div>
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
        <h3 className="pi-card-title">Nuestra lectura de tu caso</h3>
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

const PASOS = ["Identificando figuras", "Revisando autoridad", "Preparando próximos pasos"];

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

/**
 * Cierre de todo resultado. La divulgación del destino va ANTES del clic:
 * quien lo pulse ya sabe que sale a un despacho externo.
 */
export function AyudaProfesional() {
  return (
    <section className="pi-card pi-ayuda">
      <h3>¿Tu caso necesita una revisión profesional?</h3>
      <p>
        Esta herramienta ofrece orientación informativa. Si necesitas evaluar registrabilidad,
        estrategia o un conflicto concreto, puedes consultar a un especialista.
      </p>
      <p className="pi-ayuda-destino">
        El enlace abre el sitio de Panamericana de Patentes y Marcas, un despacho externo
        especializado en propiedad intelectual.
      </p>
      <div className="pi-actions">
        <a className="pi-btn pi-btn--primary" href={PPM} target="_blank" rel="noopener noreferrer">
          Conocer opciones de asesoría
          <span aria-hidden="true">↗</span>
          <span className="pi-sr-only">(se abre en una pestaña nueva)</span>
        </a>
      </div>
    </section>
  );
}

/* ---------- Acordeón ---------- */

/**
 * Detalle plegable. Usa <details> nativo: accesible por teclado y sin JS.
 */
export function Acordeon({
  titulo,
  icono,
  color = "teal",
  abierto = false,
  children,
}: {
  titulo: string;
  icono: Glifo;
  color?: ColorIcono;
  abierto?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="pi-acordeon" open={abierto}>
      <summary>
        <span className={`pi-ico pi-ico--${color}`} aria-hidden="true">
          <Icono nombre={icono} />
        </span>
        <span className="pi-acordeon-titulo">{titulo}</span>
        <span className="pi-acordeon-flecha" aria-hidden="true">
          ⌄
        </span>
      </summary>
      <div className="pi-acordeon-cuerpo">{children}</div>
    </details>
  );
}

/* ---------- BotonCopiar ---------- */

export function BotonCopiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <Button variant="secondary" onClick={copiar}>
      {copiado ? "Copiado ✓" : "Copiar orientación"}
    </Button>
  );
}

/* ---------- Selector de modo ---------- */

export type Modo = "proteger" | "problema";

export function SelectorModo({
  modo,
  onCambio,
}: {
  modo: Modo;
  onCambio: (m: Modo) => void;
}) {
  const opciones: { valor: Modo; etiqueta: string; pie: string }[] = [
    { valor: "proteger", etiqueta: "Quiero proteger algo", pie: "Creé algo y no sé qué figura me toca" },
    { valor: "problema", etiqueta: "Tengo un problema", pie: "Alguien usa lo mío, o me reclaman a mí" },
  ];
  return (
    <div className="pi-modos" role="tablist" aria-label="Qué necesitas">
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="tab"
          aria-selected={modo === o.valor}
          className="pi-modo"
          onClick={() => onCambio(o.valor)}
        >
          <span className="pi-modo-etiqueta">{o.etiqueta}</span>
          <span className="pi-modo-pie">{o.pie}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Tipos de la consulta libre ---------- */

export type Fundamento = {
  sigla: string;
  articulo: string;
  ordenamiento: string;
  ultima_reforma_dof: string | null;
  fuente: string;
  extracto: string;
};

export type RespuestaConsulta = {
  respuesta: string;
  fundamentos: Fundamento[];
  sin_sustento: boolean;
  demo: boolean;
};

/* ---------- Fundamentos ---------- */

export function Fundamentos({ lista }: { lista: Fundamento[] }) {
  return (
    <>
      <ul className="pi-fundamentos">
        {lista.map((f, i) => (
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
      <p className="pi-vigencia">
        Texto vigente conforme a la última reforma señalada. Verifícalo en la fuente antes de
        tomar una decisión.
      </p>
    </>
  );
}
