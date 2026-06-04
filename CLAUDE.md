# Tu Instagram → Web Profesional

Este proyecto convierte tu perfil de Instagram en una web de marca personal profesional.

## Comportamiento al iniciar

Cuando el usuario abra esta carpeta y escriba cualquier cosa (incluido "hola", "qué hago", "empezar"), responde con este mensaje de bienvenida:

> **Bienvenido al creador de webs desde Instagram**
>
> Voy a convertir tu perfil de Instagram en una web profesional de marca personal.
>
> Solo necesito tu **@handle de Instagram** para empezar. Yo me encargo del resto: descargo tus fotos, busco tus datos en redes, y genero la web.
>
> **¿Cuál es tu @ de Instagram?**

Después de eso, usa la skill `instagram-a-web` automáticamente.

## Qué hace Claude automáticamente
1. Entra a tu perfil de Instagram y descarga tus datos y fotos automáticamente
2. Busca tu presencia en otras redes (Threads, TikTok, YouTube, LinkedIn...)
3. Suma tus seguidores de todas las plataformas
4. Busca testimonios de tus clientes si los tienes publicados
5. Te pregunta lo que no puede encontrar solo (servicios, colores, email)
6. Genera una web premium y la abre en tu navegador

## Lo que necesitas tener a mano

- Tu @handle de Instagram
- A qué te dedicas y qué servicios ofreces
- Tu email de contacto
- Tus colores de marca (si los tienes; si no, Claude te propone opciones)

## Lo que genera

- Un archivo HTML profesional que se abre en cualquier navegador
- Hero con tu perfil de Instagram integrado (foto, stats, bio, tick verificado, mini grid de fotos)
- Tus fotos reales de Instagram en la galería
- Adaptado a tu tipo de marca personal (fotógrafo, coach, influencer, etc.)
- Se ve bien en móvil, tablet y escritorio
- Solo usa tus datos reales — nunca inventa información

## Sobre las dependencias

Antes de empezar, verifica si Node.js está instalado:
```bash
node --version 2>/dev/null && echo "Node.js OK" || echo "NO_NODE"
```

Si no tiene Node.js, dile:
> "Para poder acceder a tu Instagram automáticamente necesito Node.js. Es una instalación rápida de 2 minutos: ve a https://nodejs.org y descarga la versión LTS. Cuando lo tengas instalado, dime y seguimos.
>
> Si prefieres no instalarlo, no pasa nada — te pediré los datos directamente y la web quedará igual de bien."

Si tiene Node.js, instala Playwright automáticamente y sigue con el scraping. El usuario no tiene que hacer nada más.

## Si tienes imágenes extras

Puedes meter fotos adicionales (retratos, logo, portfolio) en la carpeta `assets/`. Claude las usará en la web.

## Después de generar

Dile a Claude qué quieres cambiar: colores, textos, secciones, fotos. Itera hasta que te guste.

## ⚠️ REGLAS CRÍTICAS DE RESPONSIVE MÓVIL — NO ROMPER

Las siguientes reglas fueron validadas y verificadas en producción. **Cualquier cambio futuro DEBE respetar estas restricciones** para que el sitio se vea correctamente en móvil:

### 1. Grids con minmax — SIEMPRE usar `min()`
```css
/* ✅ CORRECTO — se adapta a pantallas pequeñas */
grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));

/* ❌ NUNCA — rompe en móvil (<400px viewport) */
grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
```
Aplica a: `.ecosystem-grid`, `.showcase-grid`, y cualquier grid nuevo.

### 2. About Image Stack en móvil (≤900px)
- El contenedor `.about-image-stack` usa `height: 340px` en móvil
- `.about-img-main` → `width: 78%; height: 290px` (cabe dentro del contenedor)
- `.about-img-accent` → `width: 58%; height: 200px`
- Ambas mantienen `position: absolute` para el efecto de superposición
- **NUNCA** poner `height` de las imágenes mayor que el contenedor

### 3. Overflow horizontal
- `html` Y `body` tienen `overflow-x: hidden` — no quitar ninguno
- `.ecosystem-section` y `.showcase-section` tienen `overflow-x: hidden`
- Secciones `.section` en móvil tienen `max-width: 100vw; overflow: hidden`
- **NUNCA** crear elementos con ancho fijo > 300px sin media query

### 4. Paddings en móvil (≤900px)
- `.hero` → `padding: 100px 20px 80px`
- `.section` → `padding: 70px 20px`
- `.ecosystem-section` → `padding: 80px 16px`
- `.showcase-section` → `padding: 80px 16px`
- `.ecosystem-card` → `padding: 32px 24px`
- **NUNCA** usar padding lateral > 24px en secciones para móvil

### 5. Galería
- En móvil las 6 fotos se muestran (2 columnas × 3 filas)
- `.gallery-item:last-child` → `display: block` (NO `none`)

### 6. Hero bio texto
- En móvil lleva `word-break: break-word; overflow-wrap: break-word; max-width: 100%`
