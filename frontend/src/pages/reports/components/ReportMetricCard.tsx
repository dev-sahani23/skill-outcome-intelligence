import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ReportMetricCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
}

export function ReportMetricCard({ title, value, subtitle }: ReportMetricCardProps) {
  return (
    <Card className="indus-panel border-none">
      <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">{title}</h4>
        <div className="text-3xl font-bold indus-number">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
