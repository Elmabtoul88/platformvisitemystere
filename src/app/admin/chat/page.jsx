"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, Loader2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchMissions } from "@/services/fetchData.js";
import { useMessage } from "@/context/message-context";
import { useAuth } from "@/context/auth-context";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/";

export default function AdminChatListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [shoppers, setShoppers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { setMessageCount, decrementMessageCount } = useMessage();

  const loadShoppers = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const response = await fetchMissions(
        "admin-chat-shoppers",
        `${API_BASE_URL}chat_messages/${user.id}`,
      );

      if (Array.isArray(response)) {
        const totalUnread = response.reduce((sum, shopper) => {
          const count = typeof shopper.is_read === "number" ? shopper.is_read : 0;
          return sum + count;
        }, 0);

        setMessageCount(totalUnread);
        setShoppers(response);
      } else {
        setShoppers([]);
      }
    } catch (err) {
      console.error("Erreur chargement messages chat:", err);
      setShoppers([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, setMessageCount]);

  useEffect(() => {
    loadShoppers();
  }, [loadShoppers]);

  const filteredShoppers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return shoppers;
    return shoppers.filter(
      (shopper) =>
        shopper.name?.toLowerCase().includes(term) ||
        shopper.email?.toLowerCase().includes(term) ||
        shopper.id?.toString().includes(term),
    );
  }, [shoppers, searchTerm]);

  const handleChatClick = (shopperId) => {
    const shopper = shoppers.find((s) => s.id === shopperId);
    const unreadCount = shopper?.is_read || 0;

    if (unreadCount > 0) {
      decrementMessageCount(unreadCount);
      setShoppers((prev) =>
        prev.map((s) => (s.id === shopperId ? { ...s, is_read: 0 } : s)),
      );
    }
  };

  return (
    <div className="container mx-auto py-6 px-3 sm:px-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#041F40] flex items-center gap-2">
            <Users className="w-7 h-7 text-[#041F40]" /> Messagerie Directe
          </h1>
          <p className="text-sm text-[#041F40]/70 mt-1">
            Sélectionnez un auditeur pour échanger en direct sur les missions.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-[#041F40]/10 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl text-[#041F40]">Auditeurs</CardTitle>
          <CardDescription>
            {filteredShoppers.length} conversation{filteredShoppers.length > 1 ? "s" : ""}
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#041F40]/50" />
            <Input
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-80 border-[#041F40]/20"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#041F40]" />
              <span className="ml-2 text-sm text-[#041F40]/70">Chargement...</span>
            </div>
          ) : (
            <>
              {/* Vue Desktop / Tablette */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#041F40]/10">
                      <TableHead className="font-bold text-[#041F40]">Nom</TableHead>
                      <TableHead className="font-bold text-[#041F40]">Email</TableHead>
                      <TableHead className="font-bold text-[#041F40]">Statut</TableHead>
                      <TableHead className="text-right font-bold text-[#041F40]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShoppers.length > 0 ? (
                      filteredShoppers.map((shopper) => (
                        <TableRow key={`shopper-${shopper.id}`} className="hover:bg-[#041F40]/5 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8 border border-[#041F40]/10">
                                <AvatarImage src={shopper.profile_pic_url} alt={shopper.name} />
                                <AvatarFallback className="bg-[#041F40] text-[#D6C799]">
                                  {shopper.name?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="flex items-center gap-2 text-[#041F40]">
                                <span>{shopper.name}</span>
                                {shopper.is_read > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="h-5 min-w-[1.25rem] px-1.5 flex items-center justify-center rounded-full text-xs"
                                  >
                                    {shopper.is_read}
                                  </Badge>
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-[#041F40]/80">{shopper.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={shopper.status === "active" ? "default" : "outline"}
                              className={
                                shopper.status === "active"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                              }
                            >
                              {shopper.status === "active" ? "Actif" : "Inactif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm" className="bg-[#041F40] text-[#D6C799] hover:bg-[#041F40]/90">
                              <Link
                                href={`/admin/chat/${shopper.id}`}
                                onClick={() => handleChatClick(shopper.id)}
                              >
                                <MessageSquare className="w-4 h-4 mr-1.5" /> Discuter
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          Aucun auditeur trouvé.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Vue Mobile (320px - 767px) */}
              <div className="block md:hidden divide-y divide-[#041F40]/10 px-3">
                {filteredShoppers.length > 0 ? (
                  filteredShoppers.map((shopper) => (
                    <div key={`mob-shopper-${shopper.id}`} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-10 w-10 border border-[#041F40]/10 shrink-0">
                          <AvatarImage src={shopper.profile_pic_url} alt={shopper.name} />
                          <AvatarFallback className="bg-[#041F40] text-[#D6C799]">
                            {shopper.name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-sm text-[#041F40] truncate">
                              {shopper.name}
                            </h3>
                            {shopper.is_read > 0 && (
                              <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                                {shopper.is_read}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-[#041F40]/60 truncate">
                            {shopper.email}
                          </p>
                        </div>
                      </div>

                      <Button asChild size="sm" className="bg-[#041F40] text-[#D6C799] shrink-0 text-xs">
                        <Link
                          href={`/admin/chat/${shopper.id}`}
                          onClick={() => handleChatClick(shopper.id)}
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1" /> Ouvrir
                        </Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-[#041F40]/60">
                    Aucun auditeur trouvé.
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
