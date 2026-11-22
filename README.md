# UGC Arabie — Arabic UGC creator marketplace

A responsive, right-to-left React platform for Arab UGC creators and businesses. Influenced by the clarity of creator marketplaces and the energetic layout of creator-first platforms, with its own brand identity.

## What is included

- Responsive Arabic landing page, creator and campaign directories, country/category filters
- Creator public profiles, avatars, portfolio links (no video hosting needed)
- Email signup/login with separate Creator and Company roles
- Creator dashboard: edit public profile, add/remove portfolio links, apply to campaigns
- Company dashboard: post campaigns, view applicants, accept/reject, start private chats
- One-to-one conversations and messages, Realtime when enabled
- Admin review of creators before public discovery
- Row-level security policies, route protection, basic upload validation
- English-ready component architecture; UI is Arabic for launch

**Scope:** Functional first release / MVP. This is not a production-certified or feature-identical clone of another service. Payment processing, video delivery, dispute handling, legal documents, abuse tooling, 2FA, monitoring, automated tests, and detailed business verification are not yet implemented.

## Current deployment and maintenance (November 2026)

- Repository: `rab2323s-creator/ugcarabie` (public), production branch: `main`.
- Production site: https://ugcarabie.com/ (HTTPS, hosted on **GitHub Pages**, not Cloudflare Pages).
- Deployment: `.github/workflows/deploy-pages.yml` builds Vite, deploys `dist`, and runs Playwright smoke checks.
- Database: dedicated Supabase project `nnhcnkatljjpjnxupltq` (`ugcarabie`); **never modify the separate `viva-media` project**.
- Frontend exposes only the Supabase **publishable** key, never service-role credentials.
- Initial schema for a *new* database: `supabase/schema.sql`. **Do not rerun it against the existing production database**.
- Production security hardening was applied as Supabase migrations on November 22, 2026: creator approval-gated profile reads, internal `app_private` role helpers, restricted avatar object listing, and corrected application-update trigger.
- The `avatars` bucket allows JPG, PNG and WebP at a maximum size of 102400 bytes; the client compresses before upload.
- Creator profiles require staff approval. The platform does not host creator videos, only external portfolio URLs.
- The site remains an MVP: real browser signups, email confirmation, real avatar uploads, and full browser-based account-to-account collaboration have **not** been independently validated.
- Payment processing, business verification, dispute handling, finalized policies, and operational abuse-reporting tools are not launched.

### Next acceptance checks

1. Register a creator from https://ugcarabie.com/register?role=creator with an accessible test email; confirm the email and verify profile access.
2. Complete the creator profile, add portfolio links, and upload a JPG/PNG/WebP avatar to verify compression to 100 KiB or below.
3. Register a separate company from https://ugcarabie.com/register?role=company, confirm the email, and complete its profile.
4. Create a separate admin account and promote only that account in Supabase SQL Editor; review and approve the creator.
5. Publish a test campaign from the company account; have the approved creator apply; accept, start a chat and exchange messages.
6. Check unauthorized access for a third unrelated signed-in user, and review the Supabase Security Advisor again.
7. Complete legal policies, staff procedures, company moderation, sender email and additional protection before public launch.

### Authentication settings

Supabase Auth Site URL and allowed redirect must include `https://ugcarabie.com/`. Keep confirmation enabled and configure production mail settings before inviting real users.

### Commands (optional if using a browser-based dev environment)

```bash
npm install
npm run dev
npm run build
```

## Deployment / privacy notes

- Supabase free plan and hosting free tiers have resource limits and can change.
- Never commit `.env` with credentials. Never use Supabase `service_role` in client-side JavaScript.
- Public portfolio links are **third-party** links. URLs must begin with `https://` or `http://`; shared links must be safe and authorized.
- Profile visibility defaults to pending approval; administrator must review.
- Only prototype legal text is included, and it must be replaced before production launch.
- Default sender/contact email is intentionally **not** configured; set up an actual support mailbox before public launch.
- Use adequate security testing, rate limiting, reporting/abuse handling and privacy processes before expanding the platform.
