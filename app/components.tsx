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
  className = "",
  children,
}: {
  title?: string;
  tone?: "surface" | "info" | "flat";
  className?: string;
  children: ReactNode;
}) {
  const modificador = tone === "info" ? " pi-card--info" : tone === "flat" ? " pi-card--flat" : "";
  return (
    <section className={`pi-card${modificador} ${className}`.trim()}>
      {title && <h3 className="pi-card-title">{title}</h3>}
      {children}
    </section>
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
}: {
  resultado: Analisis;
  tipo: string;
}) {
  return (
    <Card tone="info" className="pi-reco">
      <div className="pi-reco-head">
        <div>
          <p className="pi-reco-label">Ruta preliminar sugerida</p>
          <h2>{resultado.proteccion_principal}</h2>
          <p className="pi-reco-kind">Clasificación preliminar: {tipo}</p>
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
