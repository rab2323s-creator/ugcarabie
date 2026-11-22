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

## Setup entirely from a web browser

1. Create a **private** GitHub repository named `ugcarabie` and make it accessible to the GitHub connection.
2. Create a free project in [Supabase](https://supabase.com/dashboard). No local installation required.
3. In **SQL Editor**, run `supabase/schema.sql` (a single time on a fresh project).
4. In Supabase **Authentication > Providers**, enable email; in **URL Configuration**, set your deployed domain and allowed redirect URLs. Email confirmation should stay enabled for public launch.
5. Copy **Project URL** and **publishable/anon key** from Supabase API settings. **Never share the service_role key or database password.**
6. Create project environment variables (via the host control panel or `.env` locally):
   - `VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY`
7. Deploy on [Cloudflare Pages](https://dash.cloudflare.com/) by connecting GitHub; set:
   - Build command: `npm run build`
   - Build output: `dist`
   - Production branch: `main`
   - Add both `VITE_*` environment variables in Cloudflare Pages settings.
8. Add the custom domain `ugcarabie.com` from the Cloudflare Pages dashboard after obtaining the domain and DNS access.
9. Create a separate staff account and promote it to `admin` using Supabase SQL Editor with its exact `auth.users.id`, e.g. `update public.profiles set role='admin' where id='UUID';` (do not paste any private API keys in chat).
10. Before inviting the public, finish legal documents, privacy/deletion flow, moderation tools, transactional email branding and real-device testing.

**Preview mode:** GitHub Pages builds with the public Supabase URL and publishable key. With no approved creators or published campaigns, directories display clearly marked, non-clickable demo cards. Login and signup use the real Supabase project. For email verification, configure the Site URL and allowed redirect URL in Supabase Auth to include https://rab2323s-creator.github.io/ugcarabie/. The public URL and publishable key are not secret credentials; never put a secret/service_role key in client code.

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
