"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import type { Database } from "@/types/supabase";

type FinancialTransaction =
	Database["public"]["Tables"]["financial_transactions"]["Row"];

type DailyRevenue = {
	date: string;
	amount: number;
};

type ServiceRevenue = {
	serviceName: string;
	totalRevenue: number;
	transactionCount: number;
};

type FinancialHook = {
	monthlyRevenue: number;
	dailyRevenue: DailyRevenue[];
	recentTransactions: FinancialTransaction[];
	revenueByService: ServiceRevenue[];
	totalIncome: number;
	totalExpenses: number;
	netProfit: number;
	loading: boolean;
	error: Error | null;
	refreshFinancialData: () => Promise<void>;
};

export function useFinancialData(): FinancialHook {
	const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const supabase = createClient();

	const fetchFinancialData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			// Buscar transações dos últimos 6 meses
			const sixMonthsAgo = new Date();
			sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

			const { data, error: fetchError } = await supabase
				.from("financial_transactions")
				.select("*")
				.gte("date", sixMonthsAgo.toISOString())
				.order("date", { ascending: false });

			if (fetchError) {
				throw new Error(fetchError.message);
			}

			setTransactions(data || []);
		} catch (err) {
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	}, [supabase]);

	// Receita mensal atual
	const monthlyRevenue = useMemo(() => {
		const currentMonth = new Date();
		const startOfMonth = new Date(
			currentMonth.getFullYear(),
			currentMonth.getMonth(),
			1,
		);

		return transactions
			.filter(
				(transaction) =>
					transaction.type === "income" &&
					new Date(transaction.date) >= startOfMonth,
			)
			.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
	}, [transactions]);

	// Receita diária dos últimos 30 dias
	const dailyRevenue = useMemo(() => {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const dailyMap = new Map<string, number>();

		transactions
			.filter(
				(transaction) =>
					transaction.type === "income" &&
					new Date(transaction.date) >= thirtyDaysAgo,
			)
			.forEach((transaction) => {
				const dateKey = new Date(transaction.date).toISOString().split("T")[0];
				const currentAmount = dailyMap.get(dateKey) || 0;
				dailyMap.set(dateKey, currentAmount + (transaction.amount || 0));
			});

		return Array.from(dailyMap.entries())
			.map(([date, amount]) => ({ date, amount }))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
	}, [transactions]);

	// Transações recentes (últimas 10)
	const recentTransactions = useMemo(() => {
		return transactions.slice(0, 10);
	}, [transactions]);

	// Receita por serviço
	const revenueByService = useMemo(() => {
		const serviceMap = new Map<
			string,
			{ totalRevenue: number; transactionCount: number }
		>();

		transactions
			.filter(
				(transaction) =>
					transaction.type === "income" && transaction.service_id,
			)
			.forEach((transaction) => {
				const serviceId = transaction.service_id!;
				const current = serviceMap.get(serviceId) || {
					totalRevenue: 0,
					transactionCount: 0,
				};

				serviceMap.set(serviceId, {
					totalRevenue: current.totalRevenue + (transaction.amount || 0),
					transactionCount: current.transactionCount + 1,
				});
			});

		return Array.from(serviceMap.entries())
			.map(([serviceId, data]) => ({
				serviceName: serviceId, // Aqui poderia buscar o nome real do serviço
				totalRevenue: data.totalRevenue,
				transactionCount: data.transactionCount,
			}))
			.sort((a, b) => b.totalRevenue - a.totalRevenue);
	}, [transactions]);

	// Total de entrada (income)
	const totalIncome = useMemo(() => {
		return transactions
			.filter((transaction) => transaction.type === "income")
			.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
	}, [transactions]);

	// Total de gastos (expense)
	const totalExpenses = useMemo(() => {
		return transactions
			.filter((transaction) => transaction.type === "expense")
			.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
	}, [transactions]);

	// Lucro líquido
	const netProfit = totalIncome - totalExpenses;

	// Função para atualizar dados financeiros
	const refreshFinancialData = useCallback(async () => {
		await fetchFinancialData();
	}, [fetchFinancialData]);

	// Effect para buscar dados financeiros
	useEffect(() => {
		fetchFinancialData();
	}, [fetchFinancialData]);

	// Setup real-time subscription para transações financeiras
	useEffect(() => {
		const channel = supabase
			.channel("financial-transactions-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "financial_transactions",
				},
				(payload) => {
					if (payload.eventType === "INSERT") {
						setTransactions((prev) => [
							payload.new as FinancialTransaction,
							...prev,
						]);
					} else if (payload.eventType === "UPDATE") {
						setTransactions((prev) =>
							prev.map((transaction) =>
								transaction.id === payload.new.id
									? (payload.new as FinancialTransaction)
									: transaction,
							),
						);
					} else if (payload.eventType === "DELETE") {
						setTransactions((prev) =>
							prev.filter((transaction) => transaction.id !== payload.old.id),
						);
					}
				},
			)
			.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [supabase]);

	return {
		monthlyRevenue,
		dailyRevenue,
		recentTransactions,
		revenueByService,
		totalIncome,
		totalExpenses,
		netProfit,
		loading,
		error,
		refreshFinancialData,
	};
}
