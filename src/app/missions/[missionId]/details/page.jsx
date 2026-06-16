
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, FileWarning, MapPin, Calendar, DollarSign, Users, Briefcase, Info, Send } from 'lucide-react';
import { mockMissions, mockUser } from '@/lib/mock-data';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

export default function MissionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const missionId = params.missionId;
    const [mission, setMission] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMission = async () => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 300));
            const foundMission = mockMissions.find(m => m.id === missionId);
            if (foundMission) {
                setMission(foundMission);
            } else {
                setError('Mission non trouvée.');
            }
            setIsLoading(false);
        };
        fetchMission();
    }, [missionId]);

    const handlePositioning = () => {
        if (mission.profileQuiz && mission.profileQuiz.length > 0) {
            setShowQuiz(true);
        } else {
            handleApply();
        }
    };

    const handleApply = async () => {
        setIsApplying(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
            title: "Candidature Envoyée",
            description: "Votre profil est en cours de validation par l'administrateur.",
        });
        router.push('/missions/assigned');
    };

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
    if (error || !mission) return <div className="container mx-auto p-8"><Alert variant="destructive"><AlertTitle>Erreur</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
             <Button asChild variant="outline" size="sm" className="mb-6">
                <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" /> Retour</Link>
            </Button>

            <Card className="shadow-lg">
                <CardHeader className="border-b pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-bold text-primary">{mission.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                                <Briefcase className="w-4 h-4" /> {mission.businessName} - {mission.category}
                            </CardDescription>
                        </div>
                        <div className="text-right">
                             <div className="text-2xl font-bold text-accent">{mission.reward} dhs</div>
                        </div>
                    </div>
                </CardHeader>
                 <CardContent className="pt-6 space-y-6">
                    {!showQuiz ? (
                        <>
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-1"><Users className="w-4 h-4 text-primary"/> Profil recherché</h3>
                                <p className="text-sm bg-secondary/30 p-3 rounded border">{mission.soughtProfile}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-1"><Info className="w-4 h-4 text-primary"/> Résumé de la visite</h3>
                                <p className="text-sm text-foreground/90">{mission.description}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> <strong>Lieu:</strong> {mission.location}</p>
                                <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> <strong>Limite:</strong> {format(mission.deadline, 'PPP')}</p>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg border-b pb-2">Quiz de Validation du Profil</h3>
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
                    {!showQuiz ? (
                        <Button onClick={handlePositioning} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            Je me positionne
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleApply} 
                            disabled={isApplying || Object.keys(quizAnswers).length < mission.profileQuiz.length} 
                            className="w-full"
                        >
                            {isApplying ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                            Valider mes réponses et postuler
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
