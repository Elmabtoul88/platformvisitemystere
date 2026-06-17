"use client";

import React, { useState, useMemo } from 'react';
import { MissionCard } from './mission-card';
import { MissionFilters } from './mission-filters';
import { mockMissions } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchX, Sparkles, TrendingUp, MapPin } from 'lucide-react';

export function MissionList() {
  const router = useRouter();
  const [missions] = useState(mockMissions);
  const [filters, setFilters] = useState({ location: '', date: '', category: '' });

  const availableCategories = useMemo(() => {
    return [...new Set(mockMissions.map(m => m.category).filter(Boolean))];
  }, []);

  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      const locationMatch = !filters.location || mission.location.toLowerCase().includes(filters.location.toLowerCase());
      const categoryMatch = !filters.category || mission.category === filters.category;
      const dateMatch = !filters.date || new Date(mission.deadline) <= new Date(filters.date);
      const statusMatch = mission.status === 'available';

      return locationMatch && categoryMatch && dateMatch && statusMatch;
    });
  }, [missions, filters]);

  const handleApply = (missionId) => {
    router.push(`/missions/${missionId}/details`);
  };

  const handleViewDetails = (missionId) => {
    router.push(`/missions/${missionId}/details`);
  };

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-primary p-8 md:p-16 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-accent text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Opportunités exclusives
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                Trouvez votre <br/> prochaine <span className="text-accent">Mission</span>.
            </h1>
            <p className="text-lg text-primary-foreground/60 font-light leading-relaxed">
                Explorez les audits disponibles et contribuez à l'excellence opérationnelle des plus grandes marques.
            </p>
        </div>
        
        {/* Quick Stats Banner */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
                <div className="text-2xl font-black text-accent">{filteredMissions.length}</div>
                <div className="text-[10px] uppercase font-bold text-primary-foreground/40 tracking-widest">Disponibles</div>
            </div>
            <div className="space-y-1">
                <div className="text-2xl font-black text-white">48h</div>
                <div className="text-[10px] uppercase font-bold text-primary-foreground/40 tracking-widest">Délai moyen</div>
            </div>
            <div className="space-y-1">
                <div className="text-2xl font-black text-white">Luxe & Retail</div>
                <div className="text-[10px] uppercase font-bold text-primary-foreground/40 tracking-widest">Secteurs clés</div>
            </div>
            <div className="space-y-1">
                <div className="text-2xl font-black text-white">+500</div>
                <div className="text-[10px] uppercase font-bold text-primary-foreground/40 tracking-widest">Magasins</div>
            </div>
        </div>
      </div>

      {/* Advanced Filtering */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
            <h3 className="text-lg font-black text-primary flex items-center gap-2 uppercase tracking-tighter">
                <TrendingUp className="w-5 h-5 text-accent" /> Filtres de recherche
            </h3>
        </div>
        <MissionFilters
            filters={filters}
            onFilterChange={setFilters}
            categories={availableCategories}
        />
      </div>

      {/* Missions Grid */}
      {filteredMissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMissions.map(mission => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onApply={handleApply}
              onViewDetails={handleViewDetails}
              showApplyButton={true}
            />
          ))}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center py-32 space-y-6 bg-secondary/20 rounded-[3rem] border-2 border-dashed border-border">
             <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center shadow-inner">
                <SearchX className="h-10 w-10 text-muted-foreground/40" />
             </div>
             <div className="text-center space-y-2">
                <h4 className="text-xl font-black text-primary">Aucune mission trouvée</h4>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Ajustez vos filtres ou revenez plus tard pour découvrir de nouvelles opportunités.
                </p>
             </div>
         </div>
      )}
    </div>
  );
}
