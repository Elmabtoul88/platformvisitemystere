'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2, Users, BarChart3, ShieldCheck, 
  ArrowRight, Star, Globe, Target, Building2, TrendingUp
} from 'lucide-react';
import Image from 'next/image';
import images from '@/app/lib/placeholder-images.json';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Emberton Style */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <Image 
          src={images["hero-bg"].url} 
          alt="Luxury Business" 
          fill 
          className="object-cover brightness-[0.25] scale-105"
          priority
          data-ai-hint={images["hero-bg"].hint}
        />
        <div className="container relative z-10 px-4 text-center text-white space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-4 duration-1000">
            Conseil & Audit de Luxe
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-top-8 duration-1000 delay-200">
            Élevez les standards de votre <span className="text-accent italic font-normal serif">Qualité de Service</span>.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            SEC Visite Mystère est le partenaire stratégique des marques d'exception. Nous transformons chaque interaction client en un levier de croissance durable.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8 animate-in fade-in zoom-in-95 duration-1000 delay-500">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-black px-10 h-16 text-lg rounded-xl shadow-2xl shadow-accent/20 transition-all hover:scale-105" asChild>
              <Link href="/signup">Rejoindre nos Shoppers</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-black px-10 h-16 text-lg rounded-xl backdrop-blur-sm transition-all" asChild>
              <Link href="/services">Solutions Business</Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* Trust Section - Global Reach */}
      <section className="py-16 bg-primary border-y border-white/5 overflow-hidden">
        <div className="container px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 items-center opacity-80">
            {[
              { label: "Expertise Globale", icon: Globe, val: "25+ Pays" },
              { label: "Précision Audit", icon: Target, val: "99.9%" },
              { label: "Réseau Shoppers", icon: Users, val: "15,000+" },
              { label: "Performance", icon: TrendingUp, val: "+30% ROI" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 text-center text-white">
                <stat.icon className="w-6 h-6 text-accent" />
                <div className="text-2xl font-black tracking-tight">{stat.val}</div>
                <div className="text-[10px] uppercase tracking-widest text-primary-foreground/50 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Emberton Advantage */}
      <section className="py-32 bg-white relative">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-end mb-24">
            <div className="lg:w-2/3 space-y-6">
              <h2 className="text-sm font-black text-accent uppercase tracking-[0.3em]">Pourquoi nous choisir</h2>
              <h3 className="text-4xl md:text-6xl font-black text-primary leading-tight">
                Une vision 360° de votre <br/> performance retail.
              </h3>
            </div>
            <div className="lg:w-1/3">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Notre méthodologie rigoureuse s'appuie sur plus de 15 ans d'expérience auprès des leaders du luxe et de la distribution spécialisée.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                icon: ShieldCheck, 
                title: "Excellence Opérationnelle", 
                desc: "Nous auditons le respect de vos process et l'intégrité de votre image de marque sur tous vos points de contact." 
              },
              { 
                icon: BarChart3, 
                title: "Intelligence Analytique", 
                desc: "Nos algorithmes transforment les données brutes en insights stratégiques exploitables immédiatement par vos managers." 
              },
              { 
                icon: Building2, 
                title: "Impact Local, Vision Globale", 
                desc: "Un accompagnement sur mesure pour vos réseaux nationaux et internationaux, garantissant une cohérence mondiale." 
              }
            ].map((feature, i) => (
              <div key={i} className="group p-10 rounded-[2rem] bg-secondary/30 hover:bg-primary transition-all duration-500 hover:-translate-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary mb-8 shadow-sm group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-white/70 transition-colors">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-32 bg-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 100 L100 0 L100 100 Z" fill="currentColor"/></svg>
        </div>
        <div className="container px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
              <Image 
                src={images["service-audit"].url} 
                alt="Our Methodology" 
                fill 
                className="object-cover"
                data-ai-hint={images["service-audit"].hint}
              />
              <div className="absolute inset-0 bg-primary/20" />
            </div>
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-sm font-black text-accent uppercase tracking-[0.3em]">Notre Méthodologie</h2>
                <h3 className="text-4xl md:text-5xl font-black leading-tight">L'art de l'audit invisible.</h3>
                <p className="text-xl text-primary-foreground/60 leading-relaxed">
                  Notre processus exclusif garantit une immersion totale et une objectivité absolue lors de chaque mission.
                </p>
              </div>

              <div className="space-y-8">
                {[
                  { step: "01", title: "Ingénierie du Scénario", desc: "Création de protocoles d'audit basés sur vos KPI stratégiques." },
                  { step: "02", title: "Curation des Shoppers", desc: "Sélection rigoureuse des profils via notre algorithme de matching." },
                  { step: "03", title: "Certification des Données", desc: "Contrôle qualité systématique de chaque rapport par nos experts." },
                  { step: "04", title: "Pilotage & Action", desc: "Restitution sur dashboard interactif pour un pilotage en temps réel." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="text-5xl font-black text-accent/20 group-hover:text-accent transition-colors duration-500">{item.step}</div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold">{item.title}</h4>
                      <p className="text-primary-foreground/50 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 bg-accent relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-[40px] border-white/10 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none" />
        <div className="container px-4 relative z-10 text-center space-y-12">
          <h2 className="text-4xl md:text-7xl font-black text-accent-foreground tracking-tight max-w-4xl mx-auto">
            Prêt à redéfinir l'excellence ?
          </h2>
          <p className="text-xl md:text-2xl text-accent-foreground/70 max-w-2xl mx-auto font-medium">
            Contactez nos consultants pour une étude personnalisée de vos besoins et découvrez la puissance de nos solutions d'audit.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90 font-black px-12 h-20 text-xl rounded-2xl shadow-xl transition-all hover:scale-105" asChild>
              <Link href="/contact">Démarrer un Projet</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
