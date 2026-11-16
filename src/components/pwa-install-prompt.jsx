"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Enregistrement automatique du Service Worker PWA
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("⚡ [PWA] Service Worker actif:", reg.scope);
          })
          .catch((err) => {
            console.warn("⚠️ [PWA] Échec enregistrement Service Worker:", err);
          });
      });
    }

    // 2. Détecter si l'application est déjà en mode autonome (PWA installée)
    if (
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true)
    ) {
      setIsInstalled(true);
      return;
    }

    // 3. Capturer l'événement natif d'installation
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Vérifier si l'utilisateur n'a pas déjà fermé la bannière récemment
      const dismissed = localStorage.getItem("emberton_pwa_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("⚡ [PWA] Résultat installation:", outcome);

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem("emberton_pwa_dismissed", "true");
    } catch (e) {}
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <aside
      aria-label="Installation de l'application"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#041F40] text-white border-2 border-[#D6C799]/40 shadow-2xl rounded-2xl p-4 backdrop-blur-md animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#D6C799]/15 border border-[#D6C799]/30 text-[#D6C799] shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
              Installer l'application
              <span className="text-[10px] bg-[#D6C799] text-[#041F40] px-1.5 py-0.2 rounded font-extrabold uppercase">
                PWA
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Ajoutez Emberton Group sur votre écran d'accueil pour un accès instantané hors-ligne.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
        <Button
          size="sm"
          onClick={handleInstallClick}
          className="flex-1 bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] font-bold text-xs h-9 rounded-xl shadow-md"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" /> Installer sur mon téléphone
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="text-slate-300 hover:text-white hover:bg-white/10 text-xs h-9 rounded-xl"
        >
          Plus tard
        </Button>
      </div>
    </aside>
  );
}
