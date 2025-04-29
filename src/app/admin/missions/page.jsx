'use client';

import React, { useState, useMemo, startTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"; // Added AlertDialogTrigger
import { PlusCircle, MoreHorizontal, Search, Edit, Trash2, FileCheck, FileText, Loader2, UserPlus, Award, MapPin as MapPinIcon, Users as UsersIcon } from 'lucide-react'; // Added UsersIcon
import { mockMissions, mockReports } from '@/lib/mock-data';
import { mockUsers } from '../users/users-mock.js';
import { assignMissionAction, deleteMissionAction } from '../../actions/admin-actions.js'; // Corrected import path
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
// Import Command components for multi-select autocomplete
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { ScrollArea } from "@/components/ui/scroll-area"; // For scrollable list

// Helper function for status badge variant
const getStatusVariant = (status) => {
    switch (status) {
      case 'available': return 'secondary';
      case 'assigned': return 'default';
      case 'submitted': return 'destructive';
      case 'approved': return 'default';
      case 'refused': return 'outline';
      case 'completed': return 'default';
      default: return 'secondary';
    }
};
// Helper function for status text
const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'assigned': return 'Assigned';
      case 'submitted': return 'Reports Pending';
      case 'approved': return 'Completed';
      case 'refused': return 'Reports Refused';
      case 'completed': return 'Completed';
      default: return status.charAt(0).toUpperCase() + status.slice(1); // Capitalize
    }
  };

export default function AdminMissionsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [missions, setMissions] = useState([]);
    const [reports, setReports] = useState([]);
    const [shoppers, setShoppers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(null); // Track processing state for various actions
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedMissionForAssignment, setSelectedMissionForAssignment] = useState(null);
    // State for multi-select
    const [selectedUsersForAssignment, setSelectedUsersForAssignment] = useState([]); // Array of user IDs
    const [shopperSearchTerm, setShopperSearchTerm] = useState(''); // State for CommandInput

    // Fetch initial data
    useEffect(() => {
        setIsLoading(true);
        // Simulate fetching data
        setTimeout(() => {
            startTransition(() => {
                // Ensure mockMissions is initialized correctly
                setMissions(Array.isArray(mockMissions) ? mockMissions : []);
                setReports(Array.isArray(mockReports) ? mockReports : []);
                 // Prepare shopper data for Command component
                setShoppers((Array.isArray(mockUsers) ? mockUsers : [])
                    .filter(u => u.role === 'shopper' && u.status === 'active')
                    .map(u => ({
                        value: u.id, // User ID is the value
                        label: u.name, // Display name
                        email: u.email, // For searching
                        city: u.city || 'N/A', // For display
                        completedMissions: u.completedMissions ?? 0, // For display
                     }))
                 );
            });
            setIsLoading(false);
        }, 300); // Short delay for simulation
    }, []);


    const filteredMissions = useMemo(() => {
        return missions.filter(mission =>
            mission.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (mission.businessName && mission.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [missions, searchTerm]);

    // Filter shoppers based on search term for Command list
     const filteredShoppers = useMemo(() => {
        if (!shopperSearchTerm) return shoppers;
        return shoppers.filter(shopper =>
            shopper.label.toLowerCase().includes(shopperSearchTerm.toLowerCase()) ||
            shopper.email.toLowerCase().includes(shopperSearchTerm.toLowerCase())
        );
    }, [shoppers, shopperSearchTerm]);


    const pendingReportsCount = useMemo(() => {
        const counts = {};
        reports.forEach(report => {
            if (report.status === 'submitted') {
                counts[report.missionId] = (counts[report.missionId] || 0) + 1;
            }
        });
        return counts;
    }, [reports]);


    const handleCreateMission = () => {
        router.push('/admin/missions/new');
    };

    const handleEditMission = (missionId) => {
        router.push(`/admin/missions/${missionId}/edit`);
    };

    const handleEditSurvey = (missionId) => {
        // Navigate to survey edit page - ensure this route exists and works
        router.push(`/admin/missions/${missionId}/survey/create`); // Assuming create/edit share the same page
    };

    const handleDeleteMission = async (missionId) => {
        setIsProcessing(missionId); // Use generic processing state
        console.log(`Admin: Deleting mission ${missionId}`);

        try {
            const result = await deleteMissionAction(missionId);
             if (result.success) {
                 startTransition(() => {
                   setMissions(prev => prev.filter(m => m.id !== missionId));
                   setReports(prev => prev.filter(r => r.missionId !== missionId));
                    // Also remove from mockMissions for simulation persistence
                   const index = mockMissions.findIndex(m => m.id === missionId);
                   if (index > -1) mockMissions.splice(index, 1);
                });
                toast({ title: "Mission Deleted", description: result.message });
             } else {
                 throw new Error(result.message || "Failed to delete mission.");
             }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsProcessing(null);
        }
    };

     const handleReviewReports = (missionId) => {
        router.push(`/admin/missions/${missionId}/reports`);
    };

     // --- Assign Mission Logic (Updated for Multi-Select) ---
    const openAssignDialog = (mission) => {
        if (mission.status !== 'available') {
            toast({ variant: "destructive", title: "Cannot Assign", description: "Mission is not available for assignment." });
            return;
        }
        setSelectedMissionForAssignment(mission);
        setSelectedUsersForAssignment([]); // Reset selected users array
        setShopperSearchTerm(''); // Reset search term
        setAssignDialogOpen(true);
    };

     // Handle checkbox change or item click in assignment dialog
     const handleUserSelectionChange = (userId) => {
        console.log("Toggling selection for user:", userId); // Debug log
        setSelectedUsersForAssignment(prev =>
             prev.includes(userId)
                 ? prev.filter(id => id !== userId) // Remove if already selected
                 : [...prev, userId] // Add if not selected
         );
     };

    const handleAssignMission = async () => {
        if (!selectedMissionForAssignment || selectedUsersForAssignment.length === 0) {
            toast({ variant: "destructive", title: "Selection Required", description: "Please select at least one user to assign the mission." });
            return;
        }
        const missionId = selectedMissionForAssignment.id;
        setIsProcessing(missionId); // Set processing state for the specific mission
        console.log(`Admin: Assigning mission ${missionId} to users: ${selectedUsersForAssignment.join(', ')}`);

        // Array to hold results of each assignment attempt
        const results = [];
        // Sequentially assign to each selected user (could be parallelized, but sequential is simpler for simulation)
        for (const userId of selectedUsersForAssignment) {
             try {
                 // This server action needs to handle assigning to a single user at a time
                 const result = await assignMissionAction(missionId, userId);
                 results.push({ userId, success: result.success, message: result.message });
                  // If successful, update the mission status in mock data immediately
                  // For simulation, the first successful assignment marks the mission as 'assigned'
                 if (result.success && mockMissions.find(m => m.id === missionId)?.status === 'available') {
                      const missionIndex = mockMissions.findIndex(m => m.id === missionId);
                       if (missionIndex !== -1) {
                           mockMissions[missionIndex].status = 'assigned';
                            // In a real DB, you'd likely have an assignments table
                           // For simulation, store assigned users in an array (or just the first one)
                           if (!Array.isArray(mockMissions[missionIndex].assignedTo)) {
                               mockMissions[missionIndex].assignedTo = [];
                           }
                            mockMissions[missionIndex].assignedTo.push(userId);
                           console.log(`Mock mission ${missionId} status updated to assigned for user ${userId}.`);
                       }
                  }

             } catch (error) {
                 results.push({ userId, success: false, message: error.message || "Failed to assign." });
             }
         }

         const successes = results.filter(r => r.success);
         const failures = results.filter(r => !r.success);

         // Update local state only if at least one assignment was successful
         if (successes.length > 0) {
             startTransition(() => {
                 // Update the mission in the local React state
                 setMissions(prev => prev.map(m =>
                    m.id === missionId ? { ...m, status: 'assigned', assignedTo: selectedUsersForAssignment } : m
                ));
             });
         }

         // Display feedback based on results
          if (failures.length === 0) {
             toast({ title: "Mission Assigned", description: `Successfully assigned to ${successes.length} user(s).` });
          } else {
              toast({
                 variant: "destructive",
                 title: "Partial Assignment Failure",
                 description: `Assigned to ${successes.length} user(s). Failed for ${failures.length} user(s). Check logs for details.`,
                 duration: 5000, // Longer duration for error messages
             });
             console.error("Assignment Failures:", failures);
          }

         setAssignDialogOpen(false);
         setSelectedMissionForAssignment(null);
         setSelectedUsersForAssignment([]);
         setIsProcessing(null); // Clear processing state
     };

     // --- End Assign Mission Logic ---


     if (isLoading) {
        return (
          <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading missions...</span>
          </div>
        );
      }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                    Manage Missions
                </h1>
                <Button onClick={handleCreateMission} size="sm">
                    <PlusCircle className="w-4 h-4 mr-2" /> Create New Mission
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Mission List</CardTitle>
                    <CardDescription>View, edit, assign, and manage all missions and review submitted reports.</CardDescription>
                     <div className="relative pt-2">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search missions (title, ID, location, status, business)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-full md:w-1/2 lg:w-1/3"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Business</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Reward</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMissions.length > 0 ? (
                                filteredMissions.map((mission) => {
                                    const pendingCount = pendingReportsCount[mission.id] || 0;
                                    // Handle assignedTo being potentially an array or single ID
                                    const assignedUserIds = Array.isArray(mission.assignedTo) ? mission.assignedTo : (mission.assignedTo ? [mission.assignedTo] : []);
                                    const assignedShoppers = assignedUserIds.map(id => shoppers.find(u => u.value === id)).filter(Boolean);
                                    const assignedNames = assignedShoppers.map(s => s.label).join(', ');
                                    const isCurrentProcessing = isProcessing === mission.id;

                                    return (
                                        <TableRow key={mission.id} className={isCurrentProcessing ? 'opacity-50 pointer-events-none' : ''}>
                                            <TableCell className="font-medium">{mission.title}</TableCell>
                                            <TableCell>{mission.businessName || 'N/A'}</TableCell>
                                            <TableCell>{mission.location}</TableCell>
                                            <TableCell>{format(new Date(mission.deadline), 'PP')}</TableCell>
                                            <TableCell>${mission.reward}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(mission.status)} className="capitalize">
                                                     {getStatusText(mission.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs max-w-[150px] truncate" title={assignedNames}>
                                                 {/* Display assigned users */}
                                                {assignedShoppers.length > 0
                                                    ? (
                                                        <span className="flex items-center gap-1">
                                                            <UsersIcon className="w-3 h-3 text-muted-foreground"/>
                                                             {assignedShoppers.length === 1 ? assignedNames : `${assignedShoppers.length} Shoppers`}
                                                        </span>
                                                    )
                                                    : <span className="text-muted-foreground">Not Assigned</span>
                                                }
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isCurrentProcessing}>
                                                            {isCurrentProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        {mission.status === 'available' && (
                                                            <DropdownMenuItem onClick={() => openAssignDialog(mission)} disabled={isCurrentProcessing}>
                                                                <UserPlus className="mr-2 h-4 w-4" /> Assign to Shopper(s)
                                                            </DropdownMenuItem>
                                                        )}
                                                        {(mission.status === 'submitted' || mission.status === 'approved' || mission.status === 'refused') && (
                                                            <DropdownMenuItem onClick={() => handleReviewReports(mission.id)} disabled={isCurrentProcessing}>
                                                                <FileCheck className="mr-2 h-4 w-4" /> Review Reports
                                                                {pendingCount > 0 && <Badge variant="destructive" className="ml-auto text-xs">{pendingCount} New</Badge>}
                                                            </DropdownMenuItem>
                                                            )}
                                                        <DropdownMenuItem onClick={() => handleEditMission(mission.id)} disabled={isCurrentProcessing}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit Mission
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditSurvey(mission.id)} disabled={isCurrentProcessing}>
                                                            <FileText className="mr-2 h-4 w-4" /> Edit Survey
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                                    onSelect={(e) => e.preventDefault()}
                                                                    disabled={isCurrentProcessing || mission.status === 'assigned' || mission.status === 'submitted'}
                                                                    title={mission.status === 'assigned' || mission.status === 'submitted' ? "Cannot delete assigned/submitted missions" : ""}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Mission
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the mission
                                                                        "{mission.title}" and any associated reports.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel disabled={isCurrentProcessing}>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className={buttonVariants({ variant: "destructive" })}
                                                                        onClick={() => handleDeleteMission(mission.id)}
                                                                        disabled={isCurrentProcessing}
                                                                    >
                                                                        {isCurrentProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No missions found matching your search criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             {/* Assign User Dialog (Updated for Multi-Select Autocomplete) */}
            <AlertDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <AlertDialogContent className="sm:max-w-lg"> {/* Wider dialog */}
                    <AlertDialogHeader>
                        <AlertDialogTitle>Assign Mission: {selectedMissionForAssignment?.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Select one or more active shoppers to assign this mission to. They will be notified.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="shopper-search">Select Shopper(s)</Label>
                         <Command className="rounded-lg border shadow-sm">
                          <CommandInput
                            id="shopper-search"
                            placeholder="Search by name or email..."
                            value={shopperSearchTerm}
                            onValueChange={setShopperSearchTerm}
                          />
                          <CommandList>
                            <CommandEmpty>No shoppers found.</CommandEmpty>
                             {/* Wrap list in ScrollArea */}
                             <ScrollArea className="h-[200px]"> {/* Adjust height as needed */}
                                <CommandGroup>
                                {filteredShoppers.map((shopper) => (
                                    <CommandItem
                                        key={shopper.value}
                                        value={`${shopper.label} ${shopper.email}`} // Combine fields for better searching
                                        // Remove onSelect here - selection handled by checkbox directly
                                        className="flex items-center gap-2 cursor-pointer aria-selected:bg-accent/50" // Style selected items
                                    >
                                        {/* Use onCheckedChange on Checkbox for direct toggle */}
                                        <Checkbox
                                            id={`shopper-${shopper.value}`}
                                            checked={selectedUsersForAssignment.includes(shopper.value)}
                                            onCheckedChange={() => handleUserSelectionChange(shopper.value)} // Direct toggle via checkbox click
                                            aria-labelledby={`shopper-label-${shopper.value}`}
                                         />
                                        <div id={`shopper-label-${shopper.value}`} className="flex flex-col text-sm flex-grow">
                                             <span>{shopper.label}</span> {/* Name */}
                                            <span className="text-xs text-muted-foreground">{shopper.email}</span> {/* Email */}
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                 <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3"/> {shopper.city}</span>
                                                 <span className="flex items-center gap-1"><Award className="w-3 h-3"/> {shopper.completedMissions} done</span>
                                             </div>
                                        </div>
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                             </ScrollArea>
                          </CommandList>
                        </Command>
                        {/* Display selected users */}
                        {selectedUsersForAssignment.length > 0 && (
                             <div className="pt-2 text-xs text-muted-foreground">
                                 Selected: {selectedUsersForAssignment.map(id => shoppers.find(s => s.value === id)?.label).join(', ')}
                             </div>
                         )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setAssignDialogOpen(false)} disabled={isProcessing === selectedMissionForAssignment?.id}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAssignMission}
                            disabled={isProcessing === selectedMissionForAssignment?.id || selectedUsersForAssignment.length === 0}
                        >
                            {isProcessing === selectedMissionForAssignment?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Assign Mission{selectedUsersForAssignment.length > 1 ? 's' : ''}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
    