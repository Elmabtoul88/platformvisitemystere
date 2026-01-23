import { MissionList } from "@/components/mission-list";
import { Toaster } from "@/components/ui/toaster"; // Add Toaster for notifications

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <MissionList />
      <Toaster /> {/* Add Toaster component here */}
    </main>
  );
}
