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



## Flow Builder UX Improvements
- [x] Implement drag-and-drop from shape library to canvas
- [x] Add double-click to edit node title inline
- [x] Add right-click context menu on nodes
- [x] Add "Clone" option to context menu
- [x] Add "Delete" option to context menu
- [ ] Add "Change Node Type" option to context menu (future enhancement)
- [ ] Add "Change Color" option to context menu (future enhancement)
- [ ] Add "Change Shape" option to context menu (future enhancement)
- [x] Remove the "Add New Node" modal (replaced with drag-and-drop)
- [x] Make node creation workflow similar to ClickUp (drag-and-drop + double-click edit)
- [x] Add export functionality with format options (PNG, JPEG, SVG)
- [x] Add export dropdown button to Flow Builder toolbar

## Dark/Light Mode
- [x] Add theme toggle to Settings page
- [x] Enable switchable theme mode in App.tsx
- [x] Apply theme across entire application (using existing ThemeContext)
- [ ] Save theme preference to database per user (currently using localStorage)
- [ ] Update Flow Builder canvas for dark mode support




## Flow Builder Complete Rebuild (ClickUp Whiteboard Style)
- [x] Add resizable nodes with drag handles
- [x] Implement floating toolbar on node click (not right-click)
- [x] Add shape picker to floating toolbar
- [x] Add color picker to floating toolbar  
- [x] Add clone and delete to floating toolbar
- [x] Improve drag-and-drop from shape library
- [x] Implement smart export that auto-crops to content bounds with padding
- [x] Match ClickUp whiteboard UI/UX exactly
- [x] Add node size persistence to database (width, height)
- [x] Add node color persistence to database
- [x] Add node shape persistence to database




## Flow Builder - ClickUp Features (Based on Screenshots)

### Right-Click Context Menu
- [ ] Implement comprehensive right-click context menu with all options:
  - [ ] Lock
  - [ ] Link to...
  - [ ] Send to front
  - [ ] Send to back
  - [ ] Send forward (Alt + ])
  - [ ] Send backward (Alt + [)
  - [ ] Copy (Ctrl + C)
  - [ ] Paste (Ctrl + V)
  - [ ] Duplicate (Ctrl + D)
  - [ ] Cut (Ctrl + X)
  - [ ] Delete
  - [ ] Copy object (Ctrl + Shift + L)
  - [ ] Copy as... (submenu)
  - [ ] Export as... (submenu)
  - [ ] Select all (Ctrl + A)

### Floating Toolbar Fixes
- [x] Fix floating toolbar to appear when node is clicked/selected
- [x] Add shape picker dropdown with icons for all shapes
- [x] Fix color picker to work properly with gradient/hue selector
- [x] Add copy/duplicate button to toolbar
- [x] Add delete button to toolbar
- [x] Ensure toolbar has dark theme (#1f2937 background)

### Shape Library Expansion
- [x] Add more shape variations:
  - [x] Parallelogram (slanted rectangle)
  - [x] Trapezoid
  - [ ] Pentagon
  - [x] Hexagon (proper 6-sided)
  - [ ] Octagon
  - [x] Oval/Ellipse
  - [ ] Star
  - [ ] Arrow (right-pointing)
  - [ ] Arrow (left-pointing)
  - [ ] Arrow (up-pointing)
  - [ ] Arrow (down-pointing)
  - [ ] Rounded rectangle (different radius)
  - [ ] Pill shape

### Dark Theme Canvas
- [x] Change canvas background to dark (#1a1a1a or similar)
- [x] Update grid dots to light color for dark theme
- [x] Ensure all text is visible on dark background

### Bottom Toolbar
- [ ] Add bottom toolbar with ClickUp-style tools:
  - [ ] Selection tool
  - [ ] Hand/Pan tool
  - [ ] Text tool
  - [ ] Sticky note tool
  - [ ] Shape tools
  - [ ] Image upload tool
  - [ ] Other ClickUp whiteboard tools

### QA Testing Checklist
- [x] Test node selection (click to select) - PASSED
- [x] Test floating toolbar appears on selection - PASSED
- [x] Test shape picker dropdown works - PASSED (7 shapes available)
- [x] Test color picker changes node color - PASSED (HexColorPicker working)
- [ ] Test color persists after page reload
- [ ] Test shape change persists after page reload
- [ ] Test right-click context menu appears - NEEDS MANUAL TESTING
- [ ] Test all context menu options work
- [x] Test node resizing with drag handles - PASSED (NodeResizer visible)
- [ ] Test node position persists
- [ ] Test drag-and-drop from shape library - NEEDS MANUAL TESTING
- [ ] Test double-click inline editing
- [ ] Test export PNG/JPEG/SVG - NEEDS MANUAL TESTING
- [x] Test zoom controls - PASSED (visible in UI)
- [x] Test fit view - PASSED (visible in UI)
- [x] Test dark theme visibility - PASSED (dark canvas and sidebar)
- [ ] Test on different screen sizes





## Flow Builder - Bug Fixes and New Features (User Reported)

### Bugs to Fix
- [x] Fix diamond shape rendering (not displaying correctly)
- [x] Fix context menu not closing when clicking outside

### Shape Library Redesign
- [x] Match ClickUp's exact styling with darker background (#1e293b or similar)
- [x] Update shape items to have proper spacing and hover effects
- [x] Ensure rounded corners and proper padding match ClickUp

### Bottom Toolbar Implementation
- [x] Add bottom toolbar with ClickUp-style tools
- [x] Add selection/cursor tool
- [x] Add square/rectangle creation tool
- [x] Add line/connector creation tool
- [x] Add text tool
- [x] Add sticky note tool
- [x] Add image upload tool
- [x] Add drawing/freehand tool
- [x] Add other ClickUp whiteboard tools from screenshot

### Keyboard Shortcuts
- [ ] Implement hotkeys for shape selection
- [ ] Update cursor to indicate current tool mode
- [ ] Add visual feedback when tool is selected

### Drawing and Sticky Notes
- [ ] Implement freehand drawing tool
- [ ] Add sticky note component with different colors
- [ ] Ensure sticky notes are draggable and editable
- [ ] Add sticky note to shape library





## Flow Builder - Toolbar Repositioning (User Request)

### Move Toolbar to Shape Library Location
- [x] Remove the Shape Library sidebar completely
- [x] Move the bottom toolbar to the left sidebar area (where Shape Library was)
- [x] Position toolbar at the top of the left sidebar
- [x] Keep toolbar horizontal layout
- [x] Match ClickUp's exact positioning from screenshot

### Implement Tool Click Handlers
- [ ] Add click handlers for all toolbar buttons
- [ ] Implement active state styling to show selected tool
- [ ] Add cursor mode switching (selection, drawing, shape creation, etc.)
- [ ] Implement tool functionality (rectangle creation, circle creation, line drawing, etc.)





## Flow Builder - Vertical Toolbar Layout (User Request)

- [x] Change toolbar layout from horizontal (left to right) to vertical (top to bottom)
- [x] Stack all tool buttons vertically in the left sidebar
- [x] Maintain proper spacing between tools
- [x] Keep separators horizontal between tool groups





## Flow Builder - Toolbar Functionality & Hotkeys (User Request)

### Implement Tool Click Handlers
- [x] Add onClick handlers for all toolbar buttons
- [x] Implement active state styling (highlight selected tool)
- [x] Add state management for current selected tool
- [x] Show visual feedback when tool is active

### Implement Keyboard Shortcuts (Hotkeys)
- [x] V - Selection tool
- [x] H - Hand/Pan tool
- [x] R - Rectangle tool
- [x] C - Circle tool
- [x] L - Line tool
- [x] A - Arrow tool
- [x] T - Text tool
- [x] N - Sticky Note tool
- [x] D - Draw/Freehand tool
- [x] I - Image upload tool

### Implement Tool Functionality
- [ ] Selection tool - allow selecting and moving nodes
- [ ] Hand tool - pan/move canvas
- [ ] Rectangle tool - click to create rectangle node
- [ ] Circle tool - click to create circle node
- [ ] Line tool - click and drag to create connection
- [ ] Arrow tool - click and drag to create arrow connection
- [ ] Text tool - click to create text node
- [ ] Sticky Note tool - click to create sticky note
- [ ] Draw tool - freehand drawing on canvas
- [ ] Image tool - upload and place image





## Flow Builder - Tool Placement Functionality (User Request)

### Fix Mouse Button Behavior
- [x] Change left mouse button from panning to placing nodes/shapes
- [x] Change right mouse button (hold) to pan/drag canvas
- [x] Only allow panning with left mouse when Hand tool is active

### Implement Click-to-Place for Each Tool
- [x] Rectangle tool - Click on canvas to create rectangle node at that position
- [x] Circle tool - Click on canvas to create circle node at that position
- [x] Line tool - Click on canvas to create line node at that position
- [x] Arrow tool - Click on canvas to create arrow node at that position
- [x] Text tool - Click on canvas to create text node at that position
- [x] Sticky Note tool - Click on canvas to create sticky note at that position
- [x] Draw tool - Click on canvas to create drawing node at that position
- [x] Image tool - Click to create image node at that position

### ReactFlow Configuration Updates
- [x] Disable default panning with left mouse button
- [x] Enable panning only with right mouse button or when Hand tool is active
- [x] Add canvas click handler to detect tool placement clicks
- [x] Create nodes at clicked position based on active tool




## Flow Builder - Bug Fixes (User Reported)

### Color Picker Not Working
- [x] Fix color picker so clicking on colors actually changes the node color (handleColorChange updates state and database)
- [x] Ensure color change is saved to database
- [ ] Close color picker after color is selected (requires manual testing)

### Shape Icon Not Updating
- [x] Update shape picker icon to show current node shape (not always square)
- [x] Icon now dynamically displays circle, diamond, hexagon, oval, parallelogram, trapezoid, or rectangle based on data.shape

### Drag-to-Size When Placing Shapes
- [x] Change placement behavior from click-to-place to click-and-drag
- [x] On mouse down, create shape at small size (50x50)
- [x] As user drags while holding button, increase shape size (onPaneMouseMove)
- [x] On mouse up, finalize shape at dragged size and save to database
- [x] This works for all shape tools (Rectangle, Circle, Line, Arrow, Text, Sticky Note, Draw, Image)




## Flow Builder - Additional Bug Fixes (User Reported)

### Cursor Not Changing When Tool Selected
- [x] Change cursor to crosshair (+) when shape tools are selected (Rectangle, Circle, etc.)
- [x] Keep cursor as default arrow for Select tool
- [x] Keep cursor as grab hand for Hand tool
- [x] Update cursor dynamically based on activeTool state

### Context Menu Positioning
- [x] Fix right-click context menu to not get cut off at screen edges
- [x] Intelligently position menu to stay fully visible within viewport bounds
- [x] Ensure all menu items are accessible regardless of where user right-clicks
- [x] Add 10px padding from viewport edges




## Flow Builder - Critical Bug (User Reported)

### Cursor and Shape Creation Still Not Working
- [ ] Cursor is still not changing to crosshair when shape tools are selected
- [ ] Cannot create squares or circles by clicking and dragging
- [ ] Debug why cursor styling is not being applied
- [ ] Debug why drag-to-size functionality is not working
- [ ] Test in browser to verify the issue




## Flow Builder - Complete Rebuild Required (User Feedback)

### CRITICAL ISSUES - Nothing is Working
- [x] Fix ReactFlow event handlers - Removed invalid `onPaneMouseDown` and `onPaneMouseUp` props
- [x] Implemented native DOM event listeners for mouse handling
- [ ] Canvas panning needs testing with middle mouse button
- [ ] Shape creation needs testing with drag-to-size
- [x] Using proper native DOM events instead of invalid ReactFlow props

### Middle Mouse Button Panning (User Request)
- [ ] Make middle mouse button the default way to pan/move canvas
- [ ] Left mouse button should only be for creating shapes/drawing
- [ ] Right mouse button should show context menu
- [ ] Remove any left-click panning behavior

### Secondary Shape Picker Bar (ClickUp Feature)
- [ ] When shape tool is clicked, show secondary horizontal bar at bottom
- [ ] Bar should display all shape variations with icons:
  - [ ] Rectangle (rounded corners option)
  - [ ] Circle/Oval
  - [ ] Triangle
  - [ ] Diamond
  - [ ] Parallelogram
  - [ ] Hexagon
  - [ ] Octagon
  - [ ] Cloud
  - [ ] Star
  - [ ] Arrow (multiple directions)
  - [ ] More shapes button
- [ ] Clicking a shape in secondary bar sets it as active shape
- [ ] Bar should have dark theme matching ClickUp

### Color Palette in Bottom Toolbar (ClickUp Feature)
- [ ] Add color palette to bottom toolbar (not in floating toolbar)
- [ ] Show preset color circles: Red, Pink, Orange, Yellow, Green, Teal, Blue, Purple, Gray, White, Black
- [ ] Clicking a color sets it as active color for next shape
- [ ] Show currently selected color with white border/highlight

### Freehand Drawing Tool (ClickUp Feature)
- [ ] Implement freehand drawing when Draw tool is selected
- [ ] Click and drag to draw smooth lines on canvas
- [ ] Lines should persist and be saved to database
- [ ] Support different colors for drawing
- [ ] Support eraser tool

### Fix Drag-to-Size Functionality
- [ ] Remove invalid `onPaneMouseDown` and `onPaneMouseUp` props
- [ ] Use native DOM event listeners on canvas element
- [ ] OR use ReactFlow's correct event handling API
- [ ] Implement proper mouse down → drag → mouse up flow
- [ ] Create shape at mouse down position
- [ ] Resize shape as mouse moves
- [ ] Finalize shape on mouse up

### Restore Canvas Panning
- [ ] Re-enable canvas panning with middle mouse button
- [ ] Ensure panning works smoothly
- [ ] Add visual feedback (cursor change to grab hand when panning)

### Comprehensive QA Testing Required
- [ ] Test middle mouse button panning
- [ ] Test left mouse button shape creation with drag-to-size
- [ ] Test right mouse button context menu
- [ ] Test freehand drawing tool
- [ ] Test secondary shape picker bar
- [ ] Test color palette selection
- [ ] Test all keyboard shortcuts still work
- [ ] Test shape persistence after page reload
- [ ] Test color persistence after page reload




## Flow Builder - CRITICAL BUGS REPORTED BY USER (Oct 26)

- [x] **Incorrect Shape Rendering:** Fixed by changing node type from 'custom' to 'resizable' and setting shape to activeTool directly
- [x] **Nodes Disappear:** Fixed by adding all handler functions (onLabelChange, onColorChange, etc.) to new nodes
- [ ] **Incorrect Positioning:** Nodes are appearing in the center of the screen, not at the cursor's click position (needs testing)
- [x] **No Actual Shape Rendering:** Fixed - getShapeStyle function now applies because node type is correct




## Flow Builder - Whiteboard Feel (User Requirement)

- [ ] **Freehand Drawing:** Implement true freehand drawing with mouse - user can draw lines/sketches freely on canvas
- [ ] **Smooth Panning:** Make canvas panning feel natural and smooth (middle mouse button or hand tool)
- [ ] **Natural Shape Creation:** Drag to create shapes with visual feedback during dragging
- [ ] **Whiteboard-like Interaction:** Overall feel should mimic drawing on a physical whiteboard
- [ ] **Immediate Visual Feedback:** Show shapes/lines as they're being drawn, not after release



## Flow Builder - NEXT STEPS (Priority Order)

1. [x] **Test shape rendering** - All shapes render correctly (Rectangle, Circle, Diamond verified)
2. [x] **Test drag-to-size** - Native DOM event listeners work perfectly
3. [x] **Test node persistence** - Nodes save to database with all properties
4. [x] **Test node positioning** - Nodes appear at drag position correctly
5. [x] **Test floating toolbar** - Appears on selection with shape/color pickers
6. [x] **Test shape picker** - All 7 shapes available and shape change works
7. [x] **Test color picker** - HexColorPicker opens and displays correctly
8. [x] **Implement freehand drawing** - SVG overlay layer working with smooth Bezier curves, real-time rendering, and drawing persistence in state
8a. [ ] **Add drawing database persistence** - Save drawings to database and reload on page refresh
8b. [ ] **Add drawing delete/erase** - Allow users to delete individual drawing strokes
8c. [ ] **Add drawing color/width controls** - Toolbar controls for stroke color and width
9. [x] **Add secondary shape picker bar** - Bottom toolbar with all 7 shapes, appears when shape tool is active, fully functional
10. [x] **Add color palette** - Bottom toolbar with 10 preset color swatches, fully functional with instant color changes
10a. [x] **Fix selection state management** - Added onSelectionChange to track selected nodes for toolbar actions
11. [x] **Implement Line and Arrow tools** - Click-to-connect mode using ReactFlow edges, straight lines and arrows with gray styling
12. [x] **Implement Text tool** - Click-to-place text boxes with transparent background, dashed border, inline editing
12a. [x] **Implement Sticky Note tool** - Yellow sticky notes with shadow, brown text, inline editing
13. [x] **Implement Image tool** - Image upload with file picker, S3 storage, display as nodes with object-fit cover
14. [x] **Test page refresh persistence** - Nodes reload correctly with all properties (shape, color, position, size)
15. [ ] **Comprehensive manual QA testing** - Test all interactions with real mouse/keyboard
16. [ ] **Optimize whiteboard UX** - Make interactions feel natural like a real whiteboard



## User-Requested Changes (Oct 26, 2025)

- [x] **Add Eraser tool** - Tool to delete individual drawing strokes by clicking on them (with keyboard shortcut 'E')
- [x] **Remove default node labels** - New nodes now start with empty text instead of "Rectangle", "Circle", etc.



## Phase 5: UX Optimization Tasks

- [ ] **Add connection preview** - Show temporary line while selecting target node for Line/Arrow tools
- [ ] **Improve cursor feedback** - Show appropriate cursors for each tool (crosshair, pointer, grab, etc.)
- [ ] **Add visual feedback for connection mode** - Highlight source node when in connection mode
- [ ] **Add undo/redo functionality** - Ctrl+Z/Ctrl+Y for node/edge/drawing operations
- [ ] **Optimize drawing performance** - Reduce path points for smoother rendering
- [ ] **Add keyboard shortcut hints** - Show keyboard shortcuts in tool tooltips
- [ ] **Add loading states** - Show loading indicator during image upload
- [ ] **Add error handling** - Display user-friendly error messages
- [ ] **Add canvas zoom controls** - Better zoom in/out/fit view controls
- [ ] **Add grid snapping** - Optional grid snap for precise alignment
- [ ] **Add node alignment guides** - Show alignment lines when dragging nodes
- [ ] **Add export improvements** - Better PNG/JPEG/SVG export quality




## Brand Implementation (From Brand Kit PPT)

### Color Palette
- [x] **Update primary colors** - Replaced with Galactic Purple (#5b21b6) as primary
- [x] **Add secondary colors** - Added Cyan (#18f0fc), Purple (#ad18fc), Pink (#eb00ff)
- [x] **Add tertiary colors** - Added Dark Purple (#410081), Gray (#888b8c)
- [x] **Update Flow Builder color palette** - Replaced with 10 brand colors including primary, secondary, tertiary, white, black, and accents

### Typography
- [x] **Install Montserrat font** - Imported from Google Fonts, set as primary font family
- [x] **Update headings** - Using Montserrat Bold for all h1-h6
- [ ] **Update subheadings** - Use Montserrat SemiBold (applied via font-bold class)
- [x] **Update body text** - Using Montserrat Regular globally
- [ ] **Update emphasis text** - Use Montserrat Medium Italic (available via font classes)

### Logo & Branding
- [ ] **Update app logo** - Use GTM Planetary orbital logo (white version for dark backgrounds)
- [ ] **Add logo to sidebar** - Replace current logo with brand logo
- [ ] **Update favicon** - Use orbital symbol
- [ ] **Add brand colors to sidebar** - Use Galactic Purple background

### UI/UX Alignment
- [ ] **Clean, minimal design** - Ensure ample white space throughout
- [ ] **Incorporate orbital/circular elements** - Add orbital theme to UI components
- [ ] **Update button styles** - Use secondary colors for CTAs (Cyan, Purple, Pink)
- [ ] **Update data visualizations** - Use brand colors for charts/graphs

### Brand Voice (Content Updates)
- [ ] **Update copy to be direct and bold** - Remove fluff, add confidence
- [ ] **Add witty touches** - Where appropriate, add intelligent humor
- [ ] **Make CTAs actionable** - Focus on practical, implementable solutions
- [ ] **Use operator language** - Talk like operators, not consultants




## User Request (Oct 26, 2025)

- [x] **Revert Flow Builder node colors** - Changed back to original colors (blue, red, green, orange, yellow, purple, pink, cyan, gray, dark) while keeping brand colors for rest of app

