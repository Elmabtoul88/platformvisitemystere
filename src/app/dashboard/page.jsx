"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Users,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Star,
  Globe,
  Target,
  Building2,
  TrendingUp,
  Sparkles,
  Award,
  Clock,
  Zap,
  ChevronRight,
  Play,
  Quote,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Image from "next/image";
import images from "@/app/lib/placeholder-images.json";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section - Élégant et Moderne */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#041F40] via-[#193356] to-[#041F40]">
        {/* Background avec effet glassmorphism */}
        <div className="absolute inset-0">
          <Image
            src={images["hero-bg"]?.url || "/images/hero-bg.jpg"}
            alt="Luxury Business"
            fill
            className="object-cover opacity-10 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#041F40] via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D6C799]/10 via-transparent to-transparent"></div>
        </div>

        {/* Particules décoratives */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#D6C799]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D6C799]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D6C799]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10 px-4 text-center text-white py-20">
          {/* Badge animé */}
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#D6C799]/20 backdrop-blur-sm border border-[#D6C799]/30 text-[#D6C799] text-xs font-bold uppercase tracking-[0.2em] mb-8 transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Conseil & audit d'excellence
          </div>

          <h1
            className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tight max-w-5xl mx-auto leading-[1.05] transition-all duration-1000 delay-200 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            Élevez les standards de votre{" "}
            <span className="bg-gradient-to-r from-[#D6C799] via-[#D6C799]/80 to-[#999999] bg-clip-text text-transparent">
              Qualité de Service
            </span>
          </h1>

          <p
            className={`text-xl md:text-2xl text-[#999999] max-w-3xl mx-auto font-light leading-relaxed mt-6 transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            Emberton révèle la vérité de chaque expérience client, au service
            des marques d'exception.
          </p>

          <div
            className={`flex flex-col sm:flex-row justify-center gap-6 pt-10 transition-all duration-1000 delay-500 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <Button
              size="lg"
              className="group bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] font-bold px-10 h-14 text-lg rounded-2xl shadow-2xl shadow-[#D6C799]/30 transition-all duration-300 hover:scale-105 hover:shadow-[#D6C799]/50"
              asChild
            >
              <Link href="/signup">
                Demander une démo
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#999999]/30 text-[#999999] hover:bg-[#D6C799]/10 hover:text-white font-medium px-10 h-14 text-lg rounded-2xl backdrop-blur-sm transition-all duration-300 hover:border-[#D6C799]/50 hover:scale-105"
              asChild
            >
              <Link href="/services"> Découvrir nos services </Link>
            </Button>
          </div>

          {/* Indicateur de scroll */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#999999]/50 font-medium">
              Scroll
            </span>
            <div className="w-px h-12 bg-gradient-to-b from-[#999999]/50 to-transparent animate-bounce" />
          </div>
        </div>
      </section>

      {/* Statistiques - Design Épuré */}
      <section className="py-16 bg-[#041F40]/90 backdrop-blur-sm border-y border-[#999999]/10">
        <div className="container px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                label: "Pays couverts",
                icon: Globe,
                val: "25+",
                desc: "Présence internationale",
              },
              {
                label: "Précision Audit",
                icon: Target,
                val: "99.9%",
                desc: "Taux de satisfaction",
              },
              {
                label: "Shoppers actifs",
                icon: Users,
                val: "15,000+",
                desc: "Réseau certifié",
              },
              {
                label: "ROI Moyen",
                icon: TrendingUp,
                val: "+30%",
                desc: "Performance mesurée",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="group flex flex-col items-center text-center p-6 rounded-2xl bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:scale-105 hover:bg-[#193356]/70"
              >
                <div className="p-3 rounded-full bg-[#D6C799]/10 group-hover:bg-[#D6C799]/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-[#D6C799]" />
                </div>
                <div className="text-3xl md:text-4xl font-black text-white mt-3 bg-gradient-to-r from-white to-[#999999] bg-clip-text text-transparent">
                  {stat.val}
                </div>
                <div className="text-xs uppercase tracking-widest text-[#999999] font-bold mt-1">
                  {stat.label}
                </div>
                <div className="text-[10px] text-[#999999]/50 mt-1">
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages - Design Premium */}
      <section className="py-24 bg-gradient-to-b from-[#041F40] to-[#193356] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D6C799]/5 via-transparent to-transparent"></div>
        <div className="container px-4 relative">
          <div className="flex flex-col lg:flex-row gap-12 items-end mb-20">
            <div className="lg:w-2/3 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6C799]/10 border border-[#D6C799]/20">
                <Award className="w-4 h-4 text-[#D6C799]" />
                <span className="text-xs font-bold text-[#D6C799] uppercase tracking-[0.2em]">
                  Pourquoi nous choisir
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                Une vision 360° de votre{" "}
                <span className="bg-gradient-to-r from-[#D6C799] to-[#999999] bg-clip-text text-transparent">
                  performance retail
                </span>
              </h2>
            </div>
            <div className="lg:w-1/3">
              <p className="text-lg text-[#999999] leading-relaxed">
                Notre méthodologie rigoureuse s'appuie sur plus de 15 ans
                d'expérience auprès des leaders du luxe et de la distribution
                spécialisée.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Excellence Opérationnelle",
                desc: "Audit du respect de vos process et de l'intégrité de votre image de marque sur tous vos points de contact.",
                color: "from-[#D6C799] to-[#999999]",
              },
              {
                icon: BarChart3,
                title: "Intelligence Analytique",
                desc: "Transformation des données brutes en insights stratégiques exploitables immédiatement par vos managers.",
                color: "from-[#D6C799] to-[#999999]",
              },
              {
                icon: Building2,
                title: "Impact Global",
                desc: "Accompagnement sur mesure pour vos réseaux nationaux et internationaux, garantissant une cohérence mondiale.",
                color: "from-[#D6C799] to-[#999999]",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-3xl bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#D6C799]/5"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#D6C799]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-[#041F40] mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#D6C799] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#999999] leading-relaxed group-hover:text-[#999999]/80 transition-colors">
                  {feature.desc}
                </p>
                <div className="mt-4 flex items-center text-[#D6C799] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  En savoir plus
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages - Design Élégant */}
      <section className="py-24 bg-[#041F40] relative">
        <div className="container px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6C799]/10 border border-[#D6C799]/20 mb-4">
              <Star className="w-4 h-4 text-[#D6C799] fill-[#D6C799]" />
              <span className="text-xs font-bold text-[#D6C799] uppercase tracking-[0.2em]">
                Témoignages
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Ce que disent nos{" "}
              <span className="text-[#D6C799]">partenaires</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "SEC Visite Mystère a révolutionné notre approche du service client. Une précision chirurgicale.",
                author: "Jean-Pierre Dubois",
                role: "Directeur Retail, LVMH",
                rating: 5,
              },
              {
                quote:
                  "La qualité des insights et la réactivité de l'équipe font de SEC un partenaire indispensable.",
                author: "Marie Laurent",
                role: "Head of Operations, Chanel",
                rating: 5,
              },
              {
                quote:
                  "Une transformation profonde de notre expérience client grâce à une méthodologie d'exception.",
                author: "Philippe Martin",
                role: "CEO, Hermès",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:-translate-y-2"
              >
                <Quote className="w-8 h-8 text-[#D6C799]/30 mb-4" />
                <p className="text-white/80 leading-relaxed text-lg mb-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D6C799] to-[#999999] flex items-center justify-center text-[#041F40] font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-[#999999]">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final - Élégant et Puissant */}
      <section className="py-32 bg-gradient-to-br from-[#D6C799] via-[#999999] to-[#193356] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern.svg')] opacity-5"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#041F40]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container px-4 relative z-10 text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#041F40]/20 backdrop-blur-sm border border-[#041F40]/20">
            <Zap className="w-4 h-4 text-[#041F40]" />
            <span className="text-xs font-bold text-[#041F40] uppercase tracking-[0.2em]">
              Prêt à démarrer
            </span>
          </div>

          <h2 className="text-4xl md:text-7xl font-black text-[#041F40] tracking-tight max-w-4xl mx-auto leading-tight">
            Redéfinissons ensemble <br />
            <span className="text-[#041F40]/80">
              l'excellence de votre service
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-[#041F40]/70 max-w-2xl mx-auto font-light leading-relaxed">
            Contactez nos consultants pour une étude personnalisée de vos
            besoins et découvrez la puissance de nos solutions d'audit.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
            <Button
              size="lg"
              className="group bg-[#041F40] text-white hover:bg-[#041F40]/90 font-bold px-12 h-16 text-lg rounded-2xl shadow-2xl shadow-[#041F40]/30 transition-all duration-300 hover:scale-105 hover:shadow-[#041F40]/50"
              asChild
            >
              <Link href="/contact">
                Démarrer un Projet
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#041F40]/30 text-[#041F40] hover:bg-[#041F40]/10 font-medium px-12 h-16 text-lg rounded-2xl backdrop-blur-sm transition-all duration-300 hover:border-[#041F40]/50 hover:scale-105"
              asChild
            >
              <Link href="/services">Explorer nos Services</Link>
            </Button>
          </div>

          {/* Contact rapide */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-[#041F40]/75 text-sm font-medium">
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
