/**
 * Unit tests for contact message sending
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendContact } from './contact.js';
import { HTTPClient } from '../client/http.js';
import { Validator } from '../validation/validator.js';
import type { SendContactParams } from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';

describe('sendContact', () => {
  let mockClient: HTTPClient;
  let mockPost: ReturnType<typeof vi.fn>;
  const mockResponse: MessageResponse = {
    messaging_product: 'whatsapp',
    contacts: [{ input: '+1234567890', wa_id: '1234567890' }],
    messages: [{ id: 'wamid.123' }],
  };

  beforeEach(() => {
    mockPost = vi.fn().mockResolvedValue(mockResponse);
    mockClient = {
      post: mockPost,
    } as unknown as HTTPClient;
  });

  it('should send basic contact message', async () => {
    const params: SendContactParams = {
      to: '+1234567890',
      contacts: [
        {
          name: {
            formattedName: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      ],
    };

    const result = await sendContact(mockClient, 'phone123', params);

    expect(result).toEqual(mockResponse);
    expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: '+1234567890',
      type: 'contacts',
      contacts: [
        {
          name: {
            formatted_name: 'John Doe',
            first_name: 'John',
            last_name: 'Doe',
          },
        },
      ],
    });
  });

  it('should send contact with phone numbers', async () => {
    const params: SendContactParams = {
      to: '+1234567890',
      contacts: [
        {
          name: {
            formattedName: 'John Doe',
          },
          phones: [
            { phone: '+1234567890', type: 'MOBILE', waId: '1234567890' },
            { phone: '+0987654321', type: 'HOME' },
          ],
        },
      ],
    };

    await sendContact(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        contacts: [
          expect.objectContaining({
            phones: [
              { phone: '+1234567890', type: 'MOBILE', wa_id: '1234567890' },
              { phone: '+0987654321', type: 'HOME' },
            ],
          }),
        ],
      })
    );
  });

  it('should send contact with emails', async () => {
    const params: SendContactParams = {
      to: '+1234567890',
      contacts: [
        {
          name: {
            formattedName: 'John Doe',
          },
          emails: [
            { email: 'john@example.com', type: 'WORK' },
            { email: 'john.doe@personal.com', type: 'HOME' },
          ],
        },
      ],
    };

    await sendContact(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        contacts: [
          expect.objectContaining({
            emails: [
              { email: 'john@example.com', type: 'WORK' },
              { email: 'john.doe@personal.com', type: 'HOME' },
            ],
          }),
        ],
      })
    );
  });

  it('should send contact with URLs', async () => {
    const params: SendContactParams = {
      to: '+1234567890',
      contacts: [
        {
          name: {
            formattedName: 'John Doe',
          },
          urls: [
            { url: 'https://example.com', type: 'WORK' },
            { url: 'https://personal.com', type: 'HOME' },
          ],
        },
      ],
    };

    await sendContact(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        contacts: [
          expect.objectContaining({
            urls: [
              { url: 'https://example.com', type: 'WORK' },
              { url: 'https://personal.com', type: 'HOME' },
            ],
          }),
        ],
      })
    );
  });

  it('should send contact with addresses', async () => {
    const params: SendContactParams = {
      to: '+1234567890',
      contacts: [
        {
          name: {
            formattedName: 'John Doe',
          },
          addresses: [
            {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'United States',
              countryCode: 'US',
              type: 'HOME',
            },
          ],
        },
      ],
    };

    await sendContact(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        contacts: [
          expect.objectContaining({
            addresses: [
              {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'United States',
                country_code: 'US',
                type: 'HOME',
              },
            ],
          }),
        ],
      })
    );
  });

  it('should send contact with organization', async () => {
    const params: SendContactParams = {
      to: '+1234567890',
      contacts: [
        {
          name: {
            formattedName: 'John Doe',
          },
          org: {
            company: 'Acme Corp',
            department: 'Engineering',
            title: 'Senior Developer',
          },
        },
      ],
    };

    await sendContact(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        contacts: [
          expect.objectContaining({
            org: {
              company: 'Acme Corp',
              department: 'Engineering',
              title: 'Senior Developer',
            },
          }),
        ],
      })
    );
  });

  it('should send contact with birthday', async () => {
    const params: SendContactParams = {
      to: '+1234567890',
      contacts: [
        {
          name: {
            formattedName: 'John Doe',
          },
          birthday: '1990-01-01',
        },
      ],
    };

    await sendContact(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        contacts: [
          expect.objectContaining({
            birthday: '1990-01-01',
          }),
        ],
      })
    );
  });

  it('should send contact with full name details', async () => {
    const params: SendContactParams = {
      to: '+1234567890',
      contacts: [
        {
          name: {
            formattedName: 'Dr. John Michael Doe Jr.',
            firstName: 'John',
            lastName: 'Doe',
            middleName: 'Michael',
            prefix: 'Dr.',
            suffix: 'Jr.',
          },
        },
      ],
    };

    await sendContact(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        contacts: [
          expect.objectContaining({
            name: {
              formatted_name: 'Dr. John Michael Doe Jr.',
              first_name: 'John',
              last_name: 'Doe',
              middle_name: 'Michael',
              prefix: 'Dr.',
              suffix: 'Jr.',
            },
          }),
        ],
      })
    );
  });

  it('should send multiple contacts', async () => {
    const params: SendContactParams = {
      to: '+1234567890',
      contacts: [
        {
          name: {
            formattedName: 'John Doe',
          },
        },
        {
          name: {
            formattedName: 'Jane Smith',
          },
        },
      ],
    };

    await sendContact(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        contacts: expect.arrayContaining([
          expect.objectContaining({
            name: expect.objectContaining({ formatted_name: 'John Doe' }),
          }),
          expect.objectContaining({
            name: expect.objectContaining({ formatted_name: 'Jane Smith' }),
          }),
        ]),
      })
    );
  });

  it('should send complete contact with all fields', async () => {
    const params: SendContactParams = {
      to: '+1234567890',
      contacts: [
        {
          name: {
            formattedName: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
          },
          phones: [{ phone: '+1234567890', type: 'MOBILE' }],
          emails: [{ email: 'john@example.com', type: 'WORK' }],
          urls: [{ url: 'https://example.com', type: 'WORK' }],
          addresses: [
            {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'United States',
              countryCode: 'US',
              type: 'HOME',
            },
          ],
          org: {
            company: 'Acme Corp',
            department: 'Engineering',
            title: 'Developer',
          },
          birthday: '1990-01-01',
        },
      ],
    };

    await sendContact(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        contacts: [
          expect.objectContaining({
            name: expect.any(Object),
            phones: expect.any(Array),
            emails: expect.any(Array),
            urls: expect.any(Array),
            addresses: expect.any(Array),
            org: expect.any(Object),
            birthday: '1990-01-01',
          }),
        ],
      })
    );
  });

  it('should validate with strict mode', async () => {
    const validator = new Validator('strict');
    const params: SendContactParams = {
      to: '+1234567890',
      contacts: [
        {
          name: {
            formattedName: 'John Doe',
          },
        },
      ],
    };

    await sendContact(mockClient, 'phone123', params, validator);

    expect(mockPost).toHaveBeenCalled();
  });
});
