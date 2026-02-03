"use client";

import React, { useState, useMemo, useEffect } from "react";
import { MissionCard } from "./mission-card";
import { MissionFilters } from "./mission-filters";
import {
  fetchMissions,
  patchMissions,
  postMissions,
} from "@/services/fetchData";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListFilter, SearchX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

export function MissionList() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    date: "",
    category: "",
  });

  useEffect(() => {
    console.log("User in MissionList:", user.id);
    const currentUser = user.id;
    //const currentUser = JSON.parse(localStorage.getItem("missionViewAuth"));
    currentUser && setUserId(currentUser);
    const getMissions = async () => {
      try {
        const data = await fetchMissions(
          "missions",
          API_BASE_URL + "missions/missionsApp/" + currentUser,
        );
        if (!data) {
          return;
        }

        const filterDataCompletedCancelled = data.filter(
          (mission) =>
            mission.status !== "completed" && mission.status !== "cancelled",
        );
        setMissions(filterDataCompletedCancelled);
        const categories = [
          ...new Set(data.map((m) => m.category).filter(Boolean)),
        ];
        setCategories(categories);
      } catch (err) {
        console.error("Error fetching missions:");
      }
    };

    getMissions();
  }, []);

  const filteredMissions = useMemo(() => {
    return missions.filter((mission) => {
      const locationMatch =
        !filters.location ||
        (mission.location &&
          mission.location
            .toLowerCase()
            .includes(filters.location.toLowerCase()));

      const categoryMatch =
        !filters.category || mission.category === filters.category;

      const dateMatch =
        !filters.date ||
        (mission.deadline &&
          new Date(mission.deadline) <= new Date(filters.date));

      const statusMatch =
        mission.status === "available" || mission.status === "pending_approval";

      return locationMatch && categoryMatch && dateMatch && statusMatch;
    });
  }, [missions, filters]);

  const handleApply = async (missionId) => {
    try {
      setMissions((prevMissions) =>
        prevMissions.map((m) =>
          m.id === missionId
            ? { ...m, applied: true, count: m.count + 1 } // update applied & increment count
            : m,
        ),
      );

      const baseUrlApplication = API_BASE_URL + "applications";
      await postMissions(
        baseUrlApplication,
        {
          user_id: userId,
          mission_id: missionId,
          status: "pending",
        },
        "applications",
        baseUrlApplication,
      );

      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
      });
    } catch (error) {
      console.log("error", error);
      toast({ title: "Failed", description: error.message });
    }
  };

  const handleViewDetails = (missionId) => {
    router.push(`/missions/${missionId}/details`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <ListFilter className="w-6 h-6" /> Available Missions
      </h1>

      <MissionFilters
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
      />

      {filteredMissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMissions.map((mission, index) => (
            <MissionCard
              key={`${mission.id}-${index}`}
              mission={mission}
              onApply={handleApply}
              onViewDetails={handleViewDetails}
              showApplyButton={true}
              userId={userId}
            />
          ))}
        </div>
      ) : (
        <Alert className="mt-6 bg-secondary border-secondary-foreground/10">
          <SearchX className="h-4 w-4" />
          <AlertTitle>No Missions Found</AlertTitle>
          <AlertDescription>
            No available missions match your current filter criteria. Try
            adjusting your filters or check back later.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
