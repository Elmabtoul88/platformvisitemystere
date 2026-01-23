"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
//import { mockMissions } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, BarChart2, Eye, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fetchMissions } from "@/services/fetchData";
import { useToast } from "@/hooks/use-toast";
// Base URL for the backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export default function ClientDashboardPage() {
  const { toast } = useToast();
  const [mockMissions, setMockMissions] = useState([]);

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const getMissions = async () => {
      try {
        const data = await fetchMissions(
          "admin-missions",
          API_BASE_URL + "missions/admin/all"
        );

        setMockMissions(data);
      } catch (error) {
        console.log(error?.response.data);
        toast({
          title: "Error fetching missions:",
          description: error?.response.data || "error",
        });
      }
    };
    getMissions();
  }, [user]);

  const clientMissions = useMemo(() => {
    if (!user || user.role !== "client") return [];
    return mockMissions.filter((mission) => mission.clientId === user.id);
  }, [user, mockMissions]);

  const getStatusVariant = (status) => {
    switch (status) {
      case "available":
        return "secondary";
      case "pending_approval":
        return "outline";
      case "assigned":
        return "default";
      case "submitted":
        return "outline";
      case "approved":
        return "default";
      case "refused":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "available":
        return { text: "Available", className: "" };
      case "pending_approval":
        return {
          text: "Pending App.",
          className: "bg-orange-100 text-orange-800 border-orange-300",
        };
      case "assigned":
        return {
          text: "Assigned",
          className: "bg-primary/10 text-primary-foreground",
        };
      case "submitted":
        return {
          text: "Reviewing Reports",
          className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        };
      case "approved":
        return {
          text: "Completed",
          className: "bg-green-100 text-green-800 border-green-300",
        };
      case "refused":
        return { text: "Refused", className: "" };
      default:
        return {
          text: status.charAt(0).toUpperCase() + status.slice(1),
          className: "",
        };
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <BarChart2 className="w-6 h-6" /> Client Dashboard
      </h1>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>My Missions Overview</CardTitle>
          <CardDescription>
            Welcome, {user?.name || "Client"}. Here is the current status of
            your active and past missions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mission Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientMissions.length > 0 ? (
                clientMissions.map((mission) => {
                  const statusInfo = getStatusInfo(mission.status);
                  return (
                    <TableRow key={mission.id}>
                      <TableCell className="font-medium">
                        {mission.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(mission.status)}
                          className={`capitalize ${statusInfo.className}`}
                        >
                          {mission.status === "approved" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {statusInfo.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(mission.deadline), "PP")}
                      </TableCell>
                      <TableCell>{mission.category}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/client/missions/${mission.id}`}>
                            <Eye className="w-4 h-4 mr-1" /> View Progress
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No missions are currently associated with your account.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
