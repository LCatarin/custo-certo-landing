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

function numberFrom(input, fallback = 0) {
  return Number(input.value) || fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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

Object.values(fields)
  .filter((field) => field instanceof HTMLInputElement)
  .forEach((field) => field.addEventListener("input", updateDiagnostic));

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

if (fields.averagePrice) {
  updateDiagnostic();
}
