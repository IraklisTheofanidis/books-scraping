import { validate as isValidUUID } from 'uuid';
import { BookFilterParams, BookQueryParams } from '../models/book';
import { getCategoryIdByUuid } from '../queries/category-queries';
import { PoolClient } from "pg";

export const validateBookQueryParams = async (params: BookQueryParams, dbClient: PoolClient): Promise<BookFilterParams> => {
    const bookFilteredParams: BookFilterParams = {};
    const { categoryUUid, minPrice, maxPrice, price, minStock, maxStock, stock } = params;

    if (categoryUUid) {
        if (typeof categoryUUid !== 'string') {
            throw new Error('Category uuid must be a string');
        }

        if (!isValidUUID(categoryUUid)) {
            throw new Error('Invalid UUID format'); // Or custom error class
        }

        const categoryId = await getCategoryIdByUuid(dbClient, categoryUUid);

        if (!categoryId) {
            throw new Error('Category not found');
        }

        bookFilteredParams.categoryId = categoryId;
    }

    if (minPrice) bookFilteredParams.minPrice = parseFloat(minPrice);
    if (maxPrice) bookFilteredParams.maxPrice = parseFloat(maxPrice);
    if (price) bookFilteredParams.price = parseFloat(price);
    if (minStock) bookFilteredParams.minStock = Number(minStock);
    if (maxStock) bookFilteredParams.maxStock = Number(maxStock);
    if (stock) bookFilteredParams.stock = Number(stock);
    return bookFilteredParams;
};