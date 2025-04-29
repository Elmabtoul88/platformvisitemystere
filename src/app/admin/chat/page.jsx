'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, Loader2, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUsers, clearUserUnreadMessages } from '../users/users-mock.js'; // Use the shared mock data and import clear function
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Import Button

export default function AdminChatListPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [shoppers, setShoppers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTransitioning, startTransition] = useTransition();

    useEffect(() => {
        // Simulate fetching users (filter for shoppers)
        setIsLoading(true);
        setTimeout(() => {
            // Use startTransition to avoid blocking UI during state update
            startTransition(() => {
                 setShoppers(mockUsers.filter(u => u.role === 'shopper'));
            });
            setIsLoading(false);
        }, 300);
    }, []);

    const filteredShoppers = useMemo(() => {
        return shoppers.filter(shopper =>
            shopper.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shopper.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shopper.id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [shoppers, searchTerm]);

    // Function to handle clicking the chat button
    const handleChatClick = (userId) => {
         // Clear unread messages in mock data
        clearUserUnreadMessages(userId);
         // Optimistically update local state to remove badge immediately
         startTransition(() => {
             setShoppers(prev => prev.map(s => s.id === userId ? { ...s, unreadMessages: 0 } : s));
         });
         // Navigation will be handled by the Link component
     };


     if (isLoading) {
        return (
          <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading shoppers...</span>
          </div>
        );
      }


    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                <Users className="w-6 h-6" /> Select Shopper to Chat With
            </h1>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Shopper List</CardTitle>
                    <CardDescription>Select a shopper to start a conversation.</CardDescription>
                    <div className="relative pt-2">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search shoppers (name, email, ID)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-full md:w-1/2 lg:w-1/3"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredShoppers.length > 0 ? (
                                filteredShoppers.map((shopper) => (
                                    <TableRow key={shopper.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8 border">
                                                    <AvatarImage src={shopper.profilePicUrl} alt={shopper.name} />
                                                    <AvatarFallback>{shopper.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <span className="flex items-center gap-1.5"> {/* Wrap name and badge */}
                                                    <span>{shopper.name}</span>
                                                    {/* Display unread message badge */}
                                                     {shopper.unreadMessages > 0 && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="h-4 min-w-[1rem] px-1.5 flex items-center justify-center rounded-full text-[10px]"
                                                          >
                                                            {shopper.unreadMessages}
                                                        </Badge>
                                                      )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{shopper.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={shopper.status === 'active' ? 'default' : 'outline'} className={`capitalize ${shopper.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                                                {shopper.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             {/* Use Link for navigation and Button for styling/onClick */}
                                             <Button asChild variant="default" size="sm" onClick={() => handleChatClick(shopper.id)}>
                                                <Link href={`/admin/chat/${shopper.id}`} className="inline-flex items-center gap-1">
                                                    <MessageSquare className="w-4 h-4" /> Chat
                                                 </Link>
                                             </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No shoppers found matching your search criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
