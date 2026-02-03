"use client"; // Map component requires client-side rendering

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic"; // Import dynamic for client-side only component
import { fetchMissions } from "@/services/fetchData";
import { useToast } from "@/hooks/use-toast";

const MapView = dynamic(
  () => import("@/components/map-view").then((mod) => mod.MapView),
  {
    ssr: false,
  },
);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export default function MapPage() {
  const [mockMissions, setMockMissions] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const u = localStorage.getItem("missionViewAuth");
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed.user); // This triggers the next useEffect
    }
  }, []);

  // When user is available, fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, ass] = await Promise.all([
          fetchMissions("missions", API_BASE_URL + "missions/admin/all"),
          fetchMissions(
            "mission_assignements" + user.id,
            API_BASE_URL + "assignements/" + user.id,
          ),
        ]);
        const filtredMissions = m.filter(
          (mission) => mission.latitude !== null && mission.longitude !== null,
        );
        const filtredAssigned = ass.filter(
          (mission) => mission.latitude !== null && mission.longitude !== null,
        );
        setMockMissions(filtredMissions);
        setAssigned(filtredAssigned);
        console.log("Fetched missions:", m);
        console.log("Fetched assignements:", ass);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);
  // Filter missions based on status and assignment for the current mock user
  const availableMissions = mockMissions.filter(
    (mission) => mission.status === "available",
  );

  const assignedMissions = assigned.filter(
    (mission) =>
      mission.mission_status === "assigned" ||
      mission.mission_status === "submitted",
  );

  console.log("map_main", availableMissions, assignedMissions);
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary">Mission Map</h1>
      {/* Render the dynamically imported MapView */}
      {/* Ensure MapView itself handles its loading state */}
      <MapView
        availableMissions={availableMissions}
        assignedMissions={assignedMissions}
      />
    </div>
  );
}
