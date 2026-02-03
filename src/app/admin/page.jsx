"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart as BarChartIcon,
  ListChecks,
  Users,
  PlusCircle,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";
import {
  Bar,
  Pie,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart as PieChartComponent,
  BarChart as BarChartComponent,
  LineChart as LineChartComponent,
} from "recharts";
import Link from "next/link";
import { fetchMissions } from "@/services/fetchData";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

export default function AdminDashboardPage() {
  const [missions, setMisions] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [registrationData, setRegistrationData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, r, u, uBym] = await Promise.all([
          fetchMissions("admin-missions", API_BASE_URL + "missions/admin/all"),
          fetchMissions("admin-reports", API_BASE_URL + "reports"),
          fetchMissions("admin-users", API_BASE_URL + "users"),
          fetchMissions(
            "usersMonth",
            API_BASE_URL + "dashboardadmin/usersMonth",
          ),
        ]);
        if (m && r && u && uBym) {
          setMisions(m);
          setReports(r);
          setUsers(u);
          setRegistrationData(uBym);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  // 1. Mission Status Distribution
  const missionStatusCounts = missions.reduce((acc, mission) => {
    acc[mission.status] = (acc[mission.status] || 0) + 1;
    return acc;
  }, {});
  const missionStatusData = Object.entries(missionStatusCounts).map(
    ([name, value]) => ({ name, value }),
  );

  // 2. Report Status Distribution
  const reportStatusCounts = reports.reduce((acc, report) => {
    if (report.status && report.status !== "") {
      acc[report.status] = (acc[report.status] || 0) + 1;
    }
    return acc;
  }, {});
  const reportStatusData = Object.entries(reportStatusCounts).map(
    ([name, value]) => ({ name, value }),
  );

  // 3. Missions per Category
  const missionsByCategoryCounts = missions.reduce((acc, mission) => {
    acc[mission.category] = (acc[mission.category] || 0) + 1;
    return acc;
  }, {});
  const missionsByCategoryData = Object.entries(missionsByCategoryCounts).map(
    ([name, count]) => ({ name, count }),
  );

  // 4. Average Reward per Category
  const rewardByCategory = missions.reduce((acc, mission) => {
    const reward = parseFloat(mission.reward) || 0;
    if (!acc[mission.category]) {
      acc[mission.category] = { totalReward: 0, count: 0 };
    }
    acc[mission.category].totalReward += reward;
    acc[mission.category].count += 1;
    return acc;
  }, {});

  const averageRewardData = Object.entries(rewardByCategory).map(
    ([name, data]) => ({
      name,
      averageReward:
        data.count > 0 ? Math.round(data.totalReward / data.count) : 0,
    }),
  );

  // 5. CORRECTED Mission Completion Rate Calculation
  const calculateCompletionRate = () => {
    if (!missions || missions.length === 0) {
      return {
        completionRate: 0,
        completionData: [],
        approvedCount: 0,
        submittedCount: 0,
        pendingCount: 0,
        refusedCount: 0,
      };
    }

    // Count missions by status
    const approvedCount = reports.filter((m) => m.status === "approved").length;
    const submittedCount = reports.filter(
      (m) => m.status === "submitted",
    ).length;
    /*const pendingApprovalCount = missions.filter(
      (m) => m.status === "pending_approval",
    ).length;*/
    const refusedCount = reports.filter((m) => m.status === "refused").length;

    // Total submitted missions (includes submitted, approved, refused, pending_approval)
    const totalSubmittedCount = submittedCount + approvedCount + refusedCount;
    const pendingCount = submittedCount;

    // Calculate completion rate (approved out of all submitted)
    const completionRate =
      totalSubmittedCount > 0
        ? Math.round((approvedCount / totalSubmittedCount) * 100)
        : 0;

    // Prepare data for pie chart (only show categories with values > 0)
    const completionData = [
      approvedCount > 0 && {
        name: "Approved",
        value: approvedCount,
      },
      pendingCount > 0 && {
        name: "Pending",
        value: pendingCount,
      },
      refusedCount > 0 && {
        name: "Refused",
        value: refusedCount,
      },
    ].filter(Boolean);

    return {
      completionRate,
      completionData,
      approvedCount,
      submittedCount: totalSubmittedCount,
      pendingCount,
      refusedCount,
    };
  };

  const {
    completionRate,
    completionData,
    approvedCount,
    submittedCount,
    pendingCount,
    refusedCount,
  } = calculateCompletionRate();

  // Chart Colors
  const COLORS_MISSION_STATUS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];
  const COLORS_REPORT_STATUS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--destructive))",
    "hsl(var(--muted-foreground))",
  ];

  // Summary calculations
  const totalPendingReports =
    reportStatusData.find((d) => d.name === "submitted")?.value || 0;
  const totalActiveMissions =
    missionStatusData.find((d) => d.name === "available")?.value || 0;

  const totalRegisteredShoppers = users.filter(
    (u) => u.role === "shopper",
  ).length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <BarChartIcon className="w-8 h-8" /> Admin Dashboard
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Reports
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendingReports}</div>
            <p className="text-xs text-muted-foreground">
              Reports awaiting review
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Missions
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveMissions}</div>
            <p className="text-xs text-muted-foreground">
              Available, assigned, or submitted
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registered Shoppers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegisteredShoppers}</div>
            <p className="text-xs text-muted-foreground">
              Total active shopper accounts
            </p>
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
            <Link
              href="/admin/missions/new"
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Create New Mission
            </Link>
          </Button>
          <Button asChild variant="outline">
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
          <CardTitle className="text-lg font-medium">
            Statistics Overview
          </CardTitle>
          <CardDescription>Key metrics and distributions.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Chart 1: Mission Status Distribution */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Mission Status
              </CardTitle>
            </CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChartComponent>
                  <Pie
                    data={missionStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {missionStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS_MISSION_STATUS[
                            index % COLORS_MISSION_STATUS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChartComponent>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Report Status Distribution */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Report Status
              </CardTitle>
            </CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChartComponent>
                  <Pie
                    data={reportStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    label
                  >
                    {reportStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS_REPORT_STATUS[
                            index % COLORS_REPORT_STATUS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChartComponent>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 3: New Shopper Registrations */}
          <Card className="col-span-1 lg:col-span-2 xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <LineChartIcon className="w-4 h-4" />
                New Shoppers / Month
              </CardTitle>
            </CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChartComponent data={registrationData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    fontSize={12}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    fontSize={12}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="shoppers"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChartComponent>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 4: Missions per Category */}
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BarChartIcon className="w-4 h-4" />
                Missions by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChartComponent
                  data={missionsByCategoryData}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    fontSize={12}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    fontSize={12}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--accent))", opacity: 0.1 }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChartComponent>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 5: Average Reward per Category */}
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BarChartIcon className="w-4 h-4" />
                Avg. Reward by Category ($)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChartComponent data={averageRewardData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    fontSize={12}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    fontSize={12}
                  />
                  <Tooltip
                    formatter={(value) => `$${value}`}
                    cursor={{ fill: "hsl(var(--accent))", opacity: 0.1 }}
                  />
                  <Bar
                    dataKey="averageReward"
                    fill="hsl(var(--accent))"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChartComponent>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 6: CORRECTED Mission Completion Rate */}
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Mission Completion Rate
              </CardTitle>
              <CardDescription className="text-xs">
                Success rate of submitted missions
              </CardDescription>
            </CardHeader>
            <CardContent className="h-60 flex flex-col items-center justify-center relative">
              {submittedCount > 0 ? (
                <>
                  <ResponsiveContainer width="80%" height="70%">
                    <PieChartComponent>
                      <Pie
                        data={completionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={2}
                        labelLine={false}
                      >
                        {completionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.name === "Approved"
                                ? "hsl(var(--chart-1))"
                                : entry.name === "Refused"
                                  ? "hsl(var(--destructive))"
                                  : "hsl(var(--chart-3))"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          `${value} mission${value !== 1 ? "s" : ""}`,
                          name,
                        ]}
                      />
                    </PieChartComponent>
                  </ResponsiveContainer>

                  {/* Center text overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-foreground">
                      {completionRate}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Success Rate
                    </span>
                  </div>

                  {/* Statistics below the chart */}
                  <div className="text-xs text-muted-foreground text-center space-y-1 mt-2">
                    <p>
                      {approvedCount} approved out of {submittedCount} submitted
                    </p>
                    <div className="flex justify-center gap-3 text-xs flex-wrap">
                      {approvedCount > 0 && (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-1))]"></div>
                          Approved ({approvedCount})
                        </span>
                      )}
                      {pendingCount > 0 && (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-3))]"></div>
                          Pending ({pendingCount})
                        </span>
                      )}
                      {refusedCount > 0 && (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-[hsl(var(--destructive))]"></div>
                          Refused ({refusedCount})
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2">
                  <div className="text-6xl text-muted-foreground/20">📊</div>
                  <div className="text-sm font-medium text-muted-foreground">
                    No Submitted Missions
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Completion rate will appear when missions are submitted
                  </div>
                  {missions.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                      Total missions: {missions.length}
                      <br />
                      Available/Assigned:{" "}
                      {
                        missions.filter((m) =>
                          ["available", "assigned"].includes(m.status),
                        ).length
                      }
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
