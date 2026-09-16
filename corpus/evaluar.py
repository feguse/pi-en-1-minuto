#!/usr/bin/env python3
"""
Evalúa la recuperación del corpus contra el banco de casos, SIN llamar al
modelo. Mide lo que es determinista: qué figura preclasifica y qué artículos
se inyectan. Ahí estuvieron los tres errores encontrados el 15-09-2026.

Uso:  python3 corpus/evaluar.py
"""
import json, glob, re, math, unicodedata, os
from collections import Counter

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def norm(t):
    return "".join(c for c in unicodedata.normalize("NFD", t)
                   if unicodedata.category(c) != "Mn").lower()

def cargar_corpus():
    docs = []
    for f in sorted(glob.glob(os.path.join(RAIZ, "corpus", "*.json"))):
        if "niza" in f or "banco" in f:
            continue
        docs += json.load(open(f, encoding="utf-8"))
    return docs

def leer_pistas():
    """Lee las PISTAS directamente de lib.ts para no duplicar criterio."""
    s = open(os.path.join(RAIZ, "app", "lib.ts"), encoding="utf-8").read()
    b = s[s.index("const PISTAS"):s.index("/**\n * Clasificación barata")]
    out = []
    for m in re.finditer(r'categoria:\s*"([^"]+)",\s*\n(?:\s*//[^\n]*\n)*\s*palabras:\s*\[([^\]]*)\]', b):
        out.append((m.group(1), re.findall(r'"([^"]+)"', m.group(2))))
    return out

def contiene(texto, frase):
    return re.search(rf"(^|[^a-z0-9ñ]){re.escape(frase)}([^a-z0-9ñ]|$)", texto) is not None

def preclasificar(texto, pistas):
    n = norm(texto)
    hits = [c for c, ps in pistas if any(contiene(n, p) for p in ps)]
    if not hits or len(hits) >= 3:
        return "combinacion de varias"
    return hits[0]

def main():
    docs = cargar_corpus()
    pistas = leer_pistas()
    banco = json.load(open(os.path.join(RAIZ, "corpus", "banco-casos.json"), encoding="utf-8"))

    aciertos, fallos = 0, []
    for c in banco:
        got = preclasificar(c["texto"], pistas)
        if got == c["figura_esperada"]:
            aciertos += 1
        else:
            fallos.append((c["etiqueta"], c["figura_esperada"], got))

    total = len(banco)
    revisados = sum(1 for c in banco if c.get("revisado_por_abogado"))
    print(f"\n  BANCO DE CASOS — {total} casos, {revisados} revisados por abogado")
    print(f"  Preclasificación: {aciertos}/{total} = {aciertos/total*100:.0f}%\n")
    if fallos:
        print("  Fallos:")
        for e, esp, got in fallos:
            print(f"    {e:28} esperaba {esp[:26]:26} obtuvo {got}")
    if revisados < total:
        print(f"\n  AVISO: {total-revisados} casos sin revisar por abogado.")
        print("  El porcentaje mide contra expectativas propuestas por la máquina,")
        print("  no contra criterio jurídico. Sirve para detectar regresiones,")
        print("  no para afirmar que la herramienta acierta.")

if __name__ == "__main__":
    main()
