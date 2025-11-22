/**
 * Conversational Components operations
 */

import type { HTTPClient } from '../client/http.js';
import type { Validator } from '../validation/validator.js';
import type {
  ConfigureConversationalAutomationParams,
  ConversationalAutomationResponse,
} from '../types/account.js';
import {
  configureConversationalAutomationParamsSchema,
  conversationalAutomationResponseSchema,
} from '../validation/schemas/account.js';

/**
 * Configure conversational components for a business phone number
 *
 * Conversational components make it easier for WhatsApp users to interact with your business:
 * - **Welcome Messages**: Get notified when users open chat for first time
 * - **Ice Breakers (Prompts)**: Tappable text strings users can select
 * - **Commands**: Slash commands users can trigger by typing "/"
 *
 * **Limits**:
 * - Prompts: Maximum 4, each max 80 characters
 * - Commands: Maximum 30, name max 32 chars, description max 256 chars
 *
 * @param client - HTTP client instance for API communication
 * @param phoneNumberId - WhatsApp Business phone number ID
 * @param config - Conversational automation configuration
 * @param validator - Optional validator for runtime validation
 *
 * @returns Success status
 *
 * @throws {APIError} When API request fails
 * @throws {NetworkError} When network request fails
 * @throws {ValidationError} When config validation fails
 *
 * @example
 * ```typescript
 * // Enable welcome messages
 * await configureConversationalAutomation(client, 'phone-id', {
 *   enableWelcomeMessage: true
 * });
 *
 * // Configure ice breakers
 * await configureConversationalAutomation(client, 'phone-id', {
 *   prompts: [
 *     'Book a flight',
 *     'Plan a vacation',
 *     'Find hotels'
 *   ]
 * });
 *
 * // Configure commands
 * await configureConversationalAutomation(client, 'phone-id', {
 *   commands: [
 *     {
 *       commandName: 'tickets',
 *       commandDescription: 'Book flight tickets'
 *     },
 *     {
 *       commandName: 'hotel',
 *       commandDescription: 'Find and book hotels'
 *     }
 *   ]
 * });
 *
 * // Configure all features
 * await configureConversationalAutomation(client, 'phone-id', {
 *   enableWelcomeMessage: true,
 *   prompts: ['Book a flight', 'Plan a vacation'],
 *   commands: [
 *     { commandName: 'help', commandDescription: 'Get help' }
 *   ]
 * });
 * ```
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers/conversational-components
 */
export async function configureConversationalAutomation(
  client: HTTPClient,
  phoneNumberId: string,
  config: ConfigureConversationalAutomationParams,
  validator?: Validator
): Promise<{ success: boolean }> {
  if (validator) {
    validator.validate(configureConversationalAutomationParamsSchema, config);
  }

  // Build request payload with snake_case for API
  const payload: Record<string, unknown> = {};

  if (config.enableWelcomeMessage !== undefined) {
    payload.enable_welcome_message = config.enableWelcomeMessage;
  }

  if (config.prompts !== undefined) {
    payload.prompts = config.prompts;
  }

  if (config.commands !== undefined) {
    payload.commands = config.commands.map((cmd) => ({
      command_name: cmd.commandName,
      command_description: cmd.commandDescription,
    }));
  }

  const response = await client.post<{ success: boolean }>(
    `${phoneNumberId}/conversational_automation`,
    payload
  );

  return response;
}

/**
 * Get current conversational automation configuration
 *
 * Retrieves the current configuration of conversational components for a business phone number.
 * This includes welcome message settings, ice breakers (prompts), and slash commands.
 *
 * @param client - HTTP client instance for API communication
 * @param phoneNumberId - WhatsApp Business phone number ID
 * @param validator - Optional validator for runtime validation
 *
 * @returns Current conversational automation configuration
 *
 * @throws {APIError} When API request fails
 * @throws {NetworkError} When network request fails
 *
 * @example
 * ```typescript
 * const config = await getConversationalAutomation(
 *   client,
 *   'phone-number-id'
 * );
 *
 * console.log('Welcome enabled:', config.conversational_automation.enable_welcome_message);
 * console.log('Prompts:', config.conversational_automation.prompts);
 * console.log('Commands:', config.conversational_automation.commands);
 *
 * // Check if specific feature is enabled
 * if (config.conversational_automation.enable_welcome_message) {
 *   console.log('Welcome messages are enabled');
 * }
 *
 * // List all configured prompts
 * config.conversational_automation.prompts?.forEach((prompt, index) => {
 *   console.log(`Prompt ${index + 1}: ${prompt}`);
 * });
 *
 * // List all configured commands
 * config.conversational_automation.commands?.forEach((cmd) => {
 *   console.log(`/${cmd.command_name}: ${cmd.command_description}`);
 * });
 * ```
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers/conversational-components
 */
export async function getConversationalAutomation(
  client: HTTPClient,
  phoneNumberId: string,
  validator?: Validator
): Promise<ConversationalAutomationResponse> {
  const response = await client.get<ConversationalAutomationResponse>(
    `${phoneNumberId}?fields=conversational_automation`
  );

  if (validator) {
    return validator.validate(conversationalAutomationResponseSchema, response);
  }

  return response;
}
