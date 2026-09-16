export const APP_NAME = "Motorista Pro";

export const DRIVER_TYPES = [
  "Taxista",
  "Táxi e Uber",
  "Táxi e Uber Táxi",
  "Táxi, Uber e Uber Táxi",
  "Táxi e 99",
  "Táxi, Uber e 99",
  "Táxi, Uber, Uber Táxi e 99",
  "Motorista de Uber",
  "Motorista de Uber Táxi",
  "Motorista de 99",
  "Motorista de Uber e 99",
  "Motorista de aplicativo",
  "Táxi e motorista de aplicativo",
  "Motorista particular",
  "Outro",
] as const;

export const MODALITIES = [
  "Táxi tradicional",
  "Uber",
  "Uber Táxi",
  "UberX",
  "Uber Comfort",
  "Uber Black",
  "99",
  "99 Táxi",
  "Corrida particular",
  "Convênio",
  "Empresa",
  "Transfer",
  "Outro",
] as const;

export const APPS = ["Uber", "Uber Táxi", "99", "99 Táxi", "Táxi (rádio/central)", "Particular", "Outro"] as const;

/** Grupos usados no comparativo "Desempenho por modalidade". */
export const MODALITY_GROUPS = ["Táxi", "Uber", "Uber Táxi", "99", "99 Táxi", "Particular", "Outras"] as const;

export function modalityGroup(modality?: string | null): string {
  const m = (modality ?? "").toLowerCase();
  if (m.includes("uber táxi") || m.includes("uber taxi")) return "Uber Táxi";
  if (m.includes("uber")) return "Uber";
  if (m.includes("99 táxi") || m.includes("99 taxi")) return "99 Táxi";
  if (m.includes("99")) return "99";
  if (m.includes("táxi") || m.includes("taxi")) return "Táxi";
  if (m.includes("particular")) return "Particular";
  return "Outras";
}

export const PAYMENT_METHODS = [
  "Dinheiro",
  "Pix",
  "Cartão de débito",
  "Cartão de crédito",
  "Pelo aplicativo",
  "Convênio / faturado",
  "Outro",
] as const;

export const PERIODICITIES = ["Diária", "Semanal", "Quinzenal", "Mensal", "Anual", "Personalizada"] as const;

export const FIXED_EXPENSE_CATEGORIES = [
  "Ponto / praça / associação",
  "Aplicativo",
  "Veículo",
  "Seguro",
  "Financiamento",
  "Sindicato / cooperativa",
  "Documentação",
  "Comunicação",
  "Outras taxas",
] as const;

export const TAXI_SUGGESTIONS = [
  { name: "Aluguel do ponto de táxi", category: "Ponto / praça / associação" },
  { name: "Mensalidade da praça", category: "Ponto / praça / associação" },
  { name: "Taxa da associação", category: "Ponto / praça / associação" },
  { name: "Taxa da cooperativa", category: "Ponto / praça / associação" },
  { name: "Taxa de manutenção do ponto", category: "Ponto / praça / associação" },
  { name: "Taxa de estrutura do ponto", category: "Ponto / praça / associação" },
  { name: "Contribuição do ponto", category: "Ponto / praça / associação" },
  { name: "Aluguel do veículo", category: "Veículo" },
  { name: "Financiamento do veículo", category: "Financiamento" },
  { name: "Seguro", category: "Seguro" },
  { name: "Taxa de rádio ou central", category: "Comunicação" },
  { name: "Taxa de sindicato", category: "Sindicato / cooperativa" },
  { name: "Outras taxas", category: "Outras taxas" },
];

export const APP_SUGGESTIONS = [
  { name: "Taxa do Uber", category: "Aplicativo" },
  { name: "Taxa do Uber Táxi", category: "Aplicativo" },
  { name: "Taxa da 99", category: "Aplicativo" },
  { name: "Taxa do 99 Táxi", category: "Aplicativo" },
  { name: "Aluguel do veículo", category: "Veículo" },
  { name: "Taxa de locação", category: "Veículo" },
  { name: "Seguro", category: "Seguro" },
  { name: "Financiamento", category: "Financiamento" },
  { name: "Parcela do veículo", category: "Financiamento" },
  { name: "Taxa de cooperativa", category: "Sindicato / cooperativa" },
  { name: "Taxa de associação", category: "Sindicato / cooperativa" },
  { name: "Taxa de aluguel", category: "Veículo" },
  { name: "Outras taxas", category: "Outras taxas" },
];

export const VARIABLE_CATEGORIES = [
  "Combustível",
  "Pedágio",
  "Estacionamento",
  "Alimentação",
  "Lavagem",
  "Higienização",
  "Pequenos reparos",
  "Manutenção emergencial",
  "Pneus",
  "Óleo",
  "Arla / AdBlue",
  "Taxas eventuais",
  "Outras despesas",
] as const;

export const FUEL_TYPES = ["Gasolina", "Etanol", "Diesel", "GNV", "Outro"] as const;

export const MAINTENANCE_TYPES = [
  "Troca de óleo",
  "Filtros",
  "Pneus",
  "Freios",
  "Suspensão",
  "Bateria",
  "Ar-condicionado",
  "Correia",
  "Revisão geral",
  "Lavagem técnica",
  "Outros",
] as const;

export const GOAL_SCOPES = ["Geral", "Táxi", "Uber", "Uber Táxi", "99", "99 Táxi", "Particular"] as const;
export const GOAL_PERIODS = ["Diária", "Semanal", "Mensal"] as const;
export const GOAL_TYPES = ["Faturamento", "Lucro", "Corridas", "Quilômetros"] as const;

export const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;
