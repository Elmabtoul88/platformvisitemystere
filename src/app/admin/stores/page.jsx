
'use client';

import React, { useState, useMemo, useTransition, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Edit, Power, PowerOff, Loader2, Building, PlusCircle, Upload } from 'lucide-react';
import { mockStores, mockMissions } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as XLSX from 'xlsx';
import { addStoreAction, updateStoreAction, toggleStoreStatusAction, batchAddStoresAction } from '../../actions/admin-actions';

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
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTransitioning, startTransition] = useTransition();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingStore, setEditingStore] = useState(null);
    const fileInputRef = useRef(null);

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

    const filteredStores = useMemo(() => {
        return stores.filter(store =>
            store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.mission_id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [stores, searchTerm]);

    const getMissionTitle = (missionId) => missions.find(m => m.id === missionId)?.title || missionId;

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
                    if (editingStore) {
                        setStores(prev => prev.map(s => s.id === editingStore.id ? { ...s, ...data } : s));
                    } else {
                        // For simulation, we add a placeholder. A real app would refetch or get the new object back.
                        setStores(prev => [...prev, { id: `new-${Date.now()}`, ...data }]);
                    }
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

                // Basic validation of headers
                const requiredHeaders = ['name', 'city', 'address', 'latitude', 'longitude', 'category', 'mission_id', 'active'];
                const fileHeaders = Object.keys(json[0]);
                const missingHeaders = requiredHeaders.filter(h => !fileHeaders.includes(h));
                if (missingHeaders.length > 3) { // Allow some optional fields
                     throw new Error(`Missing required Excel columns: ${missingHeaders.join(', ')}`);
                }

                const result = await batchAddStoresAction(json);
                if (result.success) {
                    // Refetch or update state. For simulation, just assume it worked and refetch from mock.
                    startTransition(() => setStores(mockStores));
                    toast({ title: "Import Successful", description: result.message });
                } else {
                    throw new Error(result.message);
                }

            } catch (error) {
                console.error("Import error:", error);
                toast({ variant: "destructive", title: "Import Failed", description: error.message });
            } finally {
                setIsProcessing(false);
                // Reset file input
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

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Store List</CardTitle>
                    <CardDescription>View, add, and manage all stores associated with missions.</CardDescription>
                    <div className="relative pt-2">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search stores..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-full md:w-1/2 lg:w-1/3" />
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
                            {filteredStores.length > 0 ? (
                                filteredStores.map((store) => (
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <Input id="category" {...register("category")} placeholder="e.g., Supermarché" className="col-span-3" />
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
