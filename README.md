# MentorHub Frontend

AI-powered mentorship platform frontend built with Next.js 14, TypeScript, Tailwind CSS, TanStack Query, Zustand, and React Hook Form.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand (auth) |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Toast | react-hot-toast |
| HTTP | Axios |
| Icons | Lucide React |

## Project Structure

```
app/
  page.tsx                  # Landing page
  layout.tsx                # Root layout
  auth/login/               # Login page
  auth/register/            # Register page
  mentors/                  # Mentor listing with filters
  mentors/[id]/             # Mentor detail + booking
  dashboard/user/           # User dashboard (7 tabs)
  dashboard/mentor/         # Mentor dashboard (6 tabs)
  dashboard/admin/          # Admin dashboard (7 tabs)
  bookings/                 # My bookings page
  notifications/            # Notifications page
  profile/                  # User profile
  about/                    # About page
  blog/                     # Blog page
  contact/                  # Contact page
components/
  layout/Navbar.tsx         # Responsive navbar with auth
  layout/DashboardLayout.tsx # Sidebar layout
  layout/Providers.tsx      # QueryClient provider
  mentor/MentorCard.tsx     # Mentor card + skeleton
  booking/BookingModal.tsx  # Book session modal
  booking/ReviewModal.tsx   # Leave review modal
  ai/ChatWidget.tsx         # Floating AI chat
  dashboard/StatsChart.tsx  # Bar, Line, Pie charts
  ui/index.tsx              # All reusable UI components
hooks/
  useAuth.ts                # Auth hook
  useMentors.ts             # Mentor queries
  useBookings.ts            # Booking mutations
  useReviews.ts             # Review queries
  useNotifications.ts       # Notification queries
  useAnalytics.ts           # Analytics queries
  useAI.ts                  # All 5 AI feature hooks
lib/
  api.ts                    # Axios instance + interceptors
  utils.ts                  # Helpers, formatters
store/
  auth.ts                   # Zustand auth store (persisted)
types/
  index.ts                  # All TypeScript interfaces
```

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set environment variable
```bash
# .env.local (already set)
NEXT_PUBLIC_API_URL=https://mentorhub-backend-ai.onrender.com/api
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4. Build for production
```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://mentorhub-backend-ai.onrender.com/api`
4. Deploy

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| User | demo@mentorhub.io | demo1234 |
| Admin | admin@mentorhub.io | Admin1234! |

Both are pre-filled via the "Demo Login" and "Admin Login" buttons on the login page.

## AI Features

| Feature | Endpoint | Description |
|---|---|---|
| AI Mentor Recommendations | GET /ai/recommendations | Personalized mentor picks |
| AI Smart Match | POST /ai/match | Goal-based mentor matching |
| AI Chat Assistant | POST /ai/chat | 24/7 floating chat widget |
| AI Sentiment Analysis | POST /ai/sentiment | Text sentiment analysis |
| AI Market Insights | GET /ai/insights | Platform trend analysis |

## Pages Overview

| Page | Route | Auth |
|---|---|---|
| Landing | / | Public |
| Explore Mentors | /mentors | Public |
| Mentor Detail | /mentors/[id] | Public |
| Login | /auth/login | Guest |
| Register | /auth/register | Guest |
| User Dashboard | /dashboard/user | User |
| Mentor Dashboard | /dashboard/mentor | Mentor |
| Admin Dashboard | /dashboard/admin | Admin |
| My Bookings | /bookings | User |
| Notifications | /notifications | User |
| Profile | /profile | User |
| About | /about | Public |
| Blog | /blog | Public |
| Contact | /contact | Public |
