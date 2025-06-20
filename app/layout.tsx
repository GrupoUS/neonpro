import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Define o modo escuro como padrão
          enableSystem={false} // Opcional: desabilita a opção "System" se você só quer claro/escuro
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
