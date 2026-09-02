import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { auth } from "../../lib/auth";

export default function TraineeDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    auth.getMe().then(res => {
      setUser(res.user);
    }).catch(console.error);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">
        Welcome {user?.traineeProfile?.fullName || user?.email || ""}!
      </h1>
      <p className="text-slate-500">Track your enrollments and update your employment status.</p>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md mb-2 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Advanced Web Development</h3>
              <p className="text-sm text-slate-500">Status: Enrolled</p>
            </div>
            <Button variant="outline" className="w-full mt-4">Browse More Courses</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Outcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-slate-500">Help the government track skill impact by updating your latest employment outcome.</p>
              <Button className="w-full">Report Employment / Wage Update</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
