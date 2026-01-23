import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Briefcase,
  UserCheck,
  Users,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

export function MissionCard({
  mission,
  onViewDetails,
  onApply,
  showApplyButton = true,
  detailsButtonText = "View Details",
  userId,
}) {
  const [openModal, setOpenModal] = useState(false);

  const hasApplied =
    mission.assignedTo && Array.isArray(mission.assignedTo)
      ? mission.assignedTo.includes(userId)
      : false;

  const applicationCount =
    mission.assignedTo && Array.isArray(mission.assignedTo)
      ? mission.assignedTo.length
      : 0;

  const getStatusInfo = () => ({
    text: "Available",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: null,
  });

  const statusInfo = getStatusInfo();

  return (
    <>
      <Card className="w-full max-w-md shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-lg font-semibold text-primary">
              {mission.mission_title}
            </CardTitle>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${statusInfo.color} flex items-center`}
            >
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

          {applicationCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-orange-600 font-medium pt-1">
              <Users className="w-4 h-4" />
              <span>{applicationCount} people have applied</span>
            </div>
          )}

          {hasApplied && (
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium pt-1">
              <UserCheck className="w-4 h-4" />
              <span>You have applied to this mission</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-2 pt-4 border-t">
          {/* Bouton "See More Details" */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenModal(true)}
          >
            See More Details
          </Button>

          {/* Bouton Start Report */}
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onViewDetails(
                  mission.id,
                  mission.nomMagazin,
                  mission.specificStoreAddress,
                  mission.scenario,
                  mission.dateTimeMission
                )
              }
            >
              Start Report
            </Button>
          )}

          {/* Bouton Apply */}
          {showApplyButton && onApply && mission.status !== "assigned" && (
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => onApply(mission.id)}
              disabled={hasApplied || mission.status === "assigned"}
            >
              {hasApplied ? "Already Applied" : "Apply Now"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* ✅ Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Mission Details</DialogTitle>
            <DialogDescription>
              Additional information about this mission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <p>
              <strong>🏪 Store Name:</strong> {mission.nomMagazin || "N/A"}
            </p>
            <p>
              <strong>📍 Store Address:</strong>{" "}
              {mission.specificStoreAddress || "N/A"}
            </p>
            <p>
              <strong>📅 Date de visite:</strong>{" "}
              {mission.dateTimeMission
                ? format(new Date(mission.dateTimeMission), "PPP")
                : "N/A"}
            </p>
            <p>
              <strong>📖 Scenario:</strong>
            </p>
            <div className="bg-muted p-3 rounded text-justify whitespace-pre-wrap">
              {mission.scenario || "No scenario provided."}
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
