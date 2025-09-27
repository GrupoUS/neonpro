# GEMINI.md - NeonPro Project

This document provides a comprehensive overview of the NeonPro project, its structure, and how to work with it.

## Project Overview

NeonPro is a modern, edge-optimized healthcare platform designed for aesthetic clinics in Brazil. It is a monorepo built with Turborepo and pnpm workspaces, encompassing a web application, an API, and several shared packages. The platform is designed to be compliant with Brazilian healthcare regulations, including LGPD, CFM, and ANVISA.

## Tech Stack

*   **Monorepo:** Turborepo, pnpm workspaces
*   **Frontend:** React, Vite, TypeScript, Tailwind CSS
*   **Backend:** Hono, tRPC, Prisma, Supabase
*   **Database:** PostgreSQL (via Supabase)
*   **Testing:** Vitest, Playwright
*   **Linting & Formatting:** BiomeJS, ESLint, OXLint, dprint
*   **Deployment:** Vercel

## Monorepo Structure

The project is organized into `apps` and `packages`:

*   `apps`: Contains the main applications.
    *   `web`: The main web application.
    *   `api`: The backend API.
*   `packages`: Contains shared code and libraries.
    *   `ai-services`: Services related to AI.
    *   `database`: Prisma schema and database utilities.
    *   `healthcare-core`: Core healthcare-related functionality.
    *   `security`: Security-related utilities.
    *   `shared`: Shared utilities and types.
    *   `types`: Shared TypeScript types.
    *   `ui`: React component library.
    *   `utils`: General utility functions.

## Key Commands

The following commands are available at the root of the monorepo:

*   `pnpm dev`: Start the development servers for all apps.
*   `pnpm build`: Build all apps and packages.
*   `pnpm test`: Run all tests.
*   `pnpm lint`: Lint the entire codebase.
*   `pnpm format`: Format the entire codebase.
*   `pnpm type-check`: Run TypeScript type checking for the entire project.

## Development Conventions

*   **Code Style:** The project uses BiomeJS for formatting and linting. Please run `pnpm format` and `pnpm lint` before committing your changes.
*   **Testing:** The project uses Vitest for unit and integration testing, and Playwright for end-to-end testing. Please add tests for any new features or bug fixes.
*   **Commits:** Please follow the conventional commit format for your commit messages.
*   **Branching:** Please create a new branch for each new feature or bug fix.
