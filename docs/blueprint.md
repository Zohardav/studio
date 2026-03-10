# **App Name**: Drink & Earn

## Core Features:

- Daily Hydration Tracking: Users can log their water intake with optimistic UI updates and basic offline resilience. They can set daily glass or milliliter goals, customize glass sizes, and view current progress towards the daily target, including remaining amount. Daily logs are timezone-aware and reliably cross day boundaries.
- Dynamic Virtual World Progression: A gamified visual experience where a personalized virtual world evolves and grows (e.g., a seed becomes a flower, an island grows richer) based on water consumed today, consistency over days, streaks, and achievements unlocked. Explicit progression rules, points, thresholds, stages, and unlockable decorative items define growth.
- Gamified Streaks & Achievements: Tracks and celebrates consecutive days where hydration goals are met (streaks) and rewards users with achievements for significant milestones like 'first full day' or '100 glasses total'. Streak logic is timezone-aware and reliable across day boundaries. Rewards unlock badges, world items, or encouraging messages.
- Contextual Encouragement System: Delivers warm, supportive messages after each logged glass, based on user progress and context. The system initially uses curated, deterministic templates and is built with architecture ready for an optional AI tool to generate more nuanced, context-aware messages using reasoning to decide when to incorporate specific details.
- Personalized User Settings: Allows users to customize their display name, daily goal, preferred glass size, and select a theme for their virtual world (e.g., garden, island, cozy room).
- Progress & History Dashboard: Provides users with elegant visualizations and simple trends of their daily, weekly, and monthly hydration history, total consumption, and streak progress. Features like a 'Perfect day' celebration card and a weekly summary card are included.
- Reminder Preference Management: A user interface for setting and storing hydration reminder times and tone preferences in Firestore, preparing the system for future Firebase Cloud Messaging integration for push notifications.
- Seamless Guest-First Onboarding: Allows new users to immediately begin tracking and experiencing the app's core features without mandatory sign-up, with an option to create an account later to persist data. The flow is designed for minimal friction and clear concept explanation.
- Interactive Soundscapes & Audio Feedback: Integrates subtle, premium micro-sounds for key actions (e.g., logging water, reaching goals, unlocking achievements, streak milestones). Includes a sound settings section with a sound on/off toggle and a separate toggle for celebration sounds, ensuring mobile-friendly behavior and easy asset replacement.
- Installable Progressive Web App (PWA): The application is built as an installable PWA, ensuring app-like mobile behavior, offline capabilities, and consistent user experience across devices.

## Style Guidelines:

- Background color: A very light, subtle cool white (#F4F7F8) providing a serene and clean base for the interface.
- Primary color: A deep yet calming aqua-blue (#258CB2), evocative of fresh water, used for main UI elements, text, and active states.
- Accent color: A vibrant and refreshing aqua-green (#30EDBC), employed for interactive elements, progress indicators, and gentle positive feedback.
- Reward highlight color: A soft, warm gold (#F2D17E) used sparingly to highlight rewards, achievements, and celebratory moments.
- Headline font: 'Alegreya' (serif), chosen for its elegant, intellectual, and contemporary feel, ideal for main titles and significant messages. Utilizes performance-friendly font loading.
- Body font: 'PT Sans' (sans-serif), selected for its modern look, warmth, and excellent readability, suitable for all body text and descriptive content. All text content is structured for easy localization, especially for Hebrew.
- Use soft, rounded, and illustrative icons throughout the application, complementing the playful, cozy, and elegant aesthetic, especially for world elements and achievements. Placeholder visual assets will be used initially to make the app feel alive.
- A spacious and clean mobile-first layout characterized by large, touch-friendly elements and the generous use of rounded cards and containers for a soft, premium feel. Emphasis on visual hierarchy and an installable PWA experience.
- Integrate subtle, delightful micro-interactions and smooth, gentle transitions, particularly for water logging, progress updates, and celebratory moments, enhancing the sense of reward and emotional connection. Harmonize visual animations with subtle, premium audio cues to create a cohesive and deeply satisfying feedback loop.