import { bivariateClassify } from "./bivariate.js";
import { drawLegend } from "./legend.js";
import { initTooltip, showTooltip, hideTooltip } from "./tooltip.js";

const TOPO_URL = "data/chile_adm1.topojson";
const DATA_URL = "data/chile_data.csv";
const REQUIRED_ID = "shapeID";

async function init() {
  const [topo, csvRaw] = await Promise.all([
    d3.json(TOPO_URL),
    d3.csv(DATA_URL, d3.autoType)
  ]);

  if (!topo?.objects) throw new Error("TopoJSON inválido o vacío");
  if (!csvRaw?.length) throw new Error("CSV vacío o no accesible");

  const objectKey = Object.keys(topo.objects)[0];
  const geojson = topojson.feature(topo, topo.objects[objectKey]);

  if (!geojson?.features?.length) throw new Error("No se pudieron extraer features del TopoJSON");

  const VAR_A = "x";
  const VAR_B = "y";
  const cols = Object.keys(csvRaw[0]);

  if (!cols.includes(REQUIRED_ID)) {
    throw new Error(`Falta columna '${REQUIRED_ID}' en CSV`);
  }
  if (!cols.includes(VAR_A) || !cols.includes(VAR_B)) {
    throw new Error(`Faltan columnas '${VAR_A}' y '${VAR_B}' en CSV`);
  }

  const { breaksA, breaksB, classified } = bivariateClassify(csvRaw, VAR_A, VAR_B);
  const dataMap = new Map(classified.map(d => [String(d[REQUIRED_ID]), d]));

  const container = document.getElementById("map");
  container.innerHTML = "";

  const wrapper = container.closest(".map-wrapper");
  const rect = wrapper.getBoundingClientRect();

  const width = Math.max(360, Math.floor(rect.width || 420));
  const height = Math.max(760, Math.floor(window.innerHeight * 0.82));

  const svg = d3.select("#map")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "100%");

  const padding = 20;

  const projection = d3.geoMercator()
    .fitExtent(
      [[padding, padding], [width - padding, height - padding]],
      geojson
    );

  const path = d3.geoPath(projection);

  initTooltip({ keyA: VAR_A, keyB: VAR_B });

  svg.append("g")
    .attr("class", "regions")
    .selectAll("path")
    .data(geojson.features)
    .join("path")
    .attr("d", path)
    .attr("fill-rule", "evenodd")
    .attr("clip-rule", "evenodd")
    .attr("fill", d => {
      const key = String(d.properties.shapeID);
      const record = dataMap.get(key);
      return record ? record.color : "#ddd8ce";
    })
    .attr("stroke", "#eae6de")
    .attr("stroke-width", 0.8)
    .attr("class", d => {
      const key = String(d.properties.shapeID);
      const record = dataMap.get(key);
      return record ? `region cell-${record.classA}-${record.classB}` : "region no-data";
    })
    .on("mouseenter", (event, d) => {
      const key = String(d.properties.shapeID);
      const record = dataMap.get(key);
      if (!record) return;
      d3.select(event.currentTarget)
        .attr("stroke", "#2a2a2a")
        .attr("stroke-width", 1.5);
      showTooltip(event, record);
    })
    .on("mousemove", (event, d) => {
      const key = String(d.properties.shapeID);
      const record = dataMap.get(key);
      if (record) showTooltip(event, record);
    })
    .on("mouseleave", (event) => {
      d3.select(event.currentTarget)
        .attr("stroke", "#eae6de")
        .attr("stroke-width", 0.8);
      hideTooltip();
    });

  drawLegend("#legend", {
    labelA: "Variable X",
    labelB: "Variable Y",
    onCellHover(classA, classB) {
      svg.selectAll(".region")
        .transition()
        .duration(120)
        .style("opacity", function () {
          return this.classList.contains(`cell-${classA}-${classB}`) ? 1 : 0.18;
        });
    },
    onCellLeave() {
      svg.selectAll(".region")
        .transition()
        .duration(120)
        .style("opacity", 1);
    }
  });

  const insight = document.getElementById("insight");
  if (insight) {
    insight.innerHTML =
      `Mapa bivariado de <strong>Chile</strong> por regiones.<br>` +
      `Registros: ${classified.length}.`;
  }

  const meta = document.getElementById("meta");
  if (meta) {
    meta.textContent =
      `${classified.length} regiones · Chile · X breaks: ${breaksA.map(b => b.toFixed(1)).join(", ")} · Y: ${breaksB.map(b => b.toFixed(1)).join(", ")}`;
  }
}

init().catch(err => {
  console.error(err);
  document.getElementById("map").innerHTML =
    `<p class="error" style="color:#c24e80">Error: ${err.message}</p>`;
});