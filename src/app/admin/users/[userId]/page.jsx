'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, User, Mail, MapPin, Calendar, Briefcase, CheckCircle, Clock, Edit, FileText, Award, MessageSquare } from 'lucide-react';
import { mockUsers } from '../users-mock'; // Use the shared mock data
import { format } from 'date-fns';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId;
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            setError(null);
            console.log(`Fetching details for user ID: ${userId}`);
            // Simulate API call to get user data
            await new Promise(resolve => setTimeout(resolve, 500));
            const foundUser = mockUsers.find(u => u.id === userId);

            if (foundUser) {
                setUser(foundUser);
            } else {
                console.error(`User with ID ${userId} not found.`);
                setError('User not found.');
                // Optionally redirect or show a permanent error message
                // router.push('/admin/users'); // Example redirect
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

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading User Details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col items-center">
                <Alert variant="destructive" className="max-w-lg w-full">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                 <Button asChild variant="outline" size="sm" className="mt-6">
                    <Link href="/admin/users">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to User List
                    </Link>
                </Button>
            </div>
        );
    }

    if (!user) {
        // Should be caught by error state, but as a fallback
        return (
             <div className="container mx-auto py-8 px-4 flex justify-center">
                <p>User data could not be loaded.</p>
             </div>
        );
    }

    // Helper to get status badge variant
    const getStatusVariant = (status) => status === 'active' ? 'default' : 'outline';
    const getStatusBg = (status) => status === 'active' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300';
    const getRoleVariant = (role) => role === 'admin' ? 'destructive' : 'secondary';


    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                 <Button asChild variant="outline" size="sm">
                    <Link href="/admin/users">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to User List
                    </Link>
                </Button>
                <Button asChild size="sm">
                    <Link href={`/admin/users/${userId}/edit`}>
                        <Edit className="w-4 h-4 mr-1" /> Edit User
                    </Link>
                </Button>
            </div>

            <Card className="shadow-lg">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-4 bg-secondary/30">
                     <Avatar className="h-20 w-20 border-2 border-primary shadow-sm">
                        <AvatarImage src={user.profilePicUrl} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <CardTitle className="text-2xl font-bold text-primary mb-1">{user.name}</CardTitle>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                             <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {user.email}</span>
                            {user.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {user.city}</span>}
                        </div>
                         <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant={getRoleVariant(user.role)} className="capitalize">{user.role}</Badge>
                             <Badge variant={getStatusVariant(user.status)} className={`capitalize ${getStatusBg(user.status)}`}>
                                {user.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1"/> : <Clock className="w-3 h-3 mr-1"/>}
                                {user.status}
                            </Badge>
                         </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                     {/* Additional Details Section */}
                    <div className="space-y-3">
                         <h3 className="text-lg font-semibold text-foreground border-b pb-1">Profile Details</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            {user.birthYear && (
                                 <p className="flex items-start gap-2"><strong className="w-24 inline-block text-muted-foreground">Birth Year:</strong> {user.birthYear}</p>
                            )}
                            {user.gender && user.gender !== 'prefer_not_say' && (
                                 <p className="flex items-start gap-2"><strong className="w-24 inline-block text-muted-foreground">Gender:</strong> <span className="capitalize">{user.gender}</span></p>
                            )}
                             <p className="flex items-start gap-2"><strong className="w-24 inline-block text-muted-foreground">Registered:</strong> {format(user.registrationDate, 'PPP')}</p>
                             <p className="flex items-start gap-2"><strong className="w-24 inline-block text-muted-foreground">User ID:</strong> <code>{user.id}</code></p>
                             {user.telephone && (
                                 <p className="flex items-start gap-2 md:col-span-2"><strong className="w-24 inline-block text-muted-foreground">Telephone:</strong> {user.telephone}</p>
                             )}
                         </div>
                     </div>

                    {user.role === 'shopper' && (
                         <>
                         {/* Motivation Section */}
                         {user.motivation && (
                             <div className="space-y-2">
                                 <h3 className="text-lg font-semibold text-foreground border-b pb-1 flex items-center gap-1"> <MessageSquare className="w-4 h-4"/> Motivation</h3>
                                 <p className="text-sm text-foreground/90 italic bg-secondary/50 p-3 rounded border">"{user.motivation}"</p>
                             </div>
                         )}

                         {/* CV Section */}
                          {user.cvUrl && (
                             <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground border-b pb-1 flex items-center gap-1"> <FileText className="w-4 h-4"/> Curriculum Vitae (CV)</h3>
                                <Button asChild variant="link" size="sm" className="p-0 h-auto">
                                    <Link href={user.cvUrl} target="_blank" rel="noopener noreferrer">
                                       View Submitted CV ({user.cvUrl.split('/').pop()})
                                     </Link>
                                </Button>
                             </div>
                         )}

                        {/* Performance/Stats Section */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b pb-1 flex items-center gap-1"> <Award className="w-4 h-4"/> Performance</h3>
                            <p className="text-sm"><strong className="text-muted-foreground">Completed Missions:</strong> {user.completedMissions ?? 0}</p>
                             {/* Add more stats like average rating, last activity etc. */}
                        </div>
                         </>
                     )}

                    {/* Add more sections as needed: Assigned Missions, Recent Reports, Ratings, etc. */}

                 </CardContent>
            </Card>
        </div>
    );
}
