# PI en 1 minuto

Orientación preliminar sobre qué figura de propiedad industrial podría investigarse en México,
a partir de una descripción en lenguaje cotidiano.

Next.js (App Router) + TypeScript. Sin base de datos, sin autenticación, sin carga de archivos.
La llamada al modelo ocurre solo en el servidor, en `/api/analyze`.

## Estructura

```
app/
  page.tsx              Pantalla única (cliente)
  layout.tsx            Layout raíz
  globals.css           Estilos (azul oscuro + turquesa)
  lib.ts                Tipos, textos, validación y modo demo
  api/analyze/route.ts  Endpoint del servidor que llama a OpenRouter
```

## Ejecutar en local

```bash
npm install
cp .env.example .env.local   # opcional
npm run dev
```

Abre http://localhost:3000

Requiere Node.js 18.18 o superior.

### Modo demo

Si `OPENROUTER_API_KEY` **no** está definida, la app funciona igual: `/api/analyze` devuelve un
resultado simulado local (elegido por palabras clave) y la interfaz lo indica con un aviso.
Sirve para demostrar el flujo completo sin depender de la red.

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `OPENROUTER_API_KEY` | No | Clave de https://openrouter.ai/keys. Sin ella se activa el modo demo. |
| `OPENROUTER_MODEL` | No | Modelo de OpenRouter. Por defecto `openai/gpt-4o-mini`. |
| `OPENROUTER_SITE_URL` | No | Se envía como `HTTP-Referer` (atribución en OpenRouter). |
| `OPENROUTER_SITE_NAME` | No | Se envía como `X-Title`. |

La clave se lee únicamente con `process.env` dentro del endpoint del servidor; nunca se expone
al navegador.

## Desplegar en Vercel

1. Sube el proyecto a GitHub:

```bash
git init && git add -A && git commit -m "PI en 1 minuto" && git branch -M main
```

   Crea el repositorio en GitHub y haz `git remote add origin <url> && git push -u origin main`.

2. En https://vercel.com/new importa el repositorio. Vercel detecta Next.js automáticamente:
   no hay que cambiar el framework, el comando de build ni el directorio de salida.

3. En **Settings → Environment Variables** agrega `OPENROUTER_API_KEY` (y `OPENROUTER_MODEL` si
   quieres otro modelo). Si omites la clave, el despliegue funciona en modo demo.

4. Deploy. Si agregas variables después, vuelve a desplegar para que tomen efecto.

## Validación y manejo de errores

- Se pide al modelo un JSON con `response_format: json_schema`.
- `validarAnalisis()` normaliza la categoría y el nivel de confianza, recorta la explicación a
  80 palabras, limita el tamaño de las listas y rechaza respuestas incompletas.
- Si el JSON viene envuelto en bloques de código, se extrae el objeto.
- Errores de OpenRouter, de parseo y tiempo límite (25 s) devuelven un mensaje legible al usuario.

## Aviso

Esta orientación es informativa, no constituye asesoría jurídica, no garantiza que la creación
sea registrable y no reemplaza una búsqueda profesional.
