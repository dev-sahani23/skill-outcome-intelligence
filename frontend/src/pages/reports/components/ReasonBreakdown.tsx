import { RateBar } from "./RateBar";

interface ReasonBreakdownProps {
  reasons: {
    reasonCode: string;
    count: number;
    percent: number | null;
  }[];
}

const formatReason = (code: string) => {
  return code.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
};

export function ReasonBreakdown({ reasons }: ReasonBreakdownProps) {
  if (reasons.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No non-placement data available.</p>;
  }

  return (
    <div className="space-y-4">
      {reasons.map((r, i) => (
        <RateBar 
          key={r.reasonCode}
          label={`${i + 1}. ${formatReason(r.reasonCode)}`}
          rate={r.percent}
          count={r.count}
          type="danger"
        />
      ))}
    </div>
  );
}
