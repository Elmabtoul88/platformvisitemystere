'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Import Switch component
import { Shield, Bell, Users, BarChart2, AlertCircle, Loader2, Save } from 'lucide-react'; // Import relevant icons and Loader2/Save
import { useToast } from "@/hooks/use-toast"; // Import useToast

export default function AdminSettingsPage() {
  const { toast } = useToast(); // Initialize toast

  // Placeholder states and handlers for potential admin settings
  const [adminEmail, setAdminEmail] = React.useState('admin@example.com'); // Read-only usually
  const [notificationSettings, setNotificationSettings] = React.useState({
    newUserSignup: true,
    reportSubmitted: true,
    missionExpiringSoon: false,
  });
  const [isSaving, setIsSaving] = React.useState(false);

  // Updated handler for ShadCN Switch component
  const handleNotificationToggle = (key, checked) => {
    setNotificationSettings(prev => ({ ...prev, [key]: checked }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    console.log("Saving admin settings (simulated):", { notificationSettings });
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ // Use toast for feedback
        title: "Settings Saved",
        description: "Admin settings have been updated (simulated).",
    });
    setIsSaving(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <Shield className="w-6 h-6" /> Admin Settings
      </h1>

      <div className="space-y-8">
        {/* Admin Account Info (Read-only Example) */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Users className="w-5 h-5 text-primary"/> Administrator Account
            </CardTitle>
            <CardDescription>Basic account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input id="adminEmail" value={adminEmail} readOnly disabled className="bg-secondary/50 cursor-not-allowed" />
            </div>
             {/* Add link to profile menu or user management if admins have editable profiles */}
             <p className="text-sm text-muted-foreground">Password management is typically handled through secure flows.</p>
          </CardContent>
        </Card>

        {/* Admin Notification Preferences */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary"/> Notification Settings
            </CardTitle>
            <CardDescription>Choose which system events trigger notifications for administrators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {/* Example Notification Toggles using Switch component */}
             <div className="flex items-center justify-between space-x-2 p-3 rounded-md border bg-background">
               <Label htmlFor="newUserSignup" className="flex flex-col space-y-1 flex-grow pr-4"> {/* Added flex-grow and padding */}
                 <span>New Shopper Signup</span>
                 <span className="font-normal leading-snug text-muted-foreground text-xs">
                   Notify when a new shopper registers.
                 </span>
               </Label>
               <Switch
                  id="newUserSignup"
                  checked={notificationSettings.newUserSignup}
                  onCheckedChange={(checked) => handleNotificationToggle('newUserSignup', checked)} // Pass key and checked value
                  aria-label="Toggle new shopper signup notifications"
                />
             </div>
             <div className="flex items-center justify-between space-x-2 p-3 rounded-md border bg-background">
               <Label htmlFor="reportSubmitted" className="flex flex-col space-y-1 flex-grow pr-4"> {/* Added flex-grow and padding */}
                 <span>Mission Report Submitted</span>
                 <span className="font-normal leading-snug text-muted-foreground text-xs">
                    Notify when a shopper submits a report for review.
                 </span>
               </Label>
                <Switch
                  id="reportSubmitted"
                  checked={notificationSettings.reportSubmitted}
                  onCheckedChange={(checked) => handleNotificationToggle('reportSubmitted', checked)} // Pass key and checked value
                  aria-label="Toggle report submitted notifications"
                />
             </div>
             <div className="flex items-center justify-between space-x-2 p-3 rounded-md border bg-background">
               <Label htmlFor="missionExpiringSoon" className="flex flex-col space-y-1 flex-grow pr-4"> {/* Added flex-grow and padding */}
                 <span>Mission Deadline Approaching</span>
                  <span className="font-normal leading-snug text-muted-foreground text-xs">
                    Notify about missions nearing their deadline without reports.
                 </span>
               </Label>
                <Switch
                  id="missionExpiringSoon"
                  checked={notificationSettings.missionExpiringSoon}
                  onCheckedChange={(checked) => handleNotificationToggle('missionExpiringSoon', checked)} // Pass key and checked value
                  aria-label="Toggle mission expiring soon notifications"
                />
             </div>
          </CardContent>
        </Card>

         {/* Placeholder for other Admin Settings */}
         <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                     <BarChart2 className="w-5 h-5 text-primary"/> System Configuration (Example)
                </CardTitle>
                 <CardDescription>Future settings related to system behavior.</CardDescription>
            </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground">
                     Placeholder for future configuration options like default reward points, report review workflows, etc.
                </p>
            </CardContent>
         </Card>


         {/* Save Button */}
         <div className="flex justify-end pt-4">
           <Button onClick={handleSaveChanges} disabled={isSaving}>
             {isSaving ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
             ) : (
                <>
                    <Save className="w-4 h-4 mr-2"/> Save Admin Settings
                </>
             )}
           </Button>
         </div>
      </div>
    </div>
  );
}
