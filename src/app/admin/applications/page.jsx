
'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle, XCircle, UserCheck, Search, Info, MapPin, Building, FileText, Tag } from 'lucide-react';
import { mockApplications, mockMissions, mockStores } from '@/lib/mock-data'; // Import mockStores
import { mockUsers } from '@/app/admin/users/users-mock.js';
import { approveApplicationAction, refuseApplicationAction } from '../../actions/admin-actions.js';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Helper to get mission details by ID
const getMissionDetails = (missionId) => {
    const mission = mockMissions.find(m => m.id === missionId);
    return mission || { title: 'Unknown Mission', location: 'N/A', businessName: 'N/A', description: 'N/A' };
};

// Helper to get user details by ID
const getUserDetails = (userId) => {
    const user = mockUsers.find(u => u.id === userId);
    return user || { name: 'Unknown User', email: 'N/A', profilePicUrl: null };
};

// Helper to check if location is lat/long
const isLatLong = (location) => {
    if (typeof location !== 'string') return false;
    const parts = location.split(',');
    return parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]));
}

export default function AdminApplicationsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(null); // Track processing application ID
    const [refusalReason, setRefusalReason] = useState('');
    const [applicationToRefuse, setApplicationToRefuse] = useState(null); // Track which application modal is open for
    const [applicationToApprove, setApplicationToApprove] = useState(null); // Track which app modal is open for approval
    const [searchTerm, setSearchTerm] = useState('');
    const [isTransitioning, startTransition] = useTransition();

    // State for the editable fields in the approval modal
    const [assignmentDetails, setAssignmentDetails] = useState({
        specificStoreAddress: '',
        specificScenario: ''
    });
    const [selectedStoreId, setSelectedStoreId] = useState('');

    useEffect(() => {
        setIsLoading(true);
        // Simulate fetching data, filter for pending applications
        setTimeout(() => {
            startTransition(() => {
                const apps = Array.isArray(mockApplications) ? mockApplications : [];
                setApplications(apps.filter(app => app.status === 'pending'));
            });
            setIsLoading(false);
        }, 300);
    }, []);

    const storesForMission = applicationToApprove ? mockStores.filter(s => s.mission_id === applicationToApprove.mission_id && s.active) : [];
    const selectedStoreDetails = selectedStoreId ? storesForMission.find(s => s.id === selectedStoreId) : null;

    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const missionTitle = getMissionDetails(app.mission_id).title.toLowerCase();
            const userName = getUserDetails(app.user_id).name.toLowerCase();
            const userEmail = getUserDetails(app.user_id).email.toLowerCase();
            const term = searchTerm.toLowerCase();
            return missionTitle.includes(term) || userName.includes(term) || userEmail.includes(term) || app.id.includes(term);
        });
    }, [applications, searchTerm]);

    const handleApprove = async () => {
        if (!applicationToApprove) return;
        const applicationId = applicationToApprove.id;

        setIsProcessing(applicationId);
        try {
            // Pass the specific assignment details to the server action
            const result = await approveApplicationAction(applicationId, assignmentDetails);
            if (result.success) {
                toast({ title: "Application Approved", description: result.message });
                startTransition(() => {
                    setApplications(prev => prev.filter(app => app.id !== applicationId));
                    const appIndex = mockApplications.findIndex(a => a.id === applicationId);
                    if (appIndex !== -1) mockApplications[appIndex].status = 'approved';
                });
                setApplicationToApprove(null); // Close the modal on success
            } else {
                throw new Error(result.message || "Failed to approve application.");
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error Approving", description: error.message });
        } finally {
            setIsProcessing(null);
        }
    };
    
    // When opening the approval modal, populate the assignment details
    const openApproveModal = (app) => {
        const mission = getMissionDetails(app.mission_id);
        setApplicationToApprove(app);
        // Reset state when opening
        setAssignmentDetails({
            specificStoreAddress: '',
            specificScenario: mission.description // Pre-fill scenario from mission
        });
        setSelectedStoreId('');
    };
    
    const handleStoreSelection = (storeId) => {
        const store = mockStores.find(s => s.id === storeId);
        if (store) {
            setSelectedStoreId(storeId);
            setAssignmentDetails(prev => ({
                ...prev,
                specificStoreAddress: `${store.address}, ${store.city}`,
            }));
        } else {
            setSelectedStoreId('');
            setAssignmentDetails(prev => ({
                ...prev,
                specificStoreAddress: '',
            }));
        }
    };

    const handleRefuse = async () => {
        if (!applicationToRefuse || !refusalReason.trim()) {
            toast({ variant: "destructive", title: "Missing Reason", description: "Please provide a reason for refusal." });
            return;
        }
        const applicationId = applicationToRefuse.id;
        setIsProcessing(applicationId);
        try {
            const result = await refuseApplicationAction(applicationId, refusalReason);
            if (result.success) {
                toast({ title: "Application Refused", description: result.message });
                 startTransition(() => {
                    setApplications(prev => prev.filter(app => app.id !== applicationId));
                    const appIndex = mockApplications.findIndex(a => a.id === applicationId);
                    if (appIndex !== -1) {
                        mockApplications[appIndex].status = 'refused';
                        mockApplications[appIndex].refusal_reason = refusalReason;
                    }
                });
                setApplicationToRefuse(null);
                setRefusalReason('');
            } else {
                throw new Error(result.message || "Failed to refuse application.");
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error Refusing", description: error.message });
        } finally {
            setIsProcessing(null);
        }
    };

    if (isLoading) {
        return (
          <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading applications...</span>
          </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                <UserCheck className="w-6 h-6" /> Pending Mission Applications
            </h1>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Review Applications</CardTitle>
                    <CardDescription>Approve or refuse shopper applications for missions.</CardDescription>
                    <div className="relative pt-2">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by mission, shopper name, email, or app ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-full md:w-2/3 lg:w-1/2"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">Shopper</TableHead>
                                    <TableHead className="min-w-[180px]">Mission Applied For</TableHead>
                                    <TableHead className="min-w-[120px]">Applied On</TableHead>
                                    <TableHead className="min-w-[100px]">App ID</TableHead>
                                    <TableHead className="text-right min-w-[200px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApplications.length > 0 ? (
                                    filteredApplications.map((app) => {
                                        const mission = getMissionDetails(app.mission_id);
                                        const user = getUserDetails(app.user_id);
                                        const isCurrentProcessing = isProcessing === app.id;

                                        return (
                                            <TableRow key={app.id} className={isCurrentProcessing ? 'opacity-50 pointer-events-none' : ''}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8 border">
                                                            <AvatarImage src={user.profilePicUrl} alt={user.name} />
                                                            <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/admin/missions/${app.mission_id}/edit`} className="hover:underline text-primary font-medium">
                                                        {mission.title}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{format(new Date(app.applied_at), 'PPp')}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{app.id}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    {/* Refuse Dialog */}
                                                    <AlertDialog open={applicationToRefuse?.id === app.id} onOpenChange={(isOpen) => { if (!isOpen) { setApplicationToRefuse(null); setRefusalReason(''); }}}>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => setApplicationToRefuse(app)}
                                                                disabled={isCurrentProcessing}
                                                            >
                                                                <XCircle className="w-4 h-4 mr-1" /> Refuse
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Refuse Application for {mission.title}?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Shopper: {user.name}. Please provide a reason for refusal. This may be shared with the shopper.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <Textarea
                                                                placeholder="Enter reason for refusal..."
                                                                value={refusalReason}
                                                                onChange={(e) => setRefusalReason(e.target.value)}
                                                                rows={3}
                                                                className="my-4"
                                                            />
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel onClick={() => { setApplicationToRefuse(null); setRefusalReason(''); }}>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={handleRefuse}
                                                                    disabled={isCurrentProcessing || !refusalReason.trim()}
                                                                    className={buttonVariants({ variant: "destructive" })}
                                                                >
                                                                    {isProcessing === app.id && applicationToRefuse?.id === app.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                                    Confirm Refusal
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    
                                                    {/* Approve Dialog */}
                                                    <AlertDialog open={applicationToApprove?.id === app.id} onOpenChange={(isOpen) => { if (!isOpen) setApplicationToApprove(null); }}>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                                onClick={() => openApproveModal(app)}
                                                                disabled={isCurrentProcessing}
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Approve & Assign Mission</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Select a store and confirm the assignment details for <strong>{user.name}</strong>.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <div className="my-4 text-sm space-y-4 p-3 border rounded-md bg-secondary/50">
                                                                <div className="font-semibold text-primary">{mission.title}</div>
                                                                
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="store-select">Select Store *</Label>
                                                                    <Select onValueChange={handleStoreSelection} value={selectedStoreId}>
                                                                        <SelectTrigger id="store-select">
                                                                            <SelectValue placeholder="Select a store for assignment..." />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {storesForMission.length > 0 ? (
                                                                                storesForMission.map(store => (
                                                                                    <SelectItem key={store.id} value={store.id}>{store.name} - {store.city}</SelectItem>
                                                                                ))
                                                                            ) : (
                                                                                <div className="p-2 text-xs text-muted-foreground">No active stores found for this mission.</div>
                                                                            )}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                {selectedStoreDetails && (
                                                                    <div className="space-y-2 p-3 border rounded-md bg-background text-xs">
                                                                         <p className="flex items-center gap-2"><Building className="w-3 h-3 text-muted-foreground"/> <strong>Name:</strong> {selectedStoreDetails.name}</p>
                                                                         <p className="flex items-center gap-2"><Tag className="w-3 h-3 text-muted-foreground"/> <strong>Category:</strong> {selectedStoreDetails.category}</p>
                                                                    </div>
                                                                )}

                                                                <div className="space-y-1">
                                                                    <Label htmlFor="specificStoreAddress" className="flex items-center gap-2"><MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" /> Specific Store Address</Label>
                                                                    <Input 
                                                                        id="specificStoreAddress"
                                                                        value={assignmentDetails.specificStoreAddress}
                                                                        onChange={(e) => setAssignmentDetails(prev => ({...prev, specificStoreAddress: e.target.value}))}
                                                                        className="bg-background"
                                                                        placeholder="Address auto-fills from store selection"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                     <Label htmlFor="specificScenario" className="flex items-center gap-2"><FileText className="w-4 h-4 mt-0.5 text-muted-foreground" /> Specific Scenario / Description</Label>
                                                                     <Textarea
                                                                        id="specificScenario"
                                                                        value={assignmentDetails.specificScenario}
                                                                        onChange={(e) => setAssignmentDetails(prev => ({...prev, specificScenario: e.target.value}))}
                                                                        className="bg-background min-h-[100px]"
                                                                     />
                                                                </div>
                                                            </div>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel disabled={isCurrentProcessing}>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={handleApprove}
                                                                    disabled={isCurrentProcessing || !assignmentDetails.specificStoreAddress.trim()}
                                                                    className={buttonVariants({ variant: "default", className: "bg-green-600 hover:bg-green-700 text-white" })}
                                                                >
                                                                    {isCurrentProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4"/>}
                                                                    Confirm Approval & Assign
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No pending applications found matching your search criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                 {filteredApplications.length > 0 && (
                    <CardFooter className="text-xs text-muted-foreground">
                        Showing {filteredApplications.length} of {applications.length} pending applications.
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
