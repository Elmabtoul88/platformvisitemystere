
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle, XCircle, UserCheck, MapPin, Building, Calendar } from 'lucide-react';
import { mockApplications, mockMissions, mockStores } from '@/lib/mock-data';
import { mockUsers } from '@/app/admin/users/users-mock.js';
import { approveApplicationAction, refuseApplicationAction } from '../../actions/admin-actions.js';
import { format } from 'date-fns';
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
                plannedDate: finalDate.toISOString()
            });
            if (result.success) {
                toast({ title: "Candidature validée", description: "Le shopper a été notifié." });
                setApplications(prev => prev.filter(a => a.id !== appToApprove.id));
                setAppToApprove(null);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erreur", description: error.message });
        } finally {
            setIsProcessing(null);
        }
    };

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

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
                                <TableHead>Store Choisi</TableHead>
                                <TableHead>Réponses Quiz</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.map(app => {
                                const mission = mockMissions.find(m => m.id === app.mission_id);
                                const user = mockUsers.find(u => u.id === app.user_id);
                                const store = mockStores.find(s => s.id === app.selectedStoreId);
                                
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
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Building className="w-3 h-3"/> {store?.name || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs space-y-1">
                                                {Object.entries(app.quizAnswers || {}).map(([qid, ans]) => (
                                                    <div key={qid}>Q: {ans}</div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => refuseApplicationAction(app.id, 'Profil non retenu')}>Refuser</Button>
                                            <Button size="sm" className="bg-green-600" onClick={() => {
                                                setAppToApprove(app);
                                                setSelectedStoreId(app.selectedStoreId);
                                            }}>Approuver</Button>
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
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Valider la mission</AlertDialogTitle>
                        <AlertDialogDescription>Définissez le magasin et l'heure de passage pour ce shopper.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Magasin attribué</Label>
                            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                                <SelectTrigger><SelectValue placeholder="Choisir un magasin" /></SelectTrigger>
                                <SelectContent>
                                    {mockStores.filter(s => s.mission_id === appToApprove?.mission_id).map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.city})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove} className="bg-green-600" disabled={!plannedDate || !selectedStoreId}>
                            {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : "Valider & Planifier"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
