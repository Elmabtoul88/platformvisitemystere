"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Tag, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function MissionFilters({ filters, onFilterChange, categories }) {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleCategoryChange = (value) => {
    const categoryValue = value === "all" ? "" : value;
    onFilterChange({ ...filters, category: categoryValue });
  };

  const clearFilters = () => {
    onFilterChange({ location: "", date: "", category: "" });
  };

  const selectCategoryValue =
    filters.category === "" ? "all" : filters.category;

  return (
    <Card className="p-4 sm:p-5 mb-6 shadow-sm border border-slate-200 bg-white rounded-xl">
      <CardHeader className="p-0 pb-3.5">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#041F40] uppercase tracking-wider">
          <Search className="w-4 h-4 text-[#D6C799]" /> Filtrer les missions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <Label
              htmlFor="location"
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-[#041F40]" /> Localisation
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="Ville ou adresse..."
              value={filters.location}
              onChange={handleInputChange}
              className="h-9 text-sm border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#041F40] focus:ring-2 focus:ring-[#041F40]/10 rounded-lg transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="date"
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#041F40]" /> Date limite avant
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={filters.date}
              onChange={handleInputChange}
              className="h-9 text-sm border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#041F40] focus:ring-2 focus:ring-[#041F40]/10 rounded-lg transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="category"
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-[#041F40]" /> Catégorie
            </Label>
            <Select
              name="category"
              value={selectCategoryValue}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="h-9 text-sm border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#041F40] focus:ring-2 focus:ring-[#041F40]/10 rounded-lg transition-all">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 text-slate-900 shadow-lg rounded-lg">
                <SelectItem
                  value="all"
                  className="hover:bg-slate-100 cursor-pointer font-medium"
                >
                  Toutes les catégories
                </SelectItem>
                {categories.map((cat) =>
                  cat ? (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="hover:bg-slate-100 cursor-pointer font-medium"
                    >
                      {cat}
                    </SelectItem>
                  ) : null,
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={clearFilters}
            variant="outline"
            size="sm"
            className="h-9 w-full sm:w-auto border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-semibold rounded-lg transition-all"
          >
            <X className="w-4 h-4 mr-1 text-slate-500" /> Effacer les filtres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
