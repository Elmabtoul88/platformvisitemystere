'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Save, User, Mail, MapPin, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { mockUsers } from '../users-mock'; // Use the shared mock data
import { useToast } from '@/hooks/use-toast';
import { updateUserAction } from '../../../actions/admin-actions'; // Import the server action

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const userId = params.userId;
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Fetch user data on load
    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            setError(null);
            console.log(`Fetching details for user ID: ${userId} for editing`);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            const foundUser = mockUsers.find(u => u.id === userId);

            if (foundUser) {
                setUser(foundUser);
                // Initialize form data with existing user details
                setFormData({
                    name: foundUser.name || '',
                    email: foundUser.email || '', // Usually not editable, but included for display
                    city: foundUser.city || '',
                    motivation: foundUser.motivation || '',
                    telephone: foundUser.telephone || '', // Added telephone
                    role: foundUser.role || 'shopper', // Default role
                    status: foundUser.status || 'active', // Default status
                });
            } else {
                setError('User not found.');
            }
            setIsLoading(false);
        };

        if (userId) {
            fetchUser();
        } else {
             setError('Invalid user ID provided.');
             setIsLoading(false);
        }
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);

        // Basic Validation (Add more as needed)
        if (!formData.name || !formData.role || !formData.status) {
             toast({ variant: "destructive", title: "Missing Fields", description: "Name, Role, and Status are required." });
             setIsSaving(false);
             return;
         }

        console.log(`Submitting updates for user ${userId}:`, formData);

        try {
             // Call the server action to update the user
            const result = await updateUserAction(userId, formData);

            if (result.success) {
                toast({ title: "User Updated", description: result.message });
                 // Update the local mock data (or refetch if using real API)
                 const userIndex = mockUsers.findIndex(u => u.id === userId);
                 if (userIndex > -1) {
                     mockUsers[userIndex] = { ...mockUsers[userIndex], ...formData };
                 }
                 // Redirect back to the user detail page or user list
                 router.push(`/admin/users/${userId}`);
            } else {
                 throw new Error(result.message || "Failed to update user.");
            }
        } catch (err) {
            toast({ variant: "destructive", title: "Update Failed", description: err.message });
            setIsSaving(false); // Keep form enabled on error
        }
        // Do not set setIsSaving(false) on success, as we are redirecting
    };


    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 <span className="ml-2">Loading User Data...</span>
            </div>
        );
    }

    if (error) {
        return (
             <div className="container mx-auto py-8 px-4 flex flex-col items-center">
                <p className="text-destructive">{error}</p>
                 <Button asChild variant="link" className="mt-4">
                    <Link href="/admin/users"><ArrowLeft className="w-4 h-4 mr-1" /> Back to User List</Link>
                </Button>
             </div>
        );
    }

    if (!user) {
        return <div className="container mx-auto py-8 px-4 flex justify-center">User not found.</div>;
    }


    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Button asChild variant="outline" size="sm" className="mb-6">
                <Link href={`/admin/users/${userId}`}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Cancel Edit
                </Link>
            </Button>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
                         <User className="w-5 h-5"/> Edit User Profile
                    </CardTitle>
                    <CardDescription>Modify the details for {user.name}.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                         {/* Avatar Preview */}
                         <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border">
                                <AvatarImage src={user.profilePicUrl} alt={user.name} />
                                <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                             <p className="text-sm text-muted-foreground">Profile picture managed by user.</p>
                         </div>

                         {/* Editable Fields */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required disabled={isSaving} />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" value={formData.email} readOnly disabled className="bg-secondary/50 cursor-not-allowed" />
                                <p className="text-xs text-muted-foreground">Email is read-only.</p>
                             </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="city" className="flex items-center gap-1"><MapPin className="w-3 h-3"/> City / Location</Label>
                                <Input id="city" name="city" value={formData.city} onChange={handleInputChange} disabled={isSaving} />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="telephone" className="flex items-center gap-1">Telephone</Label>
                                <Input id="telephone" name="telephone" type="tel" value={formData.telephone} onChange={handleInputChange} disabled={isSaving} />
                            </div>
                         </div>

                         <div className="space-y-1">
                            <Label htmlFor="motivation">Motivation</Label>
                            <Textarea id="motivation" name="motivation" value={formData.motivation} onChange={handleInputChange} className="min-h-[80px]" disabled={isSaving} />
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-1">
                                 <Label htmlFor="role" className="flex items-center gap-1"><Briefcase className="w-3 h-3"/> Role *</Label>
                                 <Select name="role" value={formData.role} onValueChange={(value) => handleSelectChange('role', value)} required disabled={isSaving}>
                                    <SelectTrigger id="role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                         <SelectItem value="shopper">Shopper</SelectItem>
                                         <SelectItem value="admin">Admin</SelectItem>
                                         {/* Add other roles if applicable */}
                                    </SelectContent>
                                </Select>
                             </div>
                            <div className="space-y-1">
                                <Label htmlFor="status" className="flex items-center gap-1">Status *</Label>
                                <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)} required disabled={isSaving}>
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                         <SelectItem value="active"> <CheckCircle className="w-3 h-3 inline mr-1 text-green-600"/> Active</SelectItem>
                                         <SelectItem value="inactive"> <Clock className="w-3 h-3 inline mr-1 text-red-600"/> Inactive</SelectItem>
                                         {/* Add other statuses if applicable */}
                                    </SelectContent>
                                </Select>
                            </div>
                         </div>

                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-6">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
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
