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



## Production Readiness

### Critical (Must Do Before Launch)
- [ ] Set up Stripe account and create products/prices ($15 Essentials, $30 Pro)
- [ ] Add Stripe API keys to environment variables
- [ ] Configure Stripe webhook endpoint
- [ ] Set up custom domain (app.gtmplanetary.com)
- [ ] Test complete subscription flow (signup, payment, cancel, reactivate)
- [x] Add Privacy Policy page
- [x] Add Terms of Service page
- [ ] Remove development authentication bypass (LAST STEP)

### Important (Should Do)
- [ ] Add email notifications (welcome, payment confirmations)
- [ ] Set up error tracking (Sentry or similar)
- [ ] Configure database backup strategy
- [ ] Add UAT tester access mechanism

### Optional (Nice to Have)
- [ ] Add analytics integration
- [ ] Add customer support widget
- [ ] Create onboarding flow for new users



## Subscription Model Changes
- [x] Remove free tier - require subscription to use app
- [x] Add "Testing" role with full Pro access for UAT testers
- [x] Update feature gates to support Testing role
- [ ] Update pricing page to remove free tier messaging (can be done later)
- [x] Add user management UI for admins to assign Testing role



## Bugs to Fix
- [x] Fix 4 errors showing in the application (subscription query returning undefined)
- [x] Ensure owner has full access to all features without subscription requirement
- [x] Add GTM Planetary logo to app icon and branding (logo uploaded, user needs to set in Settings → Customization)



## Branding Updates
- [x] Hardcode GTM Planetary logo into the app (not via settings)
- [x] Change app title to "GTM Planetary"



## New Features to Implement

### SOP Generator (Pro Feature)
- [ ] Create SOP Generator page/module
- [ ] Add file upload for mind maps, documents, PDFs
- [ ] Integrate AI to analyze and convert uploads to SOPs
- [ ] Add chat interface to edit and refine SOPs with AI
- [ ] Add export functionality for generated SOPs
- [ ] Add SOP library/storage for generated documents

### Flow Builder (Rename from Playbook Builder)
- [x] Rename "Playbook Builder" to "Flow Builder" throughout app
- [ ] Keep existing playbook functionality
- [ ] Add system architecture design capabilities
- [ ] Add visual flow diagram builder
- [ ] Add architecture component library

### Platform Document Management
- [x] Add document upload capability to each platform
- [x] Support multiple file types (PDF, DOCX, images)
- [x] Add document categories (SOPs, Contracts, Guides, etc.)
- [x] Add document viewer/download functionality
- [ ] Add document management UI in platform detail view (component created, needs to be integrated into platform pages)



## Flow Builder Terminology Updates
- [x] Change "Create New Playbook" to "Create New Flow"
- [x] Change "New Playbook" button to "New Flow"
- [x] Add "System" as a Type option (alongside Playbook, Cadence, Workflow)
- [x] Update all playbook-related text to flow-related text in Flow Builder



## Remaining Flow Builder Text Updates
- [x] Change "No playbooks yet" to "No flows yet"
- [x] Change "Create your first playbook" to "Create your first flow"
- [x] Change "Create Your First Playbook" button to "Create Your First Flow"
- [x] Change "implementation playbooks" to "implementation flows"



## SOP Generator Implementation (In Progress)
- [x] Create database schema for SOPs (id, userId, title, content, sourceFileName, createdAt, updatedAt)
- [x] Add SOP database helper functions (create, update, delete, list)
- [x] Create SOP tRPC router with procedures (upload, generate, chat, list, get, update, delete)
- [x] Build SOP Generator page UI with file upload component
- [x] Implement file upload to S3 with support for PDF, DOCX, images, mind maps
- [x] Integrate AI document analysis to extract content from uploaded files
- [x] Build chat interface for SOP refinement with AI
- [x] Add SOP preview/editor component
- [x] Implement SOP export functionality (PDF, DOCX, Markdown)
- [x] Create SOP library view to manage saved SOPs
- [x] Add feature gate to restrict SOP Generator to Pro users
- [x] Add navigation link to SOP Generator in sidebar



## SOP Generator Enhancement
- [x] Add text description input option for SOP generation (alternative to file upload)
- [x] Update UI to support both file upload and text description modes
- [x] Add tRPC procedure for generating SOP from text description
- [x] Update SOP Generator page to show tabs or toggle between upload and describe modes



## Platform Document Management UI Integration
- [x] Integrate PlatformDocuments component into platform detail/edit view
- [x] Add document upload section to platform pages
- [ ] Test document upload, categorization, and download functionality
- [x] Ensure documents are visible and manageable from platform interface



## Bug Fixes
- [x] Add Documents section to platform Edit dialog (currently only in View dialog)



## User Management Implementation
- [x] Create user management database schema (if not exists)
- [x] Build user management UI with add/edit/delete functionality
- [x] Implement role-based permissions (admin, user, tester)
- [ ] Add user invitation system
- [x] Replace "coming soon" placeholder with functional user management

## Advanced LLM Configuration
- [x] Add "Use Custom LLM" toggle to Settings
- [x] Create LLM provider selection dropdown (OpenAI, Anthropic, Ollama)
- [x] Add model selection for each provider
- [x] Update invokeLLM to check user settings, fall back to Forge
- [x] Update SOP Generator to pass userId to invokeLLM
- [ ] Test all AI features with custom LLM configuration



## Profile Type Updates
- [x] Update user role enum from (user, admin, tester) to (viewer, standard, admin)
- [x] Update user management UI to use new profile types
- [x] Update role descriptions: Admin (full access), Standard (view + add only), Viewer (read-only)
- [x] Update all role checks throughout the application
- [x] Update database schema and run migration
- [ ] Implement permission enforcement in backend and frontend



## Custom Authentication System (Pre-Deployment)
- [ ] Replace Manus OAuth with custom authentication
- [ ] Implement email/password signup and login
- [ ] Add Google OAuth integration
- [ ] Create password hashing and security (bcrypt)
- [ ] Build signup and login pages
- [ ] Add email verification system
- [ ] Implement password reset flow
- [ ] Update authentication middleware
- [ ] Add "forgot password" functionality
- [ ] Create user profile management



## Enhanced User Management
- [x] Add isActive field to users table for deactivation
- [x] Add isGlobalAdmin field to users table
- [ ] Create user invitation system with email invites
- [x] Add user deactivation/removal functionality to UI
- [x] Implement global admin protection (cannot remove/deactivate global admin)
- [x] Add ability to transfer global admin role to another user
- [x] Ensure there's always at least one global admin
- [x] Add deactivate/reactivate user buttons with confirmation
- [x] Add global admin badge and transfer button
- [ ] Add invite user button and modal



## Bug Fixes - Missing Data
- [x] Fix GTM Frameworks - showing "No frameworks available yet" (5 frameworks, 21 questions)
- [x] Fix ICP Assessment - stuck on "Loading assessment..." (3 sections, 72 questions)
- [x] Restore Sales Methodologies and Enablement section (2 sections, 40 questions)
- [x] Check database for missing seed data
- [x] Create seed scripts for all assessment data



## Bug Fixes - GTM Framework
- [x] Fix "Element type is invalid" error on GTM Framework page (missing useState import)
- [x] Check component exports and imports in GTM Framework page



## Bug Fixes - Platform Logo
- [ ] Fix platform logo not displaying when adding platform URL
- [ ] Implement automatic logo fetching from website URL
- [ ] Add fallback placeholder logo if fetch fails



## GTM Framework Rebuild
- [x] Completely rebuild GTM Framework page from scratch
- [x] Ensure all imports are correct with proper TypeScript types
- [x] Test page loads without errors

