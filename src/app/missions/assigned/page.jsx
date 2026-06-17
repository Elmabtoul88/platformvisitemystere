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
    BookOpen, UserCheck, PlayCircle, Download, Clock, AlertTriangle, 
    MapPin, Navigation, Info, Search, List
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { format, isWithinInterval, addMinutes, subMinutes, isAfter } from 'date-fns';
import { cn } from "@/lib/utils";

export default function AssignedMissionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [viewingStoresFor, setViewingStoresFor] = useState(null);

  // Update clock every 30 seconds for accurate window checking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const assignedMissions = useMemo(() => {
    return mockMissions.filter(mission =>
      (mission.assignedTo?.includes(mockUser.id) || mission.status === 'assigned') && mission.status !== 'completed'
    ).map(mission => {
        // Auto-cancellation logic
        if (mission.plannedDate && mission.status !== 'completed' && mission.status !== 'cancelled') {
            const windowMin = mission.timeWindowMinutes || 60;
            const expiryTime = addMinutes(new Date(mission.plannedDate), windowMin);
            if (isAfter(new Date(), expiryTime)) {
                mission.status = 'cancelled';
                console.log(`Mission ${mission.id} auto-cancelled due to expiry window.`);
            }
        }
        return mission;
    });
  }, [currentTime]);

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
        <ClipboardList className="w-6 h-6" /> Mes Missions en Cours
      </h1>

      {assignedMissions.length > 0 ? (
        <div className="space-y-6">
          {assignedMissions.map(mission => {
            const docs = mission.docsConsulted || { briefing: false, scenario: false, questionnaire: false };
            const allDocsOpened = docs.briefing && docs.scenario && docs.questionnaire;
            const canTakeQuiz = allDocsOpened && !mission.knowledgeQuizPassed;
            const assignedStore = mockStores.find(s => String(s.id) === String(mission.assignedStoreId));
            const windowMin = mission.timeWindowMinutes || 60;
            
            const isWithinWindow = mission.plannedDate && isWithinInterval(currentTime, {
                start: subMinutes(new Date(mission.plannedDate), windowMin),
                end: addMinutes(new Date(mission.plannedDate), windowMin)
            });

            return (
              <Card key={mission.id} className={`shadow-md border-l-4 transition-all ${mission.status === 'cancelled' ? 'border-l-destructive bg-destructive/5 opacity-80' : 'border-l-primary'}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-primary font-bold">
                            {mission.title}
                            {mission.status === 'cancelled' && <Badge variant="destructive">Annulée</Badge>}
                        </CardTitle>
                        <CardDescription className="flex flex-col">
                            <span className="font-bold text-foreground text-md">{mission.businessName}</span>
                            <span className="flex items-center gap-1 text-primary"><MapPin className="w-3 h-3"/> {assignedStore?.name || mission.location}</span>
                        </CardDescription>
                    </div>
                    {mission.plannedDate && (
                        <div className="text-right">
                            <Badge variant="outline" className={cn("flex items-center gap-1 font-bold", isWithinWindow ? "bg-green-100 text-green-700 border-green-200" : "bg-primary/5")}>
                                <Clock className="w-3 h-3"/> {format(new Date(mission.plannedDate), 'PPp')}
                            </Badge>
                            <p className="text-[10px] text-muted-foreground mt-1">Fenêtre: ±{windowMin} min</p>
                        </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {mission.status === 'cancelled' ? (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Mission Annulée</AlertTitle>
                            <AlertDescription>Fenêtre de réalisation dépassée ({windowMin} min après l'heure prévue). Vous ne pouvez plus soumettre le rapport.</AlertDescription>
                        </Alert>
                    ) : (
                        <>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-secondary/20 p-4 rounded-lg space-y-3 border">
                                <h3 className="font-semibold flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4"/> 1. Documents</h3>
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" size="sm" className="justify-start text-xs h-8 group" onClick={() => handleDocOpen(mission.id, 'briefing')}>
                                        <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"/> Briefing {docs.briefing && <CheckCircle className="ml-auto w-3 h-3 text-green-600"/>}
                                    </Button>
                                    <Button variant="outline" size="sm" className="justify-start text-xs h-8 group" onClick={() => handleDocOpen(mission.id, 'scenario')}>
                                        <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"/> Scénario {docs.scenario && <CheckCircle className="ml-auto w-3 h-3 text-green-600"/>}
                                    </Button>
                                    <Button variant="outline" size="sm" className="justify-start text-xs h-8 group" onClick={() => handleDocOpen(mission.id, 'questionnaire')}>
                                        <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"/> Questionnaire {docs.questionnaire && <CheckCircle className="ml-auto w-3 h-3 text-green-600"/>}
                                    </Button>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg border flex flex-col justify-center gap-3 transition-colors ${mission.knowledgeQuizPassed ? 'bg-green-50 border-green-200' : 'bg-accent/5 border-accent/20'}`}>
                                <h3 className="font-bold text-sm flex items-center gap-2 text-foreground"><HelpCircle className="w-4 h-4"/> 2. Validation</h3>
                                {mission.knowledgeQuizPassed ? (
                                    <div className="flex flex-col items-center">
                                        <CheckCircle className="w-8 h-8 text-green-600 mb-2"/>
                                        <span className="text-xs font-bold text-green-700">Quiz de connaissance Validé</span>
                                    </div>
                                ) : (
                                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold" size="sm" disabled={!allDocsOpened} onClick={() => setActiveQuiz(mission.id)}>Lancer le quiz</Button>
                                )}
                            </div>
                        </div>

                        {mission.knowledgeQuizPassed && (
                            <div className="space-y-4 animate-in fade-in zoom-in-95">
                                <Alert className={cn(isWithinWindow ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200")}>
                                    <UserCheck className="h-4 w-4" />
                                    <AlertTitle>{isWithinWindow ? "Créneau Ouvert" : "Attente Heure Visite"}</AlertTitle>
                                    <AlertDescription className="text-xs">
                                        {isWithinWindow 
                                            ? "Vous pouvez maintenant remplir le questionnaire final. Vous avez jusqu'à " + format(addMinutes(new Date(mission.plannedDate), windowMin), 'HH:mm') + " pour le faire." 
                                            : `Le questionnaire sera débloqué à ${format(subMinutes(new Date(mission.plannedDate), windowMin), 'HH:mm')}.`}
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
          })}
        </div>
      ) : (
        <Alert className="mt-6"><ClipboardList className="h-4 w-4" /><AlertTitle>Aucune mission</AlertTitle><AlertDescription>Vous n'avez pas de missions actives ou en cours.</AlertDescription></Alert>
      )}

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
