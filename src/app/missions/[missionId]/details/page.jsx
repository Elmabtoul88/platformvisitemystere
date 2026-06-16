
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
    Loader2, ArrowLeft, MapPin, Calendar, Users, 
    Briefcase, Info, Send, Search, Navigation,
    CheckCircle2, Store, ClipboardCheck, ArrowRight
} from 'lucide-react';
import { mockMissions, mockStores, mockUser } from '@/lib/mock-data';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { submitApplicationAction } from '@/app/actions/admin-actions';
import { cn } from "@/lib/utils";

const STEPS = [
    { id: 'details', label: 'Détails', icon: Info },
    { id: 'store', label: 'Magasin', icon: Store },
    { id: 'quiz', label: 'Profil', icon: ClipboardCheck },
];

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
    
    // Quiz State
    const [quizAnswers, setQuizAnswers] = useState({});

    useEffect(() => {
        const found = mockMissions.find(m => m.id === missionId);
        if (found) {
            setMission(found);
        }
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
                toast({ 
                    title: "Candidature Envoyée !", 
                    description: "Votre profil est en cours de validation par nos administrateurs.",
                    variant: "default" 
                });
                router.push('/missions/assigned');
            }
        } catch (e) {
            toast({ 
                variant: "destructive", 
                title: "Erreur", 
                description: "Une erreur est survenue lors de l'envoi de votre candidature." 
            });
        } finally {
            setIsApplying(false);
        }
    };

    const currentStepIndex = STEPS.findIndex(s => s.id === step);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
            <p className="text-muted-foreground animate-pulse">Chargement de la mission...</p>
        </div>
    );
    
    if (!mission) return (
        <div className="container mx-auto py-20 text-center">
            <div className="bg-destructive/10 text-destructive p-6 rounded-lg inline-block mb-4">
                <Info className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold">Mission non trouvée</h2>
            <p className="text-muted-foreground mt-2">Cette mission n'existe plus ou a été archivée.</p>
            <Button variant="outline" className="mt-6" asChild>
                <Link href="/">Retour aux missions</Link>
            </Button>
        </div>
    );

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between mb-8">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => {
                        if (step === 'details') router.push('/');
                        else if (step === 'store') setStep('details');
                        else if (step === 'quiz') setStep('store');
                    }}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> 
                    {step === 'details' ? 'Retour aux missions' : 'Étape précédente'}
                </Button>
                
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1">
                    {mission.category}
                </Badge>
            </div>

            {/* Stepper Visualizer */}
            <div className="mb-10 px-4">
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10 -translate-y-1/2" />
                    <div 
                        className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500" 
                        style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                    />
                    
                    {STEPS.map((s, idx) => {
                        const Icon = s.icon;
                        const isActive = step === s.id;
                        const isCompleted = idx < currentStepIndex;
                        
                        return (
                            <div key={s.id} className="flex flex-col items-center gap-2">
                                <div 
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm",
                                        isActive ? "bg-primary border-primary text-white scale-110" : 
                                        isCompleted ? "bg-primary border-primary text-white" : 
                                        "bg-background border-muted text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={cn(
                                    "text-xs font-semibold transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="shadow-xl border-none ring-1 ring-border/50 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-extrabold tracking-tight text-primary">
                            {mission.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-md font-medium">
                            <Briefcase className="h-4 w-4" /> {mission.businessName}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="p-8">
                    {/* STEP 1: DETAILS */}
                    {step === 'details' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                                            <Users className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">Profil recherché</h3>
                                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                                {mission.soughtProfile || "Tout profil actif"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                                            <MapPin className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">Localisation</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {mission.location}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                                            <Navigation className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">Récompense</h3>
                                            <p className="text-lg font-black text-primary mt-1">
                                                {mission.reward} <span className="text-sm font-medium">dhs</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                                            <Calendar className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">Date limite</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {format(new Date(mission.deadline), 'PP')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="space-y-3">
                                <h3 className="font-bold text-foreground flex items-center gap-2">
                                    <Info className="w-4 h-4 text-primary"/> Résumé de la visite
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground bg-secondary/30 p-5 rounded-xl border border-border/50 italic">
                                    "{mission.description}"
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: STORE SELECTION */}
                    {step === 'store' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                                    <Store className="w-6 h-6" /> Sélectionnez un point de vente
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Choisissez le magasin où vous souhaitez effectuer la visite mystère.
                                </p>
                            </div>

                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input 
                                    placeholder="Filtrer par ville ou nom d'enseigne..." 
                                    className="pl-10 h-11 bg-background border-border/60 focus:ring-primary/20" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredStores.length > 0 ? (
                                    filteredStores.map(store => (
                                        <div 
                                            key={store.id}
                                            onClick={() => setSelectedStoreId(store.id)}
                                            className={cn(
                                                "p-4 border rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between group",
                                                selectedStoreId === store.id 
                                                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' 
                                                    : 'hover:border-primary/40 hover:bg-secondary/50 border-border/60'
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                                    selectedStoreId === store.id ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                                                )}>
                                                    <Store className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground">{store.name}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <MapPin className="h-3 w-3" /> {store.address}, {store.city}
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedStoreId === store.id && (
                                                <CheckCircle2 className="w-5 h-5 text-primary animate-in zoom-in-50 duration-300" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-secondary/20 rounded-2xl border-2 border-dashed border-border/60">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <Search className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">Aucun magasin ne correspond à votre recherche.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PROFILE QUIZ */}
                    {step === 'quiz' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                                    <ClipboardCheck className="w-6 h-6" /> Quiz de qualification
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Veuillez répondre à ces quelques questions pour nous aider à valider votre profil.
                                </p>
                            </div>

                            <div className="space-y-8">
                                {mission.profileQuiz.map((q, idx) => (
                                    <div key={q.id} className="space-y-4 p-6 bg-secondary/20 rounded-2xl border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xs font-bold shrink-0">
                                                {idx + 1}
                                            </span>
                                            <Label className="text-lg font-bold text-foreground">{q.question}</Label>
                                        </div>
                                        <RadioGroup 
                                            onValueChange={(val) => setQuizAnswers({...quizAnswers, [q.id]: val})}
                                            className="grid gap-3 pl-11"
                                        >
                                            {q.options.map((opt) => (
                                                <div key={opt} className="flex items-center">
                                                    <div className="relative flex items-center group w-full">
                                                        <RadioGroupItem value={opt} id={`${q.id}-${opt}`} className="sr-only peer" />
                                                        <Label 
                                                            htmlFor={`${q.id}-${opt}`} 
                                                            className={cn(
                                                                "flex-grow cursor-pointer p-4 rounded-xl border transition-all duration-200 select-none",
                                                                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:font-bold peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary",
                                                                "hover:bg-background border-border/60"
                                                            )}
                                                        >
                                                            {opt}
                                                        </Label>
                                                        <div className="absolute right-4 opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity">
                                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="bg-secondary/10 p-8 border-t border-border/50">
                    {step === 'details' && (
                        <Button 
                            onClick={() => setStep('store')} 
                            className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg group"
                        >
                            Commencer le positionnement
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    )}
                    
                    {step === 'store' && (
                        <div className="flex gap-4 w-full">
                            <Button 
                                variant="outline" 
                                onClick={() => setStep('details')}
                                className="h-12 flex-1"
                            >
                                Retour
                            </Button>
                            <Button 
                                onClick={() => setStep('quiz')} 
                                disabled={!selectedStoreId} 
                                className="h-12 flex-[2] text-lg font-bold shadow-lg"
                            >
                                Valider le magasin
                            </Button>
                        </div>
                    )}
                    
                    {step === 'quiz' && (
                        <div className="flex gap-4 w-full">
                            <Button 
                                variant="outline" 
                                onClick={() => setStep('store')}
                                className="h-12 flex-1"
                            >
                                Retour
                            </Button>
                            <Button 
                                onClick={handleApply} 
                                disabled={isApplying || Object.keys(quizAnswers).length < mission.profileQuiz.length}
                                className="h-12 flex-[2] text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg"
                            >
                                {isApplying ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-5 w-5" /> 
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-5 w-5" />
                                        Envoyer ma candidature
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>

            {/* Bottom Help/Tips */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 flex gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-primary">Note :</strong> Les documents de briefing et scénario ne seront accessibles qu'après validation de votre candidature par l'administrateur.
                    </p>
                </div>
                <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-accent-foreground">Astuce :</strong> Plus vos réponses au quiz de profil sont précises, plus vous avez de chances d'être retenu(e) pour cette mission.
                    </p>
                </div>
            </div>
        </div>
    );
}
