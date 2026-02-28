import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { maskCPF } from "@/lib/masks";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  debounceMs?: number;
  inputHeight?: "default" | "large";
}

export const SearchBar = ({
  placeholder = "Buscar por nome ou CPF...",
  onSearch,
  value: controlledValue,
  onChange,
  className = "",
  debounceMs = 300,
  inputHeight = "default",
}: SearchBarProps) => {
  const [internalValue, setInternalValue] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = controlledValue !== undefined;

  const value = isControlled ? controlledValue : internalValue;

  // Detectar se é modo CPF para ajustar placeholder
  const isNumericMode = value ? /^[\d.\- ]+$/.test(value) && value.replace(/\D/g, "").length > 0 : false;
  const displayPlaceholder = isNumericMode ? "000.000.000-00" : placeholder;

  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    if (onChange) {
      onChange(newValue);
    }

    // Debounce para busca em tempo real
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (onSearch) {
        onSearch(newValue);
      }
    }, debounceMs);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Se contém números, aplicar máscara CPF automaticamente
    if (/\d/.test(inputValue)) {
      const masked = maskCPF(inputValue);
      handleChange(masked);
    } else {
      // Se não tem números, usar texto normal
      handleChange(inputValue);
    }
  };

  const handleClear = () => {
    const emptyValue = "";
    if (!isControlled) {
      setInternalValue(emptyValue);
    }
    if (onChange) {
      onChange(emptyValue);
    }
    if (onSearch) {
      onSearch(emptyValue);
    }
    // Manter foco no input após limpar
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const heightClass = inputHeight === "large" ? "h-12" : "h-10";

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        ref={inputRef}
        placeholder={displayPlaceholder}
        value={value}
        onChange={handleInputChange}
        className={`pl-10 pr-10 ${heightClass} hover:border-primary/20 focus:border-primary transition-all relative z-0`}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-20"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
