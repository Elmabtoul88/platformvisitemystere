'use client';

import React, { useState, useMemo, useTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
    MoreHorizontal, Search, Download, CreditCard, Banknote, 
    CheckCircle, XCircle, Clock, Info, FileSpreadsheet, Loader2 
} from 'lucide-react';
import { mockReports, mockMissions, mockStores } from '@/lib/mock-data';
import { mockUsers } from '@/app/admin/users/users-mock.js';
import { updatePaymentAction } from '@/app/actions/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

export default function AdminPaymentsPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isProcessing, setIsProcessing] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [transactionRef, setTransactionRef] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [paymentAction, setPaymentAction] = useState(null); // 'paid', 'refused', or 'view_info'

    const payments = useMemo(() => {
        return mockReports.filter(r => r.status === 'approved' || r.paymentStatus).map(report => {
            const user = mockUsers.find(u => String(u.id) === String(report.userId));
            const mission = mockMissions.find(m => String(m.id) === String(report.missionId));
            return { ...report, user, mission };
        });
    }, []);

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const matchesSearch = p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                p.mission?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                p.transactionRef?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || p.paymentStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [payments, searchTerm, statusFilter]);

    const handleUpdatePayment = async () => {
        if (!selectedReport || paymentAction === 'view_info') return;

        setIsProcessing(selectedReport.id);
        try {
            const result = await updatePaymentAction(selectedReport.id, paymentAction, {
                transactionRef,
                adminNotes
            });

            if (result.success) {
                toast({ title: "Mise à jour réussie", description: result.message });
                // Update local state for immediate feedback
                const idx = mockReports.findIndex(r => String(r.id) === String(selectedReport.id));
                if (idx !== -1) {
                    mockReports[idx].paymentStatus = paymentAction;
                    if (paymentAction === 'paid') {
                        mockReports[idx].paymentDate = new Date().toISOString();
                        mockReports[idx].transactionRef = transactionRef;
                    }
                    mockReports[idx].adminNotes = adminNotes;
                }
                setSelectedReport(null);
                setTransactionRef('');
                setAdminNotes('');
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erreur", description: error.message });
        } finally {
            setIsProcessing(null);
        }
    };

    const exportToExcel = () => {
        const data = filteredPayments.map(p => ({
            'Shopper': p.user?.name,
            'Email': p.user?.email,
            'Mission': p.mission?.title,
            'Montant': `${p.reward} ${p.user?.bankingInfo?.currency || '$'}`,
            'Statut': p.paymentStatus,
            'Date Réalisation': format(new Date(p.submittedAt), 'dd/MM/yyyy'),
            'Réf Transaction': p.transactionRef || 'N/A',
            'RIB/IBAN': p.user?.bankingInfo?.rib || 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Paiements");
        XLSX.writeFile(wb, "gestion_paiements_missionview.xlsx");
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid': return <Badge className="bg-green-100 text-green-800 border-green-200">Payée</Badge>;
            case 'refused': return <Badge variant="destructive">Refusée</Badge>;
            case 'pending': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 animate-pulse">En attente</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <CreditCard className="w-7 h-7" /> Gestion des Paiements
                </h1>
                <Button onClick={exportToExcel} variant="outline" size="sm" className="w-full sm:w-auto">
                    <Download className="w-4 h-4 mr-2" /> Exporter en Excel
                </Button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-orange-50 border-orange-100">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-orange-800">En attente</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-900">
                            {filteredPayments.filter(p => p.paymentStatus === 'pending').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-800">Total Payé</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">
                            {filteredPayments.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + (p.reward || 0), 0).toFixed(2)} $
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-secondary/30">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Missions Terminées</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredPayments.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher shopper, mission..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'pending', 'paid', 'refused'].map(s => (
                                <Button 
                                    key={s} 
                                    variant={statusFilter === s ? 'default' : 'ghost'} 
                                    size="sm" 
                                    onClick={() => setStatusFilter(s)}
                                    className="capitalize"
                                >
                                    {s === 'all' ? 'Tous' : s === 'pending' ? 'Attente' : s === 'paid' ? 'Payés' : 'Refusés'}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shopper</TableHead>
                                <TableHead>Mission</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Date Visite</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.length > 0 ? filteredPayments.map(payment => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <div className="font-medium">{payment.user?.name}</div>
                                        <div className="text-xs text-muted-foreground">{payment.user?.email}</div>
                                    </TableCell>
                                    <TableCell className="text-sm">{payment.mission?.title}</TableCell>
                                    <TableCell className="font-bold">{payment.reward} $</TableCell>
                                    <TableCell className="text-xs">{format(new Date(payment.submittedAt), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{getStatusBadge(payment.paymentStatus)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4"/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Traitement</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => { setSelectedReport(payment); setPaymentAction('paid'); }}>
                                                    <Banknote className="mr-2 h-4 w-4 text-green-600"/> Marquer comme payée
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSelectedReport(payment); setPaymentAction('refused'); }}>
                                                    <XCircle className="mr-2 h-4 w-4 text-destructive"/> Refuser le paiement
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => { setSelectedReport(payment); setPaymentAction('view_info'); }}>
                                                    <Info className="mr-2 h-4 w-4 text-primary"/> Consulter RIB
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Aucun paiement trouvé.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Payment Processing & Info Dialog */}
            <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className={
                            paymentAction === 'paid' ? 'text-green-700' : 
                            paymentAction === 'refused' ? 'text-destructive' : 'text-primary'
                        }>
                            {paymentAction === 'paid' && 'Confirmer le virement'}
                            {paymentAction === 'refused' && 'Refuser le paiement'}
                            {paymentAction === 'view_info' && 'Coordonnées Bancaires'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedReport?.user?.name} - {selectedReport?.reward} $ pour {selectedReport?.mission?.title}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Always show bank info in any payment interaction for better visibility */}
                        {selectedReport?.user?.bankingInfo ? (
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
                                <p className="text-[10px] font-bold uppercase text-primary tracking-widest mb-2 flex items-center gap-2">
                                    <Info className="w-3 h-3"/> Détails Bancaires du Shopper
                                </p>
                                <div className="grid grid-cols-1 gap-1 text-sm">
                                    <div className="flex justify-between border-b pb-1 border-primary/5">
                                        <span className="text-muted-foreground text-xs">Titulaire</span>
                                        <span className="font-semibold">{selectedReport.user.bankingInfo.accountHolder}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1 border-primary/5">
                                        <span className="text-muted-foreground text-xs">Banque</span>
                                        <span className="font-semibold">{selectedReport.user.bankingInfo.bankName}</span>
                                    </div>
                                    <div className="pt-1">
                                        <span className="text-muted-foreground text-xs block mb-1">RIB / IBAN</span>
                                        <span className="font-mono bg-background px-2 py-1 rounded block text-xs border select-all">
                                            {selectedReport.user.bankingInfo.rib}
                                        </span>
                                    </div>
                                    {selectedReport.user.bankingInfo.swift && (
                                        <div className="flex justify-between pt-1">
                                            <span className="text-muted-foreground text-xs">SWIFT</span>
                                            <span className="font-mono text-xs">{selectedReport.user.bankingInfo.swift}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/10 text-center">
                                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                                <p className="text-sm font-bold text-destructive">Coordonnées manquantes</p>
                                <p className="text-xs text-muted-foreground">Le shopper n'a pas encore renseigné ses informations de paiement.</p>
                            </div>
                        )}

                        {paymentAction === 'paid' && (
                            <div className="space-y-2">
                                <Label>Référence du virement / Transaction ID</Label>
                                <Input placeholder="Ex: VIR-2026-001" value={transactionRef} onChange={e => setTransactionRef(e.target.value)} />
                            </div>
                        )}

                        {(paymentAction === 'paid' || paymentAction === 'refused') && (
                            <div className="space-y-2">
                                <Label>Notes administratives (Interne)</Label>
                                <Textarea placeholder="Précisions sur le traitement..." value={adminNotes} onChange={e => setAdminNotes(e.target.value)} />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedReport(null)}>
                            {paymentAction === 'view_info' ? 'Fermer' : 'Annuler'}
                        </Button>
                        {paymentAction !== 'view_info' && (
                            <Button 
                                className={paymentAction === 'paid' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive'}
                                onClick={handleUpdatePayment}
                                disabled={isProcessing === selectedReport?.id || (paymentAction === 'paid' && !transactionRef) || !selectedReport?.user?.bankingInfo}
                            >
                                {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : null}
                                Confirmer
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
