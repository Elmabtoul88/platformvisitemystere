
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockMissions, mockUser, mockStores, mockApplications, mockAssignments } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
    ClipboardList, FileText, CheckCircle, HelpCircle, 
    BookOpen, UserCheck, PlayCircle, Download, Clock, AlertTriangle, 
    MapPin, Navigation, Info, Search, List, XCircle, Send, Building
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { format, isWithinInterval, addMinutes, subMinutes, isAfter } from 'date-fns';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AssignedMissionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const myAssignments = useMemo(() => {
    return mockAssignments.filter(asg => String(asg.user_id) === String(mockUser.id));
  }, []);

  const myApplications = useMemo(() => {
    return mockApplications.filter(app => String(app.user_id) === String(mockUser.id));
  }, []);

  const handleDocOpen = (missionId, docType) => {
      const m = mockMissions.find(x => String(x.id) === String(missionId));
      if (!m.docsConsulted) m.docsConsulted = { briefing: false, scenario: false, questionnaire: false };
      m.docsConsulted[docType] = true;
      toast({ title: "Document consulté", description: `Enregistré: ${docType}.` });
      router.refresh();
  };

  const handleQuizSuccess = (missionId) => {
      const m = mockMissions.find(x => String(x.id) === String(missionId));
      m.knowledgeQuizPassed = true;
      toast({ title: "Quiz réussi !", description: "Le questionnaire est débloqué pour l'heure de visite." });
      setActiveQuiz(null);
      router.refresh();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <ClipboardList className="w-6 h-6" /> Suivi de mes Missions
      </h1>

      <Tabs defaultValue="assigned" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="assigned">Missions Assignées ({myAssignments.length})</TabsTrigger>
            <TabsTrigger value="applications">Mes Candidatures ({myApplications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-6">
            {myAssignments.length > 0 ? (
                myAssignments.map(asg => {
                    const mission = mockMissions.find(m => String(m.id) === String(asg.mission_id));
                    const assignedStore = mockStores.find(s => String(s.id) === String(asg.store_id));
                    const docs = mission?.docsConsulted || { briefing: false, scenario: false, questionnaire: false };
                    const allDocsOpened = docs.briefing && docs.scenario && docs.questionnaire;
                    
                    const windowMin = asg.timeWindowMinutes || 60;
                    const plannedDate = new Date(asg.plannedDate);
                    
                    const isWithinWindow = isWithinInterval(currentTime, {
                        start: subMinutes(plannedDate, windowMin),
                        end: addMinutes(plannedDate, windowMin)
                    });

                    const isExpired = isAfter(currentTime, addMinutes(plannedDate, windowMin));

                    return (
                        <Card key={asg.id} className={cn("shadow-md border-l-4 transition-all", isExpired ? 'border-l-destructive bg-destructive/5 opacity-80' : 'border-l-primary')}>
                            <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <CardTitle className="text-primary font-bold">{mission?.title}</CardTitle>
                                    <CardDescription className="flex flex-col">
                                        <span className="font-bold text-foreground text-md">{mission?.businessName}</span>
                                        <span className="flex items-center gap-1 text-primary"><MapPin className="w-3 h-3"/> {assignedStore?.name || mission?.location}</span>
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className={cn("flex items-center gap-1 font-bold", isWithinWindow ? "bg-green-100 text-green-700 border-green-200" : "bg-primary/5")}>
                                        <Clock className="w-3 h-3"/> {format(plannedDate, 'PPp')}
                                    </Badge>
                                    <p className="text-[10px] text-muted-foreground mt-1">Fenêtre: ±{windowMin} min</p>
                                </div>
                            </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {isExpired ? (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Mission Annulée</AlertTitle>
                                        <AlertDescription>Le créneau de visite est dépassé. Vous ne pouvez plus remplir le questionnaire.</AlertDescription>
                                    </Alert>
                                ) : (
                                    <>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-secondary/20 p-4 rounded-lg space-y-3 border">
                                            <h3 className="font-semibold flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4"/> 1. Documents obligatoires</h3>
                                            <div className="flex flex-col gap-2">
                                                <Button variant="outline" size="sm" className="justify-start text-xs h-8 group" onClick={() => handleDocOpen(mission.id, 'briefing')}>
                                                    <Download className="w-4 h-4 mr-2"/> Briefing {docs.briefing && <CheckCircle className="ml-auto w-3 h-3 text-green-600"/>}
                                                </Button>
                                                <Button variant="outline" size="sm" className="justify-start text-xs h-8 group" onClick={() => handleDocOpen(mission.id, 'scenario')}>
                                                    <Download className="w-4 h-4 mr-2"/> Scénario {docs.scenario && <CheckCircle className="ml-auto w-3 h-3 text-green-600"/>}
                                                </Button>
                                                <Button variant="outline" size="sm" className="justify-start text-xs h-8 group" onClick={() => handleDocOpen(mission.id, 'questionnaire')}>
                                                    <Download className="w-4 h-4 mr-2"/> Questionnaire {docs.questionnaire && <CheckCircle className="ml-auto w-3 h-3 text-green-600"/>}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className={`p-4 rounded-lg border flex flex-col justify-center gap-3 transition-colors ${mission?.knowledgeQuizPassed ? 'bg-green-50 border-green-200' : 'bg-accent/5 border-accent/20'}`}>
                                            <h3 className="font-bold text-sm flex items-center gap-2 text-foreground"><HelpCircle className="w-4 h-4"/> 2. Validation connaissances</h3>
                                            {mission?.knowledgeQuizPassed ? (
                                                <div className="flex flex-col items-center">
                                                    <CheckCircle className="w-8 h-8 text-green-600 mb-2"/>
                                                    <span className="text-xs font-bold text-green-700">Quiz Validé</span>
                                                </div>
                                            ) : (
                                                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold" size="sm" disabled={!allDocsOpened} onClick={() => setActiveQuiz(mission.id)}>Lancer le quiz</Button>
                                            )}
                                        </div>
                                    </div>

                                    {mission?.knowledgeQuizPassed && (
                                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                                            <Alert className={cn(isWithinWindow ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200")}>
                                                <UserCheck className="h-4 w-4" />
                                                <AlertTitle>{isWithinWindow ? "Créneau Ouvert" : "Attente Heure Visite"}</AlertTitle>
                                                <AlertDescription className="text-xs">
                                                    {isWithinWindow 
                                                        ? "Vous pouvez maintenant remplir le questionnaire final." 
                                                        : `Le questionnaire sera débloqué à ${format(subMinutes(plannedDate, windowMin), 'HH:mm')}.`}
                                                </AlertDescription>
                                            </Alert>
                                            <Button asChild className="w-full h-14 text-lg font-bold shadow-lg" disabled={!isWithinWindow}>
                                                {isWithinWindow ? (
                                                    <Link href={`/report/${mission.id}`}><PlayCircle className="w-6 h-6 mr-2"/> Remplir le questionnaire final</Link>
                                                ) : (
                                                    <div className="flex items-center opacity-50"><Clock className="w-6 h-6 mr-2"/> Questionnaire Verrouillé</div>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    );
                })
            ) : (
                <Alert className="mt-6"><ClipboardList className="h-4 w-4" /><AlertTitle>Aucune mission assignée</AlertTitle><AlertDescription>Postulez à des missions pour les voir apparaître ici.</AlertDescription></Alert>
            )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
            {myApplications.length > 0 ? (
                myApplications.map(app => {
                    const mission = mockMissions.find(m => String(m.id) === String(app.mission_id));
                    const requestedStores = mockStores.filter(s => (app.selectedStoreIds || [app.selectedStoreId]).includes(s.id));
                    
                    return (
                        <Card key={app.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                <div className="flex-grow p-5 border-b md:border-b-0 md:border-r">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-primary text-lg">{mission?.title}</h3>
                                            <p className="text-sm text-muted-foreground">{mission?.businessName}</p>
                                        </div>
                                        <Badge variant={app.status === 'refused' ? 'destructive' : 'outline'} className="capitalize">
                                            {app.status === 'pending' ? 'En attente' : app.status === 'refused' ? 'Refusée' : 'Approuvée'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                                            <Building className="w-3 h-3"/> Magasins demandés:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {requestedStores.map(s => (
                                                <Badge key={s.id} variant="secondary" className="text-[10px]">{s.name} ({s.city})</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {app.status === 'refused' && (
                                    <div className="md:w-1/3 bg-destructive/5 p-5 flex flex-col gap-2">
                                        <h4 className="font-bold text-xs text-destructive flex items-center gap-1 uppercase tracking-wider">
                                            <XCircle className="w-4 h-4"/> Motif du refus
                                        </h4>
                                        <p className="text-sm italic text-destructive/80 leading-relaxed bg-white/50 p-3 rounded-lg border border-destructive/10">
                                            "{app.refusal_reason || "Aucun motif spécifié par l'administrateur."}"
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-auto">
                                            Conseil : Vérifiez votre profil et postulez sur d'autres points de vente.
                                        </p>
                                    </div>
                                )}

                                {app.status === 'pending' && (
                                    <div className="md:w-1/3 bg-secondary/20 p-5 flex flex-col items-center justify-center text-center gap-2">
                                        <Clock className="w-8 h-8 text-muted-foreground animate-pulse"/>
                                        <p className="text-xs font-medium text-muted-foreground">Votre candidature est en cours d'examen par notre équipe.</p>
                                    </div>
                                )}

                                {app.status === 'approved' && (
                                    <div className="md:w-1/3 bg-green-50 p-5 flex flex-col items-center justify-center text-center gap-2">
                                        <CheckCircle className="w-8 h-8 text-green-600"/>
                                        <p className="text-xs font-bold text-green-700 uppercase">Félicitations !</p>
                                        <p className="text-[10px] text-green-600">Rendez-vous dans l'onglet "Missions Assignées" pour débuter.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })
            ) : (
                <div className="text-center py-20 bg-secondary/10 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">Vous n'avez envoyé aucune candidature pour le moment.</p>
                    <Button asChild variant="link" className="mt-2"><Link href="/">Voir les missions disponibles</Link></Button>
                </div>
            )}
        </TabsContent>
      </Tabs>

      {/* Quiz Modal */}
      {activeQuiz && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <Card className="w-full max-w-lg shadow-2xl">
                  <CardHeader><CardTitle>Quiz de connaissances</CardTitle><CardDescription>Validez que vous avez bien lu le briefing et le scénario.</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                      <div className="space-y-3">
                          <Label className="text-md font-semibold">Le passage en caisse est-il obligatoire pour cette mission ?</Label>
                          <RadioGroup defaultValue="oui" onValueChange={() => {}}>
                              <div className="flex items-center space-x-2 bg-secondary/30 p-3 rounded-lg border"><RadioGroupItem value="oui" id="r-oui" /><Label htmlFor="r-oui" className="flex-grow cursor-pointer font-medium">Vrai (Oui)</Label></div>
                              <div className="flex items-center space-x-2 bg-secondary/30 p-3 rounded-lg border"><RadioGroupItem value="non" id="r-non" /><Label htmlFor="r-non" className="flex-grow cursor-pointer font-medium">Faux (Non)</Label></div>
                          </RadioGroup>
                      </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 border-t pt-4">
                      <Button variant="ghost" onClick={() => setActiveQuiz(null)}>Fermer</Button>
                      <Button onClick={() => handleQuizSuccess(activeQuiz)} className="bg-primary px-8">Valider</Button>
                  </CardFooter>
              </Card>
          </div>
      )}
    </div>
  );
}
