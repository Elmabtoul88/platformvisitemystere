'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { mockMissions } from '@/lib/mock-data'; // To get categories and mission data

export default function EditMissionPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const missionId = params.missionId;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        reward: '',
        location: '',
        category: '',
        businessName: '',
        status: '', // Add status
    });
    const [availableCategories, setAvailableCategories] = useState([]);

    // Fetch mission data and categories
    useEffect(() => {
        setIsLoading(true);
        // Simulate fetching mission data
        const foundMission = mockMissions.find(m => m.id === missionId);
        if (foundMission) {
            // Format deadline for input type="date" (YYYY-MM-DD)
            const deadlineDate = new Date(foundMission.deadline);
            const formattedDeadline = !isNaN(deadlineDate) ? deadlineDate.toISOString().split('T')[0] : '';

            setFormData({
                title: foundMission.title || '',
                description: foundMission.description || '',
                deadline: formattedDeadline,
                reward: String(foundMission.reward) || '', // Ensure reward is a string for input
                location: foundMission.location || '',
                category: foundMission.category || '',
                businessName: foundMission.businessName || '',
                status: foundMission.status || 'available', // Include status
            });
        } else {
            toast({ variant: "destructive", title: "Error", description: "Mission not found." });
            router.push('/admin/missions'); // Redirect if mission doesn't exist
        }

        // Set available categories (can be static if using mock data)
        setAvailableCategories([...new Set(mockMissions.map(m => m.category))]);
        setIsLoading(false);
    }, [missionId, router, toast]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        console.log("Submitting updated mission data (simulated):", { missionId, ...formData });

        // Basic Frontend Validation
        if (!formData.title || !formData.description || !formData.deadline || !formData.reward || !formData.location || !formData.category || !formData.businessName || !formData.status) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill out all required fields.",
            });
            setIsSubmitting(false);
            return;
        }

        // --- TODO: Replace simulation with actual update API call ---
        // Simulate API call to update the mission
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the mock data (for simulation purposes)
        const missionIndex = mockMissions.findIndex(m => m.id === missionId);
        if (missionIndex > -1) {
            mockMissions[missionIndex] = {
                ...mockMissions[missionIndex],
                ...formData,
                reward: parseInt(formData.reward, 10), // Convert reward back to number
                deadline: new Date(formData.deadline), // Convert deadline back to Date
            };
        }
        console.log("Simulated mission update successful.");
        // ---

        toast({
            title: "Mission Updated",
            description: `Mission "${formData.title}" has been updated.`,
        });
        router.push('/admin/missions'); // Redirect back to the mission list
        // setIsSubmitting(false); // Not needed on success redirect
    };

     if (isLoading) {
        return (
          <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading mission details...</span>
          </div>
        );
      }

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
             <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href="/admin/missions">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions List
                </Link>
            </Button>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">Edit Mission</CardTitle>
                    <CardDescription>Modify the details for mission: {formData.title || missionId}</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                         {/* Mission Title and Business Name */}
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

                         {/* Description */}
                         <div className="space-y-1">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required className="min-h-[100px]" disabled={isSubmitting} />
                         </div>

                         {/* Location and Category */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="location">Location (Address) *</Label>
                                <Input id="location" name="location" value={formData.location} onChange={handleInputChange} required disabled={isSubmitting} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="category">Category *</Label>
                                 <Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange('category', value)} required disabled={isSubmitting}>
                                    <SelectTrigger id="category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCategories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                         </div>

                         {/* Deadline and Reward */}
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

                         {/* Status Selection */}
                         <div className="space-y-1">
                            <Label htmlFor="status">Mission Status *</Label>
                            <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)} required disabled={isSubmitting}>
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="assigned">Assigned</SelectItem>
                                    <SelectItem value="submitted">Submitted (Reports Pending)</SelectItem>
                                    <SelectItem value="approved">Approved (Completed)</SelectItem>
                                     <SelectItem value="refused">Refused</SelectItem>
                                    {/* Consider adding cancelled/paused if needed */}
                                </SelectContent>
                            </Select>
                        </div>

                         {/* Add fields for assigning shoppers, setting specific criteria, etc. later */}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                         <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save Changes
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
