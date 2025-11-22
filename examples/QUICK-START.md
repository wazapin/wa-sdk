# 🚀 Quick Start - Test Real WhatsApp API

Simple 5-minute guide to test all SDK features with real WhatsApp API.

---

## Step 1: Get Your Credentials (2 minutes)

### 1. Go to Facebook Developers
Visit: https://developers.facebook.com/apps

### 2. Select Your App (or create new)
Click on your app → WhatsApp → API Setup

### 3. Copy These Values:

| Field | Where to find | Example |
|-------|---------------|---------|
| **Access Token** | "Temporary access token" section | `EAABsbCS1iHgBO...` |
| **Phone Number ID** | Below phone number display | `123456789012345` |
| **WABA ID** | WhatsApp Business Account ID in URL | `123456789012345` |
| **Business ID** | Business Settings → Business Info | `123456789012345` |

---

## Step 2: Setup Environment (1 minute)

```bash
# Go to examples directory
cd examples/

# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

Paste your credentials:
```env
WHATSAPP_ACCESS_TOKEN=EAABsbCS1iHgBO...
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_WABA_ID=123456789012345
WHATSAPP_BUSINESS_ID=123456789012345
TEST_RECIPIENT_PHONE=+628123456789  # YOUR phone number
```

**Save and exit** (Ctrl+X, then Y, then Enter)

---

## Step 3: Install & Run (2 minutes)

```bash
# Back to root directory
cd ..

# Install dependencies (if not done)
npm install dotenv tsx -D

# Build SDK
npm run build

# Run tests!
npm run test:real
```

---

## 📊 What You'll See

```
🧪 WhatsApp Cloud API - Real Testing Script
==========================================

📋 Configuration:
   Phone Number ID: 123456789012345
   WABA ID: 123456789012345
   Test Recipient: +628123456789

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
   Business: My Business Name
✅ Account: Get Messaging Limit (98ms)
   Current Tier: TIER_1K
✅ Account: List Phone Numbers (112ms)
   Found 1 phone number(s)
✅ Account: Get Phone Number Details (145ms)
   Display Name: +62 812-3456-789

📄 Testing Templates API...

✅ Templates: List Templates (178ms)
   Found 3 template(s)
✅ Templates: Send Template Message (234ms)

🔄 Testing Flows API...

✅ Flows: List Flows (156ms)
   Found 2 flow(s)
   - Appointment Booking (PUBLISHED)
   - Survey Flow (DRAFT)
✅ Flows: Create Flow (289ms)
   Created Flow ID: 123456789
✅ Flows: Update Flow (167ms)
✅ Flows: Delete Flow (134ms)
   Deleted Flow ID: 123456789

📊 Testing Analytics API...

✅ Analytics: Get Analytics (445ms)
   Data points: 30

🔗 Testing Embedded Signup API...

✅ Embedded Signup: List Shared WABAs (178ms)
   Found 1 shared WABA(s)
✅ Embedded Signup: Get WABA Info (123ms)
   WABA: My Business Account
✅ Embedded Signup: List System Users (156ms)
   Found 2 system user(s)
✅ Embedded Signup: Get Extended Credits (189ms)
   Found 1 credit line(s)
✅ Embedded Signup: List Subscriptions (145ms)
   Active subscriptions: 1

==================================================
📊 TEST SUMMARY
==================================================

✅ Passed:  28/30
❌ Failed:  0/30
⏭️  Skipped: 2/30
⏱️  Duration: 12.45s

📈 By Category:
   Messaging: 6/6 (100%)
   Account: 4/4 (100%)
   Templates: 2/2 (100%)
   Flows: 4/7 (57%)
   Analytics: 1/1 (100%)
   Embedded Signup: 5/5 (100%)

==================================================
🎉 All tests passed!
==================================================
```

---

## 📱 Check Your Phone!

You should receive test messages on your WhatsApp:
- ✅ Text message
- ✅ Reaction emoji
- ✅ Location pin
- ✅ Contact card
- ✅ Interactive buttons
- ✅ Interactive list/menu
- ✅ Template message

---

## 🎯 Test Specific Features Only

### Test Only Messaging

```bash
# Edit the script to run only messaging tests
nano examples/test-real-api.ts
```

Comment out other tests in the `main()` function:
```typescript
async function main() {
  // ...
  await testMessaging();       // ✅ Keep this
  // await testAccount();      // ❌ Comment out
  // await testTemplates();    // ❌ Comment out
  // await testFlows();        // ❌ Comment out
  // await testAnalytics();    // ❌ Comment out
  // await testEmbeddedSignup(); // ❌ Comment out
}
```

---

## 🐛 Common Issues

### ❌ "Missing required environment variables"

**Solution:**
```bash
# Check your .env file exists
ls -la examples/.env

# Check file has content
cat examples/.env

# Make sure format is correct (no spaces around =)
WHATSAPP_ACCESS_TOKEN=yourtoken
```

### ❌ "Invalid access token"

**Solution:**
1. Go to: https://developers.facebook.com/apps
2. Get a NEW temporary token (they expire after 24 hours)
3. Update `.env` file with new token
4. Run test again

### ❌ "Module not found"

**Solution:**
```bash
# Build the SDK first
npm run build

# Install dependencies
npm install dotenv tsx -D

# Try again
npm run test:real
```

### ❌ Tests are slow?

**This is normal!** Each API call takes 100-500ms. Full test = ~10-15 seconds.

---

## 💡 Pro Tips

### Get Fresh Access Token
```bash
# Tokens expire in 24 hours
# Get new one: https://developers.facebook.com/apps
# Click "WhatsApp" → "API Setup" → Copy "Temporary access token"
```

### Test Different Phone Number
```bash
# Override recipient for this run only
TEST_RECIPIENT_PHONE=+629876543210 npm run test:real
```

### Debug Mode
```bash
# See all API requests/responses
DEBUG=* npm run test:real
```

### Watch Mode (Auto-reload)
```bash
# Auto-run tests when you edit code
npm run test:real:watch
```

---

## 📚 Next Steps

✅ **Tests passing?** Great! Your SDK is working with real API!

Now you can:
1. Read [full README](./README.md) for all features
2. Check [examples](./examples/) for more use cases
3. Read [main SDK docs](../README.md) for API reference
4. Build your app with confidence! 🚀

---

## ⚠️ Important Notes

### Rate Limits
- WhatsApp API limits: 80 messages/second
- Don't spam your test number
- Add delays if testing intensively

### Costs
- Template messages may cost money
- Business-initiated conversations have fees
- Check Meta Business billing settings

### Production
- These are REAL messages to REAL phone numbers
- Use test numbers you control
- Don't test on customer numbers!

---

**Need help?** 
- Check [full README](./README.md)
- Read [SDK documentation](../README.md)
- Open issue on GitHub

---

**Happy Testing!** 🎉
