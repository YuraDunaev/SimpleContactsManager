========================================
ContactsCRUD — Application Overview
========================================

ContactsCRUD is a full-featured web application for managing personal contacts.
Built with modern .NET technologies and a clean, responsive UI.

--------------------------------------------------------------
TECHNOLOGIES USED
--------------------------------------------------------------

├── Backend
│   ├── ASP.NET Core 8.0 (MVC + Web API)
│   ├── Entity Framework Core 8.0 (ORM)
│   ├── SQLite (local file-based database, no server required)
│   └── RESTful API architecture (JSON over HTTP)
│
├── Frontend
│   ├── Bootstrap 5 (responsive layout)
│   ├── Bootstrap Icons (icon set)
│   ├── Vanilla JavaScript (ES2017+ async/await)
│   └── HTML5 + CSS3 (custom gradients, animations, flexbox)
│
├── Tooling
│   ├── Visual Studio Code (recommended)
│   ├── .NET 8.0 SDK
│   └── Launch profiles for VS Code (F5 debug support)

--------------------------------------------------------------
FEATURES & ADVANTAGES
--------------------------------------------------------------

1. COMPLETE CRUD FUNCTIONALITY
   ├── Add new contacts via popup modal
   ├── Edit existing contacts inline
   ├── Delete contacts with confirmation dialog
   └── All changes saved to SQLite database immediately

2. SMART PAGINATION
   ├── Configurable page size (5 / 10 / 20 / 50 items per page)
   ├── Dynamic page numbers with ellipsis for large datasets
   ├── Shows exact range on current page (e.g. "6–10 of 15")
   └── Automatically adjusts when filtering or deleting items

3. SEARCH & FILTER SYSTEM
   ├── Real-time text search by name or phone number (debounced)
   ├── Country code filter with 14 popular country codes
   ├── Job title text filter
   └── Reset filters button + live counter of filtered results

4. COLUMN SORTING
   ├── Click-to-sort on Name, Mobile Phone, and Created date
   ├── Toggle ascending / descending with visual arrow icons
   └── Server-side sorting works with pagination + filters

5. PHONE UNIQUENESS VALIDATION
   ├── Live uniqueness check while typing in the add/edit modal
   ├── Green checkmark when phone is available
   ├── Red warning when phone is already in use
   ├── Server-side validation via custom attribute [UniquePhone]
   └── Database-level unique index on MobilePhone column

6. CLIENT-SIDE FORM VALIDATION (JavaScript)
   ├── Name: required, 2–100 chars, letters/spaces/hyphens only
   ├── Phone: required, 10–15 digits, optional leading +
   ├── Birth Date: required, not in the future, not before 1900
   ├── Job Title: optional, max 100 chars
   └── Real-time error clearing on input

7. SERVER-SIDE VALIDATION (DataAnnotations)
   ├── All validation rules mirrored on the backend
   ├── ModelState validation with detailed error responses
   └── Custom UniquePhoneAttribute checking database

8. LOCAL DATABASE (SQLite)
   ├── No database server installation required
   ├── Single file (contacts.db) — easy to backup or copy
   ├── Auto-created on first launch with seed data
   └── All data stays on your machine — fully private

9. MODERN UI/UX
   ├── Gradient backgrounds and card-style panels
   ├── Smooth hover effects and ripple button animations
   ├── Animated table rows (fade-in on load)
   ├── Toast notifications (positioned top-center, high z-index)
   ├── Centered popup modals for add/edit/delete
   ├── Responsive layout (mobile-friendly with collapsible filters)
   └── Styled pagination with gradient active states

10. DEVELOPER FRIENDLY
    ├── RESTful API at /api/contacts for easy integration
    ├── Separate concerns: Models, Data, Controllers, Views
    ├── VS Code launch configuration included (F5 to run)
    └── Dynamic DataSeeder with 40 first names × 40 last names

--------------------------------------------------------------
PROJECT STRUCTURE
--------------------------------------------------------------

ContactsCRUD/
├── Controllers/
│   ├── ContactsController.cs    # REST API (CRUD + search + sort)
│   └── HomeController.cs        # MVC pages
├── Data/
│   ├── AppDbContext.cs          # EF Core context + seeding
│   └── DataSeeder.cs            # Dynamic contact generator
├── Models/
│   ├── Contact.cs               # Contact entity with validation
│   └── ErrorViewModel.cs        # Error page model
├── Views/
│   ├── Home/
│   │   ├── Index.cshtml         # Main contacts page
│   │   └── Privacy.cshtml       # Privacy policy page
│   └── Shared/
│       └── _Layout.cshtml       # Layout with styled footer
├── wwwroot/
│   ├── css/site.css             # All custom styles
│   └── js/site.js               # All client-side logic
├── Properties/
│   └── launchSettings.json      # Port 5000 config
├── .vscode/
│   ├── launch.json              # VS Code debug config
│   └── tasks.json               # Build task for F5
└── Program.cs                   # App entry point