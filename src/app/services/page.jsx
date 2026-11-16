"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Search,
  LineChart,
  ShieldCheck,
  Users2,
  Trophy,
  ArrowRight,
  Eye,
  ClipboardCheck,
  LayoutDashboard,
  Sparkles,
  CheckCircle2,
  Zap,
  Award,
  TrendingUp,
  Globe,
  Clock,
  ChevronRight,
  Quote,
  Mail,
  Phone,
  MapPin,
  Star,
} from "lucide-react";
import Image from "next/image";
import images from "@/app/lib/placeholder-images.json";
import Link from "next/link";

export default function ServicesPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const services = [
    {
      title: "Visites Mystères Stratégiques",
      icon: Eye,
      img: images["service-mystery"]?.url || "/images/service-mystery.jpg",
      desc: "L'évaluation la plus authentique de votre parcours client. Nos shoppers experts simulent des interactions réelles pour tester la réactivité, l'accueil et le savoir-faire de vos équipes.",
      color: "from-[#D6C799] to-[#999999]",
      benefits: [
        "Audit de l'accueil & prise en charge",
        "Vérification des techniques de vente",
        "Évaluation du conseil expert",
        "Contrôle du cross-selling",
      ],
    },
    {
      title: "Audits de Conformité & Process",
      icon: ClipboardCheck,
      img: images["service-audit"]?.url || "/images/service-audit.jpg",
      desc: "Vérifiez que vos standards opérationnels sont appliqués rigoureusement sur l'ensemble de votre réseau. Idéal pour les franchises et les réseaux intégrés.",
      color: "from-[#D6C799] to-[#999999]",
      benefits: [
        "Respect du Merchandising",
        "Hygiène, Sécurité & Environnement",
        "Procédures de caisse & encaissement",
        "Gestion des flux et attentes",
      ],
    },
    {
      title: "Analyses de Performance (Business Intelligence)",
      icon: LayoutDashboard,
      img: images["service-analysis"]?.url || "/images/service-analysis.jpg",
      desc: "Transformez vos données d'audit en décisions stratégiques. Nos tableaux de bord interactifs permettent un pilotage précis de votre qualité de service.",
      color: "from-[#D6C799] to-[#999999]",
      benefits: [
        "Benchmark concurrentiel direct",
        "Évolution temporelle des KPI",
        "Plans d'action ciblés par région",
        "Identification des 'Best Practices'",
      ],
    },
  ];

  const stats = [
    { label: "Shoppers Experts", value: "1,500+", icon: Users2 },
    { label: "Missions Réalisées", value: "25,000+", icon: ClipboardCheck },
    { label: "Taux de Satisfaction", value: "99.8%", icon: Star },
    { label: "Pays Couverts", value: "45+", icon: Globe },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section - Élégant et Moderne */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#041F40] via-[#193356] to-[#041F40]">
        <div className="absolute inset-0">
          <Image
            src={
              images["service-mystery"]?.url || "/images/service-mystery.jpg"
            }
            alt="Services"
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
            Nos Solutions
          </div>

          <h1
            className={`text-5xl md:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-tight transition-all duration-1000 delay-200 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            Solutions d'
            <span className="bg-gradient-to-r from-[#D6C799] via-[#D6C799]/80 to-[#999999] bg-clip-text text-transparent">
              Audit
            </span>{" "}
            sur Mesure
          </h1>

          <p
            className={`text-xl text-[#999999] max-w-2xl mx-auto font-light leading-relaxed mt-6 transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            Une expertise métier sur-mesure pour piloter l'excellence de votre
            réseau de distribution.
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

      {/* Services Section - Design Premium */}
      <section className="py-24 bg-gradient-to-b from-[#041F40] to-[#193356] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D6C799]/5 via-transparent to-transparent"></div>
        <div className="container px-4 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6C799]/10 border border-[#D6C799]/20 mb-4">
              <Award className="w-4 h-4 text-[#D6C799]" />
              <span className="text-xs font-bold text-[#D6C799] uppercase tracking-[0.2em]">
                Notre Expertise
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Des Solutions <span className="text-[#D6C799]">Complètes</span>
            </h2>
            <p className="text-[#999999] max-w-2xl mx-auto mt-4">
              Chaque service est conçu pour répondre aux exigences des marques
              d'exception.
            </p>
          </div>

          <div className="space-y-32">
            {services.map((service, i) => (
              <div
                key={i}
                className={`flex flex-col lg:flex-row gap-16 items-center ${
                  i % 2 !== 0 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="lg:w-1/2 space-y-8">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#D6C799]/10 text-[#D6C799] font-black text-xs uppercase tracking-[0.2em] rounded-full border border-[#D6C799]/20">
                      <service.icon className="w-4 h-4" /> Service {i + 1}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                      {service.title}
                    </h2>
                    <p className="text-lg text-[#999999] leading-relaxed">
                      {service.desc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.benefits.map((benefit, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-3 text-sm text-[#999999] group p-3 rounded-xl bg-[#193356]/50 hover:bg-[#D6C799]/10 transition-all duration-300"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#D6C799] flex-shrink-0" />
                        <span className="group-hover:text-white transition-colors">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="group bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] h-12 px-8 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-[#D6C799]/20 hover:scale-105"
                    asChild
                  >
                    <Link href="/contact">
                      En savoir plus
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                <div className="lg:w-1/2 relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl shadow-[#D6C799]/10 group">
                  <Image
                    src={service.img}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#041F40]/50 via-transparent to-transparent"></div>
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  ></div>

                  {/* Badge flottant */}
                  <div className="absolute bottom-6 left-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Zap className="w-4 h-4 text-[#D6C799]" />
                      <span className="font-medium">Service Premium</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personnalisation Section */}
      <section className="py-24 bg-[#041F40] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#D6C799]/5 via-transparent to-transparent"></div>
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6C799]/10 border border-[#D6C799]/20">
                <Award className="w-4 h-4 text-[#D6C799]" />
                <span className="text-xs font-bold text-[#D6C799] uppercase tracking-[0.2em]">
                  Accompagnement Sur Mesure
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white">
                Un Accompagnement{" "}
                <span className="text-[#D6C799]">Personnalisé</span>
              </h2>
              <p className="text-[#999999] max-w-2xl mx-auto">
                Nous adaptons nos services à vos besoins spécifiques pour
                garantir des résultats optimaux.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <Card className="p-8 rounded-[2rem] bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#D6C799]/5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D6C799] to-[#999999] flex items-center justify-center text-[#041F40] mb-6">
                  <ClipboardCheck className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black text-white mb-4">
                  Conception sur Mesure
                </h4>
                <p className="text-[#999999] text-sm leading-relaxed">
                  Chaque marque est unique. Nous co-construisons vos
                  questionnaires d'audit pour qu'ils reflètent fidèlement votre
                  ADN et vos objectifs de vente.
                </p>
              </Card>

              <Card className="p-8 rounded-[2rem] bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#D6C799]/5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D6C799] to-[#999999] flex items-center justify-center text-[#041F40] mb-6">
                  <Users2 className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black text-white mb-4">
                  Shoppers Experts
                </h4>
                <p className="text-[#999999] text-sm leading-relaxed">
                  Nos shoppers sont formés et briefés spécifiquement pour chaque
                  mission, garantissant une détection fine des écarts et une
                  objectivité absolue.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-24 bg-[#193356]/50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6C799]/10 border border-[#D6C799]/20 mb-4">
              <Star className="w-4 h-4 text-[#D6C799] fill-[#D6C799]" />
              <span className="text-xs font-bold text-[#D6C799] uppercase tracking-[0.2em]">
                Témoignages
              </span>
            </div>
            <h2 className="text-4xl font-black text-white">
              Ce que disent nos <span className="text-[#D6C799]">clients</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "SEC Visite Mystère a révolutionné notre approche du service client. Une précision chirurgicale.",
                author: "Jean-Pierre Dubois",
                role: "Directeur Retail, LVMH",
              },
              {
                quote:
                  "La qualité des insights et la réactivité de l'équipe font de SEC un partenaire indispensable.",
                author: "Marie Laurent",
                role: "Head of Operations, Chanel",
              },
              {
                quote:
                  "Une transformation profonde de notre expérience client grâce à une méthodologie d'exception.",
                author: "Philippe Martin",
                role: "CEO, Hermès",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-[#041F40]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:-translate-y-2"
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#041F40]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container px-4 relative z-10 text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#041F40]/20 backdrop-blur-sm border border-[#041F40]/20">
            <Zap className="w-4 h-4 text-[#041F40]" />
            <span className="text-xs font-bold text-[#041F40] uppercase tracking-[0.2em]">
              Prêt à optimiser vos performances
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-[#041F40] tracking-tight max-w-4xl mx-auto leading-tight">
            Optimisez vos performances <br />
            <span className="text-[#041F40]/80">dès aujourd'hui</span>
          </h2>

          <p className="text-xl text-[#041F40]/70 max-w-xl mx-auto font-light leading-relaxed">
            Contactez nos experts pour élaborer ensemble votre futur programme
            d'audit.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button
              size="lg"
              className="group bg-[#041F40] text-white hover:bg-[#041F40]/90 font-bold px-12 h-16 text-lg rounded-2xl shadow-2xl shadow-[#041F40]/30 transition-all duration-300 hover:scale-105 hover:shadow-[#041F40]/50"
              asChild
            >
              <Link href="/contact">
                Prendre rendez-vous
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
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
