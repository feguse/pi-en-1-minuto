#!/usr/bin/env python3
"""Regenera corpus/CURADURIA.md desde app/corpus.ts.

El documento de revisión no se escribe a mano: se deriva del código, para que
no pueda quedar describiendo un mapeo que ya cambió. Correr después de tocar
NUCLEARES:

    python3 corpus/curaduria.py
"""
import json, re, pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ARCHIVOS = {
    "LFPPI": "lfppi", "RLFPPI": "reglamento-lfppi",
    "LFDA": "lfda", "RLFDA": "reglamento-lfda",
    "LA": "ley-aduanera", "RGCE": "rgce",
    "LFVV": "variedades-vegetales", "RLFVV": "reglamento-variedades",
}
CORPUS = {s: json.loads((RAIZ / "corpus" / f"{f}.json").read_text("utf-8"))
          for s, f in ARCHIVOS.items()}

fuente = (RAIZ / "app" / "corpus.ts").read_text("utf-8")
presupuesto = int(re.search(r"const PRESUPUESTO = (\d+)", fuente).group(1))
bloque = fuente[fuente.index("const NUCLEARES"):fuente.index("const AMBITO")]
lib = (RAIZ / "app" / "lib.ts").read_text("utf-8")


def autoridad(figura: str) -> str:
    m = re.search(rf'"{re.escape(figura)}":\s*"([^"]+)"',
                  lib[lib.index("AUTORIDAD:"):], re.S)
    return m.group(1) if m else ""


# Cada figura, con sus rangos y el comentario que justifica cada rango.
figuras: list[tuple[str, list[tuple[str, int, int, str]]]] = []
for linea in bloque.splitlines():
    if (m := re.match(r'\s*"(.+?)":\s*\[', linea)):
        figuras.append((m.group(1), []))
        continue
    if (r := re.search(r'sigla: "(\w+)", desde: (\d+), hasta: (\d+)', linea)):
        nota = linea.split("//", 1)[1].strip() if "//" in linea else ""
        figuras[-1][1].append([r.group(1), int(r.group(2)), int(r.group(3)), nota])
        continue
    # comentario suelto: continúa la nota del rango anterior. Los que empiezan
    # con NOTA: son del curador, no de un artículo, y no se pegan a ninguno.
    if (c := re.match(r"\s*//\s?(?!NOTA:)(.+)", linea)) and figuras and figuras[-1][1]:
        figuras[-1][1][-1][3] = (figuras[-1][1][-1][3] + " " + c.group(1)).strip()

salida = ["""# Curaduría del corpus — artículos que se inyectan siempre

Generado por `corpus/curaduria.py`; no editar a mano. Propuesta de Claude,
**pendiente de tu revisión**. Cada figura inyecta estos artículos en TODAS las
consultas de esa figura, sin importar lo que escriba la persona: consumen
presupuesto fijo de contexto y desplazan al artículo que el caso concreto sí
necesitaba.

Criterio aplicado, derivado de tu corrección sobre el 171 y el 172:
**manda el artículo que cambia lo que la persona haría.** Eso incluye dos clases
que parecen opuestas y no lo son: el que habilita —le dice que su empaque, su
foto o su bordado sí cabe en la figura, y que por eso nunca lo va a preguntar
con esas palabras— y el que excluye o pone plazo. Queda fuera lo puramente
definitorio que el modelo ya sabe, y lo que la búsqueda por palabras sí puede
encontrar sola.

Para revisar, la pregunta por artículo es:
*¿esto decide casos, o solo los describe?*

---
"""]

for figura, rangos in figuras:
    salida.append(f"## {figura.capitalize()}\n")
    if (a := autoridad(figura)):
        salida.append(f"*Autoridad: {a}*\n")
    total = 0
    for sigla, desde, hasta, nota in rangos:
        for art in CORPUS[sigla]:
            if desde <= art["numero"] <= hasta:
                total += len(art["texto"])
                texto = " ".join(art["texto"].split())
                texto = re.sub(r"^Artículo [\d\w\s.]*?[.-]+\s*", "", texto)
                salida.append(f"- **{sigla} artículo {art['numero']}** — {nota}")
                salida.append(f"  > {texto[:180]}…")
    pct = total * 100 // presupuesto
    salida.append(f"\n*{len(rangos)} rangos, {total:,} de {presupuesto:,} "
                  f"caracteres del contexto ({pct}%).*\n")
    salida.append("**Tu revisión:** ¿quitar alguno? ¿agregar cuál?\n")
    salida.append("---\n")

(RAIZ / "corpus" / "CURADURIA.md").write_text("\n".join(salida), "utf-8")
print(f"CURADURIA.md regenerado: {len(figuras)} figuras")
