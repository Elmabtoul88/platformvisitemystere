'use client';

import React, { useState, useMemo, useTransition, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Edit, Power, PowerOff, Loader2, Building, PlusCircle, Upload, Info } from 'lucide-react';
import { mockStores, mockMissions } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as XLSX from 'xlsx';
import { addStoreAction, updateStoreAction, toggleStoreStatusAction, batchAddStoresAction } from '../../actions/admin-actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const storeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Address is required"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  category: z.string().optional(),
  mission_id: z.string().min(1, "Mission is required"),
  active: z.boolean().default(true)
});

export default function AdminStoresPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [stores, setStores] = useState([]);
    const [missions, setMissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [missionFilter, setMissionFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTransitioning, startTransition] = useTransition();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingStore, setEditingStore] = useState(null);
    const fileInputRef = useRef(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);


    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(storeSchema),
        defaultValues: {
            name: '', city: '', address: '', latitude: '', longitude: '', category: '', mission_id: '', active: true
        }
    });

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            startTransition(() => {
                setStores(mockStores);
                setMissions(mockMissions);
            });
            setIsLoading(false);
        }, 300);
    }, []);

    // Reset to first page whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, missionFilter, categoryFilter]);


    const uniqueCategories = useMemo(() => [...new Set(stores.map(s => s.category).filter(Boolean))], [stores]);

    const getMissionTitle = (missionId) => missions.find(m => m.id === missionId)?.title || missionId;

    const filteredStores = useMemo(() => {
        return stores.filter(store => {
            const missionMatch = missionFilter === 'all' || store.mission_id === missionFilter;
            const categoryMatch = categoryFilter === 'all' || store.category === categoryFilter;

            const searchTermLower = searchTerm.toLowerCase();
            const searchMatch = !searchTermLower || (
                store.name?.toLowerCase().includes(searchTermLower) ||
                store.city?.toLowerCase().includes(searchTermLower) ||
                store.address?.toLowerCase().includes(searchTermLower) ||
                store.category?.toLowerCase().includes(searchTermLower) ||
                getMissionTitle(store.mission_id).toLowerCase().includes(searchTermLower)
            );

            return missionMatch && categoryMatch && searchMatch;
        });
    }, [stores, searchTerm, missionFilter, categoryFilter, missions]);
    
    const pageCount = Math.ceil(filteredStores.length / itemsPerPage);

    const paginatedStores = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredStores.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStores, currentPage, itemsPerPage]);

    const handleAddNew = () => {
        setEditingStore(null);
        reset({ name: '', city: '', address: '', latitude: '', longitude: '', category: '', mission_id: '', active: true });
        setDialogOpen(true);
    };

    const handleEdit = (store) => {
        setEditingStore(store);
        reset({
            name: store.name,
            city: store.city,
            address: store.address,
            latitude: store.latitude,
            longitude: store.longitude,
            category: store.category,
            mission_id: store.mission_id,
            active: store.active
        });
        setDialogOpen(true);
    };

    const handleToggleStatus = async (storeId) => {
        setIsProcessing(true);
        const result = await toggleStoreStatusAction(storeId);
        if (result.success) {
            startTransition(() => {
                setStores(prev => prev.map(s => s.id === storeId ? { ...s, active: !s.active } : s));
                 const storeIndex = mockStores.findIndex(s => s.id === storeId);
                 if (storeIndex !== -1) mockStores[storeIndex].active = !mockStores[storeIndex].active;
            });
            toast({ title: "Status Updated", description: result.message });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
        setIsProcessing(false);
    };

    const onSubmit = async (data) => {
        setIsProcessing(true);
        const action = editingStore ? updateStoreAction(editingStore.id, data) : addStoreAction(data);
        
        try {
            const result = await action;
            if (result.success) {
                startTransition(() => {
                    // This simulation is imperfect. A real app would refetch or get the new object back.
                    // For now, we'll just refetch from the (mutated) mock data source.
                     setStores([...mockStores]);
                });
                toast({ title: editingStore ? "Store Updated" : "Store Added", description: result.message });
                setDialogOpen(false);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Operation Failed", description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            setIsProcessing(true);
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    throw new Error("Excel file is empty or in an invalid format.");
                }

                const requiredHeaders = ['name', 'city', 'address', 'mission_id'];
                const fileHeaders = Object.keys(json[0]);
                const missingHeaders = requiredHeaders.filter(h => !fileHeaders.includes(h));
                if (missingHeaders.length > 0) {
                     throw new Error(`Missing required Excel columns: ${missingHeaders.join(', ')}`);
                }

                const result = await batchAddStoresAction(json);
                if (result.success) {
                    startTransition(() => setStores([...mockStores]));
                    toast({ title: "Import Successful", description: result.message });
                } else {
                    throw new Error(result.message);
                }

            } catch (error) {
                console.error("Import error:", error);
                toast({ variant: "destructive", title: "Import Failed", description: error.message });
            } finally {
                setIsProcessing(false);
                if(fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsArrayBuffer(file);
    };

    if (isLoading) {
        return <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Loading stores...</span></div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2"><Building className="w-6 h-6" /> Manage Stores</h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls" />
                    <Button onClick={() => fileInputRef.current.click()} variant="outline" size="sm" className="w-full sm:w-auto" disabled={isProcessing}>
                        <Upload className="w-4 h-4 mr-2" /> {isProcessing ? 'Importing...' : 'Import from Excel'}
                    </Button>
                    <Button onClick={handleAddNew} size="sm" className="w-full sm:w-auto" disabled={isProcessing}>
                        <PlusCircle className="w-4 h-4 mr-2" /> Add Store Manually
                    </Button>
                </div>
            </div>

            <Alert className="mb-6 bg-sky-50 border-sky-200 dark:bg-sky-900/50 dark:border-sky-700 text-sky-800 dark:text-sky-200 [&>svg]:text-sky-600 dark:[&>svg]:text-sky-400">
                <Info className="h-4 w-4" />
                <AlertTitle>Excel Import Guide</AlertTitle>
                <AlertDescription>
                    To import stores from an Excel file (.xlsx, .xls), ensure your file has a header row with the following columns. The importer will read the first sheet in the workbook.
                    <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                        <li><strong>Required:</strong> <code>name</code>, <code>city</code>, <code>address</code>, <code>mission_id</code></li>
                        <li><strong>Optional:</strong> <code>latitude</code>, <code>longitude</code>, <code>category</code>, <code>active</code> (defaults to true if omitted)</li>
                    </ul>
                </AlertDescription>
            </Alert>

            <Card className="shadow-sm">
                 <CardHeader>
                    <CardTitle>Store List</CardTitle>
                    <CardDescription>View, add, and manage all stores associated with missions.</CardDescription>
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
                        <div className="relative w-full sm:flex-grow">
                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search all fields..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-full h-9" />
                        </div>
                        <Select value={missionFilter} onValueChange={setMissionFilter}>
                            <SelectTrigger className="w-full sm:w-[220px] h-9">
                                <SelectValue placeholder="Filter by mission" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Missions</SelectItem>
                                {missions.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full sm:w-[180px] h-9">
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {uniqueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Associated Mission</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedStores.length > 0 ? (
                                paginatedStores.map((store) => (
                                    <TableRow key={store.id} className={isProcessing ? 'opacity-50' : ''}>
                                        <TableCell className="font-medium">{store.name}</TableCell>
                                        <TableCell>{store.address}, {store.city}</TableCell>
                                        <TableCell><Badge variant="secondary">{store.category}</Badge></TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{getMissionTitle(store.mission_id)}</TableCell>
                                        <TableCell>
                                            <Badge variant={store.active ? 'default' : 'outline'} className={`capitalize ${store.active ? 'bg-green-100 text-green-800 border-green-300' : ''}`}>{store.active ? 'Active' : 'Inactive'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEdit(store)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(store.id)}>
                                                        {store.active ? <><PowerOff className="mr-2 h-4 w-4" /> Deactivate</> : <><Power className="mr-2 h-4 w-4" /> Activate</>}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center">No stores found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Showing <strong>{paginatedStores.length}</strong> of <strong>{filteredStores.length}</strong> stores.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || pageCount === 0}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {pageCount === 0 ? 0 : currentPage} of {pageCount}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                            disabled={currentPage === pageCount || pageCount === 0}
                        >
                            Next
                        </Button>
                    </div>
                </CardFooter>
            </Card>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>{editingStore ? 'Edit Store' : 'Add New Store'}</DialogTitle>
                            <DialogDescription>Fill in the details for the store below.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="mission_id" className="text-right">Mission</Label>
                                <Controller name="mission_id" control={control} render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a mission" /></SelectTrigger>
                                        <SelectContent><SelectGroup>
                                            {missions.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                                        </SelectGroup></SelectContent>
                                    </Select>
                                )} />
                                {errors.mission_id && <p className="col-span-4 text-xs text-destructive text-right">{errors.mission_id.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" {...register("name")} className="col-span-3" />
                                {errors.name && <p className="col-span-4 text-xs text-destructive text-right">{errors.name.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="address" className="text-right">Address</Label>
                                <Input id="address" {...register("address")} className="col-span-3" />
                                {errors.address && <p className="col-span-4 text-xs text-destructive text-right">{errors.address.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="city" className="text-right">City</Label>
                                <Input id="city" {...register("city")} className="col-span-3" />
                                {errors.city && <p className="col-span-4 text-xs text-destructive text-right">{errors.city.message}</p>}
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">Category</Label>
                                <Controller name="category" control={control} render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <SelectTrigger id="category" className="col-span-3">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {['Supermarché', 'Retail', 'Banque', 'Restaurant', 'Service', 'Entertainment', 'Technology', 'Public Service'].map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )} />
                                {errors.category && <p className="col-span-4 text-xs text-destructive text-right">{errors.category.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="latitude" className="text-right">Latitude</Label>
                                <Input id="latitude" type="number" step="any" {...register("latitude")} className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="longitude" className="text-right">Longitude</Label>
                                <Input id="longitude" type="number" step="any" {...register("longitude")} className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="active" className="text-right">Active</Label>
                                <Controller name="active" control={control} render={({ field }) => (
                                    <Switch id="active" checked={field.value} onCheckedChange={field.onChange} className="col-span-3" />
                                )} />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline" disabled={isProcessing}>Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {editingStore ? 'Save Changes' : 'Create Store'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
}
