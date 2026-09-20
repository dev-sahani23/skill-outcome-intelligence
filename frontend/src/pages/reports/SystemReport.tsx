import { ReportMetricCard } from "./components/ReportMetricCard";
import { formatDate, formatINR } from "@/utils/formatters";

export function SystemReport({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="indus-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            🇮🇳 System Report — Maharashtra
          </h2>
          <p className="text-muted-foreground mt-1">
            All Districts • All Sectors
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Generated At</p>
          <p className="font-mono text-sm">{formatDate(data.generatedAt)}</p>
        </div>
      </div>

      {/* Global Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportMetricCard 
          title="Total Trainees" 
          value={data.overview.totalTrainees.toLocaleString()} 
        />
        <ReportMetricCard 
          title="System Placement" 
          value={data.overview.overallPlacementRate !== null ? `${data.overview.overallPlacementRate}%` : "N/A"} 
        />
        <ReportMetricCard 
          title="Avg Wage" 
          value={data.overview.avgWageAcrossSystem ? formatINR(data.overview.avgWageAcrossSystem) : "N/A"} 
        />
        <ReportMetricCard 
          title="Avg Skill Gap" 
          value={data.overview.avgSkillGapScore !== null ? `${data.overview.avgSkillGapScore} pts` : "N/A"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* District Performance */}
        <div className="indus-panel p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">District Performance</h3>
          
          <div className="space-y-1 mt-4">
            {/* Header Row */}
            <div className="flex text-xs font-medium text-muted-foreground uppercase pb-2">
              <div className="w-1/4">District</div>
              <div className="w-1/2 text-center">Placement Rate</div>
              <div className="w-1/4 text-right">Status</div>
            </div>
            
            {data.byDistrict.map((d: any, idx: number) => {
              let colorClass = "bg-primary";
              let statusLabel = "N/A";
              let statusClass = "bg-chassis text-muted-foreground";

              if (d.performance === "strong") {
                colorClass = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]";
                statusLabel = "Strong";
                statusClass = "bg-green-100 text-green-800";
              } else if (d.performance === "average") {
                colorClass = "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
                statusLabel = "Average";
                statusClass = "bg-yellow-100 text-yellow-800";
              } else if (d.performance === "underperforming") {
                colorClass = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
                statusLabel = "⚠️ Under";
                statusClass = "bg-red-100 text-red-800 font-semibold";
              }

              return (
                <div key={idx} className="flex items-center py-2 border-b border-border/50 hover:bg-chassis/50 transition-colors">
                  <div className="w-1/4 text-sm font-medium truncate pr-2">{d.districtName}</div>
                  <div className="w-1/2 flex items-center gap-3">
                    <div className="flex-1 bg-chassis h-2 rounded-full overflow-hidden shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)]">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                        style={{ width: d.placementRate !== null ? `${d.placementRate}%` : "0%" }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground indus-number w-10 text-right">
                      {d.placementRate !== null ? `${d.placementRate}%` : "N/A"}
                    </span>
                  </div>
                  <div className="w-1/4 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Underperforming Areas Alert */}
        <div className="space-y-6">
          <div className="indus-panel p-6 border-l-4 border-red-500 bg-red-500/5">
            <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2 flex items-center gap-2">
              <span className="text-red-500">⚠️</span> Action Required
            </h3>
            
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Underperforming Districts</h4>
              {data.underperformingDistricts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.underperformingDistricts.map((d: string) => (
                    <span key={d} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-md font-medium border border-red-200">
                      {d}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None identified.</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Underperforming Sectors</h4>
              {data.underperformingSectors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.underperformingSectors.map((s: string) => (
                    <span key={s} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-md font-medium border border-red-200">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None identified.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
