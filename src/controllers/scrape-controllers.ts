import { ApiResponse } from "../db/models/ApiResponse";
import { Request, Response } from "express";

export async function scrapeBooks(req: Request, res: Response): Promise<ApiResponse<string[]>> {
    return {
        statusCode: 200,
        response: ['book1', 'book2', 'book3']
    }
}

export async function scrapeBook(req: Request, res: Response): Promise<ApiResponse<string>> {
    return {
        statusCode: 200,
        response: 'Scraped book1',
    }
}

export async function scrapeBookCategory(req: Request, res: Response): Promise<ApiResponse<string>> {
    return {
        statusCode: 200,
        response: 'Scraped category 1',
    }
}

export async function scrapeBookCategories(req: Request, res: Response): Promise<ApiResponse<string>> {
    return {
        statusCode: 200,
        response: ['Scraped category 1', 'Scraped category 2', 'Scraped category 3'],
    }
}