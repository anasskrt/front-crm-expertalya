
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Filter, 
  X, 
  Calendar,
  Building,
  FileText,
  Search
} from "lucide-react";
import { mockFormatsJuridiques } from "@/data/mockData";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface AdvancedFilters {
  searchTerm: string;
  formatJuridique: string;
  statutDocuments: string;
  dateClotureDebut: string;
  dateClotureFin: string;
  dirigeant: string;
}

interface SocieteAdvancedFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClearFilters: () => void;
}

const SocieteAdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: SocieteAdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof AdvancedFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      key !== 'searchTerm' && value !== ''
    ).length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0 || filters.searchTerm !== '';

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg">Recherche et Filtres</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount() + (filters.searchTerm ? 1 : 0)} filtre(s) actif(s)
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  {isOpen ? 'Masquer' : 'Filtres avancés'}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Recherche principale */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, SIRET, RCS, dirigeant..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent className="space-y-4">
            {/* Filtres par ligne */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Format juridique */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  Format juridique
                </Label>
                <select
                  value={filters.formatJuridique}
                  onChange={(e) => updateFilter('formatJuridique', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Tous les formats</option>
                  {mockFormatsJuridiques.map(format => (
                    <option key={format.id} value={format.format}>
                      {format.format}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statut des documents */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Statut documents
                </Label>
                <select
                  value={filters.statutDocuments}
                  onChange={(e) => updateFilter('statutDocuments', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Tous</option>
                  <option value="ok">Documents OK</option>
                  <option value="manquants">Documents manquants</option>
                </select>
              </div>

              {/* Dirigeant */}
              <div className="space-y-2">
                <Label>Dirigeant</Label>
                <Input
                  placeholder="Nom du dirigeant..."
                  value={filters.dirigeant}
                  onChange={(e) => updateFilter('dirigeant', e.target.value)}
                />
              </div>
            </div>

            {/* Filtres de dates */}
            <div className="border-t pt-4">
              <Label className="flex items-center gap-1 mb-3">
                <Calendar className="h-4 w-4" />
                Date de clôture
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Du</Label>
                  <Input
                    type="date"
                    value={filters.dateClotureDebut}
                    onChange={(e) => updateFilter('dateClotureDebut', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Au</Label>
                  <Input
                    type="date"
                    value={filters.dateClotureFin}
                    onChange={(e) => updateFilter('dateClotureFin', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default SocieteAdvancedFilters;