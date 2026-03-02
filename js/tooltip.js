let tooltipEl = null;

let tooltipConfig = {
  keyA: "x",
  keyB: "y",
  keySig: "cambio_pobreza_significativo_95",
  labelA: "Pobreza 2024",
  labelB: "Cambio 2022–2024",
  labelSig: "Significancia 95%",
  nameKey: "name"
};

function formatearNumero(valor, decimales = 1) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return "Sin dato";
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(n);
}

function formatearPorcentaje(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return "Sin dato";
  return `${formatearNumero(n, 1)} %`;
}

function formatearPuntosPorcentuales(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return "Sin dato";

  const texto = formatearNumero(Math.abs(n), 1);
  if (n > 0) return `+${texto} pp`;
  if (n < 0) return `-${texto} pp`;
  return `0,0 pp`;
}

function formatearSignificancia(valor) {
  const v = String(valor ?? "").trim().toLowerCase();

  if (["si", "sí", "significativa", "true", "1"].includes(v)) {
    return "Significativa";
  }

  if (["no", "no significativa", "false", "0"].includes(v)) {
    return "No significativa";
  }

  return "Sin dato";
}

export function initTooltip(config = {}) {
  tooltipConfig = { ...tooltipConfig, ...config };

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.className = "tooltip";
    tooltipEl.style.position = "fixed";
    tooltipEl.style.pointerEvents = "none";
    tooltipEl.style.opacity = "0";
    tooltipEl.style.zIndex = "9999";
    document.body.appendChild(tooltipEl);
  }
}

export function showTooltip(event, datum) {
  if (!tooltipEl) return;

  const regionName =
    datum?.[tooltipConfig.nameKey] ||
    datum?.name ||
    datum?.nombre ||
    "Región sin nombre";

  const valorA = formatearPorcentaje(datum?.[tooltipConfig.keyA]);
  const valorB = formatearPuntosPorcentuales(datum?.[tooltipConfig.keyB]);
  const valorSig = formatearSignificancia(datum?.[tooltipConfig.keySig]);

  tooltipEl.innerHTML = `
    <div class="tooltip-card">
      <div class="tooltip-title">${regionName}</div>

      <div class="tooltip-row">
        <span>${tooltipConfig.labelA}</span>
        <strong>${valorA}</strong>
      </div>

      <div class="tooltip-row">
        <span>${tooltipConfig.labelB}</span>
        <strong class="${Number(datum?.[tooltipConfig.keyB]) <= 0 ? "tooltip-good" : "tooltip-bad"}">${valorB}</strong>
      </div>

      <div class="tooltip-row">
        <span>${tooltipConfig.labelSig}</span>
        <strong>${valorSig}</strong>
      </div>
    </div>
  `;

  const offset = 16;
  tooltipEl.style.left = `${event.clientX + offset}px`;
  tooltipEl.style.top = `${event.clientY + offset}px`;
  tooltipEl.style.opacity = "1";
}

export function hideTooltip() {
  if (!tooltipEl) return;
  tooltipEl.style.opacity = "0";
}
