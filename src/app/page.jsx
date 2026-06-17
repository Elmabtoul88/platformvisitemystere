
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2, Users, BarChart3, ShieldCheck, 
  ArrowRight, Star, Quote, MapPin, Building2, MousePointerClick
} from 'lucide-react';
import Image from 'next/image';
import images from '@/app/lib/placeholder-images.json';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <Image 
          src={images["hero-bg"].url} 
          alt="Luxury Business" 
          fill 
          className="object-cover brightness-[0.3]"
          priority
          data-ai-hint={images["hero-bg"].hint}
        />
        <div className="container relative z-10 px-4 text-center text-white space-y-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-top-4 duration-700">
            L'Excellence de votre <span className="text-accent">Expérience Client</span>, Notre Mission.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            SEC Visite Mystère accompagne les marques premium dans l'audit et l'amélioration continue de leur qualité de service.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 animate-in fade-in zoom-in-95 duration-700 delay-200">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold px-8 h-14" asChild>
              <Link href="/signup">Devenir Shopper</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold px-8 h-14" asChild>
              <Link href="/services">Nos Solutions Business</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary text-white">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-black">15+</div>
              <p className="text-xs uppercase tracking-widest text-primary-foreground/70 font-bold">Années d'expertise</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-black">50k+</div>
              <p className="text-xs uppercase tracking-widest text-primary-foreground/70 font-bold">Visites réalisées</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-black">200+</div>
              <p className="text-xs uppercase tracking-widest text-primary-foreground/70 font-bold">Clients actifs</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-black">98%</div>
              <p className="text-xs uppercase tracking-widest text-primary-foreground/70 font-bold">Satisfaction client</p>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-24 bg-background">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-primary">Pourquoi choisir SEC Visite Mystère ?</h2>
            <div className="h-1.5 w-20 bg-accent mx-auto rounded-full" />
            <p className="text-muted-foreground">Une approche rigoureuse pour des résultats actionnables.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "Évaluation Client", desc: "Percevez votre point de vente à travers les yeux de vos clients." },
              { icon: ShieldCheck, title: "Contrôle Qualité", desc: "Assurez-vous du respect strict de vos standards de marque." },
              { icon: BarChart3, title: "Analyse Data", desc: "Des tableaux de bord dynamiques pour piloter vos performances." },
              { icon: Building2, title: "Rapports Détaillés", desc: "Des audits complets avec preuves photos et audio." }
            ].map((feature, i) => (
              <Card key={i} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-secondary/30">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-black text-primary">Comment ça fonctionne ?</h2>
              <div className="space-y-8">
                {[
                  { step: "01", title: "Définition du scénario", desc: "Nous co-construisons avec vous le questionnaire et le parcours client idéal." },
                  { step: "02", title: "Sélection des Shoppers", desc: "Nous recrutons des profils correspondant exactement à votre cible client." },
                  { step: "03", title: "Visite & Audit", desc: "Le shopper réalise sa mission incognito en suivant le scénario établi." },
                  { step: "04", title: "Restitution des données", desc: "Vous recevez un rapport certifié et analysé sous 48h sur votre plateforme." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="text-4xl font-black text-accent/30 tabular-nums">{item.step}</div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src={images["service-mystery"].url} 
                alt="Working" 
                fill 
                className="object-cover"
                data-ai-hint={images["service-mystery"].hint}
              />
              <div className="absolute inset-0 bg-primary/20" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container px-4 relative z-10 text-center space-y-8 text-white">
          <h2 className="text-3xl md:text-5xl font-black">Prêt à élever vos standards ?</h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Contactez nos experts pour une démonstration personnalisée de notre plateforme et de nos méthodologies d'audit.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold px-10 h-14" asChild>
              <Link href="/contact">Démarrer un projet</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
