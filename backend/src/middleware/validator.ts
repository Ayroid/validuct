import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware factory for validating request bodies against Zod schemas
 *
 * @param schema - Zod schema object to validate against
 * @returns Express middleware function that validates the request body
 *
 * @remarks
 * Validates the request body asynchronously using the provided Zod schema
 * If validation fails, passes ZodError to the error handler middleware
 * If validation succeeds, continues to the next middleware
 *
 * @example
 * ```typescript
 * router.post('/users', validate(createUserSchema), createUser);
 * ```
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
      } else {
        next(error);
      }
    }
  };
};
