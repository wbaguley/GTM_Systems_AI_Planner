# GTM Planetary Tech Stack Tracker - TODO

## Completed Features
- [x] Database schema and migrations
- [x] User authentication system
- [x] Dashboard with platform statistics
- [x] Platform management module
- [x] GTM Framework module
- [x] Playbook Builder module
- [x] ICP Assessment module
- [x] Settings module
- [x] Development environment setup

## Subscription & Billing System (Completed)
- [x] Add subscription schema to database (plans, subscriptions, usage)
- [x] Create Stripe integration helper functions
- [x] Set up Stripe webhook endpoint for subscription events
- [x] Build pricing page with Essentials ($15) and Pro ($30) plans
- [x] Implement Stripe Checkout flow
- [x] Add subscription management UI in Settings
- [x] Create feature gates for Essentials vs Pro access
- [x] Restrict Essentials users to Platforms + AI upload only
- [x] Add subscription status to user context
- [x] Build billing portal integration
- [ ] Add trial period handling (optional - can be added later)
- [x] Implement subscription cancellation flow
- [ ] Add usage tracking for analytics (optional - can be added later)

## Production Readiness
- [ ] Remove development authentication bypass
- [ ] Add proper OAuth login flow
- [ ] Set up production environment variables
- [ ] Configure production database
- [ ] Add error tracking (Sentry or similar)
- [ ] Implement rate limiting
- [ ] Add email notifications for subscription events
- [ ] Create onboarding flow for new users
- [ ] Add terms of service and privacy policy pages
- [ ] Set up customer support system

## Future Enhancements
- [ ] Team management (invite users, manage seats)
- [ ] Usage analytics dashboard
- [ ] API access for Pro users
- [ ] White-label options for enterprise
- [ ] Integrations with other tools




## Progress Update
- [x] Add subscription schema to database (plans, subscriptions, usage)
- [x] Create Stripe integration helper functions
- [x] Add subscription database helper functions
- [x] Create subscription tRPC routers



## Bug Fixes
- [x] Allow Essentials users full access to Settings (currently restricted)



## Changes Requested
- [x] Update Field Key naming: notesForManus → notesForAI, internal notes → internalnotes, Toolkit → toolkit

