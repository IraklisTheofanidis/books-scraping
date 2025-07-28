export interface Book {
    id: number;
    uuid: string;
    title: string;
    price: number | null;
    inStock: number;
    rating: number | null;
    description: string;
    imgSrc: string;
    scrapedUrl?: string;
}
