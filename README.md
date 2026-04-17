# MILAN AI (MeetAI) - Version 2.0

MILAN AI (MeetAI) is an advanced AI-powered meeting assistant built to streamline your virtual meetings, providing real-time AI capabilities, transcription, meeting summaries, and much more. Version 2.0 brings a modernized tech stack for enhanced performance, scalability, and user experience.

## 🚀 Features

- **Video Conferencing:** High-quality video calls powered by Stream Video.
- **Real-time AI Assistant:** Interact with an AI during meetings (powered by OpenAI / Google GenAI).
- **Background Processing:** Reliable background jobs for meeting processing, summaries, and notifications using Inngest.
- **Modern Authentication:** Secure and seamless user authentication via Better Auth.
- **Subscriptions & Billing:** Integrated payments and subscriptions handled by Polar.
- **Sleek UI:** Beautiful, accessible, and responsive user interface built with Tailwind CSS v4 and Radix UI components (Shadcn-like).
- **Robust API:** Type-safe API layer built with tRPC.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Authentication:** Better Auth
- **Database ORM:** Drizzle ORM
- **Database Provider:** Neon (Serverless Postgres)
- **API & Data Fetching:** tRPC + TanStack React Query
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI (`@radix-ui/react-*`), Lucide Icons
- **Video & Chat:** Stream Video SDK, Stream Chat
- **AI Integrations:** OpenAI, Google Generative AI, Stream OpenAI Realtime API
- **Background Jobs:** Inngest
- **Payments:** Polar
- **Package Manager:** npm

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v20 or higher recommended)
- npm

You will also need accounts and API keys for the following services:
- [Neon](https://neon.tech/) (Postgres Database)
- [Better Auth](https://better-auth.com/) (if applicable cloud setup is needed)
- [OpenAI](https://openai.com/) / [Google Gen AI](https://aistudio.google.com/)
- [Stream](https://getstream.io/)
- [Inngest](https://www.inngest.com/)
- [Polar.sh](https://polar.sh/) (for payments)

## 📦 Local Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/MILAN-AI-Version_2.0.git
   cd MILAN-AI-Version_2.0-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add all necessary environment variables (Database URL, Stream API keys, OpenAI keys, Inngest keys, Polar configurations, etc.).

4. **Database Configuration:**
   Push the database schema to your Neon database using Drizzle:
   ```bash
   npm run db:push
   ```
   *Optional: You can view your database via Drizzle Studio:*
   ```bash
   npm run db:studio
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   
   *Note: For full end-to-end functionality including webhooks, you may need to run `npm run dev:webhook` (ngrok tunneling) and have the Inngest local dev server running.*

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

## 📜 Scripts

- `npm run dev` - Starts the Next.js development server.
- `npm run build` - Builds the app for production.
- `npm run start` - Starts the production server.
- `npm run lint` - Runs ESLint.
- `npm run db:push` - Pushes schema changes to the database via Drizzle Kit.
- `npm run db:studio` - Opens Drizzle Studio to browse database contents.
- `npm run dev:webhook` - Starts an ngrok tunnel on port 3000 for webhook testing.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[Specify License Here - e.g., MIT License]
