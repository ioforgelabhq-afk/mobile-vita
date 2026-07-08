# VITA Mobile — Agent Guide

VITA is an AI health **companion** (not a medical provider). Read
`.specify/memory/constitution.md` — its 10 principles are non-negotiable and override
convenience. Every feature must serve one of four pillars: onboarding, daily guidance, Living
Record, physician briefing.

## Stack

- React Native + **Expo** (managed), **TypeScript** (strict)
- **Expo Router** (routes in `app/`, kept thin — delegate to `src/features/*`)
- **Zustand** (client/UI state) · **TanStack Query** (async/server-state, always via repositories)
- **React Hook Form + Zod** (structured input — used sparingly; see Principle V)
- **NativeWind** (styling) · **Zod** (schemas = contracts + runtime validation)

## Architecture rules (hard constraints)

- **No backend exists yet.** All data access goes through the **Repository layer**
  (`src/repositories/`). Each repository has a `contracts/` interface (Zod-typed), a `mock/`
  impl (default), and an `api/` impl (future). A flag-driven registry (`repositories/index.ts`)
  selects the active one.
- **Screens/hooks import only `repositories/contracts`** — never `mock/` or `api/` directly.
  Swapping Mock → API must require **zero screen changes**.
- **Feature flags** (`src/lib/feature-flags/`) choose `mock | api` per repository; all default
  to `mock`.
- **Auth is mocked**; identity is local-first, account optional (no sign-up wall).
- **Offline-first**: encrypted `expo-sqlite` + `expo-secure-store`; mutations carry a
  `clientMutationId` and drain through a durable sync queue (`src/lib/sync/`) — replay must not
  duplicate.
- **Safety first**: `src/services/safety` runs on every patient message before normal flow.
- **Never diagnostic**: companion copy passes the `src/services/guardrails` check; on diagnosis
  requests, reframe as informational and point to a licensed provider.

## Source of truth

- **Domain model** (all 12 entities, app-wide): `docs/domain/domain-model.md`. This is
  authoritative; feature `data-model.md` files are subsets of it.
- **API contract** (REST/OpenAPI 3.1, backend-ready): `docs/api/openapi.yaml`. The `api/`
  repository impls and the future backend both conform to this.
- **Design tokens** (colors, type, radii, logo — from the brand kit): `docs/design/brand-tokens.md`.
  Feeds `tailwind.config.js` + `src/ui/`; screens use tokens, never raw hex. Spanish-first (`es`)
  UI; default accent **A · Teal**, default mark **"Ascenso"**. Crimson is critical-only.

## Spec Kit workflow

Specs live in `specs/`. Current feature: `specs/001-conversational-onboarding/`
(spec → clarify → plan done; next: `/speckit-tasks`). Use the `speckit-*` skills.
