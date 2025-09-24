export * from "./ThemeContext";

// New York Theme from TweakCN - Enhanced for NeonPro Aesthetic Clinic
const themeCss = `:root {
  /* Light theme - NeonPro Aesthetic Palette - OPTIMIZED */
  --background: oklch(0.9800 0.0020 48.7171); /* Cleaner white background */
  --foreground: oklch(0.2000 0.0400 260.0310); /* Darker text for better contrast */
  --card: oklch(0.9900 0.0010 106.4238); /* Pure white cards */
  --card-foreground: oklch(0.2000 0.0400 260.0310); /* Dark text on cards */
  --popover: oklch(0.9900 0.0010 106.4238); /* Pure white popover */
  --popover-foreground: oklch(0.2000 0.0400 260.0310); /* Dark popover text */
  --primary: oklch(0.6500 0.0600 39); /* Pantone 4007C Gold - #AC9469 */
  --primary-foreground: oklch(0.9800 0.0020 84.5931); /* White text on primary */
  --secondary: oklch(0.8000 0.0600 82.4060); /* Lighter secondary */
  --secondary-foreground: oklch(0.2000 0.0400 256.8018); /* Dark text on secondary */
  --muted: oklch(0.9200 0.0030 48.7171); /* Subtle muted background */
  --muted-foreground: oklch(0.4500 0.0300 264.3637); /* Darker muted text */
  --accent: oklch(0.6500 0.0600 39); /* Pantone 4007C Gold - #AC9469 */
  --accent-foreground: oklch(0.9800 0.0020 259.7328); /* White text on accent */
  --destructive: oklch(0.6368 0.2078 25.3313); /* Standard red for errors */
  --destructive-foreground: oklch(1.0000 0 0); /* White text */
  --border: oklch(0.8687 0.0043 56.3660); /* #B4AC9C - PANTONE 7535 C */
  --input: oklch(0.8687 0.0043 56.3660); /* #B4AC9C */
  --ring: oklch(0.6500 0.0600 39); /* Pantone 4007C Gold */
  --chart-1: oklch(0.5854 0.2041 277.1173); /* #112031 - Deep Green */
  --chart-2: oklch(0.5106 0.2301 276.9656); /* #294359 - Petrol Blue */
  --chart-3: oklch(0.6500 0.0600 39); /* #AC9469 - Pantone 4007C Gold */
  --chart-4: oklch(0.3984 0.1773 277.3662); /* #B4AC9C - Light Beige */
  --chart-5: oklch(0.3588 0.1354 278.6973); /* #D2D0C8 - Soft Gray */
  --sidebar: oklch(0.9500 0.0030 56.3660); /* Light sidebar background */
  --sidebar-foreground: oklch(0.2000 0.0400 260.0310); /* Dark sidebar text */
  --sidebar-primary: oklch(0.6500 0.0600 39); /* Pantone 4007C Gold in sidebar */
  --sidebar-primary-foreground: oklch(0.9800 0.0020 0); /* White text on primary */
  --sidebar-accent: oklch(0.6500 0.0600 39); /* Pantone 4007C Gold sidebar accent */
  --sidebar-accent-foreground: oklch(0.9800 0.0020 259.7328); /* White text on accent */
  --sidebar-border: oklch(0.8500 0.0050 56.3660); /* Subtle sidebar border */
  --sidebar-ring: oklch(0.6500 0.0600 39); /* Pantone 4007C Gold sidebar ring */
  --font-sans: Inter, sans-serif;
  --font-serif: Lora, serif;
  --font-mono: Libre Baskerville, serif;
  --radius: 1.25rem;
  --shadow-color: hsl(240 4% 60%);
  --shadow-opacity: 0.18;
  --shadow-blur: 10px;
  --shadow-spread: 4px;
  --shadow-offset-x: 2px;
  --shadow-offset-y: 2px;
  --letter-spacing: 0em;
  --spacing: 0.25rem;
  --shadow-2xs: 2px 2px 10px 4px hsl(240 4% 60% / 0.09);
  --shadow-xs: 2px 2px 10px 4px hsl(240 4% 60% / 0.09);
  --shadow-sm: 2px 2px 10px 4px hsl(240 4% 60% / 0.18), 2px 1px 2px 3px hsl(240 4% 60% / 0.18);
  --shadow: 2px 2px 10px 4px hsl(240 4% 60% / 0.18), 2px 1px 2px 3px hsl(240 4% 60% / 0.18);
  --shadow-md: 2px 2px 10px 4px hsl(240 4% 60% / 0.18), 2px 2px 4px 3px hsl(240 4% 60% / 0.18);
  --shadow-lg: 2px 2px 10px 4px hsl(240 4% 60% / 0.18), 2px 4px 6px 3px hsl(240 4% 60% / 0.18);
  --shadow-xl: 2px 2px 10px 4px hsl(240 4% 60% / 0.18), 2px 8px 10px 3px hsl(240 4% 60% / 0.18);
  --shadow-2xl: 2px 2px 10px 4px hsl(240 4% 60% / 0.45);
  --tracking-normal: 0em;
}

.dark {
  /* Dark theme - NeonPro Aesthetic Palette - FIXED COLORS */
  --background: oklch(0.1200 0.0150 251.3554); /* Much darker background */
  --foreground: oklch(0.9500 0.0100 82.1097); /* Brighter light text */
  --card: oklch(0.1500 0.0200 252.5089); /* Darker card background */
  --card-foreground: oklch(0.9500 0.0100 82.1097); /* Bright text on cards */
  --popover: oklch(0.1500 0.0200 252.5089); /* Darker popover */
  --popover-foreground: oklch(0.9500 0.0100 82.1097); /* Bright popover text */
  --primary: oklch(0.6500 0.0600 39); /* Pantone 4007C Gold - #AC9469 */
  --primary-foreground: oklch(0.1200 0.0150 251.3554); /* Dark text on primary */
  --secondary: oklch(0.2000 0.0300 252.5089); /* Darker secondary */
  --secondary-foreground: oklch(0.9500 0.0100 82.1097); /* Bright text on secondary */
  --muted: oklch(0.2500 0.0200 81.7406); /* Darker muted */
  --muted-foreground: oklch(0.7500 0.0300 82.1097); /* Lighter muted text */
  --accent: oklch(0.6500 0.0600 39); /* Pantone 4007C Gold - #AC9469 */
  --accent-foreground: oklch(0.1200 0.0150 251.3554); /* Dark text on accent */
  --destructive: oklch(0.6000 0.2000 25.3313); /* Red for errors */
  --destructive-foreground: oklch(0.9800 0.0050 0); /* White text on red */
  --border: oklch(0.3000 0.0100 59.4197); /* Visible border */
  --input: oklch(0.2000 0.0150 59.4197); /* Dark input background */
  --ring: oklch(0.6500 0.0600 39); /* Pantone 4007C Gold ring color */
  --chart-1: oklch(0.6500 0.0600 39); /* #AC9469 - Pantone 4007C Gold */
  --chart-2: oklch(0.5854 0.2041 277.1173); /* #D2D0C8 - Light Gray */
  --chart-3: oklch(0.5106 0.2301 276.9656); /* #B4AC9C - Beige */
  --chart-4: oklch(0.4568 0.2146 277.0229); /* #294359 - Petrol */
  --chart-5: oklch(0.3984 0.1773 277.3662); /* #112031 - Deep Green */
  --sidebar: oklch(0.1300 0.0180 252.5089); /* Darker sidebar */
  --sidebar-foreground: oklch(0.9500 0.0100 82.1097); /* Bright sidebar text */
  --sidebar-primary: oklch(0.6500 0.0600 39); /* Pantone 4007C Gold sidebar primary */
  --sidebar-primary-foreground: oklch(0.1200 0.0150 251.3554); /* Dark text on primary */
  --sidebar-accent: oklch(0.6500 0.0600 39); /* Pantone 4007C Gold sidebar accent */
  --sidebar-accent-foreground: oklch(0.1200 0.0150 251.3554); /* Dark text on accent */
  --sidebar-border: oklch(0.3000 0.0100 59.4197); /* Visible sidebar border */
  --sidebar-ring: oklch(0.6500 0.0600 39); /* Pantone 4007C Gold sidebar ring */
  --font-sans: Inter, sans-serif;
  --font-serif: Lora, serif;
  --font-mono: Libre Baskerville, serif;
  --radius: 1.25rem;
  --shadow-color: hsl(0 0% 0%);
  --shadow-opacity: 0.18;
  --shadow-blur: 10px;
  --shadow-spread: 4px;
  --shadow-offset-x: 2px;
  --shadow-offset-y: 2px;
  --letter-spacing: 0em;
  --spacing: 0.25rem;
  --shadow-2xs: 2px 2px 10px 4px hsl(0 0% 0% / 0.09);
  --shadow-xs: 2px 2px 10px 4px hsl(0 0% 0% / 0.09);
  --shadow-sm: 2px 2px 10px 4px hsl(0 0% 0% / 0.18), 2px 1px 2px 3px hsl(0 0% 0% / 0.18);
  --shadow: 2px 2px 10px 4px hsl(0 0% 0% / 0.18), 2px 1px 2px 3px hsl(0 0% 0% / 0.18);
  --shadow-md: 2px 2px 10px 4px hsl(0 0% 0% / 0.18), 2px 2px 4px 3px hsl(0 0% 0% / 0.18);
  --shadow-lg: 2px 2px 10px 4px hsl(0 0% 0% / 0.18), 2px 4px 6px 3px hsl(0 0% 0% / 0.18);
  --shadow-xl: 2px 2px 10px 4px hsl(0 0% 0% / 0.18), 2px 8px 10px 3px hsl(0 0% 0% / 0.18);
  --shadow-2xl: 2px 2px 10px 4px hsl(0 0% 0% / 0.45);
}

.theme {
  --font-sans: Inter, sans-serif;
  --font-mono: Libre Baskerville, serif;
  --font-serif: Lora, serif;
  --radius: 1.25rem;
  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}
`;

// Export the CSS and a small helper to inject it into the document head if desired.
export { themeCss };
export function installThemeStyles(target?: Document) {
  if (typeof document === "undefined") {return;}
  const head = (target ?? document).head;
  if (!head) {return;}
  // avoid duplicate injection
  if (head.querySelector("style[data-neonpro-theme]")) {return;}
  const style = document.createElement("style");
  style.setAttribute("data-neonpro-theme", "true");
  style.textContent = themeCss;
  head.appendChild(style);
}
