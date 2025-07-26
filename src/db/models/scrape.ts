export interface ScrapeUrl {
    title: string;
    urlToScrape: string;
}

export interface ScrapeBook {
    title: string;
    price: number | null;
    inStock: number;
    rating: number | null;
    description: string;
    imgSrc: string;
    scrapedUrl: string;
}

export interface ScrapeDatabase {
    [category: string]: {
        scrapedUrl: string;
        name: string;
        books: ScrapeBook[];
    }
}