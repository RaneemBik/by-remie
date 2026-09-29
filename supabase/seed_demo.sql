-- OPTIONAL: demo catalog so the storefront isn't empty. Skip this on a real store.
-- Run after schema.sql. Safe to run once (skips names that already exist).

insert into public.categories (name, tagline, accent) values
  ('Skincare',  'Serums, creams & toners',            'blush'),
  ('Makeup',    'Tints, bases & finishing touches',   'gold'),
  ('Lip Care',  'Conditioners, oils & tinted balms',  'sage'),
  ('Fragrance', 'Mists & layered scents',             'blush')
on conflict do nothing;

insert into public.products (category_id, name, description, price, stock, quantity)
select c.id, v.name, v.description, v.price, v.stock, v.quantity
from (values
  ('Skincare',  'Effortless Glow Serum',   'A lightweight vitamin C serum that brightens and evens tone over time.', 38.00, 'in',  42),
  ('Skincare',  'Velvet Hydration Cream',  'A rich, whipped moisturizer with ceramides and squalane.',               44.00, 'low',  4),
  ('Skincare',  'Crystal Dew Toner',       'An alcohol-free toning mist with hyaluronic acid and rose water.',       26.00, 'in',  30),
  ('Makeup',    'Bloom Blush Tint',        'A buildable cream tint for a natural, second-skin flush.',               24.00, 'in',  18),
  ('Makeup',    'Golden Hour Highlighter', 'A fine-milled powder highlighter with a warm golden cast.',              29.00, 'out',  0),
  ('Lip Care',  'Luxe Lip Conditioner',    'A balm-serum hybrid with shea butter and peptides.',                     18.00, 'low',  3),
  ('Lip Care',  'Rosewood Tinted Lip Oil', 'A glassy, non-sticky oil with a sheer wash of rosewood color.',          21.00, 'in',  25),
  ('Fragrance', 'Bloom & Amber Mist',      'A soft floral-amber body mist — light enough to layer.',                 32.00, 'in',  15)
) as v(category, name, description, price, stock, quantity)
join public.categories c on lower(c.name) = lower(v.category)
on conflict do nothing;
