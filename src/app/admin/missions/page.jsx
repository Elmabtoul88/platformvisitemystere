'use client';

import React, { useState, useMemo, startTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button'; // Import buttonVariants
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label'; // Import Label
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"; // Removed AlertDialogTrigger as it's handled by DropdownMenuItem
import { PlusCircle, MoreHorizontal, Search, Edit, Trash2, FileCheck, FileText, Loader2, UserPlus, Award, MapPin as MapPinIcon } from 'lucide-react'; // Added UserPlus, Award, MapPinIcon icon
import { mockMissions, mockReports } from '@/lib/mock-data'; // Use mock data for now
import { mockUsers } from '../users/users-mock.js'; // Import mock users for assignment
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { deleteMissionAction, assignMissionAction } from '../../actions/admin-actions.js'; // Import actions
import { Combobox } from '@/components/ui/combobox'; // Import the Combobox component

// Helper function for status badge variant
const getStatusVariant = (status) => {
    switch (status) {
      case 'available': return 'secondary';
      case 'assigned': return 'default'; // Or 'outline' if preferred
      case 'submitted': return 'destructive'; // Highlight that reports are pending
      case 'approved': return 'default'; // Use default for completed/approved
      case 'refused': return 'outline'; // Indicate refused reports
      case 'completed': return 'default'; // Treat completed same as approved
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
    const [reports, setReports] = useState([]); // Store reports to check pending count
    const [shoppers, setShoppers] = useState([]); // Renamed users state to shoppers for clarity
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(null); // Track which mission is being deleted/assigned
    const [assignDialogOpen, setAssignDialogOpen] = useState(false); // Control assign dialog visibility
    const [selectedMissionForAssignment, setSelectedMissionForAssignment] = useState(null); // For assignment dialog
    const [selectedUserForAssignment, setSelectedUserForAssignment] = useState(''); // For assignment dialog Combobox value (user ID)

    // Fetch initial data
    useEffect(() => {
        setIsLoading(true);
        // Simulate fetching data
        setTimeout(() => {
            // Set state using startTransition for potential concurrent updates
            startTransition(() => {
                setMissions(mockMissions);
                setReports(mockReports);
                // Filter for only shoppers to assign and format for Combobox
                setShoppers(mockUsers
                    .filter(u => u.role === 'shopper' && u.status === 'active')
                    .map(u => ({
                        value: u.id,
                        label: `${u.name} (${u.email})`,
                        city: u.city || 'N/A',
                        completedMissions: u.completedMissions ?? 0,
                     }))
                 );
            });
            setIsLoading(false);
        }, 300);
    }, []);


    const filteredMissions = useMemo(() => {
        return missions.filter(mission =>
            mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (mission.businessName && mission.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [missions, searchTerm]);

    // Calculate pending reports count for each mission
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
        router.push(`/admin/missions/${missionId}/survey/create`);
    };

    const handleDeleteMission = async (missionId) => {
        setIsProcessing(missionId); // Indicate processing for this mission ID
        console.log(`Admin: Deleting mission ${missionId}`);

        try {
            const result = await deleteMissionAction(missionId);
             if (result.success) {
                 startTransition(() => {
                   setMissions(prev => prev.filter(m => m.id !== missionId));
                   setReports(prev => prev.filter(r => r.missionId !== missionId));
                });
                toast({ title: "Mission Deleted", description: result.message });
             } else {
                 throw new Error(result.message || "Failed to delete mission.");
             }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsProcessing(null); // Clear processing state
        }
    };

     const handleReviewReports = (missionId) => {
        router.push(`/admin/missions/${missionId}/reports`);
    };

     // --- Assign Mission Logic ---
    const openAssignDialog = (mission) => {
        if (mission.status !== 'available') {
            toast({ variant: "destructive", title: "Cannot Assign", description: "Mission is not available for assignment." });
            return;
        }
        setSelectedMissionForAssignment(mission);
        setSelectedUserForAssignment(''); // Reset selected user
        setAssignDialogOpen(true); // Open the dialog
    };

     const handleAssignMission = async () => {
        if (!selectedMissionForAssignment || !selectedUserForAssignment) {
            toast({ variant: "destructive", title: "Selection Required", description: "Please select a user to assign the mission." });
            return;
        }
        const missionId = selectedMissionForAssignment.id;
        setIsProcessing(missionId); // Indicate processing
        console.log(`Admin: Assigning mission ${missionId} to user ${selectedUserForAssignment}`);

        try {
            const result = await assignMissionAction(missionId, selectedUserForAssignment);
            if (result.success) {
                 startTransition(() => {
                    // Update local mission state
                     setMissions(prev => prev.map(m =>
                        m.id === missionId ? { ...m, status: 'assigned', assignedTo: selectedUserForAssignment } : m
                    ));
                      // Update mockMissions directly for simulation persistence
                     const missionIndex = mockMissions.findIndex(m => m.id === missionId);
                     if (missionIndex !== -1) {
                        mockMissions[missionIndex].status = 'assigned';
                        mockMissions[missionIndex].assignedTo = selectedUserForAssignment;
                     }
                });
                toast({ title: "Mission Assigned", description: result.message });
                setAssignDialogOpen(false); // Close dialog
                setSelectedMissionForAssignment(null);
            } else {
                throw new Error(result.message || "Failed to assign mission.");
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Assignment Failed", description: error.message });
        } finally {
            setIsProcessing(null); // Clear processing state
        }
     };

     // Custom renderer for Combobox options
     const renderShopperOption = (option) => (
        <div className="flex flex-col text-sm">
          <span>{option.label.split('(')[0]}</span> {/* Name */}
          <span className="text-xs text-muted-foreground">{option.label.split('(')[1].replace(')', '')}</span> {/* Email */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3"/> {option.city}</span>
            <span className="flex items-center gap-1"><Award className="w-3 h-3"/> {option.completedMissions} done</span>
          </div>
        </div>
      );
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
                                <TableHead>Assigned To</TableHead> {/* Added Assigned To Column */}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMissions.length > 0 ? (
                                filteredMissions.map((mission) => {
                                    const pendingCount = pendingReportsCount[mission.id] || 0;
                                    const assignedShopper = shoppers.find(u => u.value === mission.assignedTo);
                                    const assignedUserName = assignedShopper ? assignedShopper.label.split('(')[0].trim() : mission.assignedTo || 'N/A';
                                    const isCurrentProcessing = isProcessing === mission.id; // Check if this mission is being processed

                                    return (
                                        <TableRow key={mission.id} className={isCurrentProcessing ? 'opacity-50 pointer-events-none' : ''}>
                                            <TableCell className="font-medium">{mission.title}</TableCell><TableCell>{mission.businessName || 'N/A'}</TableCell><TableCell>{mission.location}</TableCell><TableCell>{format(new Date(mission.deadline), 'PP')}</TableCell><TableCell>${mission.reward}</TableCell><TableCell>
                                                <Badge variant={getStatusVariant(mission.status)} className="capitalize">
                                                     {getStatusText(mission.status)}
                                                </Badge>
                                            </TableCell>{/* Display Assigned User */}
                                            <TableCell className="text-xs">
                                                {mission.status === 'assigned' || mission.status === 'submitted' || mission.status === 'approved' || mission.status === 'refused'
                                                    ? assignedUserName
                                                    : <span className="text-muted-foreground">Not Assigned</span>
                                                }
                                            </TableCell><TableCell className="text-right">
                                                {/* Removed AlertDialog wrapper, will use state */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isCurrentProcessing}>
                                                            {isCurrentProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        {/* Assign User - Opens Dialog */}
                                                        {mission.status === 'available' && (
                                                            <DropdownMenuItem onClick={() => openAssignDialog(mission)} disabled={isCurrentProcessing}>
                                                                <UserPlus className="mr-2 h-4 w-4" /> Assign to Shopper
                                                            </DropdownMenuItem>
                                                        )}
                                                        {/* Review Reports */}
                                                            {(mission.status === 'submitted' || mission.status === 'approved' || mission.status === 'refused') && (
                                                            <DropdownMenuItem onClick={() => handleReviewReports(mission.id)} disabled={isCurrentProcessing}>
                                                                <FileCheck className="mr-2 h-4 w-4" /> Review Reports
                                                                {pendingCount > 0 && <Badge variant="destructive" className="ml-auto text-xs">{pendingCount} New</Badge>}
                                                            </DropdownMenuItem>
                                                            )}
                                                        {/* Edit Mission Details */}
                                                        <DropdownMenuItem onClick={() => handleEditMission(mission.id)} disabled={isCurrentProcessing}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit Mission
                                                        </DropdownMenuItem>
                                                        {/* Edit Survey */}
                                                        <DropdownMenuItem onClick={() => handleEditSurvey(mission.id)} disabled={isCurrentProcessing}>
                                                            <FileText className="mr-2 h-4 w-4" /> Edit Survey
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {/* Delete Mission - Uses nested AlertDialog */}
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                                    onSelect={(e) => e.preventDefault()}
                                                                    disabled={isCurrentProcessing || mission.status === 'assigned' || mission.status === 'submitted'} // Disable delete if assigned/submitted
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

            {/* Assign User Dialog - Controlled by state */}
            <AlertDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Assign Mission: {selectedMissionForAssignment?.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Select an active shopper to assign this mission to. The shopper will be notified.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="shopper-combobox">Select Shopper</Label>
                        <Combobox
                            options={shoppers}
                            value={selectedUserForAssignment}
                            onValueChange={setSelectedUserForAssignment}
                            placeholder="Search by name or email..."
                            searchPlaceholder="Search shopper..."
                            emptyMessage="No active shoppers found."
                            renderOption={renderShopperOption} // Pass the custom renderer
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setAssignDialogOpen(false)} disabled={isProcessing === selectedMissionForAssignment?.id}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAssignMission}
                            disabled={isProcessing === selectedMissionForAssignment?.id || !selectedUserForAssignment}
                        >
                            {isProcessing === selectedMissionForAssignment?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Assign Mission
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
