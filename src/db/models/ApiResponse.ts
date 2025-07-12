export type ApiResponse<T> = Promise<{
    statusCode: number;
    response?: Array<T> | T | null;
    error?: string;
}>;