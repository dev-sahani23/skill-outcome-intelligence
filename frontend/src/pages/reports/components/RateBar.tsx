interface RateBarProps {
  label: string;
  rate: number | null;
  count?: number;
  type?: "success" | "warning" | "danger" | "default";
}

export function RateBar({ label, rate, count, type = "default" }: RateBarProps) {
  const displayRate = rate !== null ? `${rate}%` : "N/A";
  
  let colorClass = "bg-primary";
  if (type === "success") colorClass = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]";
  else if (type === "warning") colorClass = "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
  else if (type === "danger") colorClass = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="text-muted-foreground indus-number">
          {displayRate} {count !== undefined && `(${count})`}
        </span>
      </div>
      <div className="h-2 w-full bg-chassis rounded-full overflow-hidden shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)]">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: rate !== null ? `${rate}%` : "0%" }}
        />
      </div>
    </div>
  );
}
