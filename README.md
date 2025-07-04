# VoiceFlow AI - Intelligent Voice Notes

## About This README

This README serves as your comprehensive guide to understanding, setting up, and deploying the VoiceFlow AI application. It's structured to provide both quick-start instructions for developers eager to get the application running, as well as detailed technical documentation for those who need to understand the architecture, customize features, or deploy to production environments.

**What you'll find in this README:**

- **Project Overview**: Understanding what VoiceFlow AI does and its key capabilities
- **Technical Architecture**: Detailed breakdown of the technology stack and project structure
- **Setup Instructions**: Step-by-step guide to get the application running locally
- **Configuration Details**: Environment variables, database setup, and external service integration
- **Usage Guidelines**: How to use the application's features effectively
- **API Documentation**: Available endpoints and their functionality
- **Deployment Information**: Production deployment options and best practices
- **Troubleshooting**: Common issues and their solutions

Whether you're a developer looking to contribute, a system administrator preparing for deployment, or a stakeholder wanting to understand the technical capabilities, this README provides the information you need to work effectively with VoiceFlow AI.

---

## Features

- **Voice Recording**: High-quality audio recording with real-time visualization
- **AI Transcription**: Automatic speech-to-text using OpenAI Whisper
- **Dual AI Analysis**: Choose between OpenAI GPT-4 (cloud) or Ollama (local) for analysis
- **Smart Summarization**: AI-generated summaries with key points and topics
- **Detailed Analysis**: Communication analysis with insights and recommendations
- **Real-time Processing**: Background AI processing with status updates
- **Privacy Options**: Local AI processing with Ollama for complete privacy
- **Modern UI**: Beautiful, responsive interface with dark/light mode support

## Tech Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI Services**: 
  - OpenAI (Whisper for transcription, GPT-4 for analysis)
  - Ollama (Local AI models for privacy-focused analysis)
- **State Management**: Zustand
- **Icons**: Lucide React

## AI Provider Options

VoiceFlow AI supports two AI analysis providers:

### OpenAI (Cloud-based)
- **Transcription**: OpenAI Whisper (industry-leading accuracy)
- **Analysis**: GPT-4 (advanced reasoning and insights)
- **Pros**: Highest accuracy, multi-language support, no local setup
- **Cons**: Requires API key, data sent to OpenAI, usage costs

### Ollama (Local)
- **Transcription**: Uses OpenAI Whisper (transcription always uses OpenAI for now)
- **Analysis**: Local Llama models (complete privacy)
- **Pros**: Complete privacy, no API costs, offline capable, customizable
- **Cons**: Requires local Ollama setup, potentially lower accuracy

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── upload-recording/     # Audio upload and processing
│   │   ├── recordings/           # CRUD operations for recordings
│   │   └── ai-providers/         # AI provider availability check
│   ├── layout.tsx                # Root layout with theme provider
│   ├── page.tsx                  # Main application page
│   └── globals.css               # Global styles and CSS variables
├── components/                   # React components
│   ├── layout/                   # Layout components (Header)
│   ├── recordings/               # Recording-related components
│   ├── voice/                    # Voice recording components
│   │   ├── voice-recorder.tsx    # Main recording interface
│   │   └── ai-provider-selector.tsx # AI provider selection
│   ├── ui/                       # shadcn/ui components
│   └── theme-provider.tsx        # Theme management
├── lib/                          # Utilities and services
│   ├── services/                 # External service integrations
│   │   ├── openai.ts            # OpenAI API integration
│   │   ├── ollama.ts            # Ollama local AI integration
│   │   └── ai-service.ts        # Unified AI service layer
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
- OpenAI account with API access (for cloud AI)
- Ollama installed locally (for local AI) - Optional

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration (for cloud AI)
OPENAI_API_KEY=your_openai_api_key

# Ollama Configuration (for local AI)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# AI Provider Selection (optional)
AI_PROVIDER=openai  # or 'ollama' for default

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

### 4. OpenAI Setup (for Cloud AI)

1. **Get an API key**:
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Go to API Keys and create a new key
   - Add credits to your account for API usage

### 5. Ollama Setup (for Local AI)

1. **Install Ollama**:
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows - Download from https://ollama.ai
   ```

2. **Start Ollama server**:
   ```bash
   ollama serve
   ```

3. **Pull a model**:
   ```bash
   # Recommended models for analysis
   ollama pull llama3.2        # Fast and efficient
   ollama pull llama3.2:13b    # Better accuracy
   ollama pull mistral         # Alternative option
   ```

4. **Verify setup**:
   ```bash
   curl http://localhost:11434/api/tags
   ```

### 6. Supabase Setup (follow steps at [localhost:3000/setup)](http://localhost:3000/setup))

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
     
### 7. Usage

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click the settings icon to choose your AI provider:
   - **OpenAI**: For best accuracy and cloud processing
   - **Ollama**: For privacy and local processing
3. Click "Start Recording" to begin recording audio
4. Speak clearly into your microphone
5. Click "Stop" when finished, then "Save Recording"
6. The recording will be uploaded and processed with your chosen AI provider
7. View transcription, summary, and analysis in the interface

## AI Provider Comparison

| Feature | OpenAI | Ollama |
|---------|--------|--------|
| **Accuracy** | Highest | Good |
| **Privacy** | Data sent to OpenAI | Complete privacy |
| **Cost** | Pay per use | Free after setup |
| **Setup** | API key only | Local installation |
| **Internet** | Required | Optional |
| **Speed** | Fast | Depends on hardware |
| **Languages** | 50+ languages | Model dependent |
| **Customization** | Limited | Full control |

## API Endpoints

- `POST /api/upload-recording` - Upload and process audio recordings
- `GET /api/recordings` - Fetch all recordings
- `GET /api/recordings/[id]` - Fetch specific recording
- `DELETE /api/recordings/[id]` - Delete recording
- `GET /api/ai-providers` - Check available AI providers

## Key Features Explained

### Voice Recording
- Real-time audio visualization
- Pause/resume functionality
- Audio level monitoring
- WebM format with Opus codec

### AI Processing Pipeline
1. **Upload**: Audio file uploaded to Supabase Storage
2. **Transcription**: OpenAI Whisper converts speech to text
3. **Analysis**: Chosen AI provider (OpenAI GPT-4 or Ollama) generates summary and insights
4. **Storage**: All results saved to Supabase database

### AI Provider Selection
- Dynamic provider availability checking
- Automatic fallback to available providers
- Real-time status indicators
- Provider-specific feature highlighting

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

### Ollama in Production

For production deployments with Ollama:

1. **Server Setup**: Install Ollama on your server
2. **Model Management**: Pre-pull required models
3. **Resource Planning**: Ensure adequate RAM/GPU for models
4. **Network Configuration**: Configure firewall for Ollama port
5. **Monitoring**: Set up health checks for Ollama service

## Troubleshooting

### Common Issues

#### Ollama Connection Failed
- Ensure Ollama is running: `ollama serve`
- Check if models are installed: `ollama list`
- Verify port 11434 is accessible
- Check firewall settings

#### OpenAI API Errors
- Verify API key is correct
- Check account has sufficient credits
- Ensure API key has required permissions

#### Recording Issues
- Check microphone permissions
- Verify browser supports WebRTC
- Test with different browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with both AI providers
5. Submit a pull request

## License

MIT License - see LICENSE file for details