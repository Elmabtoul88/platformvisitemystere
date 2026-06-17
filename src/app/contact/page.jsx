
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, MessageSquare, Building2, Facebook, Linkedin, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "Message envoyé !",
        description: "Nous reviendrons vers vous dans les plus brefs délais.",
      });
      e.target.reset();
    }, 1500);
  };

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <section className="py-20 bg-primary text-white text-center">
        <div className="container px-4">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-accent">Contactez-nous</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">Vous avez une question ou un projet ? Nos équipes sont à votre écoute.</p>
        </div>
      </section>

      <section className="py-24 container px-4">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-primary">Coordonnées</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0"><MapPin className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-sm">Siège Social</h4><p className="text-sm text-muted-foreground">123 Avenue de l'Expérience, 75008 Paris, France</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0"><Phone className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-sm">Téléphone</h4><p className="text-sm text-muted-foreground">+33 (0)1 23 45 67 89</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0"><Mail className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-sm">Email</h4><p className="text-sm text-muted-foreground">contact@sec-visitemystere.com</p></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-primary">Suivez-nous</h3>
              <div className="flex gap-3">
                {[Linkedin, Twitter, Facebook].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 border rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"><Icon className="w-5 h-5" /></button>
                ))}
              </div>
            </div>

            <div className="h-64 relative rounded-2xl overflow-hidden border">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.2922926156743895!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sTour%20Eiffel!5e0!3m2!1sfr!2sfr!4v1638210000000!5m2!1sfr!2sfr" 
                className="absolute inset-0 w-full h-full grayscale contrast-125 opacity-80"
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
              />
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-none ring-1 ring-border/50">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-2xl font-black text-primary flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" /> Envoyez-nous un message
                </CardTitle>
                <CardDescription>Nos conseillers vous répondent sous 24h ouvrées.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom Complet *</Label>
                    <Input id="name" placeholder="Ex: Jean Dupont" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Professionnel *</Label>
                    <Input id="email" type="email" placeholder="j.dupont@entreprise.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" placeholder="+33 6 00 00 00 00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Société</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="company" className="pl-10" placeholder="Nom de votre entreprise" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="message">Votre Message *</Label>
                    <Textarea id="message" className="min-h-[150px]" placeholder="Détaillez votre besoin ici..." required />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" size="lg" disabled={isSending} className="w-full md:w-auto px-12 h-14 font-black">
                      {isSending ? "Envoi en cours..." : <><Send className="w-4 h-4 mr-2" /> Envoyer la demande</>}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
