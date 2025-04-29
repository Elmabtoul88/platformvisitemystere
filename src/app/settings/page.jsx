"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { mockUser } from "@/lib/mock-data"; // Using mock user data
import { ArrowLeft, User, Bell, Save } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState({
    name: mockUser.name,
    email: `${mockUser.id}@example.com`, // Example email based on ID
  });
  const [notifications, setNotifications] = useState({
    newMissionEmail: true,
    deadlineReminderEmail: false,
    reportStatusPush: true,
  });

  // Handle changes in notification switches
  const handleNotificationChange = (id, checked) => {
    setNotifications(prev => ({ ...prev, [id]: checked }));
  };

  // Simulate saving settings
  const handleSaveChanges = () => {
    console.log("Saving settings (simulated):", { userProfile, notifications });
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated (simulated).",
    });
    // In a real app, you would make an API call here to persist the changes
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
            <CardDescription>Your personal details. Email is used for login and cannot be changed here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={userProfile.name}
                // In a real app, you might allow changing the name
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
               />
             </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
             <Button onClick={handleSaveChanges} className="ml-auto">
               <Save className="w-4 h-4 mr-2"/> Save Changes
             </Button>
          </CardFooter>
        </Card>

         {/* Add more settings sections as needed (Appearance, Location, etc.) */}

      </div>
    </div>
  );
}
