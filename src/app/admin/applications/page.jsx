
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Loader2, UserCheck, Building, Clock, AlertCircle, ClipboardCheck, Info } from 'lucide-react';
import { mockApplications, mockMissions, mockStores } from '@/lib/mock-data';
import { mockUsers } from '@/app/admin/users/users-mock.js';
import { approveApplicationAction, refuseApplicationAction } from '../../actions/admin-actions.js';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function AdminApplicationsPage() {
    const { toast } = useToast();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(null);
    
    // Approval Dialog State
    const [appToApprove, setAppToApprove] = useState(null);
    const [plannedDate, setPlannedDate] = useState('');
    const [plannedTime, setPlannedTime] = useState('14:00');
    const [selectedStoreIds, setSelectedStoreIds] = useState([]);
    const [timeWindow, setTimeWindow] = useState('60'); 

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setApplications(mockApplications.filter(app => app.status === 'pending'));
            setIsLoading(false);
        }, 300);
    }, []);

    const toggleStore = (id) => {
        setSelectedStoreIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleApprove = async () => {
        if (!appToApprove || !plannedDate || selectedStoreIds.length === 0) return;

        setIsProcessing(appToApprove.id);
        const [hours, minutes] = plannedTime.split(':');
        const finalDate = new Date(plannedDate);
        finalDate.setHours(parseInt(hours), parseInt(minutes));

        try {
            // Updated action to handle multiple store validation
            const result = await approveApplicationAction(appToApprove.id, {
                storeIds: selectedStoreIds,
                plannedDate: finalDate.toISOString(),
                timeWindowMinutes: parseInt(timeWindow)
            });

            if (result.success) {
                toast({ title: "Candidature validée", description: selectedStoreIds.length + " magasin(s) assigné(s) avec succès." });
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
                                                {Object.entries(app.quizAnswers || {}).map(([qid, ans]) => {
                                                    const qText = mission?.profileQuiz?.find(pq => String(pq.id) === String(qid))?.text || qid;
                                                    return (
                                                        <div key={qid} className="line-clamp-1">
                                                            <span className="text-muted-foreground font-bold">{qText}:</span> {Array.isArray(ans) ? ans.join(', ') : ans}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => refuseApplicationAction(app.id, 'Profil non retenu')}>Refuser</Button>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => {
                                                setAppToApprove(app);
                                                setSelectedStoreIds(app.selectedStoreIds || [app.selectedStoreId] || []);
                                                setPlannedDate(new Date().toISOString().split('T')[0]);
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
                <AlertDialogContent className="max-w-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-primary" /> Validation & Planification
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Sélectionnez les points de vente autorisés et planifiez la mission.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-6 py-2 overflow-y-auto max-h-[70vh] pr-2">
                        {/* 1. Quiz Review */}
                        <div className="space-y-3 bg-secondary/20 p-4 rounded-xl border border-border/50">
                            <h4 className="font-bold text-sm flex items-center gap-2 text-primary">
                                <Info className="w-4 h-4"/> Réponses au Quiz de Profil
                            </h4>
                            <div className="space-y-2">
                                {Object.entries(appToApprove?.quizAnswers || {}).map(([qid, ans]) => {
                                    const mission = mockMissions.find(m => String(m.id) === String(appToApprove?.mission_id));
                                    const qText = mission?.profileQuiz?.find(pq => String(pq.id) === String(qid))?.text || qid;
                                    return (
                                        <div key={qid} className="text-sm bg-background/50 p-2 rounded-lg border">
                                            <p className="font-bold text-xs text-muted-foreground mb-1">{qText}</p>
                                            <p className="font-medium">{Array.isArray(ans) ? ans.join(', ') : ans}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Store Selection */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 font-bold text-sm">
                                <Building className="w-4 h-4 text-primary"/> Sélection des Magasins (Cochez pour valider)
                            </Label>
                            <div className="grid grid-cols-1 gap-2">
                                {mockStores
                                    .filter(s => String(s.mission_id) === String(appToApprove?.mission_id))
                                    .map(s => {
                                        const isRequested = (appToApprove?.selectedStoreIds || [appToApprove?.selectedStoreId]).includes(s.id);
                                        return (
                                            <div 
                                                key={s.id} 
                                                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${selectedStoreIds.includes(s.id) ? 'bg-primary/5 border-primary' : 'bg-background hover:bg-secondary/50'}`}
                                                onClick={() => toggleStore(s.id)}
                                            >
                                                <Checkbox checked={selectedStoreIds.includes(s.id)} onCheckedChange={() => toggleStore(s.id)} />
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm">{s.name}</span>
                                                        {isRequested && <Badge variant="secondary" className="text-[9px] h-4 bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Demandé</Badge>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{s.address}, {s.city}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">Note: Le shopper a postulé pour {appToApprove?.selectedStoreIds?.length || 1} magasin(s).</p>
                        </div>

                        <Separator />

                        {/* 3. Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Date de la visite</Label>
                                <Input type="date" value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} className="h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Heure prévue</Label>
                                <Input type="time" value={plannedTime} onChange={(e) => setPlannedTime(e.target.value)} className="h-10" />
                            </div>
                        </div>

                        {/* 4. Validity Window */}
                        <div className="space-y-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                            <Label className="flex items-center gap-2 text-sm font-bold text-orange-800">
                                <Clock className="w-4 h-4"/> Créneau de validité (Questionnaire final)
                            </Label>
                            <Select value={timeWindow} onValueChange={setTimeWindow}>
                                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">± 30 minutes</SelectItem>
                                    <SelectItem value="60">± 1 heure (Standard)</SelectItem>
                                    <SelectItem value="120">± 2 heures</SelectItem>
                                    <SelectItem value="1440">Toute la journée</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-orange-700 flex items-start gap-1">
                                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5"/> 
                                Le shopper aura accès au questionnaire uniquement pendant ce délai autour de l'heure fixée. Au-delà, la mission s'annulera.
                            </p>
                        </div>
                    </div>

                    <AlertDialogFooter className="border-t pt-4">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleApprove} 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold" 
                            disabled={!plannedDate || selectedStoreIds.length === 0}
                        >
                            {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : `Approuver (${selectedStoreIds.length})`}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

