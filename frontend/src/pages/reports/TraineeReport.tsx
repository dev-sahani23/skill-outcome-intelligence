import { formatINR, formatDate } from "@/utils/formatters";

export function TraineeReport({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Info */}
      <div className="indus-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {data.trainee.name}
          </h2>
          <p className="text-muted-foreground">
            {data.trainee.district || "Unknown District"} • {data.trainee.gender || "Not specified"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Generated At</p>
          <p className="font-mono text-sm">{formatDate(data.generatedAt)}</p>
        </div>
      </div>

      {/* Training History */}
      <div className="indus-panel p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Training History</h3>
        {data.training.length === 0 ? (
          <p className="text-muted-foreground italic">No training records found.</p>
        ) : (
          <div className="space-y-4">
            {data.training.map((t: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 bg-chassis rounded-lg border border-border">
                <div>
                  <p className="font-semibold text-foreground">{t.courseName}</p>
                  <p className="text-sm text-muted-foreground">{t.providerName}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.certified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {t.certified ? "Certified" : "In Progress/Not Certified"}
                  </span>
                  {t.completedDate && <p className="text-xs text-muted-foreground mt-1">Completed: {formatDate(t.completedDate)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outcome & Wage Progression */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="indus-panel p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Current Status</h3>
          {data.outcome ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground uppercase">Status</p>
                <p className="font-semibold text-lg capitalize text-foreground">{data.outcome.currentStatus.replace('_', ' ')}</p>
              </div>
              {data.outcome.employerName && (
                <div>
                  <p className="text-sm text-muted-foreground uppercase">Employer</p>
                  <p className="text-foreground">{data.outcome.employerName}</p>
                </div>
              )}
              {data.outcome.jobRole && (
                <div>
                  <p className="text-sm text-muted-foreground uppercase">Job Role</p>
                  <p className="text-foreground">{data.outcome.jobRole}</p>
                </div>
              )}
              {data.outcome.trainingRelevance && (
                <div>
                  <p className="text-sm text-muted-foreground uppercase">Training Relevance</p>
                  <p className="text-foreground">{data.outcome.trainingRelevance}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No outcome recorded.</p>
          )}
        </div>

        {data.outcome?.currentStatus === "unemployed" && data.nonPlacementReason ? (
          <div className="indus-panel p-6 border-l-4 border-red-500">
            <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2 flex items-center gap-2">
              <span className="text-red-500">⚠️</span> Non-Placement Reason
            </h3>
            <p className="font-semibold text-foreground text-lg mb-2">
              {data.nonPlacementReason.reasonCode.split('_').join(' ')}
            </p>
            <p className="text-sm text-muted-foreground">Source: {data.nonPlacementReason.reasonSource}</p>
            <p className="text-sm mt-2">{data.nonPlacementReason.detail}</p>
          </div>
        ) : (
          <div className="indus-panel p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Wage Progression</h3>
            {data.wageProgression ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase">Initial Wage</p>
                    <p className="font-bold text-xl indus-number">{data.wageProgression.initialWage ? formatINR(data.wageProgression.initialWage) : "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground uppercase">Current Wage</p>
                    <p className="font-bold text-xl text-green-600 indus-number">{data.wageProgression.currentWage ? formatINR(data.wageProgression.currentWage) : "N/A"}</p>
                  </div>
                </div>
                {data.wageProgression.changePercent !== null && (
                  <div className={`text-center py-2 rounded-lg ${data.wageProgression.changePercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <span className="font-bold">{data.wageProgression.changePercent > 0 ? "+" : ""}{data.wageProgression.changePercent}%</span> progression
                  </div>
                )}
                <p className="text-xs text-muted-foreground text-center">Based on {data.wageProgression.recordCount} records</p>
              </div>
            ) : (
              <p className="text-muted-foreground italic">No wage records available.</p>
            )}
          </div>
        )}
      </div>

      {/* Follow-up History */}
      <div className="indus-panel p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Follow-up History</h3>
        {data.followUpHistory.length === 0 ? (
          <p className="text-muted-foreground italic">No follow-ups recorded yet.</p>
        ) : (
          <div className="flex flex-wrap gap-4 items-center">
            {data.followUpHistory.map((f: any, i: number) => (
              <div key={i} className="flex flex-col items-center flex-1 min-w-20">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-sm border ${f.status === 'RESPONDED' ? 'bg-green-500 text-white border-green-600' : f.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600 border-yellow-200' : 'bg-chassis text-muted-foreground border-border'}`}>
                  {f.status === 'RESPONDED' ? '✓' : f.status === 'PENDING' ? '○' : '!'}
                </div>
                <p className="text-xs font-medium uppercase text-center">{f.stage.replace('_', ' ')}</p>
                <p className="text-[10px] text-muted-foreground mt-1 capitalize text-center">{f.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
