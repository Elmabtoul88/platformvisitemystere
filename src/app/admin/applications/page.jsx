
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Loader2, UserCheck, Building, Clock, AlertCircle } from 'lucide-react';
import { mockApplications, mockMissions, mockStores } from '@/lib/mock-data';
import { mockUsers } from '@/app/admin/users/users-mock.js';
import { approveApplicationAction, refuseApplicationAction } from '../../actions/admin-actions.js';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminApplicationsPage() {
    const { toast } = useToast();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(null);
    
    // Approval Dialog State
    const [appToApprove, setAppToApprove] = useState(null);
    const [plannedDate, setPlannedDate] = useState('');
    const [plannedTime, setPlannedTime] = useState('14:00');
    const [selectedStoreId, setSelectedStoreId] = useState('');
    const [timeWindow, setTimeWindow] = useState('60'); // Minutes before/after

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setApplications(mockApplications.filter(app => app.status === 'pending'));
            setIsLoading(false);
        }, 300);
    }, []);

    const handleApprove = async () => {
        if (!appToApprove || !plannedDate || !selectedStoreId) return;

        setIsProcessing(appToApprove.id);
        const [hours, minutes] = plannedTime.split(':');
        const finalDate = new Date(plannedDate);
        finalDate.setHours(parseInt(hours), parseInt(minutes));

        try {
            const result = await approveApplicationAction(appToApprove.id, {
                storeId: selectedStoreId,
                plannedDate: finalDate.toISOString(),
                timeWindowMinutes: parseInt(timeWindow)
            });
            if (result.success) {
                toast({ title: "Candidature validée", description: "Mission assignée avec un créneau de ±" + timeWindow + " min." });
                setApplications(prev => prev.filter(a => String(a.id) !== String(appToApprove.id)));
                setAppToApprove(null);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erreur", description: error.message });
        } finally {
            setIsProcessing(null);
        }
    };

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                <UserCheck className="w-6 h-6" /> Candidatures en attente
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des postulants</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shopper</TableHead>
                                <TableHead>Mission</TableHead>
                                <TableHead>Magasins demandés</TableHead>
                                <TableHead>Réponses Quiz</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.map(app => {
                                const mission = mockMissions.find(m => String(m.id) === String(app.mission_id));
                                const user = mockUsers.find(u => String(u.id) === String(app.user_id));
                                const requestedStores = mockStores.filter(s => (app.selectedStoreIds || [app.selectedStoreId]).includes(s.id));
                                
                                return (
                                    <TableRow key={app.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8"><AvatarImage src={user?.profilePicUrl} /><AvatarFallback>U</AvatarFallback></Avatar>
                                                <div><div className="font-medium">{user?.name}</div><div className="text-xs text-muted-foreground">{user?.email}</div></div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-primary">{mission?.title}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {requestedStores.map(s => (
                                                    <Badge key={s.id} variant="outline" className="text-[10px]">
                                                        <Building className="w-2 h-2 mr-1"/> {s.name} ({s.city})
                                                    </Badge>
                                                ))}
                                                {requestedStores.length === 0 && <span className="text-xs italic">N/A</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs space-y-1">
                                                {Object.entries(app.quizAnswers || {}).map(([qid, ans]) => (
                                                    <div key={qid} className="line-clamp-1"><span className="text-muted-foreground">Q:</span> {Array.isArray(ans) ? ans.join(', ') : ans}</div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => refuseApplicationAction(app.id, 'Profil non retenu')}>Refuser</Button>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => {
                                                setAppToApprove(app);
                                                setSelectedStoreId(app.selectedStoreIds?.[0] || app.selectedStoreId || '');
                                            }}>Valider</Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Approval Modal */}
            <AlertDialog open={!!appToApprove} onOpenChange={() => setAppToApprove(null)}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Validation & Planification</AlertDialogTitle>
                        <AlertDialogDescription>Attribuez un magasin final et définissez le créneau horaire.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Building className="w-4 h-4"/> Magasin approuvé</Label>
                            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                                <SelectTrigger><SelectValue placeholder="Choisir un magasin" /></SelectTrigger>
                                <SelectContent>
                                    {mockStores.filter(s => String(s.mission_id) === String(appToApprove?.mission_id)).map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.city})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground">Note: Le shopper a demandé {appToApprove?.selectedStoreIds?.length || 1} magasin(s).</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date prévue</Label>
                                <Input type="date" value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Heure prévue</Label>
                                <Input type="time" value={plannedTime} onChange={(e) => setPlannedTime(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Clock className="w-4 h-4"/> Créneau de validité (minutes)</Label>
                            <Select value={timeWindow} onValueChange={setTimeWindow}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">± 30 minutes</SelectItem>
                                    <SelectItem value="60">± 1 heure (Standard)</SelectItem>
                                    <SelectItem value="120">± 2 heures</SelectItem>
                                    <SelectItem value="1440">Toute la journée</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-orange-600 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> La mission s'annulera automatiquement après ce délai.</p>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700" disabled={!plannedDate || !selectedStoreId}>
                            {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : "Approuver & Assigner"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
