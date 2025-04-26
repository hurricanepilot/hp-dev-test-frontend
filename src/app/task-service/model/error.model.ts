export class Error {
    // The HTTP status code for the error
    status: number;
    // The error detail message
    reason: string;

    constructor(status: number, reason: string) {
        this.status = status;
        this.reason = reason;
    }
}