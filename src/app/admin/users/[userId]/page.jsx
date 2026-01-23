"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Award,
  MessageSquare,
  Download,
  FileWarning,
  Cake,
  Users as UsersIcon,
} from "lucide-react"; // Added Download, FileWarning, Cake, UsersIcon
// Removed mockUsers import
import { format } from "date-fns";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context"; // Import useAuth
import { fetchMissions } from "@/services/fetchData";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  //const { token } = useAuth(); // Get token for API call
  const userId = params.userId;
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserDetails = async (user_id) => {
      try {
        console.log(`Fetching details for user ID: ${userId}`);
        setIsLoading(true);
        setError(null);
        const [foundUser] = await fetchMissions(
          "user" + user_id,
          API_BASE_URL + "users/" + user_id
        );
        // Process date if it exists
        if (foundUser.registration_date) {
          foundUser.registration_date = new Date(foundUser.registration_date);
        }

        setUser(foundUser);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.message);
        setError("Invalid user ID provided.");
        setIsLoading(false);
        // Optional: Redirect or show permanent error message
        // router.push('/admin/users');
      } finally {
        setIsLoading(false);
      }
    };
    getUserDetails(userId);
  }, [userId]); // Add token to dependencies

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading User Details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center">
        <Alert variant="destructive" className="max-w-lg w-full">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm" className="mt-6">
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to User List
          </Link>
        </Button>
      </div>
    );
  }

  if (!user) {
    // Should be caught by error state, but as a fallback
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <p>User data could not be loaded.</p>
      </div>
    );
  }

  // Helper to get status badge variant
  const getStatusVariant = (status) =>
    status === "active" ? "default" : "outline";
  const getStatusBg = (status) =>
    status === "active"
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-red-100 text-red-800 border-red-300";
  const getRoleVariant = (role) =>
    role === "admin" ? "destructive" : "secondary";

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to User List
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href={`/admin/users/${userId}/edit`}>
            <Edit className="w-4 h-4 mr-1" /> Edit User
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-4 bg-secondary/30">
          <Avatar className="h-20 w-20 border-2 border-primary shadow-sm">
            {/* Use profilePicUrl from the fetched user data */}
            <AvatarImage src={user.profile_pic_url} alt={user.name} />
            <AvatarFallback>
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <CardTitle className="text-2xl font-bold text-primary mb-1">
              {user.name}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" /> {user.email}
              </span>
              {user.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {user.city}
                </span>
              )}
              {user.telephone && (
                <span className="flex items-center gap-1">
                  Tel: {user.telephone}
                </span>
              )}{" "}
              {/* Display telephone */}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={getRoleVariant(user.role)} className="capitalize">
                {user.role}
              </Badge>
              <Badge
                variant={getStatusVariant(user.status)}
                className={`capitalize ${getStatusBg(user.status)}`}
              >
                {user.status === "active" ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                {user.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Additional Details Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground border-b pb-1">
              Profile Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {user.birth_year && (
                <p className="flex items-start gap-2">
                  <Cake className="w-4 h-4 text-muted-foreground mt-0.5" />{" "}
                  <strong className="w-24 inline-block text-muted-foreground">
                    Birth Year:
                  </strong>{" "}
                  {user.birth_year}
                </p>
              )}
              {user.gender && user.gender !== "prefer_not_say" && (
                <p className="flex items-start gap-2">
                  <UsersIcon className="w-4 h-4 text-muted-foreground mt-0.5" />{" "}
                  <strong className="w-24 inline-block text-muted-foreground">
                    Gender:
                  </strong>{" "}
                  <span className="capitalize">{user.gender}</span>
                </p>
              )}
              {user.registration_date && ( // Check if date is valid
                <p className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />{" "}
                  <strong className="w-24 inline-block text-muted-foreground">
                    Registered:
                  </strong>{" "}
                  {format(user.registration_date, "PPP")}
                </p>
              )}
              <p className="flex items-start gap-2">
                <strong className="w-24 inline-block text-muted-foreground">
                  User ID:
                </strong>{" "}
                <code>{user.id}</code>
              </p>
            </div>
          </div>

          {user.role === "shopper" && (
            <>
              {/* Motivation Section */}
              {user.motivation && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-1 flex items-center gap-1">
                    {" "}
                    <MessageSquare className="w-4 h-4" /> Motivation
                  </h3>
                  <p className="text-sm text-foreground/90 italic bg-secondary/50 p-3 rounded border">
                    "{user.motivation}"
                  </p>
                </div>
              )}

              {/* CV Section */}
              {user.cv_url && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-1 flex items-center gap-1">
                    {" "}
                    <FileText className="w-4 h-4" /> Curriculum Vitae (CV)
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      {/* Use an anchor tag with download attribute */}
                      {/* IMPORTANT: Ensure cvUrl is a direct link or handle download via API */}
                      <a
                        href={user.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={user.cv_url.split("/").pop()}
                      >
                        <Download className="w-4 h-4 mr-2" /> Download CV
                      </a>
                    </Button>
                    <span className="text-sm text-muted-foreground italic">
                      ({user.cv_url.split("/").pop()})
                    </span>
                  </div>
                </div>
              )}

              {/* Performance/Stats Section */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground border-b pb-1 flex items-center gap-1">
                  {" "}
                  <Award className="w-4 h-4" /> Performance
                </h3>
                {/* Ensure completedMissions field name matches API response */}
                <p className="text-sm">
                  <strong className="text-muted-foreground">
                    Completed Missions:
                  </strong>{" "}
                  {user.completed_missions_count ?? 0}
                </p>
                {/* Add more stats like average rating, last activity etc. */}
              </div>
            </>
          )}

          {/* Add more sections as needed: Assigned Missions, Recent Reports, Ratings, etc. */}
        </CardContent>
      </Card>
    </div>
  );
}
