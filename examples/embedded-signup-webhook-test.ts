/**
 * Webhook Server for Testing Embedded Signup
 * 
 * This example demonstrates how to set up a webhook server to test
 * the Embedded Signup flow and receive WhatsApp notifications.
 * 
 * Usage:
 * 1. Start this server: tsx examples/embedded-signup-webhook-test.ts
 * 2. Start ngrok tunnel: ~/ngrok http 3000
 * 3. Copy ngrok URL and configure in WhatsApp App settings
 * 4. Test with embedded signup flow
 */

import express, { Request, Response } from 'express';
import { WhatsAppClient } from '../src/index.js';

// Configuration
const PORT = 3000;
const WEBHOOK_ENDPOINT = '/webhook';
const WEBHOOK_VERIFY_TOKEN = 'wazapin_test_token_123'; // Change this to your token

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize WhatsApp Client (for embedded signup operations)
const client = new WhatsAppClient({
  phoneNumberId: process.env.PHONE_NUMBER_ID || '',
  accessToken: process.env.ACCESS_TOKEN || '',
  logger: {
    enabled: true,
    level: 'debug',
    timestamp: true,
  },
});

/**
 * GET /webhook - Webhook Verification
 * 
 * WhatsApp will send a GET request to verify your webhook endpoint.
 * You must validate the verify_token and return the challenge.
 */
app.get(WEBHOOK_ENDPOINT, (req: Request, res: Response) => {
  console.log('\n🔔 [WEBHOOK VERIFICATION] Received GET request');
  console.log('Query params:', req.query);

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verify the mode and token
  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed!');
    console.log('Expected token:', WEBHOOK_VERIFY_TOKEN);
    console.log('Received token:', token);
    res.sendStatus(403);
  }
});

/**
 * POST /webhook - Webhook Event Handler
 * 
 * WhatsApp will POST webhook events to this endpoint.
 * Handle various event types here.
 */
app.post(WEBHOOK_ENDPOINT, async (req: Request, res: Response) => {
  console.log('\n📨 [WEBHOOK EVENT] Received POST request');
  
  try {
    const body = req.body;
    console.log('Raw payload:', JSON.stringify(body, null, 2));

    // Always respond with 200 OK immediately
    res.sendStatus(200);

    // Process webhook events
    if (body.object === 'whatsapp_business_account') {
      console.log('\n✅ WhatsApp Business Account event received');

      for (const entry of body.entry) {
        console.log(`\n📋 Entry ID: ${entry.id}`);

        for (const change of entry.changes) {
          console.log(`📝 Change field: ${change.field}`);
          console.log(`📊 Change value:`, JSON.stringify(change.value, null, 2));

          // Handle different event types
          await handleWebhookEvent(change.field, change.value);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
  }
});

/**
 * Handle specific webhook event types
 */
async function handleWebhookEvent(field: string, value: any) {
  switch (field) {
    case 'messages':
      console.log('\n💬 MESSAGE EVENT');
      if (value.messages) {
        for (const message of value.messages) {
          console.log(`From: ${message.from}`);
          console.log(`Type: ${message.type}`);
          console.log(`Timestamp: ${message.timestamp}`);
          
          if (message.type === 'text') {
            console.log(`Text: ${message.text.body}`);
          }
        }
      }
      break;

    case 'message_template_status_update':
      console.log('\n📋 TEMPLATE STATUS UPDATE');
      console.log(`Event: ${value.event}`);
      console.log(`Template ID: ${value.message_template_id}`);
      console.log(`Template Name: ${value.message_template_name}`);
      console.log(`Language: ${value.message_template_language}`);
      if (value.reason) {
        console.log(`Reason: ${value.reason}`);
      }
      break;

    case 'account_update':
      console.log('\n🏢 ACCOUNT UPDATE');
      if (value.event === 'VERIFIED_ACCOUNT') {
        console.log(`✅ Account verified: ${value.phone_number}`);
      } else if (value.event === 'DISABLED_UPDATE') {
        console.log(`⚠️ Account disabled`);
        console.log(`Ban state: ${value.ban_info?.waba_ban_state}`);
        console.log(`Ban date: ${value.ban_info?.waba_ban_date}`);
      }
      break;

    case 'account_review_update':
      console.log('\n🔍 ACCOUNT REVIEW UPDATE');
      console.log(`Decision: ${value.decision}`);
      break;

    case 'phone_number_name_update':
      console.log('\n📱 PHONE NUMBER NAME UPDATE');
      console.log(`Display phone: ${value.display_phone_number}`);
      console.log(`Decision: ${value.decision}`);
      console.log(`Requested name: ${value.requested_verified_name}`);
      if (value.rejection_reason) {
        console.log(`Rejection reason: ${value.rejection_reason}`);
      }
      break;

    case 'phone_number_quality_update':
      console.log('\n📊 PHONE NUMBER QUALITY UPDATE');
      console.log(`Display phone: ${value.display_phone_number}`);
      console.log(`Event: ${value.event}`);
      console.log(`Current limit: ${value.current_limit}`);
      break;

    default:
      console.log(`\n⚠️ Unknown event field: ${field}`);
  }
}

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    webhook: {
      endpoint: WEBHOOK_ENDPOINT,
      port: PORT,
    },
  });
});

/**
 * Root endpoint with instructions
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Wazapin Webhook Server for Embedded Signup Testing',
    instructions: {
      step1: 'Start ngrok: ~/ngrok http 3000',
      step2: 'Copy ngrok URL (e.g., https://abc123.ngrok.io)',
      step3: 'Configure webhook in WhatsApp App settings',
      step4: 'Use this verify token: ' + WEBHOOK_VERIFY_TOKEN,
      step5: 'Test embedded signup flow',
    },
    endpoints: {
      webhook: `http://localhost:${PORT}${WEBHOOK_ENDPOINT}`,
      health: `http://localhost:${PORT}/health`,
    },
  });
});

/**
 * Example: Test embedded signup APIs
 */
app.get('/test/embedded-signup', async (req: Request, res: Response) => {
  try {
    console.log('\n🧪 Testing Embedded Signup APIs...');

    const businessId = req.query.businessId as string;
    
    if (!businessId) {
      return res.status(400).json({
        error: 'Missing businessId query parameter',
        example: '/test/embedded-signup?businessId=YOUR_BUSINESS_ID',
      });
    }

    // Test 1: List shared WABAs
    console.log('\n1️⃣ Listing shared WABAs...');
    const wabas = await client.embeddedSignup.listSharedWABAs(businessId);
    console.log(`✅ Found ${wabas.data.length} shared WABAs`);

    // Test 2: Get extended credits
    console.log('\n2️⃣ Getting extended credits...');
    const credits = await client.embeddedSignup.getExtendedCredits(businessId);
    console.log(`✅ Found ${credits.data.length} credit lines`);

    // Test 3: List system users
    console.log('\n3️⃣ Listing system users...');
    const users = await client.embeddedSignup.listSystemUsers(businessId);
    console.log(`✅ Found ${users.data.length} system users`);

    res.json({
      success: true,
      results: {
        wabas: wabas.data,
        credits: credits.data,
        users: users.data,
      },
    });
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    res.status(500).json({
      error: error.message,
      details: error,
    });
  }
});

/**
 * Start the server
 */
app.listen(PORT, () => {
  console.log('\n🚀 Wazapin Webhook Server Started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🔗 Webhook endpoint: ${WEBHOOK_ENDPOINT}`);
  console.log(`🔑 Verify token: ${WEBHOOK_VERIFY_TOKEN}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📝 Next steps:');
  console.log('1. Start ngrok: ~/ngrok http 3000');
  console.log('2. Copy the ngrok HTTPS URL');
  console.log('3. Configure webhook in WhatsApp App:');
  console.log('   - Webhook URL: https://YOUR_NGROK_URL/webhook');
  console.log(`   - Verify token: ${WEBHOOK_VERIFY_TOKEN}`);
  console.log('4. Subscribe to webhook fields:');
  console.log('   - messages');
  console.log('   - message_template_status_update');
  console.log('   - account_update');
  console.log('   - account_review_update');
  console.log('   - phone_number_name_update');
  console.log('   - phone_number_quality_update');
  console.log('\n✅ Server is ready to receive webhooks!\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...');
  process.exit(0);
});
