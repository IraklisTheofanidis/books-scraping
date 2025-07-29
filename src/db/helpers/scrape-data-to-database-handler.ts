import { Category } from './../models/category';
import { PoolClient } from "pg";
import { ScrapeBook, ScrapeDatabase, ScrapeUrl } from "../models/scrape";
import { addScrapedBook, addScrapedCategory, } from "../queries/scrape-queries";
import { getCategoryIdByTitle } from '../queries/category-queries';

export const addAllScrapedDataToDatabase = async (dbClient: PoolClient, data: ScrapeDatabase) => {
    for (const [categoryKey, categoryData] of Object.entries(data)) {
        const { scrapedUrl, name, books } = categoryData;

        const addedCategory = await addScrapedCategory(dbClient, name, scrapedUrl);
        let categoryId: number;

        if (!addedCategory) {
            const categoryIdOnDatabase = await getCategoryIdByTitle(dbClient, name,);
            if (!categoryIdOnDatabase) throw new Error('Failed to add category');
            categoryId = categoryIdOnDatabase;
        } else {
            categoryId = addedCategory.id
        }

        for (const book of books) {
            await addScrapedBook(dbClient, book, categoryId);
        }
    }
}

export const addAllScrapedCategoriesToDatabase = async (dbClient: PoolClient, scrapedCategories: ScrapeUrl[]): Promise<Category[]> => {
    const addedCategories: Category[] = [];
    for (const category of scrapedCategories) {
        const addedCategory = await addScrapedCategory(dbClient, category.title, category.urlToScrape);
        if (!addedCategory) continue; // that means the category already exists
        addedCategories.push(addedCategory);
    }
    return addedCategories;
}

export const addAllScrapedCategoryBooksToDatabase = async (dbClient: PoolClient, categoryBooks: ScrapeBook[], categoryId: number) => {
    for (const book of categoryBooks) {
        await addScrapedBook(dbClient, book, categoryId);
    }
}