# 🇨🇱 Chile Bivariate Regional Map

Mapa bivariado interactivo de Chile por regiones, desarrollado con **D3.js** y **TopoJSON**, reutilizando y adaptando una plantilla de visualización territorial originalmente pensada para otro contexto geográfico.

Este proyecto forma parte de mi portafolio de **Data Science**, **visualización de datos** y **desarrollo de soluciones interactivas** orientadas al análisis territorial.

---

## 📌 Descripción

Este proyecto muestra un **mapa coroplético bivariado** de Chile a nivel regional (ADM1), donde el color permite representar simultáneamente **dos variables** sobre un mismo territorio.

La visualización reutiliza una arquitectura basada en:

- carga de geometrías geográficas
- unión de datos tabulares por identificador territorial
- clasificación bivariada
- renderizado interactivo con D3
- tooltip y leyenda reutilizables

---

## 🎯 Objetivo del proyecto

El objetivo principal fue:

- adaptar una plantilla de mapa bivariado existente
- reemplazar el mapa europeo por un mapa de Chile
- mantener la lógica visual y el estilo del diseño original
- construir una base reutilizable para futuros proyectos con datasets reales de Chile

---

## 🧰 Tecnologías utilizadas

- **HTML5**
- **CSS3**
- **JavaScript (ES Modules)**
- **D3.js**
- **TopoJSON**
- **Python HTTP Server** para entorno local

---

## 🗂️ Estructura del proyecto

```text
chile-bivariate-regional-map/
├── css/
│   └── style.css
├── data/
│   ├── chile_adm1.topojson
│   └── chile_data.csv
├── js/
│   ├── bivariate.js
│   ├── legend.js
│   ├── main.js
│   └── tooltip.js
├── index.html
└── README.md