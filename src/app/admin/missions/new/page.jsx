'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockMissions } from '@/lib/mock-data'; // To get categories

// Get unique categories from mock data (replace with API call in real app)
const availableCategories = [...new Set(mockMissions.map(m => m.category))];

export default function CreateMissionPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        reward: '',
        location: '',
        category: '',
        businessName: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

     const handleCategoryChange = (value) => {
        setFormData(prev => ({ ...prev, category: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        console.log("Submitting new mission data (simulated):", formData);

        // Basic Frontend Validation (add more robust validation as needed)
        if (!formData.title || !formData.description || !formData.deadline || !formData.reward || !formData.location || !formData.category || !formData.businessName) {
             toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill out all required fields.",
            });
            setIsSubmitting(false);
            return;
        }

        // Simulate API call to create the mission
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate getting a new mission ID from the backend
        const newMissionId = `mission-${Date.now()}`; // Replace with actual ID from response
        console.log("Simulated mission creation successful. New ID:", newMissionId);

        // On success:
        toast({
            title: "Mission Created",
            description: `Proceed to create the survey for "${formData.title}".`,
        });
        // Redirect to the survey creation page for the new mission
        router.push(`/admin/missions/${newMissionId}/survey/create`);

        // On error:
        // toast({
        //     variant: "destructive",
        //     title: "Failed to Create Mission",
        //     description: "An error occurred. Please try again.",
        // });
        // setIsSubmitting(false); // Keep this line if handling errors
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
             <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href="/admin/missions">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions List
                </Link>
            </Button>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">Step 1: Create New Mission</CardTitle>
                    <CardDescription>Enter the basic details for the new mystery shopping mission.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="title">Mission Title *</Label>
                                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required disabled={isSubmitting} />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="businessName">Business Name *</Label>
                                <Input id="businessName" name="businessName" value={formData.businessName} onChange={handleInputChange} required disabled={isSubmitting} />
                            </div>
                        </div>

                         <div className="space-y-1">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required className="min-h-[100px]" disabled={isSubmitting} />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="location">Location (Address) *</Label>
                                <Input id="location" name="location" value={formData.location} onChange={handleInputChange} required disabled={isSubmitting} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="category">Category *</Label>
                                 <Select name="category" value={formData.category} onValueChange={handleCategoryChange} required disabled={isSubmitting}>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCategories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                        {/* Option to add a new category? */}
                                    </SelectContent>
                                </Select>
                            </div>
                         </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="deadline">Deadline *</Label>
                                <Input id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleInputChange} required disabled={isSubmitting} />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="reward">Reward ($) *</Label>
                                <Input id="reward" name="reward" type="number" min="0" step="1" value={formData.reward} onChange={handleInputChange} required disabled={isSubmitting} />
                            </div>
                         </div>
                         {/* Add fields for assigning shoppers, setting specific criteria, etc. later */}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                         <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Create Mission & Add Survey
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
