'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, Search, Edit, Trash2, FileCheck } from 'lucide-react';
import { mockMissions } from '@/lib/mock-data'; // Use mock data for now
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Helper function for status badge variant
const getStatusVariant = (status) => {
    switch (status) {
      case 'available': return 'secondary';
      case 'assigned': return 'default';
      case 'submitted': return 'outline';
      case 'approved': return 'default'; // Consider a success variant if added
      case 'completed': return 'outline'; // Might be the same as approved?
      default: return 'secondary';
    }
};

export default function AdminMissionsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [missions, setMissions] = useState(mockMissions); // Replace with API call

    const filteredMissions = useMemo(() => {
        return missions.filter(mission =>
            mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
             mission.businessName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [missions, searchTerm]);

    const handleCreateMission = () => {
        // Navigate to a dedicated creation page
        router.push('/admin/missions/new');
    };

    const handleEditMission = (missionId) => {
        console.log(`Admin: Edit mission ${missionId}`);
        // Navigate to edit page: router.push(`/admin/missions/edit/${missionId}`);
         alert(`Simulating edit for mission ${missionId}`);
    };

    const handleDeleteMission = (missionId) => {
        console.log(`Admin: Delete mission ${missionId}`);
        // Add confirmation dialog here
         if (confirm(`Are you sure you want to delete mission ${missionId}? This action cannot be undone.`)) {
             // Simulate deletion
            setMissions(prev => prev.filter(m => m.id !== missionId));
            alert(`Mission ${missionId} deleted (simulated).`);
             // TODO: Call API to delete mission
         }
    };

     const handleReviewReports = (missionId) => {
        console.log(`Admin: Review reports for mission ${missionId}`);
        // Navigate to reports review page for this mission
         // router.push(`/admin/missions/${missionId}/reports`);
         alert(`Simulating review reports for mission ${missionId}`);
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                    Manage Missions
                </h1>
                <Button onClick={handleCreateMission} size="sm">
                    <PlusCircle className="w-4 h-4 mr-2" /> Create New Mission
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Mission List</CardTitle>
                    <CardDescription>View, edit, and manage all missions.</CardDescription>
                     <div className="relative pt-2">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search missions (title, ID, location, status, business)..."
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
                                <TableHead>Title</TableHead>
                                <TableHead>Business</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Reward</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMissions.length > 0 ? (
                                filteredMissions.map((mission) => (
                                    <TableRow key={mission.id}>
                                        <TableCell className="font-medium">{mission.title}</TableCell>
                                        <TableCell>{mission.businessName}</TableCell>
                                        <TableCell>{mission.location}</TableCell>
                                        <TableCell>{format(mission.deadline, 'PP')}</TableCell>
                                         <TableCell>${mission.reward}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(mission.status)} className="capitalize">
                                                {mission.status}
                                            </Badge>
                                        </TableCell>
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
                                                    <DropdownMenuItem onClick={() => handleReviewReports(mission.id)}>
                                                        <FileCheck className="mr-2 h-4 w-4" /> Review Reports
                                                    </DropdownMenuItem>
                                                     <DropdownMenuItem onClick={() => handleEditMission(mission.id)}>
                                                         <Edit className="mr-2 h-4 w-4" /> Edit Mission
                                                     </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                        onClick={() => handleDeleteMission(mission.id)}
                                                    >
                                                         <Trash2 className="mr-2 h-4 w-4" /> Delete Mission
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No missions found matching your search criteria.
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
```