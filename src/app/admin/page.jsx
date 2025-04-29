'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, ListChecks, Users, PlusCircle } from 'lucide-react'; // Import relevant icons
import Link from 'next/link';

// Mock data for dashboard summary (replace with real data fetching)
const dashboardSummary = {
    pendingReports: 15,
    activeMissions: 42,
    registeredShoppers: 153,
};

export default function AdminDashboardPage() {
  // Add logic here to fetch real data, handle admin actions, etc.

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary flex items-center gap-2">
        <BarChart className="w-8 h-8" /> Admin Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reports</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardSummary.pendingReports}</div>
            <p className="text-xs text-muted-foreground">Reports awaiting review</p>
          </CardContent>
        </Card>
         <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Missions</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardSummary.activeMissions}</div>
            <p className="text-xs text-muted-foreground">Missions currently assigned or available</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registered Shoppers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardSummary.registeredShoppers}</div>
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
             <Link href="/admin/missions" className="flex items-center gap-2">
               <ListChecks className="w-4 h-4" /> Review Submitted Reports
             </Link>
           </Button>
            <Button asChild variant="outline">
             <Link href="/admin/users" className="flex items-center gap-2">
               <Users className="w-4 h-4" /> Manage Shopper Accounts
             </Link>
           </Button>
            {/* Add more actions as needed */}
        </CardContent>
      </Card>

      {/* Placeholder for recent activity or statistics */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Recent Activity / Statistics</CardTitle>
          <CardDescription>Overview of recent submissions, approvals, etc.</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">
                Detailed charts and activity logs will be displayed here. (Coming Soon)
           </p>
           {/* Add charts using ShadCN/Recharts here */}
        </CardContent>
      </Card>

    </div>
  );
}