# Study-Spark

An AI-powered study platform that helps students analyze research papers, generate exam notes, and understand previous year question patterns.

## Features

- 📚 **Research Papers**: Upload and analyze academic research papers
- 📝 **Exam Notes**: Generate AI-powered study materials and flashcards
- 📊 **PYQ Analysis**: Analyze previous year questions to identify patterns
- 💬 **AI Study Chat**: Interactive chat with your study materials

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database, Auth, Storage)
- **AI**: OpenAI API

## Getting Started

### Prerequisites

- Node.js v18+ and npm
- Supabase account
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Flowmind-hm/study-spark.git

# Navigate to the project directory
cd study-spark

# Install dependencies
npm install

# Set up environment variables in .env file:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Start the development server
npm run dev
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/       # React components
├── contexts/        # React contexts (Auth, etc.)
├── hooks/           # Custom React hooks
├── integrations/    # External integrations (Supabase)
├── lib/             # Utility functions
└── pages/           # Page components
```

## Technologies

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Deployment

You can deploy this project to:
- Vercel
- Netlify  
- Any static hosting service

## License

MIT
