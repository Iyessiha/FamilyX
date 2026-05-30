-- ============================================================
-- FamilyX — Migration 001 : Schéma complet
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- recherche floue sur les noms

-- ============================================================
-- TABLE : profiles
-- Étend auth.users de Supabase Auth
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  circle_id     text not null check (circle_id in ('family','mosque','church','org','club')),
  role_id       text not null,
  role_label    text not null,
  role_emoji    text not null default '👤',
  avatar_url    text,
  bio           text default '',
  location      text default '',
  phone         text default '',
  is_verified   boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Index pour recherche par cercle et par nom
create index profiles_circle_id_idx on public.profiles(circle_id);
create index profiles_name_trgm_idx on public.profiles using gin(name gin_trgm_ops);

-- ── RLS profiles ───────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Lecture : tout utilisateur authentifié peut voir les profils
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (true);

-- Insertion : seulement son propre profil
create policy "profiles_insert" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

-- Mise à jour : seulement son propre profil
create policy "profiles_update" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Suppression : seulement son propre profil
create policy "profiles_delete" on public.profiles
  for delete to authenticated
  using ((select auth.uid()) = id);

-- ── Trigger : updated_at automatique ──────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Trigger : auto-créer profil à l'inscription ───────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, circle_id, role_id, role_label, role_emoji)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'circle_id', 'family'),
    coalesce(new.raw_user_meta_data->>'role_id', 'membre'),
    coalesce(new.raw_user_meta_data->>'role_label', 'Membre'),
    coalesce(new.raw_user_meta_data->>'role_emoji', '👤')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TABLE : subscriptions
-- ============================================================
create table public.subscriptions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  plan_id         text not null check (plan_id in ('free','premium','pro')) default 'free',
  billing         text check (billing in ('monthly','yearly')),
  status          text not null check (status in ('active','cancelled','expired','pending')) default 'active',
  payment_method  text,
  moneroo_tx_id   text,
  activated_at    timestamptz default now(),
  expires_at      timestamptz,
  auto_renew      boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(user_id)
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_expires_at_idx on public.subscriptions(expires_at);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select" on public.subscriptions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "subscriptions_insert" on public.subscriptions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "subscriptions_update" on public.subscriptions
  for update to authenticated
  using ((select auth.uid()) = user_id);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ============================================================
-- TABLE : payment_transactions
-- ============================================================
create table public.payment_transactions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  moneroo_tx_id   text unique,
  plan_id         text not null,
  billing         text,
  amount          integer not null, -- en centimes XOF
  currency        text not null default 'XOF',
  status          text not null check (status in ('pending','success','failed','refunded')) default 'pending',
  payment_method  text,
  country         text,
  metadata        jsonb default '{}',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index payment_tx_user_id_idx on public.payment_transactions(user_id);
create index payment_tx_moneroo_id_idx on public.payment_transactions(moneroo_tx_id);

alter table public.payment_transactions enable row level security;

create policy "payment_tx_select" on public.payment_transactions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "payment_tx_insert" on public.payment_transactions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE : member_links
-- Relations entre membres (liens familiaux etc.)
-- ============================================================
create table public.member_links (
  id              uuid primary key default uuid_generate_v4(),
  from_user_id    uuid not null references public.profiles(id) on delete cascade,
  to_user_id      uuid not null references public.profiles(id) on delete cascade,
  relation        text not null default 'contact',
  status          text not null check (status in ('pending','accepted','refused')) default 'pending',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(from_user_id, to_user_id)
);

create index member_links_from_idx on public.member_links(from_user_id);
create index member_links_to_idx   on public.member_links(to_user_id);
create index member_links_status_idx on public.member_links(status);

alter table public.member_links enable row level security;

-- Voir les liens qui me concernent
create policy "member_links_select" on public.member_links
  for select to authenticated
  using (
    (select auth.uid()) = from_user_id or
    (select auth.uid()) = to_user_id
  );

-- Envoyer une demande
create policy "member_links_insert" on public.member_links
  for insert to authenticated
  with check ((select auth.uid()) = from_user_id);

-- Accepter/refuser (seul le destinataire peut modifier le status)
create policy "member_links_update" on public.member_links
  for update to authenticated
  using ((select auth.uid()) = to_user_id)
  with check ((select auth.uid()) = to_user_id);

create policy "member_links_delete" on public.member_links
  for delete to authenticated
  using (
    (select auth.uid()) = from_user_id or
    (select auth.uid()) = to_user_id
  );

create trigger member_links_updated_at
  before update on public.member_links
  for each row execute function public.set_updated_at();

-- ============================================================
-- TABLE : conversations
-- ============================================================
create table public.conversations (
  id            uuid primary key default uuid_generate_v4(),
  participant_a uuid not null references public.profiles(id) on delete cascade,
  participant_b uuid not null references public.profiles(id) on delete cascade,
  last_message  text default '',
  last_at       timestamptz default now(),
  created_at    timestamptz default now(),
  unique(participant_a, participant_b),
  check (participant_a < participant_b) -- garantit l'unicité (a < b)
);

create index conversations_a_idx on public.conversations(participant_a);
create index conversations_b_idx on public.conversations(participant_b);
create index conversations_last_at_idx on public.conversations(last_at desc);

alter table public.conversations enable row level security;

create policy "conversations_select" on public.conversations
  for select to authenticated
  using (
    (select auth.uid()) = participant_a or
    (select auth.uid()) = participant_b
  );

create policy "conversations_insert" on public.conversations
  for insert to authenticated
  with check (
    (select auth.uid()) = participant_a or
    (select auth.uid()) = participant_b
  );

create policy "conversations_update" on public.conversations
  for update to authenticated
  using (
    (select auth.uid()) = participant_a or
    (select auth.uid()) = participant_b
  );

-- ============================================================
-- TABLE : messages
-- ============================================================
create table public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  content         text not null,
  type            text not null check (type in ('text','image','file','system')) default 'text',
  is_read         boolean default false,
  created_at      timestamptz default now()
);

create index messages_conv_id_idx      on public.messages(conversation_id);
create index messages_sender_id_idx    on public.messages(sender_id);
create index messages_created_at_idx   on public.messages(created_at desc);
create index messages_conv_created_idx on public.messages(conversation_id, created_at asc);

alter table public.messages enable row level security;

-- Lire les messages de ses conversations
create policy "messages_select" on public.messages
  for select to authenticated
  using (
    conversation_id in (
      select id from public.conversations
      where participant_a = (select auth.uid())
         or participant_b = (select auth.uid())
    )
  );

-- Envoyer un message dans sa conversation
create policy "messages_insert" on public.messages
  for insert to authenticated
  with check (
    (select auth.uid()) = sender_id and
    conversation_id in (
      select id from public.conversations
      where participant_a = (select auth.uid())
         or participant_b = (select auth.uid())
    )
  );

-- Marquer comme lu (seul le destinataire)
create policy "messages_update" on public.messages
  for update to authenticated
  using (
    sender_id != (select auth.uid()) and
    conversation_id in (
      select id from public.conversations
      where participant_a = (select auth.uid())
         or participant_b = (select auth.uid())
    )
  );

-- Trigger : met à jour last_message et last_at dans conversations
create or replace function public.update_conversation_last_message()
returns trigger language plpgsql security definer as $$
begin
  update public.conversations
  set last_message = new.content, last_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_update_conversation
  after insert on public.messages
  for each row execute function public.update_conversation_last_message();

-- ============================================================
-- TABLE : groups
-- ============================================================
create table public.groups (
  id          uuid primary key default uuid_generate_v4(),
  circle_id   text not null,
  name        text not null,
  description text default '',
  emoji       text default '👥',
  admin_id    uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index groups_circle_id_idx on public.groups(circle_id);
create index groups_admin_id_idx  on public.groups(admin_id);

alter table public.groups enable row level security;

-- ============================================================
-- TABLE : group_members
-- ============================================================
create table public.group_members (
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role        text default 'member' check (role in ('admin','member')),
  joined_at   timestamptz default now(),
  primary key (group_id, user_id)
);

create index group_members_user_idx  on public.group_members(user_id);
create index group_members_group_idx on public.group_members(group_id);

alter table public.group_members enable row level security;

-- Helper function : est-ce que l'utilisateur est membre du groupe ?
create or replace function public.is_group_member(p_group_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = (select auth.uid())
  );
$$;

-- RLS groups
create policy "groups_select" on public.groups
  for select to authenticated
  using (
    -- membre du groupe OU admin OU même cercle
    (select public.is_group_member(id)) or
    admin_id = (select auth.uid()) or
    circle_id in (select circle_id from public.profiles where id = (select auth.uid()))
  );

create policy "groups_insert" on public.groups
  for insert to authenticated
  with check (admin_id = (select auth.uid()));

create policy "groups_update" on public.groups
  for update to authenticated
  using (admin_id = (select auth.uid()));

create policy "groups_delete" on public.groups
  for delete to authenticated
  using (admin_id = (select auth.uid()));

-- RLS group_members
create policy "group_members_select" on public.group_members
  for select to authenticated
  using (
    user_id = (select auth.uid()) or
    (select public.is_group_member(group_id))
  );

create policy "group_members_insert" on public.group_members
  for insert to authenticated
  with check (
    user_id = (select auth.uid()) or
    -- l'admin peut ajouter des membres
    (select admin_id from public.groups where id = group_id) = (select auth.uid())
  );

create policy "group_members_delete" on public.group_members
  for delete to authenticated
  using (
    user_id = (select auth.uid()) or
    (select admin_id from public.groups where id = group_id) = (select auth.uid())
  );

-- ============================================================
-- TABLE : group_messages
-- ============================================================
create table public.group_messages (
  id          uuid primary key default uuid_generate_v4(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  type        text default 'text' check (type in ('text','image','file','system')),
  created_at  timestamptz default now()
);

create index group_messages_group_idx   on public.group_messages(group_id);
create index group_messages_sender_idx  on public.group_messages(sender_id);
create index group_messages_created_idx on public.group_messages(group_id, created_at asc);

alter table public.group_messages enable row level security;

create policy "group_messages_select" on public.group_messages
  for select to authenticated
  using ((select public.is_group_member(group_id)));

create policy "group_messages_insert" on public.group_messages
  for insert to authenticated
  with check (
    (select auth.uid()) = sender_id and
    (select public.is_group_member(group_id))
  );

-- ============================================================
-- TABLE : stories
-- Expire automatiquement après 24h
-- ============================================================
create table public.stories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  circle_id   text not null,
  image_url   text,
  text        text,
  bg_gradient text default 'linear-gradient(135deg, #1a1a2e, #16213e)',
  views       uuid[] default '{}',
  expires_at  timestamptz default (now() + interval '24 hours'),
  created_at  timestamptz default now()
);

create index stories_circle_id_idx  on public.stories(circle_id);
create index stories_user_id_idx    on public.stories(user_id);
create index stories_expires_at_idx on public.stories(expires_at);

alter table public.stories enable row level security;

-- Voir les stories de son cercle non expirées
create policy "stories_select" on public.stories
  for select to authenticated
  using (
    expires_at > now() and
    circle_id in (
      select circle_id from public.profiles where id = (select auth.uid())
    )
  );

create policy "stories_insert" on public.stories
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "stories_update" on public.stories
  for update to authenticated
  using ((select auth.uid()) = user_id);

create policy "stories_delete" on public.stories
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE : posts (feed)
-- ============================================================
create table public.posts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  circle_id   text not null,
  content     text not null,
  type        text default 'status' check (type in ('status','photo','event','announcement','verse')),
  image_urls  text[] default '{}',
  likes       uuid[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index posts_circle_id_idx  on public.posts(circle_id);
create index posts_user_id_idx    on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);

alter table public.posts enable row level security;

-- Voir les posts de son cercle
create policy "posts_select" on public.posts
  for select to authenticated
  using (
    circle_id in (
      select circle_id from public.profiles where id = (select auth.uid())
    )
  );

create policy "posts_insert" on public.posts
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "posts_update" on public.posts
  for update to authenticated
  using ((select auth.uid()) = user_id);

create policy "posts_delete" on public.posts
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE : comments
-- ============================================================
create table public.comments (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz default now()
);

create index comments_post_id_idx on public.comments(post_id);
create index comments_user_id_idx on public.comments(user_id);

alter table public.comments enable row level security;

create policy "comments_select" on public.comments
  for select to authenticated
  using (
    post_id in (
      select id from public.posts
      where circle_id in (
        select circle_id from public.profiles where id = (select auth.uid())
      )
    )
  );

create policy "comments_insert" on public.comments
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "comments_delete" on public.comments
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE : events
-- ============================================================
create table public.events (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  circle_id   text not null,
  title       text not null,
  description text default '',
  emoji       text default '📅',
  location    text default '',
  event_date  date not null,
  event_time  time,
  going       uuid[] default '{}',
  maybe       uuid[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index events_circle_id_idx  on public.events(circle_id);
create index events_event_date_idx on public.events(event_date asc);

alter table public.events enable row level security;

create policy "events_select" on public.events
  for select to authenticated
  using (
    circle_id in (
      select circle_id from public.profiles where id = (select auth.uid())
    )
  );

create policy "events_insert" on public.events
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "events_update" on public.events
  for update to authenticated
  using (
    (select auth.uid()) = user_id or
    -- Les membres peuvent s'ajouter/retirer de going/maybe
    circle_id in (
      select circle_id from public.profiles where id = (select auth.uid())
    )
  );

create policy "events_delete" on public.events
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE : notifications
-- ============================================================
create table public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('link','message','story','event','member','group','subscription','system')),
  title       text not null,
  body        text not null,
  emoji       text default '🔔',
  is_read     boolean default false,
  data        jsonb default '{}',
  created_at  timestamptz default now()
);

create index notifications_user_id_idx   on public.notifications(user_id);
create index notifications_is_read_idx   on public.notifications(user_id, is_read);
create index notifications_created_at_idx on public.notifications(created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select" on public.notifications
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "notifications_insert" on public.notifications
  for insert to authenticated
  with check (true); -- les triggers peuvent insérer des notifs

create policy "notifications_update" on public.notifications
  for update to authenticated
  using ((select auth.uid()) = user_id);

create policy "notifications_delete" on public.notifications
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================
-- TABLE : gallery (photos)
-- ============================================================
create table public.gallery (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  circle_id   text not null,
  title       text not null,
  image_url   text not null,
  album       text default 'Général',
  likes       uuid[] default '{}',
  storage_path text, -- chemin dans Supabase Storage
  size_bytes  integer default 0,
  created_at  timestamptz default now()
);

create index gallery_circle_id_idx on public.gallery(circle_id);
create index gallery_user_id_idx   on public.gallery(user_id);
create index gallery_album_idx     on public.gallery(circle_id, album);

alter table public.gallery enable row level security;

create policy "gallery_select" on public.gallery
  for select to authenticated
  using (
    circle_id in (
      select circle_id from public.profiles where id = (select auth.uid())
    )
  );

create policy "gallery_insert" on public.gallery
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "gallery_delete" on public.gallery
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================
-- FONCTIONS UTILITAIRES
-- ============================================================

-- Recherche de membres dans tous les cercles (pour "Rechercher par ID")
create or replace function public.search_members(search_query text, exclude_id uuid)
returns table (
  id          uuid,
  name        text,
  circle_id   text,
  role_label  text,
  role_emoji  text,
  avatar_url  text,
  location    text
) language sql security definer stable as $$
  select
    p.id, p.name, p.circle_id, p.role_label, p.role_emoji, p.avatar_url, p.location
  from public.profiles p
  where
    p.id != exclude_id and
    (
      p.id::text = search_query or
      p.name ilike '%' || search_query || '%'
    )
  limit 20;
$$;

-- Obtenir ou créer une conversation entre deux utilisateurs
create or replace function public.get_or_create_conversation(other_user_id uuid)
returns uuid language plpgsql security definer as $$
declare
  v_conv_id   uuid;
  v_user_id   uuid := (select auth.uid());
  v_a         uuid;
  v_b         uuid;
begin
  -- Toujours mettre le plus petit UUID en participant_a (garantit l'unicité)
  if v_user_id < other_user_id then
    v_a := v_user_id; v_b := other_user_id;
  else
    v_a := other_user_id; v_b := v_user_id;
  end if;

  select id into v_conv_id
  from public.conversations
  where participant_a = v_a and participant_b = v_b;

  if v_conv_id is null then
    insert into public.conversations (participant_a, participant_b)
    values (v_a, v_b)
    returning id into v_conv_id;
  end if;

  return v_conv_id;
end;
$$;

-- Compteur de messages non lus
create or replace function public.unread_count(p_user_id uuid)
returns integer language sql security definer stable as $$
  select count(*)::integer
  from public.messages m
  join public.conversations c on c.id = m.conversation_id
  where
    (c.participant_a = p_user_id or c.participant_b = p_user_id) and
    m.sender_id != p_user_id and
    m.is_read = false;
$$;

-- ============================================================
-- TRIGGERS NOTIFICATIONS AUTOMATIQUES
-- ============================================================

-- Notif : nouvelle demande de lien
create or replace function public.notify_link_request()
returns trigger language plpgsql security definer as $$
declare
  v_from_name text;
begin
  select name into v_from_name from public.profiles where id = new.from_user_id;
  insert into public.notifications (user_id, type, title, body, emoji, data)
  values (
    new.to_user_id,
    'link',
    'Demande de lien',
    v_from_name || ' veut vous lier comme "' || new.relation || '"',
    '🔗',
    jsonb_build_object('from_user_id', new.from_user_id, 'link_id', new.id)
  );
  return new;
end;
$$;

create trigger notify_on_link_request
  after insert on public.member_links
  for each row when (new.status = 'pending')
  execute function public.notify_link_request();

-- Notif : nouveau message privé
create or replace function public.notify_new_message()
returns trigger language plpgsql security definer as $$
declare
  v_sender_name text;
  v_recipient   uuid;
  v_conv        record;
begin
  select * into v_conv from public.conversations where id = new.conversation_id;
  select name into v_sender_name from public.profiles where id = new.sender_id;
  -- Le destinataire est l'autre participant
  if v_conv.participant_a = new.sender_id then
    v_recipient := v_conv.participant_b;
  else
    v_recipient := v_conv.participant_a;
  end if;
  insert into public.notifications (user_id, type, title, body, emoji, data)
  values (
    v_recipient,
    'message',
    'Nouveau message',
    v_sender_name || ' : ' || left(new.content, 80),
    '💬',
    jsonb_build_object('conversation_id', new.conversation_id, 'sender_id', new.sender_id)
  );
  return new;
end;
$$;

create trigger notify_on_message
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- Notif : nouvelle story
create or replace function public.notify_new_story()
returns trigger language plpgsql security definer as $$
declare
  v_author_name text;
  v_rec         record;
begin
  select name into v_author_name from public.profiles where id = new.user_id;
  for v_rec in (
    select id from public.profiles
    where circle_id = new.circle_id and id != new.user_id
  ) loop
    insert into public.notifications (user_id, type, title, body, emoji, data)
    values (
      v_rec.id, 'story', 'Nouvelle story',
      v_author_name || ' a publié une story',
      '📸',
      jsonb_build_object('story_id', new.id, 'author_id', new.user_id)
    );
  end loop;
  return new;
end;
$$;

create trigger notify_on_story
  after insert on public.stories
  for each row execute function public.notify_new_story();

-- ============================================================
-- STORAGE BUCKETS
-- (À créer dans Supabase Dashboard > Storage ou via API)
-- ============================================================
-- Bucket : avatars       → photos de profil
-- Bucket : gallery       → galerie du cercle
-- Bucket : stories       → images stories
-- Bucket : attachments   → pièces jointes messages

-- Policy Storage avatars : chacun peut lire, seul propriétaire peut écrire
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('gallery', 'gallery', false);
-- insert into storage.buckets (id, name, public) values ('stories', 'stories', false);

-- ============================================================
-- REALTIME : activer les tables pour les subscriptions
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.group_messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.stories;
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.conversations;
