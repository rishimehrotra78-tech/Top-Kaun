-- eknumber.in database schema
-- Run once in the Supabase SQL editor (Project → SQL → New query → paste → Run).

create extension if not exists pgcrypto;

-- One row per listed link. Rank = total_paise (cumulative boli).
create table if not exists listings (
  id           uuid primary key default gen_random_uuid(),
  domain       text not null unique,          -- normalised: "masalalab.co", "instagram.com/masalalab"
  url          text not null,                 -- full https URL we redirect to
  name         text not null check (char_length(name) between 1 and 40),
  tagline      text not null check (char_length(tagline) between 1 and 110),
  category     text not null,
  city         text not null default 'India',
  total_paise  bigint not null default 0 check (total_paise >= 0),
  clicks       bigint not null default 0,
  hidden       boolean not null default false, -- set true to remove a listing (moderation)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists listings_rank_idx on listings (total_paise desc, created_at asc) where not hidden;

-- One row per Razorpay order. The listing draft travels with the order,
-- so a paid order can always be applied even if the browser closed.
create table if not exists payments (
  id                  uuid primary key default gen_random_uuid(),
  razorpay_order_id   text not null unique,
  razorpay_payment_id text unique,
  amount_paise        bigint not null check (amount_paise >= 4900),
  status              text not null default 'created' check (status in ('created','paid','failed')),
  domain              text not null,
  url                 text not null,
  name                text not null,
  tagline             text not null,
  category            text not null,
  city                text not null,
  email               text,
  listing_id          uuid references listings(id),
  created_at          timestamptz not null default now(),
  paid_at             timestamptz
);
create index if not exists payments_paid_at_idx on payments (paid_at) where status = 'paid';
create index if not exists payments_listing_idx on payments (listing_id);

-- Public activity feed (no emails, no payment ids).
create table if not exists activity (
  id          bigserial primary key,
  listing_id  uuid references listings(id),
  text        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists activity_listing_idx on activity (listing_id);

-- Apply a captured payment exactly once.
-- Called by both the browser verify route and the Razorpay webhook; whichever
-- arrives second is a no-op. Row lock on the payment prevents double counting.
create or replace function apply_payment(p_order_id text, p_payment_id text)
returns table (listing_id uuid, rank bigint, total_paise bigint, already_applied boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  p payments%rowtype;
  l listings%rowtype;
  is_new boolean;
  r bigint;
begin
  select * into p from payments where razorpay_order_id = p_order_id for update;
  if not found then
    raise exception 'unknown order %', p_order_id;
  end if;

  if p.status = 'paid' then
    select * into l from listings where id = p.listing_id;
    select count(*) + 1 into r from listings x
      where not x.hidden and (x.total_paise > l.total_paise
        or (x.total_paise = l.total_paise and x.created_at < l.created_at));
    return query select l.id, r, l.total_paise, true;
    return;
  end if;

  select * into l from listings where domain = p.domain for update;
  is_new := not found;

  if is_new then
    insert into listings (domain, url, name, tagline, category, city, total_paise)
    values (p.domain, p.url, p.name, p.tagline, p.category, p.city, p.amount_paise)
    returning * into l;
  else
    update listings set total_paise = listings.total_paise + p.amount_paise, updated_at = now()
    where id = l.id returning * into l;
  end if;

  update payments set status = 'paid', razorpay_payment_id = p_payment_id,
    paid_at = now(), listing_id = l.id
  where id = p.id;

  select count(*) + 1 into r from listings x
    where not x.hidden and (x.total_paise > l.total_paise
      or (x.total_paise = l.total_paise and x.created_at < l.created_at));

  insert into activity (listing_id, text) values (
    l.id,
    case when is_new
      then l.name || ' joined with ₹' || (p.amount_paise / 100) || ' → #' || r
      else l.name || ' topped up ₹' || (p.amount_paise / 100) || ' → #' || r
    end);

  return query select l.id, r, l.total_paise, false;
end;
$$;

-- Count a click (used by /go/[id]).
create or replace function bump_click(p_id uuid)
returns text language sql security definer set search_path = public as $$
  update listings set clicks = clicks + 1 where id = p_id and not hidden returning url;
$$;

-- Today's board: money paid since midnight India time.
create or replace view today_board with (security_invoker = true) as
select l.id, l.name, l.domain, l.tagline, l.category, l.city, l.clicks, l.created_at,
       sum(p.amount_paise)::bigint as today_paise
from payments p
join listings l on l.id = p.listing_id
where p.status = 'paid'
  and not l.hidden
  and p.paid_at >= date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata'
group by l.id;

-- Row-level security: the public can read listings and activity, nothing else.
-- All writes go through the server using the service-role key.
alter table listings enable row level security;
alter table payments enable row level security;
alter table activity enable row level security;

drop policy if exists "public read listings" on listings;
create policy "public read listings" on listings for select using (not hidden);
drop policy if exists "public read activity" on activity;
create policy "public read activity" on activity for select using (true);
-- payments: no policies → only the service role can read or write.

revoke execute on function apply_payment(text, text) from public, anon, authenticated;
revoke execute on function bump_click(uuid) from public, anon, authenticated;
revoke all on table payments from anon, authenticated;
revoke all on table today_board from anon, authenticated;
