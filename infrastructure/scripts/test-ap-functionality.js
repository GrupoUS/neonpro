// Teste das funcionalidades do Accounts Payable com Supabase Online
// Usage: node scripts/test-ap-functionality.js

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!(supabaseUrl && supabaseServiceKey)) {
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

async function testAPFunctionality() {
	try {
		const { data: vendors, error: vendorsError } = await supabase
			.from("vendors")
			.select("*")
			.limit(5);

		if (vendorsError) {
		} else {
			vendors.forEach((_vendor) => {});
		}
		const { data: categories, error: categoriesError } = await supabase
			.from("expense_categories")
			.select("*");

		if (categoriesError) {
		} else {
			categories.forEach((_cat) => {});
		}
		const { data: payables, error: payablesError } = await supabase
			.from("accounts_payable")
			.select(
				`
        *,
        vendors:vendor_id(company_name),
        expense_categories:expense_category_id(category_name)
      `,
			)
			.limit(5);

		if (payablesError) {
		} else {
			payables.forEach((_payable) => {});
		}
		const { data: payments, error: paymentsError } = await supabase
			.from("ap_payments")
			.select(`
        *,
        vendors:vendor_id(company_name),
        accounts_payable:accounts_payable_id(invoice_number)
      `);

		if (paymentsError) {
		} else {
			payments.forEach((_payment) => {});
		}
		const { data: schedules, error: schedulesError } = await supabase
			.from("payment_schedules")
			.select(`
        *,
        vendors:vendor_id(company_name),
        expense_categories:expense_category_id(category_name)
      `);

		if (schedulesError) {
		} else {
			schedules.forEach((_schedule) => {});
		}

		// Total em aberto
		const { data: openPayables } = await supabase
			.from("accounts_payable")
			.select("net_amount")
			.in("status", ["pending", "approved", "overdue"]);

		const _totalOpen =
			openPayables?.reduce(
				(sum, p) => sum + Number.parseFloat(p.net_amount),
				0,
			) || 0;

		// Contas vencidas
		const { data: overduePayables } = await supabase
			.from("accounts_payable")
			.select("*")
			.eq("status", "overdue");

		// Próximos vencimentos (próximos 30 dias)
		const thirtyDaysFromNow = new Date();
		thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

		const { data: upcomingPayables } = await supabase
			.from("accounts_payable")
			.select("*")
			.lte("due_date", thirtyDaysFromNow.toISOString().split("T")[0])
			.in("status", ["pending", "approved"]);
	} catch (_error) {
		process.exit(1);
	}
}

testAPFunctionality();
