# Webhook Testing Guide for Embedded Signup

Complete guide untuk testing WhatsApp Embedded Signup dengan webhook menggunakan ngrok.

## 📋 Prerequisites

- ✅ Ngrok installed: `~/ngrok version`
- ✅ Ngrok configured: authtoken sudah di-set
- ✅ Node.js/TypeScript runtime (tsx, ts-node, atau bun)
- ✅ WhatsApp Business App dengan permissions yang benar

## 🚀 Quick Start

### 1. Start Webhook Server

```bash
# Install dependencies jika belum
cd /home/ujang/0new/wazapin-sdk/wa-sdk
npm install

# Start webhook server
npx tsx examples/embedded-signup-webhook-test.ts

# Atau dengan environment variables
PHONE_NUMBER_ID=xxx ACCESS_TOKEN=xxx npx tsx examples/embedded-signup-webhook-test.ts
```

Server akan running di `http://localhost:3000`

### 2. Start Ngrok Tunnel

Di terminal baru:

```bash
# Start ngrok tunnel
~/ngrok http 3000

# Output akan seperti ini:
# Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

**Copy HTTPS URL dari ngrok** (misalnya: `https://abc123.ngrok.io`)

### 3. Configure Webhook di WhatsApp App

1. **Buka Meta App Dashboard**
   - Go to: https://developers.facebook.com/apps/
   - Pilih app Anda
   - Sidebar > WhatsApp > Configuration

2. **Edit Webhook**
   - Callback URL: `https://YOUR_NGROK_URL/webhook`
   - Verify Token: `wazapin_test_token_123`
   - Click "Verify and Save"

3. **Subscribe to Fields**
   Subscribe ke webhook fields berikut:
   - ✅ `messages` - Incoming messages
   - ✅ `message_template_status_update` - Template approval status
   - ✅ `account_update` - WABA updates (verification, ban, etc)
   - ✅ `account_review_update` - WABA review results
   - ✅ `phone_number_name_update` - Display name changes
   - ✅ `phone_number_quality_update` - Quality rating changes

4. **Test Verification**
   - WhatsApp akan send GET request ke webhook
   - Check terminal untuk verification log
   - Harus muncul: `✅ Webhook verified successfully!`

## 📡 Testing Scenarios

### Scenario 1: Test Webhook Subscription

```bash
# Use embedded signup API to subscribe to WABA
curl http://localhost:3000/test/embedded-signup?businessId=YOUR_BUSINESS_ID
```

### Scenario 2: Send Test Message

Kirim message dari WhatsApp ke phone number yang terdaftar:

```
Hello from testing!
```

Check terminal untuk webhook event:
```
📨 [WEBHOOK EVENT] Received POST request
💬 MESSAGE EVENT
From: +1234567890
Type: text
Text: Hello from testing!
```

### Scenario 3: Create Message Template

```typescript
// This will trigger message_template_status_update webhook
const template = await client.embeddedSignup.listMessageTemplates(wabaId);
```

Check terminal untuk webhook:
```
📋 TEMPLATE STATUS UPDATE
Event: APPROVED
Template Name: hello_world
```

## 🔍 Webhook Events Reference

### 1. Messages Event

**Triggered**: When someone sends message to your WhatsApp number

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "field": "messages",
      "value": {
        "messages": [{
          "from": "+1234567890",
          "type": "text",
          "text": { "body": "Hello" },
          "timestamp": "1234567890"
        }]
      }
    }]
  }]
}
```

### 2. Template Status Update

**Triggered**: When message template status changes

```json
{
  "field": "message_template_status_update",
  "value": {
    "event": "APPROVED",
    "message_template_id": "123456",
    "message_template_name": "hello_world",
    "message_template_language": "en_US"
  }
}
```

### 3. Account Update

**Triggered**: When WABA status changes

```json
{
  "field": "account_update",
  "value": {
    "phone_number": "+1234567890",
    "event": "VERIFIED_ACCOUNT"
  }
}
```

### 4. Account Review Update

**Triggered**: When WABA review completes

```json
{
  "field": "account_review_update",
  "value": {
    "decision": "APPROVED"
  }
}
```

### 5. Phone Number Name Update

**Triggered**: When display name is approved/rejected

```json
{
  "field": "phone_number_name_update",
  "value": {
    "display_phone_number": "+1234567890",
    "decision": "APPROVED",
    "requested_verified_name": "My Business"
  }
}
```

### 6. Quality Update

**Triggered**: When quality rating changes

```json
{
  "field": "phone_number_quality_update",
  "value": {
    "display_phone_number": "+1234567890",
    "event": "FLAGGED",
    "current_limit": "TIER_10K"
  }
}
```

## 🛠️ Debugging Tips

### 1. Check Webhook Logs

Terminal akan show detailed logs:
```
🔔 [WEBHOOK VERIFICATION] Received GET request
✅ Webhook verified successfully!

📨 [WEBHOOK EVENT] Received POST request
💬 MESSAGE EVENT
From: +1234567890
```

### 2. Check Ngrok Dashboard

Buka di browser: http://localhost:4040

Akan show:
- All HTTP requests
- Request/response bodies
- Headers
- Replay requests

### 3. Verify Token Mismatch

Jika verification failed:
```
❌ Webhook verification failed!
Expected token: wazapin_test_token_123
Received token: wrong_token
```

**Fix**: Update verify token di WhatsApp App settings

### 4. Webhook Not Receiving Events

**Checklist**:
- ✅ Ngrok tunnel masih running?
- ✅ Server masih running di port 3000?
- ✅ Webhook fields sudah di-subscribe?
- ✅ HTTPS URL (bukan HTTP)?

### 5. Test with cURL

```bash
# Test verification
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=wazapin_test_token_123&hub.challenge=test_challenge"

# Should return: test_challenge

# Test POST event
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "messages": [{
            "from": "1234567890",
            "type": "text",
            "text": {"body": "Test"},
            "timestamp": "1234567890"
          }]
        }
      }]
    }]
  }'
```

## 🔐 Security Notes

### Production Usage

Untuk production, ganti simple verification dengan signature validation:

```typescript
import crypto from 'crypto';

function verifySignature(req: Request): boolean {
  const signature = req.headers['x-hub-signature-256'] as string;
  const appSecret = process.env.APP_SECRET;
  
  if (!signature || !appSecret) {
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}

app.post('/webhook', (req, res) => {
  if (!verifySignature(req)) {
    return res.sendStatus(403);
  }
  // Process webhook...
});
```

### Environment Variables

Simpan credentials di `.env`:

```bash
# .env
PHONE_NUMBER_ID=your_phone_number_id
ACCESS_TOKEN=your_access_token
WEBHOOK_VERIFY_TOKEN=your_verify_token
APP_SECRET=your_app_secret
```

Load dengan dotenv:

```typescript
import 'dotenv/config';

const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'default_token';
```

## 📚 Additional Resources

- [WhatsApp Webhooks Documentation](https://developers.facebook.com/docs/whatsapp/webhooks)
- [Embedded Signup Guide](https://developers.facebook.com/docs/whatsapp/embedded-signup)
- [Ngrok Documentation](https://ngrok.com/docs)
- [Wazapin SDK Documentation](../README.md)

## 🆘 Troubleshooting

### Error: EADDRINUSE (Port 3000 in use)

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npx tsx examples/embedded-signup-webhook-test.ts
```

### Error: ngrok not found

```bash
# Verify installation
~/ngrok version

# If not installed, download again
cd ~
curl -Lo ngrok.tgz https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok.tgz
chmod +x ngrok
```

### Webhook Returns 500

Check terminal logs untuk error details. Common issues:
- Invalid JSON payload
- Missing required fields
- Type mismatch

## ✅ Success Checklist

- [ ] Webhook server running di http://localhost:3000
- [ ] Ngrok tunnel running dengan HTTPS URL
- [ ] Webhook configured di WhatsApp App
- [ ] Verification successful (GET request)
- [ ] Subscribed to all required fields
- [ ] Test message received dan logged
- [ ] No errors in terminal

---

**Happy Testing! 🎉**

Jika ada issues, check terminal logs untuk detailed error messages.
