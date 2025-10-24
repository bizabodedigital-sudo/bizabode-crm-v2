# WhatsApp Business API Setup Guide

This guide will help you set up WhatsApp Business API integration for automatic lead capture and customer communication.

## Prerequisites

1. **Meta Business Account** - You need a Meta Business account
2. **WhatsApp Business Account** - Create a WhatsApp Business account
3. **Phone Number** - A dedicated phone number for WhatsApp Business
4. **Meta Developer Account** - Access to Meta for Developers

## Step 1: Create WhatsApp Business App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "Create App" and select "Business" as the app type
3. Fill in your app details:
   - App Name: "Your CRM WhatsApp Integration"
   - App Contact Email: Your business email
   - Business Use Case: Select "Other"

## Step 2: Add WhatsApp Product

1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set up"
3. Follow the setup wizard to configure WhatsApp Business API

## Step 3: Configure Webhook

1. In the WhatsApp section, go to "Configuration"
2. Set up your webhook:
   - **Callback URL**: `https://yourdomain.com/api/integrations/whatsapp`
   - **Verify Token**: Create a secure random string (save this for environment variables)
   - **Webhook Fields**: Select "messages"

3. Click "Verify and Save"

## Step 4: Get Access Token

1. In the WhatsApp section, go to "API Setup"
2. Copy your **Temporary Access Token** (you'll get a permanent one later)
3. Note your **Phone Number ID** from the same page

## Step 5: Environment Variables

Add these to your `.env` file:

```env
# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_WEBHOOK_SECRET=your_webhook_secret_here
WHATSAPP_VERIFY_TOKEN=your_verify_token_here
```

## Step 6: Test the Integration

1. **Send a test message** to your WhatsApp Business number
2. **Check your CRM** - you should see:
   - A new lead created (if it's a new contact)
   - An activity logged (if it's an existing contact)
   - A notification sent to the assigned sales rep

## Step 7: Get Permanent Access Token

1. Go to "System Users" in your Meta Business settings
2. Create a new system user with WhatsApp permissions
3. Generate a permanent access token
4. Update your `WHATSAPP_ACCESS_TOKEN` environment variable

## Features

### Automatic Lead Creation
- New WhatsApp contacts are automatically created as leads
- Contact information is extracted from the message
- Leads are auto-assigned to sales reps

### Activity Logging
- All WhatsApp messages are logged as activities
- Existing customers get activities added to their records
- Sales reps receive notifications for new messages

### Auto-Reply
- Automatic confirmation message sent to new contacts
- Customizable response templates

### Message Parsing
- Extracts business type (Hotel, Restaurant, etc.)
- Identifies product interests
- Categorizes inquiries automatically

## Webhook Security

The webhook includes signature verification to ensure messages are from WhatsApp:

```typescript
// Verify webhook signature
const signature = request.headers.get('x-hub-signature-256')
const isValid = verifyWhatsAppSignature(body, signature, webhookSecret)
```

## Message Types Supported

- **Text Messages**: Full text parsing and lead creation
- **System Messages**: Automatically filtered out
- **Media Messages**: Currently not processed (can be extended)

## Troubleshooting

### Common Issues

1. **Webhook Verification Failed**
   - Check that `WHATSAPP_VERIFY_TOKEN` matches your webhook configuration
   - Ensure your server is accessible from the internet

2. **Messages Not Processing**
   - Verify `WHATSAPP_ACCESS_TOKEN` is correct
   - Check that `WHATSAPP_PHONE_NUMBER_ID` is set correctly
   - Review server logs for error messages

3. **Auto-Reply Not Working**
   - Ensure `WHATSAPP_ACCESS_TOKEN` has message sending permissions
   - Check that the phone number is verified in Meta Business

### Testing Webhook

You can test the webhook endpoint directly:

```bash
curl -X GET "https://yourdomain.com/api/integrations/whatsapp?hub.mode=subscribe&hub.verify_token=your_verify_token&hub.challenge=test"
```

Should return: `test`

## Advanced Configuration

### Custom Auto-Reply Messages

Modify the auto-reply message in `/app/api/integrations/whatsapp/route.ts`:

```typescript
const autoReply = `Thank you for contacting us! We've received your message and will get back to you soon.`
```

### Message Filtering

Add custom logic to filter messages:

```typescript
// Skip messages from specific numbers
if (from === 'blocked_number') {
  return
}

// Skip messages containing specific keywords
if (messageText.includes('spam_keyword')) {
  return
}
```

### Integration with Existing CRM

The webhook automatically:
- Creates leads for new contacts
- Logs activities for existing contacts
- Sends notifications to assigned sales reps
- Categorizes inquiries by business type

## Security Considerations

1. **Webhook Secret**: Use a strong, random webhook secret
2. **Access Token**: Keep your access token secure and rotate it regularly
3. **Rate Limiting**: Consider implementing rate limiting for the webhook endpoint
4. **Data Privacy**: Ensure compliance with WhatsApp's data policies

## Monitoring

Monitor the integration by:
- Checking server logs for webhook processing
- Reviewing lead creation in your CRM
- Verifying notification delivery to sales reps
- Testing message flow end-to-end

## Support

For issues with:
- **WhatsApp Business API**: Contact Meta Business Support
- **CRM Integration**: Check server logs and webhook configuration
- **Message Processing**: Verify environment variables and permissions
