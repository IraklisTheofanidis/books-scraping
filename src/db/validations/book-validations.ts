import { validate as isValidUUID } from 'uuid';
import { BookFilterParams, BookQueryParams } from '../models/book';
import { getCategoryIdByUuid } from '../queries/category-queries';
import { PoolClient } from "pg";

export const validateBookQueryParams = async (params: BookQueryParams, dbClient: PoolClient): Promise<BookFilterParams> => {
    const bookFilteredParams: BookFilterParams = {};
    const { categoryUUid } = params;

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
    return bookFilteredParams;
};