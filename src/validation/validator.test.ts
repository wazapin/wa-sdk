/**
 * Unit tests for Validator
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { Validator } from './validator.js';
import { ValidationError } from '../types/errors.js';

describe('Validator', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().min(0),
    email: z.string().email().optional(),
  });

  describe('off mode', () => {
    it('should skip validation and return data as-is', () => {
      const validator = new Validator('off');
      const invalidData = { name: '', age: -5 };

      const result = validator.validate(testSchema, invalidData);

      expect(result).toEqual(invalidData);
    });

    it('should not throw error for invalid data', () => {
      const validator = new Validator('off');
      const invalidData = { invalid: 'data' };

      expect(() => validator.validate(testSchema, invalidData)).not.toThrow();
    });
  });

  describe('relaxed mode', () => {
    it('should validate data in relaxed mode', () => {
      const validator = new Validator('relaxed');
      const validData = { name: 'John', age: 30 };

      const result = validator.validate(testSchema, validData);

      expect(result).toEqual(validData);
    });

    it('should throw ValidationError for invalid data', () => {
      const validator = new Validator('relaxed');
      const invalidData = { name: '', age: 30 };

      expect(() => validator.validate(testSchema, invalidData)).toThrow(ValidationError);
    });

    it('should include zodError in ValidationError', () => {
      const validator = new Validator('relaxed');
      const invalidData = { name: '', age: 30 };

      try {
        validator.validate(testSchema, invalidData);
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.zodError).toBeDefined();
      }
    });
  });

  describe('strict mode', () => {
    it('should validate data in strict mode', () => {
      const validator = new Validator('strict');
      const validData = { name: 'John', age: 30, email: 'john@example.com' };

      const result = validator.validate(testSchema, validData);

      expect(result).toEqual(validData);
    });

    it('should throw ValidationError for invalid data', () => {
      const validator = new Validator('strict');
      const invalidData = { name: 'John', age: -5 };

      expect(() => validator.validate(testSchema, invalidData)).toThrow(ValidationError);
    });

    it('should include field name in ValidationError', () => {
      const validator = new Validator('strict');
      const invalidData = { name: '', age: 30 };

      try {
        validator.validate(testSchema, invalidData);
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.field).toBe('name');
      }
    });

    it('should include error message in ValidationError', () => {
      const validator = new Validator('strict');
      const invalidData = { name: '', age: 30 };

      try {
        validator.validate(testSchema, invalidData);
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.message).toContain('String must contain at least 1 character');
      }
    });
  });

  describe('mode management', () => {
    it('should get current validation mode', () => {
      const validator = new Validator('strict');
      expect(validator.getMode()).toBe('strict');
    });

    it('should set new validation mode', () => {
      const validator = new Validator('strict');
      validator.setMode('off');
      expect(validator.getMode()).toBe('off');
    });

    it('should apply new mode to validation', () => {
      const validator = new Validator('strict');
      const invalidData = { name: '', age: 30 };

      // Should throw in strict mode
      expect(() => validator.validate(testSchema, invalidData)).toThrow(ValidationError);

      // Change to off mode
      validator.setMode('off');

      // Should not throw in off mode
      expect(() => validator.validate(testSchema, invalidData)).not.toThrow();
    });
  });

  describe('complex schemas', () => {
    it('should validate union types', () => {
      const unionSchema = z.union([
        z.object({ type: z.literal('a'), value: z.string() }),
        z.object({ type: z.literal('b'), value: z.number() }),
      ]);

      const validator = new Validator('strict');

      const validData1 = { type: 'a', value: 'test' };
      expect(() => validator.validate(unionSchema, validData1)).not.toThrow();

      const validData2 = { type: 'b', value: 123 };
      expect(() => validator.validate(unionSchema, validData2)).not.toThrow();

      const invalidData = { type: 'a', value: 123 };
      expect(() => validator.validate(unionSchema, invalidData)).toThrow(ValidationError);
    });

    it('should validate array schemas', () => {
      const arraySchema = z.object({
        items: z.array(z.string()).min(1),
      });

      const validator = new Validator('strict');

      const validData = { items: ['a', 'b', 'c'] };
      expect(() => validator.validate(arraySchema, validData)).not.toThrow();

      const invalidData = { items: [] };
      expect(() => validator.validate(arraySchema, invalidData)).toThrow(ValidationError);
    });

    it('should validate optional fields', () => {
      const optionalSchema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      const validator = new Validator('strict');

      const dataWithOptional = { required: 'test', optional: 'value' };
      expect(() => validator.validate(optionalSchema, dataWithOptional)).not.toThrow();

      const dataWithoutOptional = { required: 'test' };
      expect(() => validator.validate(optionalSchema, dataWithoutOptional)).not.toThrow();
    });
  });
});
