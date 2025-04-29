'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { mockMissions, mockReports, mockSurveyQuestions, mockUser } from '@/lib/mock-data'; // Use mock data for now
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { approveReportAction, refuseReportAction } from '@/app/actions/admin-actions'; // Import server actions
import {
    ArrowLeft, CheckCircle, XCircle, Loader2, FileWarning, User, Calendar, Star,
    MessageSquare, Image as ImageIcon, Mic, MapPin, ListOrdered, CheckSquare as CheckSquareIcon, TextCursorInput
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea for refusal reason


// Helper to get the correct icon based on question type
const getIconForType = (type) => {
    switch(type) {
        case 'text': return <TextCursorInput className="w-4 h-4 mr-1 text-muted-foreground" />;
        case 'multiple_choice': return <ListOrdered className="w-4 h-4 mr-1 text-muted-foreground" />;
        case 'checkboxes': return <CheckSquareIcon className="w-4 h-4 mr-1 text-muted-foreground" />;
        case 'rating': return <Star className="w-4 h-4 mr-1 text-muted-foreground" />;
        case 'image_upload': return <ImageIcon className="w-4 h-4 mr-1 text-muted-foreground" />;
        case 'gps_capture': return <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />;
        case 'audio_recording': return <Mic className="w-4 h-4 mr-1 text-muted-foreground" />;
        default: return null;
    }
};

// Helper function to display the answer value nicely
const formatAnswerValue = (answer, question) => {
    if (!answer || answer.value === null || answer.value === undefined) return <span className="text-muted-foreground italic">Not answered</span>;

    switch(answer.type) {
        case 'text':
            return <p className="whitespace-pre-wrap">{answer.value}</p>;
        case 'rating':
            return (
                <div className="flex items-center gap-1">
                    {Array.from({ length: question.maxRating || 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < answer.value ? 'text-accent fill-accent' : 'text-muted-foreground/30'}`}
                         />
                    ))}
                     <span className="text-sm font-medium ml-1">({answer.value}/{question.maxRating || 5})</span>
                </div>
            );
        case 'multiple_choice':
            return <span>{answer.value}</span>;
        case 'checkboxes':
            // Value is an object like { optionId: true/false }
            const selectedOptions = Object.entries(answer.value || {})
                .filter(([_, isSelected]) => isSelected)
                .map(([optionId]) => question.options.find(opt => String(opt.id) === optionId)?.text)
                .filter(Boolean); // Filter out undefined if an option is missing
            return selectedOptions.length > 0 ? (
                <ul className="list-disc list-inside">
                    {selectedOptions.map((text, i) => <li key={i}>{text}</li>)}
                </ul>
             ) : <span className="text-muted-foreground italic">No options selected</span>;
        case 'image_upload':
            const urls = Array.isArray(answer.value) ? answer.value : [answer.value];
            return (
                <div className="flex flex-wrap gap-2">
                    {urls.map((url, index) => (
                         <Link key={index} href={url} target="_blank" rel="noopener noreferrer">
                            <Image
                                src={url}
                                alt={`Submitted image ${index + 1}`}
                                width={100}
                                height={75}
                                className="rounded border object-cover hover:opacity-80 transition-opacity"
                            />
                        </Link>
                    ))}
                 </div>
            );
        case 'gps_capture':
            const coords = answer.value; // { lat: number, lng: number }
            if (coords && coords.lat && coords.lng) {
                const mapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
                 return (
                     <Link href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
                    </Link>
                );
             }
            return <span className="text-muted-foreground italic">Location not captured</span>;
        case 'audio_recording':
            const audioUrl = answer.value;
            if (audioUrl) {
                 return (
                     <audio controls src={audioUrl} className="w-full max-w-xs h-10">
                         Your browser does not support the audio element.
                     </audio>
                );
            }
            return <span className="text-muted-foreground italic">Audio not recorded</span>;
        default:
            return <span>{String(answer.value)}</span>;
    }
};


export default function AdminReviewReportsPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const missionId = params.missionId;
    const [mission, setMission] = useState(null);
    const [reports, setReports] = useState([]); // Can be multiple reports if multiple users assigned
    const [surveyQuestions, setSurveyQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingReportId, setProcessingReportId] = useState(null); // Track which report is being approved/refused
    const [refusalReason, setRefusalReason] = useState(''); // State for refusal reason
    const [reportToRefuse, setReportToRefuse] = useState(null); // Track which report modal is open for
    const [isTransitioning, startTransition] = useTransition();

    // Fetch mission and associated reports/survey questions
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            console.log(`Admin: Fetching data for mission ${missionId}`);
            // Simulate API calls
            await new Promise(resolve => setTimeout(resolve, 500));

            const foundMission = mockMissions.find(m => m.id === missionId);
            const foundReports = mockReports.filter(r => r.missionId === missionId);
            const foundQuestions = mockSurveyQuestions[missionId] || [];

            if (foundMission) {
                startTransition(() => {
                   setMission(foundMission);
                   setReports(foundReports);
                   setSurveyQuestions(foundQuestions);
                });
            } else {
                toast({ variant: "destructive", title: "Error", description: "Mission not found." });
                router.push('/admin/missions'); // Redirect if mission doesn't exist
            }
            setIsLoading(false);
        };
        fetchData();
    }, [missionId, router, toast]);

    const handleApprove = async (reportId) => {
        setProcessingReportId(reportId);
        console.log(`Admin: Approving report ${reportId}`);
        try {
            // const result = await approveReportAction(reportId, missionId); // Call server action
            // Simulate Server Action Call
             await new Promise(resolve => setTimeout(resolve, 1000));
             const result = { success: true, message: "Report approved successfully (simulated)." }; // Simulate success

            if (result.success) {
                toast({ title: "Report Approved", description: result.message });
                 // Update local state optimistically or refetch
                startTransition(() => {
                    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'approved' } : r));
                     // Optionally update mission status if all reports are done?
                     // setMission(prev => ({ ...prev, status: 'approved' })); // Example
                });

            } else {
                 throw new Error(result.message || "Failed to approve report.");
             }
        } catch (error) {
            toast({ variant: "destructive", title: "Approval Failed", description: error.message });
        } finally {
            setProcessingReportId(null);
        }
    };

    const handleRefuse = async () => {
        if (!reportToRefuse || !refusalReason.trim()) {
             toast({ variant: "destructive", title: "Missing Reason", description: "Please provide a reason for refusal." });
            return;
        }
        const reportId = reportToRefuse.id;
        setProcessingReportId(reportId);
        console.log(`Admin: Refusing report ${reportId} with reason: ${refusalReason}`);

        try {
            // const result = await refuseReportAction(reportId, missionId, refusalReason); // Call server action
             // Simulate Server Action Call
             await new Promise(resolve => setTimeout(resolve, 1000));
             const result = { success: true, message: "Report refused successfully (simulated)." }; // Simulate success

            if (result.success) {
                toast({ title: "Report Refused", description: result.message });
                 // Update local state optimistically or refetch
                 startTransition(() => {
                     setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'refused', refusalReason: refusalReason } : r));
                 });
                 setReportToRefuse(null); // Close the dialog
                 setRefusalReason(''); // Clear reason
            } else {
                 throw new Error(result.message || "Failed to refuse report.");
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Refusal Failed", description: error.message });
         } finally {
            setProcessingReportId(null); // Stop loading indicator for this specific report
         }
    };


    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!mission) {
        // This case should be handled by the redirect in useEffect, but good to have a fallback
        return (
             <div className="container mx-auto py-8 px-4">
                 <Alert variant="destructive">
                    <FileWarning className="h-4 w-4" />
                    <AlertTitle>Mission Not Found</AlertTitle>
                    <AlertDescription>The requested mission could not be found.</AlertDescription>
                 </Alert>
                <Button asChild variant="link" className="mt-4">
                    <Link href="/admin/missions"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions</Link>
                </Button>
             </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href="/admin/missions">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions List
                </Link>
            </Button>

            <Card className="mb-6 shadow-sm">
                <CardHeader>
                     <CardTitle className="text-xl font-semibold text-primary">Review Reports: {mission.title}</CardTitle>
                     <CardDescription>Mission ID: {mission.id} | Status: <Badge variant={mission.status === 'approved' ? 'default' : 'outline'} className="capitalize">{mission.status}</Badge></CardDescription>
                </CardHeader>
                {/* Optional: Add more mission details if needed */}
            </Card>

            {reports.length === 0 ? (
                 <Alert className="mt-6 bg-secondary border-secondary-foreground/10">
                   <FileWarning className="h-4 w-4" />
                   <AlertTitle>No Reports Submitted Yet</AlertTitle>
                   <AlertDescription>There are currently no reports submitted for this mission.</AlertDescription>
                 </Alert>
            ) : (
                 <div className="space-y-6">
                    {reports.map((report) => {
                         // Find user details (replace with actual user fetch later)
                         const shopper = mockUser.id === report.userId ? mockUser : { name: `User ${report.userId}`, email: 'unknown@example.com' };
                         const isProcessing = processingReportId === report.id;

                         return (
                            <Card key={report.id} className={`shadow-md transition-opacity ${isProcessing ? 'opacity-70' : ''}`}>
                                <CardHeader className="bg-secondary/30 border-b p-4">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                        <div>
                                             <CardTitle className="text-lg font-medium flex items-center gap-2">
                                                <User className="w-4 h-4 text-primary" /> Report from {shopper.name}
                                            </CardTitle>
                                             <CardDescription className="text-xs mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                <span>User ID: {report.userId}</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Submitted: {format(new Date(report.submittedAt), 'PPp')}</span>
                                             </CardDescription>
                                        </div>
                                        <Badge variant={report.status === 'approved' ? 'default' : report.status === 'refused' ? 'destructive' : 'outline'} className="capitalize text-sm px-3 py-1 w-fit">
                                            {report.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                     <h3 className="text-base font-semibold mb-3 text-foreground">Survey Answers:</h3>
                                     {surveyQuestions.length > 0 ? (
                                         surveyQuestions.map((q, index) => {
                                            // Find the corresponding answer in the report data
                                             const fieldName = `q_${q.id}_${q.type}`;
                                             const answer = report.answers?.[fieldName];

                                             return (
                                                <div key={q.id} className="py-3 border-b last:border-b-0">
                                                    <p className="text-sm font-medium mb-1 flex items-center gap-1">
                                                        {getIconForType(q.type)}
                                                        {index + 1}. {q.text} {q.isRequired && <span className="text-destructive text-xs">*</span>}
                                                     </p>
                                                     <div className="pl-5 text-sm text-foreground">
                                                         {formatAnswerValue(answer, q)}
                                                     </div>
                                                 </div>
                                            );
                                         })
                                     ) : (
                                         <p className="text-muted-foreground text-sm">No survey questions were configured for this mission version.</p>
                                     )}

                                     {/* Display refusal reason if report was refused */}
                                     {report.status === 'refused' && report.refusalReason && (
                                        <Alert variant="destructive" className="mt-4">
                                            <XCircle className="h-4 w-4" />
                                            <AlertTitle>Refusal Reason</AlertTitle>
                                            <AlertDescription>{report.refusalReason}</AlertDescription>
                                        </Alert>
                                     )}

                                </CardContent>
                                <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 p-4 border-t bg-secondary/30">
                                    {report.status === 'submitted' && (
                                        <>
                                             {/* Refuse Button */}
                                             <AlertDialog open={reportToRefuse?.id === report.id} onOpenChange={(isOpen) => { if (!isOpen) { setReportToRefuse(null); setRefusalReason(''); }}}>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setReportToRefuse(report)} // Set the report to refuse when clicking
                                                        disabled={isProcessing}
                                                        className="w-full sm:w-auto"
                                                     >
                                                         <XCircle className="w-4 h-4 mr-1" /> Refuse
                                                     </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Refuse Report from {shopper.name}?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                             Please provide a clear reason for refusing this report. This reason will be shared with the shopper.
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
                                                        <AlertDialogCancel onClick={() => { setReportToRefuse(null); setRefusalReason(''); }}>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                             onClick={handleRefuse}
                                                             disabled={isProcessing || !refusalReason.trim()}
                                                             className={buttonVariants({ variant: "destructive" })}
                                                        >
                                                             {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                             Confirm Refusal
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>

                                             {/* Approve Button */}
                                             <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleApprove(report.id)}
                                                disabled={isProcessing}
                                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                                                Approve & Pay ${mission.reward}
                                            </Button>
                                        </>
                                    )}
                                    {report.status === 'approved' && (
                                         <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" /> Approved
                                        </span>
                                    )}
                                     {report.status === 'refused' && (
                                         <span className="text-sm text-destructive font-medium flex items-center gap-1">
                                            <XCircle className="w-4 h-4" /> Refused
                                        </span>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                 </div>
            )}
        </div>
    );
}
