'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Keep RadioGroup import if needed elsewhere, but not for the item itself here
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, PlusCircle, Trash2, GripVertical, Loader2, ListOrdered, TextCursorInput, CheckSquare, Star, Circle } from 'lucide-react'; // Added Circle icon
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { saveSurvey } from '../../../../../actions/survey-actions.js'; // Import server action using relative path

// Question type definitions
const QUESTION_TYPES = {
  TEXT: 'text',
  MULTIPLE_CHOICE: 'multiple_choice',
  CHECKBOXES: 'checkboxes',
  RATING: 'rating', // Added rating type
};

// Initial empty question structure based on type
const createNewQuestion = (type, id) => {
    const base = { id, type, text: '', isRequired: false };
    if (type === QUESTION_TYPES.MULTIPLE_CHOICE || type === QUESTION_TYPES.CHECKBOXES) {
        base.options = [{ id: Date.now(), text: '' }]; // Start with one empty option
    }
    if (type === QUESTION_TYPES.RATING) {
         base.maxRating = 5; // Default max rating
         base.minLabel = 'Poor';
         base.maxLabel = 'Excellent';
    }
    return base;
};

export default function CreateSurveyPage() {
    const router = useRouter();
    const params = useParams();
    const missionId = params.missionId;
    const { toast } = useToast();
    const [questions, setQuestions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [missionTitle, setMissionTitle] = useState('Loading...'); // Placeholder

    // TODO: Fetch mission title based on missionId for display purposes
    useEffect(() => {
        // Simulate fetching mission details
        console.log("Fetching details for mission:", missionId);
        setTimeout(() => {
            setMissionTitle(`Survey for Mission ${missionId}`); // Replace with actual title
        }, 500);
    }, [missionId]);

    // --- Question Management ---
    const addQuestion = (type) => {
        setQuestions(prev => [...prev, createNewQuestion(type, Date.now())]);
    };

    const removeQuestion = (id) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const updateQuestion = (id, field, value) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const updateQuestionOption = (questionId, optionId, value) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    options: q.options.map(opt => opt.id === optionId ? { ...opt, text: value } : opt)
                };
            }
            return q;
        }));
    };

    const addQuestionOption = (questionId) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === questionId && (q.type === QUESTION_TYPES.MULTIPLE_CHOICE || q.type === QUESTION_TYPES.CHECKBOXES)) {
                return {
                    ...q,
                    options: [...q.options, { id: Date.now(), text: '' }]
                };
            }
            return q;
        }));
    };

     const removeQuestionOption = (questionId, optionId) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === questionId && q.options.length > 1) { // Keep at least one option
                return {
                    ...q,
                    options: q.options.filter(opt => opt.id !== optionId)
                };
            }
            return q;
        }));
    };

     const handleSaveSurvey = async () => {
        setIsSaving(true);
        console.log("Saving survey (simulated):", { missionId, questions });

         // Basic validation: Check if all question texts are filled
         const hasEmptyQuestions = questions.some(q => !q.text.trim());
         // Check if any multiple choice/checkbox questions have empty options
         const hasEmptyOptions = questions.some(q =>
            (q.type === QUESTION_TYPES.MULTIPLE_CHOICE || q.type === QUESTION_TYPES.CHECKBOXES) &&
            q.options.some(opt => !opt.text.trim())
         );

        if (questions.length === 0) {
            toast({
                variant: "destructive",
                title: "Survey Empty",
                description: "Please add at least one question.",
            });
             setIsSaving(false);
             return;
         }

         if (hasEmptyQuestions || hasEmptyOptions) {
             toast({
                 variant: "destructive",
                 title: "Incomplete Questions",
                 description: "Please fill in all question texts and option labels before saving.",
             });
             setIsSaving(false);
             return;
         }

        try {
             // Call the server action to save the survey
             const result = await saveSurvey(missionId, questions);

             if (result.success) {
                toast({
                    title: "Survey Saved Successfully",
                    description: `Survey for mission ${missionId} has been saved.`,
                });
                // Redirect to the mission details or list page
                 router.push('/admin/missions'); // Or `/admin/missions/${missionId}`
             } else {
                 throw new Error(result.message || "Failed to save survey");
             }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to Save Survey",
                description: error.message || "An error occurred. Please try again.",
            });
            setIsSaving(false);
        }
    };

     // --- Drag and Drop (Basic - Placeholder for Library Integration) ---
     // In a real app, use react-beautiful-dnd or similar
     const handleDragStart = (e, index) => {
         e.dataTransfer.setData("questionIndex", index);
     };

     const handleDrop = (e, index) => {
         const draggedIndex = parseInt(e.dataTransfer.getData("questionIndex"), 10);
         if (draggedIndex === index) return;

         const newQuestions = [...questions];
         const [draggedItem] = newQuestions.splice(draggedIndex, 1);
         newQuestions.splice(index, 0, draggedItem);
         setQuestions(newQuestions);
     };

     const handleDragOver = (e) => {
         e.preventDefault(); // Necessary to allow drop
     };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
             <Button asChild variant="outline" size="sm" className="mb-4">
                {/* Link back to the specific mission or mission list */}
                <Link href="/admin/missions">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions
                </Link>
            </Button>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">Step 2: Create Survey</CardTitle>
                    <CardDescription>Build the survey questions for: <span className="font-medium">{missionTitle}</span></CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {questions.length === 0 && (
                        <p className="text-center text-muted-foreground py-6">No questions added yet. Add questions using the buttons below.</p>
                    )}
                    {questions.map((q, index) => (
                        <Card
                            key={q.id}
                            className="p-4 border bg-card shadow-sm relative"
                            draggable // Enable dragging
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragOver={handleDragOver}
                        >
                             {/* Drag Handle (optional visual cue) */}
                            <GripVertical className="absolute left-1 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-move h-5 w-5" />
                            {/* Remove Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => removeQuestion(q.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove Question</span>
                            </Button>

                             <div className="pl-6 space-y-3"> {/* Add padding for handle */}
                                {/* Question Text */}
                                <div className="space-y-1">
                                    <Label htmlFor={`q-text-${q.id}`}>Question {index + 1}</Label>
                                    <Input
                                        id={`q-text-${q.id}`}
                                        placeholder="Enter your question"
                                        value={q.text}
                                        onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                    />
                                </div>

                                 {/* Question Type Indicator (Readonly) */}
                                 <Badge variant="secondary" className="capitalize">
                                    {q.type.replace('_', ' ')} Question
                                </Badge>


                                {/* Options for Multiple Choice / Checkboxes */}
                                {(q.type === QUESTION_TYPES.MULTIPLE_CHOICE || q.type === QUESTION_TYPES.CHECKBOXES) && (
                                    <div className="space-y-2 pl-4 border-l ml-2">
                                        <Label className="text-sm font-medium">Options</Label>
                                        {q.options.map((opt, optIndex) => (
                                            <div key={opt.id} className="flex items-center gap-2">
                                                {/* Use Circle icon instead of RadioGroupItem */}
                                                {q.type === QUESTION_TYPES.MULTIPLE_CHOICE && <Circle className="h-4 w-4 text-muted-foreground opacity-50"/> }
                                                 {q.type === QUESTION_TYPES.CHECKBOXES && <Checkbox checked={false} disabled className="opacity-50"/>}
                                                <Input
                                                    placeholder={`Option ${optIndex + 1}`}
                                                    value={opt.text}
                                                    onChange={(e) => updateQuestionOption(q.id, opt.id, e.target.value)}
                                                    className="flex-grow h-8"
                                                />
                                                {q.options.length > 1 && (
                                                     <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                        onClick={() => removeQuestionOption(q.id, opt.id)}
                                                     >
                                                        <Trash2 className="h-4 w-4" />
                                                     </Button>
                                                )}
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => addQuestionOption(q.id)}>
                                             <PlusCircle className="w-4 h-4 mr-1" /> Add Option
                                         </Button>
                                    </div>
                                )}

                                 {/* Settings for Rating */}
                                {q.type === QUESTION_TYPES.RATING && (
                                    <div className="space-y-3 pl-4 border-l ml-2">
                                        <Label className="text-sm font-medium">Rating Scale</Label>
                                        <div className="flex items-center gap-2">
                                             {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                 <Button
                                                    key={num}
                                                    type="button"
                                                    variant={num <= q.maxRating ? 'default' : 'outline'}
                                                    size="icon"
                                                    className={`h-7 w-7 opacity-50 ${num <= q.maxRating ? 'bg-accent text-accent-foreground border-accent' : ''}`}
                                                    disabled // Make visual only
                                                 >
                                                     <Star className="w-4 h-4"/>
                                                 </Button>
                                             ))}
                                        </div>
                                         <div className="grid grid-cols-3 gap-2 items-center">
                                            <Label htmlFor={`q-rating-max-${q.id}`} className="text-xs col-span-1">Max Rating:</Label>
                                             <Select
                                                value={String(q.maxRating)}
                                                onValueChange={(val) => updateQuestion(q.id, 'maxRating', parseInt(val, 10))}
                                             >
                                                <SelectTrigger id={`q-rating-max-${q.id}`} className="h-8 text-xs col-span-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                        <SelectItem key={num} value={String(num)}>{num} Stars</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                         </div>
                                         <div className="grid grid-cols-3 gap-2 items-center">
                                            <Label htmlFor={`q-rating-minlabel-${q.id}`} className="text-xs col-span-1">Min Label:</Label>
                                            <Input
                                                id={`q-rating-minlabel-${q.id}`}
                                                value={q.minLabel}
                                                onChange={(e) => updateQuestion(q.id, 'minLabel', e.target.value)}
                                                className="h-8 text-xs col-span-2"
                                                placeholder="e.g., Poor"
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 items-center">
                                             <Label htmlFor={`q-rating-maxlabel-${q.id}`} className="text-xs col-span-1">Max Label:</Label>
                                            <Input
                                                id={`q-rating-maxlabel-${q.id}`}
                                                value={q.maxLabel}
                                                onChange={(e) => updateQuestion(q.id, 'maxLabel', e.target.value)}
                                                className="h-8 text-xs col-span-2"
                                                 placeholder="e.g., Excellent"
                                            />
                                        </div>
                                    </div>
                                )}


                                 {/* Required Toggle */}
                                 <div className="flex items-center justify-end space-x-2 pt-2">
                                    <Checkbox
                                        id={`q-required-${q.id}`}
                                        checked={q.isRequired}
                                        onCheckedChange={(checked) => updateQuestion(q.id, 'isRequired', checked)}
                                    />
                                    <Label htmlFor={`q-required-${q.id}`} className="text-xs">Required</Label>
                                </div>
                             </div>
                        </Card>
                    ))}
                </CardContent>

                <CardFooter className="flex flex-col items-center gap-4 pt-6 border-t">
                    <div className="flex flex-wrap justify-center gap-2">
                        <Button type="button" variant="outline" onClick={() => addQuestion(QUESTION_TYPES.TEXT)}>
                            <TextCursorInput className="w-4 h-4 mr-1" /> Add Text Question
                        </Button>
                        <Button type="button" variant="outline" onClick={() => addQuestion(QUESTION_TYPES.MULTIPLE_CHOICE)}>
                             <ListOrdered className="w-4 h-4 mr-1" /> Add Multiple Choice
                         </Button>
                        <Button type="button" variant="outline" onClick={() => addQuestion(QUESTION_TYPES.CHECKBOXES)}>
                            <CheckSquare className="w-4 h-4 mr-1" /> Add Checkboxes
                        </Button>
                        <Button type="button" variant="outline" onClick={() => addQuestion(QUESTION_TYPES.RATING)}>
                             <Star className="w-4 h-4 mr-1" /> Add Rating Question
                         </Button>
                    </div>
                    <Button onClick={handleSaveSurvey} disabled={isSaving} className="w-full max-w-xs mt-4">
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

// Dummy Badge component if not available globally
const Badge = ({ children, ...props }) => (
    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80" {...props}>
        {children}
    </span>
);
