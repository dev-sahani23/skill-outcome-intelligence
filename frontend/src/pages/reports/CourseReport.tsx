import { ReportMetricCard } from "./components/ReportMetricCard";
import { ReasonBreakdown } from "./components/ReasonBreakdown";
import { RecommendationBox } from "./components/RecommendationBox";
import { formatDate } from "@/utils/formatters";

export function CourseReport({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="indus-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            📊 Course Report — {data.subject.name}
          </h2>
          <p className="text-muted-foreground mt-1">
            {data.subject.sector || "Unknown Sector"} • {data.subject.district || "Unknown District"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Generated At</p>
          <p className="font-mono text-sm">{formatDate(data.generatedAt)}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportMetricCard 
          title="Enrolled" 
          value={data.enrollment.total} 
          subtitle="trainees"
        />
        <ReportMetricCard 
          title="Placed" 
          value={data.placement.placementRate !== null ? `${data.placement.placementRate}%` : "N/A"} 
          subtitle="placement rate"
        />
        <ReportMetricCard 
          title="Retained" 
          value={data.retention.retentionRate !== null ? `${data.retention.retentionRate}%` : "N/A"} 
          subtitle="at 6 months"
        />
        <ReportMetricCard 
          title="Course Rating" 
          value={data.courseRating !== null ? `${data.courseRating}/100` : "N/A"} 
          subtitle={data.courseRating !== null ? "AI Verified" : "Pending data"}
        />
      </div>

      {/* Breakdowns & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="indus-panel p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Top Non-Placement Reasons</h3>
          <ReasonBreakdown reasons={data.nonPlacementReasons} />
        </div>
        
        <div className="indus-panel p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Analysis & Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-chassis p-4 rounded-lg border border-border">
              <span className="text-sm font-medium text-muted-foreground uppercase">Avg Initial Wage</span>
              <span className="font-bold text-lg indus-number">
                {data.placement.avgInitialWage ? `₹${data.placement.avgInitialWage.toLocaleString()}` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center bg-chassis p-4 rounded-lg border border-border">
              <span className="text-sm font-medium text-muted-foreground uppercase">Completion Rate</span>
              <span className="font-bold text-lg indus-number">
                {data.enrollment.completionRate !== null ? `${data.enrollment.completionRate}%` : "N/A"}
              </span>
            </div>
          </div>
          <RecommendationBox text={data.recommendation} />
        </div>
      </div>
    </div>
  );
}
