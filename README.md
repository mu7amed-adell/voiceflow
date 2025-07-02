Project Structure Overview
The project is organized into several logical directories, each serving a specific purpose:

app/: This directory contains the core Next.js application logic, including pages, layouts, and global styles.

app/layout.tsx: Defines the root layout for the entire application, including global CSS imports, metadata, and the ThemeProvider for dark/light mode.
app/page.tsx: This is the main entry point for the application's UI, orchestrating the display of the voice recorder, recordings list, and recording details. It uses client-side hooks and the use client directive.
app/globals.css: Contains the global CSS styles, including Tailwind CSS directives and custom CSS variables for theming.
components/: This directory houses all the reusable React components, categorized further by their functionality.

components/layout/: Contains layout-specific components, such as the Header.
components/recordings/: Includes components related to displaying and interacting with recordings, such as AudioPlayer, RecordingCard, RecordingDetail, RecordingsList, ReportView, SummaryView, and TranscriptionView.
components/ui/: This directory is for UI components generated or customized using shadcn/ui. Examples include Button, Card, Slider, Badge, Progress, Tabs, etc.
components/voice/: Contains components specific to voice recording functionality, like AudioVisualizer, VoiceRecorder, and VolumeIndicator.
components/theme-provider.tsx: A wrapper component for next-themes to manage theme switching.
lib/: This directory contains utility functions, type definitions, and state management logic.

lib/store/recordings-store.ts: Implements a Zustand store for managing the application's state related to recordings (adding, deleting, updating status). It also includes mock data for demonstration purposes and uses zustand/middleware/persist for local storage.
lib/types/recording.ts: Defines TypeScript interfaces for the Recording object and its nested Transcription, Summary, and Report types, ensuring strong typing throughout the application.
lib/utils/format.ts: Provides helper functions for formatting durations, file sizes, and relative times.
lib/utils.ts: Contains general utility functions, including cn for conditionally combining Tailwind CSS classes.
Key Technologies and Libraries
Next.js: The React framework for building the web application, supporting server-side rendering and client-side interactivity.
Tailwind CSS: A utility-first CSS framework used for rapid UI development and styling.
shadcn/ui: A collection of reusable UI components built with Radix UI and Tailwind CSS, providing a consistent and customizable design system.
Zustand: A lightweight state management solution used for managing the client-side state of recordings.
Lucide React: An icon library providing a wide range of customizable SVG icons used across the application.
Sonner: A toast library for displaying notifications to the user.
next-themes: A library for managing dark/light mode themes.
Application Flow
The application's main page (app/page.tsx) sets up a three-column layout:

Left Column: Features the VoiceRecorder component, allowing users to record audio.
Middle Column: Displays the RecordingsList, where users can view and filter their saved recordings.
Right Column: Shows the RecordingDetail component, which provides an AudioPlayer and tabs for viewing the transcription, summary, and analysis report of a selected recording.
The useRecordingsStore (Zustand) manages the state of all recordings, including their status (processing, completed, failed), and their associated data (audio URL, transcription, summary, report).
