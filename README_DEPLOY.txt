============================================
ContactsCRUD — Deployment & Setup Guide
============================================

This guide explains how to download, build, and run the
ContactsCRUD application on your local machine.

--------------------------------------------------------------
PREREQUISITES
--------------------------------------------------------------

1. Install .NET SDK 8.0 or later
   └── https://dotnet.microsoft.com/en-us/download/dotnet/8.0

2. (Optional) Install Visual Studio Code
   └── https://code.visualstudio.com/
   └── Recommended extensions:
       ├── C# Dev Kit (ms-dotnettools.csdevkit)
       └── ASP.NET Core Snippets

3. No database server needed — SQLite is built-in.

--------------------------------------------------------------
QUICK START (5 minutes)
--------------------------------------------------------------

Step 1 — Download the project
──────────────────────────────
  • Download the ZIP archive from GitHub
  • Extract it to a folder (e.g. C:\Projects\ContactsCRUD)

Step 2 — Open in terminal
──────────────────────────
  Open Command Prompt or PowerShell and navigate to the folder:

      cd C:\Projects\ContactsCRUD

Step 3 — Build the project
───────────────────────────
      dotnet build

  You should see: "Сборка успешно завершена." (Build succeeded)

Step 4 — Run the application
─────────────────────────────
      dotnet run

  The app will start and output something like:
      Now listening on: http://localhost:5000

Step 5 — Open in browser
─────────────────────────
  Open your browser and go to:
      http://localhost:5000

  The application will:
  ├── Create the SQLite database file (contacts.db) automatically
  ├── Seed it with 10 random contacts via DataSeeder
  └── Show the contact management page

--------------------------------------------------------------
USING VISUAL STUDIO CODE (RUN WITH F5)
--------------------------------------------------------------

1. Open the project folder in VS Code:

       File → Open Folder → select ContactsCRUD

2. Press F5 (or Run → Start Debugging)

3. Select "Launch via .NET (http)" profile

4. VS Code will build and launch the app, then open
   your default browser at http://localhost:5000

Note: If you get a build error saying "file is locked",
      close any running terminals and try again.

--------------------------------------------------------------
APPLICATION PORTS
--------------------------------------------------------------

  The application runs on:
  ├── http://localhost:5000  (main address)
  └── Can be changed in Properties/launchSettings.json

--------------------------------------------------------------
DATABASE
--------------------------------------------------------------

  • File: contacts.db (created in the project root)
  • Type: SQLite (serverless, file-based)
  • Created automatically on first launch
  • No migrations needed — schema is auto-generated

  To reset the database:
      1. Stop the application
      2. Delete contacts.db (and contacts.db-shm / contacts.db-wal)
      3. Restart the application

  Seed data (10 contacts) is inserted only when the
  database is first created. Existing data is never overwritten.

--------------------------------------------------------------
API ENDPOINTS (for developers)
--------------------------------------------------------------

  GET    /api/contacts              List contacts (with pagination + filters)
  GET    /api/contacts/{id}         Get single contact
  POST   /api/contacts              Create contact
  PUT    /api/contacts/{id}         Update contact
  DELETE /api/contacts/{id}         Delete contact
  GET    /api/contacts/phone-unique Check phone uniqueness

  Query parameters for GET /api/contacts:
  ┌────────────┬──────────┬──────────────────────────────────┐
  │ Parameter  │ Default  │ Description                      │
  ├────────────┼──────────┼──────────────────────────────────┤
  │ page       │ 1        │ Page number                      │
  │ pageSize   │ 5        │ Items per page (5/10/20/50)      │
  │ search     │ (empty)  │ Search by name or phone          │
  │ countryCode│ (empty)  │ Filter by phone prefix (+1, etc) │
  │ jobTitle   │ (empty)  │ Filter by job title              │
  │ sortBy     │ "name"   │ Sort field (name/country/created)│
  │ sortDesc   │ false    │ Sort descending (true/false)     │
  └────────────┴──────────┴──────────────────────────────────┘

--------------------------------------------------------------
PROJECT CONFIGURATION
--------------------------------------------------------------

  ├── Change page size default:
      Edit wwwroot/js/site.js → let pageSize = 5;

  ├── Change seed contact count:
      Edit Data/AppDbContext.cs →
          DataSeeder.GenerateContacts(10)

  ├── Change database file location:
      Edit Program.cs → "Data Source=contacts.db"

  ├── Change port:
      Edit Properties/launchSettings.json →
          "applicationUrl": "http://localhost:5000"

--------------------------------------------------------------
TROUBLESHOOTING
--------------------------------------------------------------

  Problem: "The process cannot access the file... being used"
  Solution: Close all terminal windows and VS Code, reopen,
            then run dotnet build again.

  Problem: "dotnet is not recognized"
  Solution: Install .NET SDK 8.0 from
            https://dotnet.microsoft.com/en-us/download/dotnet/8.0
            and restart your terminal.

  Problem: "Unable to find package Microsoft.EntityFrameworkCore.Sqlite"
  Solution: Run dotnet restore in the project folder.

  Problem: "No contacts appear on page"
  Solution: Delete contacts.db and restart the app —
            it will be recreated with seed data.

--------------------------------------------------------------
SUPPORTED PLATFORMS
--------------------------------------------------------------

  ├── Windows 10/11 (tested)
  ├── Linux (Ubuntu 20.04+, .NET compatible)
  └── macOS (.NET compatible)

  .NET 8.0 runs on all major operating systems.

--------------------------------------------------------------