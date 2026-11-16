"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Award,
  MessageSquare,
  Download,
  FileWarning,
  Cake,
  Users as UsersIcon,
} from "lucide-react"; // Added Download, FileWarning, Cake, UsersIcon
// Removed mockUsers import
import { format } from "date-fns";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context"; // Import useAuth
import { fetchMissions } from "@/services/fetchData";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  //const { token } = useAuth(); // Get token for API call
  const userId = params.userId;
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserDetails = async (user_id) => {
      try {
        setIsLoading(true);
        setError(null);
        const [foundUser] = await fetchMissions(
          "user" + user_id,
          API_BASE_URL + "users/" + user_id
        );
        // Process date if it exists
        if (foundUser.registration_date) {
          foundUser.registration_date = new Date(foundUser.registration_date);
        }

        setUser(foundUser);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.message);
        setError("Invalid user ID provided.");
        setIsLoading(false);
        // Optional: Redirect or show permanent error message
        // router.push('/admin/users');
      } finally {
        setIsLoading(false);
      }
    };
    getUserDetails(userId);
  }, [userId]); // Add token to dependencies

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#041F40]" />
        <span className="text-sm font-medium text-slate-600">Chargement de l'utilisateur...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col items-center">
        <Alert variant="destructive" className="w-full mb-4">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg">
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour à la liste
          </Link>
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col items-center">
        <p className="text-sm text-slate-600 mb-4">Données utilisateur introuvables.</p>
        <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg">
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour à la liste
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-center">
        <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg shadow-sm">
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour à la liste
          </Link>
        </Button>
        <Button asChild size="sm" className="bg-[#041F40] hover:bg-[#041F40]/90 text-white font-bold text-xs h-9 rounded-lg shadow-sm">
          <Link href={`/admin/users/${userId}/edit`}>
            <Edit className="w-4 h-4 mr-1.5 text-[#D6C799]" /> Modifier l'utilisateur
          </Link>
        </Button>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 border-b border-slate-100 bg-slate-50/50">
          <Avatar className="h-20 w-20 border-2 border-[#041F40] shadow-sm">
            <AvatarImage src={user.profile_pic_url} alt={user.name} />
            <AvatarFallback className="bg-[#041F40] text-[#D6C799] text-xl font-bold">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow space-y-1">
            <CardTitle className="text-2xl font-extrabold text-[#041F40]">
              {user.name}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
              </span>
              {user.city && (
                <span className="flex items-center gap-1 font-medium text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {user.city}
                </span>
              )}
              {user.telephone && (
                <span className="flex items-center gap-1 font-mono text-slate-700">
                  Tél : {user.telephone}
                </span>
              )}
            </div>
            <div className="pt-2 flex flex-wrap gap-2">
              <Badge
                className={
                  user.role === "admin"
                    ? "bg-red-50 text-red-700 border border-red-200 text-xs font-semibold capitalize"
                    : user.role === "client"
                    ? "bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold capitalize"
                    : "bg-blue-50 text-[#041F40] border border-blue-200 text-xs font-semibold capitalize"
                }
              >
                {user.role}
              </Badge>
              <Badge
                className={
                  user.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold capitalize"
                    : "bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold capitalize"
                }
              >
                {user.status === "active" ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                {user.status === "active" ? "Actif" : "Inactif"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Détails du profil */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#041F40] uppercase tracking-wider border-b border-slate-100 pb-2">
              Informations Générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs">
              {user.birth_year && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                  <Cake className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500 font-medium">Année de naissance :</span>
                  <span className="font-bold text-slate-800">{user.birth_year}</span>
                </div>
              )}
              {user.gender && user.gender !== "prefer_not_say" && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                  <UsersIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500 font-medium">Genre :</span>
                  <span className="font-bold text-slate-800 capitalize">{user.gender}</span>
                </div>
              )}
              {user.registration_date && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500 font-medium">Inscription :</span>
                  <span className="font-bold text-slate-800">
                    {format(new Date(user.registration_date), "dd/MM/yyyy")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-slate-500 font-medium">Identifiant Système :</span>
                <code className="font-bold text-[#041F40] font-mono">#{user.id}</code>
              </div>
            </div>
          </div>

          {user.role === "shopper" && (
            <>
              {/* Section Motivation */}
              {user.motivation && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#041F40] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#041F40]" /> Motivation & Profil Auditeur
                  </h3>
                  <p className="text-xs text-slate-700 italic bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
                    "{user.motivation}"
                  </p>
                </div>
              )}

              {/* Section CV */}
              {user.cv_url && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#041F40] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#041F40]" /> Curriculum Vitae (CV)
                  </h3>
                  <div className="flex items-center gap-3">
                    <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg">
                      <a
                        href={user.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={user.cv_url.split("/").pop()}
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5 text-[#041F40]" /> Télécharger le CV
                      </a>
                    </Button>
                    <span className="text-xs text-slate-500 italic">
                      ({user.cv_url.split("/").pop()})
                    </span>
                  </div>
                </div>
              )}

              {/* Section Performance */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#041F40] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#041F40]" /> Statistiques d'Audit
                </h3>
                <div className="flex items-center gap-2 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs">
                  <strong className="text-emerald-900 font-bold">Missions Complétées avec Succès :</strong>
                  <span className="font-extrabold text-emerald-700 text-sm">{user.completed_missions_count ?? 0}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
