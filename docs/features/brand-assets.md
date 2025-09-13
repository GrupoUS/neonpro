# Brand Assets Integration

Date: 2025-09-13

This feature wires the NeonPro symbol and favicon across the web app.

## Assets
- Favicon (SVG): `apps/web/public/neonpro-favicon.svg`
- Symbol (PNG expected): `apps/web/public/brand/simboloneonpro.png`
- AI Icon (PNG expected): `apps/web/public/brand/iconeneonpro.png`
- Manifest: `apps/web/public/site.webmanifest`

## Usage
- Favicon linked in `apps/web/index.html` for svg and png (apple-touch-icon, 32x32)
- Manifest wired in `apps/web/index.html` with theme-color
- Sidebar logo: `apps/web/src/routes/__root.tsx` uses `<img src="/brand/simboloneonpro.png" ... />` com fallback para SVG
- Landing/login: `apps/web/src/routes/index.tsx` exibe o símbolo acima do formulário
- AI Branding: `AIBrandIcon` atom renders `/brand/iconeneonpro.png` with fallback to Sparkles icon; used in:
  - `apps/web/src/components/ui/floating-ai-chat-simple.tsx` (opener button + header)
  - `apps/web/src/components/organisms/ai-chat-container.tsx` (header)

## Steps to update symbol
1. Place your official PNG at `apps/web/public/brand/simboloneonpro.png`
2. Run:
```bash
pnpm --filter @neonpro/web dev
```
3. Verify the favicon and sidebar logo render.

## Accessibility
- `alt="NeonPro"` used on images

## Notes
- The PNG is not committed here; use the placeholder file as guidance.
