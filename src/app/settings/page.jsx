"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { mockUser } from "@/lib/mock-data";
import { 
    ArrowLeft, User, Save, Camera, Settings, 
    CreditCard, Loader2, Globe, Landmark
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateBankingInfoAction } from '@/app/actions/admin-actions';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Banking State
  const [bankingData, setBankingData] = useState(mockUser.bankingInfo || {
    accountHolder: '',
    rib: '',
    bankName: '',
    swift: '',
    country: 'Maroc',
    currency: 'MAD'
  });

  // Profile State
  const [userProfile, setUserProfile] = useState({
    name: mockUser.name,
    email: `${mockUser.id}@example.com`,
    profilePicUrl: mockUser.profilePicUrl,
  });

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(storedTheme === 'dark' || (!storedTheme && prefersDark));
  }, []);

  const handleBankingChange = (e) => {
    const { name, value } = e.target;
    setBankingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveBankingInfo = async () => {
    if (!bankingData.accountHolder || !bankingData.rib || !bankingData.bankName) {
        toast({ 
            variant: "destructive", 
            title: "Champs manquants", 
            description: "Veuillez remplir le titulaire, le RIB et le nom de la banque." 
        });
        return;
    }

    setIsSaving(true);
    try {
        const result = await updateBankingInfoAction(mockUser.id, bankingData);
        if (result.success) {
            toast({ title: "Profil mis à jour", description: "Vos informations bancaires ont été enregistrées avec succès." });
            mockUser.bankingInfo = bankingData; // Sync local mock for simulation
        } else {
            throw new Error(result.message);
        }
    } catch (e) {
        toast({ variant: "destructive", title: "Erreur", description: e.message || "Impossible de sauvegarder." });
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
         <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" /> Retour aux missions</Link>
       </Button>

      <h1 className="text-2xl font-bold mb-8 text-primary flex items-center gap-2">
        <Settings className="w-7 h-7" /> Paramètres du Compte
      </h1>

      <div className="space-y-8">
        {/* Personal Details */}
        <Card className="shadow-sm border-none ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary"/> Profil Personnel
            </CardTitle>
            <CardDescription>Vos informations de base.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 border-b pb-6">
               <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-sm">
                  <AvatarImage src={userProfile.profilePicUrl} />
                  <AvatarFallback>U</AvatarFallback>
               </Avatar>
               <div className="space-y-2 text-center sm:text-left">
                  <Button variant="outline" size="sm" className="h-8">
                    <Camera className="w-3.5 h-3.5 mr-2" /> Changer la photo
                  </Button>
                  <p className="text-[10px] text-muted-foreground italic">Format recommandé: Carré, max 2Mo.</p>
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom Complet</Label>
                    <Input value={userProfile.name} readOnly className="bg-secondary/50 font-medium" />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email de contact</Label>
                    <Input value={userProfile.email} readOnly className="bg-secondary/50 font-medium" />
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Information - NEW SECTION */}
        <Card className="shadow-lg border-l-4 border-l-primary">
            <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                    <CreditCard className="w-5 h-5" /> Coordonnées Bancaires
                </CardTitle>
                <CardDescription>Ces informations sont nécessaires pour le virement de vos dédommagements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="accountHolder" className="flex items-center gap-1.5">
                            Nom du titulaire <span className="text-destructive">*</span>
                        </Label>
                        <Input 
                            id="accountHolder"
                            name="accountHolder" 
                            value={bankingData.accountHolder} 
                            onChange={handleBankingChange} 
                            placeholder="Ex: Jean Dupont" 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="bankName" className="flex items-center gap-1.5">
                            <Landmark className="w-3.5 h-3.5 text-muted-foreground" /> Nom de la Banque <span className="text-destructive">*</span>
                        </Label>
                        <Input 
                            id="bankName"
                            name="bankName" 
                            value={bankingData.bankName} 
                            onChange={handleBankingChange} 
                            placeholder="Ex: CIH, BNP, Société Générale..." 
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="rib">RIB / IBAN <span className="text-destructive">*</span></Label>
                    <Input 
                        id="rib"
                        name="rib" 
                        value={bankingData.rib} 
                        onChange={handleBankingChange} 
                        placeholder="Saisissez votre RIB complet (24 chiffres pour le Maroc)" 
                    />
                    <p className="text-[10px] text-muted-foreground">Vérifiez scrupuleusement votre RIB avant de valider.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="swift">Code SWIFT/BIC</Label>
                        <Input 
                            id="swift"
                            name="swift" 
                            value={bankingData.swift} 
                            onChange={handleBankingChange} 
                            placeholder="Si applicable" 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="country" className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-muted-foreground" /> Pays
                        </Label>
                        <Input 
                            id="country"
                            name="country" 
                            value={bankingData.country} 
                            onChange={handleBankingChange} 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Devise</Label>
                        <Select 
                            value={bankingData.currency} 
                            onValueChange={v => setBankingData(p => ({...p, currency: v}))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MAD">MAD (Dirham)</SelectItem>
                                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                                <SelectItem value="USD">USD (Dollar)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-primary/5 border-t justify-end py-4">
                <Button onClick={handleSaveBankingInfo} disabled={isSaving} className="font-bold">
                    {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Enregistrer mes coordonnées
                </Button>
            </CardFooter>
        </Card>

        {/* Other settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none ring-1 ring-border/50">
                <CardHeader className="pb-3"><CardTitle className="text-base font-bold">Apparence</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/20">
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            <span>Mode Sombre</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Activer le thème nuit.</span>
                        </Label>
                        <Switch checked={isDarkMode} onCheckedChange={handleThemeChange} />
                    </div>
                </CardContent>
            </Card>
            <Card className="border-none ring-1 ring-border/50">
                <CardHeader className="pb-3"><CardTitle className="text-base font-bold">Notifications</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/20">
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            <span>Alertes Email</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Statuts de paiement & missions.</span>
                        </Label>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
