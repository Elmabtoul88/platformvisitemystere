// app/page.js
"use client";

import { useAuth } from "@/context/auth-context";
import { MissionList } from "@/components/mission-list";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Loader2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Target,
  Users,
  Building2,
  Star,
  Globe,
  Award,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      return;
    }

    if (!isLoading && isAuthenticated && user?.role === "admin") {
      router.push("/admin");
    }

    if (!isLoading && isAuthenticated && user?.role === "client") {
      router.push("/client");
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Shopper authentifié - Afficher les missions
  if (isAuthenticated && user?.role === "shopper") {
    return <MissionList />;
  }

  // Utilisateur non authentifié - Page d'accueil publique
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="flex flex-col overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#041F40] via-[#193356] to-[#041F40]">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-5"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#041F40] via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D6C799]/10 via-transparent to-transparent"></div>
          </div>

          {/* Particules décoratives */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#D6C799]/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D6C799]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D6C799]/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container relative z-10 px-4 text-center py-20">
            <div
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#D6C799]/15 backdrop-blur-md border border-[#D6C799]/30 text-[#D6C799] text-xs font-bold uppercase tracking-[0.25em] mb-8 transition-all duration-1000 shadow-lg shadow-[#D6C799]/5 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Réseau Privé Emberton Group
            </div>

            <h1
              className={`text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight max-w-5xl mx-auto leading-[1.1] sm:leading-[1.05] text-white transition-all duration-1000 delay-200 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              Devenez Client Mystère <br />
              <span className="bg-gradient-to-r from-[#D6C799] via-[#E8DEC0] to-[#D6C799] bg-clip-text text-transparent">
                Shopping d'Excellence
              </span>
            </h1>

            <p
              className={`text-base sm:text-xl md:text-2xl text-[#999999] max-w-3xl mx-auto font-light leading-relaxed mt-4 sm:mt-6 transition-all duration-1000 delay-300 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              Réalisez des visites mystères pour les plus grandes marques de prestige, à votre rythme, et recevez une rémunération attractive pour votre regard avisé.
            </p>

            <div
              className={`flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 pt-8 sm:pt-10 transition-all duration-1000 delay-500 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              <Button
                size="lg"
                className="group w-full sm:w-auto bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] font-bold px-6 sm:px-10 h-12 sm:h-14 text-base sm:text-lg rounded-2xl shadow-2xl shadow-[#D6C799]/30 transition-all duration-300 hover:scale-105 hover:shadow-[#D6C799]/50"
                asChild
              >
                <Link href="/signup">
                  Créer mon profil shopper
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-[#D6C799]/40 text-[#D6C799] hover:bg-[#D6C799]/15 hover:text-white font-medium px-6 sm:px-10 h-12 sm:h-14 text-base sm:text-lg rounded-2xl backdrop-blur-sm transition-all duration-300 hover:border-[#D6C799] hover:scale-105"
                asChild
              >
                <Link href="/services">Découvrir les missions</Link>
              </Button>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-[#999999]/50 font-medium">
                Scroll
              </span>
              <ChevronDown className="w-5 h-5 text-[#999999]/50 animate-bounce" />
            </div>
          </div>
        </section>

        {/* Statistiques */}
        <section className="py-16 bg-[#041F40]/90 backdrop-blur-sm border-y border-[#999999]/10">
          <div className="container px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: "Shoppers Actifs", value: "500+", icon: Users },
                { label: "Missions Réalisées", value: "100+", icon: Target },
                { label: "Clients Premium", value: "500+", icon: Building2 },
                { label: "Taux de Satisfaction", value: "99.8%", icon: Award },
              ].map((stat, i) => (
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

        {/* Avantages */}
        <section className="py-24 bg-gradient-to-b from-[#041F40] to-[#193356] relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D6C799]/5 via-transparent to-transparent"></div>
          <div className="container px-4 relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6C799]/10 border border-[#D6C799]/20 mb-4">
                <ShieldCheck className="w-4 h-4 text-[#D6C799]" />
                <span className="text-xs font-bold text-[#D6C799] uppercase tracking-[0.2em]">
                  Pourquoi MissionView
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white">
                Une plateforme <span className="text-[#D6C799]">complète</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  title: "Pour les Shoppers",
                  desc: "Trouvez et complétez des missions de shopping mystère près de chez vous.",
                  features: [
                    "Missions disponibles",
                    "Suivi en temps réel",
                    "Paiement sécurisé",
                  ],
                  color: "from-[#D6C799] to-[#999999]",
                },
                {
                  icon: Building2,
                  title: "Pour les Clients",
                  desc: "Créez et gérez vos missions d'audit client en toute simplicité.",
                  features: [
                    "Création de missions",
                    "Dashboard KPI",
                    "Rapports détaillés",
                  ],
                  color: "from-[#D6C799] to-[#999999]",
                },
                {
                  icon: ShieldCheck,
                  title: "Pour les Admins",
                  desc: "Supervisez l'ensemble des activités et gérez votre plateforme.",
                  features: [
                    "Gestion des utilisateurs",
                    "Analyses avancées",
                    "Modération",
                  ],
                  color: "from-[#D6C799] to-[#999999]",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group p-8 rounded-3xl bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#D6C799]/5"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-[#041F40] mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#D6C799] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[#999999] leading-relaxed group-hover:text-[#999999]/80 transition-colors mb-6">
                    {item.desc}
                  </p>
                  <ul className="space-y-2">
                    {item.features.map((feature, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-2 text-sm text-[#999999]"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D6C799]"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24 bg-gradient-to-br from-[#D6C799] via-[#999999] to-[#193356] relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#041F40]/20 rounded-full blur-3xl"></div>
          </div>

          <div className="container px-4 relative z-10 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#041F40]/20 backdrop-blur-sm border border-[#041F40]/20">
              <Star className="w-4 h-4 text-[#041F40]" />
              <span className="text-xs font-bold text-[#041F40] uppercase tracking-[0.2em]">
                REJOINDRE LE RÉSEAU
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-[#041F40] tracking-tight max-w-4xl mx-auto leading-tight">
              Rejoignez le cercle Emberton
              <br />
            </h2>

            <p className="text-xl text-[#041F40]/70 max-w-2xl mx-auto font-light leading-relaxed">
              Créez votre profil et accédez à nos missions d'exception.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button
                size="lg"
                className="group bg-[#041F40] text-white hover:bg-[#041F40]/90 font-bold px-12 h-16 text-lg rounded-2xl shadow-2xl shadow-[#041F40]/30 transition-all duration-300 hover:scale-105 hover:shadow-[#041F40]/50"
                asChild
              >
                <Link href="/signup">
                  Créer un compte
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#041F40]/30 text-[#041F40] hover:bg-[#041F40]/10 font-medium px-12 h-16 text-lg rounded-2xl backdrop-blur-sm transition-all duration-300 hover:border-[#041F40]/50 hover:scale-105"
                asChild
              >
                <Link href="/login">Se connecter</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // État de chargement
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-[#D6C799]" />
    </div>
  );
}
