
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical, FileUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createMissionAction } from '@/app/actions/admin-actions';

export default function CreateMissionPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        businessName: '',
        description: '',
        deadline: '',
        reward: '',
        country: '',
        city: '',
        category: '',
        soughtProfile: '',
    });

    const [profileQuiz, setProfileQuiz] = useState([{ id: Date.now(), question: '', options: ['', '', ''] }]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addProfileQuestion = () => setProfileQuiz([...profileQuiz, { id: Date.now(), question: '', options: ['', '', ''] }]);
    const removeProfileQuestion = (id) => setProfileQuiz(profileQuiz.filter(q => q.id !== id));

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await createMissionAction({ 
                ...formData, 
                profileQuiz,
                briefingUrl: '#',
                scenarioUrl: '#',
                questionnairePdfUrl: '#',
                status: 'available',
                location: `${formData.city}`
            });

            if (result.success && result.missionId) {
                toast({ title: "Mission Créée", description: "Passez à la configuration du questionnaire final." });
                router.push(`/admin/missions/${result.missionId}/survey/create`);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erreur", description: error.message });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
             <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href="/admin/missions"><ArrowLeft className="w-4 h-4 mr-1" /> Retour</Link>
            </Button>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">Étape 1 : Création de la mission</CardTitle>
                    <CardDescription>Configurez les détails et les documents PDF obligatoires.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Client / Enseigne *</Label>
                                <Input name="businessName" value={formData.businessName} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-1">
                                <Label>Titre de la mission *</Label>
                                <Input name="title" value={formData.title} onChange={handleInputChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1"><Label>Pays</Label><Input name="country" value={formData.country} onChange={handleInputChange} required /></div>
                            <div className="space-y-1"><Label>Ville</Label><Input name="city" value={formData.city} onChange={handleInputChange} required /></div>
                            <div className="space-y-1">
                                <Label>Type Enseigne</Label>
                                <Select onValueChange={(v) => setFormData({...formData, category: v})}>
                                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Beauté">Beauté</SelectItem>
                                        <SelectItem value="Bricolage">Bricolage</SelectItem>
                                        <SelectItem value="Hotels">Hotels</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><Label>Date limite</Label><Input name="deadline" type="date" value={formData.deadline} onChange={handleInputChange} required /></div>
                            <div className="space-y-1"><Label>Récompense ($)</Label><Input name="reward" type="number" value={formData.reward} onChange={handleInputChange} required /></div>
                        </div>

                        <div className="space-y-4 border rounded-lg p-4 bg-secondary/10">
                            <h3 className="font-bold flex items-center gap-2"><FileUp className="w-4 h-4"/> Documents PDF (Upload)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1"><Label className="text-xs">Briefing PDF</Label><Input type="file" accept=".pdf" /></div>
                                <div className="space-y-1"><Label className="text-xs">Scénario PDF</Label><Input type="file" accept=".pdf" /></div>
                                <div className="space-y-1"><Label className="text-xs">Questionnaire PDF</Label><Input type="file" accept=".pdf" /></div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>Profil recherché</Label>
                            <Input name="soughtProfile" value={formData.soughtProfile} onChange={handleInputChange} placeholder="Ex: Femme 30-60 ans" required />
                        </div>

                        <div className="space-y-1">
                            <Label>Résumé de la visite</Label>
                            <Textarea name="description" value={formData.description} onChange={handleInputChange} required />
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2">Quiz de validation du profil (Drag & Drop activé)</h3>
                            {profileQuiz.map((q, idx) => (
                                <div key={q.id} className="bg-secondary/20 p-3 rounded mb-2 flex items-start gap-2">
                                    <GripVertical className="mt-3 text-muted-foreground cursor-move"/>
                                    <div className="flex-grow space-y-2">
                                        <div className="flex gap-2">
                                            <Input placeholder="Question" value={q.question} onChange={(e) => {
                                                const newQuiz = [...profileQuiz];
                                                newQuiz[idx].question = e.target.value;
                                                setProfileQuiz(newQuiz);
                                            }} />
                                            <Button variant="ghost" size="icon" onClick={() => removeProfileQuestion(q.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {q.options.map((opt, oIdx) => (
                                                <Input key={oIdx} placeholder={`Option ${oIdx+1}`} value={opt} onChange={(e) => {
                                                    const newQuiz = [...profileQuiz];
                                                    newQuiz[idx].options[oIdx] = e.target.value;
                                                    setProfileQuiz(newQuiz);
                                                }} className="text-xs h-8" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addProfileQuestion}><Plus className="w-4 h-4 mr-1"/> Ajouter question</Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-6">
                         <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Créer la Mission
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
