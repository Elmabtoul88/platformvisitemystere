import type { Mission } from '@/types/mission';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, DollarSign, Tag, Briefcase, UserCheck } from "lucide-react";
import { format } from 'date-fns';

interface MissionCardProps {
  mission: Mission;
  onViewDetails?: (missionId: string) => void;
  onApply?: (missionId: string) => void;
  showApplyButton?: boolean;
}

export function MissionCard({ mission, onViewDetails, onApply, showApplyButton = true }: MissionCardProps) {
  const getStatusVariant = (status: Mission['status']) => {
    switch (status) {
      case 'available': return 'secondary';
      case 'assigned': return 'default';
      case 'completed': return 'outline';
      case 'submitted': return 'outline'; // Maybe a different color?
      case 'approved': return 'outline'; // Or success?
      default: return 'secondary';
    }
  };

  const getStatusText = (status: Mission['status']) => {
    switch (status) {
        case 'available': return 'Available';
        case 'assigned': return 'Assigned';
        case 'completed': return 'Completed';
        case 'submitted': return 'Report Submitted';
        case 'approved': return 'Approved';
        default: return status;
      }
  }

  return (
    <Card className="w-full max-w-md shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
           <CardTitle className="text-lg font-semibold text-primary">{mission.title}</CardTitle>
           <Badge variant={getStatusVariant(mission.status)} className="capitalize text-xs">
             {getStatusText(mission.status)}
           </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> {mission.businessName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground line-clamp-2">{mission.description}</p>
        <div className="flex items-center gap-1 text-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{mission.location}</span>
        </div>
        <div className="flex items-center gap-1 text-foreground">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Deadline: {format(mission.deadline, 'PPP')}</span>
        </div>
         <div className="flex items-center gap-1 text-foreground">
          <Tag className="w-4 h-4 text-primary" />
          <span>Category: {mission.category}</span>
        </div>
        <div className="flex items-center gap-1 font-medium text-accent-foreground bg-accent/10 px-2 py-1 rounded w-fit">
          <DollarSign className="w-4 h-4 text-accent" />
          <span>Reward: ${mission.reward}</span>
        </div>
         {mission.status === 'assigned' && mission.assignedTo && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground pt-1">
              <UserCheck className="w-4 h-4 text-green-600" />
              <span>Assigned</span>
            </div>
          )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        {onViewDetails && (
          <Button variant="outline" size="sm" onClick={() => onViewDetails(mission.id)}>
            View Details
          </Button>
        )}
        {showApplyButton && mission.status === 'available' && onApply && (
           <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => onApply(mission.id)}>
            Apply Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
