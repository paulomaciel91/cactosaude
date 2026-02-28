import React from "react";
import { Input, InputProps } from "@/components/ui/input";
import { maskCPF, maskCNPJ, maskPhone, maskCEP, maskCurrency } from "@/lib/masks";

interface MaskedInputProps extends Omit<InputProps, "onChange" | "value"> {
  mask?: "cpf" | "cnpj" | "phone" | "cep" | "currency";
  onChange?: (value: string) => void;
  value?: string;
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onChange, value = "", ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let maskedValue = e.target.value;

      switch (mask) {
        case "cpf":
          maskedValue = maskCPF(e.target.value);
          break;
        case "cnpj":
          maskedValue = maskCNPJ(e.target.value);
          break;
        case "phone":
          maskedValue = maskPhone(e.target.value);
          break;
        case "cep":
          maskedValue = maskCEP(e.target.value);
          break;
        case "currency":
          maskedValue = maskCurrency(e.target.value);
          break;
        default:
          maskedValue = e.target.value;
      }

      if (onChange) {
        onChange(maskedValue);
      }
    };

    return (
      <Input
        ref={ref}
        {...props}
        value={value || ""}
        onChange={handleChange}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";

