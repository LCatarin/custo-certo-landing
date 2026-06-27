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

const demoScreens = {
  simulacao: {
    label: "Simulação",
    image: "assets/app-simulacao.png",
    alt: "Tela de simulação do aplicativo Custo Certo",
    caption: "Composição de custos por serviço, profissional, materiais, despesas e impostos.",
  },
  relatorios: {
    label: "Relatórios",
    image: "assets/app-relatorios.png",
    alt: "Tela de relatórios do aplicativo Custo Certo",
    caption: "Filtros por período, serviço e profissional para acompanhar receita, custo e margem.",
  },
  dashboard: {
    label: "Dashboard",
    image: "assets/app-dashboard.png",
    alt: "Dashboard mensal do aplicativo Custo Certo",
    caption: "Indicadores do mês para comparar custo médio, margem, faturamento e despesas.",
  },
};

const demoServices = {
  consulta: {
    price: 260,
    professional: 82,
    materials: 18,
    fixed: 54,
    taxRate: 0.08,
    offender: "Materiais descartáveis",
  },
  fisio: {
    price: 150,
    professional: 52,
    materials: 9,
    fixed: 34,
    taxRate: 0.08,
    offender: "Tempo profissional",
  },
  vet: {
    price: 180,
    professional: 48,
    materials: 32,
    fixed: 42,
    taxRate: 0.08,
    offender: "Insumos clínicos",
  },
};

const demoElements = {
  screenButtons: document.querySelectorAll("[data-demo-view]"),
  screenLabel: document.querySelector("#demoScreenLabel"),
  screenImage: document.querySelector("#demoScreenImage"),
  screenCaption: document.querySelector("#demoScreenCaption"),
  service: document.querySelector("#demoService"),
  volume: document.querySelector("#demoVolume"),
  supplyVariation: document.querySelector("#demoSupplyVariation"),
  registerVisit: document.querySelector("#demoRegisterVisit"),
  registerFeedback: document.querySelector("#demoRegisterFeedback"),
  margin: document.querySelector("#demoMargin"),
  marginText: document.querySelector("#demoMarginText"),
  cost: document.querySelector("#demoCost"),
  price: document.querySelector("#demoPrice"),
  profit: document.querySelector("#demoProfit"),
  monthlyProfit: document.querySelector("#demoMonthlyProfit"),
  offender: document.querySelector("#demoOffender"),
  supplyStatus: document.querySelector("#demoSupplyStatus"),
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
      window.scrollTo({ top: 0 });
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

function setDemoView(view) {
  const screen = demoScreens[view];
  if (!screen || !demoElements.screenImage) return;

  demoElements.screenButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.demoView === view);
  });

  demoElements.screenLabel.textContent = screen.label;
  demoElements.screenImage.src = screen.image;
  demoElements.screenImage.alt = screen.alt;
  demoElements.screenCaption.textContent = screen.caption;
}

function updateDemo() {
  if (!demoElements.service) return;

  const service = demoServices[demoElements.service.value] || demoServices.consulta;
  const volume = Math.max(Number(demoElements.volume.value) || 1, 1);
  const variation = clamp(Number(demoElements.supplyVariation.value) || 0, -10, 35) / 100;
  const materials = service.materials * (1 + variation);
  const tax = service.price * service.taxRate;
  const cost = service.professional + materials + service.fixed + tax;
  const profit = service.price - cost;
  const margin = service.price > 0 ? profit / service.price : 0;
  const monthlyProfit = profit * volume;
  const marginCard = demoElements.margin?.closest(".demo-result-card");

  demoElements.margin.textContent = percent.format(margin);
  demoElements.cost.textContent = currency.format(cost);
  demoElements.price.textContent = currency.format(service.price);
  demoElements.profit.textContent = currency.format(profit);
  demoElements.monthlyProfit.textContent = currency.format(monthlyProfit);

  marginCard?.classList.remove("attention", "danger");
  if (margin < 0.2) {
    marginCard?.classList.add("danger");
    demoElements.marginText.textContent = "Margem pressionada. Revise preço, repasse ou insumos.";
  } else if (margin < 0.35) {
    marginCard?.classList.add("attention");
    demoElements.marginText.textContent = "Margem positiva, mas exige acompanhamento de perto.";
  } else {
    demoElements.marginText.textContent = "Margem saudável para este cenário simulado.";
  }

  const variationLabel = percent.format(variation);
  demoElements.offender.textContent = variation > 0 ? service.offender : "Sem alta relevante";
  demoElements.supplyStatus.textContent =
    variation > 0
      ? `${service.offender} com variação de ${variationLabel} no cenário.`
      : `Insumos com variação de ${variationLabel}; cenário sem pressão relevante.`;
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

demoElements.screenButtons.forEach((button) => {
  button.addEventListener("click", () => setDemoView(button.dataset.demoView));
});

[demoElements.service, demoElements.volume, demoElements.supplyVariation]
  .filter((field) => field instanceof HTMLElement)
  .forEach((field) => field.addEventListener("input", updateDemo));

demoElements.service?.addEventListener("change", updateDemo);

demoElements.registerVisit?.addEventListener("click", () => {
  const nextVolume = Math.max(Number(demoElements.volume.value) || 0, 0) + 1;
  demoElements.volume.value = nextVolume;
  demoElements.registerFeedback.textContent =
    `Atendimento registrado. O mês agora considera ${nextVolume} atendimentos.`;
  setDemoView("dashboard");
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

if (demoElements.service) {
  updateDemo();
}
