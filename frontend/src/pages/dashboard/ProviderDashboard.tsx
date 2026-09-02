import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";

export default function ProviderDashboard() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Provider Dashboard</h1>
          <p className="text-slate-500 mt-2">Manage your training programs and track trainee enrollments.</p>
        </div>
        <Button>Create New Course</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Trainees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">840</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Placement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">72%</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500">
              Select a course to view detailed enrollment and outcome tracking.
            </div>
            {/* Table placeholder */}
            <div className="mt-4 border rounded-md p-4 text-center text-slate-400 bg-slate-50">
              No recent enrollments to show.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
