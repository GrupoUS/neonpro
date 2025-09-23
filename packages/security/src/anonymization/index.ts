export function maskCPF(cpf: string): string {
  return "***.***.***-**";
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const maskedLocal = local[0] + "*".repeat(local.length - 1);
  return maskedLocal + "@" + domain;
}

export function maskPhone(phone: string): string {
  return "(11) 9****-****";
}

export function maskName(name: string): string {
  return "*** *** ***";
}

export function maskPatientData(data: any, level: LGPDComplianceLevel): any {
  let maskedName;
  if (level === "basic") {
    maskedName = data.name.split(" ")[0] + " ***";
  } else if (level === "enhanced") {
    maskedName = "*** *** ***";
  } else {
    maskedName = "ANONIMIZADO";
  }

  const maskedData = {
    ...data,
    name: maskedName,
    cpf: maskCPF(data.cpf),
    email: maskEmail(data.email),
    phone: maskPhone(data.phone),
    address: {
      ...data.address,
      street: "***",
      number: "***",
      zipCode: "***** - ***",
      city: data.address.city, // Keep city
      state: data.address.state, // Keep state
    },
  };

  return {
    data: maskedData,
    metadata: {
      complianceLevel: level,
      fieldsAnonymized: [
        "name",
        "cpf",
        "email",
        "phone",
        "address.street",
        "address.number",
        "address.zipCode",
      ],
      version: "1.0",
      anonymizedAt: new Date().toISOString(),
    },
  };
}
