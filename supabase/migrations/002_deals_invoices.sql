-- 002: deals on listings, billing details + GST invoice numbers on payments, ad-fund stat.
-- Already applied to the live project. For a fresh project, run schema.sql first, then this.

alter table listings add column if not exists deal text not null default '' check (char_length(deal) <= 28);
alter table listings add column if not exists code text not null default '' check (char_length(code) <= 16);

alter table payments add column if not exists deal text not null default '';
alter table payments add column if not exists code text not null default '';
alter table payments add column if not exists bill_name text;
alter table payments add column if not exists bill_state text;          -- place of supply (Indian state)
alter table payments add column if not exists bill_gstin text;          -- optional, for B2B input credit
alter table payments add column if not exists invoice_no text unique;   -- e.g. TK/2627/000001
alter table payments add column if not exists invoice_date date;

-- One running counter per financial year (Apr–Mar), so invoice numbers are sequential and never reused.
create table if not exists invoice_counters (
  fy   text primary key,   -- '2627' = FY 2026-27
  last integer not null default 0
);
alter table invoice_counters enable row level security;
revoke all on table invoice_counters from anon, authenticated;

-- Simple key/value numbers shown on the site (e.g. money spent promoting the board this month).
create table if not exists site_stats (
  key   text primary key,
  value bigint not null default 0,
  updated_at timestamptz not null default now()
);
insert into site_stats (key, value) values ('ad_fund_spent_paise', 0) on conflict do nothing;
alter table site_stats enable row level security;
drop policy if exists "public read stats" on site_stats;
create policy "public read stats" on site_stats for select using (true);

drop function if exists apply_payment(text, text);
create function apply_payment(p_order_id text, p_payment_id text)
returns table (listing_id uuid, rank bigint, total_paise bigint, already_applied boolean, payment_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  p payments%rowtype;
  l listings%rowtype;
  is_new boolean;
  r bigint;
  d date := (now() at time zone 'Asia/Kolkata')::date;
  fy_start int;
  v_fy text;
  n int;
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
    return query select l.id, r, l.total_paise, true, p.id;
    return;
  end if;

  select * into l from listings where domain = p.domain for update;
  is_new := not found;

  if is_new then
    insert into listings (domain, url, name, tagline, category, city, total_paise, deal, code)
    values (p.domain, p.url, p.name, p.tagline, p.category, p.city, p.amount_paise, p.deal, p.code)
    returning * into l;
  else
    update listings set total_paise = listings.total_paise + p.amount_paise, updated_at = now()
    where id = l.id returning * into l;
  end if;

  -- Next invoice number for this financial year.
  fy_start := case when extract(month from d) >= 4 then extract(year from d)::int else extract(year from d)::int - 1 end;
  v_fy := lpad((fy_start % 100)::text, 2, '0') || lpad(((fy_start + 1) % 100)::text, 2, '0');
  insert into invoice_counters (fy, last) values (v_fy, 1)
    on conflict (fy) do update set last = invoice_counters.last + 1
    returning last into n;

  update payments set status = 'paid', razorpay_payment_id = p_payment_id,
    paid_at = now(), listing_id = l.id,
    invoice_no = 'TK/' || v_fy || '/' || lpad(n::text, 6, '0'), invoice_date = d
  where id = p.id;

  select count(*) + 1 into r from listings x
    where not x.hidden and (x.total_paise > l.total_paise
      or (x.total_paise = l.total_paise and x.created_at < l.created_at));

  insert into activity (listing_id, text) values (
    l.id,
    case when is_new
      then l.name || ' joined with ₹' || (p.amount_paise / 100) || ' → #' || r
      else l.name || ' added ₹' || (p.amount_paise / 100) || ' → #' || r
    end);

  return query select l.id, r, l.total_paise, false, p.id;
end;
$$;
revoke execute on function apply_payment(text, text) from public, anon, authenticated;

create or replace view today_board with (security_invoker = true) as
select l.id, l.name, l.domain, l.tagline, l.category, l.city, l.clicks, l.created_at,
       sum(p.amount_paise)::bigint as today_paise, l.deal, l.code
from payments p
join listings l on l.id = p.listing_id
where p.status = 'paid'
  and not l.hidden
  and p.paid_at >= date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata'
group by l.id;
revoke all on table today_board from anon, authenticated;
