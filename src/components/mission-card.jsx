import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Banknote, Tag, Building2, UserCheck, ArrowRight, Clock } from "lucide-react";
import { format } from 'date-fns';
import { mockUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function MissionCard({ mission, onViewDetails, onApply, showApplyButton = true, detailsButtonText = "Voir les détails" }) {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'available': return { label: 'Disponible', variant: 'secondary', className: 'bg-green-50 text-green-700 border-green-200' };
      case 'assigned': return { label: 'Assignée', variant: 'default', className: 'bg-primary/10 text-primary-foreground border-primary/20' };
      case 'submitted': return { label: 'En revue', variant: 'outline', className: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
      case 'approved': return { label: 'Terminée', variant: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'refused': return { label: 'Refusée', variant: 'destructive', className: '' };
      default: return { label: status, variant: 'secondary', className: '' };
    }
  };

  const status = getStatusInfo(mission.status);
  const isAssignedToCurrentUser = Array.isArray(mission.assignedTo)
    ? mission.assignedTo.includes(mockUser.id)
    : mission.assignedTo === mockUser.id;

  return (
    <Card className="group relative flex flex-col h-full bg-white border-none shadow-md hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden">
      {/* Decorative colored strip */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-1.5 transition-all duration-500",
        mission.status === 'available' ? "bg-accent" : "bg-primary"
      )} />

      <CardHeader className="pb-4 pt-8">
        <div className="flex justify-between items-start mb-3">
           <div className="p-2 rounded-xl bg-secondary/50 group-hover:bg-accent/20 transition-colors duration-500">
              <Building2 className="w-5 h-5 text-primary group-hover:text-accent-foreground transition-colors" />
           </div>
           <Badge variant={status.variant} className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", status.className)}>
             {status.label}
           </Badge>
        </div>
        <CardTitle className="text-xl font-black text-primary leading-tight line-clamp-2 min-h-[3rem]">
            {mission.title}
        </CardTitle>
        <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 pt-1">
            {mission.businessName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 flex-grow pb-6">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 italic">
          "{mission.description}"
        </p>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span className="truncate">{mission.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>{format(new Date(mission.deadline), 'dd MMM yyyy')}</span>
            </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-dashed">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Récompense</span>
                <div className="flex items-center gap-1 text-2xl font-black text-primary">
                    {mission.reward} <span className="text-xs font-bold text-accent">DHS</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Secteur</span>
                <Badge variant="outline" className="border-primary/20 text-primary font-bold text-[10px] mt-1">
                    {mission.category}
                </Badge>
            </div>
        </div>

         {mission.status === 'assigned' && isAssignedToCurrentUser && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-black uppercase tracking-widest bg-green-50 p-2 rounded-lg border border-green-100">
               <UserCheck className="w-4 h-4" />
               <span>Votre Mission</span>
            </div>
         )}
      </CardContent>

      <CardFooter className="pt-0 pb-8 px-6">
        {mission.status === 'available' ? (
             <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold border-primary/20 hover:bg-primary/5" onClick={() => onViewDetails(mission.id)}>
                    Détails
                </Button>
                {onApply && (
                    <Button className="flex-[2] rounded-xl h-12 bg-primary text-white font-black hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={() => onApply(mission.id)}>
                        Postuler <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                )}
             </div>
        ) : (
            (isAssignedToCurrentUser || mission.status === 'submitted') && (
                <Button variant="outline" className="w-full rounded-xl h-12 font-bold border-primary/20 hover:bg-primary text-white transition-all group-hover:bg-primary" onClick={() => onViewDetails(mission.id)}>
                    {detailsButtonText} <ArrowRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Button>
            )
        )}
      </CardFooter>
    </Card>
  );
}
