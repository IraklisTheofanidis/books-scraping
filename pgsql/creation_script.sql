BEGIN WORK;

DROP TABLE IF EXISTS Categories;

DROP TABLE IF EXISTS Quote_Parts;

CREATE TABLE Categories (
  id SERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  scraped_url TEXT NOT NULL
);

CREATE TABLE Books (
  id SERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price NUMERIC,
  in_stock INTEGER NOT NULL,
  rating NUMERIC,
  description TEXT,
  img_src TEXT,
  scraped_url TEXT,
  category_id INTEGER REFERENCES Categories(id) ON DELETE CASCADE --   If a category is deleted, automatically delete all related books.
);

COMMIT;