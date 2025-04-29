'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, Loader2, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUsers } from '../users/users-mock.js'; // Use the shared mock data
import Link from 'next/link';

export default function AdminChatListPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [shoppers, setShoppers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching users (filter for shoppers)
        setIsLoading(true);
        setTimeout(() => {
            setShoppers(mockUsers.filter(u => u.role === 'shopper'));
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
                                                <span>{shopper.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{shopper.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={shopper.status === 'active' ? 'default' : 'outline'} className={`capitalize ${shopper.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                                                {shopper.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/chat/${shopper.id}`}>
                                                <button className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3">
                                                    <MessageSquare className="w-4 h-4" /> Chat
                                                </button>
                                            </Link>
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
