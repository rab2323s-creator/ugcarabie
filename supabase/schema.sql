-- UGC Arabie — initial Supabase database schema
-- Run once in a NEW Supabase project using SQL Editor.
-- Important: Review legal/privacy and production security checklist before public launch.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('creator','company','admin')),
  display_name text not null default '' check (char_length(display_name) <= 80),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,40}$'),
  avatar_url text,
  country text,
  city text,
  bio text check (char_length(bio) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.creator_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  headline text default '' check (char_length(headline) <= 120),
  niches text[] not null default '{}',
  languages text[] not null default '{العربية}',
  starting_price numeric(10,2) check (starting_price >= 0),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.company_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  website text,
  industry text,
  created_at timestamptz not null default now()
);

create table public.portfolio_links (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles(user_id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  url text not null check (url ~* '^https?://[^[:space:]]{4,2048}$'),
  created_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) between 10 and 4000),
  category text not null,
  country text not null,
  budget_min numeric(10,2) not null check (budget_min >= 1),
  budget_max numeric(10,2) not null check (budget_max >= budget_min),
  deliverables text not null check (char_length(deliverables) between 2 and 200),
  deadline date,
  status text not null default 'published' check (status in ('draft','published','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now(),
  unique(campaign_id,creator_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(campaign_id,creator_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index idx_creators_approved on public.creator_profiles(approved);
create index idx_campaigns_status_created on public.campaigns(status,created_at desc);
create index idx_campaigns_company on public.campaigns(company_id);
create index idx_applications_campaign on public.applications(campaign_id);
create index idx_applications_creator on public.applications(creator_id);
create index idx_conversations_creator on public.conversations(creator_id);
create index idx_conversations_company on public.conversations(company_id);
create index idx_messages_thread on public.messages(conversation_id,created_at);

create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to anon, authenticated, service_role;
create or replace function app_private.current_role()
returns text language sql stable security definer set search_path = ''
as $ select role from public.profiles where id = (select auth.uid()) $;
create or replace function app_private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $ select coalesce((select role = 'admin' from public.profiles where id = (select auth.uid())), false) $;
revoke all on function app_private.current_role() from public, anon, authenticated;
revoke all on function app_private.is_admin() from public, anon, authenticated;
grant execute on function app_private.current_role(), app_private.is_admin() to anon, authenticated, service_role;
create or replace function public.current_role()
returns text language sql stable security invoker set search_path = ''
as $ select app_private.current_role() $;
create or replace function public.is_admin()
returns boolean language sql stable security invoker set search_path = ''
as $ select app_private.is_admin() $;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger campaigns_updated_at before update on public.campaigns for each row execute function public.set_updated_at();

-- User signup: never trust a requested 'admin' role in client metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare requested_role text;
begin
  requested_role := case when new.raw_user_meta_data->>'role' = 'company' then 'company' else 'creator' end;
  insert into public.profiles(id,role,display_name,slug)
  values (new.id,requested_role,left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'مستخدم'),80),'u-' || left(replace(new.id::text,'-',''),20));
  if requested_role = 'company' then
    insert into public.company_profiles(user_id) values (new.id);
  else
    insert into public.creator_profiles(user_id) values (new.id);
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- No authenticated user may elevate themselves to admin.
create or replace function public.protect_profile_role()
returns trigger language plpgsql set search_path = ''
as $$
begin
 if new.role is distinct from old.role and (select auth.uid()) is not null then
   raise exception 'Role is managed by administrators';
 end if;
 return new;
end; $$;
create trigger before_profile_role_change before update on public.profiles for each row execute function public.protect_profile_role();

-- Only admins may approve a creator.
create or replace function public.protect_creator_approval()
returns trigger language plpgsql set search_path = ''
as $$
begin
 if new.approved is distinct from old.approved and not public.is_admin() then
   raise exception 'Only administrators may change approval';
 end if;
 return new;
end; $$;
create trigger before_creator_approval_change before update on public.creator_profiles for each row execute function public.protect_creator_approval();

alter table public.profiles enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.company_profiles enable row level security;
alter table public.portfolio_links enable row level security;
alter table public.campaigns enable row level security;
alter table public.applications enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Public profiles intentionally contain no email addresses.
create policy "public profile read" on public.profiles for select using (
 id = (select auth.uid()) or (select public.is_admin()) or role = 'company'
 or (role = 'creator' and exists (
  select 1 from public.creator_profiles cp where cp.user_id = profiles.id and cp.approved
 ))
 or exists (select 1 from public.conversations c where
  (c.creator_id = profiles.id and c.company_id = (select auth.uid()))
  or (c.company_id = profiles.id and c.creator_id = (select auth.uid()))
 )
);
create policy "owner profile edit" on public.profiles for update to authenticated using (id = (select auth.uid()) or public.is_admin()) with check (id = (select auth.uid()) or public.is_admin());

create policy "approved creator read" on public.creator_profiles for select using (approved = true or user_id = (select auth.uid()) or public.is_admin());
create policy "owner creator edit" on public.creator_profiles for update to authenticated using ((user_id = (select auth.uid()) and public.current_role() = 'creator') or public.is_admin()) with check ((user_id = (select auth.uid()) and public.current_role() = 'creator') or public.is_admin());
create policy "public company read" on public.company_profiles for select using (true);
create policy "owner company edit" on public.company_profiles for update to authenticated using ((user_id = (select auth.uid()) and public.current_role() = 'company') or public.is_admin()) with check ((user_id = (select auth.uid()) and public.current_role() = 'company') or public.is_admin());

create policy "approved portfolio read" on public.portfolio_links for select using (
 creator_id = (select auth.uid()) or public.is_admin() or exists(select 1 from public.creator_profiles cp where cp.user_id=creator_id and cp.approved)
);
create policy "portfolio owner insert" on public.portfolio_links for insert to authenticated with check (creator_id=(select auth.uid()) and public.current_role()='creator');
-- Enforce portfolio limit without a self-referential RLS policy.
create or replace function public.enforce_portfolio_limit()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
 if (select count(*) from public.portfolio_links where creator_id = new.creator_id) >= 8 then
   raise exception 'Maximum 8 portfolio links per creator';
 end if;
 return new;
end; $$;
create trigger portfolio_limit_before_insert before insert on public.portfolio_links
for each row execute function public.enforce_portfolio_limit();

-- Stop conversation/application participant substitution after creation.
create or replace function public.protect_relationship_keys()
returns trigger language plpgsql set search_path = ''
as $$
begin
 if (select auth.uid()) is not null then
   if tg_table_name = 'conversations' and
      (new.company_id is distinct from old.company_id or
       new.creator_id is distinct from old.creator_id or
       new.campaign_id is distinct from old.campaign_id) then
       raise exception 'Conversation participants cannot change';
   end if;
   if tg_table_name = 'applications' and
      (new.creator_id is distinct from old.creator_id or
       new.campaign_id is distinct from old.campaign_id) then
       raise exception 'Application participants cannot change';
   end if;
 end if;
 return new;
end; $$;
create trigger protect_conversations_before_update before update on public.conversations
for each row execute function public.protect_relationship_keys();
create trigger protect_applications_before_update before update on public.applications
for each row execute function public.protect_relationship_keys();

create policy "portfolio owner delete" on public.portfolio_links for delete to authenticated using (creator_id=(select auth.uid()) or public.is_admin());

create policy "published campaigns read" on public.campaigns for select using (status = 'published' or company_id=(select auth.uid()) or public.is_admin());
create policy "company creates campaign" on public.campaigns for insert to authenticated with check (company_id=(select auth.uid()) and public.current_role()='company');
create policy "company updates campaign" on public.campaigns for update to authenticated using (company_id=(select auth.uid()) or public.is_admin()) with check (company_id=(select auth.uid()) or public.is_admin());

create policy "application participants read" on public.applications for select to authenticated using (
 creator_id=(select auth.uid()) or public.is_admin() or exists(select 1 from public.campaigns c where c.id=campaign_id and c.company_id=(select auth.uid()))
);
create policy "approved creator applies" on public.applications for insert to authenticated with check (
 creator_id=(select auth.uid()) and public.current_role()='creator' and status='pending'
 and exists(select 1 from public.creator_profiles cp where cp.user_id=(select auth.uid()) and cp.approved)
 and exists(select 1 from public.campaigns c where c.id=campaign_id and c.status='published' and (c.deadline is null or c.deadline>=current_date))
);
create policy "campaign company updates applications" on public.applications for update to authenticated using (
 public.is_admin() or exists(select 1 from public.campaigns c where c.id=campaign_id and c.company_id=(select auth.uid()))
) with check (public.is_admin() or exists(select 1 from public.campaigns c where c.id=campaign_id and c.company_id=(select auth.uid())));

create policy "conversation participants read" on public.conversations for select to authenticated using (creator_id=(select auth.uid()) or company_id=(select auth.uid()) or public.is_admin());
create policy "company creates accepted conversation" on public.conversations for insert to authenticated with check (
 company_id=(select auth.uid()) and public.current_role()='company'
 and exists(select 1 from public.campaigns c where c.id=campaign_id and c.company_id=(select auth.uid()))
 and exists(select 1 from public.applications a where a.campaign_id=conversations.campaign_id and a.creator_id=conversations.creator_id and a.status='accepted')
);
create policy "company updates accepted conversation" on public.conversations for update to authenticated using (company_id=(select auth.uid()) and public.current_role()='company') with check (company_id=(select auth.uid()) and public.current_role()='company');

create policy "conversation messages read" on public.messages for select to authenticated using (
 exists(select 1 from public.conversations c where c.id=conversation_id and (c.creator_id=(select auth.uid()) or c.company_id=(select auth.uid()) or public.is_admin()))
);
create policy "conversation participants send" on public.messages for insert to authenticated with check (
 sender_id=(select auth.uid()) and exists(select 1 from public.conversations c where c.id=conversation_id and (c.creator_id=(select auth.uid()) or c.company_id=(select auth.uid())))
);

-- Avatar upload path must start with the authenticated user's UUID.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avatars','avatars',true,102400,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "users can inspect their own avatar metadata" on storage.objects
for select to authenticated using (
 bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text
);
create policy "users upload into own avatar folder" on storage.objects for insert to authenticated with check (
 bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text
);
create policy "users remove own avatars" on storage.objects for delete to authenticated using (
 bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text
);

-- Realtime chat (the SQL script is intended to run once in a new Supabase project).
alter publication supabase_realtime add table public.messages;

-- Internal trigger functions must not be callable through the public Data API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.enforce_portfolio_limit() from public, anon, authenticated;

-- After creating your own account, grant admin via SQL Editor only:
-- update public.profiles set role='admin' where id = 'YOUR_USER_UUID';
-- Note: admin is a separate role; create a distinct staff account rather than
-- converting the only creator/company account if you still need to test those roles.
