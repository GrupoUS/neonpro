export function maskCPF(_cpf: string): string {
  return "***.***.***-**";
}

export function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "*****@*****.com";
  const [local, domain] = parts;
  if (!local || !domain) return "*****@*****.com";
  const maskedLocal = local[0] + "*".repeat(local.length - 1);
  return maskedLocal + "@" + domain;
}

export function maskPhone(_phone: string): string {
  return "(11) 9****-****";
}

export function maskName(_name: string): string {
  return "*** *** ***";
}

// Type definitions for LGPD compliance levels
export type LGPDComplianceLevel = "basic" | "enhanced" | "strict";

interface PatientData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    zipCode: string;
    city: string;
    state: string;
  };
}

interface AnonymizedPatientResult {
  data: PatientData;
  metadata: {
    complianceLevel: LGPDComplianceLevel;
    fieldsAnonymized: string[];
    version: string;
    anonymizedAt: string;
  };
}

export function maskPatientData(data: PatientData, level: LGPDComplianceLevel): AnonymizedPatientResult {
  let maskedName;
  if (level === "basic") {
    maskedName = data.name.split(" ")[0] + " ***";
  } else if (level === "enhanced") {
    maskedName = "*** *** ***";
  } else {
    maskedName = "ANONIMIZADO";
  }

  const maskedData: PatientData = {
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
