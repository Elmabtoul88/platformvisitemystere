"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Building2,
  Facebook,
  Linkedin,
  Twitter,
  Sparkles,
  Clock,
  Award,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ContactPage() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "✨ Message envoyé !",
        description: "Nous reviendrons vers vous dans les plus brefs délais.",
        className:
          "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
      });
      e.target.reset();
    }, 1500);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Siège Social",
      detail: "8 Place Vendôme, 75001 Paris & Tour Casablanca Finance City",
      color: "from-[#D6C799] to-[#999999]",
    },
    {
      icon: Phone,
      title: "Téléphone",
      detail: "+33 (0)1 42 68 55 00",
      color: "from-[#D6C799] to-[#999999]",
    },
    {
      icon: Mail,
      title: "Email",
      detail: "contact@embertongroup.com",
      color: "from-[#D6C799] to-[#999999]",
    },
  ];

  const socialIcons = [
    { icon: Linkedin, label: "LinkedIn" },
    { icon: Twitter, label: "Twitter" },
    { icon: Facebook, label: "Facebook" },
  ];

  return (
    <div className="flex flex-col overflow-hidden bg-gradient-to-b from-[#041F40] via-[#193356] to-[#041F40] min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#041F40] via-[#193356] to-[#041F40]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D6C799]/10 via-transparent to-transparent"></div>

        <div className="container relative z-10 px-4 text-center text-white py-16">
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#D6C799]/20 backdrop-blur-sm border border-[#D6C799]/30 text-[#D6C799] text-xs font-bold uppercase tracking-[0.2em] mb-6 transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Contactez-nous
          </div>

          <h1
            className={`text-4xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight transition-all duration-1000 delay-200 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <span className="bg-gradient-to-r from-[#D6C799] via-[#D6C799]/80 to-[#999999] bg-clip-text text-transparent">
              Connectons-nous
            </span>
          </h1>

          <p
            className={`text-xl text-[#999999] max-w-2xl mx-auto font-light leading-relaxed mt-6 transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            Une question, un projet ? Nos équipes sont à votre écoute pour vous
            accompagner.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24 container px-4">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info - Gauche */}
          <div className="space-y-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6C799]/10 border border-[#D6C799]/20">
                <Award className="w-4 h-4 text-[#D6C799]" />
                <span className="text-xs font-bold text-[#D6C799] uppercase tracking-[0.2em]">
                  Coordonnées
                </span>
              </div>
              <h2 className="text-3xl font-black text-white">
                Entrez en <span className="text-[#D6C799]">contact</span>
              </h2>

              <div className="space-y-6">
                {contactInfo.map((info, i) => (
                  <div
                    key={i}
                    className="group flex gap-5 p-5 rounded-2xl bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 hover:border-[#D6C799]/30 transition-all duration-500 hover:-translate-y-1"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-[#041F40] shrink-0 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <info.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {info.title}
                      </h4>
                      <p className="text-sm text-[#999999] group-hover:text-[#999999]/80 transition-colors">
                        {info.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-widest">
                Suivez-nous
              </h3>
              <div className="flex gap-3">
                {socialIcons.map((social, i) => (
                  <button
                    key={i}
                    className="w-11 h-11 rounded-xl bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 flex items-center justify-center text-[#999999] hover:text-white hover:bg-[#D6C799]/20 hover:border-[#D6C799]/30 transition-all duration-300 hover:-translate-y-1"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="h-64 relative rounded-2xl overflow-hidden shadow-2xl shadow-[#D6C799]/5 border border-[#999999]/10 group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.2922926156743895!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sTour%20Eiffel!5e0!3m2!1sfr!2sfr!4v1638210000000!5m2!1sfr!2sfr"
                className="absolute inset-0 w-full h-full grayscale contrast-125 opacity-60 group-hover:opacity-80 transition-opacity"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041F40]/50 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Formulaire - Droite */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl shadow-[#D6C799]/5 border-0 bg-[#193356]/50 backdrop-blur-sm border border-[#999999]/10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D6C799] via-[#999999] to-[#D6C799]"></div>

              <CardHeader className="p-8 pb-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#D6C799]/10">
                    <MessageSquare className="w-6 h-6 text-[#D6C799]" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-white">
                      Envoyez-nous un message
                    </CardTitle>
                    <CardDescription className="text-[#999999]">
                      Nos conseillers vous répondent sous 24h ouvrées.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-white text-sm font-medium"
                    >
                      Nom Complet *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Jean Dupont"
                      required
                      className="h-11 bg-[#041F40]/50 border-[#999999]/20 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-[#D6C799]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-white text-sm font-medium"
                    >
                      Email Professionnel *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="j.dupont@entreprise.com"
                      required
                      className="h-11 bg-[#041F40]/50 border-[#999999]/20 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-[#D6C799]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-white text-sm font-medium"
                    >
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+33 6 00 00 00 00"
                      className="h-11 bg-[#041F40]/50 border-[#999999]/20 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-[#D6C799]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="company"
                      className="text-white text-sm font-medium"
                    >
                      Société
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]/50" />
                      <Input
                        id="company"
                        className="pl-10 h-11 bg-[#041F40]/50 border-[#999999]/20 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-[#D6C799]/20 transition-all"
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label
                      htmlFor="message"
                      className="text-white text-sm font-medium"
                    >
                      Votre Message *
                    </Label>
                    <Textarea
                      id="message"
                      className="min-h-[150px] bg-[#041F40]/50 border-[#999999]/20 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-[#D6C799]/20 transition-all"
                      placeholder="Détaillez votre besoin ici..."
                      required
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs text-[#999999]">
                      <CheckCircle2 className="w-4 h-4 text-[#D6C799]" />
                      <span>Tous les champs marqués * sont obligatoires</span>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSending}
                      className="group w-full sm:w-auto px-10 h-12 bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] font-bold rounded-xl shadow-lg shadow-[#D6C799]/20 transition-all duration-300 hover:scale-105 hover:shadow-[#D6C799]/40"
                    >
                      {isSending ? (
                        "Envoi en cours..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1" />
                          Envoyer la demande
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Badge de confiance */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-[#999999]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D6C799]" />
                <span>Réponse sous 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D6C799]" />
                <span>Service Premium</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D6C799]" />
                <span>Support Personnalisé</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#D6C799] via-[#999999] to-[#193356] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#041F40]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container px-4 relative z-10 text-center">
          <p className="text-[#041F40]/80 text-sm font-medium uppercase tracking-[0.2em]">
            Prêt à collaborer ?
          </p>
          <h3 className="text-2xl md:text-3xl font-black text-[#041F40] mt-2">
            Parlons de votre projet
          </h3>
        </div>
      </section>
    </div>
  );
}
