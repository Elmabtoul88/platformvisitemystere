"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2, MapPin as MapPinIcon } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { fetchMissions, updateMissions } from "@/services/fetchData";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

export default function EditMissionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const missionId = params.missionId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    reward: "",
    location: "",
    category: "",
    businessName: "",
    status: "", // Add status
  });
  const [availableCategories, setAvailableCategories] = useState([]);

  // Fetch mission data and categories
  useEffect(() => {
    const getMissions = async () => {
      setIsLoading(true);
      const response = await fetchMissions(
        "admin-missions",
        API_BASE_URL + "missions/admin/all",
      );
      // Simulate fetching mission data
      const foundMission = response.find((m) => m.id === parseInt(missionId));
      if (foundMission) {
        // Format deadline for input type="date" (YYYY-MM-DD)
        const deadlineDate = new Date(foundMission.deadline);
        const formattedDeadline = !isNaN(deadlineDate)
          ? deadlineDate.toISOString().split("T")[0]
          : "";

        setFormData({
          title: foundMission.title || "",
          description: foundMission.description || "",
          deadline: formattedDeadline,
          reward: String(foundMission.reward) || "", // Ensure reward is a string for input
          location: foundMission.location || "",
          category: foundMission.category || "",
          businessName: foundMission.businessName || "",
          status: foundMission.status || "available", // Include status
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Mission not found.",
        });
        router.push("/admin/missions"); // Redirect if mission doesn't exist
      }

      // Set available categories 
      setAvailableCategories([...new Set(response.map((m) => m.category))]);
      setIsLoading(false);
    };
    getMissions();
  }, [missionId, router, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    console.log("Submitting updated mission data (simulated):", {
      missionId,
      ...formData,
    });

    // Basic Frontend Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.deadline ||
      !formData.reward ||
      !formData.location ||
      !formData.category ||
      !formData.businessName ||
      !formData.status
    ) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all required fields.",
      });
      setIsSubmitting(false);
      return;
    }

    // --- TODO: Replace simulation with actual update API call ---
    // Simulate API call to update the mission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Simulated mission update successful.");
    // ---
    const baseUrl = API_BASE_URL + "missions"; //missions/admin/all
    const result = await updateMissions(
      `${baseUrl}/${missionId}`,
      formData,
      "missions",
      `${baseUrl}${`/admin/all`}`,
    );

    if (result && result.status === 200) {
      toast({
        title: "Mission Updated",
        description: `Mission "${formData.title}" has been updated.`,
      });
      router.push("/admin/missions"); // Redirect back to the mission list
      // setIsSubmitting(false); // Not needed on success redirect
    } else {
      toast({
        variant: "destructive",
        title: "update failed",
        description: "Failed to update the mission. please try again",
      });
    }
  };

  const handleGetLocation = async () => {
    setIsFetchingLocation(true);
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const latLngString = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
          setFormData((prev) => ({
            ...prev,
            location: latLngString,
            latitude,
            longitude,
          }));
          toast({
            title: "Location Fetched",
            description: `Coordinates: ${latLngString}`,
          });
          setIsFetchingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(error.message);
          toast({
            variant: "destructive",
            title: "Location Error",
            description:
              error.message || "Could not retrieve your current location.",
          });
          setIsFetchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      toast({
        variant: "destructive",
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
      });
      setIsFetchingLocation(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading mission details...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button asChild variant="outline" size="sm" className="mb-4">
        <Link href="/admin/missions">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions List
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary">
            Edit Mission
          </CardTitle>
          <CardDescription>
            Modify the details for mission: {formData.title || missionId}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Mission Title and Business Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="title">Mission Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
                disabled={isSubmitting}
              />
            </div>

            {/* Location and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="location">
                  Location (Address or Lat,Lng) *
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., 123 Main St or 34.05,-118.24"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting || isFetchingLocation}
                    className="flex-grow"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGetLocation}
                    disabled={isSubmitting || isFetchingLocation}
                    title="Get Current Location"
                  >
                    {isFetchingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPinIcon className="h-4 w-4" />
                    )}
                    <span className="sr-only">Get Current Location</span>
                  </Button>
                </div>
                {locationError && (
                  <p className="text-xs text-destructive mt-1">
                    {locationError}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="category">Category *</Label>
                <Select
                  name="category"
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deadline and Reward */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reward">Reward ($) *</Label>
                <Input
                  id="reward"
                  name="reward"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.reward}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-1">
              <Label htmlFor="status">Mission Status *</Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
                required
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Add fields for assigning shoppers, setting specific criteria, etc. later */}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
