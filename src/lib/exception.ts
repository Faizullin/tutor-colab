export class ApiError extends Error {
    constructor(public key: string, message: string, public statusCode: number, public details?: any) {
        super(message);
        this.key = key;
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.details = details;
    }
}