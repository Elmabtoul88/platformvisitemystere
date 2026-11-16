"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useTransition,
} from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Loader2,
  PlusCircle,
  Edit,
  MoreHorizontal,
  Power,
  PowerOff,
  Building,
  Upload,
  Info,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Store,
  Layers,
  Map,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";
import {
  addStoreAction,
  updateStoreAction,
  toggleStoreStatusAction,
  batchAddStoresAction,
} from "../../actions/admin-actions";
import { fetchMissions } from "@/services/fetchData";
import DataPagination from "@/components/ui/data-pagination";

// Traitement souple des coordonnées GPS (Optionnelles)
const optionalCoordinate = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .optional()
  .transform((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const clean = String(val).replace(",", ".").trim();
    if (clean === "") return null;
    const num = Number(clean);
    return isNaN(num) ? null : num;
  });

const storeSchema = z.object({
  name: z.string().min(2, "Le nom du magasin est obligatoire (min 2 caractères)"),
  city: z.string().min(2, "La ville est obligatoire"),
  address: z.string().min(3, "L'adresse est obligatoire"),
  latitude: optionalCoordinate,
  longitude: optionalCoordinate,
  category: z.string().optional().nullable(),
  mission_id: z.string().min(1, "Veuillez sélectionner une mission associée"),
  active: z.boolean().default(true),
});

export default function AdminStoresPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [stores, setStores] = useState([]);
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [missionFilter, setMissionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isTransitioning, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      city: "",
      address: "",
      latitude: "",
      longitude: "",
      category: "",
      mission_id: "",
      active: true,
    },
  });

  // Chargement des magasins & missions
  const fetchStoresMissions = async () => {
    try {
      setIsLoading(true);
      const [missionsData, storesData] = await Promise.all([
        fetchMissions("admin-missions", `${API_BASE_URL}missions/admin/all`),
        fetchMissions("admin-stores", `${API_BASE_URL}stores/missions`),
      ]);
      setMissions(missionsData || []);
      setStores(storesData || []);
    } catch (err) {
      console.error("Erreur chargement magasins/missions:", err);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Impossible de récupérer les magasins et missions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoresMissions();
  }, []);

  // Réinitialisation du formulaire quand editingStore change
  useEffect(() => {
    if (editingStore) {
      reset({
        name: editingStore.name || "",
        city: editingStore.city || "",
        address: editingStore.address || "",
        latitude:
          editingStore.latitude !== null && editingStore.latitude !== undefined
            ? String(editingStore.latitude)
            : "",
        longitude:
          editingStore.longitude !== null && editingStore.longitude !== undefined
            ? String(editingStore.longitude)
            : "",
        category: editingStore.category || "",
        mission_id: editingStore.mission_id ? String(editingStore.mission_id) : "",
        active: editingStore.active ?? true,
      });
    } else {
      reset({
        name: "",
        city: "",
        address: "",
        latitude: "",
        longitude: "",
        category: "",
        mission_id: "",
        active: true,
      });
    }
  }, [editingStore, reset]);

  const uniqueCategories = useMemo(
    () => [...new Set(stores.map((s) => s.category).filter(Boolean))],
    [stores],
  );

  const stats = useMemo(() => {
    const total = stores.length;
    const active = stores.filter((s) => s.active).length;
    const inactive = total - active;
    const citiesCount = new Set(
      stores.map((s) => s.city?.trim()?.toLowerCase()).filter(Boolean)
    ).size;
    const withGps = stores.filter(
      (s) =>
        s.latitude !== null &&
        s.latitude !== undefined &&
        s.longitude !== null &&
        s.longitude !== undefined &&
        String(s.latitude).trim() !== "" &&
        String(s.longitude).trim() !== ""
    ).length;
    return { total, active, inactive, citiesCount, withGps };
  }, [stores]);

  const getMissionTitle = (missionId) =>
    missions.find((m) => m.id === missionId)?.title || `Mission #${missionId}`;

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const missionMatch =
        missionFilter === "all" || String(store.mission_id) === String(missionFilter);
      const categoryMatch =
        categoryFilter === "all" || store.category === categoryFilter;

      const search = searchTerm.toLowerCase();
      const searchMatch =
        !search ||
        store.name?.toLowerCase().includes(search) ||
        store.city?.toLowerCase().includes(search) ||
        store.address?.toLowerCase().includes(search) ||
        store.category?.toLowerCase().includes(search) ||
        getMissionTitle(store.mission_id).toLowerCase().includes(search);

      return missionMatch && categoryMatch && searchMatch;
    });
  }, [stores, searchTerm, missionFilter, categoryFilter, missions]);

  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStores.slice(start, start + itemsPerPage);
  }, [filteredStores, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage) || 1;

  const handleAddNew = () => {
    setEditingStore(null);
    setDialogOpen(true);
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setDialogOpen(true);
  };

  const handleToggleStatus = async (id) => {
    const prev = [...stores];
    setStores((s) =>
      s.map((store) =>
        store.id === id ? { ...store, active: !store.active } : store,
      ),
    );

    try {
      const res = await toggleStoreStatusAction(id);
      if (!res.success) throw new Error(res.message || "Échec");
      toast({
        title: "Statut mis à jour",
        description: res.message || "Le statut du magasin a été modifié.",
      });
    } catch (err) {
      setStores(prev);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.message || "Impossible de mettre à jour le statut.",
      });
    }
  };

  // Soumission du formulaire (Création / Modification)
  const onSubmit = async (data) => {
    setIsProcessing(true);
    const payload = {
      name: data.name.trim(),
      city: data.city.trim(),
      address: data.address.trim(),
      latitude:
        data.latitude !== null &&
        data.latitude !== undefined &&
        data.latitude !== "" &&
        !isNaN(Number(data.latitude))
          ? Number(data.latitude)
          : null,
      longitude:
        data.longitude !== null &&
        data.longitude !== undefined &&
        data.longitude !== "" &&
        !isNaN(Number(data.longitude))
          ? Number(data.longitude)
          : null,
      category: data.category ? String(data.category).trim() : null,
      mission_id: Number(data.mission_id),
      active: Boolean(data.active),
    };

    const action = editingStore
      ? updateStoreAction(editingStore.id, payload)
      : addStoreAction(payload);

    try {
      const result = await action;
      if (!result.success) {
        throw new Error(result.message || "L'opération a échoué.");
      }

      toast({
        title: editingStore ? "✅ Magasin modifié" : "✅ Magasin créé",
        description: result.message || "Le magasin a été enregistré avec succès.",
      });

      setDialogOpen(false);
      setEditingStore(null);

      startTransition(() => fetchStoresMissions());
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Échec de l'enregistrement",
        description: err.message || "Une erreur est survenue lors de l'enregistrement.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Génération et téléchargement du modèle Excel type
  const downloadExcelTemplate = () => {
    const sampleData = [
      {
        nom: "Emberton Mall Casablanca",
        ville: "Casablanca",
        adresse: "Boulevard d'Anfa, Maarif",
        id_mission: missions[0]?.id || 1,
        categorie: "Boutique Luxe",
        latitude: 33.589886,
        longitude: -7.632498,
        actif: 1,
      },
      {
        nom: "Emberton Flagship Rabat",
        ville: "Rabat",
        adresse: "Avenue Mohammed V",
        id_mission: missions[0]?.id || 1,
        categorie: "Horlogerie",
        latitude: "", // Laissé vide intentionnellement (latitude optionnelle)
        longitude: "", // Laissé vide intentionnellement (longitude optionnelle)
        actif: 1,
      },
      {
        nom: "Emberton Corner Tanger",
        ville: "Tanger",
        adresse: "Centre Commercial City Center",
        id_mission: missions[1]?.id || missions[0]?.id || 1,
        categorie: "Parfumerie",
        latitude: "",
        longitude: "",
        actif: 1,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws["!cols"] = [
      { wch: 28 }, // nom
      { wch: 16 }, // ville
      { wch: 35 }, // adresse
      { wch: 14 }, // id_mission
      { wch: 18 }, // categorie
      { wch: 16 }, // latitude (optionnel)
      { wch: 16 }, // longitude (optionnel)
      { wch: 10 }, // actif
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Magasins");
    XLSX.writeFile(wb, "modele_import_magasins.xlsx");

    toast({
      title: "📥 Modèle Excel téléchargé",
      description: "Le fichier 'modele_import_magasins.xlsx' est prêt dans vos téléchargements.",
    });
  };

  // Import intelligent de fichier Excel (.xlsx / .xls)
  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      setIsProcessing(true);
      try {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          throw new Error("Le fichier Excel sélectionné est vide ou ne contient aucune ligne de données.");
        }

        // Normalisation souple des noms de colonnes (insensible à la casse, accents et espaces)
        const normalizeKey = (key) =>
          key
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");

        const normalizedStores = [];
        const parsingWarnings = [];

        rawJson.forEach((row, idx) => {
          const rowNum = idx + 2;
          const mapped = {};

          Object.keys(row).forEach((k) => {
            const norm = normalizeKey(k);
            const val = row[k];

            if (["nom", "name", "magasin", "store", "enseigne"].includes(norm)) {
              mapped.name = String(val).trim();
            } else if (["ville", "city", "localite"].includes(norm)) {
              mapped.city = String(val).trim();
            } else if (["adresse", "address", "rue", "localisation"].includes(norm)) {
              mapped.address = String(val).trim();
            } else if (
              ["missionid", "idmission", "mission", "id", "missionname"].includes(norm)
            ) {
              mapped.mission_id = val;
            } else if (["categorie", "category", "type", "secteur"].includes(norm)) {
              mapped.category = String(val).trim();
            } else if (["latitude", "lat"].includes(norm)) {
              mapped.latitude = val;
            } else if (["longitude", "lon", "lng", "long"].includes(norm)) {
              mapped.longitude = val;
            } else if (["actif", "active", "statut", "status"].includes(norm)) {
              mapped.active = val;
            }
          });

          // Résolution de la mission (par ID numérique ou par titre)
          let resolvedMissionId = null;
          if (mapped.mission_id !== undefined && mapped.mission_id !== "") {
            const parsedId = parseInt(mapped.mission_id, 10);
            if (!isNaN(parsedId)) {
              resolvedMissionId = parsedId;
            } else {
              const matchedMission = missions.find(
                (m) =>
                  m.title?.toLowerCase().trim() ===
                  String(mapped.mission_id).toLowerCase().trim(),
              );
              if (matchedMission) resolvedMissionId = matchedMission.id;
            }
          }

          // Validation des champs strictement obligatoires
          if (!mapped.name || !mapped.city || !mapped.address || !resolvedMissionId) {
            const missing = [];
            if (!mapped.name) missing.push("Nom");
            if (!mapped.city) missing.push("Ville");
            if (!mapped.address) missing.push("Adresse");
            if (!resolvedMissionId) missing.push("Mission valide");

            parsingWarnings.push(
              `Ligne ${rowNum} : champs obligatoires manquants (${missing.join(", ")}).`,
            );
            return;
          }

          // Nettoyage latitude / longitude (Optionnelles)
          const cleanCoord = (val) => {
            if (val === null || val === undefined || val === "" || String(val).trim() === "") {
              return null;
            }
            const num = parseFloat(String(val).replace(",", "."));
            return isNaN(num) ? null : num;
          };

          normalizedStores.push({
            name: mapped.name,
            city: mapped.city,
            address: mapped.address,
            mission_id: resolvedMissionId,
            category: mapped.category || null,
            latitude: cleanCoord(mapped.latitude),
            longitude: cleanCoord(mapped.longitude),
            active:
              mapped.active !== "" && mapped.active !== undefined
                ? mapped.active === 1 ||
                  mapped.active === true ||
                  String(mapped.active).toLowerCase() === "oui" ||
                  String(mapped.active).toLowerCase() === "true"
                : true,
          });
        });

        if (normalizedStores.length === 0) {
          throw new Error(
            `Aucun magasin valide n'a pu être extrait.\nVérifiez que votre fichier contient bien les colonnes : nom, ville, adresse, mission_id.\n${parsingWarnings.slice(0, 3).join("\n")}`,
          );
        }

        const result = await batchAddStoresAction(normalizedStores);
        if (!result.success) throw new Error(result.message);

        toast({
          title: "✅ Importation Excel terminée",
          description: `${normalizedStores.length} magasin(s) importé(s) avec succès.${parsingWarnings.length ? ` (${parsingWarnings.length} ligne(s) ignorée(s))` : ""}`,
        });

        startTransition(() => fetchStoresMissions());
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Échec de l'import Excel",
          description: err.message,
        });
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#041F40]" />
        <span className="text-sm font-medium text-slate-600">
          Chargement des magasins & réseaux...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#041F40] text-[#D6C799] shadow-sm">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#041F40] tracking-tight">
                Magasins & Réseaux
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Gérez vos points de vente, assignez les missions et importez vos magasins par Excel
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden"
            accept=".xlsx,.xls,.csv"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setInstructionsOpen(true)}
            className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold h-9 rounded-lg shadow-sm"
          >
            <HelpCircle className="w-4 h-4 mr-1.5 text-slate-500" />
            Instructions Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={downloadExcelTemplate}
            className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold h-9 rounded-lg shadow-sm"
          >
            <Download className="w-4 h-4 mr-1.5 text-[#041F40]" />
            Modèle (.xlsx)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="border-slate-300 text-slate-800 bg-white hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg shadow-sm"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-[#041F40]" />
            ) : (
              <Upload className="w-4 h-4 mr-1.5 text-[#041F40]" />
            )}
            Importer Excel
          </Button>

          <Button
            size="sm"
            onClick={handleAddNew}
            disabled={isProcessing}
            className="bg-[#041F40] hover:bg-[#041F40]/90 text-white font-bold text-xs h-9 rounded-lg shadow-sm"
          >
            <PlusCircle className="w-4 h-4 mr-1.5 text-[#D6C799]" />
            Nouveau Magasin
          </Button>
        </div>
      </div>

      {/* Cartes KPI statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Points de Vente
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#041F40]">
            {stats.total}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Réseau d'enseignes enregistré
          </p>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Points Actifs
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">
            {stats.active}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {stats.inactive} magasin(s) inactif(s)
          </p>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Villes Couvertes
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#041F40]">
            {stats.citiesCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Implantations géographiques
          </p>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Coordonnées GPS
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Map className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">
            {stats.withGps}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Visibles sur la carte Shopper
          </p>
        </Card>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Rechercher par nom, ville, adresse..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-9 bg-white border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:border-[#041F40] focus:ring-1 focus:ring-[#041F40] rounded-lg"
          />
        </div>

        <Select
          value={missionFilter}
          onValueChange={(val) => {
            setMissionFilter(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-9 bg-white border-slate-300 text-slate-800 text-xs rounded-lg">
            <SelectValue placeholder="Filtrer par mission" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-slate-200 text-slate-800 text-xs shadow-lg max-h-60">
            <SelectItem value="all">Toutes les missions</SelectItem>
            {missions.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                {m.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(val) => {
            setCategoryFilter(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-9 bg-white border-slate-300 text-slate-800 text-xs rounded-lg">
            <SelectValue placeholder="Filtrer par catégorie" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-slate-200 text-slate-800 text-xs shadow-lg max-h-60">
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {uniqueCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tableau des Magasins */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div>
            <CardTitle className="text-base text-[#041F40] font-bold">
              Points de Vente Enregistrés ({filteredStores.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Liste de vos boutiques et magasins associés aux campagnes d'audit
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 text-xs font-semibold self-start sm:self-auto"
          >
            {filteredStores.length} résultat{filteredStores.length > 1 ? "s" : ""}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {/* Vue Mobile (Cartes) */}
          <div className="block md:hidden divide-y divide-slate-100 p-3 space-y-3">
            {paginatedStores.length ? (
              paginatedStores.map((store) => (
                <div
                  key={store.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[#041F40]">
                        {store.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {store.address}, <span className="font-semibold text-slate-800">{store.city}</span>
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white border border-slate-200 text-slate-800 text-xs shadow-lg rounded-lg"
                      >
                        <DropdownMenuLabel className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEdit(store)}
                          className="cursor-pointer hover:bg-slate-50 font-medium"
                        >
                          <Edit className="mr-2 h-3.5 w-3.5 text-[#041F40]" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(store.id)}
                          className="cursor-pointer hover:bg-slate-50 font-medium"
                        >
                          {store.active ? (
                            <>
                              <PowerOff className="mr-2 h-3.5 w-3.5 text-red-500" /> Désactiver
                            </>
                          ) : (
                            <>
                              <Power className="mr-2 h-3.5 w-3.5 text-emerald-600" /> Activer
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-slate-200 bg-white text-slate-700 text-[11px] font-medium"
                    >
                      {store.category || "Général"}
                    </Badge>
                    <Badge
                      className={
                        store.active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold"
                          : "bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold"
                      }
                    >
                      {store.active ? "Actif" : "Inactif"}
                    </Badge>
                    {store.latitude && store.longitude && (
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-mono"
                      >
                        GPS: {Number(store.latitude).toFixed(3)}, {Number(store.longitude).toFixed(3)}
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span>Mission :</span>
                    <span className="font-semibold text-[#041F40] max-w-[200px] truncate">
                      {getMissionTitle(store.mission_id)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                Aucun magasin trouvé.
              </div>
            )}
          </div>

          {/* Vue Table Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-slate-700 text-xs font-bold uppercase tracking-wider py-3.5">
                    Nom du Magasin
                  </TableHead>
                  <TableHead className="text-slate-700 text-xs font-bold uppercase tracking-wider py-3.5">
                    Adresse & Ville
                  </TableHead>
                  <TableHead className="text-slate-700 text-xs font-bold uppercase tracking-wider py-3.5">
                    Catégorie
                  </TableHead>
                  <TableHead className="text-slate-700 text-xs font-bold uppercase tracking-wider py-3.5">
                    Mission Associée
                  </TableHead>
                  <TableHead className="text-slate-700 text-xs font-bold uppercase tracking-wider py-3.5">
                    Coordonnées GPS
                  </TableHead>
                  <TableHead className="text-slate-700 text-xs font-bold uppercase tracking-wider py-3.5">
                    Statut
                  </TableHead>
                  <TableHead className="text-right text-slate-700 text-xs font-bold uppercase tracking-wider py-3.5">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStores.length ? (
                  paginatedStores.map((store) => (
                    <TableRow
                      key={store.id}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                    >
                      <TableCell className="font-bold text-[#041F40] text-xs">
                        {store.name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        <div className="font-medium text-slate-800">{store.address}</div>
                        <div className="text-slate-500 text-[11px]">{store.city}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-slate-50 text-slate-700 text-[11px] font-medium"
                        >
                          {store.category || "Général"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-[#041F40] max-w-[220px] truncate">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-100">
                          {getMissionTitle(store.mission_id)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {store.latitude && store.longitude ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            {Number(store.latitude).toFixed(4)}, {Number(store.longitude).toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Non renseignées</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            store.active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold"
                              : "bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold"
                          }
                        >
                          {store.active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white border border-slate-200 text-slate-800 text-xs shadow-lg rounded-lg"
                          >
                            <DropdownMenuLabel className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEdit(store)}
                              className="cursor-pointer hover:bg-slate-50 font-medium"
                            >
                              <Edit className="mr-2 h-3.5 w-3.5 text-[#041F40]" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(store.id)}
                              className="cursor-pointer hover:bg-slate-50 font-medium"
                            >
                              {store.active ? (
                                <>
                                  <PowerOff className="mr-2 h-3.5 w-3.5 text-red-500" /> Désactiver
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-3.5 w-3.5 text-emerald-600" /> Activer
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-xs text-slate-500"
                    >
                      Aucun magasin trouvé correspondant à votre recherche.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Composant Standard de Pagination */}
        <DataPagination
          currentPage={currentPage}
          totalItems={filteredStores.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
          itemLabel="magasins"
        />
      </Card>

      {/* Modal d'Instructions Excel */}
      <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
        <DialogContent className="max-w-3xl bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#041F40] border border-blue-100">
                <FileSpreadsheet className="w-5 h-5 text-[#041F40]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-[#041F40]">
                  Instructions d'Import Excel pour les Magasins
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Guide complet sur le format des colonnes acceptées pour l'import en masse (.xlsx, .xls)
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 text-xs text-slate-600 py-3">
            {/* Note sur la latitude et longitude */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-amber-900 font-bold">
                  Latitude et Longitude sont 100% optionnelles
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Si vous ne connaissez pas les coordonnées GPS exactes, laissez simplement les cellules vides dans votre fichier Excel. Le magasin sera créé et fonctionnera normalement.
                </p>
              </div>
            </div>

            {/* Tableau récapitulatif des colonnes */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#041F40]">
                Structure des Colonnes dans Excel
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-3">Colonne</th>
                      <th className="p-3">Obligatoire ?</th>
                      <th className="p-3">Noms acceptés</th>
                      <th className="p-3">Description & Exemple</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-bold text-[#041F40]">nom</td>
                      <td className="p-3">
                        <Badge className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                          Oui
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-800">nom, name, magasin, store</td>
                      <td className="p-3">Nom de l'enseigne (ex: "Boutique Vendôme")</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#041F40]">ville</td>
                      <td className="p-3">
                        <Badge className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                          Oui
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-800">ville, city</td>
                      <td className="p-3">Ville d'implantation (ex: "Casablanca", "Paris")</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#041F40]">adresse</td>
                      <td className="p-3">
                        <Badge className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                          Oui
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-800">adresse, address</td>
                      <td className="p-3">Adresse physique complète (ex: "12 Rue de la Paix")</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#041F40]">id_mission</td>
                      <td className="p-3">
                        <Badge className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                          Oui
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-800">id_mission, mission_id, mission</td>
                      <td className="p-3">Numéro ID de la mission (ex: 1, 2) ou Titre exact</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#041F40]">categorie</td>
                      <td className="p-3">
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-[10px]">
                          Non
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-800">categorie, category, type</td>
                      <td className="p-3">Secteur (ex: "Retail", "Horlogerie", "Supermarché")</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#041F40]">latitude</td>
                      <td className="p-3">
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-[10px]">
                          Non
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-800">latitude, lat</td>
                      <td className="p-3">Coordonnée GPS Nord (ex: 33.589886 ou vide)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#041F40]">longitude</td>
                      <td className="p-3">
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-[10px]">
                          Non
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-800">longitude, lon, lng</td>
                      <td className="p-3">Coordonnée GPS Ouest/Est (ex: -7.632498 ou vide)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#041F40]">actif</td>
                      <td className="p-3">
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-[10px]">
                          Non
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-800">actif, active, statut</td>
                      <td className="p-3">1 pour Actif, 0 pour Inactif (par défaut: 1)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Liste des missions actuelles pour référence rapide */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#041F40]">
                Missions Actuelles Disponibles (pour la colonne id_mission)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                {missions.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-xs"
                  >
                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                      {m.title}
                    </span>
                    <Badge className="bg-[#041F40] text-white border-0 text-[10px] font-mono">
                      ID: {m.id}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={downloadExcelTemplate}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Télécharger le Modèle Pré-rempli (.xlsx)
            </Button>
            <Button
              type="button"
              onClick={() => {
                setInstructionsOpen(false);
                fileInputRef.current?.click();
              }}
              className="bg-[#041F40] hover:bg-[#041F40]/90 text-white font-bold text-xs h-9 rounded-lg shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Sélectionner mon Fichier Excel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ajout / Modification de Magasin */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#041F40] flex items-center gap-2">
                <Building className="w-5 h-5 text-[#041F40]" />
                {editingStore ? "Modifier le Magasin" : "Créer un Nouveau Magasin"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Remplissez les informations du point de vente. La latitude et la longitude sont optionnelles.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3.5 py-4">
              {/* Mission associée */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-700 font-semibold">
                  Mission associée <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="mission_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900 text-xs h-9 rounded-lg">
                        <SelectValue placeholder="Sélectionnez la mission associée" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 text-slate-900 text-xs shadow-xl rounded-lg">
                        <SelectGroup>
                          {missions.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>
                              #{m.id} - {m.title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.mission_id && (
                  <p className="text-[11px] text-red-500">{errors.mission_id.message}</p>
                )}
              </div>

              {/* Nom du magasin */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-700 font-semibold">
                  Nom du magasin <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ex: Emberton Mall Casablanca"
                  {...register("name")}
                  className="bg-white border-slate-300 text-slate-900 text-xs h-9 placeholder:text-slate-400 rounded-lg focus:border-[#041F40] focus:ring-1 focus:ring-[#041F40]"
                />
                {errors.name && (
                  <p className="text-[11px] text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Adresse et Ville */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-semibold">
                    Adresse <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Ex: Boulevard d'Anfa"
                    {...register("address")}
                    className="bg-white border-slate-300 text-slate-900 text-xs h-9 placeholder:text-slate-400 rounded-lg focus:border-[#041F40] focus:ring-1 focus:ring-[#041F40]"
                  />
                  {errors.address && (
                    <p className="text-[11px] text-red-500">{errors.address.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-semibold">
                    Ville <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Ex: Casablanca"
                    {...register("city")}
                    className="bg-white border-slate-300 text-slate-900 text-xs h-9 placeholder:text-slate-400 rounded-lg focus:border-[#041F40] focus:ring-1 focus:ring-[#041F40]"
                  />
                  {errors.city && (
                    <p className="text-[11px] text-red-500">{errors.city.message}</p>
                  )}
                </div>
              </div>

              {/* Catégorie */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-700 font-semibold">
                  Catégorie <span className="text-slate-400 font-normal">(Optionnel)</span>
                </Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900 text-xs h-9 rounded-lg">
                        <SelectValue placeholder="Sélectionnez ou laissez vide" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 text-slate-900 text-xs shadow-xl rounded-lg">
                        <SelectGroup>
                          {[
                            "Boutique Luxe",
                            "Retail",
                            "Supermarché",
                            "Banque & Assurance",
                            "Restaurant",
                            "Horlogerie & Bijouterie",
                            "Parfumerie & Cosmétique",
                            "Automobile",
                            "Autre",
                          ].map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Latitude et Longitude (Optionnels) */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-[#041F40] font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#041F40]" />
                  Coordonnées GPS <span className="text-slate-400 font-normal text-[11px]">(Optionnel - laissez vide si inconnu)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">Latitude (ex: 33.589886)</Label>
                    <Input
                      type="text"
                      placeholder="Laisser vide si inconnu"
                      {...register("latitude")}
                      className="bg-white border-slate-300 text-slate-900 text-xs h-8 placeholder:text-slate-400 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">Longitude (ex: -7.632498)</Label>
                    <Input
                      type="text"
                      placeholder="Laisser vide si inconnu"
                      {...register("longitude")}
                      className="bg-white border-slate-300 text-slate-900 text-xs h-8 placeholder:text-slate-400 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Statut actif */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <Label className="text-xs text-slate-800 font-semibold">Magasin Actif</Label>
                  <p className="text-[11px] text-slate-500">
                    Disponible pour assignation de missions
                  </p>
                </div>
                <Controller
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  )}
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 pt-3 border-t border-slate-200">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isProcessing}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg"
                >
                  Annuler
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isProcessing}
                className="bg-[#041F40] hover:bg-[#041F40]/90 text-white font-bold text-xs h-9 rounded-lg shadow-sm"
              >
                {isProcessing && <Loader2 className="animate-spin mr-1.5 w-4 h-4" />}
                {editingStore ? "Enregistrer les modifications" : "Créer le Magasin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
