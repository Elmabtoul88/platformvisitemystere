"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  History,
  Target,
  Eye,
  ShieldCheck,
  Award,
  Briefcase,
  Handshake,
  Building2,
  Star,
  Globe,
  Sparkles,
  Users,
  TrendingUp,
  Clock,
  Quote,
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import images from "@/app/lib/placeholder-images.json";
import Link from "next/link";

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { label: "Années d'Expertise", value: "15+", icon: Clock },
    { label: "Clients Premium", value: "500+", icon: Building2 },
    { label: "Shoppers Experts", value: "1,500+", icon: Users },
    { label: "Taux de Satisfaction", value: "99.8%", icon: TrendingUp },
  ];

  const values = [
    {
      icon: Target,
      title: "Précision Millimétrée",
      desc: "Des protocoles d'audit validés scientifiquement pour une donnée pure et exploitable.",
      color: "from-[#D6C799] to-[#999999]",
    },
    {
      icon: History,
      title: "Longévité & Stabilité",
      desc: "Un partenaire de confiance accompagnant ses clients sur le long terme.",
      color: "from-[#D6C799] to-[#999999]",
    },
    {
      icon: Award,
      title: "Excellence Certifiée",
      desc: "Une méthodologie rigoureuse répondant aux plus hauts standards internationaux.",
      color: "from-[#D6C799] to-[#999999]",
    },
    {
      icon: Handshake,
      title: "Engagement Partenarial",
      desc: "Nous agissons comme une extension de vos équipes internes.",
      color: "from-[#D6C799] to-[#999999]",
    },
  ];

  const sectors = [
    { title: "Retail & Luxe", icon: Briefcase },
    { title: "Banque & Assurance", icon: ShieldCheck },
    { title: "Hôtellerie", icon: Building2 },
    { title: "Restauration", icon: Star },
    { title: "Automobile", icon: Target },
    { title: "Beauté & Bien-être", icon: Eye },
    { title: "Services Publics", icon: Globe },
    { title: "Distribution Spécialisée", icon: Briefcase },
  ];

  const teamMembers = [
    {
      name: "Sophie Dubois",
      role: "Directrice Générale",
      avatar: "SD",
      gradient: "from-[#D6C799] to-[#999999]",
    },
    {
      name: "Thomas Martin",
      role: "Directeur des Opérations",
      avatar: "TM",
      gradient: "from-[#D6C799] to-[#999999]",
    },
    {
      name: "Isabelle Lambert",
      role: "Directrice Audit & Qualité",
      avatar: "IL",
      gradient: "from-[#D6C799] to-[#999999]",
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section - Élégant et Moderne */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#041F40] via-[#193356] to-[#041F40]">
        <div className="absolute inset-0">
          <Image
            src={images["about-team"]?.url || "/images/about-team.jpg"}
            alt="About SEC"
            fill
            className="object-cover opacity-10 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#041F40] via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D6C799]/10 via-transparent to-transparent"></div>
        </div>

        <div className="container relative z-10 px-4 text-center text-white py-20">
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#D6C799]/20 backdrop-blur-sm border border-[#D6C799]/30 text-[#D6C799] text-xs font-bold uppercase tracking-[0.2em] mb-6 transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Notre Héritage
          </div>

          <h1
            className={`text-5xl md:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-tight transition-all duration-1000 delay-200 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            L'
            <span className="bg-gradient-to-r from-[#D6C799] via-[#D6C799]/80 to-[#999999] bg-clip-text text-transparent">
              Excellence
            </span>{" "}
            Emberton
          </h1>

          <p
            className={`text-xl text-[#999999] max-w-3xl mx-auto font-light leading-relaxed mt-6 transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            Plus de 15 ans au service de l'excellence opérationnelle et de
            l'expérience client de prestige.
          </p>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-16 bg-[#041F40]/90 backdrop-blur-sm border-y border-[#999999]/10">
        <div className="container px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="group flex flex-col items-center text-center p-6 rounded-2xl bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:scale-105 hover:bg-[#193356]/70"
              >
                <div className="p-3 rounded-full bg-[#D6C799]/10 group-hover:bg-[#D6C799]/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-[#D6C799]" />
                </div>
                <div className="text-3xl md:text-4xl font-black text-white mt-3 bg-gradient-to-r from-white to-[#999999] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-widest text-[#999999] font-bold mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-gradient-to-b from-[#041F40] to-[#193356] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D6C799]/5 via-transparent to-transparent"></div>
        <div className="container px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl shadow-[#D6C799]/10 group">
              <Image
                src={images["about-team"]?.url || "/images/about-team.jpg"}
                alt="Corporate Leadership"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041F40]/50 via-transparent to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#D6C799]/20 to-transparent"></div>

              {/* Badge flottant */}
              <div className="absolute bottom-6 left-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex items-center gap-2 text-white text-sm">
                  <Award className="w-4 h-4 text-[#D6C799]" />
                  <span className="font-medium">Depuis 2008</span>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6C799]/10 border border-[#D6C799]/20">
                  <Target className="w-4 h-4 text-[#D6C799]" />
                  <span className="text-xs font-bold text-[#D6C799] uppercase tracking-[0.2em]">
                    Notre Mission
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  Intégrité, Précision et{" "}
                  <span className="text-[#D6C799]">Vision Stratégique</span>
                </h2>
                <div className="relative pl-6 border-l-2 border-[#D6C799]">
                  <p className="text-lg text-[#999999] leading-relaxed italic">
                    "Dans un monde où l'attention client est devenue la monnaie
                    la plus précieuse, nous fournissons aux marques les yeux et
                    les oreilles nécessaires pour ne jamais faillir à leur
                    promesse."
                  </p>
                </div>
                <p className="text-[#999999] leading-relaxed">
                  Fondée sur les principes de rigueur et d'excellence, Emberton
                  Group s'est imposée comme le leader de l'audit d'expérience client
                  et du shopping mystère haut de gamme. Nous ne nous contentons pas de rapporter
                  des faits ; nous dessinons des trajectoires d'amélioration
                  continue pour vos équipes.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {values.map((val, i) => (
                  <div
                    key={i}
                    className="group p-6 rounded-2xl bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:-translate-y-1"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${val.color} flex items-center justify-center text-[#041F40] mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <val.icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-white mb-2">{val.title}</h4>
                    <p className="text-xs text-[#999999] leading-relaxed group-hover:text-[#999999]/80 transition-colors">
                      {val.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Sectors */}
      <section className="py-24 bg-[#041F40] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#D6C799]/5 via-transparent to-transparent"></div>
        <div className="container px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6C799]/10 border border-[#D6C799]/20">
              <Globe className="w-4 h-4 text-[#D6C799]" />
              <span className="text-xs font-bold text-[#D6C799] uppercase tracking-[0.2em]">
                Notre Expertise
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Une Présence{" "}
              <span className="text-[#D6C799]">Multi-sectorielle</span>
            </h2>
            <p className="text-[#999999]">
              Des secteurs variés où notre expertise fait la différence.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sectors.map((sector, i) => (
              <div
                key={i}
                className="group p-8 bg-[#193356]/50 border border-[#999999]/10 rounded-2xl flex flex-col items-center gap-4 text-center hover:bg-[#D6C799]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:-translate-y-2 cursor-default"
              >
                <div className="p-3 rounded-full bg-[#D6C799]/10 group-hover:bg-[#D6C799]/20 transition-colors">
                  <sector.icon className="w-6 h-6 text-[#D6C799] group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-bold text-white group-hover:text-[#D6C799] transition-colors text-sm">
                  {sector.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-[#193356]/50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6C799]/10 border border-[#D6C799]/20 mb-4">
              <Users className="w-4 h-4 text-[#D6C799]" />
              <span className="text-xs font-bold text-[#D6C799] uppercase tracking-[0.2em]">
                Notre Équipe
              </span>
            </div>
            <h2 className="text-4xl font-black text-white">
              Des Experts <span className="text-[#D6C799]">Passionnés</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-[#041F40]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:-translate-y-2 text-center"
              >
                <div
                  className={`w-24 h-24 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-[#041F40] text-3xl font-bold mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  {member.avatar}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-[#999999]">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 bg-[#041F40] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D6C799]/5 via-transparent to-transparent"></div>
        <div className="container px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6C799]/10 border border-[#D6C799]/20">
                <Award className="w-4 h-4 text-[#D6C799]" />
                <span className="text-xs font-bold text-[#D6C799] uppercase tracking-[0.2em]">
                  Notre Vision
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white">
                Une Vision Globale de{" "}
                <span className="text-[#D6C799]">l'Excellence</span>
              </h2>
              <p className="text-[#999999] max-w-2xl mx-auto">
                De Paris à Casablanca, nos équipes travaillent de concert pour
                offrir une qualité d'audit unifiée et irréprochable.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="p-8 rounded-2xl bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:-translate-y-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D6C799] to-[#999999] flex items-center justify-center text-[#041F40] mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Ambition</h4>
                <p className="text-sm text-[#999999] leading-relaxed">
                  Devenir le référent mondial de l'audit invisible et de
                  l'intelligence retail.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:-translate-y-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D6C799] to-[#999999] flex items-center justify-center text-[#041F40] mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Intégrité</h4>
                <p className="text-sm text-[#999999] leading-relaxed">
                  Garantir l'impartialité totale de nos évaluations par des
                  processus de contrôle stricts.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:-translate-y-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D6C799] to-[#999999] flex items-center justify-center text-[#041F40] mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  Innovation
                </h4>
                <p className="text-sm text-[#999999] leading-relaxed">
                  Investir continuellement dans les technologies d'analyse de
                  données et d'IA.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#D6C799] via-[#999999] to-[#193356] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#041F40]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container px-4 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#041F40]/20 backdrop-blur-sm border border-[#041F40]/20">
            <Sparkles className="w-4 h-4 text-[#041F40]" />
            <span className="text-xs font-bold text-[#041F40] uppercase tracking-[0.2em]">
              Rejoignez-nous
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-[#041F40] tracking-tight max-w-3xl mx-auto leading-tight">
            Prêt à <span className="text-[#041F40]/80">collaborer</span> avec
            nous ?
          </h2>

          <p className="text-xl text-[#041F40]/70 max-w-xl mx-auto font-light leading-relaxed">
            Découvrez comment notre expertise peut transformer votre entreprise.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
            <Button
              size="lg"
              className="group bg-[#041F40] text-white hover:bg-[#041F40]/90 font-bold px-12 h-14 text-lg rounded-2xl shadow-2xl shadow-[#041F40]/30 transition-all duration-300 hover:scale-105 hover:shadow-[#041F40]/50"
              asChild
            >
              <Link href="/contact">
                Nous Contacter
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-6 text-[#041F40]/75 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#041F40]" />
              <span>+33 (0)1 42 68 55 00</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#041F40]" />
              <span>contact@embertongroup.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#041F40]" />
              <span>Paris & Casablanca</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
