'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Search, LineChart, ShieldCheck, Users2, Trophy, ArrowRight, Eye, ClipboardCheck, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import images from '@/app/lib/placeholder-images.json';
import Link from 'next/link';

export default function ServicesPage() {
  const services = [
    {
      title: "Visites Mystères Stratégiques",
      icon: Eye,
      img: images["service-mystery"].url,
      desc: "L'évaluation la plus authentique de votre parcours client. Nos shoppers experts simulent des interactions réelles pour tester la réactivité, l'accueil et le savoir-faire de vos équipes.",
      benefits: ["Audit de l'accueil & prise en charge", "Vérification des techniques de vente", "Évaluation du conseil expert", "Contrôle du cross-selling"]
    },
    {
      title: "Audits de Conformité & Process",
      icon: ClipboardCheck,
      img: images["service-audit"].url,
      desc: "Vérifiez que vos standards opérationnels sont appliqués rigoureusement sur l'ensemble de votre réseau. Idéal pour les franchises et les réseaux intégrés.",
      benefits: ["Respect du Merchandising", "Hygiène, Sécurité & Environnement", "Procédures de caisse & encaissement", "Gestion des flux et attentes"]
    },
    {
      title: "Analyses de Performance (Business Intelligence)",
      icon: LayoutDashboard,
      img: images["service-analysis"].url,
      desc: "Transformez vos données d'audit en décisions stratégiques. Nos tableaux de bord interactifs permettent un pilotage précis de votre qualité de service.",
      benefits: ["Benchmark concurrentiel direct", "Évolution temporelle des KPI", "Plans d'action ciblés par région", "Identification des 'Best Practices'"]
    }
  ];

  return (
    <div className="flex flex-col">
      <section className="py-32 bg-primary text-white text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/10" />
        <div className="container px-4 relative z-10 space-y-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-accent">Solutions d'Audit</h1>
          <p className="text-xl text-primary-foreground/60 max-w-2xl mx-auto font-light leading-relaxed">
            Une expertise métier sur-mesure pour piloter l'excellence de votre réseau de distribution.
          </p>
        </div>
      </section>

      <section className="py-32 bg-background">
        <div className="container px-4 space-y-32">
          {services.map((service, i) => (
            <div key={i} className={`flex flex-col lg:flex-row gap-20 items-center ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="lg:w-1/2 space-y-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-accent/10 text-accent font-black text-xs uppercase tracking-[0.2em] rounded-full border border-accent/20">
                    <service.icon className="w-4 h-4" /> Expertise Métier
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-primary leading-tight">{service.title}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">{service.desc}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {service.benefits.map((benefit, j) => (
                    <div key={j} className="flex items-center gap-4 text-sm font-bold text-primary group">
                      <div className="w-2 h-2 rounded-full bg-accent group-hover:scale-150 transition-transform" />
                      {benefit}
                    </div>
                  ))}
                </div>
                
                <Button className="bg-primary text-white h-14 px-8 rounded-xl font-black text-md hover:shadow-2xl transition-all" asChild>
                    <Link href="/contact">En savoir plus <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
              </div>
              <div className="lg:w-1/2 relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
                <Image src={service.img} alt={service.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Specificity Section */}
      <section className="py-32 bg-secondary/30 relative">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-4xl font-black text-primary">Un Accompagnement Personnalisé</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
                <Card className="p-8 border-none shadow-xl rounded-[2rem]">
                    <h4 className="text-xl font-black mb-4 text-primary">Conception sur Mesure</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Chaque marque est unique. Nous co-construisons vos questionnaires d'audit pour qu'ils reflètent fidèlement votre ADN et vos objectifs de vente.
                    </p>
                </Card>
                <Card className="p-8 border-none shadow-xl rounded-[2rem]">
                    <h4 className="text-xl font-black mb-4 text-primary">Shoppers Experts</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Nos shoppers ne sont pas de simples visiteurs. Ils sont formés et briefés spécifiquement pour chaque mission, garantissant une détection fine des écarts.
                    </p>
                </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-primary">
        <div className="container px-4 text-center space-y-10">
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Optimisez vos performances <br/> dès aujourd'hui.
          </h2>
          <p className="text-primary-foreground/60 max-w-xl mx-auto text-lg font-light">
            Contactez nos experts pour élaborer ensemble votre futur programme d'audit.
          </p>
          <div className="flex justify-center gap-6">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-black px-12 h-16 text-lg rounded-2xl" asChild>
                <Link href="/contact" className="flex items-center gap-2">Prendre rendez-vous <ArrowRight className="w-5 h-5" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
