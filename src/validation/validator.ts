/**
 * Validation system with configurable modes
 */

import type { z } from 'zod';
import type { ValidationMode } from '../types/config.js';
import { ValidationError } from '../types/errors.js';

/**
 * Validator class that supports different validation modes
 */
export class Validator {
  constructor(private mode: ValidationMode) {}

  /**
   * Validate data against a Zod schema based on the configured mode
   *
   * @param schema - Zod schema to validate against
   * @param data - Data to validate
   * @returns Validated data
   * @throws ValidationError if validation fails
   */
  validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    // Off mode: skip validation entirely
    if (this.mode === 'off') {
      return data as T;
    }

    // Relaxed mode: partial validation (less strict)
    // In relaxed mode, we still validate but allow some flexibility
    if (this.mode === 'relaxed') {
      const result = schema.safeParse(data);

      if (!result.success) {
        // In relaxed mode, only throw if there are critical errors
        // For now, we'll still validate fully but could be customized
        throw new ValidationError(
          'Validation failed in relaxed mode',
          undefined,
          result.error
        );
      }

      return result.data;
    }

    // Strict mode: full validation
    const result = schema.safeParse(data);

    if (!result.success) {
      // Extract first error for clearer messaging
      const firstError = result.error.errors[0];
      const field = firstError?.path.join('.') || undefined;

      throw new ValidationError(
        firstError?.message || 'Validation failed in strict mode',
        field,
        result.error
      );
    }

    return result.data;
  }

  /**
   * Get the current validation mode
   */
  getMode(): ValidationMode {
    return this.mode;
  }

  /**
   * Set a new validation mode
   */
  setMode(mode: ValidationMode): void {
    this.mode = mode;
  }
}
