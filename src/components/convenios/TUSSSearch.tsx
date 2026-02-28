import { useState, useEffect } from 'react';
import { tussService, ProcedimentoTUSS } from '@/lib/tussTable';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

interface TUSSSearchProps {
  onSelect: (procedimento: ProcedimentoTUSS) => void;
  disabled?: boolean;
}

export const TUSSSearch = ({ onSelect, disabled = false }: TUSSSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ProcedimentoTUSS[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      const found = tussService.search(searchQuery);
      setResults(found);
      setIsOpen(found.length > 0);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelect = (proc: ProcedimentoTUSS) => {
    onSelect(proc);
    setSearchQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar procedimento TUSS por código ou descrição..."
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
            <div className="space-y-1">
              {results.map((proc) => (
                <div
                  key={proc.codigo}
                  onClick={() => handleSelect(proc)}
                  className="p-3 rounded-md cursor-pointer hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {proc.codigo}
                        </Badge>
                        <p className="text-sm font-medium">{proc.descricao}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {proc.categoria}
                        </Badge>
                        {proc.valorBase && (
                          <p className="text-xs text-muted-foreground">
                            R$ {proc.valorBase.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

