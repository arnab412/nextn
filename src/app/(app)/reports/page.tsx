import ReportsView from "@/components/reports/ReportsView";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Filter and view income and expense reports.
        </p>
      </div>
      <ReportsView />
    </div>
  );
}
