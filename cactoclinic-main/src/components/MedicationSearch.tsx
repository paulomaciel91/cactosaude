import { useState, useEffect } from 'react';
import { medicationService, Medication } from '@/lib/medicationService';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MedicationSearchProps {
  onSelect: (medication: Medication) => void;
  selectedMedications?: string[];
  disabled?: boolean;
}

export const MedicationSearch = ({ 
  onSelect, 
  selectedMedications = [],
  disabled = false 
}: MedicationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setLoading(true);
      const found = medicationService.searchMedications(searchQuery);
      setResults(found);
      setIsOpen(found.length > 0);
      setLoading(false);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelect = (medication: Medication) => {
    if (selectedMedications.includes(medication.id)) {
      return; // Já está selecionado
    }
    onSelect(medication);
    setSearchQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar medicamento por nome, princípio ativo ou código ANVISA..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          className="pl-10"
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          <ScrollArea className="h-64 p-2">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Buscando...
              </div>
            ) : (
              <div className="space-y-1">
                {results.map(med => {
                  const isSelected = selectedMedications.includes(med.id);
                  return (
                    <div
                      key={med.id}
                      onClick={() => !isSelected && handleSelect(med)}
                      className={cn(
                        "p-3 rounded-md cursor-pointer transition-colors",
                        isSelected 
                          ? "bg-muted cursor-not-allowed opacity-50" 
                          : "hover:bg-accent"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Pill className="h-4 w-4 text-primary flex-shrink-0" />
                            <p className="font-semibold text-sm">{med.name}</p>
                            {isSelected && (
                              <Badge variant="outline" className="text-xs">
                                Já adicionado
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {med.activePrinciple} - {med.presentation}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={med.controlled ? 'destructive' : 'secondary'} 
                              className="text-xs"
                            >
                              {med.controlled ? 'Controlado' : med.category}
                            </Badge>
                            {med.requiresPrescription && (
                              <Badge variant="outline" className="text-xs">
                                Receita obrigatória
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {searchQuery.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg p-4">
          <p className="text-sm text-muted-foreground text-center">
            Nenhum medicamento encontrado para "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
};

