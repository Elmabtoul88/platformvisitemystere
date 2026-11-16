"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Search,
  Edit,
  Eye,
  UserX,
  CheckCircle,
  Clock,
  Loader2,
  UserCheck,
  Calendar,
  CheckSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { toggleUserStatusAction } from "../../actions/admin-actions.js";
import { fetchMissions } from "@/services/fetchData.js";
import DataPagination from "@/components/ui/data-pagination";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/";

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isToggling, setIsToggling] = useState(null);
  const [, startTransition] = useTransition();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const response = await fetchMissions("admin-users", API_BASE_URL + "users");
      if (Array.isArray(response)) {
        setUsers(response);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setFetchError("Impossible de charger les utilisateurs. Veuillez vérifier la connexion au serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const usersArray = Array.isArray(users) ? users : [];
    if (!searchTerm.trim()) return usersArray;
    const term = searchTerm.toLowerCase();
    return usersArray.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.id?.toString().includes(term) ||
        user.role?.toLowerCase().includes(term) ||
        user.status?.toLowerCase().includes(term),
    );
  }, [users, searchTerm]);

  // Pagination des utilisateurs
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleViewUser = (userId) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleEditUser = (userId) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setIsToggling(userId);
    try {
      const result = await toggleUserStatusAction(userId, currentStatus);
      if (result.success) {
        startTransition(() => {
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u.id === userId ? { ...u, status: result.newStatus } : u,
            ),
          );
        });
        toast({
          title: "Succès",
          description: result.message,
        });
      } else {
        throw new Error(result.message || "Échec de modification du statut.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setIsToggling(null);
    }
  };

  const safeFormatDate = (dateVal) => {
    if (!dateVal) return "N/A";
    try {
      return format(new Date(dateVal), "dd/MM/yyyy");
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="container mx-auto py-6 px-3 sm:px-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#041F40] flex items-center gap-2">
            Gestion des Utilisateurs
          </h1>
          <p className="text-sm text-[#041F40]/70 mt-1">
            Consultez, modifiez et gérez les comptes administrateurs, clients et auditeurs.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-[#041F40]/10 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl text-[#041F40]">Comptes Utilisateurs</CardTitle>
          <CardDescription>
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""} trouvé{filteredUsers.length > 1 ? "s" : ""}
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#041F40]/50" />
            <Input
              placeholder="Rechercher par nom, email, rôle ou statut..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-80 border-[#041F40]/20"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {fetchError && (
            <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center justify-between mx-4">
              <span className="text-sm font-medium">{fetchError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUsers}
                className="text-xs border-red-300 text-red-900 hover:bg-red-100"
              >
                Réessayer
              </Button>
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#041F40]" />
            </div>
          ) : (
            <>
              {/* Vue Tableau pour Desktop / Tablette (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#041F40]/10">
                      <TableHead className="font-bold text-[#041F40]">Utilisateur</TableHead>
                      <TableHead className="font-bold text-[#041F40]">Email</TableHead>
                      <TableHead className="font-bold text-[#041F40]">Rôle</TableHead>
                      <TableHead className="font-bold text-[#041F40]">Statut</TableHead>
                      <TableHead className="font-bold text-[#041F40]">Inscription</TableHead>
                      <TableHead className="font-bold text-[#041F40] text-center">Missions</TableHead>
                      <TableHead className="text-right font-bold text-[#041F40]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className={`hover:bg-[#041F40]/5 transition-colors ${isToggling === user.id ? "opacity-50" : ""}`}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 border border-[#041F40]/10">
                                <AvatarImage src={user.profile_pic_url} alt={user.name} />
                                <AvatarFallback className="bg-[#041F40] text-[#D6C799]">
                                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[#041F40] font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-[#041F40]/80">{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={user.role === "admin" ? "destructive" : "secondary"}
                              className="capitalize"
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.status === "active" ? "default" : "outline"}
                              className={`capitalize ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                              }`}
                            >
                              {user.status === "active" ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <Clock className="w-3 h-3 mr-1" />
                              )}
                              {user.status === "active" ? "Actif" : "Inactif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-[#041F40]/80">
                            {safeFormatDate(user.registration_date)}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {user.role === "shopper" ? user.completed_missions_count ?? 0 : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  disabled={isToggling === user.id}
                                >
                                  {isToggling === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <MoreHorizontal className="h-4 w-4 text-[#041F40]" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                                  <Eye className="mr-2 h-4 w-4" /> Détails
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                                  <Edit className="mr-2 h-4 w-4" /> Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.role !== "admin" ? (
                                  <DropdownMenuItem
                                    onClick={() => handleToggleStatus(user.id, user.status)}
                                    className={user.status === "active" ? "text-destructive" : "text-green-600"}
                                  >
                                    {user.status === "active" ? (
                                      <>
                                        <UserX className="mr-2 h-4 w-4" /> Désactiver
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="mr-2 h-4 w-4" /> Activer
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem disabled>
                                    <span className="text-xs text-muted-foreground">Admin protégé</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          Aucun utilisateur ne correspond à votre recherche.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Vue Cartes Responsive pour Mobile (320px - 767px) */}
              <div className="block md:hidden divide-y divide-[#041F40]/10 px-3">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <div key={user.id} className="py-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-9 w-9 border border-[#041F40]/10">
                            <AvatarImage src={user.profile_pic_url} alt={user.name} />
                            <AvatarFallback className="bg-[#041F40] text-[#D6C799]">
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-[#041F40] text-sm leading-tight">
                              {user.name}
                            </h3>
                            <p className="text-xs text-[#041F40]/70 truncate max-w-[180px]">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={user.role === "admin" ? "destructive" : "secondary"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {user.role}
                          </Badge>
                          <Badge
                            variant={user.status === "active" ? "default" : "outline"}
                            className={`text-[10px] px-1.5 py-0 ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-red-100 text-red-800 border-red-300"
                            }`}
                          >
                            {user.status === "active" ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#041F40]/70 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {safeFormatDate(user.registration_date)}
                        </span>
                        {user.role === "shopper" && (
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5" />
                            {user.completed_missions_count ?? 0} mission(s)
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleViewUser(user.id)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Profil
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleEditUser(user.id)}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" /> Modifier
                        </Button>
                        {user.role !== "admin" && (
                          <Button
                            variant={user.status === "active" ? "destructive" : "default"}
                            size="sm"
                            className="text-xs px-2.5"
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            disabled={isToggling === user.id}
                          >
                            {user.status === "active" ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-[#041F40]/60">
                    Aucun utilisateur trouvé.
                  </div>
                )}
              </div>

              {/* Contrôleur de Pagination */}
              <DataPagination
                currentPage={currentPage}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemLabel="utilisateur(s)"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
