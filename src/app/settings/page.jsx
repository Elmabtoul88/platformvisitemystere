"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { mockUser } from "@/lib/mock-data"; // Using mock user data
import { ArrowLeft, User, Bell, Save, Camera } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar components

export default function SettingsPage() {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState({
    name: mockUser.name,
    email: `${mockUser.id}@example.com`, // Example email based on ID
    profilePicUrl: mockUser.profilePicUrl || `https://picsum.photos/seed/${mockUser.id}/100/100`, // Use mock data or default placeholder
  });
  const [profilePicPreview, setProfilePicPreview] = useState(userProfile.profilePicUrl);
  const [notifications, setNotifications] = useState({
    newMissionEmail: true,
    deadlineReminderEmail: false,
    reportStatusPush: true,
  });
   const [isSaving, setIsSaving] = useState(false);

  // Handle changes in notification switches
  const handleNotificationChange = (id, checked) => {
    setNotifications(prev => ({ ...prev, [id]: checked }));
  };

  // Handle profile picture change
  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // 1. Create Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result); // Show preview immediately
      };
      reader.readAsDataURL(file);

      // 2. Simulate Upload & Get URL (replace with actual upload logic)
      console.log("Simulating profile picture upload...");
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In a real app, upload 'file' to your storage (e.g., Firebase Storage)
      // and get the actual downloadable URL.
      const placeholderUrl = `https://picsum.photos/seed/${mockUser.id}-${Date.now()}/100/100`; // New random URL for simulation
      console.log("Simulated upload complete. New URL:", placeholderUrl);

      // 3. Update State (use the actual URL from upload in real app)
      setUserProfile(prev => ({ ...prev, profilePicUrl: placeholderUrl }));
      toast({ title: "Profile Picture Updated (Simulated)" });
    }
  };

  // Simulate saving settings
  const handleSaveChanges = async () => {
    setIsSaving(true);
    console.log("Saving settings (simulated):", { userProfile, notifications });
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated (simulated).",
    });
    // In a real app, you would make an API call here to persist the changes
    // This would include the updated userProfile.profilePicUrl if changed
    setIsSaving(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
       <Button asChild variant="outline" size="sm" className="mb-6">
         <Link href="/">
           <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions
         </Link>
       </Button>

      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <User className="w-6 h-6" /> My Settings
      </h1>

      <div className="space-y-8">
        {/* Profile Information Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
                <User className="w-5 h-5 text-primary"/> Profile Information
            </CardTitle>
            <CardDescription>Manage your personal details and profile picture.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture Area */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
               <Avatar className="h-24 w-24 border-2 border-primary/50 shadow-sm">
                   <AvatarImage src={profilePicPreview} alt={userProfile.name} />
                   <AvatarFallback>
                     {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                   </AvatarFallback>
               </Avatar>
              <div className="flex-grow space-y-2">
                <Label htmlFor="profile-picture-upload" className="text-sm font-medium">Profile Picture</Label>
                <div className="flex items-center gap-2">
                   <Input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden" // Hide the default input
                  />
                  <Button asChild variant="outline" size="sm">
                    <Label htmlFor="profile-picture-upload" className="cursor-pointer">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Label>
                  </Button>
                   {/* Optional: Add a remove photo button */}
                   {/* <Button variant="ghost" size="sm" onClick={() => {/* Remove logic * /}}>Remove</Button> */}
                </div>
                 <p className="text-xs text-muted-foreground">Upload a new profile picture (JPG, PNG).</p>
              </div>
            </div>

             {/* Name and Email */}
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={userProfile.name}
                // You might allow changing the name here if needed
                // onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                readOnly // For this example, keep it read-only
                className="bg-secondary/50 cursor-not-allowed"
              />
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
               <p className="text-xs text-muted-foreground pt-1">Email is used for login and cannot be changed here.</p>
            </div>

            {/* Add Change Password button/section if needed */}
             <Button variant="outline" size="sm" disabled>Change Password (Coming Soon)</Button>
          </CardContent>
        </Card>

        {/* Notification Settings Section */}
        <Card className="shadow-sm">
          <CardHeader>
             <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary"/> Notification Preferences
            </CardTitle>
            <CardDescription>Choose how you want to be notified about mission updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2 p-3 rounded-md border bg-background">
              <Label htmlFor="new-mission-email" className="flex flex-col space-y-1">
                <span>New Mission Alerts (Email)</span>
                <span className="font-normal leading-snug text-muted-foreground text-xs">
                  Receive an email when new missions matching your profile become available.
                </span>
              </Label>
              <Switch
                id="new-mission-email"
                checked={notifications.newMissionEmail}
                onCheckedChange={(checked) => handleNotificationChange('newMissionEmail', checked)}
                aria-label="Toggle new mission email alerts"
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-3 rounded-md border bg-background">
              <Label htmlFor="deadline-reminder-email" className="flex flex-col space-y-1">
                <span>Deadline Reminders (Email)</span>
                 <span className="font-normal leading-snug text-muted-foreground text-xs">
                  Get email reminders for upcoming mission deadlines.
                </span>
              </Label>
              <Switch
                id="deadline-reminder-email"
                checked={notifications.deadlineReminderEmail}
                onCheckedChange={(checked) => handleNotificationChange('deadlineReminderEmail', checked)}
                 aria-label="Toggle deadline reminder email alerts"
              />
            </div>
             <div className="flex items-center justify-between space-x-2 p-3 rounded-md border bg-background">
               <Label htmlFor="report-status-push" className="flex flex-col space-y-1">
                 <span>Report Status Updates (Push)</span>
                  <span className="font-normal leading-snug text-muted-foreground text-xs">
                   Receive push notifications when your submitted report is approved or rejected. (App Only)
                 </span>
               </Label>
               <Switch
                 id="report-status-push"
                 checked={notifications.reportStatusPush}
                 onCheckedChange={(checked) => handleNotificationChange('reportStatusPush', checked)}
                 aria-label="Toggle report status push notifications"
               />
             </div>
          </CardContent>
        </Card>

         {/* Add more settings sections as needed (Appearance, Location, etc.) */}

         {/* Save Button */}
         <div className="flex justify-end pt-4">
             <Button onClick={handleSaveChanges} disabled={isSaving}>
               {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                  </>
                ) : (
                   <>
                    <Save className="w-4 h-4 mr-2"/> Save All Changes
                   </>
                )}
             </Button>
         </div>
      </div>
    </div>
  );
}
