drop policy if exists "Public can read published products" on products;
create policy "Visitors can read published products"
on products
for select
to anon, authenticated
using (published = true);

drop policy if exists "Public can read published articles" on articles;
create policy "Visitors can read published articles"
on articles
for select
to anon, authenticated
using (published = true);

drop policy if exists "Public can read published article product relations" on article_products;
create policy "Visitors can read published article product relations"
on article_products
for select
to anon, authenticated
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

drop policy if exists "Public can insert affiliate clicks" on affiliate_clicks;
create policy "Visitors can insert affiliate clicks"
on affiliate_clicks
for insert
to anon, authenticated
with check (true);
