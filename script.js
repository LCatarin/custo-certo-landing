const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const percent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

const fields = {
  averagePrice: document.querySelector("#averagePrice"),
  appointments: document.querySelector("#appointments"),
  fixedCost: document.querySelector("#fixedCost"),
  variableCost: document.querySelector("#variableCost"),
  taxRate: document.querySelector("#taxRate"),
  professionalShare: document.querySelector("#professionalShare"),
  desiredProfit: document.querySelector("#desiredProfit"),
  priceAdjustment: document.querySelector("#priceAdjustment"),
  diagnosticStatus: document.querySelector("#diagnosticStatus"),
  statusLabel: document.querySelector("#statusLabel"),
  statusText: document.querySelector("#statusText"),
  estimatedMargin: document.querySelector("#estimatedMargin"),
  grossRevenue: document.querySelector("#grossRevenue"),
  totalCost: document.querySelector("#totalCost"),
  estimatedProfit: document.querySelector("#estimatedProfit"),
  costPerVisit: document.querySelector("#costPerVisit"),
  suggestedPrice: document.querySelector("#suggestedPrice"),
  breakEvenVisits: document.querySelector("#breakEvenVisits"),
  adjustedPrice: document.querySelector("#adjustedPrice"),
  scenarioText: document.querySelector("#scenarioText"),
};

const modal = document.querySelector("#leadModal");
const leadForm = document.querySelector("#leadForm");
const leadIntent = document.querySelector("#leadIntent");
const leadGreeting = document.querySelector("#leadGreeting");
const tabPanels = document.querySelectorAll("[data-tab-panel]");
const tabTriggers = document.querySelectorAll("[data-tab-target]");
const topTabs = document.querySelectorAll(".top-tab[data-tab-target]");
const tabIds = new Set([...tabPanels].map((panel) => panel.dataset.tabPanel));

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const demoProcedures = {
  consulta: {
    name: "Consulta médica particular",
    shortName: "Consulta médica",
    defaultVolume: 120,
    basePrice: 260,
    professionalCost: 82,
    professionalLabel: "Tempo profissional médico",
    fixedMonthly: 6200,
    taxRate: 0.08,
    materials: [
      { name: "Luvas e descartáveis", cost: 12, trend: 0.14, supplier: "Fornecedor atual" },
      { name: "Sistema de agenda", cost: 5, trend: 0.03, supplier: "SaaS clínico" },
      { name: "Impressos e consentimentos", cost: 1, trend: 0.06, supplier: "Gráfica local" },
    ],
  },
  fisio: {
    name: "Sessão de fisioterapia",
    shortName: "Fisioterapia",
    defaultVolume: 180,
    basePrice: 150,
    professionalCost: 52,
    professionalLabel: "Tempo profissional fisioterapeuta",
    fixedMonthly: 5200,
    taxRate: 0.08,
    materials: [
      { name: "Eletrodos e bandagens", cost: 6, trend: 0.18, supplier: "Distribuidor A" },
      { name: "Cremes e descartáveis", cost: 4, trend: 0.11, supplier: "Distribuidor B" },
      { name: "Lavanderia e higienização", cost: 3, trend: 0.07, supplier: "Serviço local" },
    ],
  },
  vet: {
    name: "Procedimento veterinário",
    shortName: "Veterinário",
    defaultVolume: 90,
    basePrice: 180,
    professionalCost: 48,
    professionalLabel: "Tempo profissional veterinário",
    fixedMonthly: 4200,
    taxRate: 0.08,
    materials: [
      { name: "Anestésico e medicação", cost: 22, trend: 0.22, supplier: "Fornecedor vet" },
      { name: "Seringas e descartáveis", cost: 9, trend: 0.16, supplier: "Distribuidor A" },
      { name: "Higienização de sala", cost: 7, trend: 0.08, supplier: "Equipe interna" },
    ],
  },
};

const demoChannels = {
  particular: { label: "Particular", multiplier: 1 },
  pacote: { label: "Pacote recorrente", multiplier: 0.92 },
  convenio: { label: "Convênio ou contrato", multiplier: 0.72 },
};

const demoModuleTitles = {
  operacao: "Operação",
  atendimentos: "Atendimentos",
  insumos: "Insumos",
  relatorios: "Relatórios",
};

const demoInitialVisits = [
  { time: "08:20", service: "Consulta médica", amount: 260, status: "registrado" },
  { time: "09:10", service: "Consulta médica", amount: 260, status: "registrado" },
  { time: "10:40", service: "Retorno monitorado", amount: 160, status: "registrado" },
  { time: "14:30", service: "Consulta médica", amount: 260, status: "registrado" },
];

let demoVisitCount = 18;
let demoVisitLog = [...demoInitialVisits];

const demoElements = {
  moduleButtons: document.querySelectorAll("[data-demo-module]"),
  moduleScreens: document.querySelectorAll("[data-demo-screen]"),
  procedure: document.querySelector("#demoProcedure"),
  channel: document.querySelector("#demoChannel"),
  volume: document.querySelector("#demoVolume"),
  priceOverride: document.querySelector("#demoPriceOverride"),
  supplyVariation: document.querySelector("#demoSupplyVariation"),
  supplyVariationLabel: document.querySelector("#demoSupplyVariationLabel"),
  registerVisit: document.querySelector("#demoRegisterVisit"),
  resetScenario: document.querySelector("#demoResetScenario"),
  registerFeedback: document.querySelector("#demoRegisterFeedback"),
  appTitle: document.querySelector("#demoAppTitle"),
  todayBadge: document.querySelector("#demoTodayBadge"),
  healthCard: document.querySelector("#demoHealthCard"),
  healthLabel: document.querySelector("#demoHealthLabel"),
  healthText: document.querySelector("#demoHealthText"),
  serviceTitle: document.querySelector("#demoServiceTitle"),
  serviceMeta: document.querySelector("#demoServiceMeta"),
  metricRevenue: document.querySelector("#demoMetricRevenue"),
  metricMargin: document.querySelector("#demoMetricMargin"),
  metricProfit: document.querySelector("#demoMetricProfit"),
  metricCost: document.querySelector("#demoMetricCost"),
  metricBreakeven: document.querySelector("#demoMetricBreakeven"),
  metricVisits: document.querySelector("#demoMetricVisits"),
  costPerVisit: document.querySelector("#demoCostPerVisit"),
  marginText: document.querySelector("#demoMarginText"),
  appComposition: document.querySelector("#demoAppComposition"),
  compositionList: document.querySelector("#demoCompositionList"),
  supplyTable: document.querySelector("#demoSupplyTable"),
  supplyStatus: document.querySelector("#demoSupplyStatus"),
  appSupplyList: document.querySelector("#demoAppSupplyList"),
  offender: document.querySelector("#demoOffender"),
  visitList: document.querySelector("#demoVisitList"),
  reportTableBody: document.querySelector("#demoReportTableBody"),
  reportBars: document.querySelector("#demoReportBars"),
};

function numberFrom(input, fallback = 0) {
  return Number(input.value) || fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function activateTab(tabId, { updateHash = true, scrollToTop = true } = {}) {
  if (!tabIds.has(tabId)) return false;

  tabPanels.forEach((panel) => {
    const isActive = panel.dataset.tabPanel === tabId;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });

  topTabs.forEach((tab) => {
    const isActive = tab.dataset.tabTarget === tabId;
    tab.classList.toggle("is-active", isActive);
    if (isActive) {
      tab.setAttribute("aria-current", "page");
    } else {
      tab.removeAttribute("aria-current");
    }
  });

  if (updateHash) {
    history.pushState(null, "", `#${tabId}`);
  }

  if (scrollToTop) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return true;
}

function syncTabFromHash() {
  if (!tabPanels.length) return;

  const hash = decodeURIComponent(window.location.hash.replace("#", ""));

  if (tabIds.has(hash)) {
    activateTab(hash, { updateHash: false, scrollToTop: false });
    if (hash !== "landing") {
      const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      resetScroll();
      window.requestAnimationFrame(resetScroll);
      window.setTimeout(resetScroll, 80);
    }
    return;
  }

  activateTab("landing", { updateHash: false, scrollToTop: false });

  if (hash) {
    window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ block: "start" });
    }, 0);
  }
}

function updateDiagnostic() {
  const averagePrice = Math.max(numberFrom(fields.averagePrice), 0);
  const appointments = Math.max(numberFrom(fields.appointments, 1), 1);
  const fixedCost = Math.max(numberFrom(fields.fixedCost), 0);
  const variableCost = Math.max(numberFrom(fields.variableCost), 0);
  const taxRate = clamp(numberFrom(fields.taxRate), 0, 80) / 100;
  const professionalShare = clamp(numberFrom(fields.professionalShare), 0, 80) / 100;
  const desiredProfit = Math.max(numberFrom(fields.desiredProfit), 0);
  const priceAdjustment = clamp(numberFrom(fields.priceAdjustment), -80, 200) / 100;

  const grossRevenue = averagePrice * appointments;
  const taxCost = grossRevenue * taxRate;
  const professionalCost = grossRevenue * professionalShare;
  const totalVariableCost = variableCost * appointments;
  const totalCost = fixedCost + totalVariableCost + taxCost + professionalCost;
  const estimatedProfit = grossRevenue - totalCost;
  const estimatedMargin = grossRevenue > 0 ? estimatedProfit / grossRevenue : 0;
  const costPerVisit = totalCost / appointments;
  const priceRetention = 1 - taxRate - professionalShare;
  const contributionPerVisit = averagePrice * (1 - taxRate - professionalShare) - variableCost;
  const visitsForDesiredProfit =
    contributionPerVisit > 0
      ? Math.ceil((fixedCost + desiredProfit) / contributionPerVisit)
      : Number.POSITIVE_INFINITY;
  const suggestedPrice =
    priceRetention > 0
      ? (fixedCost + desiredProfit + totalVariableCost) / (appointments * priceRetention)
      : Number.NaN;

  const adjustedPrice = averagePrice * (1 + priceAdjustment);
  const adjustedRevenue = adjustedPrice * appointments;
  const adjustedCost =
    fixedCost + totalVariableCost + adjustedRevenue * taxRate + adjustedRevenue * professionalShare;
  const adjustedProfit = adjustedRevenue - adjustedCost;
  const adjustedMargin = adjustedRevenue > 0 ? adjustedProfit / adjustedRevenue : 0;

  fields.grossRevenue.textContent = currency.format(grossRevenue);
  fields.totalCost.textContent = currency.format(totalCost);
  fields.estimatedProfit.textContent = currency.format(estimatedProfit);
  fields.estimatedMargin.textContent = percent.format(estimatedMargin);
  fields.costPerVisit.textContent = currency.format(costPerVisit);
  fields.suggestedPrice.textContent = Number.isFinite(suggestedPrice)
    ? currency.format(suggestedPrice)
    : "Preço inviável";
  fields.breakEvenVisits.textContent = Number.isFinite(visitsForDesiredProfit)
    ? `${visitsForDesiredProfit} atendimentos`
    : "Não fecha";
  fields.adjustedPrice.textContent = currency.format(adjustedPrice);

  fields.diagnosticStatus.classList.remove("good", "warning", "danger");

  if (estimatedProfit < 0) {
    fields.diagnosticStatus.classList.add("danger");
    fields.statusLabel.textContent = "Resultado estimado negativo";
    fields.statusText.textContent =
      "Com estes números, a operação não cobre custos fixos, custos variáveis, impostos e repasses.";
  } else if (estimatedProfit < desiredProfit) {
    const gap = Math.max(desiredProfit - estimatedProfit, 0);
    fields.diagnosticStatus.classList.add("warning");
    fields.statusLabel.textContent = "Lucro abaixo do desejável";
    fields.statusText.textContent =
      Number.isFinite(suggestedPrice)
        ? `Faltam ${currency.format(gap)} para o lucro desejável. Mantendo ${appointments} atendimentos, o preço médio sugerido é ${currency.format(suggestedPrice)}.`
        : "Os percentuais de impostos e repasses deixam o preço sugerido inviável com os dados informados.";
  } else {
    fields.diagnosticStatus.classList.add("good");
    fields.statusLabel.textContent = "Lucro acima do desejável";
    fields.statusText.textContent =
      "Com estes números, o lucro estimado supera o valor desejável informado. Ainda vale acompanhar por serviço, profissional e material.";
  }

  fields.scenarioText.textContent =
    priceAdjustment !== 0
      ? `Com reajuste de ${percent.format(priceAdjustment)}, o lucro estimado iria para ${currency.format(adjustedProfit)} e a margem para ${percent.format(adjustedMargin)}.`
      : "Informe um reajuste para visualizar o impacto no preço, lucro e margem estimada.";
}

function getDemoProcedure() {
  return demoProcedures[demoElements.procedure?.value] || demoProcedures.consulta;
}

function getDemoChannel() {
  return demoChannels[demoElements.channel?.value] || demoChannels.particular;
}

function getDemoPrice(procedure = getDemoProcedure(), channel = getDemoChannel()) {
  const fallback = Math.round(procedure.basePrice * channel.multiplier);
  return Math.max(Number(demoElements.priceOverride?.value) || fallback, 0);
}

function getDemoContext() {
  const procedure = getDemoProcedure();
  const channel = getDemoChannel();
  const volume = Math.max(Number(demoElements.volume?.value) || procedure.defaultVolume, 1);
  const price = getDemoPrice(procedure, channel);
  const supplyVariation = clamp(Number(demoElements.supplyVariation?.value) || 0, -20, 50) / 100;
  const materials = procedure.materials.map((item) => ({
    ...item,
    adjustedCost: item.cost * (1 + supplyVariation),
    adjustedTrend: item.trend + supplyVariation,
    monthlyImpact: item.cost * supplyVariation * volume,
  }));
  const materialsCost = materials.reduce((sum, item) => sum + item.adjustedCost, 0);
  const taxCost = price * procedure.taxRate;
  const variableCost = procedure.professionalCost + materialsCost + taxCost;
  const fixedPerVisit = procedure.fixedMonthly / volume;
  const costPerVisit = variableCost + fixedPerVisit;
  const profitPerVisit = price - costPerVisit;
  const revenue = price * volume;
  const monthlyCost = costPerVisit * volume;
  const monthlyProfit = revenue - monthlyCost;
  const margin = price > 0 ? profitPerVisit / price : 0;
  const contribution = price - variableCost;
  const breakEven = contribution > 0 ? Math.ceil(procedure.fixedMonthly / contribution) : Infinity;
  const offender = [...materials].sort((a, b) => b.monthlyImpact - a.monthlyImpact)[0] || materials[0];

  return {
    procedure,
    channel,
    volume,
    price,
    supplyVariation,
    materials,
    materialsCost,
    taxCost,
    variableCost,
    fixedPerVisit,
    costPerVisit,
    profitPerVisit,
    revenue,
    monthlyCost,
    monthlyProfit,
    margin,
    contribution,
    breakEven,
    offender,
  };
}

function getMarginStatus(margin) {
  if (margin < 0.18) {
    return {
      tone: "danger",
      label: "Margem pressionada",
      text: "O serviço está perto do limite. Revise preço, volume, repasse ou insumos antes de escalar.",
    };
  }

  if (margin < 0.3) {
    return {
      tone: "warning",
      label: "Margem em atenção",
      text: "O serviço fecha a conta, mas exige acompanhamento recorrente para não perder resultado.",
    };
  }

  return {
    tone: "good",
    label: "Margem saudável",
    text: "O serviço cobre custos variáveis, impostos, estrutura e ainda preserva lucro.",
  };
}

function formatSignedPercent(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${percent.format(value)}`;
}

function renderComposition(container, context) {
  if (!container) return;

  const rows = [
    {
      label: context.procedure.professionalLabel,
      detail: "Custo direto do profissional",
      value: context.procedure.professionalCost,
      color: "#0b94dc",
    },
    {
      label: "Materiais e insumos",
      detail: `${context.materials.length} itens monitorados`,
      value: context.materialsCost,
      color: "#f4bf2a",
    },
    {
      label: "Estrutura alocada",
      detail: "Rateio dos custos fixos pelo volume",
      value: context.fixedPerVisit,
      color: "#22a45a",
    },
    {
      label: "Impostos",
      detail: `${percent.format(context.procedure.taxRate)} sobre o valor cobrado`,
      value: context.taxCost,
      color: "#d94b54",
    },
  ];

  container.innerHTML = rows
    .map(
      (row) => `
        <div class="demo-composition-row">
          <span class="demo-composition-dot" style="background:${row.color}"></span>
          <div>
            <strong>${row.label}</strong>
            <small>${row.detail}</small>
          </div>
          <span>${currency.format(row.value)}</span>
        </div>
      `,
    )
    .join("");
}

function renderVisits(context) {
  if (!demoElements.visitList) return;

  demoElements.visitList.innerHTML = demoVisitLog
    .slice(0, 5)
    .map(
      (visit) => `
        <div class="demo-visit-item">
          <div>
            <strong>${visit.service}</strong>
            <span>${visit.time} - ${visit.status}</span>
          </div>
          <strong>${currency.format(visit.amount)}</strong>
        </div>
      `,
    )
    .join("");

  demoElements.todayBadge.textContent = `${demoVisitCount} registros hoje`;
  demoElements.metricVisits.textContent = String(demoVisitCount);
  demoElements.serviceTitle.textContent = context.procedure.name;
}

function renderSupplies(context) {
  const rows = [...context.materials].sort((a, b) => b.adjustedTrend - a.adjustedTrend);
  const offender = rows[0];
  const status =
    context.supplyVariation > 0
      ? `${offender.name} é o principal ofensor neste cenário. Vale cotar fornecedores e revisar estoque mínimo.`
      : "Sem pressão relevante nos insumos. Mantenha o acompanhamento para preservar margem.";

  demoElements.offender.textContent = offender?.name || "Sem ofensor";
  demoElements.supplyStatus.textContent = status;

  if (demoElements.appSupplyList) {
    demoElements.appSupplyList.innerHTML = rows
      .map(
        (item) => `
          <div class="demo-supply-item">
            <div>
              <strong>${item.name}</strong>
              <span>${item.supplier} - custo atual ${currency.format(item.adjustedCost)}</span>
            </div>
            <mark>${formatSignedPercent(item.adjustedTrend)}</mark>
          </div>
        `,
      )
      .join("");
  }

  if (demoElements.supplyTable) {
    demoElements.supplyTable.innerHTML = rows
      .map((item) => {
        const action =
          item.adjustedTrend >= 0.2
            ? "Renegociar ou cotar substituto"
            : item.adjustedTrend >= 0.1
              ? "Acompanhar próxima compra"
              : "Manter monitoramento";

        return `
          <tr>
            <td>${item.name}</td>
            <td class="${item.adjustedTrend >= 0.2 ? "danger" : "attention"}">${formatSignedPercent(item.adjustedTrend)}</td>
            <td>${action}</td>
          </tr>
        `;
      })
      .join("");
  }
}

function calculateReportRow(key, activeContext) {
  const procedure = demoProcedures[key];
  const channel = key === demoElements.procedure?.value ? activeContext.channel : demoChannels.particular;
  const volume = key === demoElements.procedure?.value ? activeContext.volume : procedure.defaultVolume;
  const price = key === demoElements.procedure?.value ? activeContext.price : procedure.basePrice;
  const supplyVariation = activeContext.supplyVariation;
  const materialsCost = procedure.materials.reduce(
    (sum, item) => sum + item.cost * (1 + supplyVariation),
    0,
  );
  const taxCost = price * procedure.taxRate;
  const variableCost = procedure.professionalCost + materialsCost + taxCost;
  const fixedPerVisit = procedure.fixedMonthly / volume;
  const costPerVisit = variableCost + fixedPerVisit;
  const profitPerVisit = price - costPerVisit;
  const margin = price > 0 ? profitPerVisit / price : 0;
  const revenue = price * volume;

  return {
    procedure,
    volume,
    revenue,
    margin,
  };
}

function renderReports(context) {
  const rows = Object.keys(demoProcedures).map((key) => calculateReportRow(key, context));

  if (demoElements.reportTableBody) {
    demoElements.reportTableBody.innerHTML = rows
      .map((row) => {
        const tone = row.margin < 0.18 ? "danger" : row.margin < 0.3 ? "attention" : "positive";

        return `
          <tr>
            <td>${row.procedure.shortName}</td>
            <td>${row.volume}</td>
            <td>${currency.format(row.revenue)}</td>
            <td class="${tone}">${percent.format(row.margin)}</td>
          </tr>
        `;
      })
      .join("");
  }

  if (demoElements.reportBars) {
    demoElements.reportBars.innerHTML = rows
      .map((row) => {
        const width = clamp(row.margin * 100, 4, 100);

        return `
          <div class="demo-report-item">
            <div>
              <strong>${row.procedure.shortName}</strong>
              <span>${row.volume} atendimentos - ${currency.format(row.revenue)}</span>
            </div>
            <div class="demo-report-progress"><span style="width:${width}%"></span></div>
            <span>Margem ${percent.format(row.margin)}</span>
          </div>
        `;
      })
      .join("");
  }
}

function setDemoModule(module) {
  const nextModule = demoModuleTitles[module] ? module : "operacao";

  demoElements.moduleButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.demoModule === nextModule);
  });

  demoElements.moduleScreens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.demoScreen === nextModule);
  });

  if (demoElements.appTitle) {
    demoElements.appTitle.textContent = demoModuleTitles[nextModule];
  }
}

function setDemoDefaults({ resetLog = false } = {}) {
  if (!demoElements.procedure) return;

  const procedure = getDemoProcedure();
  const channel = getDemoChannel();
  demoElements.volume.value = procedure.defaultVolume;
  demoElements.priceOverride.value = Math.round(procedure.basePrice * channel.multiplier);

  if (resetLog) {
    demoVisitCount = 18;
    demoVisitLog = [...demoInitialVisits];
    demoElements.supplyVariation.value = 12;
    demoElements.registerFeedback.textContent =
      "Cenário restaurado. Ajuste os campos para testar outra operação.";
  }
}

function updateDemo() {
  if (!demoElements.procedure) return;

  const context = getDemoContext();
  const status = getMarginStatus(context.margin);
  const breakEvenText = Number.isFinite(context.breakEven)
    ? `${context.breakEven} atendimentos`
    : "Não fecha";

  demoElements.supplyVariationLabel.textContent = formatSignedPercent(context.supplyVariation);
  demoElements.healthCard.classList.remove("good", "warning", "danger");
  demoElements.healthCard.classList.add(status.tone);
  demoElements.healthLabel.textContent = status.label;
  demoElements.healthText.textContent = status.text;
  demoElements.serviceTitle.textContent = context.procedure.name;
  demoElements.serviceMeta.textContent =
    `${context.channel.label}, ${context.volume} atendimentos no mês`;
  demoElements.metricRevenue.textContent = currency.format(context.revenue);
  demoElements.metricMargin.textContent = percent.format(context.margin);
  demoElements.metricProfit.textContent = currency.format(context.monthlyProfit);
  demoElements.metricCost.textContent = currency.format(context.costPerVisit);
  demoElements.metricBreakeven.textContent = breakEvenText;
  demoElements.costPerVisit.textContent = currency.format(context.costPerVisit);
  demoElements.marginText.textContent = status.text;

  const profitCard = demoElements.metricProfit?.closest(".demo-kpi-card");
  profitCard?.classList.remove("warning", "danger");
  if (status.tone !== "good") {
    profitCard?.classList.add(status.tone);
  }

  renderComposition(demoElements.appComposition, context);
  renderComposition(demoElements.compositionList, context);
  renderVisits(context);
  renderSupplies(context);
  renderReports(context);
}

Object.values(fields)
  .filter((field) => field instanceof HTMLInputElement)
  .forEach((field) => field.addEventListener("input", updateDiagnostic));

tabTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    const tabId = trigger.dataset.tabTarget;
    if (!tabId || !tabIds.has(tabId)) return;
    event.preventDefault();
    activateTab(tabId);
  });
});

window.addEventListener("hashchange", syncTabFromHash);

function openLeadModal(intent = "Conversão") {
  if (!modal) return;
  leadIntent.value = intent;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.querySelector("#leadName")?.focus();
}

function closeLeadModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

document.querySelectorAll(".js-open-lead").forEach((button) => {
  button.addEventListener("click", () => openLeadModal(button.dataset.intent));
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeLeadModal);
});

demoElements.moduleButtons.forEach((button) => {
  button.addEventListener("click", () => setDemoModule(button.dataset.demoModule));
});

demoElements.procedure?.addEventListener("change", () => {
  setDemoDefaults();
  updateDemo();
});

demoElements.channel?.addEventListener("change", () => {
  const procedure = getDemoProcedure();
  const channel = getDemoChannel();
  demoElements.priceOverride.value = Math.round(procedure.basePrice * channel.multiplier);
  updateDemo();
});

[demoElements.volume, demoElements.priceOverride, demoElements.supplyVariation]
  .filter((field) => field instanceof HTMLElement)
  .forEach((field) => field.addEventListener("input", updateDemo));

demoElements.registerVisit?.addEventListener("click", () => {
  const context = getDemoContext();
  const nextVolume = Math.max(Number(demoElements.volume.value) || 0, 0) + 1;
  const now = new Date();
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  demoElements.volume.value = nextVolume;
  demoVisitCount += 1;
  demoVisitLog = [
    {
      time,
      service: context.procedure.shortName,
      amount: context.price,
      status: "registrado agora",
    },
    ...demoVisitLog,
  ];
  demoElements.registerFeedback.textContent =
    `Atendimento registrado. O mês agora considera ${nextVolume} atendimentos para este serviço.`;
  setDemoModule("atendimentos");
  updateDemo();
});

demoElements.resetScenario?.addEventListener("click", () => {
  setDemoDefaults({ resetLog: true });
  setDemoModule("operacao");
  updateDemo();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLeadModal();
});

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = {
    name: document.querySelector("#leadName").value.trim(),
    email: document.querySelector("#leadEmail").value.trim(),
    phone: document.querySelector("#leadPhone").value.trim(),
    intent: leadIntent.value,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem("custoCertoLead", JSON.stringify(data));
  window.location.href = "venda.html";
});

if (leadGreeting) {
  try {
    const lead = JSON.parse(localStorage.getItem("custoCertoLead") || "{}");
    if (lead.name) {
      leadGreeting.textContent = `${lead.name}, escolha seu plano`;
    }
  } catch {
    leadGreeting.textContent = "Vamos começar?";
  }
}

syncTabFromHash();

if (fields.averagePrice) {
  updateDiagnostic();
}

if (demoElements.procedure) {
  setDemoDefaults();
  setDemoModule("operacao");
  updateDemo();
}
