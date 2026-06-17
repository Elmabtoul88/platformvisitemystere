"use client";

import React, { useMemo } from 'react';
import { mockMissions, mockReports, mockUser } from '@/lib/mock-data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, SearchX, ArrowLeft, DollarSign, Wallet, Clock, XCircle, CreditCard, History, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CompletedMissionsPage() {
  const myReports = useMemo(() => {
    return mockReports.filter(r => String(r.userId) === String(mockUser.id));
  }, []);

  const monthlySummary = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const thisMonth = myReports.filter(r => {
        const date = new Date(r.submittedAt);
        return isWithinInterval(date, { start, end });
    });

    return {
        count: thisMonth.length,
        earned: thisMonth.reduce((sum, r) => sum + (r.reward || 0), 0),
        paid: thisMonth.filter(r => r.paymentStatus === 'paid').reduce((sum, r) => sum + (r.reward || 0), 0),
        pending: thisMonth.filter(r => r.paymentStatus === 'pending').reduce((sum, r) => sum + (r.reward || 0), 0),
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
       <Button asChild variant="outline" size="sm" className="mb-6">
         <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" /> Retour aux missions</Link>
       </Button>
      
      <h1 className="text-2xl font-bold mb-8 text-primary flex items-center gap-2">
        <CheckCircle className="w-7 h-7" /> Mes Missions Terminées
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Missions ce mois</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{monthlySummary.count}</div></CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Gagné ce mois</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{monthlySummary.earned} $</div></CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-green-700">Payé ce mois</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-800">{monthlySummary.paid} $</div></CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-orange-700">Reste à recevoir</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-orange-800">{monthlySummary.pending} $</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2"><History className="w-4 h-4"/> Historique Complet</TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Récapitulatif</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
            {myReports.length > 0 ? myReports.map(report => {
                const mission = mockMissions.find(m => String(m.id) === String(report.missionId));
                return (
                    <Card key={report.id} className="overflow-hidden border-l-4 border-l-primary">
                        <div className="flex flex-col md:flex-row">
                            <div className="flex-grow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-primary">{mission?.title || 'Mission archivée'}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
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
                                            <p className="font-bold">Virement effectué le {format(new Date(report.paymentDate), 'PP')}</p>
                                            <p className="opacity-80 italic">Réf: {report.transactionRef}</p>
                                        </div>
                                    </div>
                                )}

                                {report.paymentStatus === 'refused' && (
                                    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20 mt-2">
                                        <p className="text-xs text-destructive font-bold">Motif du refus de paiement :</p>
                                        <p className="text-xs text-destructive italic">"{report.adminNotes || 'Contactez le support pour plus d\'informations.'}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                );
            }) : (
                <div className="text-center py-20 bg-secondary/10 rounded-xl border-2 border-dashed">
                    <SearchX className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50"/>
                    <p className="text-muted-foreground font-medium">Aucune mission terminée pour le moment.</p>
                </div>
            )}
        </TabsContent>

        <TabsContent value="summary">
            <Card>
                <CardHeader><CardTitle>Performance & Gains</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground italic">Cette section sera enrichie avec des graphiques de performance prochainement.</p>
                    <div className="border rounded-lg p-6 flex items-center justify-between bg-secondary/20">
                        <div className="space-y-1">
                            <p className="text-xs uppercase text-muted-foreground">Total à vie</p>
                            <p className="text-4xl font-black text-primary">
                                {myReports.filter(r => r.paymentStatus === 'paid').reduce((sum, r) => sum + (r.reward || 0), 0)} $
                            </p>
                        </div>
                        <Wallet className="w-12 h-12 text-primary/20"/>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
