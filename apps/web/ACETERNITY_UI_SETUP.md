# Aceternity UI Setup Guide

## ✅ Configuração Completa

O projeto NeonPro está configurado para usar componentes do Aceternity UI. Aqui está o que foi configurado:

### 1. Dependências Instaladas
- ✅ `framer-motion` - Para animações
- ✅ `clsx` - Para classes condicionais
- ✅ `tailwind-merge` - Para merge de classes Tailwind

### 2. Tailwind Config Atualizado
- ✅ Animações `shimmer` e `aurora` adicionadas
- ✅ Keyframes configurados para efeitos visuais
- ✅ Configuração compatível com Aceternity UI

### 3. Utils Configurado
- ✅ Função `cn()` disponível em `src/lib/utils.ts`
- ✅ Compatível com componentes Aceternity UI

## 🚀 Como Usar Componentes Aceternity UI

### Método 1: Instalação Manual (Recomendado)

1. **Acesse**: https://ui.aceternity.com/components
2. **Escolha** o componente desejado
3. **Copie** o código do componente
4. **Cole** em `src/components/ui/[nome-do-componente].tsx`
5. **Importe** e use no seu projeto

### Método 2: Copiar e Colar

Exemplo com o componente Button:

```tsx
// src/components/ui/aceternity-button.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const AceternityButton = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md bg-black text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-black",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Método 3: Componentes Populares

Aqui estão alguns componentes populares que você pode copiar diretamente:

#### 1. Floating Navbar
- URL: https://ui.aceternity.com/components/floating-navbar
- Ideal para: Navegação principal

#### 2. Hero Parallax
- URL: https://ui.aceternity.com/components/hero-parallax
- Ideal para: Seções hero

#### 3. Card Hover Effect
- URL: https://ui.aceternity.com/components/card-hover-effect
- Ideal para: Cards de serviços

#### 4. Text Generate Effect
- URL: https://ui.aceternity.com/components/text-generate-effect
- Ideal para: Títulos animados

#### 5. Background Beams
- URL: https://ui.aceternity.com/components/background-beams
- Ideal para: Backgrounds animados

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── ui/
│   │   ├── aceternity-button.tsx
│   │   ├── floating-navbar.tsx
│   │   ├── hero-parallax.tsx
│   │   └── ... (outros componentes)
│   └── ...
├── lib/
│   └── utils.ts (✅ já configurado)
└── ...
```

## 🎨 Exemplo de Uso

```tsx
import { AceternityButton } from "@/components/ui/aceternity-button";
import { FloatingNav } from "@/components/ui/floating-navbar";

export function MyComponent() {
  return (
    <div>
      <FloatingNav navItems={[
        { name: "Home", link: "/" },
        { name: "About", link: "/about" }
      ]} />
      
      <AceternityButton className="mt-4">
        Click me!
      </AceternityButton>
    </div>
  );
}
```

## 🔧 Troubleshooting

Se encontrar problemas:

1. **Verifique as dependências**: `framer-motion`, `clsx`, `tailwind-merge`
2. **Confirme o Tailwind config**: Animações devem estar configuradas
3. **Verifique imports**: Use `@/` para imports absolutos
4. **CSS Variables**: Certifique-se que as variáveis CSS estão definidas

## 📚 Recursos

- **Site oficial**: https://ui.aceternity.com/
- **Documentação**: https://ui.aceternity.com/docs
- **Componentes**: https://ui.aceternity.com/components
- **GitHub**: https://github.com/aceternity/ui

---

**Status**: ✅ Projeto configurado e pronto para usar componentes Aceternity UI!
