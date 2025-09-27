import type { Config } from 'tailwindcss'
import baseConfig from '../../packages/ui/tailwind.config'

const config: Config = {
  ...baseConfig,
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      // Additional overrides specific to web app can go here
    },
  },
}

export default config
