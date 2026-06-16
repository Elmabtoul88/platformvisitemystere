
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockMissions, mockUser, mockStores } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
    ClipboardList, FileText, CheckCircle, HelpCircle, 
    BookOpen, UserCheck, PlayCircle, Download, Clock, AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { format, isWithinInterval, addMinutes, subMinutes, isAfter } from 'date-fns';

export default function AssignedMissionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute for real-time validation
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const assignedMissions = useMemo(() => {
    return mockMissions.filter(mission =>
      (mission.assignedTo.includes(mockUser.id) || mission.status === 'assigned') && mission.status !== 'cancelled'
    ).map(mission => {
        // Auto-cancellation check
        if (mission.plannedDate && mission.status !== 'submitted') {
            const expiryTime = addMinutes(new Date(mission.plannedDate), 30);
            if (isAfter(new Date(), expiryTime)) {
                mission.status = 'cancelled';
            }
        }
        return mission;
    });
  }, [currentTime]);

  const handleDocOpen = (missionId, docType) => {
      const m = mockMissions.find(x => x.id === missionId);
      if (!m.docsConsulted) m.docsConsulted = { briefing: false, scenario: false, questionnaire: false };
      m.docsConsulted[docType] = true;
      toast({ title: "Document téléchargé", description: `Vous avez consulté le ${docType}.` });
      router.refresh();
  };

  const handleQuizSuccess = (missionId) => {
      const m = mockMissions.find(x => x.id === missionId);
      m.knowledgeQuizPassed = true;
      toast({ title: "Quiz réussi !", description: "Le questionnaire est débloqué pour l'heure de visite." });
      setActiveQuiz(null);
      router.refresh();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <ClipboardList className="w-6 h-6" /> Mes Missions en Cours
      </h1>

      {assignedMissions.length > 0 ? (
        <div className="space-y-6">
          {assignedMissions.map(mission => {
            const docs = mission.docsConsulted || { briefing: false, scenario: false, questionnaire: false };
            const allDocsOpened = docs.briefing && docs.scenario && docs.questionnaire;
            const canTakeQuiz = allDocsOpened && !mission.knowledgeQuizPassed;
            const store = mockStores.find(s => s.id === mission.assignedStoreId);
            
            // Time window logic (plannedDate ± 30 mins)
            const isWithinWindow = mission.plannedDate && isWithinInterval(currentTime, {
                start: subMinutes(new Date(mission.plannedDate), 30),
                end: addMinutes(new Date(mission.plannedDate), 30)
            });

            return (
              <Card key={mission.id} className={`shadow-md border-l-4 ${mission.status === 'cancelled' ? 'border-l-destructive bg-destructive/5' : 'border-l-primary'}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            {mission.title}
                            {mission.status === 'cancelled' && <Badge variant="destructive">Annulée (Retard)</Badge>}
                        </CardTitle>
                        <CardDescription>{mission.businessName} - {store?.name || mission.location}</CardDescription>
                    </div>
                    {mission.plannedDate && (
                        <div className="text-right">
                            <Badge variant="outline" className="flex items-center gap-1 font-bold">
                                <Clock className="w-3 h-3"/> {format(new Date(mission.plannedDate), 'PPp')}
                            </Badge>
                            <p className="text-[10px] text-muted-foreground mt-1">Fenêtre de validité: ±30 min</p>
                        </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {mission.status === 'cancelled' ? (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Mission Annulée</AlertTitle>
                            <AlertDescription>
                                Vous avez dépassé la fenêtre de 30 minutes autorisée après l'heure de visite prévue. La mission est automatiquement annulée.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                        {/* Step 5: Docs */}
                        <div className="bg-secondary/20 p-4 rounded-lg space-y-3 border">
                            <h3 className="font-semibold flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4"/> 1. Télécharger les documents</h3>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" asChild onClick={() => handleDocOpen(mission.id, 'briefing')}>
                                    <a href={mission.briefingUrl} download><Download className="w-4 h-4 mr-1"/> Briefing {docs.briefing && <CheckCircle className="ml-2 w-3 h-3 text-green-600"/>}</a>
                                </Button>
                                <Button variant="outline" size="sm" asChild onClick={() => handleDocOpen(mission.id, 'scenario')}>
                                    <a href={mission.scenarioUrl} download><Download className="w-4 h-4 mr-1"/> Scénario {docs.scenario && <CheckCircle className="ml-2 w-3 h-3 text-green-600"/>}</a>
                                </Button>
                                <Button variant="outline" size="sm" asChild onClick={() => handleDocOpen(mission.id, 'questionnaire')}>
                                    <a href={mission.questionnairePdfUrl} download><Download className="w-4 h-4 mr-1"/> Questionnaire {docs.questionnaire && <CheckCircle className="ml-2 w-3 h-3 text-green-600"/>}</a>
                                </Button>
                            </div>
                        </div>

                        {/* Step 6: Quiz */}
                        {canTakeQuiz && (
                            <div className="bg-accent/5 p-4 rounded-lg border-accent/20 border-2 space-y-3">
                                <h3 className="font-bold text-accent flex items-center gap-2 text-sm"><HelpCircle className="w-4 h-4"/> 2. Quiz de connaissances</h3>
                                <Button className="w-full bg-accent text-accent-foreground" onClick={() => setActiveQuiz(mission.id)}>Lancer le quiz</Button>
                            </div>
                        )}

                        {/* Step 7: Execution */}
                        {mission.knowledgeQuizPassed && (
                            <div className="space-y-4">
                                <Alert className={isWithinWindow ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
                                    <UserCheck className="h-4 w-4" />
                                    <AlertTitle>{isWithinWindow ? "Questionnaire Disponible" : "En attente de l'heure de visite"}</AlertTitle>
                                    <AlertDescription>
                                        {isWithinWindow 
                                            ? "Vous êtes dans le créneau autorisé. Remplissez le questionnaire maintenant." 
                                            : `Le questionnaire s'activera 30 minutes avant votre heure de passage (${format(subMinutes(new Date(mission.plannedDate), 30), 'HH:mm')}).`}
                                    </AlertDescription>
                                </Alert>
                                <Button 
                                    asChild 
                                    className="w-full h-12 text-lg" 
                                    disabled={!isWithinWindow}
                                >
                                    {isWithinWindow ? (
                                        <Link href={`/report/${mission.id}`}><PlayCircle className="w-5 h-5 mr-2"/> Remplir le questionnaire final</Link>
                                    ) : (
                                        <div className="flex items-center"><Clock className="w-5 h-5 mr-2"/> Questionnaire Verrouillé</div>
                                    )}
                                </Button>
                            </div>
                        )}
                        </>
                    )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Alert className="mt-6"><ClipboardList className="h-4 w-4" /><AlertTitle>Aucune mission</AlertTitle><AlertDescription>Vous n'avez pas de missions actives.</AlertDescription></Alert>
      )}

      {/* Quiz Modal */}
      {activeQuiz && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <Card className="w-full max-w-lg shadow-2xl">
                  <CardHeader><CardTitle>Quiz de connaissances</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      <div className="space-y-3">
                          <Label>Le passage en caisse est-il obligatoire ?</Label>
                          <RadioGroup defaultValue="oui">
                              <div className="flex items-center space-x-2"><RadioGroupItem value="oui" /><Label>Vrai (Oui)</Label></div>
                              <div className="flex items-center space-x-2"><RadioGroupItem value="non" /><Label>Faux</Label></div>
                          </RadioGroup>
                      </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setActiveQuiz(null)}>Fermer</Button>
                      <Button onClick={() => handleQuizSuccess(activeQuiz)}>Valider</Button>
                  </CardFooter>
              </Card>
          </div>
      )}
    </div>
  );
}
