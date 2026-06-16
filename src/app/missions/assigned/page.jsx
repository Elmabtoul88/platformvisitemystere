
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

// Distance calculation helper (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

export default function AssignedMissionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Nearby stores state
  const [viewingStoresFor, setViewingStoresFor] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [sortNearest, setSortNearest] = useState(false);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const assignedMissions = useMemo(() => {
    return mockMissions.filter(mission =>
      (mission.assignedTo.includes(mockUser.id) || mission.status === 'assigned') && mission.status !== 'cancelled'
    ).map(mission => {
        if (mission.plannedDate && mission.status !== 'submitted') {
            const expiryTime = addMinutes(new Date(mission.plannedDate), 30);
            if (isAfter(new Date(), expiryTime)) {
                mission.status = 'cancelled';
            }
        }
        return mission;
    });
  }, [currentTime]);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setSortNearest(true);
          setIsGettingLocation(false);
          toast({ title: "Position récupérée", description: "La liste est triée par distance." });
        },
        (error) => {
          setIsGettingLocation(false);
          toast({ variant: "destructive", title: "Erreur GPS", description: "Impossible d'accéder à votre position." });
        }
      );
    }
  };

  const getNearbyStores = (missionId) => {
    let stores = mockStores.filter(s => s.mission_id === missionId && s.active);
    
    // Step 1: Filter by same city automatically
    stores = stores.filter(s => s.city.toLowerCase() === (mockUser.city?.toLowerCase() || ''));

    // Step 2: Sort by distance if requested
    if (sortNearest && userLocation) {
        stores = stores.map(s => ({
            ...s,
            distance: calculateDistance(userLocation.lat, userLocation.lng, s.latitude, s.longitude)
        })).sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    }

    return stores;
  };

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
            const assignedStore = mockStores.find(s => s.id === mission.assignedStoreId);
            
            const isWithinWindow = mission.plannedDate && isWithinInterval(currentTime, {
                start: subMinutes(new Date(mission.plannedDate), 30),
                end: addMinutes(new Date(mission.plannedDate), 30)
            });

            return (
              <Card key={mission.id} className={`shadow-md border-l-4 ${mission.status === 'cancelled' ? 'border-l-destructive bg-destructive/5' : 'border-l-primary'}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            {mission.title}
                            {mission.status === 'cancelled' && <Badge variant="destructive">Annulée</Badge>}
                        </CardTitle>
                        <CardDescription className="flex flex-col">
                            <span className="font-bold text-foreground">{mission.businessName}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {assignedStore?.name || mission.location}</span>
                        </CardDescription>
                    </div>
                    {mission.plannedDate && (
                        <div className="text-right">
                            <Badge variant="outline" className="flex items-center gap-1 font-bold bg-primary/5">
                                <Clock className="w-3 h-3"/> {format(new Date(mission.plannedDate), 'PPp')}
                            </Badge>
                            <p className="text-[10px] text-muted-foreground mt-1">Fenêtre: ±30 min</p>
                        </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {mission.status === 'cancelled' ? (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Mission Annulée</AlertTitle>
                            <AlertDescription>Fenêtre de réalisation dépassée (30 min après l'heure prévue).</AlertDescription>
                        </Alert>
                    ) : (
                        <>
                        {/* Nearby Stores Exploration */}
                        <div className="bg-secondary/10 p-4 rounded-lg border border-dashed">
                             <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2"><Navigation className="w-4 h-4"/> Magasins à proximité ({mockUser.city})</h3>
                                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setViewingStoresFor(viewingStoresFor === mission.id ? null : mission.id)}>
                                    {viewingStoresFor === mission.id ? "Masquer" : "Voir les magasins"}
                                </Button>
                             </div>
                             
                             {viewingStoresFor === mission.id && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex gap-2 mb-2">
                                        <Button size="xs" variant="outline" className="text-[10px] h-7" onClick={handleGetLocation} disabled={isGettingLocation}>
                                            {isGettingLocation ? <Loader2 className="animate-spin w-3 h-3 mr-1"/> : <MapPin className="w-3 h-3 mr-1"/>}
                                            Trier par les plus proches
                                        </Button>
                                    </div>
                                    <div className="grid gap-2 max-h-[250px] overflow-y-auto pr-1">
                                        {getNearbyStores(mission.id).map(store => (
                                            <div key={store.id} className="p-3 bg-background border rounded flex justify-between items-center group hover:border-primary transition-colors">
                                                <div>
                                                    <div className="font-bold text-sm">{store.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">{store.address}</div>
                                                    {store.distance && <div className="text-[10px] font-bold text-primary">{store.distance.toFixed(1)} km</div>}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="xs" variant="ghost" className="h-7 text-[10px]" onClick={() => toast({ title: "Détails Scénario", description: mission.description })}>
                                                        <Info className="w-3 h-3 mr-1"/> Détails
                                                    </Button>
                                                    <Button size="xs" className="h-7 text-[10px] bg-accent text-accent-foreground" asChild>
                                                        <Link href={`/report/${mission.id}?storeId=${store.id}`}><PlayCircle className="w-3 h-3 mr-1"/> Start</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             )}
                        </div>

                        {/* Standard Workflow Steps */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-secondary/20 p-4 rounded-lg space-y-3 border">
                                <h3 className="font-semibold flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4"/> 1. Documents</h3>
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" size="sm" className="justify-start text-xs h-8" asChild onClick={() => handleDocOpen(mission.id, 'briefing')}>
                                        <a href={mission.briefingUrl} download><Download className="w-4 h-4 mr-2"/> Briefing {docs.briefing && <CheckCircle className="ml-auto w-3 h-3 text-green-600"/>}</a>
                                    </Button>
                                    <Button variant="outline" size="sm" className="justify-start text-xs h-8" asChild onClick={() => handleDocOpen(mission.id, 'scenario')}>
                                        <a href={mission.scenarioUrl} download><Download className="w-4 h-4 mr-2"/> Scénario {docs.scenario && <CheckCircle className="ml-auto w-3 h-3 text-green-600"/>}</a>
                                    </Button>
                                    <Button variant="outline" size="sm" className="justify-start text-xs h-8" asChild onClick={() => handleDocOpen(mission.id, 'questionnaire')}>
                                        <a href={mission.questionnairePdfUrl} download><Download className="w-4 h-4 mr-2"/> Questionnaire {docs.questionnaire && <CheckCircle className="ml-auto w-3 h-3 text-green-600"/>}</a>
                                    </Button>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg border space-y-3 ${mission.knowledgeQuizPassed ? 'bg-green-50 border-green-200' : 'bg-accent/5 border-accent/20'}`}>
                                <h3 className="font-bold text-sm flex items-center gap-2"><HelpCircle className="w-4 h-4"/> 2. Validation</h3>
                                {mission.knowledgeQuizPassed ? (
                                    <div className="flex flex-col items-center justify-center h-full pb-4">
                                        <CheckCircle className="w-8 h-8 text-green-600 mb-2"/>
                                        <span className="text-xs font-bold text-green-700">Quiz Validé</span>
                                    </div>
                                ) : (
                                    <Button className="w-full bg-accent text-accent-foreground" size="sm" disabled={!allDocsOpened} onClick={() => setActiveQuiz(mission.id)}>Lancer le quiz</Button>
                                )}
                            </div>
                        </div>

                        {mission.knowledgeQuizPassed && (
                            <div className="space-y-4">
                                <Alert className={isWithinWindow ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
                                    <UserCheck className="h-4 w-4" />
                                    <AlertTitle>{isWithinWindow ? "Créneau Ouvert" : "Attente Heure Visite"}</AlertTitle>
                                    <AlertDescription className="text-xs">
                                        {isWithinWindow 
                                            ? "Vous pouvez maintenant remplir le questionnaire final." 
                                            : `Déblocage à ${format(subMinutes(new Date(mission.plannedDate), 30), 'HH:mm')}.`}
                                    </AlertDescription>
                                </Alert>
                                <Button asChild className="w-full h-12 text-lg" disabled={!isWithinWindow}>
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
