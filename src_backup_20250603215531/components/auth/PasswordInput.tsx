
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { usePasswordVisibility } from '@/hooks/usePasswordVisibility';

interface PasswordInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  showForgotPassword?: boolean;
  onForgotPassword?: () => void;
}

export function PasswordInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  showForgotPassword = false,
  onForgotPassword,
}: PasswordInputProps<T>) {
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel 
              className="text-foreground font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {label}
            </FormLabel>
            {showForgotPassword && (
              <Button
                variant="link"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-accent transition-colors duration-300"
                style={{ fontFamily: 'Inter, sans-serif' }}
                onClick={(e) => {
                  e.preventDefault();
                  onForgotPassword?.();
                }}
              >
                Esqueci a senha
              </Button>
            )}
          </div>
          <FormControl>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder={placeholder}
                className="input-neon pr-12" 
                style={{ fontFamily: 'Inter, sans-serif' }}
                {...field} 
                aria-label={label}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-accent focus:outline-none transition-colors duration-300"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>
          </FormControl>
          <FormMessage className="text-destructive text-xs" />
        </FormItem>
      )}
    />
  );
}
