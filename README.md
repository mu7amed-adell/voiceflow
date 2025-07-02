# VoiceFlow AI - Intelligent Voice Notes

A modern web application for recording, transcribing, and analyzing voice notes using AI. Built with Next.js, Supabase, and OpenAI.

## Features

- **Voice Recording**: High-quality audio recording with real-time visualization
- **AI Transcription**: Automatic speech-to-text using OpenAI Whisper
- **Smart Summarization**: AI-generated summaries with key points and topics
- **Detailed Analysis**: Communication analysis with insights and recommendations
- **Real-time Processing**: Background AI processing with status updates
- **Modern UI**: Beautiful, responsive interface with dark/light mode support

## Tech Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI Services**: OpenAI (Whisper, GPT-4)
- **State Management**: Zustand
- **Icons**: Lucide React

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── upload-recording/     # Audio upload and processing
│   │   └── recordings/           # CRUD operations for recordings
│   ├── layout.tsx                # Root layout with theme provider
│   ├── page.tsx                  # Main application page
│   └── globals.css               # Global styles and CSS variables
├── components/                   # React components
│   ├── layout/                   # Layout components (Header)
│   ├── recordings/               # Recording-related components
│   ├── voice/                    # Voice recording components
│   ├── ui/                       # shadcn/ui components
│   └── theme-provider.tsx        # Theme management
├── lib/                          # Utilities and services
│   ├── services/                 # External service integrations
│   │   └── openai.ts            # OpenAI API integration
│   ├── supabase/                # Supabase configuration
│   ├── store/                   # State management
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Utility functions
└── supabase/                    # Database migrations
    └── migrations/              # SQL migration files
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI account with API access

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
### 3. Installation

```bash
# Clone the repository
git clone https://github.com/mu7amed-adell/voiceflow.git
cd voiceflow

# Install dependencies
npm install

# Run the development server
npm run dev
```

### 4. OpenAI Setup

1. **Get an API key**:
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Go to API Keys and create a new key
   - Add credits to your account for API usage

### 5. Supabase Setup (follow steps at [localhost:3000/setup)](http://localhost:3000/setup))

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Set up the database**:
   - Go to the SQL Editor in your Supabase dashboard
   - Run the migration file: `supabase/migrations/create_recordings_table.sql`

3. **Configure Storage**:
   - Go to Storage in your Supabase dashboard
   - Create a new bucket named `audio-recordings`
   - Set the bucket to public or configure appropriate policies

4. **Get your credentials**:
   - Go to Settings > API
   - Copy your Project URL and anon key
   - Copy your service role key (keep this secret!)
     
### 6. Usage

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click "Start Recording" to begin recording audio
3. Speak clearly into your microphone
4. Click "Stop" when finished, then "Save Recording"
5. The recording will be uploaded and processed automatically
6. View transcription, summary, and analysis in the interface

## API Endpoints

- `POST /api/upload-recording` - Upload and process audio recordings
- `GET /api/recordings` - Fetch all recordings
- `GET /api/recordings/[id]` - Fetch specific recording
- `DELETE /api/recordings/[id]` - Delete recording

## Key Features Explained

### Voice Recording
- Real-time audio visualization
- Pause/resume functionality
- Audio level monitoring
- WebM format with Opus codec

### AI Processing Pipeline
1. **Upload**: Audio file uploaded to Supabase Storage
2. **Transcription**: OpenAI Whisper converts speech to text
3. **Summarization**: GPT-4 generates summary and key points
4. **Analysis**: Detailed communication analysis and insights
5. **Storage**: All results saved to Supabase database

### Real-time Updates
- Background processing with status polling
- Live status updates in the UI
- Error handling and retry logic

## Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

Make sure to set all environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
