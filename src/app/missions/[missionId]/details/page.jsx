
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Loader2, ArrowLeft, MapPin, Calendar, Users, 
    Briefcase, Info, Send, Search, Navigation,
    CheckCircle2, Store, ClipboardCheck, ArrowRight,
    HelpCircle
} from 'lucide-react';
import { mockMissions, mockStores, mockUser } from '@/lib/mock-data';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { submitApplicationAction } from '@/app/actions/admin-actions';
import { cn } from "@/lib/utils";

const STEPS = [
    { id: 'details', label: 'Détails', icon: Info },
    { id: 'store', label: 'Magasins', icon: Store },
    { id: 'quiz', label: 'Profil', icon: ClipboardCheck },
];

export default function MissionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const missionId = params.missionId;
    
    const [mission, setMission] = useState(null);
    const [step, setStep] = useState('details'); 
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    
    const [selectedStoreIds, setSelectedStoreIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [quizAnswers, setQuizAnswers] = useState({});

    useEffect(() => {
        const found = mockMissions.find(m => String(m.id) === String(missionId));
        if (found) {
            setMission(found);
        }
        setIsLoading(false);
    }, [missionId]);

    const filteredStores = useMemo(() => {
        if (!mission) return [];
        let stores = mockStores.filter(s => String(s.mission_id) === String(missionId) && s.active);
        if (searchTerm) {
            stores = stores.filter(s => 
                s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return stores;
    }, [mission, searchTerm, missionId]);

    const toggleStoreSelection = (storeId) => {
        setSelectedStoreIds(prev => 
            prev.includes(storeId) 
            ? prev.filter(id => id !== storeId) 
            : [...prev, storeId]
        );
    };

    const handleApply = async () => {
        if (selectedStoreIds.length === 0) {
            toast({ variant: "destructive", title: "Erreur", description: "Veuillez sélectionner au moins un magasin." });
            return;
        }

        setIsApplying(true);
        try {
            const result = await submitApplicationAction({
                mission_id: missionId,
                user_id: mockUser.id,
                selectedStoreIds, // Sending an array of stores now
                quizAnswers
            });
            if (result.success) {
                toast({ title: "Candidature Envoyée !", description: "Votre profil est en cours de validation pour " + selectedStoreIds.length + " magasin(s).", variant: "default" });
                router.push('/missions/assigned');
            }
        } catch (e) {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer votre candidature." });
        } finally {
            setIsApplying(false);
        }
    };

    const handleQuizInputChange = (questionId, value) => {
        setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleCheckboxChange = (questionId, optionText, isChecked) => {
        setQuizAnswers(prev => {
            const current = prev[questionId] || [];
            if (isChecked) {
                return { ...prev, [questionId]: [...current, optionText] };
            } else {
                return { ...prev, [questionId]: current.filter(t => t !== optionText) };
            }
        });
    };

    const currentStepIndex = STEPS.findIndex(s => s.id === step);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
            <p className="text-muted-foreground animate-pulse">Chargement...</p>
        </div>
    );
    
    if (!mission) return (
        <div className="container mx-auto py-20 text-center">
            <h2 className="text-2xl font-bold">Mission non trouvée</h2>
            <Button variant="outline" className="mt-6" asChild><Link href="/">Retour</Link></Button>
        </div>
    );

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" size="sm" onClick={() => {
                    if (step === 'details') router.push('/');
                    else if (step === 'store') setStep('details');
                    else if (step === 'quiz') setStep('store');
                }}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> 
                    {step === 'details' ? 'Missions' : 'Précédent'}
                </Button>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{mission.category}</Badge>
            </div>

            <div className="mb-10 px-4">
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10 -translate-y-1/2" />
                    <div className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500" 
                         style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}/>
                    {STEPS.map((s, idx) => (
                        <div key={s.id} className="flex flex-col items-center gap-2">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background",
                                step === s.id || idx < currentStepIndex ? "bg-primary border-primary text-white" : "border-muted text-muted-foreground"
                            )}>
                                {idx < currentStepIndex ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                            </div>
                            <span className={cn("text-xs font-semibold", step === s.id ? "text-primary" : "text-muted-foreground")}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="shadow-xl border-none ring-1 ring-border/50 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="text-2xl font-extrabold text-primary">{mission.title}</CardTitle>
                    <CardDescription className="font-medium">{mission.businessName}</CardDescription>
                </CardHeader>

                <CardContent className="p-8">
                    {step === 'details' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5"><Users className="w-5 h-5"/></div>
                                        <div><h3 className="font-bold">Profil</h3><p className="text-sm text-muted-foreground">{mission.soughtProfile || "Tout profil"}</p></div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5"><MapPin className="w-5 h-5"/></div>
                                        <div><h3 className="font-bold">Lieu</h3><p className="text-sm text-muted-foreground">{mission.location}</p></div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5"><Navigation className="w-5 h-5"/></div>
                                        <div><h3 className="font-bold">Récompense</h3><p className="text-lg font-black text-primary">{mission.reward} dhs</p></div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5"><Calendar className="w-5 h-5"/></div>
                                        <div><h3 className="font-bold">Date limite</h3><p className="text-sm text-muted-foreground">{format(new Date(mission.deadline), 'PP')}</p></div>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <h3 className="font-bold flex items-center gap-2"><Info className="w-4 h-4 text-primary"/> Résumé</h3>
                                <p className="text-sm text-muted-foreground bg-secondary/30 p-5 rounded-xl border italic">"{mission.description}"</p>
                            </div>
                        </div>
                    )}

                    {step === 'store' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-primary flex items-center gap-2"><Store className="w-6 h-6" /> Sélectionnez vos magasins</h3>
                                <Badge variant="secondary">{selectedStoreIds.length} sélectionné(s)</Badge>
                            </div>
                            <Input placeholder="Rechercher une ville..." className="pl-4 h-11" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredStores.length > 0 ? filteredStores.map(store => {
                                    const isSelected = selectedStoreIds.includes(store.id);
                                    return (
                                        <div key={store.id} onClick={() => toggleStoreSelection(store.id)}
                                            className={cn("p-4 border rounded-xl cursor-pointer flex items-center justify-between group transition-all",
                                                isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary/50 border-border/60')}>
                                            <div className="flex items-center gap-4">
                                                <Checkbox checked={isSelected} className="rounded-full" onCheckedChange={() => toggleStoreSelection(store.id)} />
                                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", isSelected ? "bg-primary text-white" : "bg-muted")}>
                                                    <Store className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold">{store.name}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {store.city}</div>
                                                </div>
                                            </div>
                                            {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                        </div>
                                    );
                                }) : <p className="text-center text-muted-foreground py-12">Aucun magasin trouvé.</p>}
                            </div>
                        </div>
                    )}

                    {step === 'quiz' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-xl font-bold text-primary flex items-center gap-2"><ClipboardCheck className="w-6 h-6" /> Quiz de qualification</h3>
                            <div className="space-y-8">
                                {mission.profileQuiz?.map((q, idx) => (
                                    <div key={q.id} className="space-y-4 p-6 bg-secondary/20 rounded-2xl border border-border/50">
                                        <div className="flex items-start gap-3">
                                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold shrink-0 mt-0.5">{idx + 1}</span>
                                            <Label className="text-md font-bold leading-tight">{q.text}</Label>
                                        </div>
                                        
                                        <div className="pl-10">
                                            {q.type === 'text' && (
                                                <Input 
                                                    placeholder="Votre réponse..." 
                                                    value={quizAnswers[q.id] || ''} 
                                                    onChange={(e) => handleQuizInputChange(q.id, e.target.value)}
                                                    className="bg-background"
                                                />
                                            )}

                                            {q.type === 'multiple_choice' && (
                                                <RadioGroup onValueChange={(val) => handleQuizInputChange(q.id, val)} className="space-y-2">
                                                    {q.options?.map((opt) => (
                                                        <div key={opt.id} className="flex items-center space-x-3 bg-background p-3 rounded-lg border border-border/50 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => handleQuizInputChange(q.id, opt.text)}>
                                                            <RadioGroupItem value={opt.text} id={`${q.id}-${opt.id}`} checked={quizAnswers[q.id] === opt.text} />
                                                            <Label htmlFor={`${q.id}-${opt.id}`} className="cursor-pointer flex-grow font-medium">{opt.text}</Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            )}

                                            {q.type === 'checkboxes' && (
                                                <div className="space-y-2">
                                                    {q.options?.map((opt) => {
                                                        const isChecked = (quizAnswers[q.id] || []).includes(opt.text);
                                                        return (
                                                            <div key={opt.id} className="flex items-center space-x-3 bg-background p-3 rounded-lg border border-border/50 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => handleCheckboxChange(q.id, opt.text, !isChecked)}>
                                                                <Checkbox id={`${q.id}-${opt.id}`} checked={isChecked} onCheckedChange={(checked) => handleCheckboxChange(q.id, opt.text, checked)} />
                                                                <Label htmlFor={`${q.id}-${opt.id}`} className="cursor-pointer flex-grow font-medium">{opt.text}</Label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="bg-secondary/10 p-8 border-t border-border/50">
                    {step === 'details' && (
                        <Button onClick={() => setStep('store')} className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg">
                            Se positionner <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    )}
                    {step === 'store' && (
                        <div className="flex gap-4 w-full">
                            <Button variant="outline" onClick={() => setStep('details')} className="h-12 flex-1">Retour</Button>
                            <Button onClick={() => setStep('quiz')} disabled={selectedStoreIds.length === 0} className="h-12 flex-[2] text-lg font-bold shadow-lg">Continuer ({selectedStoreIds.length} magasins)</Button>
                        </div>
                    )}
                    {step === 'quiz' && (
                        <div className="flex gap-4 w-full">
                            <Button variant="outline" onClick={() => setStep('store')} className="h-12 flex-1">Retour</Button>
                            <Button onClick={handleApply} disabled={isApplying || Object.keys(quizAnswers).length < (mission.profileQuiz?.length || 0)} className="h-12 flex-[2] text-lg font-bold bg-primary shadow-lg">
                                {isApplying ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Send className="mr-2 h-5 w-5" />}
                                Envoyer ma candidature
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
