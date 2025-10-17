import { ZodSchema } from 'zod';

/**
 * Generic type-safe action result
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Creates a type-safe server action with consistent error handling
 * @param schema - Zod schema for validating input
 * @param handler - Async function that processes the validated input
 * @returns A type-safe action function
 */
export function createAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  handler: (input: TInput) => Promise<TOutput>
) {
  return async (input: unknown): Promise<ActionResult<TOutput>> => {
    try {
      // Validate input
      const validatedInput = schema.parse(input);

      // Execute handler
      const result = await handler(validatedInput);

      return { success: true, data: result };
    } catch (error) {
      console.error('Action error:', error);

      if (error instanceof Error) {
        return { success: false, error: error.message };
      }

      return { success: false, error: 'An unknown error occurred' };
    }
  };
}

/**
 * Creates a type-safe server action that requires authentication
 * @param schema - Zod schema for validating input
 * @param handler - Async function that processes the validated input with user ID
 * @returns A type-safe action function
 */
export function createAuthenticatedAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  handler: (input: TInput, userId: string) => Promise<TOutput>
) {
  return async (input: unknown): Promise<ActionResult<TOutput>> => {
    try {
      // Import here to avoid circular dependencies
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, error: 'Unauthorized. Please sign in.' };
      }

      // Validate input
      const validatedInput = schema.parse(input);

      // Execute handler with user ID
      const result = await handler(validatedInput, user.id);

      return { success: true, data: result };
    } catch (error) {
      console.error('Authenticated action error:', error);

      if (error instanceof Error) {
        return { success: false, error: error.message };
      }

      return { success: false, error: 'An unknown error occurred' };
    }
  };
}
