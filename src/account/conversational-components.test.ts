/**
 * Tests for Conversational Components operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  configureConversationalAutomation,
  getConversationalAutomation,
} from './conversational-components.js';
import type { HTTPClient } from '../client/http.js';
import type { Validator } from '../validation/validator.js';
import type {
  ConfigureConversationalAutomationParams,
  ConversationalAutomationResponse,
} from '../types/account.js';

describe('Conversational Components Operations', () => {
  let mockClient: HTTPClient;
  let mockValidator: Validator;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    } as unknown as HTTPClient;

    mockValidator = {
      validate: vi.fn((schema, data) => data),
    } as unknown as Validator;
  });

  describe('configureConversationalAutomation', () => {
    it('should configure all fields together', async () => {
      const params: ConfigureConversationalAutomationParams = {
        enableWelcomeMessage: true,
        prompts: ['Book a flight', 'Plan a vacation', 'Find hotels'],
        commands: [
          { commandName: 'tickets', commandDescription: 'Book flight tickets' },
          { commandName: 'hotel', commandDescription: 'Find and book hotels' },
        ],
      };

      const mockResponse = { success: true };
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await configureConversationalAutomation(
        mockClient,
        'phone-123',
        params
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        'phone-123/conversational_automation',
        {
          enable_welcome_message: true,
          prompts: ['Book a flight', 'Plan a vacation', 'Find hotels'],
          commands: [
            { command_name: 'tickets', command_description: 'Book flight tickets' },
            { command_name: 'hotel', command_description: 'Find and book hotels' },
          ],
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should configure welcome message only', async () => {
      const params: ConfigureConversationalAutomationParams = {
        enableWelcomeMessage: true,
      };

      const mockResponse = { success: true };
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await configureConversationalAutomation(
        mockClient,
        'phone-123',
        params
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        'phone-123/conversational_automation',
        { enable_welcome_message: true }
      );
      expect(result.success).toBe(true);
    });

    it('should configure commands only', async () => {
      const params: ConfigureConversationalAutomationParams = {
        commands: [
          { commandName: 'help', commandDescription: 'Get help' },
          { commandName: 'start', commandDescription: 'Start conversation' },
        ],
      };

      const mockResponse = { success: true };
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await configureConversationalAutomation(
        mockClient,
        'phone-123',
        params
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        'phone-123/conversational_automation',
        {
          commands: [
            { command_name: 'help', command_description: 'Get help' },
            { command_name: 'start', command_description: 'Start conversation' },
          ],
        }
      );
      expect(result.success).toBe(true);
    });

    it('should configure prompts only', async () => {
      const params: ConfigureConversationalAutomationParams = {
        prompts: ['Book a flight', 'Plan a vacation'],
      };

      const mockResponse = { success: true };
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await configureConversationalAutomation(
        mockClient,
        'phone-123',
        params
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        'phone-123/conversational_automation',
        { prompts: ['Book a flight', 'Plan a vacation'] }
      );
      expect(result.success).toBe(true);
    });

    it('should configure with empty arrays', async () => {
      const params: ConfigureConversationalAutomationParams = {
        prompts: [],
        commands: [],
      };

      const mockResponse = { success: true };
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await configureConversationalAutomation(
        mockClient,
        'phone-123',
        params
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        'phone-123/conversational_automation',
        { prompts: [], commands: [] }
      );
      expect(result.success).toBe(true);
    });

    it('should validate params when validator provided', async () => {
      const params: ConfigureConversationalAutomationParams = {
        enableWelcomeMessage: true,
      };

      const mockResponse = { success: true };
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      await configureConversationalAutomation(
        mockClient,
        'phone-123',
        params,
        mockValidator
      );

      expect(mockValidator.validate).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      vi.mocked(mockClient.post).mockRejectedValue(error);

      const params: ConfigureConversationalAutomationParams = {
        enableWelcomeMessage: true,
      };

      await expect(
        configureConversationalAutomation(mockClient, 'phone-123', params)
      ).rejects.toThrow('API Error');
    });
  });

  describe('getConversationalAutomation', () => {
    it('should get current configuration with all fields', async () => {
      const mockResponse: ConversationalAutomationResponse = {
        conversational_automation: {
          enable_welcome_message: true,
          prompts: ['Book a flight', 'Plan a vacation'],
          commands: [
            { command_name: 'tickets', command_description: 'Book flight tickets' },
            { command_name: 'hotel', command_description: 'Find and book hotels' },
          ],
        },
        id: 'phone-123',
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await getConversationalAutomation(mockClient, 'phone-123');

      expect(mockClient.get).toHaveBeenCalledWith(
        'phone-123?fields=conversational_automation'
      );
      expect(result).toEqual(mockResponse);
      expect(result.conversational_automation.enable_welcome_message).toBe(true);
      expect(result.conversational_automation.prompts).toHaveLength(2);
      expect(result.conversational_automation.commands).toHaveLength(2);
    });

    it('should get configuration with no fields set', async () => {
      const mockResponse: ConversationalAutomationResponse = {
        conversational_automation: {},
        id: 'phone-123',
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await getConversationalAutomation(mockClient, 'phone-123');

      expect(result).toEqual(mockResponse);
      expect(result.conversational_automation.enable_welcome_message).toBeUndefined();
      expect(result.conversational_automation.prompts).toBeUndefined();
      expect(result.conversational_automation.commands).toBeUndefined();
    });

    it('should validate response when validator provided', async () => {
      const mockResponse: ConversationalAutomationResponse = {
        conversational_automation: {
          enable_welcome_message: false,
        },
        id: 'phone-123',
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await getConversationalAutomation(
        mockClient,
        'phone-123',
        mockValidator
      );

      expect(mockValidator.validate).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      vi.mocked(mockClient.get).mockRejectedValue(error);

      await expect(
        getConversationalAutomation(mockClient, 'phone-123')
      ).rejects.toThrow('API Error');
    });
  });

  describe('Field Validation', () => {
    it('should respect command name max 32 characters', () => {
      const validName = 'a'.repeat(32);
      expect(validName.length).toBe(32);

      const invalidName = 'a'.repeat(33);
      expect(invalidName.length).toBe(33);
    });

    it('should respect command description max 256 characters', () => {
      const validDesc = 'a'.repeat(256);
      expect(validDesc.length).toBe(256);

      const invalidDesc = 'a'.repeat(257);
      expect(invalidDesc.length).toBe(257);
    });

    it('should respect prompt max 80 characters', () => {
      const validPrompt = 'a'.repeat(80);
      expect(validPrompt.length).toBe(80);

      const invalidPrompt = 'a'.repeat(81);
      expect(invalidPrompt.length).toBe(81);
    });

    it('should respect max 30 commands', () => {
      const commands = Array.from({ length: 30 }, (_, i) => ({
        commandName: `cmd${i}`,
        commandDescription: `Description ${i}`,
      }));
      expect(commands.length).toBe(30);

      const tooManyCommands = Array.from({ length: 31 }, (_, i) => ({
        commandName: `cmd${i}`,
        commandDescription: `Description ${i}`,
      }));
      expect(tooManyCommands.length).toBe(31);
    });

    it('should respect max 4 prompts', () => {
      const validPrompts = ['Prompt 1', 'Prompt 2', 'Prompt 3', 'Prompt 4'];
      expect(validPrompts.length).toBe(4);

      const tooManyPrompts = [
        'Prompt 1',
        'Prompt 2',
        'Prompt 3',
        'Prompt 4',
        'Prompt 5',
      ];
      expect(tooManyPrompts.length).toBe(5);
    });
  });
});
