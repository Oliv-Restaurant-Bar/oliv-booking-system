# 🔑 How to Get Your ZeptoMail API Token

## ✅ We're Using ZeptoMail SendMail API (NOT SMTP)

Our implementation uses the official **ZeptoMail SendMail Client** for Node.js:
- Package: `zeptomail` (already installed)
- Method: REST API via SendMailClient
- Documentation: [https://www.zoho.com/zeptomail/email-api.html](https://www.zoho.com/zeptomail/email-api.html)

## 📋 Step-by-Step: Get Your API Token

### 1. Sign Up / Login
Go to: **https://www.zoho.com/zeptomail/**

Create a free account or login if you already have one.

### 2. Verify Your Domain (Required)
Before you can send emails, you MUST verify your domain:

1. In ZeptoMail dashboard, go to **"Sender Domains"** or **"Domains"**
2. Click **"Add Domain"**
3. Enter: `oliv-restaurant.ch` (or your actual domain)
4. Click **"Add"**

You'll see DNS records to add. Add these to your domain's DNS settings:

```
Type: TXT
Name: @
Value: zoho-verify=zt-xxxxx

Type: TXT
Name: @
Value: v=spf1 include:zeptomail.zoho.com ~all

Type: CNAME
Name: zoho-verify
Value: zt-xxxxx.zoho-verify.com
```

5. Wait for verification (can take 24-48 hours for DNS propagation)

### 3. Generate API Token
Once domain is verified (or during verification):

1. Go to **"API Keys"** or **"Service Accounts"** section
2. Click **"Generate New Token"** or **"Create API Key"**
3. Give it a name: "Oliv Booking System"
4. Click **"Generate"** or **"Create"**
5. **⚠️ COPY THE TOKEN IMMEDIATELY** - You'll only see it once!

The token looks like:
```
zt-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Add to Environment Variables
Edit `.env.local` and add:

```env
# ZeptoMail API Configuration
ZEPTOMAIL_API_TOKEN="zt-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
ZEPTOMAIL_FROM_EMAIL="bookings@oliv-restaurant.ch"
ZEPTOMAIL_FROM_NAME="Oliv Restaurant"
ZEPTOMAIL_REPLY_TO="info@oliv-restaurant.ch"
```

### 5. Test the Configuration
Run the test script:

```bash
npm run email:test
```

This will send a test email to verify everything works.

## 📧 How ZeptoMail API Works

### Official Example (from docs):
```javascript
import { SendMailClient } from "zeptomail";

const url = "zeptomail.zoho.com/";
const token = "[Authorization key]";

let client = new SendMailClient({ url, token });

client.sendMail({
  from: {
    address: "yourname@yourdomain.com",
    name: "noreply"
  },
  to: [
    {
      email_address: {
        address: "receiver@yourdomain.com",
        name: "Receiver"
      },
    },
  ],
  subject: "Test Email",
  htmlbody: "Test email sent successfully.",
})
.then((resp) => console.log("success"))
.catch((error) => console.log("error"));
```

### Our Implementation (Updated):
```javascript
import { SendMailClient } from "zeptomail";

const token = process.env.ZEPTOMAIL_API_TOKEN;

export const zcClient = new SendMailClient({
  url: "https://zeptomail.zoho.com/",  // ✅ Correct URL from docs
  token: token || "",
});

export async function sendEmail(params) {
  const mailOptions = {
    from: {
      address: params.from?.address || "bookings@oliv-restaurant.ch",
      name: params.from?.name || "Oliv Restaurant",
    },
    to: [
      {
        email_address: {
          address: params.to,
          name: ""
        }
      }
    ],
    subject: params.subject,
    htmlbody: params.html,
  };

  const response = await zcClient.sendMail(mailOptions);
  return { success: true, messageId: response.message_id };
}
```

## 🔍 API Endpoint

**Base URL:** `https://zeptomail.zoho.com/`
**Send Email Endpoint:** `https://zeptomail.zoho.com/v1.1/email`
**Method:** POST
**Authentication:** Bearer token in Authorization header

## ✅ What You Need

### Required Environment Variables:
```env
ZEPTOMAIL_API_TOKEN=          # Your API token (starts with "zt-")
ZEPTOMAIL_FROM_EMAIL=         # Verified sender email
ZEPTOMAIL_FROM_NAME=          # Sender display name
ZEPTOMAIL_REPLY_TO=           # Reply-to address (optional)
```

### Verified Domain:
- Domain must be verified in ZeptoMail dashboard
- DNS records must be added
- Can take 24-48 hours for full verification

## 🎯 Quick Start Checklist

- [ ] Sign up at https://www.zoho.com/zeptomail/
- [ ] Add and verify domain: `oliv-restaurant.ch`
- [ ] Add DNS records (TXT, CNAME, SPF)
- [ ] Generate API token
- [ ] Copy token to `.env.local`
- [ ] Run test: `npm run email:test`
- [ ] Receive test email

## 💡 Important Notes

1. **Domain Verification Required:** You cannot send emails until your domain is verified
2. **Token Security:** Never commit `.env.local` to git
3. **Free Tier:** ZeptoMail has a free tier with limited emails per month
4. **Rate Limits:** Check your plan for sending limits
5. **Token Format:** Token starts with `zt-` and is quite long

## 🚨 Troubleshooting

### "Domain not verified" error
- Add DNS records to your domain
- Wait 24-48 hours for DNS propagation
- Check ZeptoMail dashboard for verification status

### "Invalid token" error
- Verify token is copied correctly (no extra spaces)
- Check token starts with `zt-`
- Generate new token if needed

### "From address not authorized" error
- Ensure `ZEPTOMAIL_FROM_EMAIL` matches your verified domain
- Example: `bookings@oliv-restaurant.ch` works if `oliv-restaurant.ch` is verified

## 📚 Resources

- **Official Docs:** [https://www.zoho.com/zeptomail/email-api.html](https://www.zoho.com/zeptomail/email-api.html)
- **NPM Package:** [https://www.npmjs.com/package/zeptomail](https://www.npmjs.com/package/zeptomail)
- **Dashboard:** [https://zeptomail.zoho.com/](https://zeptomail.zoho.com/)

---

**Questions?** Check the documentation or open the ZeptoMail dashboard for help.
