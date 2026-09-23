# Naturaqua · Sistema de gestión para sodería (demo)

Demo navegable del sistema de gestión para **Naturaqua**, desarrollada por **Metricslab Agency**.

## Qué incluye

- **Dashboard del dueño**: repartos del día, lo cobrado, lo pendiente de cobro, alertas, stock y clima.
- **Reparto y rutas**: recorridos por día y zona, mapa en vivo, orden automático de la ruta y alerta de clientes sin visitar.
- **Punto de partida**: el dueño marca su negocio (con el GPS del celular, tocando el mapa o arrastrando el pin). Las rutas se ordenan desde ahí.
- **Vista del repartidor** (para celular): entregas, pagos, "no estaba", "no entregado", GPS en vivo y cierre de ruta.
- **Clientes (CRM)**: ficha completa con historial de pedidos, pagos, incidencias y notas.
- **Cobranzas**, **Stock** con mínimos, **Dispensers** (mensualidades), **Producción/limpieza** por lotes.
- **WhatsApp**: plantillas y avisos con un clic.
- **Clima**: pronóstico de 7 días cruzado con las rutas y mapa del tiempo (lluvia, viento, temperatura, nubes, tormentas).
- Modo **claro/oscuro** y diseño adaptado a **celular, tablet y PC**.

## Publicarla en GitHub Pages

1. Creá un repositorio nuevo en GitHub (por ejemplo `naturaqua-demo`).
2. Subí **el contenido de esta carpeta** (tiene que quedar `index.html` en la raíz del repo).
3. En el repo: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. En 1 o 2 minutos queda online en `https://TU-USUARIO.github.io/naturaqua-demo/`.

> El GPS del celular solo funciona con `https`, y GitHub Pages ya lo trae.

## Notas

- Los datos son de ejemplo y se guardan en el navegador de cada dispositivo. El botón **Reiniciar demo** vuelve todo a cero.
- Precios, zonas, días de reparto y productos se cambian en `js/data.js`.
- Servicios externos gratuitos: mapas (OpenStreetMap/CARTO + Leaflet), clima (Open-Meteo) y mapa del tiempo (Windy).
