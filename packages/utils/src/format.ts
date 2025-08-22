export function formatCurrency(value: number, currency = "BRL"): string {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency,
	}).format(value);
}

export function formatPercentage(value: number): string {
	return new Intl.NumberFormat("pt-BR", {
		style: "percent",
		minimumFractionDigits: 2,
	}).format(value / 100);
}

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9 -]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}
