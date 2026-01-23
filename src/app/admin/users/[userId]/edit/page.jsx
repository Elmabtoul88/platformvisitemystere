"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  ArrowLeft,
  Save,
  User,
  Mail,
  MapPin,
  Briefcase,
  CheckCircle,
  Clock,
  Cake,
  Users as UsersIcon,
  FileWarning,
} from "lucide-react"; // Renamed Users to UsersIcon, Added FileWarning
import { mockUsers } from "@/app/admin/users/users-mock.js"; // Use the alias path
import { useToast } from "@/hooks/use-toast";
import { updateUserAction } from "@/app/actions/admin-actions.js"; // Corrected import path again using alias
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context"; // Import useAuth
import {
  fetchMissions,
  patchMissions,
  updateMissions,
} from "@/services/fetchData";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { token } = useAuth(); // Get token for API call
  const userId = params.userId;
  const [user, setUser] = useState(null); // Store original user data for display
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user data on load
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
        if (foundUser) {
          setUser(foundUser);
          setFormData({
            name: foundUser.name || "",
            email: foundUser.email || "", // Display only
            city: foundUser.city || "",
            motivation: foundUser.motivation || "",
            telephone: foundUser.telephone || "",
            role: foundUser.role || "shopper",
            status: foundUser.status || "active",
            birth_year: foundUser.birth_year || "",
            gender: foundUser.gender || "prefer_not_say",
            cv_url: foundUser.cv_url || null,
            profile_pic_url: foundUser.profile_pic_url, // Store for avatar display
          });
        } else {
          setError("User not found.");
        }
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

  /* */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    // Basic Validation (Add more as needed)
    if (!formData.name || !formData.role || !formData.status) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Name, Role, and Status are required.",
      });
      setIsSaving(false);
      return;
    }

    // Prepare data for API (remove read-only fields like email, cvUrl, profilePicUrl)
    const updateData = { ...formData };
    delete updateData.email;
    delete updateData.cv_url;
    delete updateData.profile_pic_url; // Don't send image URL back

    console.log(`Submitting updates for user ${userId}:`, updateData);

    try {
      // Call the server action to update the user
      //const result = await updateUserAction(userId, updateData, token); // Pass token
      const baseUrl = API_BASE_URL + "users";
      const result = await patchMissions(
        baseUrl + "/" + userId,
        updateData,
        "user" + userId,
        baseUrl + "/" + userId
      );
      localStorage.removeItem("cache_users");
      if (result.success) {
        toast({ title: "User Updated", description: result.message });
        // Redirect back to the user detail page or user list
        router.push(`/admin/users/${userId}`); // Go back to detail view
      } else {
        // Throw error to be caught below
        throw new Error(result.message || "Failed to update user.");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message,
      });
      setIsSaving(false); // Keep form enabled on error
    }
    // No setIsSaving(false) on success due to redirect
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading User Data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center">
        <Alert variant="destructive" className="max-w-lg w-full mb-4">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Error Loading User</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to User List
          </Link>
        </Button>
      </div>
    );
  }

  if (!user) {
    // Should be covered by error state, but good fallback
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        User not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button asChild variant="outline" size="sm" className="mb-6">
        <Link href={`/admin/users/${userId}`}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Cancel Edit
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
            <User className="w-5 h-5" /> Edit User Profile
          </CardTitle>
          <CardDescription>Modify the details for {user.name}.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border">
                {/* Use profilePicUrl from formData for consistency if needed, or original user object */}
                <AvatarImage
                  src={formData.profile_pic_url}
                  alt={formData.name}
                />
                <AvatarFallback>
                  {formData.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">
                Profile picture managed by user.
              </p>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="bg-secondary/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email is read-only.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="city" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> City / Location
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="telephone" className="flex items-center gap-1">
                  Telephone
                </Label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="motivation">Motivation</Label>
              <Textarea
                id="motivation"
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                className="min-h-[80px]"
                disabled={isSaving}
              />
            </div>

            {/* Added Birth Year and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="birthYear" className="flex items-center gap-1">
                  <Cake className="w-3 h-3" /> Birth Year
                </Label>
                <Input
                  id="birthYear"
                  name="birth_year"
                  type="number"
                  placeholder="YYYY"
                  value={formData.birth_year || ""} // Handle potential null/undefined
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="gender" className="flex items-center gap-1">
                  <UsersIcon className="w-3 h-3" /> Gender
                </Label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* CV is generally not edited by admin, maybe just displayed on detail page */}
            <p className="text-sm text-muted-foreground">
              CV/Resume managed by user via Settings page.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="role" className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Role *
                </Label>
                <Select
                  name="role"
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                  required
                  disabled={isSaving}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopper">Shopper</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {/* Add other roles if applicable */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="status" className="flex items-center gap-1">
                  Status *
                </Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  required
                  disabled={isSaving}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {" "}
                      <CheckCircle className="w-3 h-3 inline mr-1 text-green-600" />{" "}
                      Active
                    </SelectItem>
                    <SelectItem value="inactive">
                      {" "}
                      <Clock className="w-3 h-3 inline mr-1 text-red-600" />{" "}
                      Inactive
                    </SelectItem>
                    {/* Add other statuses if applicable */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
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
