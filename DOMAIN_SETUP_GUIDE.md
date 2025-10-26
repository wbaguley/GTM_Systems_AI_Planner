# Custom Domain Setup Guide

This guide will help you configure **app.gtmplanetary.com** as your custom domain for the GTM Planetary Tech Stack Tracker.

## Prerequisites

- You own the domain `gtmplanetary.com`
- You have access to your domain's DNS settings (through your registrar or DNS provider)
- Your app is deployed on Manus platform

## Step 1: Configure Domain in Manus

1. Open your project in the Manus interface
2. Click the **Management UI** icon (top right)
3. Go to **Settings** → **Domains**
4. Click **Add Custom Domain**
5. Enter: `app.gtmplanetary.com`
6. Click **Add Domain**

Manus will provide you with DNS records to configure. You'll see something like:

```
Type: CNAME
Name: app
Value: your-project-id.manus.space
```

## Step 2: Configure DNS Records

### If using a DNS provider (Cloudflare, Route53, etc.)

1. Log into your DNS provider
2. Navigate to DNS settings for `gtmplanetary.com`
3. Add a new CNAME record:
   - **Type:** CNAME
   - **Name:** app (or app.gtmplanetary.com depending on provider)
   - **Value:** The value provided by Manus (e.g., `your-project-id.manus.space`)
   - **TTL:** Auto or 3600 (1 hour)
4. Save the record

### If using domain registrar's DNS

1. Log into your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS Management or DNS Settings
3. Add a CNAME record with the details above
4. Save changes

## Step 3: Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours to propagate
- Usually takes 15-30 minutes
- You can check propagation status at: https://dnschecker.org

Enter `app.gtmplanetary.com` and select CNAME to see if it's propagated globally.

## Step 4: Verify Domain in Manus

1. Return to Manus **Settings** → **Domains**
2. You should see `app.gtmplanetary.com` with status:
   - **Pending** - DNS not propagated yet
   - **Active** - Domain is live and SSL certificate is issued
3. Once status is **Active**, your custom domain is ready!

## Step 5: Update Stripe Webhook URL

After your custom domain is active:

1. Log into Stripe Dashboard
2. Go to **Developers** → **Webhooks**
3. Click on your webhook endpoint
4. Update the URL to: `https://app.gtmplanetary.com/api/webhooks/stripe`
5. Save changes

## Step 6: Update OAuth Redirect URLs (if applicable)

If you're using custom OAuth:

1. Update your OAuth provider settings
2. Add `https://app.gtmplanetary.com` as an allowed redirect URL
3. Update callback URLs to use the new domain

## Step 7: Test Your Custom Domain

1. Visit `https://app.gtmplanetary.com`
2. Verify the site loads correctly
3. Test login/authentication
4. Test subscription checkout flow
5. Verify webhooks are working

## Common Issues

### CNAME Record Not Working

**Problem:** DNS not resolving after 24 hours

**Solutions:**
- Verify the CNAME value is exactly as provided by Manus
- Remove any trailing dots from the CNAME value
- Ensure there's no conflicting A record for `app`
- Try using `@` or `app.gtmplanetary.com` as the name instead of just `app`

### SSL Certificate Not Issued

**Problem:** Domain shows "Not Secure" or SSL error

**Solutions:**
- Wait 15-30 minutes after DNS propagation for SSL provisioning
- Verify DNS is fully propagated using dnschecker.org
- Contact Manus support if SSL doesn't provision after 1 hour

### Redirect Loop

**Problem:** Page keeps redirecting

**Solutions:**
- Clear browser cache and cookies
- Check if there are multiple CNAME records
- Verify OAuth redirect URLs are updated

### Webhook Failures After Domain Change

**Problem:** Subscriptions not updating

**Solutions:**
- Verify webhook URL in Stripe is updated to new domain
- Check webhook signing secret is still correct
- Test webhook with Stripe's testing tool

## DNS Configuration Examples

### Cloudflare

```
Type: CNAME
Name: app
Target: your-project-id.manus.space
Proxy status: DNS only (gray cloud)
TTL: Auto
```

### AWS Route 53

```
Record name: app.gtmplanetary.com
Record type: CNAME
Value: your-project-id.manus.space
TTL: 300
Routing policy: Simple routing
```

### Namecheap

```
Type: CNAME Record
Host: app
Value: your-project-id.manus.space
TTL: Automatic
```

### GoDaddy

```
Type: CNAME
Name: app
Value: your-project-id.manus.space
TTL: 1 Hour
```

## Security Considerations

- **Always use HTTPS** - Manus automatically provisions SSL certificates
- **Enable HSTS** - Manus handles this automatically
- **Update all external integrations** to use the new domain
- **Monitor SSL certificate expiration** - Manus auto-renews

## Post-Setup Checklist

- [ ] Domain resolves to correct IP/CNAME
- [ ] SSL certificate is active (https works)
- [ ] Application loads correctly
- [ ] Login/authentication works
- [ ] Stripe checkout works
- [ ] Webhooks are receiving events
- [ ] All links use new domain
- [ ] Old domain redirects to new domain (if applicable)

## Support

If you encounter issues:
- Manus Support: https://help.manus.im
- Your DNS Provider's support documentation
- GTM Planetary: support@gtmplanetary.com

---

## Quick Reference

**Your Custom Domain:** app.gtmplanetary.com

**DNS Record Type:** CNAME

**Record Name:** app

**Record Value:** (Provided by Manus after adding domain)

**Verification Tool:** https://dnschecker.org

**Expected Propagation Time:** 15 minutes - 48 hours (usually 30 minutes)

