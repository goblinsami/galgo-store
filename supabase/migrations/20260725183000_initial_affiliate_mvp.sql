create extension if not exists pgcrypto;

create type product_category as enum (
  'arneses',
  'collares',
  'abrigos',
  'camas',
  'alimentacion',
  'viajes',
  'higiene',
  'otros'
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  short_description text not null,
  description text not null,
  category product_category not null,
  affiliate_url text not null,
  image_url text,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  recommended_for text,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_not_blank check (length(btrim(name)) > 0),
  constraint products_slug_not_blank check (length(btrim(slug)) > 0),
  constraint products_affiliate_url_https check (affiliate_url like 'https://%'),
  constraint products_sort_order_not_negative check (sort_order >= 0)
);

create table articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text not null,
  content text not null,
  cover_image_url text,
  meta_title text,
  meta_description text,
  published boolean not null default false,
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_title_not_blank check (length(btrim(title)) > 0),
  constraint articles_slug_not_blank check (length(btrim(slug)) > 0)
);

create table article_products (
  article_id uuid references articles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (article_id, product_id),
  constraint article_products_sort_order_not_negative check (sort_order >= 0)
);

create table affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  source_page text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  referrer text,
  created_at timestamptz not null default now()
);

create trigger products_set_updated_at
before update on products
for each row
execute function set_updated_at();

create trigger articles_set_updated_at
before update on articles
for each row
execute function set_updated_at();

create index products_slug_idx on products(slug);
create index products_published_idx on products(published);
create index products_featured_idx on products(featured);
create index products_category_idx on products(category);
create index products_created_at_idx on products(created_at);

create index articles_slug_idx on articles(slug);
create index articles_published_idx on articles(published);
create index articles_featured_idx on articles(featured);
create index articles_created_at_idx on articles(created_at);

create index article_products_article_id_idx on article_products(article_id);
create index article_products_product_id_idx on article_products(product_id);
create index affiliate_clicks_created_at_idx on affiliate_clicks(created_at);
create index affiliate_clicks_product_id_idx on affiliate_clicks(product_id);

alter table products enable row level security;
alter table articles enable row level security;
alter table article_products enable row level security;
alter table affiliate_clicks enable row level security;

create policy "Public can read published products"
on products
for select
to anon
using (published = true);

create policy "Public can read published articles"
on articles
for select
to anon
using (published = true);

create policy "Public can read published article product relations"
on article_products
for select
to anon
using (
  exists (
    select 1 from articles
    where articles.id = article_products.article_id
      and articles.published = true
  )
  and exists (
    select 1 from products
    where products.id = article_products.product_id
      and products.published = true
  )
);

create policy "Public can insert affiliate clicks"
on affiliate_clicks
for insert
to anon
with check (true);
