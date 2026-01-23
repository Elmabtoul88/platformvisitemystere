"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { mockUser } from "@/lib/mock-data";
import {
  ArrowLeft,
  User,
  Bell,
  Save,
  Camera,
  Moon,
  Sun,
  Share2,
  Linkedin,
  Facebook,
  Settings,
  Info,
  Upload,
  FileText,
  MapPin,
  Cake,
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define Twitter icon SVG as it's not directly in lucide-react
const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export default function SettingsPage() {
  const { toast } = useToast();

  // Initialize all fields with empty strings to prevent undefined values
  const [userProfile, setUserProfile] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    profilePicUrl: "",
    city: "",
    motivation: "",
    cvUrl: "",
    birthYear: "",
    gender: "",
  });

  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [notifications, setNotifications] = useState({
    newMissionEmail: true,
    deadlineReminderEmail: false,
    reportStatusPush: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cvFileName, setCvFileName] = useState("");

  // Effect to check initial theme preference and load user data
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("missionViewAuth"));
    if (currentUser?.user) {
      // Merge with defaults to ensure no undefined/null values
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        id: currentUser.user.id || "",
        name: currentUser.user.name || "",
        email: currentUser.user.email || "",
        role: currentUser.user.role || "",
        profilePicUrl: currentUser.user.profilePicUrl || "",
        city: currentUser.user.city || "",
        motivation: currentUser.user.motivation || "",
        cvUrl: currentUser.user.cvUrl || "",
        birthYear: currentUser.user.birthYear || "",
        gender: currentUser.user.gender || "",
      }));

      // Set profile pic preview
      setProfilePicPreview(currentUser.user.profilePicUrl || "");
    }

    console.log("current user", currentUser?.user);

    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialDarkMode =
      storedTheme === "dark" || (!storedTheme && prefersDark);
    setIsDarkMode(initialDarkMode);
  }, []);

  // Handle input changes for text fields (like city, motivation, birthYear)
  const handleInputChange = (event) => {
    const { name, value, type } = event.target;
    // Ensure birth year is treated as a number if the input type is number
    const processedValue =
      type === "number" ? (value ? parseInt(value, 10) : "") : value;
    setUserProfile((prev) => ({ ...prev, [name]: processedValue }));
  };

  // Handle gender change using Select
  const handleGenderChange = (value) => {
    setUserProfile((prev) => ({ ...prev, gender: value || "" }));
  };

  // Handle dark mode toggle
  const handleThemeChange = (checked) => {
    setIsDarkMode(checked);
    const newTheme = checked ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Dispatch storage event manually to ensure layout updates immediately
    window.dispatchEvent(
      new StorageEvent("storage", { key: "theme", newValue: newTheme })
    );
    toast({
      title: `Theme Changed`,
      description: `Switched to ${checked ? "Dark" : "Light"} Mode.`,
    });
  };

  // Handle changes in notification switches
  const handleNotificationChange = (id, checked) => {
    setNotifications((prev) => ({ ...prev, [id]: checked }));
  };

  // Handle profile picture change
  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // 1. Create Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // 2. Simulate Upload & Get URL (replace with actual upload logic)
      console.log("Simulating profile picture upload...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const placeholderUrl = `https://picsum.photos/seed/${
        userProfile.id || "default"
      }-${Date.now()}/100/100`;
      console.log("Simulated upload complete. New URL:", placeholderUrl);

      // 3. Update State
      setUserProfile((prev) => ({ ...prev, profilePicUrl: placeholderUrl }));
      toast({ title: "Profile Picture Updated (Simulated)" });
    }
  };

  // Handle CV file change
  const handleCvChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setCvFileName(file.name);
      // Simulate CV upload
      console.log("Simulating CV upload...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // In a real app, upload the file and get a URL
      const placeholderCvUrl = `/path/to/simulated/${file.name}`;
      setUserProfile((prev) => ({ ...prev, cvUrl: placeholderCvUrl }));
      toast({
        title: "CV Uploaded (Simulated)",
        description: `File: ${file.name}`,
      });
    } else {
      setCvFileName("");
      setUserProfile((prev) => ({ ...prev, cvUrl: "" }));
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);

    const currentUser = JSON.parse(localStorage.getItem("missionViewAuth"));

    if (currentUser?.user) {
      try {
        const response = await fetch(
          `${API_BASE_URL}user-notifications/${currentUser.user.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notifications }),
          }
        );

        const result = await response.json();
      } catch (error) {
        console.error("Erreur sauvegarde préférences:", error);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
    setIsSaving(false);
  };

  // Handle social media share
  const handleShare = (platform) => {
    const profileUrl = window.location.origin;
    const text = `Check out my MissionView profile!`;
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          profileUrl
        )}&text=${encodeURIComponent(text)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          profileUrl
        )}&quote=${encodeURIComponent(text)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          profileUrl
        )}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button asChild variant="outline" size="sm" className="mb-6">
        <Link href="/">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <Settings className="w-6 h-6" /> My Settings
      </h1>

      <div className="space-y-8">
        {/* Profile Information Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Personal Details
            </CardTitle>
            <CardDescription>
              Manage your personal details and profile picture.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture Area */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="h-24 w-24 border-2 border-primary/50 shadow-sm">
                <AvatarImage
                  src={profilePicPreview || userProfile.profilePicUrl}
                  alt={userProfile.name}
                />
                <AvatarFallback>
                  {userProfile.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow space-y-2">
                <Label
                  htmlFor="profile-picture-upload"
                  className="text-sm font-medium"
                >
                  Profile Picture
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Button asChild variant="outline" size="sm">
                    <Label
                      htmlFor="profile-picture-upload"
                      className="cursor-pointer flex items-center"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Label>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a new profile picture (JPG, PNG).
                </p>
              </div>
            </div>

            {/* Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userProfile.name}
                  readOnly
                  className="bg-secondary/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground pt-1">
                  Name is linked to your account.
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  readOnly
                  className="bg-secondary/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground pt-1">
                  Email is used for login.
                </p>
              </div>
            </div>

            {/* Password Change Button */}
            <Button variant="outline" size="sm" disabled>
              Change Password (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Additional Profile Information Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> Additional Information
            </CardTitle>
            <CardDescription>
              Complete your profile to increase your chances of getting
              missions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Birth Year and Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="birthYear" className="flex items-center gap-1">
                  <Cake className="w-4 h-4 text-muted-foreground" /> Birth Year
                </Label>
                <Input
                  id="birthYear"
                  name="birthYear"
                  type="number"
                  placeholder="YYYY"
                  min="1920"
                  max={new Date().getFullYear() - 18}
                  value={userProfile.birthYear}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground pt-1">
                  Helps tailor mission opportunities.
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="gender" className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" /> Gender
                </Label>
                <Select
                  name="gender"
                  value={userProfile.gender}
                  onValueChange={handleGenderChange}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
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
                <p className="text-xs text-muted-foreground pt-1">
                  Optional demographic information.
                </p>
              </div>
            </div>

            {/* City and Motivation */}
            <div className="space-y-1">
              <Label htmlFor="city" className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-muted-foreground" /> City /
                Location
              </Label>
              <Input
                id="city"
                name="city"
                placeholder="Enter your city"
                value={userProfile.city}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground pt-1">
                Helps us find missions near you.
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="motivation">Your Motivation</Label>
              <Textarea
                id="motivation"
                name="motivation"
                placeholder="Tell us why you want to be a mystery shopper..."
                className="resize-y min-h-[80px]"
                value={userProfile.motivation}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground pt-1">
                Briefly describe your interest and relevant skills.
              </p>
            </div>

            {/* CV Upload */}
            <div className="space-y-1">
              <Label htmlFor="cv-upload" className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-muted-foreground" /> Upload
                CV/Resume (Optional)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvChange}
                  className="hidden"
                />
                <Button asChild variant="outline" size="sm">
                  <Label
                    htmlFor="cv-upload"
                    className="cursor-pointer flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" /> Choose File
                  </Label>
                </Button>
                {cvFileName && (
                  <span className="text-sm text-muted-foreground italic">
                    {cvFileName}
                  </span>
                )}
              </div>
              {userProfile.cvUrl && !cvFileName && (
                <p className="text-xs text-muted-foreground pt-1">
                  Current file:{" "}
                  <Link
                    href={userProfile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-primary hover:text-primary/80"
                  >
                    {userProfile.cvUrl.split("/").pop()}
                  </Link>
                </p>
              )}
              <p className="text-xs text-muted-foreground pt-1">
                Upload your CV (PDF, DOC, DOCX).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}{" "}
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2 p-3 rounded-md border bg-background">
              <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span>Dark Mode</span>
                <span className="font-normal leading-snug text-muted-foreground text-xs">
                  Enable dark theme for reduced eye strain.
                </span>
              </Label>
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={handleThemeChange}
                aria-label="Toggle dark mode"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified about mission updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2 p-3 rounded-md border bg-background">
              <Label
                htmlFor="new-mission-email"
                className="flex flex-col space-y-1"
              >
                <span>New Mission Alerts (Email)</span>
                <span className="font-normal leading-snug text-muted-foreground text-xs">
                  Receive an email when new missions matching your profile
                  become available.
                </span>
              </Label>
              <Switch
                id="new-mission-email"
                checked={notifications.newMissionEmail}
                onCheckedChange={(checked) =>
                  handleNotificationChange("newMissionEmail", checked)
                }
                aria-label="Toggle new mission email alerts"
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-3 rounded-md border bg-background">
              <Label
                htmlFor="deadline-reminder-email"
                className="flex flex-col space-y-1"
              >
                <span>Deadline Reminders (Email)</span>
                <span className="font-normal leading-snug text-muted-foreground text-xs">
                  Get email reminders for upcoming mission deadlines.
                </span>
              </Label>
              <Switch
                id="deadline-reminder-email"
                checked={notifications.deadlineReminderEmail}
                onCheckedChange={(checked) =>
                  handleNotificationChange("deadlineReminderEmail", checked)
                }
                aria-label="Toggle deadline reminder email alerts"
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-3 rounded-md border bg-background">
              <Label
                htmlFor="report-status-push"
                className="flex flex-col space-y-1"
              >
                <span>Report Status Updates (Push)</span>
                <span className="font-normal leading-snug text-muted-foreground text-xs">
                  Receive push notifications when your submitted report is
                  approved or rejected. (App Only)
                </span>
              </Label>
              <Switch
                id="report-status-push"
                checked={notifications.reportStatusPush}
                onCheckedChange={(checked) =>
                  handleNotificationChange("reportStatusPush", checked)
                }
                aria-label="Toggle report status push notifications"
              />
            </div>
          </CardContent>
        </Card>

        {/* Share Profile Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" /> Share Your Profile
            </CardTitle>
            <CardDescription>
              Let others know about your mystery shopping activities.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-start gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare("twitter")}
              aria-label="Share on Twitter"
            >
              <TwitterIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare("facebook")}
              aria-label="Share on Facebook"
            >
              <Facebook className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare("linkedin")}
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin);
                toast({ title: "Profile Link Copied!" });
              }}
            >
              Copy Link
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
