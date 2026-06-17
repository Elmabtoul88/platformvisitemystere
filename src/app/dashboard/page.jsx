'use client';

import { MissionList } from "@/components/mission-list";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";

export default function ShopperDashboardPage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Top Welcome Bar */}
      <div className="bg-white border-b border-border/50 py-4 mb-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage src={user?.profilePicUrl} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-sm font-black text-primary flex items-center gap-1.5">
                        Bonjour, {user?.name?.split(' ')[0]} <Sparkles className="w-3.5 h-3.5 text-accent" />
                    </h2>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Espace Shopper Certifié</p>
                </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
                <div className="text-right">
                    <div className="text-sm font-black text-primary">{user?.completedMissions || 0}</div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Audits terminés</div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-black text-accent">Niveau 1</div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Rang Expert</div>
                </div>
            </div>
        </div>
      </div>

      <MissionList />
      <Toaster />
    </main>
  );
}
