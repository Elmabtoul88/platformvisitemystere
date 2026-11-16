"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export function DataPagination({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage: rawItemsPerPage,
  pageSize: rawPageSize,
  onPageChange,
  onItemsPerPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = "",
  itemLabel = "résultat(s)",
}) {
  const itemsPerPage = rawPageSize || rawItemsPerPage || 10;
  const handlePageSizeChange = onPageSizeChange || onItemsPerPageChange;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // If there's 0 or 1 item, still render subtle info or return null if empty
  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(totalItems, currentPage * itemsPerPage);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages, currentPage + 1);

      if (currentPage <= 2) {
        start = 1;
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
        end = totalPages;
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("ellipsis-1");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("ellipsis-2");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-3 border-t border-[#041F40]/10 bg-slate-50/50 rounded-b-2xl ${className}`}
    >
      {/* Résumé textuel */}
      <div className="flex items-center gap-3 text-xs text-[#041F40]/70 font-medium">
        <span>
          Affichage de <strong className="text-[#041F40]">{startItem}</strong> à{" "}
          <strong className="text-[#041F40]">{endItem}</strong> sur{" "}
          <strong className="text-[#041F40]">{totalItems}</strong> {itemLabel}
        </span>

        {handlePageSizeChange && (
          <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-3 border-l border-[#041F40]/15">
            <span className="text-[11px] text-[#041F40]/60">Par page :</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="h-7 text-xs bg-white border border-[#041F40]/20 rounded-lg px-1.5 text-[#041F40] focus:outline-none focus:ring-1 focus:ring-[#041F40]"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Boutons de pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Premier */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 text-[#041F40] disabled:opacity-30 rounded-lg"
            title="Première page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>

          {/* Précédent */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 text-[#041F40] disabled:opacity-30 rounded-lg"
            title="Page précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Numéros de page */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) => {
              if (typeof p === "string") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-xs text-[#041F40]/40 font-semibold"
                  >
                    ...
                  </span>
                );
              }

              const isActive = p === currentPage;
              return (
                <Button
                  key={p}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(p)}
                  className={`h-8 min-w-[32px] px-2 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? "bg-[#041F40] text-[#D6C799] border-[#041F40] shadow-sm pointer-events-none"
                      : "bg-white text-[#041F40]/80 border-[#041F40]/15 hover:bg-[#041F40]/5 hover:text-[#041F40]"
                  }`}
                >
                  {p}
                </Button>
              );
            })}
          </div>

          {/* Suivant */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 text-[#041F40] disabled:opacity-30 rounded-lg"
            title="Page suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Dernier */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 text-[#041F40] disabled:opacity-30 rounded-lg"
            title="Dernière page"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default DataPagination;
