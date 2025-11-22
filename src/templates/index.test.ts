/**
 * Template Management Tests
 * @module templates/index.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TemplateManagementAPI } from './index.js';
import type { HttpClient } from '../client/http.js';
import type {
  Template,
  TemplateListResponse,
  TemplateNamespaceResponse,
  TemplateCreateResponse,
} from '../types/template.js';

describe('TemplateManagementAPI', () => {
  let templateAPI: TemplateManagementAPI;
  let mockHttpClient: HttpClient;
  const testWabaId = 'waba_123456789';
  const testTemplateId = 'template_123456789';

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    } as unknown as HttpClient;
    templateAPI = new TemplateManagementAPI(mockHttpClient, testWabaId);
  });

  describe('READ operations', () => {
    describe('getTemplateById', () => {
      it('should get template by ID without fields', async () => {
        const mockResponse: Template = {
          id: testTemplateId,
          name: 'test_template',
          language: 'en',
          status: 'APPROVED',
          category: 'MARKETING',
          components: [],
        };

        vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

        const result = await templateAPI.getTemplateById(testTemplateId);

        expect(mockHttpClient.get).toHaveBeenCalledWith(`${testTemplateId}`);
        expect(result).toEqual(mockResponse);
      });

      it('should get template by ID with specific fields', async () => {
        const mockResponse: Template = {
          id: testTemplateId,
          name: 'test_template',
          language: 'en',
          status: 'APPROVED',
          category: 'MARKETING',
          components: [],
        };

        vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

        await templateAPI.getTemplateById(testTemplateId, ['id', 'name', 'status']);

        expect(mockHttpClient.get).toHaveBeenCalledWith(`${testTemplateId}?fields=id,name,status`);
      });

      it('should handle all template statuses', async () => {
        const statuses = ['APPROVED', 'PENDING', 'REJECTED', 'PAUSED', 'DISABLED'] as const;

        for (const status of statuses) {
          const mockResponse: Template = {
            id: testTemplateId,
            name: 'test_template',
            language: 'en',
            status,
            category: 'MARKETING',
            components: [],
          };

          vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

          const result = await templateAPI.getTemplateById(testTemplateId);

          expect(result.status).toBe(status);
        }
      });

      it('should handle all template categories', async () => {
        const categories = ['MARKETING', 'UTILITY', 'AUTHENTICATION'] as const;

        for (const category of categories) {
          const mockResponse: Template = {
            id: testTemplateId,
            name: 'test_template',
            language: 'en',
            status: 'APPROVED',
            category,
            components: [],
          };

          vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

          const result = await templateAPI.getTemplateById(testTemplateId);

          expect(result.category).toBe(category);
        }
      });

      it('should include quality_score when present', async () => {
        const mockResponse: Template = {
          id: testTemplateId,
          name: 'test_template',
          language: 'en',
          status: 'APPROVED',
          category: 'MARKETING',
          components: [],
          quality_score: {
            score: 'HIGH',
            date: '2025-01-01',
          },
        };

        vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

        const result = await templateAPI.getTemplateById(testTemplateId);

        expect(result.quality_score).toBeDefined();
        expect(result.quality_score?.score).toBe('HIGH');
      });
    });

    describe('getTemplateByName', () => {
      it('should get template by name', async () => {
        const mockResponse: TemplateListResponse = {
          data: [
            {
              id: testTemplateId,
              name: 'test_template',
              language: 'en',
              status: 'APPROVED',
              category: 'MARKETING',
              components: [],
            },
          ],
        };

        vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

        const result = await templateAPI.getTemplateByName('test_template');

        expect(mockHttpClient.get).toHaveBeenCalledWith(`${testWabaId}/message_templates?name=test_template`);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].name).toBe('test_template');
      });

      it('should get template by name with specific fields', async () => {
        const mockResponse: TemplateListResponse = {
          data: [
            {
              id: testTemplateId,
              name: 'test_template',
              language: 'en',
              status: 'APPROVED',
              category: 'MARKETING',
              components: [],
            },
          ],
        };

        vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

        await templateAPI.getTemplateByName('test_template', ['id', 'name']);

        expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('fields=id%2Cname'));
      });
    });

    describe('getAllTemplates', () => {
      it('should get all templates without parameters', async () => {
        const mockResponse: TemplateListResponse = {
          data: [
            {
              id: 'template_1',
              name: 'template_1',
              language: 'en',
              status: 'APPROVED',
              category: 'MARKETING',
              components: [],
            },
            {
              id: 'template_2',
              name: 'template_2',
              language: 'en',
              status: 'APPROVED',
              category: 'UTILITY',
              components: [],
            },
          ],
        };

        vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

        const result = await templateAPI.getAllTemplates();

        expect(mockHttpClient.get).toHaveBeenCalledWith(`${testWabaId}/message_templates`);
        expect(result.data).toHaveLength(2);
      });

      it('should get all templates with fields', async () => {
        const mockResponse: TemplateListResponse = {
          data: [],
        };

        vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

        await templateAPI.getAllTemplates({
          fields: ['id', 'name', 'status'],
        });

        expect(mockHttpClient.get).toHaveBeenCalledWith(`${testWabaId}/message_templates?fields=id%2Cname%2Cstatus`);
      });

      it('should get all templates with limit', async () => {
        const mockResponse: TemplateListResponse = {
          data: [],
        };

        vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

        await templateAPI.getAllTemplates({
          limit: 10,
        });

        expect(mockHttpClient.get).toHaveBeenCalledWith(`${testWabaId}/message_templates?limit=10`);
      });

      it('should handle pagination', async () => {
        const mockResponse: TemplateListResponse = {
          data: [],
          paging: {
            cursors: {
              before: 'cursor_before',
              after: 'cursor_after',
            },
            next: 'https://graph.facebook.com/next',
            previous: 'https://graph.facebook.com/previous',
          },
        };

        vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

        const result = await templateAPI.getAllTemplates();

        expect(result.paging).toBeDefined();
        expect(result.paging?.cursors).toBeDefined();
        expect(result.paging?.next).toBeDefined();
        expect(result.paging?.previous).toBeDefined();
      });
    });

    describe('getNamespace', () => {
      it('should get template namespace', async () => {
        const mockResponse: TemplateNamespaceResponse = {
          id: testWabaId,
          message_template_namespace: 'test_namespace_123',
        };

        vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

        const result = await templateAPI.getNamespace();

        expect(mockHttpClient.get).toHaveBeenCalledWith(`${testWabaId}?fields=message_template_namespace`);
        expect(result.message_template_namespace).toBe('test_namespace_123');
      });
    });
  });

  describe('CREATE operations', () => {
    describe('createTemplate', () => {
      it('should create a basic template', async () => {
        const mockResponse: TemplateCreateResponse = {
          id: testTemplateId,
          status: 'PENDING',
          category: 'MARKETING',
        };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        const result = await templateAPI.createTemplate({
          name: 'test_template',
          language: 'en',
          category: 'MARKETING',
          components: [
            {
              type: 'BODY',
              text: 'Hello {{1}}!',
            },
          ],
        });


        expect(mockHttpClient.post).toHaveBeenCalledWith(`${testWabaId}/message_templates`, expect.objectContaining({
            name: 'test_template',
            language: 'en',
            category: 'MARKETING',
          }));

        expect(result.id).toBe(testTemplateId);
        expect(result.status).toBe('PENDING');
      });

      it('should create template with header', async () => {
        const mockResponse: TemplateCreateResponse = {
          id: testTemplateId,
          status: 'PENDING',
          category: 'MARKETING',
        };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        await templateAPI.createTemplate({
          name: 'test_template',
          language: 'en',
          category: 'MARKETING',
          components: [
            {
              type: 'HEADER',
              format: 'TEXT',
              text: 'Welcome',
            },
            {
              type: 'BODY',
              text: 'Hello {{1}}!',
            },
          ],
        });

        const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
        expect(callArgs).toHaveProperty('components');
        expect(callArgs.components).toHaveLength(2);
        expect(callArgs.components[0].type).toBe('HEADER');
      });

      it('should create template with buttons', async () => {
        const mockResponse: TemplateCreateResponse = {
          id: testTemplateId,
          status: 'PENDING',
          category: 'MARKETING',
        };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        await templateAPI.createTemplate({
          name: 'test_template',
          language: 'en',
          category: 'MARKETING',
          components: [
            {
              type: 'BODY',
              text: 'Hello!',
            },
            {
              type: 'BUTTONS',
              buttons: [
                {
                  type: 'QUICK_REPLY',
                  text: 'Yes',
                },
                {
                  type: 'QUICK_REPLY',
                  text: 'No',
                },
              ],
            },
          ],
        });

        const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
        expect(callArgs.components[1].type).toBe('BUTTONS');
        expect(callArgs.components[1].buttons).toHaveLength(2);
      });

      it('should support allow_category_change parameter', async () => {
        const mockResponse: TemplateCreateResponse = {
          id: testTemplateId,
          status: 'PENDING',
          category: 'UTILITY',
        };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        await templateAPI.createTemplate({
          name: 'test_template',
          language: 'en',
          category: 'UTILITY',
          components: [
            {
              type: 'BODY',
              text: 'Hello!',
            },
          ],
          allow_category_change: true,
        });

        const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
        expect(callArgs.allow_category_change).toBe(true);
      });
    });

    describe('createAuthenticationTemplate', () => {
      it('should create authentication template with COPY_CODE', async () => {
        const mockResponse: TemplateCreateResponse = {
          id: testTemplateId,
          status: 'PENDING',
          category: 'AUTHENTICATION',
        };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        const result = await templateAPI.createAuthenticationTemplate({
          name: 'auth_template',
          language: 'en',
          button_type: 'COPY_CODE',
    });


        expect(mockHttpClient.post).toHaveBeenCalledWith(`${testWabaId}/message_templates`, expect.objectContaining({
            name: 'auth_template',
            category: 'AUTHENTICATION',
            components: expect.arrayContaining([
              expect.objectContaining({ type: 'BODY' }),
              expect.objectContaining({ type: 'FOOTER' }),
              expect.objectContaining({
                type: 'BUTTONS',
                buttons: expect.arrayContaining([
                  expect.objectContaining({ otp_type: 'COPY_CODE' }),
                ]),
              }),
            ]),
          }));

        expect(result.category).toBe('AUTHENTICATION');
      });

      it('should create authentication template with ONE_TAP', async () => {
        const mockResponse: TemplateCreateResponse = {
          id: testTemplateId,
          status: 'PENDING',
          category: 'AUTHENTICATION',
        };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        await templateAPI.createAuthenticationTemplate({
          name: 'auth_template_onetap',
          language: 'en',
          button_type: 'ONE_TAP',
          autofill_text: 'Autofill',
          package_name: 'com.example.app',
          signature_hash: 'hash123',
        });

        const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
        const buttonsComponent = callArgs.components.find((c: any) => c.type === 'BUTTONS');
        expect(buttonsComponent.buttons[0].otp_type).toBe('ONE_TAP');
        expect(buttonsComponent.buttons[0].package_name).toBe('com.example.app');
      });

      it('should use custom security disclaimer', async () => {
        const mockResponse: TemplateCreateResponse = {
          id: testTemplateId,
          status: 'PENDING',
          category: 'AUTHENTICATION',
        };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        await templateAPI.createAuthenticationTemplate({
          name: 'auth_template',
          language: 'en',
          button_type: 'COPY_CODE',
          security_disclaimer: 'Custom security message',
        });

        const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
        const footerComponent = callArgs.components.find((c: any) => c.type === 'FOOTER');
        expect(footerComponent.text).toBe('Custom security message');
      });
    });

    describe('createCatalogTemplate', () => {
      it('should create basic catalog template', async () => {
        const mockResponse: TemplateCreateResponse = {
          id: testTemplateId,
          status: 'PENDING',
          category: 'MARKETING',
        };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        const result = await templateAPI.createCatalogTemplate({
          name: 'catalog_template',
          language: 'en',
          body_text: 'Check out our products!',
    });


        expect(mockHttpClient.post).toHaveBeenCalledWith(`${testWabaId}/message_templates`, expect.objectContaining({
            name: 'catalog_template',
            category: 'MARKETING',
            components: expect.arrayContaining([
              expect.objectContaining({ type: 'BODY' }),
              expect.objectContaining({
                type: 'BUTTONS',
                buttons: expect.arrayContaining([
                  expect.objectContaining({ type: 'CATALOG' }),
                ]),
              }),
            ]),
          }));

        expect(result.category).toBe('MARKETING');
      });

      it('should create catalog template with header', async () => {
        const mockResponse: TemplateCreateResponse = {
          id: testTemplateId,
          status: 'PENDING',
          category: 'MARKETING',
        };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        await templateAPI.createCatalogTemplate({
          name: 'catalog_template',
          language: 'en',
          header_text: 'New Arrivals',
          body_text: 'Check out our products!',
        });

        const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
        const headerComponent = callArgs.components.find((c: any) => c.type === 'HEADER');
        expect(headerComponent).toBeDefined();
        expect(headerComponent.text).toBe('New Arrivals');
      });

      it('should create catalog template with footer', async () => {
        const mockResponse: TemplateCreateResponse = {
          id: testTemplateId,
          status: 'PENDING',
          category: 'MARKETING',
        };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        await templateAPI.createCatalogTemplate({
          name: 'catalog_template',
          language: 'en',
          body_text: 'Check out our products!',
          footer_text: 'Limited time offer',
        });

        const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
        const footerComponent = callArgs.components.find((c: any) => c.type === 'FOOTER');
        expect(footerComponent).toBeDefined();
        expect(footerComponent.text).toBe('Limited time offer');
      });
    });
  });

  describe('UPDATE & DELETE operations', () => {
    describe('editTemplate', () => {
      it('should edit template category', async () => {
        const mockResponse = { success: true };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        const result = await templateAPI.editTemplate(testTemplateId, {
          category: 'UTILITY',
        });

        expect(mockHttpClient.post).toHaveBeenCalledWith(`${testTemplateId}`, { category: 'UTILITY' });
        expect(result.success).toBe(true);
      });

      it('should edit template components', async () => {
        const mockResponse = { success: true };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        await templateAPI.editTemplate(testTemplateId, {
          components: [
            {
              type: 'BODY',
              text: 'Updated text',
            },
          ],
        });

        const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
        expect(callArgs.components).toBeDefined();
        expect(callArgs.components[0].text).toBe('Updated text');
      });
    });

    describe('deleteTemplateByName', () => {
      it('should delete template by name', async () => {
        const mockResponse = { success: true };

        vi.mocked(mockHttpClient.delete).mockResolvedValue(mockResponse);

        const result = await templateAPI.deleteTemplateByName('test_template');

        expect(mockHttpClient.delete).toHaveBeenCalledWith(`${testWabaId}/message_templates?name=test_template`);
        expect(result.success).toBe(true);
      });

      it('should URL encode template name', async () => {
        const mockResponse = { success: true };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        await templateAPI.deleteTemplateByName('test template with spaces');

        expect(mockHttpClient.delete).toHaveBeenCalledWith(expect.stringContaining('test%20template%20with%20spaces'));
      });
    });

    describe('deleteTemplateById', () => {
      it('should delete template by ID', async () => {
        const mockResponse = { success: true };

        vi.mocked(mockHttpClient.delete).mockResolvedValue(mockResponse);

        const result = await templateAPI.deleteTemplateById(testTemplateId);

        expect(mockHttpClient.delete).toHaveBeenCalledWith(`${testTemplateId}`);
        expect(result.success).toBe(true);
      });
    });
  });
});
