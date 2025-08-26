// Constants for percentage calculation
const PERCENTAGE_DIVISOR = 100;

const formatCurrency = (value: number, currency = "BRL"): string =>
  new Intl.NumberFormat("pt-BR", {
    currency,
    style: "currency",
  }).format(value);

const formatPercentage = (value: number): string =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    style: "percent",
  }).format(value / PERCENTAGE_DIVISOR);

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036F]/g, "")
    .replaceAll(/[^a-z0-9 -]/g, "")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-")
    .trim();

export { formatCurrency, formatPercentage, slugify };
