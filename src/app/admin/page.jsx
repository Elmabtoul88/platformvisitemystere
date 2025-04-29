'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart as BarChartIcon, ListChecks, Users, PlusCircle, PieChart, LineChart, Bar, Pie, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'lucide-react'; // Import chart icons and Recharts components
import Link from 'next/link';
import { mockMissions, mockReports } from '@/lib/mock-data'; // Import mock data
import { mockUsers } from './users/users-mock'; // Import mock user data


// --- Mock Data Preparation for Charts ---

// 1. Mission Status Distribution
const missionStatusCounts = mockMissions.reduce((acc, mission) => {
  acc[mission.status] = (acc[mission.status] || 0) + 1;
  return acc;
}, {});
const missionStatusData = Object.entries(missionStatusCounts).map(([name, value]) => ({ name, value }));

// 2. Report Status Distribution (Assuming reports have status)
const reportStatusCounts = mockReports.reduce((acc, report) => {
  acc[report.status] = (acc[report.status] || 0) + 1;
  return acc;
}, {});
const reportStatusData = Object.entries(reportStatusCounts).map(([name, value]) => ({ name, value }));


// 3. New Shopper Registrations (Example monthly data)
// In a real app, fetch aggregated data from your backend
const registrationData = [
  { month: 'Jan', shoppers: 5 },
  { month: 'Feb', shoppers: 8 },
  { month: 'Mar', shoppers: 15 },
  { month: 'Apr', shoppers: 12 },
  { month: 'May', shoppers: 20 },
  { month: 'Jun', shoppers: 18 },
];

// 4. Missions per Category
const missionsByCategoryCounts = mockMissions.reduce((acc, mission) => {
    acc[mission.category] = (acc[mission.category] || 0) + 1;
    return acc;
}, {});
const missionsByCategoryData = Object.entries(missionsByCategoryCounts).map(([name, count]) => ({ name, count }));

// 5. Average Reward per Category (Example calculation)
const rewardByCategory = mockMissions.reduce((acc, mission) => {
    if (!acc[mission.category]) {
        acc[mission.category] = { totalReward: 0, count: 0 };
    }
    acc[mission.category].totalReward += mission.reward;
    acc[mission.category].count += 1;
    return acc;
}, {});
const averageRewardData = Object.entries(rewardByCategory).map(([name, data]) => ({
    name,
    averageReward: data.count > 0 ? Math.round(data.totalReward / data.count) : 0,
}));

// 6. Mission Completion Rate (Approved vs Total Assigned/Submitted/Approved/Refused)
const relevantMissions = mockMissions.filter(m => ['assigned', 'submitted', 'approved', 'refused'].includes(m.status));
const approvedCount = mockMissions.filter(m => m.status === 'approved').length;
const completionRate = relevantMissions.length > 0 ? Math.round((approvedCount / relevantMissions.length) * 100) : 0;
const completionData = [
    { name: 'Approved', value: approvedCount },
    { name: 'Other (Assigned/Submitted/Refused)', value: relevantMissions.length - approvedCount },
]


// --- Chart Colors (using CSS variables) ---
const COLORS_MISSION_STATUS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const COLORS_REPORT_STATUS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--destructive))', 'hsl(var(--muted-foreground))']; // Example colors for report status
const COLORS_COMPLETION = ['hsl(var(--chart-1))', 'hsl(var(--muted))'];

// --- Dashboard Component ---
export default function AdminDashboardPage() {
  const totalPendingReports = reportStatusData.find(d => d.name === 'submitted')?.value || 0;
  const totalActiveMissions = (missionStatusData.find(d => d.name === 'assigned')?.value || 0) + (missionStatusData.find(d => d.name === 'available')?.value || 0) + (missionStatusData.find(d => d.name === 'submitted')?.value || 0);
  const totalRegisteredShoppers = mockUsers.filter(u => u.role === 'shopper').length;


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary flex items-center gap-2">
        <BarChartIcon className="w-8 h-8" /> Admin Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reports</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendingReports}</div>
            <p className="text-xs text-muted-foreground">Reports awaiting review</p>
          </CardContent>
        </Card>
         <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Missions</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveMissions}</div>
            <p className="text-xs text-muted-foreground">Available, assigned, or submitted</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registered Shoppers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegisteredShoppers}</div>
            <p className="text-xs text-muted-foreground">Total active shopper accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-sm mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           <Button asChild variant="outline">
             <Link href="/admin/missions/new" className="flex items-center gap-2">
               <PlusCircle className="w-4 h-4" /> Create New Mission
             </Link>
           </Button>
           <Button asChild variant="outline">
             {/* Link to the mission list page where reports can be reviewed */}
             <Link href="/admin/missions" className="flex items-center gap-2">
               <ListChecks className="w-4 h-4" /> Manage Missions & Reports
             </Link>
           </Button>
            <Button asChild variant="outline">
             <Link href="/admin/users" className="flex items-center gap-2">
               <Users className="w-4 h-4" /> Manage Shopper Accounts
             </Link>
           </Button>
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Statistics Overview</CardTitle>
          <CardDescription>Key metrics and distributions.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* Chart 1: Mission Status Distribution */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2"><PieChart className="w-4 h-4"/>Mission Status</CardTitle>
            </CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={missionStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {missionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_MISSION_STATUS[index % COLORS_MISSION_STATUS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Report Status Distribution */}
           <Card className="col-span-1">
            <CardHeader>
               <CardTitle className="text-base font-medium flex items-center gap-2"><PieChart className="w-4 h-4"/>Report Status</CardTitle>
            </CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reportStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80} label>
                    {reportStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_REPORT_STATUS[index % COLORS_REPORT_STATUS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 3: New Shopper Registrations */}
           <Card className="col-span-1 lg:col-span-2 xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2"><LineChart className="w-4 h-4"/>New Shoppers / Month</CardTitle>
            </CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="shoppers" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

            {/* Chart 4: Missions per Category */}
            <Card className="col-span-1 lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2"><BarChartIcon className="w-4 h-4"/>Missions by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={missionsByCategoryData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                            <Tooltip cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}/>
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Chart 5: Average Reward per Category */}
            <Card className="col-span-1 lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2"><BarChartIcon className="w-4 h-4"/>Avg. Reward by Category ($)</CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={averageRewardData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis type="number" tickFormatter={(value) => `$${value}`} tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                            <Tooltip formatter={(value) => `$${value}`} cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}/>
                            <Bar dataKey="averageReward" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Chart 6: Completion Rate */}
            <Card className="col-span-1 lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2"><PieChart className="w-4 h-4"/>Mission Completion Rate</CardTitle>
                </CardHeader>
                <CardContent className="h-60 flex flex-col items-center justify-center">
                     <ResponsiveContainer width="80%" height="80%">
                        <PieChart>
                          <Pie data={completionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} labelLine={false}>
                            {completionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS_COMPLETION[index % COLORS_COMPLETION.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          {/* Custom label in the center */}
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="bold" fill="hsl(var(--foreground))">
                            {completionRate}%
                          </text>
                        </PieChart>
                     </ResponsiveContainer>
                     <p className="text-xs text-muted-foreground mt-2 text-center">
                        Percentage of assigned/submitted missions that were approved.
                     </p>
                </CardContent>
            </Card>


        </CardContent>
      </Card>

    </div>
  );
}
