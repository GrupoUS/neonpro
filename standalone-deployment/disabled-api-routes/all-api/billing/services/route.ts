// Placeholder service file
export async function getData() {
  return { message: "Placeholder service method" };
}

export async function saveData(data: unknown) {
  return { success: true, data };
}

export default { getData, saveData };
