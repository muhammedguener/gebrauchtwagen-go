import { GraphQLError } from 'graphql';
import type { ZodError } from 'zod';

export const toBadUserInput = (message: string): GraphQLError =>
    new GraphQLError(message, {
        extensions: { code: 'BAD_USER_INPUT' },
    });

export const toUnauthorized = (message: string): GraphQLError =>
    new GraphQLError(message, {
        extensions: { code: 'UNAUTHENTICATED' },
    });

export const toForbidden = (message: string): GraphQLError =>
    new GraphQLError(message, {
        extensions: { code: 'FORBIDDEN' },
    });

export const toInternalError = (message: string): GraphQLError =>
    new GraphQLError(message, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });

export const toValidationError = (error: ZodError): GraphQLError =>
    toBadUserInput(JSON.stringify(error.issues));
