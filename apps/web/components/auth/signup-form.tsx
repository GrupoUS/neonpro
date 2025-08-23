"use client";

import { AlertCircle, Check, Eye, EyeOff, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { toastHelpers } from "@/lib/toast-helpers";

// Tipos simplificados
type SignupFormData = {
	fullName: string;
	email: string;
	password: string;
	confirmPassword: string;
	cpf: string;
	phone: string;
	clinicName: string;
	userType: "admin" | "professional" | "receptionist";
	lgpdConsent: boolean;
	terms: boolean;
};

// Validação simplificada de CPF
const validateCPF = (cpf: string): boolean => {
	const cleanCpf = cpf.replace(/[^\d]/g, "");
	if (cleanCpf.length !== 11) {
		return false;
	}
	if (/^(\d)\1{10}$/.test(cleanCpf)) {
		return false;
	}

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

	return checkDigit === Number.parseInt(cleanCpf.charAt(10), 10);
};

// Formatação de CPF
const formatCPF = (value: string): string => {
	const cleanValue = value.replace(/[^\d]/g, "");
	if (cleanValue.length <= 11) {
		return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	}
	return value;
};

// Formatação de telefone
const formatPhone = (value: string): string => {
	const cleanValue = value.replace(/[^\d]/g, "");
	if (cleanValue.length <= 11) {
		return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
	}
	return value;
};

import { Separator } from "../ui/separator";
import { GoogleAuthButton } from "./google-auth-button";

export function SignupForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [step, setStep] = useState(1);

	const { signUp, loading } = useAuth();
	const router = useRouter();

	const [formData, setFormData] = useState<SignupFormData>({
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
		cpf: "",
		phone: "",
		clinicName: "",
		userType: "admin",
		lgpdConsent: false,
		terms: false,
	});

	const [errors, setErrors] = useState<
		Partial<Record<keyof SignupFormData, string>>
	>({});

	const handleInputChange = (
		field: keyof SignupFormData,
		value: string | boolean,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Limpar erro do campo quando usuário começar a digitar
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}

		// Formatação automática
		if (field === "cpf" && typeof value === "string") {
			const formatted = formatCPF(value);
			setFormData((prev) => ({ ...prev, cpf: formatted }));
		}

		if (field === "phone" && typeof value === "string") {
			const formatted = formatPhone(value);
			setFormData((prev) => ({ ...prev, phone: formatted }));
		}
	};

	const validateStep = (stepNumber: number): boolean => {
		const newErrors: Partial<Record<keyof SignupFormData, string>> = {};

		if (stepNumber === 1) {
			if (!formData.fullName.trim()) {
				newErrors.fullName = "Nome é obrigatório";
			}
			if (!formData.email.trim()) {
				newErrors.email = "Email é obrigatório";
			}
			if (!formData.password) {
				newErrors.password = "Senha é obrigatória";
			}
			if (formData.password !== formData.confirmPassword) {
				newErrors.confirmPassword = "As senhas não coincidem";
			}
		}

		if (stepNumber === 2) {
			if (!formData.cpf.trim()) {
				newErrors.cpf = "CPF é obrigatório";
			} else if (!validateCPF(formData.cpf)) {
				newErrors.cpf = "CPF inválido";
			}
			if (!formData.phone.trim()) {
				newErrors.phone = "Telefone é obrigatório";
			}
			if (!formData.clinicName.trim()) {
				newErrors.clinicName = "Nome da clínica é obrigatório";
			}
		}

		if (stepNumber === 3) {
			if (!formData.lgpdConsent) {
				newErrors.lgpdConsent = "É obrigatório aceitar os termos LGPD";
			}
			if (!formData.terms) {
				newErrors.terms = "É obrigatório aceitar os termos de uso";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNextStep = () => {
		if (validateStep(step)) {
			setStep(step + 1);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateStep(3)) {
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const { data, error } = await signUp(formData.email, formData.password);

			if (error) {
				throw error;
			}

			if (data?.user) {
				toastHelpers.success.signup();
				router.push("/login?message=confirm-email");
			}
		} catch (err: any) {
			setError(err.message || "Erro ao criar conta. Tente novamente.");
			toastHelpers.error.generic();
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderStep1 = () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="fullName">Nome Completo</Label>
				<Input
					id="fullName"
					onChange={(e) => handleInputChange("fullName", e.target.value)}
					placeholder="Seu nome completo"
					required
					type="text"
					value={formData.fullName}
				/>
				{errors.fullName && (
					<p className="text-destructive text-sm">{errors.fullName}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					onChange={(e) => handleInputChange("email", e.target.value)}
					placeholder="seu@email.com"
					required
					type="email"
					value={formData.email}
				/>
				{errors.email && (
					<p className="text-destructive text-sm">{errors.email}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="password">Senha</Label>
				<div className="relative">
					<Input
						id="password"
						onChange={(e) => handleInputChange("password", e.target.value)}
						placeholder="Digite sua senha"
						required
						type={showPassword ? "text" : "password"}
						value={formData.password}
					/>
					<Button
						className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
						onClick={() => setShowPassword(!showPassword)}
						size="sm"
						type="button"
						variant="ghost"
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</Button>
				</div>
				{errors.password && (
					<p className="text-destructive text-sm">{errors.password}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="confirmPassword">Confirmar Senha</Label>
				<div className="relative">
					<Input
						id="confirmPassword"
						onChange={(e) =>
							handleInputChange("confirmPassword", e.target.value)
						}
						placeholder="Confirme sua senha"
						required
						type={showConfirmPassword ? "text" : "password"}
						value={formData.confirmPassword}
					/>
					<Button
						className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						size="sm"
						type="button"
						variant="ghost"
					>
						{showConfirmPassword ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</Button>
				</div>
				{errors.confirmPassword && (
					<p className="text-destructive text-sm">{errors.confirmPassword}</p>
				)}
			</div>
		</div>
	);

	const renderStep2 = () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="cpf">CPF</Label>
				<Input
					id="cpf"
					maxLength={14}
					onChange={(e) => handleInputChange("cpf", e.target.value)}
					placeholder="000.000.000-00"
					required
					type="text"
					value={formData.cpf}
				/>
				{errors.cpf && <p className="text-destructive text-sm">{errors.cpf}</p>}
			</div>

			<div className="space-y-2">
				<Label htmlFor="phone">Telefone</Label>
				<Input
					id="phone"
					maxLength={15}
					onChange={(e) => handleInputChange("phone", e.target.value)}
					placeholder="(11) 99999-9999"
					required
					type="text"
					value={formData.phone}
				/>
				{errors.phone && (
					<p className="text-destructive text-sm">{errors.phone}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="clinicName">Nome da Clínica</Label>
				<Input
					id="clinicName"
					onChange={(e) => handleInputChange("clinicName", e.target.value)}
					placeholder="Nome da sua clínica"
					required
					type="text"
					value={formData.clinicName}
				/>
				{errors.clinicName && (
					<p className="text-destructive text-sm">{errors.clinicName}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="userType">Tipo de Usuário</Label>
				<select
					className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2"
					id="userType"
					onChange={(e) => handleInputChange("userType", e.target.value as any)}
					required
					value={formData.userType}
				>
					<option value="admin">Administrador</option>
					<option value="professional">Profissional</option>
					<option value="receptionist">Recepcionista</option>
				</select>
			</div>
		</div>
	);

	const renderStep3 = () => (
		<div className="space-y-4">
			<div className="space-y-4">
				<div className="flex items-start space-x-2">
					<Checkbox
						checked={formData.lgpdConsent}
						id="lgpdConsent"
						onCheckedChange={(checked) =>
							handleInputChange("lgpdConsent", !!checked)
						}
					/>
					<div className="text-sm leading-5">
						<label className="cursor-pointer" htmlFor="lgpdConsent">
							Aceito os{" "}
							<a
								className="text-primary underline"
								href="/privacy"
								rel="noopener"
								target="_blank"
							>
								Termos de Privacidade LGPD
							</a>{" "}
							e autorizo o tratamento dos meus dados pessoais conforme a Lei
							13.709/2018.
						</label>
						{errors.lgpdConsent && (
							<p className="mt-1 text-destructive">{errors.lgpdConsent}</p>
						)}
					</div>
				</div>

				<div className="flex items-start space-x-2">
					<Checkbox
						checked={formData.terms}
						id="terms"
						onCheckedChange={(checked) => handleInputChange("terms", !!checked)}
					/>
					<div className="text-sm leading-5">
						<label className="cursor-pointer" htmlFor="terms">
							Aceito os{" "}
							<a
								className="text-primary underline"
								href="/terms"
								rel="noopener"
								target="_blank"
							>
								Termos de Uso
							</a>{" "}
							e{" "}
							<a
								className="text-primary underline"
								href="/compliance"
								rel="noopener"
								target="_blank"
							>
								Diretrizes de Conformidade ANVISA/CFM
							</a>
							.
						</label>
						{errors.terms && (
							<p className="mt-1 text-destructive">{errors.terms}</p>
						)}
					</div>
				</div>
			</div>

			<div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
				<div className="flex items-start space-x-3">
					<div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
						<AlertCircle className="h-4 w-4 text-primary" />
					</div>
					<div className="space-y-2 text-foreground/90 text-sm">
						<p className="font-semibold text-foreground">
							Conformidade Regulatória Brasileira
						</p>
						<p className="leading-relaxed">
							Ao criar sua conta, você confirma estar ciente e de acordo com as
							regulamentações ANVISA, CFM e demais órgãos reguladores aplicáveis
							às atividades de clínicas estéticas e procedimentos de medicina
							estética no Brasil.
						</p>
						<div className="flex items-center space-x-2 pt-2">
							<div className="h-1.5 w-1.5 rounded-full bg-primary" />
							<span className="font-medium text-primary text-xs">
								Dados protegidos conforme LGPD • Criptografia de nível bancário
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<div className="space-y-6">
			{/* Enhanced Progress Indicator */}
			<div className="flex items-center justify-center space-x-4">
				{[1, 2, 3].map((stepNumber) => (
					<div className="flex items-center" key={stepNumber}>
						<div
							className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm transition-all ${
								stepNumber === step
									? "neonpro-gradient neonpro-glow text-primary-foreground"
									: stepNumber < step
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground"
							}`}
						>
							{stepNumber < step ? <Check className="h-5 w-5" /> : stepNumber}
						</div>
						{stepNumber < 3 && (
							<div
								className={`ml-4 h-0.5 w-8 transition-colors ${stepNumber < step ? "bg-primary" : "bg-muted"}`}
							/>
						)}
					</div>
				))}
			</div>

			{/* Enhanced Step Titles */}
			<div className="space-y-2 text-center">
				<h2 className="font-bold text-foreground text-xl">
					{step === 1 && "Informações Pessoais"}
					{step === 2 && "Dados da Clínica"}
					{step === 3 && "Conformidade e Termos"}
				</h2>
				<p className="text-muted-foreground">
					{step === 1 && "Vamos começar com suas informações básicas"}
					{step === 2 && "Agora, conte-nos sobre sua clínica"}
					{step === 3 && "Finalize com os termos de conformidade"}
				</p>
				<div className="font-medium text-muted-foreground text-xs">
					Etapa {step} de 3
				</div>
			</div>

			{/* Google Auth Button - Only show on step 1 */}
			{step === 1 && (
				<div className="space-y-4">
					<GoogleAuthButton mode="signup" />
					<div className="relative">
						<Separator />
						<div className="absolute inset-0 flex items-center justify-center">
							<span className="bg-background px-3 text-muted-foreground text-sm">
								Ou continue com
							</span>
						</div>
					</div>
				</div>
			)}

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<form className="space-y-6" onSubmit={handleSubmit}>
				{step === 1 && renderStep1()}
				{step === 2 && renderStep2()}
				{step === 3 && renderStep3()}

				<div className="flex items-center justify-between pt-4">
					{step > 1 ? (
						<Button
							className="border-border hover:bg-muted/50"
							onClick={() => setStep(step - 1)}
							type="button"
							variant="outline"
						>
							← Voltar
						</Button>
					) : (
						<div />
					)}

					{step < 3 ? (
						<Button
							className="neonpro-button-primary"
							onClick={handleNextStep}
							type="button"
						>
							Continuar →
						</Button>
					) : (
						<Button
							className="neonpro-button-primary"
							disabled={isSubmitting || loading}
							type="submit"
						>
							{isSubmitting || loading ? (
								<>
									<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
									Criando sua conta...
								</>
							) : (
								<>
									<UserPlus className="mr-2 h-4 w-4" />
									Criar Conta Gratuita
								</>
							)}
						</Button>
					)}
				</div>
			</form>

			<div className="pt-4 text-center">
				<p className="text-muted-foreground text-sm">
					Já tem uma conta?{" "}
					<a
						className="font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/80 hover:no-underline"
						href="/login"
					>
						Fazer login agora
					</a>
				</p>
			</div>
		</div>
	);
}
