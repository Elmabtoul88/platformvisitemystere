
'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, History, Target, Eye, ShieldCheck } from 'lucide-react';
import images from '@/app/lib/placeholder-images.json';

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="container px-4">
          <h1 className="text-4xl md:text-5xl font-black mb-4">À Propos de SEC Visite Mystère</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">Leader de l'audit d'expérience client au service des marques d'exception.</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 bg-background">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src={images["about-team"].url} 
                alt="Corporate Team" 
                fill 
                className="object-cover"
                data-ai-hint={images["about-team"].hint}
              />
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-primary">Notre Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Fondée il y a plus de 15 ans, SEC Visite Mystère s'est donnée pour mission d'apporter une vision objective et rigoureuse de la qualité de service. Nous croyons que chaque interaction client est une opportunité de fidélisation et de croissance.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: Target, title: "Précision", desc: "Des audits minutieux basés sur des faits réels." },
                  { icon: History, title: "Expérience", desc: "Plus d'une décennie au service du retail." },
                  { icon: Eye, title: "Vision", desc: "Identifier les détails qui font la différence." },
                  { icon: ShieldCheck, title: "Intégrité", desc: "Une méthodologie certifiée et impartiale." }
                ].map((val, i) => (
                  <div key={i} className="space-y-2">
                    <val.icon className="w-6 h-6 text-accent" />
                    <h4 className="font-bold">{val.title}</h4>
                    <p className="text-xs text-muted-foreground">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-24 bg-secondary/30">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-black text-primary mb-16">Nos Secteurs d'Expertise</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {['Retail & Luxe', 'Banque & Assurance', 'Hôtellerie', 'Restauration', 'Automobile', 'Beauté'].map((sector, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl shadow-sm border border-border/50 font-bold text-sm text-primary hover:border-accent transition-colors">
                {sector}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
