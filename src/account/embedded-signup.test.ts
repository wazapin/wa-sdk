/**
 * Unit tests for Embedded Signup API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmbeddedSignupAPI } from './embedded-signup.js';
import type { HTTPClient } from '../client/http.js';

/**
 * Create a mock HTTP client
 */
function createMockHTTPClient<T>(mockResponse: T): HTTPClient {
  return {
    get: vi.fn().mockResolvedValue(mockResponse),
    post: vi.fn().mockResolvedValue(mockResponse),
    delete: vi.fn().mockResolvedValue(mockResponse),
    request: vi.fn().mockResolvedValue(mockResponse),
  } as unknown as HTTPClient;
}

describe('EmbeddedSignupAPI', () => {
  describe('WABA Management', () => {
    it('should debug OAuth token', async () => {
      const mockResponse = {
        data: {
          app_id: '123456789',
          type: 'USER' as const,
          application: 'Test App',
          data_access_expires_at: 1735689600,
          expires_at: 1735689600,
          is_valid: true,
          scopes: ['whatsapp_business_management', 'public_profile'],
          granular_scopes: [
            {
              scope: 'whatsapp_business_management',
              target_ids: ['111111111111111', '222222222222222'],
            },
          ],
          user_id: '999999999999999',
        },
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.debugToken('test_oauth_token');

      expect(mockClient.get).toHaveBeenCalledWith('debug_token?input_token=test_oauth_token');
      expect(result.data.granular_scopes[0].target_ids).toEqual([
        '111111111111111',
        '222222222222222',
      ]);
      expect(result.data.is_valid).toBe(true);
    });

    it('should list shared WABAs', async () => {
      const mockResponse = {
        data: [
          {
            id: '111111111111111',
            name: 'Test WABA 1',
            currency: 'USD',
            timezone_id: '1',
            message_template_namespace: 'abc123_def456',
          },
          {
            id: '222222222222222',
            name: 'Test WABA 2',
            currency: 'EUR',
            timezone_id: '5',
            message_template_namespace: 'xyz789_uvw012',
          },
        ],
        paging: {
          cursors: {
            before: 'cursor_before',
            after: 'cursor_after',
          },
        },
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.listSharedWABAs('123456789');

      expect(mockClient.get).toHaveBeenCalledWith('123456789/client_whatsapp_business_accounts');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Test WABA 1');
    });

    it('should list owned WABAs with filters', async () => {
      const mockResponse = {
        data: [
          {
            id: '111111111111111',
            name: 'Owned WABA',
            currency: 'USD',
            timezone_id: '1',
            message_template_namespace: 'owned123',
          },
        ],
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.listOwnedWABAs('123456789', {
        filtering: [
          {
            field: 'creation_time',
            operator: 'GREATER_THAN',
            value: '1604962813',
          },
        ],
        sort: 'creation_time_descending',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('123456789/owned_whatsapp_business_accounts?filtering=')
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('sort=creation_time_descending')
      );
      expect(result.data[0].name).toBe('Owned WABA');
    });

    it('should get WABA info with fields', async () => {
      const mockResponse = {
        id: '111111111111111',
        name: 'Test WABA',
        currency: 'USD',
        timezone_id: '1',
        account_review_status: 'APPROVED' as const,
        primary_funding_id: '444444444444444',
        owner_business_info: {
          name: 'Test Business',
          id: '555555555555555',
        },
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.getWABAInfo('111111111111111', [
        'id',
        'name',
        'account_review_status',
      ]);

      expect(mockClient.get).toHaveBeenCalledWith(
        '111111111111111?fields=id,name,account_review_status'
      );
      expect(result.account_review_status).toBe('APPROVED');
    });
  });

  describe('System Users & Permissions', () => {
    it('should get assigned users', async () => {
      const mockResponse = {
        data: [
          {
            id: '333333333333333',
            name: 'System User 1',
            tasks: ['MANAGE', 'DEVELOP'],
          },
        ],
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.getAssignedUsers('111111111111111', '123456789');

      expect(mockClient.get).toHaveBeenCalledWith(
        '111111111111111/assigned_users?business=123456789'
      );
      expect(result.data[0].tasks).toContain('MANAGE');
    });

    it('should add system user with permissions', async () => {
      const mockResponse = { success: true };
      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.addSystemUser('111111111111111', {
        user: '333333333333333',
        tasks: ['MANAGE'],
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('111111111111111/assigned_users')
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('user=333333333333333')
      );
      expect(result.success).toBe(true);
    });

    it('should list system users', async () => {
      const mockResponse = {
        data: [
          {
            id: '333333333333333',
            name: 'System User 1',
            role: 'ADMIN',
          },
        ],
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.listSystemUsers('123456789');

      expect(mockClient.get).toHaveBeenCalledWith('123456789/system_users');
      expect(result.data[0].role).toBe('ADMIN');
    });
  });

  describe('Credit Line Management', () => {
    it('should get extended credits', async () => {
      const mockResponse = {
        data: [
          {
            id: '444444444444444',
            legal_entity_name: 'Test Company LLC',
          },
        ],
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.getExtendedCredits('123456789');

      expect(mockClient.get).toHaveBeenCalledWith(
        '123456789/extendedcredits?fields=id,legal_entity_name'
      );
      expect(result.data[0].legal_entity_name).toBe('Test Company LLC');
    });

    it('should attach credit line to WABA', async () => {
      const mockResponse = {
        allocation_config_id: '555555555555555',
        waba_id: '111111111111111',
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.attachCreditLine('444444444444444', {
        waba_id: '111111111111111',
        waba_currency: 'USD',
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '444444444444444/whatsapp_credit_sharing_and_attach',
        {
          waba_id: '111111111111111',
          waba_currency: 'USD',
        }
      );
      expect(result.allocation_config_id).toBe('555555555555555');
    });

    it('should verify credit sharing', async () => {
      const mockResponse = {
        id: '555555555555555',
        receiving_credential: {
          id: '111111111111111',
        },
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.verifyCreditSharing('555555555555555');

      expect(mockClient.get).toHaveBeenCalledWith(
        '555555555555555?fields=receiving_credential{id}'
      );
      expect(result.receiving_credential?.id).toBe('111111111111111');
    });

    it('should get credit sharing record', async () => {
      const mockResponse = {
        id: '555555555555555',
        receiving_business: {
          name: 'Client Business',
          id: '666666666666666',
        },
        request_status: 'ACTIVE' as const,
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.getCreditSharingRecord('555555555555555');

      expect(mockClient.get).toHaveBeenCalledWith(
        '555555555555555?fields=receiving_business,request_status'
      );
      expect(result.request_status).toBe('ACTIVE');
    });

    it('should revoke credit sharing', async () => {
      const mockResponse = { success: true };
      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.revokeCreditSharing('555555555555555');

      expect(mockClient.delete).toHaveBeenCalledWith('555555555555555');
      expect(result.success).toBe(true);
    });
  });

  describe('WABA Subscriptions (Webhooks)', () => {
    it('should subscribe to WABA', async () => {
      const mockResponse = { success: true };
      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.subscribeToWABA('111111111111111');

      expect(mockClient.post).toHaveBeenCalledWith('111111111111111/subscribed_apps');
      expect(result.success).toBe(true);
    });

    it('should list subscriptions', async () => {
      const mockResponse = {
        data: [
          {
            whatsapp_business_api_data: {
              id: '777777777777777',
              link: 'https://www.facebook.com/apps/777777777777777',
              name: 'Test App',
            },
          },
        ],
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.listSubscriptions('111111111111111');

      expect(mockClient.get).toHaveBeenCalledWith('111111111111111/subscribed_apps');
      expect(result.data[0].whatsapp_business_api_data.name).toBe('Test App');
    });

    it('should unsubscribe from WABA', async () => {
      const mockResponse = { success: true };
      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.unsubscribeFromWABA('111111111111111');

      expect(mockClient.delete).toHaveBeenCalledWith('111111111111111/subscribed_apps');
      expect(result.success).toBe(true);
    });

    it('should override callback URL', async () => {
      const mockResponse = { success: true };
      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.overrideCallbackURL('111111111111111', {
        override_callback_uri: 'https://alternate.example.com/webhook',
        verify_token: 'my_verify_token',
      });

      expect(mockClient.post).toHaveBeenCalledWith('111111111111111/subscribed_apps', {
        override_callback_uri: 'https://alternate.example.com/webhook',
        verify_token: 'my_verify_token',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Phone Numbers & Templates', () => {
    it('should list phone numbers', async () => {
      const mockResponse = {
        data: [
          {
            id: '888888888888888',
            verified_name: 'Test Business',
            display_phone_number: '+1234567890',
            quality_rating: 'GREEN' as const,
          },
        ],
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.listPhoneNumbers('111111111111111');

      expect(mockClient.get).toHaveBeenCalledWith('111111111111111/phone_numbers');
      expect(result.data[0].display_phone_number).toBe('+1234567890');
    });

    it('should list phone numbers with filters', async () => {
      const mockResponse = {
        data: [
          {
            id: '888888888888888',
            verified_name: 'Test Business',
            display_phone_number: '+1234567890',
            quality_rating: 'GREEN' as const,
          },
        ],
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.listPhoneNumbers('111111111111111', {
        fields: ['id', 'display_phone_number'],
        filtering: [
          {
            field: 'account_mode',
            operator: 'EQUAL',
            value: 'LIVE',
          },
        ],
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('111111111111111/phone_numbers?')
      );
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('fields='));
    });

    it('should get phone number certificate', async () => {
      const mockResponse = {
        data: [
          {
            id: '888888888888888',
            display_phone_number: '+1234567890',
            certificate: 'cert123',
            name_status: 'APPROVED' as const,
          },
        ],
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.getPhoneNumberCertificate('111111111111111');

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('111111111111111/phone_numbers?fields=')
      );
      expect(result.data[0].certificate).toBe('cert123');
    });

    it('should list message templates', async () => {
      const mockResponse = {
        data: [
          {
            id: '999999999999999',
            name: 'hello_world',
            status: 'APPROVED' as const,
            category: 'MARKETING' as const,
            language: 'en_US',
            components: [],
          },
        ],
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.listMessageTemplates('111111111111111');

      expect(mockClient.get).toHaveBeenCalledWith('111111111111111/message_templates');
      expect(result.data[0].name).toBe('hello_world');
    });

    it('should get template namespace', async () => {
      const mockResponse = {
        id: '111111111111111',
        message_template_namespace: 'abc123_def456',
      };

      const mockClient = createMockHTTPClient(mockResponse);
      const api = new EmbeddedSignupAPI(mockClient);

      const result = await api.getTemplateNamespace('111111111111111');

      expect(mockClient.get).toHaveBeenCalledWith(
        '111111111111111?fields=message_template_namespace'
      );
      expect(result.message_template_namespace).toBe('abc123_def456');
    });
  });
});
