
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { mockMissions, mockUser } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ClipboardList, FileText, CheckCircle, HelpCircle, Loader2, BookOpen, UserCheck, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AssignedMissionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveQuiz] = useState(null); // Track knowledge quiz mission ID

  const assignedMissions = useMemo(() => {
    return mockMissions.filter(mission =>
      mission.assignedTo.includes(mockUser.id) || mission.status === 'assigned'
    );
  }, []);

  const handleDocOpen = (missionId, docType) => {
      // Simulation: Marquer le document comme ouvert
      const m = mockMissions.find(x => x.id === missionId);
      if (!m.docsConsulted) m.docsConsulted = { briefing: false, scenario: false, questionnaire: false };
      m.docsConsulted[docType] = true;
      toast({ title: "Document consulté", description: `Vous avez ouvert le ${docType}.` });
      router.refresh();
  };

  const handleQuizSuccess = (missionId) => {
      const m = mockMissions.find(x => x.id === missionId);
      m.knowledgeQuizPassed = true;
      m.status = 'quiz_validated';
      toast({ title: "Quiz réussi !", description: "Le questionnaire de visite est désormais débloqué." });
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
            const canStartVisit = mission.knowledgeQuizPassed;

            return (
              <Card key={mission.id} className="shadow-md border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{mission.title}</CardTitle>
                        <CardDescription>{mission.businessName} - {mission.location}</CardDescription>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary">Attribuée</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Étape 5 : Consultation */}
                    <div className="bg-secondary/20 p-4 rounded-lg space-y-3 border">
                        <h3 className="font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4"/> Étape 5 : Consultation des documents obligatoires</h3>
                        <p className="text-xs text-muted-foreground">Ouvrez les 3 documents pour débloquer le quiz de connaissances.</p>
                        <div className="flex flex-wrap gap-2">
                            <Button variant={docs.briefing ? "default" : "outline"} size="sm" onClick={() => handleDocOpen(mission.id, 'briefing')}>
                                <FileText className="w-4 h-4 mr-1"/> Briefing PDF {docs.briefing && <CheckCircle className="ml-2 w-3 h-3"/>}
                            </Button>
                            <Button variant={docs.scenario ? "default" : "outline"} size="sm" onClick={() => handleDocOpen(mission.id, 'scenario')}>
                                <FileText className="w-4 h-4 mr-1"/> Scénario PDF {docs.scenario && <CheckCircle className="ml-2 w-3 h-3"/>}
                            </Button>
                            <Button variant={docs.questionnaire ? "default" : "outline"} size="sm" onClick={() => handleDocOpen(mission.id, 'questionnaire')}>
                                <ClipboardList className="w-4 h-4 mr-1"/> Questionnaire PDF {docs.questionnaire && <CheckCircle className="ml-2 w-3 h-3"/>}
                            </Button>
                        </div>
                    </div>

                    {/* Étape 6 : Quiz */}
                    {canTakeQuiz && (
                        <div className="bg-accent/5 p-4 rounded-lg border-accent/20 border-2 space-y-4">
                            <h3 className="font-bold text-accent flex items-center gap-2"><HelpCircle className="w-5 h-5"/> Étape 6 : Validation des connaissances</h3>
                            <p className="text-sm">Répondez à ce quiz pour confirmer que vous avez bien compris les instructions.</p>
                            <Button className="w-full bg-accent text-accent-foreground" onClick={() => setActiveQuiz(mission.id)}>
                                Lancer le quiz de validation
                            </Button>
                        </div>
                    )}

                    {/* Étape 7 : Visite */}
                    {canStartVisit && (
                        <Alert className="bg-green-50 border-green-200 text-green-800">
                            <UserCheck className="h-4 w-4" />
                            <AlertTitle>Prêt pour la visite</AlertTitle>
                            <AlertDescription>
                                Le quiz a été validé. Vous pouvez maintenant effectuer la visite sur place selon le scénario.
                                <div className="mt-4">
                                    <Button asChild className="bg-green-600 hover:bg-green-700">
                                        <Link href={`/report/${mission.id}`}><PlayCircle className="w-4 h-4 mr-2"/> Remplir le questionnaire final</Link>
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Alert className="mt-6">
          <ClipboardList className="h-4 w-4" />
          <AlertTitle>Aucune mission</AlertTitle>
          <AlertDescription>
            Vous n'avez pas de missions en cours. Consultez les <Link href="/" className="text-primary underline">missions disponibles</Link>.
          </AlertDescription>
        </Alert>
      )}

      {/* Quiz Modal Simulation */}
      {activeTab && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-lg shadow-2xl">
                  <CardHeader>
                      <CardTitle>Quiz de connaissances</CardTitle>
                      <CardDescription>Validez votre compréhension avant la visite.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="space-y-3">
                          <Label>Le passage en caisse est-il obligatoire ?</Label>
                          <RadioGroup defaultValue="oui">
                              <div className="flex items-center space-x-2"><RadioGroupItem value="oui" /><Label>Vrai</Label></div>
                              <div className="flex items-center space-x-2"><RadioGroupItem value="non" /><Label>Faux</Label></div>
                          </RadioGroup>
                      </div>
                      <div className="space-y-3">
                          <Label>Dois-je prendre une photo de la devanture ?</Label>
                          <RadioGroup defaultValue="oui">
                              <div className="flex items-center space-x-2"><RadioGroupItem value="oui" /><Label>Vrai</Label></div>
                              <div className="flex items-center space-x-2"><RadioGroupItem value="non" /><Label>Faux</Label></div>
                          </RadioGroup>
                      </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setActiveQuiz(null)}>Fermer</Button>
                      <Button onClick={() => handleQuizSuccess(activeTab)}>Soumettre</Button>
                  </CardFooter>
              </Card>
          </div>
      )}
    </div>
  );
}
