import db from "../db/database";
import { sendErrorMailToAdmins } from "../db/helpers/mailer.handler";
import { ApiResponse } from "../db/models/ApiResponse";
import { Request, Response } from "express";
import { getBooksQuery, getBookByUuid } from "../db/queries/book-queries";
import { Book, BookFilterParams, BookQueryParams } from "../db/models/book";
import { validate as isValidUUID } from 'uuid';
import { getCategoryIdByUuid } from "../db/queries/category-queries";
import { validateBookQueryParams } from "../db/validations/book-validations";

export async function getBooks(req: Request, res: Response): Promise<ApiResponse<Book[]>> {
    const dbClient = await db.pool.connect();

    try {
        dbClient.query('BEGIN');

        const rawQueryParams: BookQueryParams = req.query as BookQueryParams;
        const filters: BookFilterParams = await validateBookQueryParams(rawQueryParams, dbClient);

        const books = await getBooksQuery(dbClient, filters);
        
        dbClient.query('COMMIT');

        return {
            statusCode: 200,
            response: books,
        }

    } catch (error: any) {
        dbClient.query('ROLLBACK');
        await sendErrorMailToAdmins(req, error);
        return {
            statusCode: 400,
            error: error.message,
        }
    } finally {
        dbClient.release();
    }
}

export async function createBook(req: Request, res: Response): Promise<ApiResponse<string>> {
    return {
        statusCode: 200,
        response: 'Created book: book1',
    }
}

export async function updateBook(req: Request, res: Response): Promise<ApiResponse<string>> {
    return {
        statusCode: 200,
        response: 'Updated book: book1',
    }
}

export async function deleteBook(req: Request, res: Response): Promise<ApiResponse<string>> {
    return {
        statusCode: 200,
        response: 'Deleted book: book1',
    }
}

export async function getBook(req: Request, res: Response): Promise<ApiResponse<Book>> {
    const uuid = req.params.uuid;

    if (!isValidUUID(uuid)) {
        throw new Error('Invalid UUID format'); // Or custom error class
    }

    const dbClient = await db.pool.connect();

    try {
        dbClient.query('BEGIN');
        const book = await getBookByUuid(dbClient, uuid);
        dbClient.query('COMMIT');

        return {
            statusCode: 200,
            response: book,
        }

    } catch (error: any) {
        dbClient.query('ROLLBACK');
        await sendErrorMailToAdmins(req, error);
        return {
            statusCode: 400,
            error: error.message,
        }
    } finally {
        dbClient.release();
    }
}
