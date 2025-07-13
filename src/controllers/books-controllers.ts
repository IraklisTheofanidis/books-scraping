import { ApiResponse } from "../db/models/ApiResponse";
import { Request, Response } from "express";

export async function getBooks(req: Request, res: Response): Promise<ApiResponse<string[]>> {
    return {
        statusCode: 200,
        response: ['book1', 'book2', 'book3']
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

export async function getBook(req: Request, res: Response): Promise<ApiResponse<string>> {
    return {
        statusCode: 200,
        response: 'Retrieved book: book1',
    }
}