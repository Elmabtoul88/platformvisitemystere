"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Tag, Search, X } from "lucide-react";

export interface MissionFiltersType {
  location: string;
  date: string; // Consider using a date picker state if needed
  category: string;
}

interface MissionFiltersProps {
  filters: MissionFiltersType;
  onFilterChange: (filters: MissionFiltersType) => void;
  categories: string[]; // Pass available categories
}

export function MissionFilters({ filters, onFilterChange, categories }: MissionFiltersProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleSelectChange = (name: keyof MissionFiltersType) => (value: string) => {
    onFilterChange({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    onFilterChange({ location: '', date: '', category: '' });
  };

  return (
    <Card className="p-4 mb-6 shadow">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" /> Filter Missions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="location" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="Enter city or zip code"
              value={filters.location}
              onChange={handleInputChange}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
             <Label htmlFor="date" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
               <Calendar className="w-3 h-3" /> Deadline Before
             </Label>
            {/* Replace with a proper DatePicker if needed */}
            <Input
              id="date"
              name="date"
              type="date"
              placeholder="Select date"
              value={filters.date}
              onChange={handleInputChange}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
             <Label htmlFor="category" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
               <Tag className="w-3 h-3" /> Category
             </Label>
            <Select name="category" value={filters.category} onValueChange={handleSelectChange('category')}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={clearFilters} variant="outline" size="sm" className="h-9 w-full sm:w-auto">
            <X className="w-4 h-4 mr-1" /> Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Add imports for missing components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
