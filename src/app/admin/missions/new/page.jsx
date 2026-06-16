'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { 
    ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical, 
    FileUp, ListOrdered, TextCursorInput, CheckSquare, Info 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createMissionAction } from '@/app/actions/admin-actions';
import { cn } from "@/lib/utils";

const ITEM_TYPES = {
    TEXT: 'text',
    MULTIPLE_CHOICE: 'multiple_choice',
    CHECKBOXES: 'checkboxes',
};

const getIconForType = (type) => {
    switch(type) {
        case ITEM_TYPES.TEXT: return <TextCursorInput className="w-4 h-4 mr-1" />;
        case ITEM_TYPES.MULTIPLE_CHOICE: return <ListOrdered className="w-4 h-4 mr-1" />;
        case ITEM_TYPES.CHECKBOXES: return <CheckSquare className="w-4 h-4 mr-1" />;
        default: return null;
    }
};

const createNewItem = (type, id) => {
    const base = { id, type, text: '', description: '', isRequired: true };
    if (type === ITEM_TYPES.MULTIPLE_CHOICE || type === ITEM_TYPES.CHECKBOXES) {
        base.options = [
            { id: Date.now() + 1, text: 'Option 1' },
            { id: Date.now() + 2, text: 'Option 2' }
        ];
    }
    return base;
};

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

    const [profileQuiz, setProfileQuiz] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addItem = (type) => setProfileQuiz(prev => [...prev, createNewItem(type, Date.now())]);
    const removeItem = (id) => setProfileQuiz(prev => prev.filter(item => item.id !== id));
    
    const updateItem = (id, field, value) => {
        setProfileQuiz(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const updateItemOption = (itemId, optionId, value) => {
        setProfileQuiz(prev => prev.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    options: item.options.map(opt => opt.id === optionId ? { ...opt, text: value } : opt)
                };
            }
            return item;
        }));
    };

    const addItemOption = (itemId) => {
        setProfileQuiz(prev => prev.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    options: [...item.options, { id: Date.now(), text: '' }]
                };
            }
            return item;
        }));
    };

    const handleDragStart = (e, index) => e.dataTransfer.setData("itemIndex", index);
    const handleDrop = (e, index) => {
        const draggedIndex = parseInt(e.dataTransfer.getData("itemIndex"), 10);
        if (draggedIndex === index) return;
        const newItems = [...profileQuiz];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItem);
        setProfileQuiz(newItems);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        if (profileQuiz.length === 0) {
            toast({ variant: "destructive", title: "Quiz Vide", description: "Veuillez ajouter au moins une question de validation." });
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await createMissionAction({ 
                ...formData, 
                profileQuiz,
                status: 'available',
                location: `${formData.city}, ${formData.country}`
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

            <Card className="shadow-lg border-none ring-1 ring-border/50">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="text-xl font-bold text-primary">Étape 1 : Création de la mission</CardTitle>
                    <CardDescription>Configurez les détails et le quiz de validation du profil.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="p-6 space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Client / Enseigne *</Label>
                                <Input name="businessName" placeholder="Ex: Beauty Co." value={formData.businessName} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Titre de la mission *</Label>
                                <Input name="title" placeholder="Ex: Audit Accueil Boutique" value={formData.title} onChange={handleInputChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2"><Label>Pays</Label><Input name="country" value={formData.country} onChange={handleInputChange} required /></div>
                            <div className="space-y-2"><Label>Ville</Label><Input name="city" value={formData.city} onChange={handleInputChange} required /></div>
                            <div className="space-y-2">
                                <Label>Type Enseigne</Label>
                                <Select onValueChange={(v) => setFormData({...formData, category: v})}>
                                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Beauté">Beauté</SelectItem>
                                        <SelectItem value="Bricolage">Bricolage</SelectItem>
                                        <SelectItem value="Hotels">Hotels</SelectItem>
                                        <SelectItem value="Salles de sport">Salles de sport</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2"><Label>Date limite</Label><Input name="deadline" type="date" value={formData.deadline} onChange={handleInputChange} required /></div>
                            <div className="space-y-2"><Label>Récompense ($)</Label><Input name="reward" type="number" value={formData.reward} onChange={handleInputChange} required /></div>
                        </div>

                        <div className="space-y-4 border rounded-xl p-6 bg-secondary/10 border-dashed border-primary/20">
                            <h3 className="font-bold flex items-center gap-2 text-primary"><FileUp className="w-4 h-4"/> Documents PDF (Upload)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2"><Label className="text-xs">Briefing PDF</Label><Input type="file" accept=".pdf" className="bg-background"/></div>
                                <div className="space-y-2"><Label className="text-xs">Scénario PDF</Label><Input type="file" accept=".pdf" className="bg-background"/></div>
                                <div className="space-y-2"><Label className="text-xs">Questionnaire PDF</Label><Input type="file" accept=".pdf" className="bg-background"/></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Profil recherché</Label>
                            <Input name="soughtProfile" value={formData.soughtProfile} onChange={handleInputChange} placeholder="Ex: Femme 30-60 ans" required />
                        </div>

                        <div className="space-y-2">
                            <Label>Résumé de la visite</Label>
                            <Textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Détaillez le scénario ici..." required className="min-h-[120px]" />
                        </div>

                        {/* Flexible Quiz Builder */}
                        <div className="border-t pt-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                    <ListOrdered className="w-5 h-5" /> Quiz de validation du profil
                                </h3>
                                <Badge variant="secondary">{profileQuiz.length} questions</Badge>
                            </div>

                            <div className="space-y-4">
                                {profileQuiz.map((item, idx) => (
                                    <Card 
                                        key={item.id} 
                                        className="relative p-5 border bg-background shadow-sm hover:shadow-md transition-all group"
                                        draggable 
                                        onDragStart={(e) => handleDragStart(e, idx)} 
                                        onDrop={(e) => handleDrop(e, idx)} 
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <GripVertical className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground cursor-move h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="absolute right-2 top-2 h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={() => removeItem(item.id)}
                                            type="button"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>

                                        <div className="pl-6 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0">
                                                    {idx + 1}
                                                </Badge>
                                                <div className="flex-grow">
                                                    <Input 
                                                        placeholder="Votre question..." 
                                                        value={item.text} 
                                                        onChange={(e) => updateItem(item.id, 'text', e.target.value)}
                                                        className="font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0 text-md"
                                                    />
                                                </div>
                                            </div>

                                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                                                {getIconForType(item.type)} {item.type.replace('_', ' ')}
                                            </Badge>

                                            {/* Options for MC/Checkbox */}
                                            {(item.type === ITEM_TYPES.MULTIPLE_CHOICE || item.type === ITEM_TYPES.CHECKBOXES) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-9">
                                                    {item.options.map((opt, oIdx) => (
                                                        <div key={opt.id} className="flex items-center gap-2 group/opt">
                                                            <div className={cn(
                                                                "h-3 w-3 border border-muted-foreground/40",
                                                                item.type === ITEM_TYPES.MULTIPLE_CHOICE ? "rounded-full" : "rounded-sm"
                                                            )} />
                                                            <Input 
                                                                placeholder={`Option ${oIdx + 1}`} 
                                                                value={opt.text} 
                                                                onChange={(e) => updateItemOption(item.id, opt.id, e.target.value)}
                                                                className="h-8 text-sm"
                                                            />
                                                        </div>
                                                    ))}
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 justify-start text-primary text-xs" 
                                                        onClick={() => addItemOption(item.id)}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" /> Ajouter une option
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}

                                {profileQuiz.length === 0 && (
                                    <div className="text-center py-12 border-2 border-dashed rounded-xl bg-secondary/10">
                                        <p className="text-sm text-muted-foreground">Aucune question ajoutée pour le moment.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center pt-4">
                                <Button type="button" variant="outline" size="sm" onClick={() => addItem(ITEM_TYPES.TEXT)}>
                                    <TextCursorInput className="w-4 h-4 mr-2" /> Texte Libre
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addItem(ITEM_TYPES.MULTIPLE_CHOICE)}>
                                    <ListOrdered className="w-4 h-4 mr-2" /> Choix Unique
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addItem(ITEM_TYPES.CHECKBOXES)}>
                                    <CheckSquare className="w-4 h-4 mr-2" /> Choix Multiples
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end p-6 border-t bg-primary/5">
                         <Button type="submit" disabled={isSubmitting} size="lg" className="px-8 shadow-lg">
                            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                            Créer la Mission
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
