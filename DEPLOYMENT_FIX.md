# Correção de Deploy Vercel - pnpm-lock.yaml

## Problema

O deploy no Vercel estava falhando com o erro:

```
ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json
```

## Causa

- O `pnpm-lock.yaml` estava desatualizado em relação ao `package.json`
- 5 dependências foram adicionadas mas não estavam no lockfile
- 4 dependências foram removidas mas ainda estavam no lockfile
- 49 dependências tinham versões incorretas (lockfile tinha "latest" mas package.json tinha versões específicas)
- Havia um `package-lock.json` junto com `pnpm-lock.yaml` (conflito de gerenciadores)

## Solução Aplicada

1. Instalado pnpm globalmente: `npm install -g pnpm`
2. Removido o arquivo `pnpm-lock.yaml` antigo
3. Removido o arquivo `package-lock.json` (não deve existir quando usando pnpm)
4. Executado `pnpm install` para regenerar o lockfile com as versões corretas
5. Commitado e enviado para o GitHub

## Comandos Executados

```bash
# Instalação do pnpm
npm install -g pnpm

# Remoção dos arquivos antigos
Remove-Item -Path "pnpm-lock.yaml" -Force
Remove-Item -Path "package-lock.json" -Force

# Regeneração do lockfile
pnpm install

# Commit e push
git add pnpm-lock.yaml
git add -u package-lock.json
git commit -m "fix: update pnpm-lock.yaml to sync with package.json and remove package-lock.json"
git push origin main
```

## Resultado

- ✅ `pnpm-lock.yaml` sincronizado com `package.json`
- ✅ `package-lock.json` removido (evita conflitos)
- ✅ Todas as dependências com versões corretas
- ✅ Pronto para deploy no Vercel

## Próximos Passos

1. Acessar o dashboard do Vercel
2. Verificar se o build automático foi iniciado
3. Se não, clicar em "Redeploy" para forçar novo deploy
4. O deploy deve funcionar sem erros agora

## Notas Importantes

- Sempre use `pnpm` como gerenciador de pacotes neste projeto
- Nunca misture `npm` e `pnpm` no mesmo projeto
- Sempre faça commit do `pnpm-lock.yaml` após alterações no `package.json`
