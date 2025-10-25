# Production Deployment Checklist

Before deploying GTM Planetary Tech Stack Tracker to production at **app.gtmplanetary.com**, complete these steps:

## 1. Stripe Configuration

- [ ] Create Stripe account and complete business verification
- [ ] Create live products and prices in Stripe Dashboard
  - [ ] Essentials: $15/month
  - [ ] Pro: $30/month
- [ ] Copy live API keys (pk_live_xxx and sk_live_xxx)
- [ ] Set up production webhook endpoint
- [ ] Test webhook delivery

## 2. Environment Variables

Add these to your Manus project secrets (Settings → Secrets in Management UI):

```env
# Stripe Live Keys
STRIPE_SECRET_KEY=sk_live_xxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Stripe Price IDs (from live products)
STRIPE_ESSENTIALS_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_yyyyy

# Stripe Webhook Secret (from production webhook)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## 3. Remove Development Bypasses

- [ ] Remove development authentication bypass from `server/_core/context.ts`
  - Delete or comment out the section that creates a dev user
  - Ensure all users must authenticate via OAuth

## 4. Database

- [ ] Run database migrations: `pnpm db:push`
- [ ] Initialize subscription plans: `pnpm tsx server/scripts/init-subscription-plans.ts`
- [ ] Verify subscription_plans table has correct Stripe price IDs

## 5. Domain Setup

- [ ] Configure custom domain: app.gtmplanetary.com
  - In Manus UI: Settings → Domains
  - Add custom domain
  - Update DNS records as instructed
- [ ] Update Stripe webhook URL to https://app.gtmplanetary.com/api/webhooks/stripe
- [ ] Test SSL certificate is working

## 6. Application Settings

Update in Manus UI (Settings → General):

- [ ] Website name: GTM Planetary Tech Stack Tracker
- [ ] Logo: Upload GTM Planetary logo
- [ ] Visibility: Set to Public (or Private if you want invite-only)

## 7. Testing

Test the complete user journey:

- [ ] User can sign up via OAuth
- [ ] Free tier shows correct feature restrictions
- [ ] Pricing page displays correctly
- [ ] Essentials checkout works ($15/month)
- [ ] Pro checkout works ($30/month)
- [ ] Subscription shows in Settings → Billing
- [ ] Feature gates work correctly
  - [ ] Free users can't access Pro features
  - [ ] Essentials users can access Platforms only
  - [ ] Pro users can access all features
- [ ] Billing portal link works
- [ ] Subscription cancellation works
- [ ] Webhook events are being received

## 8. Content & Branding

- [ ] Update app title and logo in environment variables
- [ ] Customize pricing page copy if needed
- [ ] Add terms of service link
- [ ] Add privacy policy link
- [ ] Add support/contact information

## 9. Monitoring & Analytics

- [ ] Set up error tracking (optional)
- [ ] Monitor Stripe Dashboard for subscription events
- [ ] Check webhook delivery logs regularly
- [ ] Monitor database for subscription records

## 10. Launch

- [ ] Create a checkpoint in Manus
- [ ] Click "Publish" in Manus UI
- [ ] Test the published site at app.gtmplanetary.com
- [ ] Announce launch!

## Post-Launch

- [ ] Monitor for errors in first 24 hours
- [ ] Check Stripe Dashboard for successful payments
- [ ] Verify webhook events are processing correctly
- [ ] Gather user feedback
- [ ] Plan feature updates based on usage

## Support & Maintenance

- **Stripe Issues**: https://support.stripe.com
- **Manus Platform**: https://help.manus.im
- **Application Code**: Contact Wyatt

## Security Reminders

- Never share API keys publicly
- Rotate keys if compromised
- Keep webhook secrets secure
- Monitor for suspicious activity in Stripe Dashboard
- Regularly review user access and permissions

## Rollback Plan

If issues occur after deployment:

1. Click "Rollback" in Manus UI to restore previous checkpoint
2. Investigate the issue in development
3. Fix and test thoroughly
4. Create new checkpoint and republish

## Notes

- The development authentication bypass MUST be removed before going live
- Test the entire subscription flow with a real card before announcing launch
- Consider offering a trial period or discount for early adopters
- Monitor conversion rates on the pricing page

---

**Ready to deploy?** Make sure all checkboxes above are completed, then click Publish in the Manus UI!

