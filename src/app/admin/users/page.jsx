'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Edit, Eye, UserX, CheckCircle, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUser as mockSingleUser, mockMissions } from '@/lib/mock-data'; // Using mock data
import { format } from 'date-fns'; // To format dates if needed

// Generate more mock users for the list
const generateMockUsers = (count) => {
    const users = [];
    for (let i = 1; i <= count; i++) {
        const userId = `user-shopper-${i}`;
        users.push({
            id: userId,
            name: `Shopper ${i}`,
            email: `shopper${i}@example.com`,
            role: 'shopper', // Assuming all are shoppers for now
            profilePicUrl: `https://picsum.photos/seed/${userId}/40/40`,
            status: i % 3 === 0 ? 'inactive' : 'active', // Example status distribution
            city: i % 2 === 0 ? 'Anytown' : 'Otherville',
            registrationDate: new Date(Date.now() - (i * 3) * 24 * 60 * 60 * 1000), // Simulate registration dates
            completedMissions: Math.floor(Math.random() * 20), // Random mission count
        });
    }
    // Add the original mock user
    users.push({...mockSingleUser, email: 'alex@example.com', status: 'active', registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), completedMissions: 5 });
    // Add a mock admin user
    users.push({ id: 'admin-1', name: 'Admin User', email: 'admin@example.com', role: 'admin', profilePicUrl: null, status: 'active', city: 'HQ', registrationDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000), completedMissions: 0 });
    return users;
};

const mockUsers = generateMockUsers(15); // Generate 15 mock shoppers + 1 original + 1 admin

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState(mockUsers); // Replace with API call

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const handleViewUser = (userId) => {
        console.log(`Admin: View user ${userId}`);
        // Navigate to user detail page: router.push(`/admin/users/${userId}`);
         alert(`Simulating view details for user ${userId}`);
    };

     const handleEditUser = (userId) => {
        console.log(`Admin: Edit user ${userId}`);
        // Navigate to user edit page: router.push(`/admin/users/edit/${userId}`);
         alert(`Simulating edit for user ${userId}`);
    };

    const handleToggleStatus = (userId) => {
        console.log(`Admin: Toggle status for user ${userId}`);
         // Simulate status toggle
         setUsers(prevUsers => prevUsers.map(user =>
            user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
        ));
         alert(`Simulated status toggle for user ${userId}.`);
        // TODO: Call API to update user status
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                Manage Users
            </h1>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>User List</CardTitle>
                    <CardDescription>View, edit, and manage all user accounts.</CardDescription>
                    <div className="relative pt-2">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users (name, email, ID, role, status)..."
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
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Registered</TableHead>
                                <TableHead>Missions Done</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8 border">
                                                    <AvatarImage src={user.profilePicUrl} alt={user.name} />
                                                    <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <span>{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                             <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="capitalize">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === 'active' ? 'default' : 'outline'} className={`capitalize ${user.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                                                 {user.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1"/> : <Clock className="w-3 h-3 mr-1"/>}
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                         <TableCell>{format(user.registrationDate, 'PP')}</TableCell>
                                         <TableCell className="text-center">{user.role === 'shopper' ? user.completedMissions : 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                     <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                                                         <Eye className="mr-2 h-4 w-4" /> View Details
                                                     </DropdownMenuItem>
                                                    {/* Only allow editing/status change for non-admins or self? Adjust logic as needed */}
                                                    {user.role !== 'admin' && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                                                                <Edit className="mr-2 h-4 w-4" /> Edit User
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                                                                 <UserX className="mr-2 h-4 w-4" />
                                                                 {user.status === 'active' ? 'Deactivate' : 'Activate'} User
                                                            </DropdownMenuItem>
                                                        </>
                                                     )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No users found matching your search criteria.
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
