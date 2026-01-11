# Study-Spark - Complete Project Documentation

## 📋 Project Overview

**Study-Spark** is an AI-powered intelligent study platform designed to help students:
- Analyze research papers and academic documents
- Generate exam notes, flashcards, and quizzes automatically
- Analyze Previous Year Questions (PYQ) to predict exam patterns
- Interactive AI chat with uploaded study materials

---

## 🏗️ Architecture Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React + TypeScript + Vite                                │  │
│  │  • Pages: Index, Research, Notes, PYQ, Auth               │  │
│  │  • Components: UI (shadcn), Chat, Upload, Cards           │  │
│  │  • Routing: React Router v6                               │  │
│  │  • State: React Context + TanStack Query                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ AUTHENTICATION│  │   DATABASE   │  │   STORAGE    │         │
│  │              │  │              │  │              │         │
│  │ • Email Auth │  │ • documents  │  │ • documents  │         │
│  │ • User Mgmt  │  │   table      │  │   bucket     │         │
│  │ • Sessions   │  │ • Metadata   │  │ • PDFs       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌─────────────────  EDGE FUNCTIONS  ───────────────────────┐  │
│  │                                                           │  │
│  │  1. upload-document     → Process & extract text         │  │
│  │  2. generate-study-materials → Create notes/flashcards   │  │
│  │  3. study-chat          → AI chat with documents         │  │
│  │  4. analyze-pyq         → Pattern analysis & predictions │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                      AI PROCESSING LAYER                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Lovable AI Gateway (Google Gemini 3 Flash)              │  │
│  │  • Natural Language Processing                            │  │
│  │  • Document Analysis                                      │  │
│  │  • Content Generation                                     │  │
│  │  • Pattern Recognition                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Pipeline

### 1. **Document Upload Pipeline**
```
User Uploads PDF/Document
         ↓
Frontend validates file (type, size)
         ↓
Calls upload-document Edge Function
         ↓
Stores file in Supabase Storage (documents bucket)
         ↓
Extracts text content from document
         ↓
Saves metadata to database (documents table)
         ↓
Returns document ID & extracted text
         ↓
UI confirms upload success
```

### 2. **Study Materials Generation Pipeline**
```
User requests notes/flashcards/quiz
         ↓
Frontend sends document ID + material type
         ↓
Edge Function: generate-study-materials
         ↓
Fetches document from database
         ↓
Sends extracted text to AI Gateway
         ↓
AI processes and generates structured content:
  • Notes: Markdown formatted summaries
  • Flashcards: Q&A pairs
  • Quiz: Multiple choice questions
         ↓
Returns generated materials
         ↓
Frontend renders with proper UI components
```

### 3. **AI Study Chat Pipeline**
```
User types question
         ↓
Frontend sends message + session ID + category
         ↓
Edge Function: study-chat
         ↓
Fetches relevant documents from database
         ↓
Builds context from document text
         ↓
Streams AI response in real-time
         ↓
Frontend displays chat messages
         ↓
Maintains conversation history
```

### 4. **PYQ Analysis Pipeline**
```
User uploads previous year questions
         ↓
Documents stored with category: "pyq"
         ↓
Edge Function: analyze-pyq
         ↓
AI analyzes patterns:
  • Topic frequency
  • Question types
  • Difficulty trends
  • Year-wise distribution
         ↓
Generates predictions for upcoming exams
         ↓
Returns analysis + visualizations data
         ↓
Frontend displays:
  • Timeline view
  • Comparative charts
  • Predictions panel
```

---

## 🛠️ Tech Stack Details

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.8.3 | Type Safety |
| Vite | 5.4.19 | Build Tool & Dev Server |
| React Router | 6.30.1 | Client-side Routing |
| TanStack Query | 5.83.0 | Data Fetching & Caching |
| Tailwind CSS | 3.4.17 | Styling |
| shadcn/ui | Latest | UI Components |
| Framer Motion | 12.25.0 | Animations |
| Lucide React | 0.462.0 | Icons |
| React Hook Form | 7.61.1 | Form Handling |
| Zod | 3.25.76 | Validation |
| Recharts | 2.15.4 | Data Visualization |
| React Markdown | 10.1.0 | Markdown Rendering |
| Mermaid | 11.12.2 | Diagram Rendering |

### **Backend (Supabase)**
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (50MB file limit)
- **Edge Functions**: Deno runtime
- **API**: REST & Realtime subscriptions

### **AI/ML**
- **Provider**: Lovable AI Gateway
- **Model**: Google Gemini 3 Flash Preview
- **Capabilities**: 
  - Text generation
  - Document analysis
  - Streaming responses
  - Structured output

---

## 📁 Project Structure

```
study-spark/
├── public/
│   └── robots.txt
├── src/
│   ├── assets/                    # Static assets
│   ├── components/
│   │   ├── auth/                  # Auth components
│   │   │   └── ProtectedRoute.tsx
│   │   ├── cards/                 # Feature cards
│   │   │   └── FeatureCard.tsx
│   │   ├── chat/                  # Chat interface
│   │   │   └── ChatInterface.tsx
│   │   ├── layout/                # Layout components
│   │   │   └── Header.tsx
│   │   ├── mermaid/               # Diagram components
│   │   │   └── MermaidDiagram.tsx
│   │   ├── pyq/                   # PYQ analysis components
│   │   │   ├── ComparativeView.tsx
│   │   │   ├── PredictionsPanel.tsx
│   │   │   ├── PYQUploadForm.tsx
│   │   │   ├── SubjectDashboard.tsx
│   │   │   └── TimelineView.tsx
│   │   ├── quiz/                  # Quiz & flashcards
│   │   │   ├── Flashcards.tsx
│   │   │   └── Quiz.tsx
│   │   ├── ui/                    # shadcn/ui components (40+ components)
│   │   └── upload/                # File upload
│   │       └── FileUpload.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication context
│   ├── hooks/
│   │   ├── useDocuments.ts        # Document management
│   │   ├── usePYQAnalysis.ts      # PYQ analysis logic
│   │   ├── useStudyChat.ts        # Chat functionality
│   │   └── useStudyMaterials.ts   # Material generation
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts          # Supabase client
│   │       ├── types.ts           # Database types
│   │       └── hooks/             # Supabase hooks
│   ├── lib/
│   │   └── utils.ts               # Utility functions
│   ├── pages/
│   │   ├── AuthPage.tsx           # Login/Signup
│   │   ├── Index.tsx              # Landing page
│   │   ├── NotesPage.tsx          # Notes generation
│   │   ├── PYQPage.tsx            # PYQ analysis
│   │   ├── ResearchPage.tsx       # Research papers
│   │   └── NotFound.tsx           # 404 page
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── supabase/
│   ├── functions/
│   │   ├── analyze-pyq/
│   │   │   └── index.ts
│   │   ├── generate-study-materials/
│   │   │   └── index.ts
│   │   ├── study-chat/
│   │   │   └── index.ts
│   │   └── upload-document/
│   │       └── index.ts
│   ├── migrations/                # Database migrations
│   │   ├── 20260111082211_*.sql   # Initial schema
│   │   ├── 20260111084220_*.sql   # Storage policies
│   │   └── 20260111090642_*.sql   # Additional tables
│   └── config.toml                # Supabase config
├── .env                           # Environment variables
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                 # Vite config
├── tailwind.config.ts             # Tailwind config
└── README.md                      # Project readme
```

---

## 🗄️ Database Schema

### **documents** Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  extracted_text TEXT,
  category TEXT DEFAULT 'general',  -- 'research', 'notes', 'pyq'
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### **Storage Buckets**
- **documents**: Stores uploaded PDF files
  - Max file size: 50MB
  - Access: Authenticated users
  - Policies: Insert, Select, Delete

---

## ⚙️ Environment Configuration

### Required Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# Edge Functions Environment (Supabase Dashboard)
LOVABLE_API_KEY=your-lovable-ai-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🚀 Deployment Pipeline

### **Development**
```bash
npm install          # Install dependencies
npm run dev         # Start dev server (localhost:8080)
```

### **Production Build**
```bash
npm run build       # Build for production (dist/)
npm run preview     # Preview production build
```

### **Deployment Options**

#### **1. Vercel** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### **2. Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### **3. Supabase Edge Functions**
```bash
# Install Supabase CLI
npm i -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-id

# Deploy functions
supabase functions deploy upload-document
supabase functions deploy generate-study-materials
supabase functions deploy study-chat
supabase functions deploy analyze-pyq
```

---

## 🔐 Security Features

1. **Authentication**
   - Email/Password authentication
   - Session management with auto-refresh
   - Protected routes

2. **Row Level Security (RLS)**
   - Storage policies for document access
   - User-scoped data isolation

3. **API Security**
   - CORS headers configured
   - Request validation
   - Rate limiting on edge functions

4. **Data Privacy**
   - Client-side encryption options
   - Secure token storage
   - HTTPS enforced

---

## 📊 Features Breakdown

### **1. Research Papers Module**
- Upload research papers (PDF)
- AI-powered summarization
- Extract key findings
- Generate citations

### **2. Exam Notes Module**
- Generate comprehensive notes
- Create flashcards for revision
- Auto-generate quizzes
- Topic-wise organization

### **3. PYQ Analysis Module**
- Upload previous year questions
- Pattern recognition
- Topic frequency analysis
- Exam predictions
- Visual analytics (timeline, charts)

### **4. AI Study Chat**
- Context-aware responses
- Multi-document querying
- Streaming responses
- Conversation history

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 📈 Performance Optimizations

1. **Code Splitting**: React.lazy for route-based splitting
2. **Image Optimization**: Lazy loading images
3. **Caching**: TanStack Query caching
4. **Streaming**: Server-sent events for AI responses
5. **Bundle Size**: Tree-shaking with Vite
6. **CDN**: Static assets on CDN

---

## 🐛 Known Issues & Limitations

1. **File Size**: Maximum 50MB per document
2. **Supported Formats**: PDF only (text extraction)
3. **AI Rate Limits**: Subject to Lovable AI gateway limits
4. **Browser Support**: Modern browsers only (ES2020+)

---

## 🔄 Version History

- **v1.0.0** (January 2026) - Initial release
  - Core features implemented
  - Supabase integration
  - AI-powered analysis

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

MIT License - See LICENSE file for details

---

## 📞 Support

For issues and questions:
- GitHub Issues: https://github.com/Flowmind-hm/study-spark/issues
- Email: support@study-spark.com

---

## 🙏 Acknowledgments

- **React Team** - For React framework
- **Supabase** - For backend infrastructure
- **Vercel** - For Vite build tool
- **shadcn** - For UI components
- **Lovable AI** - For AI processing capabilities

---

*Last Updated: January 11, 2026*
