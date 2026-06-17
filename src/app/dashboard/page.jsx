
'use client';

import { MissionList } from "@/components/mission-list";
import { Toaster } from "@/components/ui/toaster";

export default function ShopperDashboardPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <MissionList />
      <Toaster />
    </main>
  );
}
