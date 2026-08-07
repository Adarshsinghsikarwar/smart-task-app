# Smart Task & Reminder App

Full-stack task manager with authentication, dashboard, CRUD tasks, search/filter/sort, email reminders (Brevo), and AI-powered task creation/triage.

## Structure

```
smart-task-app/
├── backend/          Node.js + Express + MongoDB API (JWT auth, tasks, reminders)
├── web/              Next.js frontend (dashboard, tasks, auth)
└── React_Expo/
    └── mobile/       React Native & Expo mobile application
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your MongoDB URI, JWT secret, email credentials
npm run dev
```

Runs on `http://localhost:5000`.

### API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Get logged-in user (protected) |
| POST | /api/auth/forgot-password | Request password reset email |
| POST | /api/auth/reset-password/:token | Reset password with token |
| GET | /api/tasks | List tasks (supports `search`, `priority`, `category`, `completed`, `sortBy`, `order`, `page`, `limit`) |
| POST | /api/tasks | Create task |
| GET | /api/tasks/:id | Get one task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/tasks/stats/dashboard | Dashboard counts + upcoming reminders |
| POST | /api/ai/parse-task | Turn a plain sentence into a structured task `{ title, description, dueDate, priority, category }` |
| POST | /api/ai/suggest | Suggest `priority` + `category` for a title/description |

Reminders are checked every minute by a cron job (`utils/reminderScheduler.js`) and sent via **Brevo's transactional email API** (`utils/sendEmail.js`).

### Email reminders — Brevo setup

1. Create a free account at [brevo.com](https://www.brevo.com).
2. Go to **Settings → SMTP & API → API Keys** and generate a key.
3. Verify a sender email/domain under **Senders & IP**.
4. Set in `.env`:
   ```
   BREVO_API_KEY=xkeysib-xxxxxxxx
   BREVO_SENDER_EMAIL=you@yourdomain.com
   BREVO_SENDER_NAME=Smart Task App
   ```

### AI feature — setup

The app uses AI in two places:
- **Quick Add** (Tasks page) — type a plain sentence like *"Submit client report by Friday 5pm, high priority"* and AI turns it into a full task (title, description, due date, priority, category), then creates it.
- **Suggest** (task form) — click "✨ AI: suggest priority & category" while creating/editing a task to get an AI-recommended priority and category based on the title/description.

Supports **OpenAI**, **Google Gemini**, or **Anthropic Claude** — pick one via `AI_PROVIDER` in `.env`:

```
AI_PROVIDER=openai        # openai | gemini | claude
AI_API_KEY=sk-xxxxxxxx    # the API key for whichever provider you chose
```

Provider docs for getting a key: [OpenAI](https://platform.openai.com/api-keys), [Google AI Studio (Gemini)](https://aistudio.google.com/apikey), [Anthropic Console (Claude)](https://console.anthropic.com/settings/keys).

## Web Frontend Setup

```bash
cd web
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

Runs on `http://localhost:3000`.

## Deployment

- **Backend** → Render or Railway (set the same env vars as `.env`)
- **Database** → MongoDB Atlas (whitelist `0.0.0.0/0` or your host's IP for testing)
- **Web** → Vercel (set `NEXT_PUBLIC_API_URL` to your deployed backend URL)

## Mobile App (React Native / Expo)

The mobile app is located in [React_Expo/mobile](file:///c:/Users/admin/Downloads/smart-task-app/React_Expo/mobile) and is built using React Native and Expo. It connects dynamically to the local backend during development and the Render backend in production builds.

### Setup & Running Locally

1. Navigate to the mobile directory:
   ```bash
   cd React_Expo/mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```

### Building the APK
To build and run an installable `.apk` file for Android devices or emulators, refer to the detailed [BUILD_INSTRUCTIONS.md](file:///c:/Users/admin/Downloads/smart-task-app/React_Expo/mobile/BUILD_INSTRUCTIONS.md):
* Build command: `eas build --platform android --profile preview`
* Install command: `eas build:run -p android`

## Notes

- Passwords are hashed with bcrypt; never stored in plain text.
- JWT is required on all `/api/tasks/*` routes via the `protect` middleware.
- Full-text search on tasks uses a MongoDB text index on `title` + `description`.
