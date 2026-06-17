"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { mockUser } from "@/lib/mock-data";
import { 
    ArrowLeft, User, Bell, Save, Camera, Moon, Sun, 
    Settings, Info, Upload, FileText, MapPin, Cake, 
    Users, CreditCard, Bank, Globe, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateBankingInfoAction } from '@/app/actions/admin-actions';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bankingData, setBankingData] = useState(mockUser.bankingInfo || {
    accountHolder: '',
    rib: '',
    bankName: '',
    swift: '',
    country: 'Maroc',
    currency: 'MAD'
  });

  const [userProfile, setUserProfile] = useState({
    name: mockUser.name,
    email: `${mockUser.id}@example.com`,
    profilePicUrl: mockUser.profilePicUrl,
    city: mockUser.city || '',
    motivation: mockUser.motivation || '',
    birthYear: mockUser.birthYear || '',
    gender: mockUser.gender || 'prefer_not_say',
  });

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = storedTheme === 'dark' || (!storedTheme && prefersDark);
    setIsDarkMode(initialDarkMode);
  }, []);

  const handleBankingChange = (e) => {
    const { name, value } = e.target;
    setBankingData(prev => ({ ...prev, [name]: value }));
  };

  const saveBankingInfo = async () => {
    setIsSaving(true);
    try {
        const result = await updateBankingInfoAction(mockUser.id, bankingData);
        if (result.success) {
            toast({ title: "Succès", description: result.message });
            mockUser.bankingInfo = bankingData; // Sync local mock
        }
    } catch (e) {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de sauvegarder les infos bancaires." });
    } finally {
        setIsSaving(false);
    }
  };

  const handleThemeChange = (checked) => {
    setIsDarkMode(checked);
    const newTheme = checked ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', checked);
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: newTheme }));
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
       <Button asChild variant="outline" size="sm" className="mb-6">
         <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" /> Retour</Link>
       </Button>

      <h1 className="text-2xl font-bold mb-8 text-primary flex items-center gap-2">
        <Settings className="w-7 h-7" /> Paramètres du Compte
      </h1>

      <div className="space-y-8">
        {/* Personal Details */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2"><User className="w-5 h-5 text-primary"/> Profil Personnel</CardTitle>
            <CardDescription>Vos informations visibles par les administrateurs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b pb-6">
               <Avatar className="h-24 w-24 border-2 border-primary/20"><AvatarImage src={userProfile.profilePicUrl} /><AvatarFallback>U</AvatarFallback></Avatar>
               <Button variant="outline" size="sm"><Camera className="w-4 h-4 mr-2" /> Changer la photo</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Nom Complet</Label><Input value={userProfile.name} readOnly className="bg-secondary/50" /></div>
                <div className="space-y-1"><Label>Email</Label><Input value={userProfile.email} readOnly className="bg-secondary/50" /></div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Information */}
        <Card className="shadow-sm border-l-4 border-l-primary">
            <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                    <CreditCard className="w-5 h-5" /> Informations Bancaires
                </CardTitle>
                <CardDescription>Renseignez vos coordonnées pour recevoir vos dédommagements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Nom du titulaire *</Label>
                            <Input name="accountHolder" value={bankingData.accountHolder} onChange={handleBankingChange} placeholder="Ex: Jean Dupont" />
                        </div>
                        <div className="space-y-1">
                            <Label>Banque *</Label>
                            <Input name="bankName" value={bankingData.bankName} onChange={handleBankingChange} placeholder="Ex: CIH, Attijari, BNP..." />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label>RIB / IBAN *</Label>
                        <Input name="rib" value={bankingData.rib} onChange={handleBankingChange} placeholder="Veuillez saisir votre RIB complet (24 chiffres)" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <Label>Code SWIFT/BIC</Label>
                            <Input name="swift" value={bankingData.swift} onChange={handleBankingChange} placeholder="Optionnel" />
                        </div>
                        <div className="space-y-1">
                            <Label>Pays de la banque</Label>
                            <Input name="country" value={bankingData.country} onChange={handleBankingChange} />
                        </div>
                        <div className="space-y-1">
                            <Label>Devise souhaitée</Label>
                            <Select value={bankingData.currency} onValueChange={v => setBankingData(p => ({...p, currency: v}))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MAD">MAD (Dirham)</SelectItem>
                                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                                    <SelectItem value="USD">USD (Dollar)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-primary/5 border-t justify-end py-4">
                <Button onClick={saveBankingInfo} disabled={isSaving}>
                    {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Sauvegarder mon RIB
                </Button>
            </CardFooter>
        </Card>

        {/* Appearance & Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader><CardTitle className="text-base font-bold">Apparence</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label className="flex flex-col gap-1"><span>Mode Sombre</span><span className="text-[10px] text-muted-foreground font-normal">Réduit la fatigue oculaire.</span></Label>
                        <Switch checked={isDarkMode} onCheckedChange={handleThemeChange} />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-base font-bold">Notifications</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label className="flex flex-col gap-1"><span>Alertes Email</span><span className="text-[10px] text-muted-foreground font-normal">Nouveau statut de paiement.</span></Label>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
