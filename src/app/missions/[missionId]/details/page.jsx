
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
    Loader2, ArrowLeft, MapPin, Calendar, Users, 
    Briefcase, Info, Send, Search, Navigation 
} from 'lucide-react';
import { mockMissions, mockStores, mockUser } from '@/lib/mock-data';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { submitApplicationAction } from '@/app/actions/admin-actions';

export default function MissionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const missionId = params.missionId;
    
    const [mission, setMission] = useState(null);
    const [step, setStep] = useState('details'); // 'details' | 'store' | 'quiz'
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    
    // Store Selection State
    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    
    // Quiz State
    const [quizAnswers, setQuizAnswers] = useState({});

    useEffect(() => {
        const found = mockMissions.find(m => m.id === missionId);
        if (found) setMission(found);
        setIsLoading(false);
    }, [missionId]);

    const filteredStores = useMemo(() => {
        if (!mission) return [];
        let stores = mockStores.filter(s => s.mission_id === missionId && s.active);
        
        if (searchTerm) {
            stores = stores.filter(s => 
                s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return stores;
    }, [mission, searchTerm]);

    const handleApply = async () => {
        setIsApplying(true);
        try {
            const result = await submitApplicationAction({
                mission_id: missionId,
                user_id: mockUser.id,
                selectedStoreId,
                quizAnswers
            });
            if (result.success) {
                toast({ title: "Candidature Envoyée", description: "Votre profil est en cours de validation." });
                router.push('/missions/assigned');
            }
        } catch (e) {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer la candidature." });
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
    if (!mission) return <div className="p-8 text-center">Mission non trouvée.</div>;

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Button variant="outline" size="sm" className="mb-6" onClick={() => step === 'details' ? router.push('/') : setStep(step === 'quiz' ? 'store' : 'details')}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Retour
            </Button>

            <Card className="shadow-lg">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl font-bold text-primary">{mission.title}</CardTitle>
                    <CardDescription>{mission.businessName} - {mission.category}</CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                    {step === 'details' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold flex items-center gap-1 mb-2"><Users className="w-4 h-4"/> Profil recherché</h3>
                                <p className="text-sm bg-secondary/20 p-3 rounded">{mission.soughtProfile}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold flex items-center gap-1 mb-2"><Info className="w-4 h-4"/> Résumé</h3>
                                <p className="text-sm">{mission.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {mission.location}</div>
                                <div className="flex items-center gap-2 text-accent font-bold"><Navigation className="w-4 h-4"/> {mission.reward} dhs</div>
                            </div>
                        </div>
                    )}

                    {step === 'store' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg">Choisir un magasin</h3>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Rechercher par ville ou nom..." 
                                    className="pl-8" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {filteredStores.map(store => (
                                    <div 
                                        key={store.id}
                                        onClick={() => setSelectedStoreId(store.id)}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedStoreId === store.id ? 'border-primary bg-primary/5' : 'hover:bg-secondary/50'}`}
                                    >
                                        <div className="font-bold">{store.name}</div>
                                        <div className="text-xs text-muted-foreground">{store.address}, {store.city}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'quiz' && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg">Quiz de profil</h3>
                            {mission.profileQuiz.map((q) => (
                                <div key={q.id} className="space-y-3">
                                    <Label className="text-md font-medium">{q.question}</Label>
                                    <RadioGroup onValueChange={(val) => setQuizAnswers({...quizAnswers, [q.id]: val})}>
                                        {q.options.map((opt) => (
                                            <div key={opt} className="flex items-center space-x-2">
                                                <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                                                <Label htmlFor={`${q.id}-${opt}`} className="font-normal">{opt}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="border-t pt-6">
                    {step === 'details' && <Button onClick={() => setStep('store')} className="w-full bg-accent text-accent-foreground">Continuer</Button>}
                    {step === 'store' && <Button onClick={() => setStep('quiz')} disabled={!selectedStoreId} className="w-full">Valider le magasin</Button>}
                    {step === 'quiz' && (
                        <Button 
                            onClick={handleApply} 
                            disabled={isApplying || Object.keys(quizAnswers).length < mission.profileQuiz.length}
                            className="w-full"
                        >
                            {isApplying ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                            Envoyer ma candidature
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
