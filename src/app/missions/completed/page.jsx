
"use client";

import React, { useMemo, useState } from 'react';
import { mockMissions, mockReports, mockUser } from '@/lib/mock-data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
    CheckCircle, SearchX, ArrowLeft, DollarSign, Wallet, Clock, 
    XCircle, CreditCard, History, TrendingUp, Filter, ListFilter,
    Calendar as CalendarIcon, Search, CalendarDays
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function CompletedMissionsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const myReports = useMemo(() => {
    return mockReports.filter(r => String(r.userId) === String(mockUser.id));
  }, []);

  // Filtered reports logic
  const filteredReports = useMemo(() => {
    return myReports.filter(report => {
        const mission = mockMissions.find(m => String(m.id) === String(report.missionId));
        const matchesStatus = statusFilter === 'all' || report.paymentStatus === statusFilter;
        const matchesSearch = !searchTerm || 
            mission?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Date Range logic
        let matchesDate = true;
        if (startDate || endDate) {
            const reportDate = new Date(report.submittedAt);
            if (startDate && reportDate < startOfDay(new Date(startDate))) {
                matchesDate = false;
            }
            if (endDate && reportDate > endOfDay(new Date(endDate))) {
                matchesDate = false;
            }
        }
        
        return matchesStatus && matchesSearch && matchesDate;
    });
  }, [myReports, statusFilter, searchTerm, startDate, endDate]);

  const stats = useMemo(() => {
    return {
        total: myReports.length,
        paidCount: myReports.filter(r => r.paymentStatus === 'paid').length,
        pendingCount: myReports.filter(r => r.paymentStatus === 'pending').length,
        refusedCount: myReports.filter(r => r.paymentStatus === 'refused').length,
        totalEarned: myReports.reduce((sum, r) => sum + (r.reward || 0), 0),
        totalPaid: myReports.filter(r => r.paymentStatus === 'paid').reduce((sum, r) => sum + (r.reward || 0), 0),
        totalPending: myReports.filter(r => r.paymentStatus === 'pending').reduce((sum, r) => sum + (r.reward || 0), 0),
    };
  }, [myReports]);

  const getPaymentStatusBadge = (status) => {
    switch (status) {
        case 'paid': return <Badge className="bg-green-100 text-green-800 border-green-200">Payée</Badge>;
        case 'pending': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">En attente</Badge>;
        case 'refused': return <Badge variant="destructive">Paiement Refusé</Badge>;
        default: return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" /> Retour aux missions</Link>
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CalendarIcon className="w-4 h-4" />
                Dernière mise à jour: {format(new Date(), 'PP')}
            </div>
       </div>
      
      <h1 className="text-2xl font-bold mb-8 text-primary flex items-center gap-2">
        <CheckCircle className="w-7 h-7" /> Mes Missions Terminées & Gains
      </h1>

      {/* Financial Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground flex justify-between">Total Missions <History className="w-3 h-3"/></CardTitle></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="flex gap-2 mt-1">
                    <span className="text-[10px] text-green-600 font-bold">{stats.paidCount} payées</span>
                    <span className="text-[10px] text-orange-600 font-bold">{stats.pendingCount} attente</span>
                </div>
            </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-green-700 flex justify-between">Total Payé <CheckCircle className="w-3 h-3"/></CardTitle></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-800">{stats.totalPaid} $</div>
                <p className="text-[10px] text-green-600">Reçu sur votre compte</p>
            </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-orange-700 flex justify-between">En attente <Clock className="w-3 h-3"/></CardTitle></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-orange-800">{stats.totalPending} $</div>
                <p className="text-[10px] text-orange-600">Traitement en cours</p>
            </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-red-700 flex justify-between">Refusées <XCircle className="w-3 h-3"/></CardTitle></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-800">{stats.refusedCount}</div>
                <p className="text-[10px] text-red-600">Paiements non validés</p>
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <TabsList>
                    <TabsTrigger value="all" className="flex items-center gap-2"><History className="w-4 h-4"/> Historique</TabsTrigger>
                    <TabsTrigger value="summary" className="flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Analyse</TabsTrigger>
                </TabsList>

                {/* Main Filters Bar */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Rechercher une mission..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px] h-9">
                            <ListFilter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="paid">Payées</SelectItem>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="refused">Refusées</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Date Range Filters Bar */}
            <Card className="p-3 bg-secondary/10 border-dashed">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1.5 flex-1 min-w-[150px]">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="w-3 h-3"/> Du
                        </Label>
                        <Input 
                            type="date" 
                            className="h-8 text-xs" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-[150px]">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="w-3 h-3"/> Au
                        </Label>
                        <Input 
                            type="date" 
                            className="h-8 text-xs" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-primary" onClick={clearFilters}>
                        Réinitialiser
                    </Button>
                </div>
            </Card>
        </div>

        <TabsContent value="all" className="space-y-4">
            <div className="flex justify-between items-center mb-2 px-1">
                <p className="text-xs text-muted-foreground">
                    Résultats : <span className="font-bold text-primary">{filteredReports.length}</span> mission(s) trouvée(s)
                </p>
            </div>
            {filteredReports.length > 0 ? filteredReports.map(report => {
                const mission = mockMissions.find(m => String(m.id) === String(report.missionId));
                return (
                    <Card key={report.id} className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row">
                            <div className="flex-grow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg text-primary">{mission?.title || 'Mission archivée'}</h3>
                                        <p className="text-xs text-muted-foreground font-medium">{mission?.businessName}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2 pt-1">
                                            <Clock className="w-3 h-3"/> Réalisée le {format(new Date(report.submittedAt), 'PP')}
                                        </p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <span className="text-xl font-black text-primary">{report.reward} $</span>
                                        {getPaymentStatusBadge(report.paymentStatus)}
                                    </div>
                                </div>
                                
                                {report.paymentStatus === 'paid' && (
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex items-center gap-3 mt-2 animate-in fade-in slide-in-from-top-1">
                                        <CreditCard className="w-5 h-5 text-green-600"/>
                                        <div className="text-xs text-green-800">
                                            <p className="font-bold">Virement effectué le {report.paymentDate ? format(new Date(report.paymentDate), 'PP') : 'N/A'}</p>
                                            <p className="opacity-80 italic">Réf: {report.transactionRef || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}

                                {report.paymentStatus === 'refused' && (
                                    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20 mt-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <XCircle className="w-4 h-4 text-destructive"/>
                                            <p className="text-xs text-destructive font-bold">Motif du refus de paiement :</p>
                                        </div>
                                        <p className="text-xs text-destructive italic ml-6">"{report.adminNotes || 'Contactez le support pour plus d\'informations.'}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                );
            }) : (
                <div className="text-center py-20 bg-secondary/10 rounded-xl border-2 border-dashed">
                    <SearchX className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50"/>
                    <p className="text-muted-foreground font-medium">Aucun résultat ne correspond à vos filtres.</p>
                    <Button variant="link" onClick={clearFilters}>Réinitialiser tous les filtres</Button>
                </div>
            )}
        </TabsContent>

        <TabsContent value="summary">
            <Card>
                <CardHeader><CardTitle>Performance & Gains Cumulés</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-6 flex items-center justify-between bg-secondary/10">
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Gains Totaux Approuvés</p>
                                <p className="text-4xl font-black text-primary">{stats.totalEarned} $</p>
                            </div>
                            <Wallet className="w-12 h-12 text-primary/10"/>
                        </div>
                        <div className="border rounded-lg p-6 flex items-center justify-between bg-green-50/50">
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-green-700 font-bold tracking-wider">Gains Déjà Perçus</p>
                                <p className="text-4xl font-black text-green-600">{stats.totalPaid} $</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-600/10"/>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Répartition des missions</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs mb-1"><span>Payées ({stats.paidCount})</span><span>{stats.total > 0 ? Math.round((stats.paidCount / stats.total) * 100) : 0}%</span></div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: `${stats.total > 0 ? (stats.paidCount / stats.total) * 100 : 0}%` }}></div>
                            </div>
                            
                            <div className="flex justify-between text-xs mb-1 pt-2"><span>En attente ({stats.pendingCount})</span><span>{stats.total > 0 ? Math.round((stats.pendingCount / stats.total) * 100) : 0}%</span></div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div className="bg-orange-400 h-full" style={{ width: `${stats.total > 0 ? (stats.pendingCount / stats.total) * 100 : 0}%` }}></div>
                            </div>

                            <div className="flex justify-between text-xs mb-1 pt-2"><span>Refusées ({stats.refusedCount})</span><span>{stats.total > 0 ? Math.round((stats.refusedCount / stats.total) * 100) : 0}%</span></div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full" style={{ width: `${stats.total > 0 ? (stats.refusedCount / stats.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
