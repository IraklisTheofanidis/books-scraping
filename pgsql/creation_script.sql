BEGIN WORK;

DROP TABLE IF EXISTS Books;
DROP TABLE IF EXISTS Categories;

CREATE TABLE Categories (
  id SERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL UNIQUE,
  scraped_url TEXT
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
  category_id INTEGER REFERENCES Categories(id) ON DELETE CASCADE
);

-- Add composite unique constraint on (title, category_id)
ALTER TABLE Books
ADD CONSTRAINT unique_book_title_per_category UNIQUE (title, category_id);

COMMIT;
