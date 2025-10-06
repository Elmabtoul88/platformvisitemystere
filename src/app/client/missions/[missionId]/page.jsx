
'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { mockMissions, mockReports, mockUsers, mockSurveyQuestions } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, FileWarning, BarChartHorizontal, CheckCircle, Users, FileDown, FileText, Star } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const getShopperName = (userId) => mockUsers.find(u => u.id === userId)?.name || 'Unknown Shopper';

// Helper to find the survey question text
const getQuestionText = (missionId, answerKey) => {
    const questions = mockSurveyQuestions[missionId] || [];
    const questionId = answerKey.split('_')[1];
    const question = questions.find(q => String(q.id) === questionId);
    return question ? question.text : 'Unknown Question';
};

// Helper to format answers for display
const formatAnswerValue = (answer) => {
    if (!answer || answer.value === null || answer.value === undefined) return 'N/A';
    switch (answer.type) {
        case 'text':
            return answer.value;
        case 'rating':
            return `${answer.value} / 5 stars`;
        case 'multiple_choice':
            return answer.value;
        case 'checkboxes':
            return Object.entries(answer.value || {})
                .filter(([, isSelected]) => isSelected)
                .map(([optionId]) => optionId.replace('opt_', ''))
                .join(', ');
        case 'image_upload':
            return Array.isArray(answer.value) ? `${answer.value.length} image(s)` : '1 image';
        case 'gps_capture':
            return `Lat: ${answer.value.lat.toFixed(4)}, Lng: ${answer.value.lng.toFixed(4)}`;
        case 'audio_recording':
            return 'Audio submitted';
        default:
            return String(answer.value);
    }
};

export default function ClientMissionDetailPage() {
    const { user, isLoading: authLoading } = useAuth();
    const params = useParams();
    const router = useRouter();
    const missionId = params.missionId;
    const [isExporting, setIsExporting] = useState(false);

    const { mission, submittedReports, approvedReports, approvalRate } = useMemo(() => {
        const foundMission = mockMissions.find(m => m.id === missionId);
        if (!foundMission) return { mission: null };

        const allReportsForMission = mockReports.filter(r => r.missionId === missionId);
        const submitted = allReportsForMission.filter(r => r.status === 'submitted');
        const approved = allReportsForMission.filter(r => r.status === 'approved');
        
        const rate = allReportsForMission.length > 0
            ? (approved.length / allReportsForMission.length) * 100
            : 0;

        return {
            mission: foundMission,
            submittedReports: submitted,
            approvedReports: approved,
            approvalRate: rate,
        };
    }, [missionId]);

    // Data for export table
    const exportData = useMemo(() => {
        if (!approvedReports) return [];
        return approvedReports.map(report => {
            const answers = Object.entries(report.answers).map(([key, answer]) => ({
                question: getQuestionText(missionId, key),
                answer: formatAnswerValue(answer),
            }));
            return {
                reportId: report.id,
                shopper: getShopperName(report.userId),
                submittedAt: format(new Date(report.submittedAt), 'PPp'),
                ...answers.reduce((acc, curr, index) => ({...acc, [`Q${index+1}`]: curr.question, [`A${index+1}`]: curr.answer }), {})
            };
        });
    }, [approvedReports, missionId]);

    const handleExport = (format) => {
        setIsExporting(true);
        try {
            if (format === 'csv') {
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Approved Reports");
                XLSX.writeFile(workbook, `${mission.title}_approved_reports.xlsx`);
            } else if (format === 'pdf') {
                const doc = new jsPDF();
                doc.text(`Approved Reports for: ${mission.title}`, 14, 15);
                const tableColumn = Object.keys(exportData[0] || {});
                const tableRows = exportData.map(data => Object.values(data));
                doc.autoTable({
                    head: [tableColumn],
                    body: tableRows,
                    startY: 20,
                    theme: 'striped',
                    styles: { fontSize: 8 },
                });
                doc.save(`${mission.title}_approved_reports.pdf`);
            }
        } catch (e) {
            console.error("Export failed:", e);
        } finally {
            setIsExporting(false);
        }
    };


    if (authLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }
    
    if (!mission || mission.clientId !== user?.id) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col items-center">
                 <Alert variant="destructive" className="max-w-lg w-full">
                     <FileWarning className="h-4 w-4" />
                    <AlertTitle>Access Denied or Mission Not Found</AlertTitle>
                    <AlertDescription>You do not have permission to view this mission, or it does not exist.</AlertDescription>
                </Alert>
                 <Button asChild variant="link" className="mt-6">
                    <Link href="/client"><ArrowLeft className="w-4 h-4 mr-1" /> Back to My Missions</Link>
                </Button>
             </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Button asChild variant="outline" size="sm" className="mb-6">
                <Link href="/client">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Missions
                </Link>
            </Button>

            {/* Mission Header */}
            <Card className="mb-6 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-primary">{mission.title}</CardTitle>
                    <CardDescription>{mission.businessName}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{mission.description}</p>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Submitted Reports</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{submittedReports.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved Reports</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{approvedReports.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                        <BarChartHorizontal className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{approvalRate.toFixed(0)}%</div>
                        <Progress value={approvalRate} className="w-full h-2 mt-1" />
                    </CardContent>
                </Card>
            </div>

            {/* Approved Reports Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Approved Reports</CardTitle>
                        <CardDescription>Detailed view of all approved shopper submissions.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleExport('csv')} disabled={isExporting || exportData.length === 0}>
                            <FileDown className="w-4 h-4 mr-2"/> Export CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} disabled={isExporting || exportData.length === 0}>
                            <FileText className="w-4 h-4 mr-2"/> Export PDF
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shopper</TableHead>
                                <TableHead>Submitted At</TableHead>
                                <TableHead>Key Answer</TableHead>
                                <TableHead className="text-right">Rating</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {approvedReports.length > 0 ? approvedReports.map(report => {
                                const ratingAnswer = Object.values(report.answers).find(a => a.type === 'rating');
                                const textAnswer = Object.values(report.answers).find(a => a.type === 'text');
                                return (
                                    <TableRow key={report.id}>
                                        <TableCell>{getShopperName(report.userId)}</TableCell>
                                        <TableCell>{format(new Date(report.submittedAt), 'PP')}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            <span className="text-muted-foreground text-xs">{getQuestionText(missionId, Object.keys(report.answers).find(k => k.includes('_text')) || '')}:</span>
                                            <p>{textAnswer?.value || 'N/A'}</p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {ratingAnswer ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    <Star className="w-4 h-4 text-accent fill-accent" />
                                                    {ratingAnswer.value}
                                                </div>
                                            ) : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                )
                           }) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No approved reports yet.</TableCell>
                                </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
