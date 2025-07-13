import { ApiResponse } from "../models/ApiResponse";
import { Request, Response } from "express";

export async function requestHandler<T>(
    req: Request,
    res: Response,
    fn: (req: Request, res: Response) => Promise<ApiResponse<T>>
) {
    try {
        const queryResult = await fn(req, res);
        res.status(queryResult.statusCode).send(queryResult.response ?? queryResult.error);
    } catch (error: any) {
        const message = error?.message ?? 'Failed to process request';
        res.status(400).send(message);
    }
}