'use client'; // This page needs client-side interactivity for the apply button

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowLeft, FileWarning, MapPin, Calendar, DollarSign, Tag, Briefcase, CheckCircle, Info, Send } from 'lucide-react';
import { mockMissions, mockUser } from '@/lib/mock-data'; // Using mock data
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
// Assume an apply action exists or will be created
// import { applyForMissionAction } from '@/app/actions/mission-actions'; // Placeholder

export default function MissionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const missionId = params.missionId;
    const [mission, setMission] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [error, setError] = useState(null);

    // Simulate fetching mission data
    useEffect(() => {
        const fetchMission = async () => {
            setIsLoading(true);
            setError(null);
            console.log(`Fetching details for mission ID: ${missionId}`);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));
            const foundMission = mockMissions.find(m => m.id === missionId);

            if (foundMission) {
                // Check if the mission is actually available for applying
                if (foundMission.status !== 'available') {
                    setError('This mission is no longer available for application.');
                }
                setMission(foundMission);
            } else {
                setError('Mission not found.');
            }
            setIsLoading(false);
        };

        if (missionId) {
            fetchMission();
        } else {
             setError('Invalid mission ID provided.');
             setIsLoading(false);
        }
    }, [missionId]);

    const handleApply = async () => {
        setIsApplying(true);
        console.log(`Simulating application for mission ${missionId} by user ${mockUser.id}`);

        // --- TODO: Replace with actual server action call ---
        // Example call (needs applyForMissionAction to exist):
        // const result = await applyForMissionAction(missionId, mockUser.id);

        // --- Simulation ---
        await new Promise(resolve => setTimeout(resolve, 1000));
        const simulateSuccess = true; // Change to false to test failure
        let result = { success: simulateSuccess, message: "" };

        if (simulateSuccess) {
            // Update mock data for simulation consistency
            const missionIndex = mockMissions.findIndex(m => m.id === missionId);
            if (missionIndex > -1 && mockMissions[missionIndex].status === 'available') {
                mockMissions[missionIndex].status = 'assigned';
                mockMissions[missionIndex].assignedTo = mockUser.id; // Assign to mock user
                result.message = "Application successful! The mission is now assigned to you.";
                console.log(`Mock mission ${missionId} assigned to ${mockUser.id}`);
            } else {
                result.success = false; // Mission might have been taken already
                result.message = "Mission is no longer available.";
            }
        } else {
            result.message = "Application failed. Please try again later.";
        }
        // --- End Simulation ---


        if (result.success) {
             toast({
                title: "Application Successful!",
                description: result.message,
            });
            // Redirect to assigned missions page
            router.push('/missions/assigned');
        } else {
             toast({
                variant: "destructive",
                title: "Application Failed",
                description: result.message,
            });
            setIsApplying(false); // Allow user to retry if failed
        }
    };


    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 <span className="ml-2">Loading Mission Details...</span>
            </div>
        );
    }

    if (error || !mission) {
        return (
             <div className="container mx-auto py-8 px-4 flex flex-col items-center">
                <Alert variant="destructive" className="max-w-lg w-full">
                     <FileWarning className="h-4 w-4" />
                    <AlertTitle>Error Loading Mission</AlertTitle>
                    <AlertDescription>{error || 'Mission data could not be loaded.'}</AlertDescription>
                </Alert>
                 <Button asChild variant="link" className="mt-6">
                    <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Available Missions</Link>
                </Button>
             </div>
        );
    }


    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
             <Button asChild variant="outline" size="sm" className="mb-6">
                <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Available Missions
                </Link>
            </Button>

            <Card className="shadow-lg">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="text-2xl font-bold text-primary">{mission.title}</CardTitle>
                    <CardDescription className="text-sm pt-1 flex items-center gap-1 text-muted-foreground">
                         <Briefcase className="w-4 h-4" /> {mission.businessName} - {mission.category}
                    </CardDescription>
                </CardHeader>
                 <CardContent className="pt-6 space-y-4">
                    <div>
                        <h3 className="text-md font-semibold mb-1 flex items-center gap-1"><Info className="w-4 h-4"/> Description</h3>
                        <p className="text-sm text-foreground/90">{mission.description}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> <strong className="text-muted-foreground">Location:</strong> {mission.location}</p>
                        <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> <strong className="text-muted-foreground">Deadline:</strong> {format(mission.deadline, 'PPP')}</p>
                        <p className="flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> <strong className="text-muted-foreground">Category:</strong> {mission.category}</p>
                        <p className="flex items-center gap-2 font-medium"><DollarSign className="w-4 h-4 text-accent" /> <strong className="text-muted-foreground font-normal">Reward:</strong> ${mission.reward}</p>
                     </div>
                     {/* Add more details if available: requirements, specific instructions etc. */}

                 </CardContent>
                <CardFooter className="border-t pt-6">
                    {mission.status === 'available' ? (
                        <Button
                            onClick={handleApply}
                            disabled={isApplying}
                            className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                             {isApplying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Applying...
                                </>
                             ) : (
                                 <>
                                    <Send className="w-4 h-4 mr-2" /> Apply for this Mission
                                 </>
                             )}
                        </Button>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">This mission is no longer available for application.</p>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
