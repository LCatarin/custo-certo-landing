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
  targetMargin: document.querySelector("#targetMargin"),
  tableDrop: document.querySelector("#tableDrop"),
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
  discountImpact: document.querySelector("#discountImpact"),
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
  const targetMargin = clamp(numberFrom(fields.targetMargin, 1), 1, 90) / 100;
  const tableDrop = clamp(numberFrom(fields.tableDrop), 0, 80) / 100;

  const grossRevenue = averagePrice * appointments;
  const taxCost = grossRevenue * taxRate;
  const professionalCost = grossRevenue * professionalShare;
  const totalVariableCost = variableCost * appointments;
  const totalCost = fixedCost + totalVariableCost + taxCost + professionalCost;
  const estimatedProfit = grossRevenue - totalCost;
  const estimatedMargin = grossRevenue > 0 ? estimatedProfit / grossRevenue : 0;
  const costPerVisit = totalCost / appointments;
  const fixedCostPerVisit = fixedCost / appointments;
  const denominator = 1 - taxRate - professionalShare - targetMargin;
  const suggestedPrice =
    denominator > 0 ? (fixedCostPerVisit + variableCost) / denominator : Number.NaN;
  const contributionPerVisit = averagePrice * (1 - taxRate - professionalShare) - variableCost;
  const breakEvenVisits =
    contributionPerVisit > 0 ? Math.ceil(fixedCost / contributionPerVisit) : Number.POSITIVE_INFINITY;

  const discountedPrice = averagePrice * (1 - tableDrop);
  const discountedRevenue = discountedPrice * appointments;
  const discountedCost =
    fixedCost + totalVariableCost + discountedRevenue * taxRate + discountedRevenue * professionalShare;
  const discountedProfit = discountedRevenue - discountedCost;
  const discountImpact = discountedProfit - estimatedProfit;
  const discountedMargin = discountedRevenue > 0 ? discountedProfit / discountedRevenue : 0;

  fields.grossRevenue.textContent = currency.format(grossRevenue);
  fields.totalCost.textContent = currency.format(totalCost);
  fields.estimatedProfit.textContent = currency.format(estimatedProfit);
  fields.estimatedMargin.textContent = percent.format(estimatedMargin);
  fields.costPerVisit.textContent = currency.format(costPerVisit);
  fields.suggestedPrice.textContent = Number.isFinite(suggestedPrice)
    ? currency.format(suggestedPrice)
    : "Margem inviável";
  fields.breakEvenVisits.textContent = Number.isFinite(breakEvenVisits)
    ? `${breakEvenVisits} atendimentos`
    : "Não fecha";
  fields.discountImpact.textContent = currency.format(discountImpact);

  fields.diagnosticStatus.classList.remove("good", "warning", "danger");

  if (estimatedProfit < 0) {
    fields.diagnosticStatus.classList.add("danger");
    fields.statusLabel.textContent = "Resultado estimado negativo";
    fields.statusText.textContent =
      "Com estes números, a operação não cobre custos fixos, custos variáveis, impostos e repasses.";
  } else if (estimatedMargin < targetMargin) {
    const gap = Number.isFinite(suggestedPrice) ? Math.max(suggestedPrice - averagePrice, 0) : 0;
    fields.diagnosticStatus.classList.add("warning");
    fields.statusLabel.textContent = "Margem abaixo da desejada";
    fields.statusText.textContent =
      gap > 0
        ? `Para buscar a margem desejada, o preço médio precisaria subir cerca de ${currency.format(gap)} por atendimento.`
        : "A margem desejada parece pressionada pelos percentuais de impostos, repasses e custos informados.";
  } else {
    fields.diagnosticStatus.classList.add("good");
    fields.statusLabel.textContent = "Margem estimada saudável";
    fields.statusText.textContent =
      "A margem estimada está acima da meta informada. Ainda vale acompanhar por serviço, profissional e material.";
  }

  fields.scenarioText.textContent =
    tableDrop > 0
      ? `Com queda de ${percent.format(tableDrop)} no preço médio, a margem estimada iria para ${percent.format(discountedMargin)}.`
      : "Informe uma queda de tabela para visualizar o impacto no lucro mensal estimado.";
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
