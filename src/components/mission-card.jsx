import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Briefcase,
  UserCheck,
  Users,
} from "lucide-react";
import { format } from "date-fns";

export function MissionCard({
  mission,
  onViewDetails,
  onApply,
  showApplyButton = true,
  detailsButtonText = "View Details",
  userId,
  completed = false,
}) {
  const getStatusInfo = () => {
    // Toujours affichage de "Available" même si le statut est "pending_approval"
    return {
      text: "Available",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: null,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="w-full max-w-md shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg font-semibold text-primary">
            {mission.mission_title || mission.title}
          </CardTitle>
          <span
            className={`text-xs px-2 py-1 rounded-full border ${statusInfo.color} flex items-center`}
          >
            {statusInfo.icon}
            {statusInfo.text}
          </span>
        </div>
        <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
          <Briefcase className="w-3 h-3" /> {mission.businessName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm flex-grow">
        <p className="text-muted-foreground line-clamp-2">
          {mission.description}
        </p>
        <div className="flex items-center gap-1 text-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{mission.location}</span>
        </div>
        <div className="flex items-center gap-1 text-foreground">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Deadline: {format(new Date(mission.deadline), "PP")}</span>
        </div>
        <div className="flex items-center gap-1 text-foreground">
          <Tag className="w-4 h-4 text-primary" />
          <span>Category: {mission.category}</span>
        </div>
        <div className="flex items-center gap-1 font-medium text-accent-foreground bg-accent/10 px-2 py-1 rounded w-fit">
          <DollarSign className="w-4 h-4 text-accent" />
          <span>Reward: ${mission.reward}</span>
        </div>

        {/* ///Afficher le nombre de candidatures */}
        {mission.count > 0 && (
          <div className="flex items-center gap-1 text-sm text-orange-600 font-medium pt-1">
            <Users className="w-4 h-4" />
            <span>{mission.count} people have applied</span>
          </div>
        )}

        {/* ///Afficher un messagesi l'utilisateur a déjà postulé */}
        {mission?.Applied && (
          <div className="flex items-center gap-1 text-sm text-green-600 font-medium pt-1">
            <UserCheck className="w-4 h-4" />
            <span>You have applied to this mission</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4 border-t">
        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(mission.id)}
          >
            {detailsButtonText}
          </Button>
        )}

        {/* Bouton Apply disponible même pour les missions pending_approval */}

        {!completed && (
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => onApply(mission.id)}
            disabled={Boolean(mission.applied)}
          >
            {Boolean(mission.applied) ? "Already Applied" : "Apply Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
