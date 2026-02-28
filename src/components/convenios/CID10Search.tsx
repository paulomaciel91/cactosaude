import { useState, useEffect } from 'react';
import { cid10Service, CID10 } from '@/lib/cid10Table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CID10SearchProps {
  onSelect: (cid: CID10) => void;
  value?: string;
  disabled?: boolean;
}

export const CID10Search = ({ onSelect, value, disabled = false }: CID10SearchProps) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [results, setResults] = useState<CID10[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      const found = cid10Service.search(searchQuery);
      setResults(found);
      setIsOpen(found.length > 0);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelect = (cid: CID10) => {
    onSelect(cid);
    setSearchQuery(`${cid.codigo} - ${cid.descricao}`);
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar CID-10 por código ou descrição..."
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
              {results.map((cid) => (
                <div
                  key={cid.codigo}
                  onClick={() => handleSelect(cid)}
                  className="p-3 rounded-md cursor-pointer hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {cid.codigo}
                        </Badge>
                        <p className="text-sm font-medium">{cid.descricao}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{cid.categoria}</p>
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

