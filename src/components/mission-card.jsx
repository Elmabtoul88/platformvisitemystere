import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, DollarSign, Tag, Briefcase, UserCheck } from "lucide-react";
import { format } from 'date-fns';
import { mockUser } from "@/lib/mock-data"; // Import mockUser to check assignment

export function MissionCard({ mission, onViewDetails, onApply, showApplyButton = true, detailsButtonText = "View Details" }) {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'available': return 'secondary';
      case 'assigned': return 'default';
      case 'completed': return 'outline';
      case 'submitted': return 'outline'; // Keep outline for pending review
      case 'approved': return 'outline'; // Approved often shown in completed list with more details
      case 'refused': return 'destructive'; // Add refusal status
      default: return 'secondary';
    }
  };

  // Use specific classes for colors where needed
  const getStatusClasses = (status) => {
     switch (status) {
       case 'assigned': return 'bg-primary/10 text-primary-foreground'; // Teal background for assigned
       case 'submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-300'; // Yellow for submitted
       case 'approved': return 'bg-green-100 text-green-800 border-green-300'; // Green for approved
       case 'refused': return ''; // destructive variant handles red
       default: return ''; // Default uses secondary variant style
     }
   };

  const getStatusText = (status) => {
    switch (status) {
        case 'available': return 'Available';
        case 'assigned': return 'Assigned';
        case 'completed': return 'Completed'; // Should typically be 'approved' in data
        case 'submitted': return 'Pending Review'; // More descriptive
        case 'approved': return 'Approved';
        case 'refused': return 'Refused';
        default: return status;
      }
  }

  const isAssignedToCurrentUser = Array.isArray(mission.assignedTo)
    ? mission.assignedTo.includes(mockUser.id) // Use the imported mockUser's ID
    : mission.assignedTo === mockUser.id;


  return (
    <Card className="w-full max-w-md shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full"> {/* Ensure card takes full height */}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
           <CardTitle className="text-lg font-semibold text-primary">{mission.title}</CardTitle>
           <Badge variant={getStatusVariant(mission.status)} className={`capitalize text-xs px-2 py-0.5 ${getStatusClasses(mission.status)}`}> {/* Applied status classes */}
             {getStatusText(mission.status)}
           </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> {mission.businessName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm flex-grow"> {/* Added flex-grow */}
        <p className="text-muted-foreground line-clamp-2">{mission.description}</p>
        <div className="flex items-center gap-1 text-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{mission.location}</span>
        </div>
        <div className="flex items-center gap-1 text-foreground">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Deadline: {format(mission.deadline, 'PP')}</span> {/* Use PP for shorter date format */}
        </div>
         <div className="flex items-center gap-1 text-foreground">
          <Tag className="w-4 h-4 text-primary" />
          <span>Category: {mission.category}</span>
        </div>
        <div className="flex items-center gap-1 font-medium text-accent-foreground bg-accent/10 px-2 py-1 rounded w-fit">
          <DollarSign className="w-4 h-4 text-accent" />
          <span>Reward: ${mission.reward}</span>
        </div>
         {/* Show assigned status more clearly if it's assigned TO THE CURRENT USER */}
          {mission.status === 'assigned' && isAssignedToCurrentUser && (
             <div className="flex items-center gap-1 text-sm text-green-600 font-medium pt-1">
               <UserCheck className="w-4 h-4" />
               <span>Assigned to you</span>
             </div>
           )}
           {/* Indicate if assigned to someone else (optional) */}
           {mission.status === 'assigned' && !isAssignedToCurrentUser && mission.assignedTo && (
               <div className="flex items-center gap-1 text-sm text-muted-foreground pt-1">
                  <UserCheck className="w-4 h-4" />
                  <span>Assigned</span>
                </div>
           )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4 border-t"> {/* Added border-t */}
        {/* Use the dynamic button text */}
        {onViewDetails && mission.status !== 'available' && ( // Only show details button if not available or if it's the user's assigned mission
           (mission.status === 'assigned' || mission.status === 'submitted' ) && isAssignedToCurrentUser &&
           <Button variant="outline" size="sm" onClick={() => onViewDetails(mission.id)}>
            {detailsButtonText} {/* Use the prop here */}
           </Button>
        )}
        {/* Keep apply button logic */}
        {showApplyButton && mission.status === 'available' && onApply && (
           <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => onApply(mission.id)}>
            Apply Now
          </Button>
        )}
        {/* Link to details page for available missions */}
         {onViewDetails && mission.status === 'available' && (
            <Button variant="outline" size="sm" onClick={() => onViewDetails(mission.id)}>
                View Details
            </Button>
         )}
      </CardFooter>
    </Card>
  );
}
