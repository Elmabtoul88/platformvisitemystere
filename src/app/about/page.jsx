'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, History, Target, Eye, ShieldCheck, Award, Briefcase, Handshake } from 'lucide-react';
import images from '@/app/lib/placeholder-images.json';

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <section className="py-32 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 animate-in fade-in slide-in-from-top-4 duration-700">L'Héritage SEC</h1>
            <p className="text-xl md:text-2xl text-primary-foreground/60 font-light max-w-3xl mx-auto leading-relaxed">
              Plus de 15 ans au service de l'excellence opérationnelle et de l'expérience client premium.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission - Emberton Style */}
      <section className="py-32 bg-background">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
              <Image 
                src={images["about-team"].url} 
                alt="Corporate Leadership" 
                fill 
                className="object-cover"
                data-ai-hint={images["about-team"].hint}
              />
              <div className="absolute inset-0 bg-primary/10" />
            </div>
            <div className="space-y-10">
              <div className="space-y-6">
                <h2 className="text-sm font-black text-accent uppercase tracking-[0.3em]">Notre Mission</h2>
                <h3 className="text-4xl font-black text-primary leading-tight">Intégrité, Précision et Vision Stratégique.</h3>
                <p className="text-lg text-muted-foreground leading-relaxed italic">
                  "Dans un monde où l'attention client est devenue la monnaie la plus précieuse, nous fournissons aux marques les yeux et les oreilles nécessaires pour ne jamais faillir à leur promesse."
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Fondée sur les principes de rigueur et d'excellence, SEC Visite Mystère s'est imposée comme le leader de l'audit d'expérience client. Nous ne nous contentons pas de rapporter des faits ; nous dessinons des trajectoires d'amélioration continue.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-8">
                {[
                  { icon: Target, title: "Précision Millimétrée", desc: "Des protocoles d'audit validés scientifiquement pour une donnée pure." },
                  { icon: History, title: "Longévité & Stabilité", desc: "Un partenaire de confiance accompagnant ses clients sur le long terme." },
                  { icon: Award, title: "Excellence Certifiée", desc: "Une méthodologie rigoureuse répondant aux plus hauts standards internationaux." },
                  { icon: Handshake, title: "Engagement Partenarial", desc: "Nous agissons comme une extension de vos équipes internes." }
                ].map((val, i) => (
                  <div key={i} className="space-y-3 p-6 rounded-2xl bg-secondary/20 border border-border/50 hover:border-accent transition-all duration-300">
                    <val.icon className="w-8 h-8 text-accent" />
                    <h4 className="font-bold text-primary">{val.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Sectors */}
      <section className="py-32 bg-primary">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4 text-white">
            <h2 className="text-sm font-black text-accent uppercase tracking-[0.3em]">Nos Secteurs d'Expertise</h2>
            <h3 className="text-4xl font-black tracking-tight">Une présence multi-sectorielle.</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { title: "Retail & Luxe", icon: Briefcase },
              { title: "Banque & Assurance", icon: ShieldCheck },
              { title: "Hôtellerie", icon: Building2 },
              { title: "Restauration", icon: Star },
              { title: "Automobile", icon: Target },
              { title: "Beauté & Bien-être", icon: Eye },
              { title: "Services Publics", icon: Globe },
              { title: "Distribution Spécialisée", icon: Briefcase }
            ].map((sector, i) => (
              <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-4 text-center group hover:bg-accent transition-all duration-500 cursor-default">
                <sector.icon className="w-8 h-8 text-accent group-hover:text-primary transition-colors" />
                <span className="font-bold text-white group-hover:text-primary transition-colors">{sector.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Team/Vision CTA */}
      <section className="py-32 bg-white">
        <div className="container px-4 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-black text-primary">Une Vision Globale de l'Excellence</h2>
            <p className="text-muted-foreground">
              De Paris à Casablanca, nos équipes travaillent de concert pour offrir une qualité d'audit unifiée et irréprochable.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 text-left">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-primary border-b-2 border-accent w-fit pb-2">Ambition</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Devenir le référent mondial de l'audit invisible et de l'intelligence retail.</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-primary border-b-2 border-accent w-fit pb-2">Intégrité</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Garantir l'impartialité totale de nos évaluations par des processus de contrôle stricts.</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-primary border-b-2 border-accent w-fit pb-2">Innovation</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Investir continuellement dans les technologies d'analyse de données et d'IA.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
