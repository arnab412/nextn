import ExpenseForm from "@/components/expense/ExpenseForm";

export default function NewExpensePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Office Expense</h1>
        <p className="text-muted-foreground">
          Record a new payment made from the office.
        </p>
      </div>
      <ExpenseForm />
    </div>
  );
}
