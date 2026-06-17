
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Search, LineChart, ShieldCheck, Users2, Trophy, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import images from '@/app/lib/placeholder-images.json';
import Link from 'next/link';

export default function ServicesPage() {
  const services = [
    {
      title: "Visites Mystères en Magasin",
      icon: Search,
      img: images["service-mystery"].url,
      desc: "L'évaluation la plus authentique de votre parcours de vente physique. Nos shoppers simulent des achats réels pour tester vos équipes.",
      benefits: ["Accueil & Prise en charge", "Techniques de vente", "Qualité du conseil", "Respect du merchandising"]
    },
    {
      title: "Audits Qualité & Process",
      icon: ShieldCheck,
      img: images["service-audit"].url,
      desc: "Vérifiez que vos procédures opérationnelles sont respectées à la lettre sur l'ensemble de votre réseau.",
      benefits: ["Hygiène & Sécurité", "Procédures de caisse", "Ouverture & Fermeture", "Gestion des flux"]
    },
    {
      title: "Analyses de la Performance",
      icon: LineChart,
      img: images["service-analysis"].url,
      desc: "Transformez vos données d'audit en leviers de croissance grâce à nos rapports décisionnels avancés.",
      benefits: ["Benchmark concurrentiel", "Plans d'action ciblés", "Évolution temporelle", "Coaching d'équipes"]
    }
  ];

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-primary text-white text-center">
        <div className="container px-4">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-accent">Nos Solutions d'Expertise</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">Des services sur-mesure pour piloter l'excellence de votre réseau.</p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container px-4 space-y-24">
          {services.map((service, i) => (
            <div key={i} className={`grid lg:grid-cols-2 gap-16 items-center ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={`space-y-8 ${i % 2 !== 0 ? 'lg:order-2' : ''}`}>
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent font-bold text-xs uppercase tracking-widest rounded-full">
                    <service.icon className="w-3 h-3" /> Expertise SEC
                  </div>
                  <h2 className="text-3xl font-black text-primary leading-tight">{service.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{service.desc}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.benefits.map((benefit, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm font-medium">
                      <Trophy className="w-4 h-4 text-accent shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
              <div className={`relative aspect-video rounded-3xl overflow-hidden shadow-2xl ${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
                <Image src={service.img} alt={service.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-primary/10" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container px-4 text-center space-y-8">
          <h2 className="text-3xl font-black text-primary">Besoin d'un accompagnement spécifique ?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Nos experts conçoivent des protocoles d'audit adaptés à vos enjeux stratégiques.</p>
          <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-shadow">
            <Link href="/contact" className="flex items-center gap-2">Discuter de vos besoins <ArrowRight className="w-4 h-4" /></Link>
          </button>
        </div>
      </section>
    </div>
  );
}
