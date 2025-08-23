import { z } from "zod";

// Validação de CPF brasileiro
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const cpfValidation = (cpf: string): boolean => {
	// Remove formatação
	const cleanCpf = cpf.replace(/[^\d]/g, "");

	// Verifica se tem 11 dígitos
	if (cleanCpf.length !== 11) {
		return false;
	}

	// Verifica se todos os dígitos são iguais
	if (/^(\d)\1{10}$/.test(cleanCpf)) {
		return false;
	}

	// Validação dos dígitos verificadores
	let sum = 0;
	for (let i = 0; i < 9; i++) {
		sum += Number.parseInt(cleanCpf.charAt(i), 10) * (10 - i);
	}
	let checkDigit = 11 - (sum % 11);
	if (checkDigit === 10 || checkDigit === 11) {
		checkDigit = 0;
	}
	if (checkDigit !== Number.parseInt(cleanCpf.charAt(9), 10)) {
		return false;
	}

	sum = 0;
	for (let i = 0; i < 10; i++) {
		sum += Number.parseInt(cleanCpf.charAt(i), 10) * (11 - i);
	}
	checkDigit = 11 - (sum % 11);
	if (checkDigit === 10 || checkDigit === 11) {
		checkDigit = 0;
	}
	if (checkDigit !== Number.parseInt(cleanCpf.charAt(10), 10)) {
		return false;
	}

	return true;
};

// Validação de telefone brasileiro
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

// Validação de senha forte
const passwordValidation = z
	.string()
	.min(8, "A senha deve ter pelo menos 8 caracteres")
	.regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
	.regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
	.regex(/\d/, "A senha deve conter pelo menos um número")
	.regex(
		/[^A-Za-z0-9]/,
		"A senha deve conter pelo menos um caractere especial",
	);

// Schema principal de signup
export const signupSchema = z
	.object({
		// Dados pessoais
		fullName: z
			.string()
			.min(2, "Nome deve ter pelo menos 2 caracteres")
			.max(100, "Nome deve ter no máximo 100 caracteres")
			.regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),

		email: z
			.string()
			.email("Email inválido")
			.max(255, "Email deve ter no máximo 255 caracteres")
			.toLowerCase(),

		password: passwordValidation,

		confirmPassword: z.string(),

		// Documentos brasileiros
		cpf: z
			.string()
			.regex(cpfRegex, "CPF deve estar no formato 000.000.000-00")
			.refine(cpfValidation, "CPF inválido"),

		phone: z
			.string()
			.regex(
				phoneRegex,
				"Telefone deve estar no formato (00) 0000-0000 ou (00) 90000-0000",
			),

		// Dados profissionais
		clinicName: z
			.string()
			.min(2, "Nome da clínica deve ter pelo menos 2 caracteres")
			.max(200, "Nome da clínica deve ter no máximo 200 caracteres"),

		userType: z.enum(["admin", "professional", "receptionist"], {
			required_error: "Selecione o tipo de usuário",
		}),

		// Consentimentos obrigatórios
		lgpdConsent: z
			.boolean()
			.refine(
				(val) => val === true,
				"É obrigatório aceitar os termos de privacidade LGPD",
			),

		terms: z
			.boolean()
			.refine((val) => val === true, "É obrigatório aceitar os termos de uso"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem",
		path: ["confirmPassword"],
	});

export type SignupFormData = z.infer<typeof signupSchema>;

// Schema para validação parcial (útil para validação em tempo real)
export const signupPartialSchema = signupSchema.partial();

// Valores padrão do formulário
export const signupDefaultValues: Partial<SignupFormData> = {
	fullName: "",
	email: "",
	password: "",
	confirmPassword: "",
	cpf: "",
	phone: "",
	clinicName: "",
	userType: undefined,
	lgpdConsent: false,
	terms: false,
};

// Opções para tipo de usuário
export const userTypeOptions = [
	{
		value: "admin" as const,
		label: "Administrador",
		description: "Acesso completo ao sistema e configurações da clínica",
	},
	{
		value: "professional" as const,
		label: "Profissional de Saúde",
		description: "Médicos, enfermeiros e outros profissionais da área",
	},
	{
		value: "receptionist" as const,
		label: "Recepcionista",
		description: "Atendimento, agendamentos e gestão de pacientes",
	},
] as const;

// Máscaras para formatação
export const masks = {
	cpf: (value: string) => {
		return value
			.replace(/\D/g, "")
			.replace(/(\d{3})(\d)/, "$1.$2")
			.replace(/(\d{3})(\d)/, "$1.$2")
			.replace(/(\d{3})(\d{1,2})/, "$1-$2")
			.replace(/(-\d{2})\d+?$/, "$1");
	},

	phone: (value: string) => {
		return value
			.replace(/\D/g, "")
			.replace(/(\d{2})(\d)/, "($1) $2")
			.replace(/(\d{4})(\d)/, "$1-$2")
			.replace(/(\d{4})-(\d)(\d{4})/, "$1$2-$3")
			.replace(/(-\d{4})\d+?$/, "$1");
	},
};

// Funções auxiliares para validação
export const validateCpf = (cpf: string): boolean => {
	return cpfValidation(cpf);
};

export const validatePhone = (phone: string): boolean => {
	return phoneRegex.test(phone);
};

export const validatePassword = (
	password: string,
): {
	isValid: boolean;
	errors: string[];
} => {
	const errors: string[] = [];

	if (password.length < 8) {
		errors.push("Pelo menos 8 caracteres");
	}
	if (!/[A-Z]/.test(password)) {
		errors.push("Uma letra maiúscula");
	}
	if (!/[a-z]/.test(password)) {
		errors.push("Uma letra minúscula");
	}
	if (!/\d/.test(password)) {
		errors.push("Um número");
	}
	if (!/[^A-Za-z0-9]/.test(password)) {
		errors.push("Um caractere especial");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
};
