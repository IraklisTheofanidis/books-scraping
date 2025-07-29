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

export interface BookQueryParams {
    categoryUUid?: string;
    minPrice?: string;
    maxPrice?: string;
    price?: string;
    minStock?: string;
    maxStock?: string;
    stock?: string;
}

export interface BookFilterParams {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    price?: number;
    minStock?: number;
    maxStock?: number;
    stock?: number;
}
