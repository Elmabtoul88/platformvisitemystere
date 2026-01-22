'use client';

import React, { useState, useEffect } from 'react';
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
    ArrowLeft, Save, PlusCircle, Trash2, GripVertical, Loader2,
    ListOrdered, TextCursorInput, CheckSquare, Star, Circle,
    Image as ImageIcon, MapPin, Mic, Columns // Added Columns for section header
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { saveSurvey } from '../../../../../actions/survey-actions.js';

// Item type definitions including new section header
const ITEM_TYPES = {
    SECTION_HEADER: 'section_header',
    TEXT: 'text',
    MULTIPLE_CHOICE: 'multiple_choice',
    CHECKBOXES: 'checkboxes',
    RATING: 'rating',
    IMAGE_UPLOAD: 'image_upload',
    GPS_CAPTURE: 'gps_capture',
    AUDIO_RECORDING: 'audio_recording',
};

// Function to get icon based on type
const getIconForType = (type) => {
    switch(type) {
        case ITEM_TYPES.TEXT: return <TextCursorInput className="w-4 h-4 mr-1" />;
        case ITEM_TYPES.MULTIPLE_CHOICE: return <ListOrdered className="w-4 h-4 mr-1" />;
        case ITEM_TYPES.CHECKBOXES: return <CheckSquare className="w-4 h-4 mr-1" />;
        case ITEM_TYPES.RATING: return <Star className="w-4 h-4 mr-1" />;
        case ITEM_TYPES.IMAGE_UPLOAD: return <ImageIcon className="w-4 h-4 mr-1" />;
        case ITEM_TYPES.GPS_CAPTURE: return <MapPin className="w-4 h-4 mr-1" />;
        case ITEM_TYPES.AUDIO_RECORDING: return <Mic className="w-4 h-4 mr-1" />;
        case ITEM_TYPES.SECTION_HEADER: return <Columns className="w-4 h-4 mr-1" />;
        default: return null;
    }
};


// Initial empty item structure based on type
const createNewItem = (type, id) => {
    if (type === ITEM_TYPES.SECTION_HEADER) {
        return { id, type, title: '' };
    }

    const base = { id, type, text: '', description: '', isRequired: false };
    if (type === ITEM_TYPES.MULTIPLE_CHOICE || type === ITEM_TYPES.CHECKBOXES) {
        base.options = [{ id: Date.now(), text: '' }];
    }
    if (type === ITEM_TYPES.RATING) {
         base.maxRating = 5;
         base.minLabel = 'Poor';
         base.maxLabel = 'Excellent';
    }
    if (type === ITEM_TYPES.IMAGE_UPLOAD) {
        base.maxImages = 5;
        base.allowMultiple = true;
    }
    if (type === ITEM_TYPES.GPS_CAPTURE) {
        // No specific config needed initially
    }
    if (type === ITEM_TYPES.AUDIO_RECORDING) {
        base.maxDurationSeconds = 60;
    }
    return base;
};

export default function CreateSurveyPage() {
    const router = useRouter();
    const params = useParams();
    const missionId = params.missionId;
    const { toast } = useToast();
    const [items, setItems] = useState([]); // Changed from questions to items
    const [isSaving, setIsSaving] = useState(false);
    const [missionTitle, setMissionTitle] = useState('Loading...');

    useEffect(() => {
        console.log("Fetching details for mission:", missionId);
        setTimeout(() => {
            setMissionTitle(`Survey for Mission ${missionId}`);
        }, 500);
    }, [missionId]);

    const addItem = (type) => {
        setItems(prev => [...prev, createNewItem(type, Date.now())]);
    };

    const removeItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateItem = (id, field, value) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleNumericInputChange = (itemId, field, rawValue) => {
        const parsedValue = parseInt(rawValue, 10);
        if (rawValue === '') {
            updateItem(itemId, field, '');
        } else if (!isNaN(parsedValue)) {
             updateItem(itemId, field, parsedValue);
        }
    };


    const updateItemOption = (itemId, optionId, value) => {
        setItems(prev => prev.map(item => {
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
        setItems(prev => prev.map(item => {
            if (item.id === itemId && (item.type === ITEM_TYPES.MULTIPLE_CHOICE || item.type === ITEM_TYPES.CHECKBOXES)) {
                return {
                    ...item,
                    options: [...item.options, { id: Date.now(), text: '' }]
                };
            }
            return item;
        }));
    };

     const removeItemOption = (itemId, optionId) => {
        setItems(prev => prev.map(item => {
            if (item.id === itemId && item.options.length > 1) {
                return {
                    ...item,
                    options: item.options.filter(opt => opt.id !== optionId)
                };
            }
            return item;
        }));
    };

     const handleSaveSurvey = async () => {
        setIsSaving(true);
        const questions = items.filter(i => i.type !== ITEM_TYPES.SECTION_HEADER);

        const hasEmptyQuestions = questions.some(q => !q.text.trim());
        const hasEmptyOptions = questions.some(q =>
            (q.type === ITEM_TYPES.MULTIPLE_CHOICE || q.type === ITEM_TYPES.CHECKBOXES) &&
            q.options.some(opt => !opt.text.trim())
        );
        const hasInvalidNumeric = questions.some(q =>
              (q.type === ITEM_TYPES.IMAGE_UPLOAD && q.maxImages === '') ||
              (q.type === ITEM_TYPES.AUDIO_RECORDING && q.maxDurationSeconds === '')
        );

        if (items.length === 0) {
            toast({ variant: "destructive", title: "Survey Empty", description: "Please add at least one question or section." });
             setIsSaving(false);
             return;
         }

        if (hasEmptyQuestions || hasEmptyOptions || hasInvalidNumeric) {
             toast({ variant: "destructive", title: "Incomplete or Invalid Items", description: "Please fill in all required texts, titles, option labels, and valid numeric values before saving." });
             setIsSaving(false);
             return;
         }

        const sanitizedItems = items.map(item => {
            const sanitized = { ...item };
            if (sanitized.type === ITEM_TYPES.IMAGE_UPLOAD) sanitized.maxImages = parseInt(sanitized.maxImages, 10) || 1;
            if (sanitized.type === ITEM_TYPES.AUDIO_RECORDING) sanitized.maxDurationSeconds = parseInt(sanitized.maxDurationSeconds, 10) || 5;
            if (sanitized.type === ITEM_TYPES.RATING) sanitized.maxRating = parseInt(sanitized.maxRating, 10) || 5;
            return sanitized;
         });

        console.log("Saving survey (simulated):", { missionId, items: sanitizedItems });

        try {
             const result = await saveSurvey(missionId, sanitizedItems);
             if (result.success) {
                toast({ title: "Survey Saved Successfully", description: `Survey for mission ${missionId} has been saved.` });
                router.push('/admin/missions');
             } else {
                 throw new Error(result.message || "Failed to save survey");
             }
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to Save Survey", description: error.message || "An error occurred. Please try again." });
            setIsSaving(false);
        }
    };

     const handleDragStart = (e, index) => e.dataTransfer.setData("itemIndex", index);

     const handleDrop = (e, index) => {
         const draggedIndex = parseInt(e.dataTransfer.getData("itemIndex"), 10);
         if (draggedIndex === index) return;

         const newItems = [...items];
         const [draggedItem] = newItems.splice(draggedIndex, 1);
         newItems.splice(index, 0, draggedItem);
         setItems(newItems);
     };

     const handleDragOver = (e) => e.preventDefault();

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
             <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href="/admin/missions">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions
                </Link>
            </Button>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">Step 2: Create Survey</CardTitle>
                    <CardDescription>Build the survey items for: <span className="font-medium">{missionTitle}</span></CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {items.length === 0 && (
                        <p className="text-center text-muted-foreground py-6">No items added yet. Add sections or questions using the buttons below.</p>
                    )}
                    {items.map((item, index) => {
                        if (item.type === ITEM_TYPES.SECTION_HEADER) {
                             return (
                                <Card
                                    key={item.id}
                                    className="p-4 border-2 border-dashed border-primary/50 bg-primary/5 relative"
                                    draggable onDragStart={(e) => handleDragStart(e, index)} onDrop={(e) => handleDrop(e, index)} onDragOver={handleDragOver}
                                >
                                    <GripVertical className="absolute left-1 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-move h-5 w-5" />
                                    <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="pl-6 space-y-2">
                                        <Label htmlFor={`item-title-${item.id}`} className="font-semibold text-primary">Section Header</Label>
                                        <Input
                                            id={`item-title-${item.id}`}
                                            placeholder="Enter the section title (e.g., 'Ambiance', 'Service Quality')"
                                            value={item.title}
                                            onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                                            className="text-lg font-bold"
                                        />
                                    </div>
                                </Card>
                            );
                        }

                        // It's a question
                        const question = item;
                        const questionNumber = items.filter(i => i.type !== ITEM_TYPES.SECTION_HEADER).findIndex(i => i.id === question.id) + 1;

                        return (
                            <Card
                                key={question.id}
                                className="p-4 border bg-card shadow-sm relative"
                                draggable onDragStart={(e) => handleDragStart(e, index)} onDrop={(e) => handleDrop(e, index)} onDragOver={handleDragOver}
                            >
                                <GripVertical className="absolute left-1 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-move h-5 w-5" />
                                <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(question.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <div className="pl-6 space-y-3">
                                    <div className="space-y-1">
                                        <Label htmlFor={`q-text-${question.id}`}>Question {questionNumber}</Label>
                                        <Input
                                            id={`q-text-${question.id}`}
                                            placeholder="Enter your question or instructions"
                                            value={question.text}
                                            onChange={(e) => updateItem(question.id, 'text', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor={`q-desc-${question.id}`} className="text-xs text-muted-foreground">Explanatory Text (Optional)</Label>
                                        <Textarea
                                            id={`q-desc-${question.id}`}
                                            placeholder="Provide additional details or context for the shopper..."
                                            rows={2}
                                            value={question.description || ''}
                                            onChange={(e) => updateItem(question.id, 'description', e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>

                                    <Badge variant="secondary" className="capitalize">
                                        {getIconForType(question.type)}
                                        {question.type.replace(/_/g, ' ')} Question
                                    </Badge>

                                    {(question.type === ITEM_TYPES.MULTIPLE_CHOICE || question.type === ITEM_TYPES.CHECKBOXES) && (
                                        <div className="space-y-2 pl-4 border-l ml-2">
                                            <Label className="text-sm font-medium">Options</Label>
                                            {question.options.map((opt, optIndex) => (
                                                <div key={opt.id} className="flex items-center gap-2">
                                                    {question.type === ITEM_TYPES.MULTIPLE_CHOICE && <Circle className="h-4 w-4 text-muted-foreground opacity-50"/> }
                                                    {question.type === ITEM_TYPES.CHECKBOXES && <Checkbox checked={false} disabled className="opacity-50"/>}
                                                    <Input
                                                        placeholder={`Option ${optIndex + 1}`}
                                                        value={opt.text}
                                                        onChange={(e) => updateItemOption(question.id, opt.id, e.target.value)}
                                                        className="flex-grow h-8"
                                                    />
                                                    {question.options.length > 1 && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItemOption(question.id, opt.id)} type="button">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button type="button" variant="outline" size="sm" onClick={() => addItemOption(question.id)}>
                                                <PlusCircle className="w-4 h-4 mr-1" /> Add Option
                                            </Button>
                                        </div>
                                    )}

                                    {question.type === ITEM_TYPES.RATING && (
                                        <div className="space-y-3 pl-4 border-l ml-2">
                                            <Label className="text-sm font-medium">Rating Scale</Label>
                                            <div className="flex items-center gap-2">
                                                {[...Array(10)].map((_, num) => (
                                                    <Button key={num + 1} type="button" variant={(num + 1) <= question.maxRating ? 'default' : 'outline'} size="icon" className={`h-7 w-7 opacity-50 ${(num + 1) <= question.maxRating ? 'bg-accent text-accent-foreground border-accent' : ''}`} disabled>
                                                        <Star className="w-4 h-4"/>
                                                    </Button>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 items-center">
                                                <Label htmlFor={`q-rating-max-${question.id}`} className="text-xs col-span-1">Max Rating:</Label>
                                                <Select value={String(question.maxRating)} onValueChange={(val) => updateItem(question.id, 'maxRating', parseInt(val, 10))}>
                                                    <SelectTrigger id={`q-rating-max-${question.id}`} className="h-8 text-xs col-span-2"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {[...Array(8)].map((_, i) => <SelectItem key={i+3} value={String(i+3)}>{i+3} Stars</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 items-center">
                                                <Label htmlFor={`q-rating-minlabel-${question.id}`} className="text-xs col-span-1">Min Label:</Label>
                                                <Input id={`q-rating-minlabel-${question.id}`} value={question.minLabel} onChange={(e) => updateItem(question.id, 'minLabel', e.target.value)} className="h-8 text-xs col-span-2" placeholder="e.g., Poor" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 items-center">
                                                <Label htmlFor={`q-rating-maxlabel-${question.id}`} className="text-xs col-span-1">Max Label:</Label>
                                                <Input id={`q-rating-maxlabel-${question.id}`} value={question.maxLabel} onChange={(e) => updateItem(question.id, 'maxLabel', e.target.value)} className="h-8 text-xs col-span-2" placeholder="e.g., Excellent" />
                                            </div>
                                        </div>
                                    )}

                                    {question.type === ITEM_TYPES.IMAGE_UPLOAD && (
                                        <div className="space-y-3 pl-4 border-l ml-2">
                                            <Label className="text-sm font-medium">Image Upload Options</Label>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id={`q-img-multiple-${question.id}`} checked={question.allowMultiple} onCheckedChange={(checked) => updateItem(question.id, 'allowMultiple', checked)} />
                                                <Label htmlFor={`q-img-multiple-${question.id}`} className="text-xs">Allow Multiple Images</Label>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 items-center">
                                                <Label htmlFor={`q-img-max-${question.id}`} className="text-xs col-span-1">Max Images:</Label>
                                                <Input id={`q-img-max-${question.id}`} type="number" min="1" max="10" value={question.maxImages || ''} onChange={(e) => handleNumericInputChange(question.id, 'maxImages', e.target.value)} className="h-8 text-xs col-span-2" disabled={!question.allowMultiple} />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Shopper will be prompted to upload photos.</p>
                                        </div>
                                    )}

                                    {question.type === ITEM_TYPES.GPS_CAPTURE && (
                                        <div className="pl-4 border-l ml-2">
                                            <p className="text-xs text-muted-foreground">Shopper will be prompted to capture their current location.</p>
                                        </div>
                                    )}

                                    {question.type === ITEM_TYPES.AUDIO_RECORDING && (
                                        <div className="space-y-3 pl-4 border-l ml-2">
                                            <Label className="text-sm font-medium">Audio Recording Options</Label>
                                            <div className="grid grid-cols-3 gap-2 items-center">
                                                <Label htmlFor={`q-audio-max-${question.id}`} className="text-xs col-span-1">Max Duration (sec):</Label>
                                                <Input id={`q-audio-max-${question.id}`} type="number" min="5" max="300" value={question.maxDurationSeconds || ''} onChange={(e) => handleNumericInputChange(question.id, 'maxDurationSeconds', e.target.value)} className="h-8 text-xs col-span-2" />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Shopper will be able to record audio directly.</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-end space-x-2 pt-2">
                                        <Checkbox id={`q-required-${question.id}`} checked={question.isRequired} onCheckedChange={(checked) => updateItem(question.id, 'isRequired', checked)} />
                                        <Label htmlFor={`q-required-${question.id}`} className="text-xs">Required</Label>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </CardContent>

                <CardFooter className="flex flex-col items-center gap-4 pt-6 border-t">
                    <p className="text-sm font-medium text-primary">Add New Item</p>
                    <div className="flex flex-wrap justify-center gap-2">
                         <Button type="button" variant="outline" onClick={() => addItem(ITEM_TYPES.SECTION_HEADER)}>
                             {getIconForType(ITEM_TYPES.SECTION_HEADER)} Section Header
                         </Button>
                        <Button type="button" variant="outline" onClick={() => addItem(ITEM_TYPES.TEXT)}>
                            {getIconForType(ITEM_TYPES.TEXT)} Text
                        </Button>
                        <Button type="button" variant="outline" onClick={() => addItem(ITEM_TYPES.MULTIPLE_CHOICE)}>
                             {getIconForType(ITEM_TYPES.MULTIPLE_CHOICE)} Multiple Choice
                         </Button>
                        <Button type="button" variant="outline" onClick={() => addItem(ITEM_TYPES.CHECKBOXES)}>
                           {getIconForType(ITEM_TYPES.CHECKBOXES)} Checkboxes
                        </Button>
                        <Button type="button" variant="outline" onClick={() => addItem(ITEM_TYPES.RATING)}>
                             {getIconForType(ITEM_TYPES.RATING)} Rating
                         </Button>
                        <Button type="button" variant="outline" onClick={() => addItem(ITEM_TYPES.IMAGE_UPLOAD)}>
                           {getIconForType(ITEM_TYPES.IMAGE_UPLOAD)} Image Upload
                        </Button>
                         <Button type="button" variant="outline" onClick={() => addItem(ITEM_TYPES.GPS_CAPTURE)}>
                            {getIconForType(ITEM_TYPES.GPS_CAPTURE)} GPS Location
                         </Button>
                         <Button type="button" variant="outline" onClick={() => addItem(ITEM_TYPES.AUDIO_RECORDING)}>
                             {getIconForType(ITEM_TYPES.AUDIO_RECORDING)} Audio Recording
                         </Button>
                    </div>
                    <Button onClick={handleSaveSurvey} disabled={isSaving || items.length === 0} className="w-full max-w-xs mt-6">
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Survey...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Save Survey
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
