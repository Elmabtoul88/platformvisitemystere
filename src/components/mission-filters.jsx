"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    // Map "all" back to an empty string for the filter state
    const categoryValue = value === "all" ? "" : value;
    onFilterChange({ ...filters, category: categoryValue });
  };

  const clearFilters = () => {
    onFilterChange({ location: '', date: '', category: '' });
  };

  // Map empty category filter back to "all" for the Select component value
  const selectCategoryValue = filters.category === '' ? 'all' : filters.category;

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
            <Select name="category" value={selectCategoryValue} onValueChange={handleCategoryChange}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {/* Use "all" as the value for the placeholder item */}
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  // Ensure category values are unique and non-empty
                   cat ? <SelectItem key={cat} value={cat}>{cat}</SelectItem> : null
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
