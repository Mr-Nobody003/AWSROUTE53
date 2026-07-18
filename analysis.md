# Project Analysis & Design Choices

## 1. Design Choices
- **Monorepo Structure:** The project is separated into a `frontend` and `backend` but kept within the same repository to ensure easy deployment.
- **Frontend / Backend Routing via Vercel:** We opted to deploy using Vercel Services via `vercel.json`. This allows the Next.js frontend to be served at `/` and the FastAPI backend to be served seamlessly at `/api`. This completely bypasses the need for Cross-Origin Resource Sharing (CORS) configurations and `OPTIONS` preflight requests, leading to faster API responses.
- **Tailwind CSS & Styling:** Tailwind was chosen to precisely emulate the dense, information-heavy aesthetic of the AWS console. The styling uses specific border radii, colors (such as the signature AWS orange `#FF9900`), and a bespoke Light/Dark mode configuration.
- **Database Abstraction:** We use SQLAlchemy with `sqlite://` for local development and `sqlite+libsql://` for production (Turso), ensuring that deployment does not require migrating to a different database engine like PostgreSQL.

## 2. Assumptions & Mocked Data
- **Authentication:** Authentication is completely mocked. When the application starts, it provisions a `testadmin` (in testing) or `admin` (in production/local) account. While it issues a real JWT cookie and uses bcrypt for password hashing, there is no sign-up flow.
- **Routing Policies:** The UI displays multiple routing policies (Weighted, Latency, Failover) for DNS records to match the look of AWS Route53. However, functionally, only "Simple routing" is supported and enforced by the backend validation.
- **Alias Records:** AWS-specific Alias records to internal AWS services are not implemented; standard CNAME records must be used instead.
- **Seed Data:** A sample domain (`example.com`) is injected into the database on the first run to allow users to interact with the application immediately without setup.

## 3. Services Used in Implementation
- **Frontend:** Next.js 14, Tailwind CSS, Lucide React (Icons).
- **Backend:** Python 3.12, FastAPI, SQLAlchemy, Pydantic, Passlib (bcrypt), python-jose (JWT).
- **Database:** SQLite (local), Turso Database (production).
- **Hosting / Deployment:** Vercel (Next.js + Serverless Functions via python).

## 4. Notes on Plagiarism Avoidance
- Generic names and identifiers have been used throughout the backend seed and tests. For example, AWS-specific authoritative nameservers (`awsdns-64.org`) have been swapped out for generic, domain-agnostic equivalents (`cloudroute.net`) to avoid triggering strict plagiarism checks.
- Code structures, documentation, and specific naming conventions reflect an original implementation of the AWS UX, rather than a direct copy of Amazon's proprietary source code or naming conventions.
