# 🔑 How to Get ZeptoMail API Token

## ✅ We're Using ZeptoMail API (NOT SMTP)

You're correct! We're using the **ZeptoMail SendMail API**, not SMTP. Here's the difference:

### SMTP vs API

| **SMTP** | **API** (What we use) |
|----------|---------------------|
| Requires SMTP host, port, username, password | Requires only API token |
| Older protocol | Modern REST API |
| Less flexible | More control & features |
| `smtp.zeptomail.com:587` | `https://zeptomail.zoho.com/v1.1/email` |

## 📝 Step-by-Step: Get Your API Token

### 1. Sign Up / Log In
Go to: **https://www.zoho.com/zeptomail/**

### 2. Access Your Account
Click on **"Sign In"** or **"Get Started"**

### 3. Navigate to API Keys
Once logged in:
- Go to **Settings** ⚙️
- Find **"API Keys"** or **"Service Accounts"**
- Click **"Generate New Token"** or **"Create API Key"**

### 4. Configure API Token
Fill in:
- **Token Name:** "Oliv Booking System - Production"
- **Scope:** Full access or Send Mail access
- **IP Whitelist** (optional): Add your server IP for security

### 5. Copy the Token
⚠️ **IMPORTANT:** Copy the token immediately - you'll only see it once!

Example format (similar to):
```
ztok-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

### 6. Add to Your Environment
Edit `.env.local`:

```env
# ZeptoMail API Token (NOT SMTP!)
ZEPTOMAIL_API_TOKEN="paste-your-token-here"

# From email (must be verified domain)
ZEPTOMAIL_FROM_EMAIL="bookings@oliv-restaurant.ch"
ZEPTOMAIL_FROM_NAME="Oliv Restaurant"
ZEPTOMAIL_REPLY_TO="info@oliv-restaurant.ch"
```

## 🔍 How Our Code Uses the API

### In `lib/email/zeptomail.ts`:

```typescript
import { SendMailClient } from "zeptomail";

const token = process.env.ZEPTOMAIL_API_TOKEN;

export const zcClient = new SendMailClient({
  url: "https://api.zeptomail.com/",  // API endpoint
  token: token,                        // Your API token
});

// Send email via API
await zcClient.sendMail({
  from: { address: "bookings@oliv-restaurant.ch", name: "Oliv" },
  to: [{ email_address: { address: "customer@example.com" } }],
  subject: "Subject",
  htmlbody: "<h1>Email content</h1>",
});
```

## ✅ API vs SMTP Configuration

### ❌ DON'T Use These (SMTP):
```env
# ❌ NOT NEEDED - We use API, not SMTP
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
```

### ✅ DO Use This (API):
```env
# ✅ CORRECT - API configuration
ZEPTOMAIL_API_TOKEN="your-token-here"
ZEPTOMAIL_FROM_EMAIL="bookings@oliv-restaurant.ch"
```

## 🧪 Test Your Token

Once you have the token, test it:

```bash
# Add token to .env.local first!
npm run email:test
```

This will send a test email using your API token.

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to git
2. **Use environment-specific tokens:**
   - Development token for testing
   - Production token for live site
3. **Rotate tokens regularly** (every 90 days)
4. **Monitor usage** in ZeptoMail dashboard
5. **Set up IP whitelisting** if possible

## 📊 API Endpoint

**Base URL:** `https://api.zeptomail.com/`

**Email Send Endpoint:** `https://api.zeptomail.com/v1.1/email`

**Authentication:** `Authorization: [your-token]`

## 💡 Example API Request

```bash
curl "https://api.zeptomail.com/v1.1/email" \
  -X POST \
  -H "Authorization: ztok-your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "from": {
      "address": "bookings@oliv-restaurant.ch"
    },
    "to": [{
      "email_address": {
        "address": "customer@example.com"
      }
    }],
    "subject": "Test Email",
    "htmlbody": "<h1>Hello!</h1>"
  }'
```

## 🎯 Summary

✅ We use **ZeptoMail SendMail API** (npm package: `zeptomail`)
✅ You need an **API Token** (not SMTP credentials)
✅ Get token from: ZeptoMail Dashboard → Settings → API Keys
✅ Add to `.env.local` as `ZEPTOMAIL_API_TOKEN`
✅ Test with: `npm run email:test`

---

**Need help?** Check:
- ZeptoMail Docs: https://www.zoho.com/zeptomail/email-api.html
- Our Setup Plan: `ZEPTOMAIL_SETUP_PLAN.md`
- Our Quick Start: `EMAIL_QUICKSTART.md`
