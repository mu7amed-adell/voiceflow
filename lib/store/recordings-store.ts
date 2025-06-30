import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recording } from '@/lib/types/recording';

interface RecordingsStore {
  recordings: Recording[];
  _hasHydrated: boolean;
  addRecording: (recording: Recording) => void;
  deleteRecording: (id: string) => void;
  updateRecordingStatus: (id: string, status: Recording['status']) => void;
  clearRecordings: () => void;
  setHasHydrated: (state: boolean) => void;
}

// Mock data for demonstration
const mockRecordings: Recording[] = [
  {
    id: '1',
    title: 'Team Meeting - Q4 Planning',
    duration: 1847, // 30:47
    createdAt: new Date('2024-12-30T14:00:00Z'), // Fixed timestamp instead of Date.now() - 2 hours
    audioUrl: 'data:audio/wav;base64,mock-audio-data',
    size: 12485760, // 12.4 MB
    status: 'completed',
    transcription: {
      content: `Good morning everyone, welcome to our Q4 planning session. Today we'll be discussing our strategic objectives for the final quarter of the year. Our main focus areas will include product development milestones, customer acquisition targets, and budget allocation for the upcoming holiday season.

First, let's review our current progress. We've successfully launched two major features this quarter and seen a 23% increase in user engagement. The marketing team has exceeded their lead generation goals by 15%, which is fantastic news.

For Q4, we need to prioritize the mobile app redesign project, expand our customer support team, and prepare for the Black Friday campaign. Each department should prepare detailed timelines and resource requirements by the end of this week.

Are there any questions or concerns about these priorities? I'd like to hear from each team lead about potential challenges and resource needs.`,
      confidence: 94,
      language: 'en',
      speakerCount: 4,
      timestamps: [
        { start: 0, end: 15.2, text: "Good morning everyone, welcome to our Q4 planning session." },
        { start: 15.5, end: 32.1, text: "Today we'll be discussing our strategic objectives for the final quarter of the year." },
        { start: 32.4, end: 48.7, text: "Our main focus areas will include product development milestones, customer acquisition targets, and budget allocation." }
      ]
    },
    summary: {
      content: `This team meeting focused on Q4 strategic planning with emphasis on product development, customer acquisition, and budget allocation. Key achievements include successful feature launches and 23% increase in user engagement. Priority initiatives for Q4 include mobile app redesign, customer support expansion, and Black Friday campaign preparation.`,
      keyPoints: [
        'Q4 strategic planning session with focus on product development and customer acquisition',
        'Successfully launched two major features with 23% increase in user engagement',
        'Marketing team exceeded lead generation goals by 15%',
        'Mobile app redesign project is top priority for Q4',
        'Customer support team expansion needed',
        'Black Friday campaign preparation required',
        'Department timelines and resource requirements due by end of week'
      ],
      topics: ['Strategic Planning', 'Product Development', 'Marketing', 'Customer Support', 'Budget Allocation'],
      sentimentScore: 0.4
    },
    report: {
      content: `This Q4 planning meeting demonstrates strong organizational leadership and strategic thinking. The session was well-structured with clear objectives and actionable outcomes. Communication was effective with positive sentiment throughout the discussion.

Key strengths observed:
- Clear agenda and priorities communicated
- Data-driven decision making with specific metrics
- Collaborative approach with input from all team leads
- Realistic timeline expectations set

Areas for optimization:
- Consider breaking down large initiatives into smaller milestones
- Ensure adequate resource allocation for multiple concurrent projects
- Plan for potential holiday season challenges

Overall assessment: Highly productive meeting with strong leadership and clear strategic direction.`,
      insights: [
        'Strong leadership communication style',
        'Data-driven approach to decision making',
        'Collaborative team environment',
        'Clear strategic priorities established'
      ],
      metrics: {
        speakingTime: 85,
        pauseFrequency: 12,
        averageResponseTime: 3.2,
        sentimentTrend: 'positive'
      },
      actionItems: [
        'Department leads to submit detailed timelines by end of week',
        'Finalize mobile app redesign project scope',
        'Begin customer support team recruitment',
        'Develop Black Friday campaign strategy'
      ],
      sentimentAnalysis: {
        overall: 'positive',
        confidence: 0.4,
        emotions: ['optimistic', 'focused', 'collaborative']
      }
    }
  },
  {
    id: '2',
    title: 'Client Call - Project Update',
    duration: 892, // 14:52
    createdAt: new Date('2024-12-30T11:00:00Z'), // Fixed timestamp instead of Date.now() - 5 hours
    audioUrl: 'data:audio/wav;base64,mock-audio-data-2',
    size: 8234567, // 8.2 MB
    status: 'completed',
    transcription: {
      content: `Hello Sarah, thank you for taking the time to join our project update call today. I wanted to walk you through the progress we've made over the past two weeks and discuss the upcoming milestones.

We've successfully completed the user interface design phase and received approval from your design team. The development work is now 60% complete, and we're on track to deliver the beta version by the end of next week as planned.

There have been a few minor scope adjustments based on user feedback from the prototype testing. Specifically, we've enhanced the search functionality and added two additional filter options that weren't in the original specification.

I wanted to confirm the testing timeline with you. Once we deliver the beta, we'll need approximately one week for your team's internal testing, followed by another week for any revisions based on your feedback. This keeps us aligned with the original project timeline.

Do you have any questions about the progress or concerns about the upcoming deliverables?`,
      confidence: 91,
      language: 'en',
      speakerCount: 2,
      timestamps: [
        { start: 0, end: 12.3, text: "Hello Sarah, thank you for taking the time to join our project update call today." },
        { start: 12.6, end: 28.9, text: "I wanted to walk you through the progress we've made over the past two weeks." },
        { start: 29.2, end: 45.1, text: "We've successfully completed the user interface design phase and received approval." }
      ]
    },
    summary: {
      content: `Client project update call covering UI design completion, 60% development progress, and timeline confirmation. Scope adjustments made based on user feedback including enhanced search functionality and additional filters. Beta delivery scheduled for end of next week with testing timeline confirmed.`,
      keyPoints: [
        'UI design phase completed and approved by client design team',
        'Development work is 60% complete and on schedule',
        'Beta version delivery planned for end of next week',
        'Scope adjustments made based on user feedback',
        'Enhanced search functionality and additional filters added',
        'Testing timeline confirmed: one week internal testing, one week for revisions',
        'Project remains aligned with original timeline'
      ],
      topics: ['Project Management', 'UI Design', 'Development Progress', 'Testing Timeline'],
      sentimentScore: 0.2
    },
    report: {
      content: `Professional client communication demonstrating strong project management and transparency. The call was well-structured with clear progress updates and proactive timeline management.

Communication strengths:
- Clear progress reporting with specific completion percentages
- Proactive communication about scope changes
- Timeline confirmation and milestone planning
- Professional and collaborative tone

Project management effectiveness:
- On-track delivery schedule maintained
- User feedback successfully integrated
- Realistic testing timeline established
- Transparent about adjustments and enhancements

This call exemplifies excellent client relationship management with clear communication and professional project handling.`,
      insights: [
        'Strong project management communication',
        'Proactive client relationship management',
        'Effective scope change management',
        'Professional and structured approach'
      ],
      metrics: {
        speakingTime: 78,
        pauseFrequency: 8,
        averageResponseTime: 2.1,
        sentimentTrend: 'neutral-positive'
      },
      actionItems: [
        'Deliver beta version by end of next week',
        'Coordinate internal testing schedule with client',
        'Prepare revision process for post-testing feedback',
        'Maintain communication about any development challenges'
      ],
      sentimentAnalysis: {
        overall: 'neutral-positive',
        confidence: 0.2,
        emotions: ['professional', 'confident', 'collaborative']
      }
    }
  },
  {
    id: '3',
    title: 'Personal Voice Note',
    duration: 234, // 3:54
    createdAt: new Date('2024-12-29T16:00:00Z'), // Fixed timestamp instead of Date.now() - 24 hours
    audioUrl: 'data:audio/wav;base64,mock-audio-data-3',
    size: 2845321, // 2.8 MB
    status: 'processing',
    transcription: null,
    summary: null,
    report: null
  }
];

export const useRecordingsStore = create<RecordingsStore>()(
  persist(
    (set, get) => ({
      recordings: mockRecordings,
      _hasHydrated: false,
      
      addRecording: (recording) => {
        set((state) => ({
          recordings: [recording, ...state.recordings]
        }));
      },
      
      deleteRecording: (id) => {
        set((state) => ({
          recordings: state.recordings.filter(r => r.id !== id)
        }));
      },
      
      updateRecordingStatus: (id, status) => {
        set((state) => ({
          recordings: state.recordings.map(r => 
            r.id === id ? { ...r, status } : r
          )
        }));
        
        // Simulate processing completion
        if (status === 'completed') {
          setTimeout(() => {
            set((state) => ({
              recordings: state.recordings.map(r => 
                r.id === id ? {
                  ...r,
                  transcription: {
                    content: 'This is a sample transcription that would be generated by the AI transcription service. The actual content would depend on what was spoken in the recording.',
                    confidence: 89,
                    language: 'en',
                    speakerCount: 1,
                    timestamps: [
                      { start: 0, end: 10, text: 'This is a sample transcription' },
                      { start: 10, end: 20, text: 'that would be generated by the AI' }
                    ]
                  },
                  summary: {
                    content: 'This recording contains important thoughts and ideas that were captured for later reference.',
                    keyPoints: ['Key idea 1', 'Important thought 2', 'Action item 3'],
                    topics: ['Personal Notes', 'Ideas', 'Planning'],
                    sentimentScore: 0.1
                  },
                  report: {
                    content: 'This personal voice note demonstrates clear thinking and organized thoughts. The speaker shows good articulation and purposeful communication.',
                    insights: ['Clear communication', 'Organized thoughts', 'Purposeful content'],
                    metrics: {
                      speakingTime: 92,
                      pauseFrequency: 5,
                      averageResponseTime: 0,
                      sentimentTrend: 'neutral'
                    },
                    actionItems: ['Review noted ideas', 'Follow up on action items'],
                    sentimentAnalysis: {
                      overall: 'neutral',
                      confidence: 0.1,
                      emotions: ['thoughtful', 'focused']
                    }
                  }
                } : r
              )
            }));
          }, 100);
        }
      },
      
      clearRecordings: () => {
        set({ recordings: [] });
      },

      setHasHydrated: (state) => {
        set({
          _hasHydrated: state
        });
      }
    }),
    {
      name: 'recordings-storage',
      // Don't persist audio URLs as they're temporary
      partialize: (state) => ({
        recordings: state.recordings.map(r => ({
          ...r,
          audioUrl: r.audioUrl.startsWith('data:') ? '' : r.audioUrl
        }))
      }),
      // Add custom serialization/deserialization to handle Date objects
      serialize: (state) => {
        return JSON.stringify(state);
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        // Convert createdAt strings back to Date objects
        if (parsed.state?.recordings) {
          parsed.state.recordings = parsed.state.recordings.map((recording: any) => ({
            ...recording,
            createdAt: new Date(recording.createdAt)
          }));
        }
        return parsed;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);