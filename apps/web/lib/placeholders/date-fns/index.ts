// Placeholder for date-fns format function
export function format(
  date: Date | string | number,
  formatString: string,
): string {
  if (typeof date === "string") {
    date = new Date(date);
  }
  if (typeof date === "number") {
    date = new Date(date);
  }

  // Simple placeholder formatting
  if (formatString === "yyyy-MM-dd") {
    return date.toISOString().split("T")[0];
  }
  if (formatString === "HH:mm") {
    return date.toTimeString().slice(0, 5);
  }
  if (formatString === "dd/MM/yyyy") {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return date.toLocaleDateString();
}

export default format;
