
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { mockMissions, mockReports, mockSurveyQuestions } from '@/lib/mock-data'; // Use mock data for now
import { mockUsers } from '../../users/users-mock.js'; // Corrected import path using relative path
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { approveReportAction, refuseReportAction } from '../../../../actions/admin-actions.js'; // Corrected import path
import {
    ArrowLeft, CheckCircle, XCircle, Loader2, FileWarning, User, Calendar, Star,
    MessageSquare, Image as ImageIcon, Mic, MapPin, ListOrdered, CheckSquare as CheckSquareIcon, TextCursorInput as TextCursorInputIcon // Renamed imported icon
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea for refusal reason
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar


// Helper to get the correct icon based on question type
const getIconForType = (type) => {
    switch(type) {
        case 'text': return <TextCursorInputIcon className="w-4 h-4 mr-1 text-muted-foreground" />;
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

    switch(answer.type || question.type) { // Check answer type first, fallback to question type
        case 'text':
            return <p className="whitespace-pre-wrap">{answer.value}</p>;
        case 'rating':
            const ratingValue = Number(answer.value); // Ensure value is a number
             const maxRating = question.maxRating || 5;
            return isNaN(ratingValue) ? <span className="text-muted-foreground italic">Invalid rating</span> : (
                <div className="flex items-center gap-1">
                    {Array.from({ length: maxRating }).map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < ratingValue ? 'text-accent fill-accent' : 'text-muted-foreground/30'}`}
                         />
                    ))}
                     <span className="text-sm font-medium ml-1">({ratingValue}/{maxRating})</span>
                </div>
            );
        case 'multiple_choice':
            return <span>{answer.value}</span>;
        case 'checkboxes':
            // Value is an object like { optionId: true/false }
            const selectedOptions = Object.entries(answer.value || {})
                .filter(([_, isSelected]) => isSelected)
                .map(([optionId]) => question.options?.find(opt => String(opt.id) === optionId)?.text) // Use optional chaining for safety
                .filter(Boolean); // Filter out undefined if an option is missing
            return selectedOptions.length > 0 ? (
                <ul className="list-disc list-inside">
                    {selectedOptions.map((text, i) => <li key={i}>{text}</li>)}
                </ul>
             ) : <span className="text-muted-foreground italic">No options selected</span>;
        case 'image_upload':
            // Ensure answer.value is treated as an array even if it's a single string URL
            const urls = Array.isArray(answer.value) ? answer.value : (answer.value ? [answer.value] : []);
            return urls.length > 0 ? (
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
            ) : <span className="text-muted-foreground italic">No images submitted</span>;
        case 'gps_capture':
            const coords = answer.value; // { lat: number, lng: number }
            if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
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
            if (audioUrl && typeof audioUrl === 'string') {
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

// Helper to get user details from mock data
const getUserById = (userId) => {
    return mockUsers.find(u => u.id === userId);
};

// Helper function for status badge variant
const getStatusVariant = (status) => {
    switch (status) {
      case 'available': return 'secondary';
      case 'assigned': return 'default';
      case 'submitted': return 'outline'; // More neutral for pending
      case 'approved': return 'default'; // Use default for completed/approved (often green via theme)
      case 'refused': return 'destructive'; // Use destructive for refused
      default: return 'secondary';
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
            // Filter reports and ensure they have the 'answers' property initialized if missing
            const foundReports = mockReports.filter(r => r.missionId === missionId).map(r => ({
                    ...r,
                    answers: r.answers || {} // Ensure answers object exists
                }));
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
            const result = await approveReportAction(reportId, missionId); // Call server action

            if (result.success) {
                toast({ title: "Report Approved", description: result.message });
                 // Update local state optimistically
                startTransition(() => {
                    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'approved' } : r));
                     // Update mock data directly for persistence during simulation
                     const reportIndex = mockReports.findIndex(r => r.id === reportId);
                     if (reportIndex !== -1) mockReports[reportIndex].status = 'approved';

                      // Check if all reports for this mission are now approved/refused
                      const updatedReportsForMission = mockReports.filter(r => r.missionId === missionId);
                      const allReportsProcessed = updatedReportsForMission.every(r => r.status === 'approved' || r.status === 'refused');
                      const anyReportApproved = updatedReportsForMission.some(r => r.status === 'approved');

                      // Update the corresponding mission status
                     const missionIndex = mockMissions.findIndex(m => m.id === missionId);
                      if (missionIndex !== -1) {
                           // Logic: If ANY report is approved, mark mission as approved.
                           // Adjust this if requirements are different (e.g., ALL must be approved)
                           if (anyReportApproved) {
                               mockMissions[missionIndex].status = 'approved';
                               setMission(prev => prev ? { ...prev, status: 'approved' } : null);
                           } else if (allReportsProcessed && !anyReportApproved) {
                                // If all are processed but none approved (i.e., all refused)
                                mockMissions[missionIndex].status = 'refused';
                                setMission(prev => prev ? { ...prev, status: 'refused' } : null);
                            }
                            // Otherwise, mission status remains 'submitted' or 'assigned'
                       }
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
            const result = await refuseReportAction(reportId, missionId, refusalReason); // Call server action

            if (result.success) {
                toast({ title: "Report Refused", description: result.message });
                 // Update local state optimistically
                 startTransition(() => {
                     setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'refused', refusalReason: refusalReason } : r));
                     // Update mock data directly
                      const reportIndex = mockReports.findIndex(r => r.id === reportId);
                      if (reportIndex !== -1) {
                        mockReports[reportIndex].status = 'refused';
                        mockReports[reportIndex].refusalReason = refusalReason;
                      }

                       // Check if all reports for this mission are now processed
                       const updatedReportsForMission = mockReports.filter(r => r.missionId === missionId);
                       const allReportsProcessed = updatedReportsForMission.every(r => r.status === 'approved' || r.status === 'refused');
                       const anyReportApproved = updatedReportsForMission.some(r => r.status === 'approved');

                       // Update mission status
                       const missionIndex = mockMissions.findIndex(m => m.id === missionId);
                       if (missionIndex !== -1) {
                           if (allReportsProcessed && !anyReportApproved) {
                                // If all processed and none approved, set mission to refused
                                mockMissions[missionIndex].status = 'refused';
                                setMission(prev => prev ? { ...prev, status: 'refused' } : null);
                           } else if (anyReportApproved) {
                               // If at least one is approved, mission status should be approved
                               mockMissions[missionIndex].status = 'approved';
                               setMission(prev => prev ? { ...prev, status: 'approved' } : null);
                           }
                            // Otherwise, remains 'submitted' or 'assigned'
                       }
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

    // Determine overall mission status based on its own status field first
    const missionStatusVariant = getStatusVariant(mission.status);
    const missionStatusBg = mission.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' : mission.status === 'refused' ? 'bg-red-100 text-red-800 border-red-300' : '';


    return (
        <div className="container mx-auto py-8 px-4">
            <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href="/admin/missions">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions List
                </Link>
            </Button>

            <Card className="mb-6 shadow-sm">
                 <CardHeader className="border-b pb-4">
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                         <div>
                            <CardTitle className="text-xl font-semibold text-primary">Review Reports: {mission.title}</CardTitle>
                             <CardDescription>Mission ID: {mission.id}</CardDescription>
                         </div>
                         {/* Display overall mission status */}
                         <Badge variant={missionStatusVariant} className={`capitalize text-sm px-3 py-1 w-fit ${missionStatusBg}`}>
                             Mission Status: {mission.status}
                         </Badge>
                     </div>
                 </CardHeader>
                {/* Optional: Add more mission details if needed */}
                 <CardContent className="pt-4 text-sm">
                     <p><strong className="font-medium text-muted-foreground">Business:</strong> {mission.businessName}</p>
                     <p><strong className="font-medium text-muted-foreground">Deadline:</strong> {format(new Date(mission.deadline), 'PPP')}</p>
                     <p><strong className="font-medium text-muted-foreground">Reward:</strong> ${mission.reward}</p>
                 </CardContent>
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
                         // Find user details using the helper function
                         const shopper = getUserById(report.userId);
                         const shopperName = shopper ? shopper.name : `User ${report.userId}`;
                         const shopperAvatarUrl = shopper?.profilePicUrl;
                         const shopperAvatarFallback = shopperName?.charAt(0)?.toUpperCase() || 'U';
                         const isProcessing = processingReportId === report.id;
                          // Determine report-specific status badge styles
                         const reportStatusVariant = report.status === 'approved' ? 'default' : report.status === 'refused' ? 'destructive' : report.status === 'submitted' ? 'outline' : 'secondary';
                         const reportStatusBg = report.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' : report.status === 'refused' ? 'bg-red-100 text-red-800 border-red-300' : report.status === 'submitted' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : '';


                         return (
                            <Card key={report.id} className={`shadow-md transition-opacity ${isProcessing ? 'opacity-70' : ''} overflow-hidden`}>
                                <CardHeader className="bg-secondary/30 border-b p-4">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                                         <div className="flex items-center gap-3">
                                             <Avatar className="h-10 w-10 border">
                                                <AvatarImage src={shopperAvatarUrl} alt={shopperName} />
                                                <AvatarFallback>{shopperAvatarFallback}</AvatarFallback>
                                             </Avatar>
                                             <div>
                                                <CardTitle className="text-lg font-medium flex items-center gap-2">
                                                     Report from {shopperName}
                                                </CardTitle>
                                                 <CardDescription className="text-xs mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                     <span>User ID: {report.userId}</span>
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Submitted: {format(new Date(report.submittedAt), 'PPp')}</span>
                                                 </CardDescription>
                                             </div>
                                        </div>
                                         <Badge variant={reportStatusVariant} className={`capitalize text-sm px-3 py-1.5 w-fit mt-2 sm:mt-0 ${reportStatusBg}`}> {/* Increased padding */}
                                            {report.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                     <h3 className="text-base font-semibold mb-3 text-foreground">Survey Answers:</h3>
                                     {surveyQuestions.length > 0 ? (
                                         surveyQuestions.map((q, index) => {
                                            // Find the corresponding answer in the report data
                                             // Construct fieldName based on convention used in ReportSubmissionForm
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
                                                        <AlertDialogTitle>Refuse Report from {shopperName}?</AlertDialogTitle>
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
                                            <CheckCircle className="w-4 h-4" /> Approved & Paid ${mission.reward}
                                        </span>
                                    )}
                                     {report.status === 'refused' && (
                                         <span className="text-sm text-destructive font-medium flex items-center gap-1">
                                            <XCircle className="w-4 h-4" /> Report Refused
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
