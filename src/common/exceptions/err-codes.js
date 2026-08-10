"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
exports.ErrorCode = {
    //Authentication
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    //User
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
    //ConflictError
    CONFLICT_ERROR: 'CONFLICT_ERROR',
    //Bad Request Exception
    BAD_REQUEST_EXCEPTION: 'BAD_REQUEST_EXCEPTION',
};
