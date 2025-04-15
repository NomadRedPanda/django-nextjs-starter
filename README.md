# Django Next.js Boilerplate

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A robust boilerplate for building web applications featuring a Django backend API and a Next.js (App Router) frontend. Includes JWT authentication with automatic token refresh using HttpOnly cookies.

## Features

- **Backend:** Django (API)
- **Frontend:** Next.js 14+ (App Router)
- **Authentication:** JWT-based authentication (Access & Refresh Tokens).
  - Secure token storage using `HttpOnly` cookies.
  - Automatic token refresh handling on the frontend.
- **API Handling:**
  - Next.js API route (`/api/[...path]`) acting as a proxy to the Django backend.
  - `TokenFetch` utility in Next.js to automatically attach/refresh tokens for API calls.
- **Styling:** Tailwind CSS with `clsx` and `tailwind-merge`.
- **Data Fetching:** `SWR` integrated for client-side data fetching.
- **Development:**
  - Clear setup instructions.
  - Environment variable configuration (`.env` for backend, `.env.local` for frontend).
  - Uses `rav` for streamlined task execution (installation, running dev servers).
- **Utilities:** Includes `urlJoin` helper for constructing backend URLs correctly.

## Tech Stack

- **Backend:** Python, Django, Django REST Framework (presumed for API/JWT)
- **Frontend:** React, Next.js, Tailwind CSS, SWR
- **Package Management:** `pip` / `pip-tools` (Backend), `npm` / `yarn` (Frontend)
- **Task Runner:** `rav`

## Prerequisites

- Git
- Python (Version 3.12+ recommended based on setup instructions)
- Node.js (LTS version recommended) and `npm` or `yarn`
- rav (Python task runner - installation included in setup)

## Getting Started

Follow these steps to get your development environment up and running:

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/YOUR_USERNAME/google-docs-django-nextjs.git # Replace with your repo URL
    cd google-docs-django-nextjs
    ```

2.  **Backend Setup (Django):**

    - Navigate to the backend directory (assuming it's named `backend` or similar - adjust if needed):
      ```bash
      # cd backend
      ```
    - Create and activate a Python virtual environment:
      ```bash
      python3.12 -m venv venv
      source venv/bin/activate
      # On Windows use `venv\Scripts\activate`
      ```
    - Install core dependencies including `rav`:
      ```bash
      pip install rav pip-tools
      ```
    - Install project-specific backend dependencies using `rav`:
      ```bash
      rav run api-install
      ```
    - Create a `.env` file in the backend directory and add necessary environment variables (see Environment Variables below).
      ```env
      # backend/.env
      SECRET_KEY='your-super-secret-django-key'
      DEBUG=True
      DATABASE_URL='sqlite:///db.sqlite3' # Or your PostgreSQL/MySQL URL
      # Add other backend variables (CORS origins, etc.)
      ```
    - Run database migrations:
      ```bash
      python manage.py migrate
      ```
    - Start the Django development server (usually on port 8000):
      ```bash
      python manage.py runserver
      ```

3.  **Frontend Setup (Next.js):**

    - Navigate to the frontend directory:
      ```bash
      cd ../frontend
      # Or from the root: cd frontend
      ```
    - Install frontend dependencies using `rav`:
      ```bash
      rav run frontend-install
      # Alternatively, if rav isn't configured for this or you prefer:
      # npm install
      # or
      # yarn install
      ```
    - Create a `.env.local` file in the `frontend` directory and add necessary environment variables (see Environment Variables below).
      ```env
      # frontend/.env.local
      DJANGO_API_URL=http://127.0.0.1:8000/api # URL of your Django API
      APPEND_SLASH=true # Or false, controls trailing slashes in urlJoin
      ```
      _Note: Ensure `DJANGO_API_URL` points to your running Django backend API endpoint._
    - Start the Next.js development server (usually on port 3000):
      ```bash
      rav run ui
      # Alternatively:
      # npm run dev
      # or
      # yarn dev
      ```

4.  **Access the Application:**
    - Open your browser and navigate to `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

- `SECRET_KEY`: **Required.** Django's secret key for cryptographic signing.
- `DEBUG`: **Required.** Set to `True` for development, `False` for production.
- `DATABASE_URL`: **Required.** Database connection string (e.g., `sqlite:///db.sqlite3`, `postgres://user:pass@host:port/dbname`).
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts (e.g., `127.0.0.1,localhost`).
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of origins allowed to make cross-site requests (e.g., `http://localhost:3000,http://127.0.0.1:3000`).

### Frontend (`frontend/.env.local`)

- `DJANGO_API_URL`: **Required.** The full base URL of your Django backend API (e.g., `http://127.0.0.1:8000/api` or `https://yourdomain.com/api`). This is used by the Next.js server-side proxy and potentially client-side requests.
- `APPEND_SLASH`: (Optional) Controls whether `urlJoin` adds a trailing slash to generated URLs. Defaults to `true`. Set to `false` if your Django API doesn't use trailing slashes.
- `NEXT_PUBLIC_*`: Any variables prefixed with `NEXT_PUBLIC_` will be exposed to the browser.

## Project Structure

google-docs-django-nextjs/
├── backend/ # Django project root
│ ├── your_django_app/ # Your Django app(s)
│ ├── project_name/ # Django project settings (settings.py, urls.py, etc.)
│ ├── manage.py # Django CLI utility
│ ├── requirements/ # Dependency management
│ │ ├── base.in # pip-tools input (unlocked deps)
│ │ ├── base.txt # Locked base dependencies
│ │ └── ... # Other req files (e.g., dev.txt, prod.txt)
│ ├── venv/ # Virtual environment (Gitignored)
│ └── .env # Backend environment variables (Gitignored)
│
├── frontend/ # Next.js project root
│ ├── public/ # Static files
│ ├── src/ # App source code
│ │ ├── app/ # App Router directory (Next.js 13+)
│ │ │ ├── (auth)/ # Auth pages (login, signup, etc.)
│ │ │ ├── (main)/ # Main app pages
│ │ │ ├── api/ # Next.js API routes
│ │ │ │ ├── auth/ # Login/logout/refresh routes
│ │ │ │ └── [...path]/ # Proxy API to Django backend
│ │ │ ├── layout.tsx # Root layout component
│ │ │ └── page.tsx # Root page component
│ │ ├── components/ # Reusable UI components
│ │ ├── contexts/ # React Contexts (e.g., AuthContext)
│ │ ├── hooks/ # Custom React hooks
│ │ ├── lib/ # Utility functions and helpers
│ │ │ ├── auth.ts # Auth logic (tokens, wrapper fetch)
│ │ │ ├── fetcher.ts # SWR/base fetch functions
│ │ │ └── utils.ts # General-purpose utilities
│ │ └── styles/ # Global styles and CSS modules
│ ├── node_modules/ # Node dependencies (Gitignored)
│ ├── next.config.js # Next.js config
│ ├── postcss.config.js # PostCSS config
│ ├── tailwind.config.js # Tailwind CSS config
│ ├── package.json # NPM metadata and dependencies
│ ├── yarn.lock / package-lock.json # Dependency lock file
│ └── .env.local # Frontend environment variables (Gitignored)
│
├── .gitignore # Git ignore rules
├── rav.yaml # rav task definitions (if used)
└── README.md # Project documentation

## Authentication Flow

1.  **Login:** The user submits credentials via a form on the Next.js frontend.
2.  **Request:** The frontend sends the credentials to a dedicated Next.js API route (e.g., `/api/login`).
3.  **Backend Call:** The Next.js `/api/login` route forwards the credentials to the Django backend's login endpoint (e.g., `/api/login/` or `/api/token/`).
4.  **Token Issuance:** If credentials are valid, Django generates a JWT `access` token and a `refresh` token.
5.  **Response:** Django sends the tokens back to the Next.js `/api/login` route.
6.  **Cookie Storage:** The Next.js `/api/login` route securely stores the received `access` and `refresh` tokens in `HttpOnly` cookies (`auth-token`, `auth-refresh-token`). It sends a success response (without the tokens) back to the frontend client.
7.  **Authenticated Requests:**
    - Subsequent requests from the Next.js frontend to its own API proxy (`/api/[...path]/`) are made.
    - The `TokenFetch` utility (used within the proxy route) automatically reads the `access` token from the request's cookies (forwarded by the browser) and adds it as an `Authorization: Bearer <token>` header to the request sent to the Django backend.
8.  **Token Expiry & Refresh:**
    - If the Django backend responds with a `401 Unauthorized` (indicating an expired access token), the `TokenFetch` utility catches this.
    - It automatically triggers a request (using the `refresh` token from the cookies) to the Django backend's refresh endpoint (e.g., `/api/token/refresh/`).
    - If successful, Django issues a new `access` token (and potentially a new `refresh` token).
    - `TokenFetch` updates the `HttpOnly` cookies with the new tokens via the Next.js server-side context.
    - `TokenFetch` retries the original failed request with the new `access` token.
9.  **Logout:** A request is sent to a Next.js API route (e.g., `/api/logout`) which clears the `HttpOnly` cookies.

## API Proxy (`/api/[...path]/route.js`)

This Next.js API route acts as a backend-for-frontend (BFF).

- **Purpose:** It catches all requests made to `/api/*` from the Next.js frontend.
- **Functionality:**
  - It reconstructs the intended Django API URL.
  - It uses `TokenFetch` to automatically handle attaching the current access token to the outgoing request.
  - It forwards the request (method, headers, body) to the actual Django backend API.
  - It handles potential token refresh logic if the initial request fails due to an expired token.
  - It returns the response from the Django backend back to the Next.js client.
- **Benefits:**
  - Keeps the Django API URL configuration server-side.
  - Provides a single point for handling authentication logic (token attachment/refresh) before requests hit the backend.
  - Simplifies client-side fetching logic.

## Deployment

_(Add deployment guidance specific to your chosen platforms, e.g., Vercel for Next.js, Heroku/Render/AWS for Django)_

- **Frontend (Next.js):** Platforms like Vercel or Netlify offer seamless deployment from your Git repository. Ensure environment variables (like `DJANGO_API_URL` pointing to your _deployed_ backend) are set in the deployment platform's settings.
- **Backend (Django):** Deploy using platforms like Heroku, Render, AWS Elastic Beanstalk, or DigitalOcean App Platform. Remember to configure environment variables (`SECRET_KEY`, `DATABASE_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` pointing to your deployed frontend URL, `DEBUG=False`). Ensure your web server (e.g., Gunicorn) and potentially a reverse proxy (e.g., Nginx) are set up correctly.

## Contributing
