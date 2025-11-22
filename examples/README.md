# Testing Examples

This directory contains scripts to test the SDK with real WhatsApp Cloud API.

## 📋 Available Examples

### 1. `test-real-api.ts` - Complete API Testing
Comprehensive test script that covers all SDK endpoints with real WhatsApp API.

**Tests included:**
- ✅ Messaging (text, reactions, location, contacts, interactive)
- ✅ Account Management (profile, limits, phone numbers)
- ✅ Templates (list, send)
- ✅ Flows API (list, create, update, delete, preview, assets)
- ✅ Analytics (conversation analytics)
- ✅ Embedded Signup (WABAs, system users, credits, subscriptions)

### 2. `embedded-signup-webhook-test.ts` - Webhook Testing
Test script for Embedded Signup webhook integration.

### 3. `README-WEBHOOK-TESTING.md` - Webhook Setup Guide
Detailed guide for setting up and testing webhooks.

---

## 🚀 Quick Start

### Step 1: Setup Environment

1. **Copy environment file:**
   ```bash
   cp examples/.env.example examples/.env
   ```

2. **Get WhatsApp credentials:**
   
   Go to https://developers.facebook.com/apps and get:
   - Access Token (from App Dashboard → WhatsApp → API Setup)
   - Phone Number ID (from WhatsApp → API Setup)
   - WABA ID (WhatsApp Business Account ID)
   - Business ID (from Business Settings)

3. **Fill in `.env` file:**
   ```env
   WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxx
   WHATSAPP_PHONE_NUMBER_ID=123456789
   WHATSAPP_WABA_ID=123456789
   WHATSAPP_BUSINESS_ID=123456789
   TEST_RECIPIENT_PHONE=+1234567890  # Your WhatsApp number for testing
   ```

### Step 2: Install Dependencies

```bash
# Install dotenv for environment variables
npm install dotenv

# Install tsx for running TypeScript
npm install -D tsx
```

### Step 3: Run Tests

```bash
# Run complete API test
npx tsx examples/test-real-api.ts

# Or with verbose logging
DEBUG=* npx tsx examples/test-real-api.ts
```

---

## 📊 Test Output

The test script will show real-time progress:

```
🧪 WhatsApp Cloud API - Real Testing Script
==========================================

📋 Configuration:
   Phone Number ID: 123456789
   WABA ID: 123456789
   Test Recipient: +1234567890

📱 Testing Messaging APIs...

✅ Messaging: Send Text Message (234ms)
   Message ID: wamid.HBgL...
✅ Messaging: Send Reaction (456ms)
✅ Messaging: Send Location (189ms)
✅ Messaging: Send Contact (234ms)
✅ Messaging: Send Interactive Buttons (345ms)
✅ Messaging: Send Interactive List (289ms)

👤 Testing Account APIs...

✅ Account: Get Business Profile (123ms)
   Business: My Business
✅ Account: Get Messaging Limit (98ms)
   Current Tier: TIER_1K
...

==================================================
📊 TEST SUMMARY
==================================================

✅ Passed:  25/30
❌ Failed:  2/30
⏭️  Skipped: 3/30
⏱️  Duration: 12.45s

📈 By Category:
   Messaging: 6/6 (100%)
   Account: 4/4 (100%)
   Templates: 1/2 (50%)
   Flows: 5/7 (71%)
   Analytics: 1/1 (100%)
   Embedded Signup: 5/5 (100%)

==================================================
```

---

## 🔧 Configuration Options

### Required Environment Variables

| Variable | Description | Where to get |
|----------|-------------|-------------|
| `WHATSAPP_ACCESS_TOKEN` | Access token for API | App Dashboard → WhatsApp → API Setup |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone number to send from | WhatsApp → API Setup → Phone Number ID |
| `WHATSAPP_WABA_ID` | WhatsApp Business Account ID | Business Manager → Business Settings |
| `WHATSAPP_BUSINESS_ID` | Facebook Business ID | Business Manager → Business Info |
| `TEST_RECIPIENT_PHONE` | Your phone for receiving tests | Your WhatsApp number (+1234567890) |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WHATSAPP_APP_SECRET` | For webhook verification | - |
| `TEST_TEMPLATE_NAME` | Template to test | `hello_world` |
| `TEST_FLOW_ID` | Flow ID to test | - |
| `TEST_FLOW_NAME` | Flow name to test | - |
| `TEST_IMAGE_URL` | Image URL for media tests | - |
| `TEST_VIDEO_URL` | Video URL for media tests | - |

---

## 🎯 Testing Specific Features

### Test Only Messaging

Edit `test-real-api.ts` and comment out other test functions:

```typescript
async function main() {
  // ...
  await testMessaging();
  // await testAccount();      // Comment out
  // await testTemplates();     // Comment out
  // await testFlows();         // Comment out
  // await testAnalytics();     // Comment out
  // await testEmbeddedSignup(); // Comment out
}
```

### Test with Custom Recipient

```bash
# Override recipient for this run
TEST_RECIPIENT_PHONE=+9876543210 npx tsx examples/test-real-api.ts
```

### Test with Debug Logging

```bash
# Enable debug logging
DEBUG=* npx tsx examples/test-real-api.ts
```

---

## 📝 Creating Custom Tests

You can create your own test scripts using the SDK:

```typescript
// examples/my-custom-test.ts
import 'dotenv/config';
import { WhatsAppClient } from '../dist/index.js';

const client = new WhatsAppClient({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  logger: {
    level: 'debug',
    timestamp: true,
  },
});

async function main() {
  // Your custom test
  const response = await client.messages.sendText({
    to: '+1234567890',
    text: 'Hello from custom test!',
  });
  
  console.log('Message sent:', response.messages[0].id);
}

main().catch(console.error);
```

Run it:
```bash
npx tsx examples/my-custom-test.ts
```

---

## 🐛 Troubleshooting

### Error: "Missing required environment variables"

Make sure you've:
1. Created `.env` file in `examples/` directory
2. Filled in all required values
3. No spaces around `=` in `.env` file

### Error: "Invalid access token"

- Token expired? Get a new one from Facebook Developer Console
- Token doesn't have correct permissions? Check App permissions
- Wrong token format? Should start with `EAA`

### Error: "Phone number not registered"

- Make sure your WhatsApp Business phone number is verified
- Check you're using the correct Phone Number ID (not the phone number itself)

### Error: "Could not find module"

```bash
# Make sure you've built the SDK first
npm run build

# Then run the test
npx tsx examples/test-real-api.ts
```

### Tests are slow?

This is normal - each API call to WhatsApp takes 100-500ms. The full test suite takes ~10-15 seconds.

---

## 💡 Tips

### Rate Limiting

WhatsApp API has rate limits:
- 80 messages per second
- 1000 messages per second (for registered businesses)

If testing intensively, add delays between tests:

```typescript
await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
```

### Testing in Production

⚠️ **Warning**: These tests will send REAL messages to REAL phone numbers!

- Use a test phone number you control
- Don't spam users with test messages
- Consider using WhatsApp Test numbers if available

### Cost Considerations

- Template messages may incur costs
- Business-initiated conversations have fees
- Check your Meta Business billing settings

---

## 📚 Additional Resources

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [SDK Documentation](../README.md)
- [Webhook Testing Guide](./README-WEBHOOK-TESTING.md)
- [Meta Business Suite](https://business.facebook.com)

---

## 🤝 Contributing

Found an issue or want to add more test cases? Open an issue or PR!

---

**Need help?** Check the [main README](../README.md) or open an issue on GitHub.
