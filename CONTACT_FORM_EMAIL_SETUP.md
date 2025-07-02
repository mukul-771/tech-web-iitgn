# 📧 Contact Form Email Setup Guide

## ✅ Implementation Complete

The contact form has been updated to send actual emails using **Resend**, a modern email service provider.

## 🔧 What Was Implemented

### 1. **Email Service Integration**
- ✅ **Resend API** integration for reliable email delivery
- ✅ **Dual email system**: 
  - Email to Technical Secretary (`technical.secretary@iitgn.ac.in`)
  - Confirmation email to the user
- ✅ **Professional HTML email templates**
- ✅ **Error handling** with fallback logging
- ✅ **Graceful degradation** when email service is not configured

### 2. **Features Added**
- 📧 **Professional email templates** with proper styling
- 🕐 **Timestamp tracking** (India timezone)
- 📝 **Detailed logging** for debugging
- ✅ **User confirmation emails** 
- 🔄 **Fallback handling** if email service fails

---

## 🚀 How to Set Up Email Delivery

### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

### Step 2: Add Your Domain (Optional but Recommended)
1. In Resend dashboard, go to **Domains**
2. Add your domain: `iitgn.tech` 
3. Add the DNS records to your domain provider
4. Wait for verification (can take a few hours)

**Without domain setup**: Emails will be sent from `onboarding@resend.dev` (works but less professional)
**With domain setup**: Emails will be sent from `contact@iitgn.tech` (more professional)

### Step 3: Get API Key
1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name like "IITGN Technical Council Contact Form"
4. Copy the API key (starts with `re_`)

### Step 4: Configure Environment Variables

#### For Local Development:
Create `.env.local` file in project root:
```bash
RESEND_API_KEY=re_your_actual_api_key_here
```

#### For Production (Vercel):
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_your_actual_api_key_here`
   - **Environment**: Production, Preview, Development
3. Redeploy your application

### Step 5: Update Email Domain (if you set up custom domain)
In `/src/app/api/contact/route.ts`, update line 39 and 65:
```typescript
from: 'contact@iitgn.tech', // Replace with your verified domain
```

---

## 🧪 Testing the Setup

### Test 1: Local Development
1. Set up `.env.local` with your `RESEND_API_KEY`
2. Run `npm run dev`
3. Go to `/contact` page
4. Submit a test message
5. Check console logs and your email

### Test 2: Production
1. Deploy with environment variable set
2. Submit contact form on live site
3. Check emails are received

### Test 3: Without Email Service
- If `RESEND_API_KEY` is not set, the form will:
  - Still accept submissions
  - Log to console for debugging
  - Show user a message indicating email delivery is not configured

---

## 📧 What Emails Look Like

### Email to Technical Secretary:
```
Subject: Contact Form: [User's Subject]

New Contact Form Submission

Name: John Doe
Email: john@example.com
Subject: Question about robotics club

Message:
[User's message with proper formatting]

This message was sent from the Technical Council website contact form.
Timestamp: 02/07/2025, 11:30:00 AM
```

### Confirmation Email to User:
```
Subject: Thank you for contacting Technical Council - IIT Gandhinagar

Dear John Doe,

We have received your message regarding "Question about robotics club" and appreciate you taking the time to contact us.

What happens next?
Our team will review your inquiry and respond within 1-2 business days...

Best regards,
Technical Council
IIT Gandhinagar
```

---

## 💰 Cost Information

### Resend Pricing:
- **Free Tier**: 100 emails/day, 3,000 emails/month
- **Pro Tier**: $20/month for 50,000 emails/month
- **Growth Tier**: $80/month for 100,000 emails/month

For a university contact form, the free tier should be sufficient.

---

## 🔧 Alternative Email Services

If you prefer different services, here are alternatives:

### 1. **SendGrid** (Popular choice)
- Free tier: 100 emails/day
- Good documentation and reliability

### 2. **Nodemailer with Gmail**
- Use Gmail SMTP
- Requires app-specific password
- Free but has daily limits

### 3. **AWS SES**
- Very cheap ($0.10 per 1,000 emails)
- Requires AWS account setup

---

## 🚨 Important Notes

1. **Domain Verification**: For production, set up domain verification to avoid emails going to spam
2. **Rate Limiting**: Consider adding rate limiting to prevent spam
3. **Spam Protection**: Consider adding CAPTCHA for additional protection
4. **Monitoring**: Monitor email delivery in Resend dashboard
5. **Backup**: Always log form submissions even when emails work

---

## 📝 Current Status

- ✅ **Code Implementation**: Complete
- ⏳ **Email Service Setup**: Requires RESEND_API_KEY configuration
- ⏳ **Domain Verification**: Optional but recommended
- ✅ **Error Handling**: Implemented with fallbacks
- ✅ **User Experience**: Professional emails with confirmation

**Ready to deploy!** Just add the `RESEND_API_KEY` environment variable and emails will start working immediately.

---

## 🆘 Troubleshooting

### Common Issues:

1. **Emails not sending**:
   - Check `RESEND_API_KEY` is set correctly
   - Check Resend dashboard for error logs
   - Check server console logs

2. **Emails going to spam**:
   - Set up domain verification
   - Check email content for spam triggers

3. **API key issues**:
   - Make sure key starts with `re_`
   - Regenerate key if needed
   - Check Resend dashboard for usage

For support: Check Resend documentation or contact their support team.
