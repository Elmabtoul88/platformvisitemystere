'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
    MoreHorizontal, Search, Download, CreditCard, Banknote, 
    XCircle, Info, FileSpreadsheet, Loader2,
    AlertCircle, CalendarDays, BarChart3, PieChart as PieIcon,
    History, TrendingUp, FilterX
} from 'lucide-react';
import { mockReports, mockMissions } from '@/lib/mock-data';
import { mockUsers } from '@/app/admin/users/users-mock.js';
import { updatePaymentAction } from '@/app/actions/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import * as XLSX from 'xlsx';
import { 
    Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    Legend, ResponsiveContainer, PieChart as RePieChart, BarChart as ReBarChart 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

export default function AdminPaymentsPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [isProcessing, setIsProcessing] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [transactionRef, setTransactionRef] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [paymentAction, setPaymentAction] = useState(null);

    // Initial Data Fetch/Prep
    const payments = useMemo(() => {
        return mockReports.filter(r => r.status === 'approved' || r.paymentStatus).map(report => {
            const user = mockUsers.find(u => String(u.id) === String(report.userId));
            const mission = mockMissions.find(m => String(m.id) === String(report.missionId));
            return { ...report, user, mission };
        });
    }, []);

    // Robust Filtering Logic
    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const matchesSearch = !searchTerm || 
                p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.mission?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.transactionRef?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || p.paymentStatus === statusFilter;
            
            let matchesDate = true;
            if (startDate || endDate) {
                const reportDate = new Date(p.submittedAt);
                if (startDate && reportDate < startOfDay(new Date(startDate))) matchesDate = false;
                if (endDate && reportDate > endOfDay(new Date(endDate))) matchesDate = false;
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [payments, searchTerm, statusFilter, startDate, endDate]);

    // Statistics Calculation for Charts
    const statsData = useMemo(() => {
        const statusMap = filteredPayments.reduce((acc, p) => {
            const status = p.paymentStatus || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const pieData = Object.entries(statusMap).map(([name, value]) => ({ 
            name: name === 'paid' ? 'Payés' : name === 'refused' ? 'Refusés' : 'En attente', 
            value 
        }));

        const amountMap = filteredPayments.reduce((acc, p) => {
            const date = format(new Date(p.submittedAt), 'MMM yyyy');
            if (p.paymentStatus === 'paid') {
                acc[date] = (acc[date] || 0) + (p.reward || 0);
            }
            return acc;
        }, {});

        const barData = Object.entries(amountMap).map(([name, total]) => ({ name, total }));

        return { pieData, barData };
    }, [filteredPayments]);

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
        XLSX.writeFile(wb, `virements_missionview_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setStartDate('');
        setEndDate('');
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
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <CreditCard className="w-7 h-7" /> Gestion des Paiements
                </h1>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={exportToExcel} variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <Download className="w-4 h-4 mr-2" /> Exporter Excel
                    </Button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-orange-50 border-orange-100">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold text-orange-700">En attente</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-black text-orange-900">{filteredPayments.filter(p => p.paymentStatus === 'pending').length}</div></CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold text-green-700">Total Payé</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-black text-green-900">{filteredPayments.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + (p.reward || 0), 0).toFixed(2)} $</div></CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold text-blue-700">Missions</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-black text-blue-900">{filteredPayments.length}</div></CardContent>
                </Card>
                <Card className="bg-secondary/30">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold text-muted-foreground">Volume Total</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-black">{filteredPayments.reduce((sum, p) => sum + (p.reward || 0), 0).toFixed(2)} $</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="list" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="list" className="flex items-center gap-2"><History className="w-4 h-4"/> Liste & Filtres</TabsTrigger>
                    <TabsTrigger value="stats" className="flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Statistiques</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-6">
                    {/* Advanced Filters */}
                    <Card className="p-4 border-dashed bg-secondary/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                    <Search className="w-3 h-3"/> Recherche
                                </Label>
                                <Input 
                                    placeholder="Shopper, mission, réf..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                    <CalendarDays className="w-3 h-3"/> Du
                                </Label>
                                <Input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={e => setStartDate(e.target.value)} 
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                    <CalendarDays className="w-3 h-3"/> Au
                                </Label>
                                <Input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={e => setEndDate(e.target.value)} 
                                    className="h-9"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="h-9 flex-1" onClick={clearFilters}>
                                    <FilterX className="w-4 h-4 mr-2" /> RAZ
                                </Button>
                                <div className="flex bg-muted rounded-md p-1">
                                    {['all', 'pending', 'paid'].map(s => (
                                        <Button 
                                            key={s} 
                                            variant={statusFilter === s ? 'secondary' : 'ghost'} 
                                            size="sm" 
                                            onClick={() => setStatusFilter(s)}
                                            className="h-7 text-[10px] px-2 capitalize"
                                        >
                                            {s === 'all' ? 'Tous' : s === 'pending' ? 'Attente' : 'Payés'}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <CardContent className="p-0">
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
                                                <div className="font-bold text-sm">{payment.user?.name}</div>
                                                <div className="text-[10px] text-muted-foreground">{payment.user?.email}</div>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium max-w-[200px] truncate">{payment.mission?.title}</TableCell>
                                            <TableCell className="font-black text-primary">{payment.reward} $</TableCell>
                                            <TableCell className="text-[10px] font-medium">{format(new Date(payment.submittedAt), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>{getStatusBadge(payment.paymentStatus)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4"/></Button>
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
                                        <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">Aucun virement correspondant à ces critères.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="stats" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Status Distribution */}
                        <Card>
                            <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><PieIcon className="w-4 h-4 text-primary"/> Répartition des statuts</CardTitle></CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie 
                                            data={statsData.pieData} 
                                            innerRadius={60} 
                                            outerRadius={80} 
                                            paddingAngle={5} 
                                            dataKey="value"
                                        >
                                            {statsData.pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Monthly Paid Volume */}
                        <Card>
                            <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary"/> Volume des paiements effectués ($)</CardTitle></CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ReBarChart data={statsData.barData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                        <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </ReBarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Payment Processing & Info Dialog */}
            <Dialog open={!!selectedReport} onOpenChange={() => { if(!isProcessing) setSelectedReport(null); }}>
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
                        <DialogDescription className="font-medium">
                            {selectedReport?.user?.name} — {selectedReport?.reward} $
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {selectedReport?.user?.bankingInfo ? (
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
                                <p className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                                    <Info className="w-3 h-3"/> Détails du compte
                                </p>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                    <div className="flex justify-between border-b border-primary/5 pb-1">
                                        <span className="text-muted-foreground text-xs">Titulaire</span>
                                        <span className="font-bold">{selectedReport.user.bankingInfo.accountHolder}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-primary/5 pb-1">
                                        <span className="text-muted-foreground text-xs">Banque</span>
                                        <span className="font-bold">{selectedReport.user.bankingInfo.bankName}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground text-xs">RIB / IBAN</span>
                                        <span className="font-mono bg-white px-2 py-1 rounded block text-xs border border-primary/10 select-all shadow-sm">
                                            {selectedReport.user.bankingInfo.rib}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-destructive/5 rounded-xl border border-destructive/10 text-center space-y-2">
                                <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
                                <p className="text-sm font-bold text-destructive">Coordonnées manquantes</p>
                                <p className="text-[10px] text-muted-foreground">Le shopper doit renseigner son RIB dans ses paramètres.</p>
                            </div>
                        )}

                        {paymentAction === 'paid' && (
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Référence du virement / Transaction ID</Label>
                                <Input placeholder="Ex: VIR-2026-001" value={transactionRef} onChange={e => setTransactionRef(e.target.value)} />
                            </div>
                        )}

                        {(paymentAction === 'paid' || paymentAction === 'refused') && (
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Notes administratives (Interne)</Label>
                                <Textarea placeholder="Précisions sur le traitement..." value={adminNotes} onChange={e => setAdminNotes(e.target.value)} />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedReport(null)} disabled={isProcessing}>
                            {paymentAction === 'view_info' ? 'Fermer' : 'Annuler'}
                        </Button>
                        {paymentAction !== 'view_info' && (
                            <Button 
                                className={paymentAction === 'paid' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive'}
                                onClick={handleUpdatePayment}
                                disabled={isProcessing || (paymentAction === 'paid' && !transactionRef) || !selectedReport?.user?.bankingInfo}
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
