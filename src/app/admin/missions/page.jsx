'use client';

import React, { useState, useMemo, startTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button'; // Import buttonVariants
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, MoreHorizontal, Search, Edit, Trash2, FileCheck, FileText, Loader2 } from 'lucide-react';
import { mockMissions, mockReports } from '@/lib/mock-data'; // Use mock data for now
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { deleteMissionAction } from '../../actions/admin-actions.js'; // Import delete action using relative path

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
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(null); // Track which mission is being deleted

    // Fetch initial data (missions and reports)
    useEffect(() => {
        setIsLoading(true);
        // Simulate fetching data
        // In a real app, fetch missions and reports from your backend
        setTimeout(() => {
            setMissions(mockMissions);
            setReports(mockReports);
            setIsLoading(false);
        }, 300); // Short delay for simulation
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
        console.log(`Admin: Edit mission ${missionId}`);
        // Navigate to edit page
        router.push(`/admin/missions/${missionId}/edit`);
        // toast({ title: "Edit Mission", description: `Navigating to edit page for ${missionId} (Not Implemented)` }); // Replaced toast with navigation
    };

    const handleEditSurvey = (missionId) => {
        router.push(`/admin/missions/${missionId}/survey/create`); // Navigate to survey edit/create page
    };

    const handleDeleteMission = async (missionId) => {
        setIsDeleting(missionId);
        console.log(`Admin: Deleting mission ${missionId}`);

        try {
            const result = await deleteMissionAction(missionId); // Use server action
             if (result.success) {
                 startTransition(() => {
                   setMissions(prev => prev.filter(m => m.id !== missionId));
                   // Also remove associated reports from local state for consistency
                   setReports(prev => prev.filter(r => r.missionId !== missionId));
                });
                toast({ title: "Mission Deleted", description: result.message });
             } else {
                 throw new Error(result.message || "Failed to delete mission.");
             }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsDeleting(null);
        }
    };

     const handleReviewReports = (missionId) => {
        console.log(`Admin: Review reports for mission ${missionId}`);
        // Navigate to reports review page for this mission
        router.push(`/admin/missions/${missionId}/reports`);
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
                    <CardDescription>View, edit, and manage all missions and review submitted reports.</CardDescription>
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
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMissions.length > 0 ? (
                                filteredMissions.map((mission) => {
                                    const pendingCount = pendingReportsCount[mission.id] || 0;
                                    return (
                                        <TableRow key={mission.id} className={isDeleting === mission.id ? 'opacity-50' : ''}>
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
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting === mission.id}>
                                                            {isDeleting === mission.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        {/* Review Reports - Navigate */}
                                                        <DropdownMenuItem onClick={() => handleReviewReports(mission.id)} disabled={isDeleting === mission.id}>
                                                            <FileCheck className="mr-2 h-4 w-4" /> Review Reports
                                                            {pendingCount > 0 && <Badge variant="destructive" className="ml-auto text-xs">{pendingCount} New</Badge>}
                                                        </DropdownMenuItem>
                                                        {/* Edit Mission Details - Navigate */}
                                                        <DropdownMenuItem onClick={() => handleEditMission(mission.id)} disabled={isDeleting === mission.id}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit Mission
                                                        </DropdownMenuItem>
                                                        {/* Edit Survey - Navigate */}
                                                        <DropdownMenuItem onClick={() => handleEditSurvey(mission.id)} disabled={isDeleting === mission.id}>
                                                            <FileText className="mr-2 h-4 w-4" /> Edit Survey
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {/* Delete Mission - With Confirmation */}
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                                    onSelect={(e) => e.preventDefault()} // Prevent closing dropdown immediately
                                                                    disabled={isDeleting === mission.id}
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
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className={buttonVariants({ variant: "destructive" })}
                                                                        onClick={() => handleDeleteMission(mission.id)}
                                                                        disabled={isDeleting === mission.id}
                                                                    >
                                                                        {isDeleting === mission.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No missions found matching your search criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
