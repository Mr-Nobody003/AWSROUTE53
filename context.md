# Project Context: AWS Route53 Clone

## Overview
This project is a functional clone of the AWS Route53 web application, focusing on Hosted Zones and DNS Record management.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React (icons)
- **Backend:** FastAPI (Python 3.12)
- **Database:** SQLite (local), Turso / libSQL (production ready)
- **Deployment Strategy:** Vercel Services (monorepo structure with `vercel.json` routing frontend to `/` and backend to `/api`)

## Project Structure

### `backend/`
- **`app/main.py`**: FastAPI entrypoint, sets up CORS, includes routers, and triggers database creation/seeding on startup.
- **`app/config.py`**: Manages environment variables (Turso tokens, JWT secrets, DB paths).
- **`app/database.py`**: Initializes the SQLAlchemy engine. Switches between local `sqlite:///` and production `sqlite+libsql://` based on Turso credentials.
- **`app/models.py`**: SQLAlchemy ORM models (`User`, `HostedZone`, `Record`). Auto-generates Route53-style IDs (e.g., `Z1234567890AB`).
- **`app/schemas.py`**: Pydantic models for request/response validation. Contains strict validation logic for DNS record values (IPv4 for A, IPv6 for AAAA, priority logic for MX/SRV, etc.).
- **`app/auth.py`**: Helper functions for bcrypt hashing and JWT generation.
- **`app/deps.py`**: FastAPI dependencies (`get_db`, `get_current_user` checking HTTP-only cookies).
- **`app/seed.py`**: Seeds a demo `admin` user and an `example.com` hosted zone on initial startup.
- **`app/routers/`**:
  - `auth.py`: Login/Logout and session checking.
  - `zones.py`: CRUD for Hosted Zones, prevents deletion if non-default records exist. Auto-creates default NS and SOA records on zone creation.
  - `records.py`: CRUD for DNS Records within a zone. Prevents CNAME conflicts and validates modification of default records.
  - `import_export.py`: Handles exporting zones to BIND/JSON and importing BIND zone files.

### `frontend/`
- **`app/`**: Next.js App Router files.
  - `layout.tsx`: Global layout containing navigation (TopNav, SideNav) and context providers.
  - `globals.css`: Tailwind imports and base styles.
  - `(auth)/login/page.tsx`: Login page calling `/api/auth/login`.
  - `hosted-zones/page.tsx`: List of Hosted Zones with creation and deletion flows.
  - `hosted-zones/[zoneId]/page.tsx`: Specific zone details displaying records and allowing record creation/modification.
  - `dashboard/`, `traffic-policies/`, etc.: Placeholders returning `<ComingSoon />`.
- **`middleware.ts`**: Protects all routes except `/login`. Redirects `/` to `/hosted-zones`.
- **`components/`**:
  - `data-table/DataTable.tsx`: Highly reusable table component supporting pagination, search, loading states, and custom cells.
  - `modals/`: `ConfirmDeleteModal`, `ZoneFormModal`, and `RecordFormModal` (slide-over UI matching Route53).
  - `layout/`: `TopNav.tsx` and `SideNav.tsx`.
  - `notifications/ToastProvider.tsx`: Context for displaying toast messages.
- **`lib/`**:
  - `api.ts`: Fetch wrapper handling standard `/api/` routing and error unwrapping.
  - `auth-context.tsx`: React Context managing the logged-in user state.
  - `types.ts`: TypeScript interfaces for the API responses.

## Key Design Decisions
- **Vercel Services**: `vercel.json` splits traffic between the Next.js and FastAPI apps within the same repository.
- **JWT Cookies**: Authentication uses HTTP-only cookies to ensure security and persistence without needing a separate session datastore.
- **Mocked Auth**: The app initializes with a default `admin` user (`Admin@123`).
- **Styling**: Tailwind CSS is heavily utilized to accurately replicate the dense, functional aesthetic of the console, including support for dynamic Light/Dark mode themes.
- **Form Modals**: DNS Record creation mimics standard cloud provider slide-over panels on the right side rather than a centered modal dialog.
- **Validation**: Strict record value validation mirrors the actual AWS Route53 behavior, validating format and preventing multiple CNAMEs.
- **Keyboard Shortcuts**: Implements power-user key bindings (`H`, `/`, `N`) for rapid navigation and resource creation.

## Current State
All core CRUD functionalities for Hosted Zones and Records are complete. The application is fully prepared for local development with SQLite and deployment to Vercel/Turso.
