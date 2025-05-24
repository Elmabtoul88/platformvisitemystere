
// admin/missions/page.jsx
'use client';

import React, { useState, useMemo, useTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, MoreHorizontal, Search, Edit, Trash2, FileCheck, FileText, Loader2, UserPlus, Award, MapPin as MapPinIcon, Users as UsersIcon, FileSignature, ListFilter } from 'lucide-react';
import { mockMissions, mockReports, mockAssignments, mockApplications, mockUsers } from '@/lib/mock-data'; // Import all necessary mock data, including mockUsers

import { assignMissionAction, deleteMissionAction } from '../../actions/admin-actions.js';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


// Helper function for status badge variant
const getStatusVariant = (status) => {
    switch (status) {
      case 'available': return 'secondary';
      case 'pending_approval': return 'outline'; // For applications pending
      case 'assigned': return 'default';
      case 'submitted': return 'outline';
      case 'approved': return 'default';
      case 'refused': return 'destructive';
      case 'completed': return 'default'; // Typically 'approved' missions might be shown as 'completed' in some views
      default: return 'secondary';
    }
};

const getStatusInfo = (status) => {
    switch (status) {
      case 'available': return { text: 'Available', className: '' };
      case 'pending_approval': return { text: 'Pending App.', className: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'assigned': return { text: 'Assigned', className: 'bg-primary/10 text-primary-foreground' }; // Adjusted for teal
      case 'submitted': return { text: 'Review Reports', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      case 'approved': return { text: 'Approved', className: 'bg-green-100 text-green-800 border-green-300' };
      case 'refused': return { text: 'Refused', className: '' }; // Destructive variant handles this
      case 'completed': return { text: 'Approved', className: 'bg-green-100 text-green-800 border-green-300' }; // Usually means approved
      default: return { text: status.charAt(0).toUpperCase() + status.slice(1), className: '' };
    }
  };

const countSubmittedReports = (missionId) => {
    return mockReports.filter(r => r.mission_id === missionId && r.status === 'submitted').length;
};

const getUserById = (userId) => {
    // Ensure mockUsers is treated as an array before finding
    const usersArray = Array.isArray(mockUsers) ? mockUsers : [];
    return usersArray.find(u => u.id === userId);
};


export default function AdminMissionsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [missions, setMissionsState] = useState(mockMissions); // Renamed to avoid conflict with imported mockMissions
    const [activeShoppers, setActiveShoppers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(null); // For delete operations
    const [isAssigning, setIsAssigning] = useState(false); // For assignment dialog
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedMissionForAssignment, setSelectedMissionForAssignment] = useState(null);
    const [selectedUsersForAssignment, setSelectedUsersForAssignment] = useState([]);
    const [shopperSearchTerm, setShopperSearchTerm] = useState('');
    const [isTransitioning, startTransition] = useTransition();

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            startTransition(() => {
                // Use a state setter for missions to allow updates
                setMissionsState(mockMissions);
                const usersArray = Array.isArray(mockUsers) ? mockUsers : [];
                const filteredActiveShoppers = usersArray
                    .filter(u => u.role === 'shopper' && u.status === 'active')
                    .map(u => ({
                        value: u.id,
                        label: u.name,
                        email: u.email,
                        city: u.city || 'N/A',
                        completedMissions: u.completed_missions_count ?? 0,
                        profilePicUrl: u.profile_pic_url,
                     }));
                setActiveShoppers(filteredActiveShoppers);
            });
            setIsLoading(false);
        }, 300);
    }, []);


    const filteredMissions = useMemo(() => {
        return missions.filter(mission =>
            mission.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (mission.business_name && mission.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [missions, searchTerm]);

     const filteredShoppersForDialog = useMemo(() => {
        if (!shopperSearchTerm) return activeShoppers;
        return activeShoppers.filter(shopper =>
            shopper.label.toLowerCase().includes(shopperSearchTerm.toLowerCase()) ||
            shopper.email.toLowerCase().includes(shopperSearchTerm.toLowerCase())
        );
    }, [activeShoppers, shopperSearchTerm]);


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
        setIsProcessing(missionId);
        try {
            const result = await deleteMissionAction(missionId);
             if (result.success) {
                 startTransition(() => {
                   setMissionsState(prev => prev.filter(m => m.id !== missionId));
                   const index = mockMissions.findIndex(m => m.id === missionId);
                   if (index > -1) mockMissions.splice(index, 1);

                    const applicationsToKeep = mockApplications.filter(app => app.mission_id !== missionId);
                    mockApplications.length = 0;
                    mockApplications.push(...applicationsToKeep);

                    const assignmentsToKeep = mockAssignments.filter(assign => assign.mission_id !== missionId);
                    mockAssignments.length = 0;
                    mockAssignments.push(...assignmentsToKeep);

                    const reportsToKeep = mockReports.filter(report => report.mission_id !== missionId);
                    mockReports.length = 0;
                    mockReports.push(...reportsToKeep);
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

    const openAssignDialog = (mission) => {
        if (!['available', 'assigned', 'pending_approval'].includes(mission.status)) {
            toast({ variant: "destructive", title: "Cannot Assign", description: `Mission status (${mission.status}) prevents assignment.` });
            return;
        }
        setSelectedMissionForAssignment(mission);
        const currentAssignees = mockAssignments
            .filter(a => a.mission_id === mission.id)
            .map(a => a.user_id);
         setSelectedUsersForAssignment(currentAssignees);
        setShopperSearchTerm('');
        setIsAssigning(false); // Ensure checkboxes are enabled when dialog opens
        setAssignDialogOpen(true);
    };

     const handleUserSelectionChange = (userId) => {
         setSelectedUsersForAssignment(prevSelected => {
             const isSelected = prevSelected.includes(userId);
             const newSelected = isSelected
                 ? prevSelected.filter(id => id !== userId)
                 : [...prevSelected, userId];
             return newSelected;
         });
     };


    const handleAssignMission = async () => {
        if (!selectedMissionForAssignment || selectedUsersForAssignment.length === 0) {
            toast({ variant: "destructive", title: "Selection Required", description: "Please select at least one user to assign the mission." });
            return;
        }
        const missionId = selectedMissionForAssignment.id;
        setIsAssigning(true);

        try {
             // The server action `assignMissionAction` now handles an array of user IDs.
            const result = await assignMissionAction(missionId, selectedUsersForAssignment);
             if (result.success) {
                 startTransition(() => {
                     setMissionsState(prevMissions => prevMissions.map(m =>
                         m.id === missionId ? { ...m, status: 'assigned', assignedTo: selectedUsersForAssignment } : m
                     ));

                      // Update mockAssignments: Remove old for this mission, add new
                      // Filter out existing assignments for this mission
                    const otherAssignments = mockAssignments.filter(a => a.mission_id !== missionId);
                    // Create new assignment objects for each selected user
                    const newAssignmentsForThisMission = selectedUsersForAssignment.map(userId => ({
                        id: `asg-${Date.now()}-${userId}-${Math.random().toString(16).slice(2)}`,
                        mission_id: missionId,
                        user_id: userId,
                        assigned_at: new Date().toISOString()
                    }));
                    // Replace the entire mockAssignments array
                    mockAssignments.length = 0; // Clear existing
                    mockAssignments.push(...otherAssignments, ...newAssignmentsForThisMission);


                    const missionIndex = mockMissions.findIndex(m => m.id === missionId);
                    if (missionIndex > -1) {
                        mockMissions[missionIndex].status = 'assigned';
                        // Instead of overwriting, ensure `assignedTo` in `mockMissions` is also an array
                        // and correctly reflects all assigned users.
                        // For simplicity with mock data, we might just set it directly:
                        mockMissions[missionIndex].assignedTo = [...selectedUsersForAssignment];

                         // If user was in appliedBy, remove them (admin direct assignment not through application flow)
                        if (mockMissions[missionIndex].appliedBy && Array.isArray(mockMissions[missionIndex].appliedBy)) {
                            selectedUsersForAssignment.forEach(userId => {
                                const appIndex = mockMissions[missionIndex].appliedBy.indexOf(userId);
                                if (appIndex > -1) {
                                    mockMissions[missionIndex].appliedBy.splice(appIndex, 1);
                                }
                            });
                        }
                        // Also update mockApplications globally
                        selectedUsersForAssignment.forEach(userId => {
                            const appIndexGlobal = mockApplications.findIndex(app => app.mission_id === missionId && app.user_id === userId);
                            if (appIndexGlobal > -1) {
                                mockApplications[appIndexGlobal].status = 'approved'; // Or remove if that's the flow
                            }
                        });

                    }
                 });
                 toast({ title: "Mission Assigned", description: result.message });
                 setAssignDialogOpen(false);
                 setSelectedMissionForAssignment(null);
                 setSelectedUsersForAssignment([]);
             } else {
                 throw new Error(result.message || "Failed to assign mission.");
             }
        } catch (error) {
             toast({ variant: "destructive", title: "Assignment Failed", description: error.message });
        } finally {
            setIsAssigning(false);
        }
    };


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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <FileSignature className="w-6 h-6" /> Manage Missions
                </h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button onClick={() => router.push('/admin/applications')} variant="outline" size="sm" className="w-full sm:w-auto">
                         <ListFilter className="w-4 h-4 mr-2" /> View Applications
                    </Button>
                    <Button onClick={handleCreateMission} size="sm" className="w-full sm:w-auto">
                        <PlusCircle className="w-4 h-4 mr-2" /> Create New Mission
                    </Button>
                </div>
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
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">Title</TableHead>
                                    <TableHead className="min-w-[120px]">Business</TableHead>
                                    <TableHead className="min-w-[150px]">Location</TableHead>
                                    <TableHead className="min-w-[100px]">Deadline</TableHead>
                                    <TableHead className="min-w-[80px]">Reward</TableHead>
                                    <TableHead className="min-w-[150px]">Status</TableHead>
                                    <TableHead className="min-w-[150px]">Assigned To</TableHead>
                                    <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody><TooltipProvider> {/* Ensure TooltipProvider wraps the rows */}
                                {filteredMissions.length > 0 ? (
                                    filteredMissions.map((mission) => {
                                        const submittedCount = countSubmittedReports(mission.id);
                                        // Ensure assignedTo is an array before mapping
                                        const assignedUserIds = Array.isArray(mission.assignedTo) ? mission.assignedTo : (mission.assignedTo ? [mission.assignedTo] : []);
                                        const assignedShoppersDetails = assignedUserIds.map(id => getUserById(id)).filter(Boolean);

                                        const isCurrentProcessing = isProcessing === mission.id;
                                        const statusInfo = getStatusInfo(mission.status);
                                        // Find pending applications for THIS mission
                                        const pendingApplicationsCount = mockApplications.filter(app => app.mission_id === mission.id && app.status === 'pending').length;


                                        return (
                                            <TableRow key={mission.id} className={isCurrentProcessing ? 'opacity-50 pointer-events-none' : ''}>
                                                <TableCell className="font-medium">{mission.title}</TableCell>
                                                <TableCell>{mission.business_name || 'N/A'}</TableCell>
                                                <TableCell>{mission.location}</TableCell>
                                                <TableCell>{format(new Date(mission.deadline), 'PP')}</TableCell>
                                                <TableCell>${mission.reward}</TableCell>
                                                <TableCell>
                                                     <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                         <Badge variant={getStatusVariant(mission.status)} className={`capitalize px-2 py-1 ${statusInfo.className}`}> {/* Adjusted padding */}
                                                             {statusInfo.text}
                                                         </Badge>
                                                         {mission.status === 'submitted' && submittedCount > 0 && (
                                                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 h-fit leading-tight flex items-center">
                                                                 {submittedCount}
                                                             </Badge>
                                                         )}
                                                          {mission.status === 'pending_approval' && pendingApplicationsCount > 0 && (
                                                            <Badge variant="outline" className="text-xs px-1.5 py-1 h-fit leading-tight flex items-center bg-orange-100 text-orange-800 border-orange-300">
                                                                 {pendingApplicationsCount} New
                                                             </Badge>
                                                         )}
                                                     </div>
                                                </TableCell>
                                                <TableCell className="text-xs max-w-[150px]">
                                                    {assignedShoppersDetails.length > 0 ? (
                                                        <div className="flex items-center -space-x-2">
                                                             {assignedShoppersDetails.slice(0, 3).map((shopper) => (
                                                                <Tooltip key={shopper.id}>
                                                                    <TooltipTrigger asChild>
                                                                         <Avatar className="h-6 w-6 border-2 border-background hover:z-10">
                                                                            <AvatarImage src={shopper.profile_pic_url} alt={shopper.name} />
                                                                            <AvatarFallback>{shopper.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                                                                         </Avatar>
                                                                    </TooltipTrigger>
                                                                     <TooltipContent>
                                                                        <p>{shopper.name}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            ))}
                                                             {assignedShoppersDetails.length > 3 && (
                                                                <Tooltip>
                                                                     <TooltipTrigger asChild>
                                                                        <Avatar className="h-6 w-6 border-2 border-background bg-muted text-muted-foreground flex items-center justify-center hover:z-10">
                                                                            <span>+{assignedShoppersDetails.length - 3}</span>
                                                                        </Avatar>
                                                                    </TooltipTrigger>
                                                                     <TooltipContent>
                                                                         <p>{assignedShoppersDetails.slice(3).map(s => s.name).join(', ')}</p>
                                                                     </TooltipContent>
                                                                </Tooltip>
                                                             )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">Not Assigned</span>
                                                    )}
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
                                                            {['available', 'assigned', 'pending_approval'].includes(mission.status) && (
                                                                <DropdownMenuItem onClick={() => openAssignDialog(mission)} disabled={isCurrentProcessing}>
                                                                    <UserPlus className="mr-2 h-4 w-4" /> Assign/Reassign
                                                                </DropdownMenuItem>
                                                            )}
                                                             {['submitted', 'approved', 'refused', 'completed'].includes(mission.status) ? (
                                                                <DropdownMenuItem onClick={() => handleReviewReports(mission.id)} disabled={isCurrentProcessing}>
                                                                     <FileCheck className="mr-2 h-4 w-4" /> Review Reports
                                                                     {submittedCount > 0 && mission.status === 'submitted' && (
                                                                         <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0.5 flex items-center leading-none">{submittedCount}</Badge>
                                                                     )}
                                                                </DropdownMenuItem>
                                                             ) : null}
                                                            <DropdownMenuItem onClick={() => handleEditMission(mission.id)} disabled={isCurrentProcessing}>
                                                                <Edit className="mr-2 h-4 w-4" /> Edit Mission Details
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
                                                                        disabled={isCurrentProcessing || ['assigned', 'submitted', 'pending_approval'].includes(mission.status)}
                                                                        title={['assigned', 'submitted', 'pending_approval'].includes(mission.status) ? "Cannot delete. Unassign or resolve applications/reports first." : ""}
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Mission
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently delete the mission
                                                                            "{mission.title}" and any associated data.
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
                                </TooltipProvider></TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <AlertDialogContent className="sm:max-w-lg">
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
                            <CommandEmpty>No active shoppers found.</CommandEmpty>
                             <ScrollArea className="h-[200px]">
                                <CommandGroup>
                                {filteredShoppersForDialog.length > 0 ? filteredShoppersForDialog.map((shopper) => (
                                    <CommandItem
                                        key={shopper.value}
                                        value={`${shopper.label} ${shopper.email}`} // Value for CMDK filtering
                                        // onSelect is handled by CMDK, we use Checkbox's onCheckedChange for our logic
                                        onSelect={() => { /* CMDK handles selection highlight, actual logic via checkbox */ }}
                                        className="flex items-center gap-2 cursor-pointer aria-selected:bg-accent/50"
                                    >
                                        <Checkbox
                                            id={`user-${shopper.value}`}
                                            checked={selectedUsersForAssignment.includes(shopper.value)}
                                            onCheckedChange={() => handleUserSelectionChange(shopper.value)}
                                            aria-label={`Select ${shopper.label}`}
                                            disabled={isAssigning}
                                            className="shrink-0"
                                         />
                                        <Label htmlFor={`user-${shopper.value}`} className="flex flex-col text-sm flex-grow cursor-pointer pl-2">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6 border">
                                                  <AvatarImage src={shopper.profilePicUrl} alt={shopper.label} />
                                                  <AvatarFallback>{shopper.label?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <span>{shopper.label}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground ml-8">{shopper.email}</span>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 ml-8">
                                                 <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3"/> {shopper.city}</span>
                                                 <span className="flex items-center gap-1"><Award className="w-3 h-3"/> {shopper.completedMissions} done</span>
                                             </div>
                                        </Label>
                                    </CommandItem>
                                )) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">No matching active shoppers found.</div>
                                )}
                                </CommandGroup>
                             </ScrollArea>
                          </CommandList>
                        </Command>
                        {selectedUsersForAssignment.length > 0 && (
                             <div className="pt-2 text-xs text-muted-foreground">
                                 Selected: {selectedUsersForAssignment.map(id => activeShoppers.find(s => s.value === id)?.label).filter(Boolean).join(', ')}
                             </div>
                         )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setAssignDialogOpen(false); setSelectedMissionForAssignment(null); setSelectedUsersForAssignment([]); }} disabled={isAssigning}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAssignMission}
                            disabled={isAssigning || selectedUsersForAssignment.length === 0}
                        >
                            {isAssigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Assign Mission{selectedUsersForAssignment.length !== 1 ? 's' : ''}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

