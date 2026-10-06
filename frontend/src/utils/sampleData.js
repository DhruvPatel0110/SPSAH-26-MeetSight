export const sampleTranscript = {
  id: 1,
  filename: "team-meeting-2024.mp3",
  duration: "45:32",
  uploadDate: "2024-05-16",
  status: "completed",
  text: `Welcome everyone to today's quarterly review meeting. I'm glad we could all make it despite the busy schedules.

Let's start with the product development updates. Sarah, would you like to share what your team has been working on?

Thank you. Over the past quarter, we've made significant progress on the new AI transcription feature. The accuracy has improved from 85% to 94%, which is a major milestone. We've also implemented real-time processing capabilities that reduce transcription time by 60%.

That's impressive progress. How about the user feedback on the beta version?

The feedback has been overwhelmingly positive. Users particularly appreciate the automatic speaker identification and the timestamp features. We did receive some requests for export functionality in multiple formats, which we're planning to add in the next sprint.

Excellent. Moving on to the marketing initiatives, John, what's the update on the campaign performance?

Our Q2 campaign exceeded expectations. We saw a 45% increase in user signups and a 30% improvement in conversion rates. The social media engagement has been particularly strong, with our educational content performing best.

Those are great numbers. What about the customer retention metrics?

Retention is up by 15% compared to last quarter. The new onboarding flow and tutorial videos have significantly reduced the learning curve for new users.

Perfect. Let's discuss the action items for next quarter. First, we need to finalize the export feature implementation. Second, expand our marketing reach to international markets. Third, conduct user research for the mobile app development.

I'll send out a detailed summary with all action items and deadlines by end of day. Does anyone have any questions or additional points to discuss?

Just one quick note - we should also consider adding collaboration features based on the enterprise customer feedback we've been receiving.

Good point. Let's add that to our roadmap discussion for next month. If there's nothing else, thank you all for your time and great work this quarter.`,
  wordCount: 342,
  speakers: ["Host", "Sarah", "John"]
};

export const sampleSummary = {
  keyPoints: [
    {
      id: 1,
      title: "Product Development Success",
      description: "AI transcription accuracy improved from 85% to 94%, with 60% faster processing time",
      icon: "TrendingUp",
      color: "cyan"
    },
    {
      id: 2,
      title: "Positive User Feedback",
      description: "Beta users praised speaker identification and timestamp features, requested export functionality",
      icon: "ThumbsUp",
      color: "purple"
    },
    {
      id: 3,
      title: "Marketing Campaign Success",
      description: "45% increase in signups, 30% better conversion rates, strong social media engagement",
      icon: "Target",
      color: "pink"
    },
    {
      id: 4,
      title: "Improved Retention",
      description: "15% increase in customer retention due to better onboarding and tutorials",
      icon: "Users",
      color: "cyan"
    }
  ],
  sentiment: "positive",
  topics: ["Product Development", "Marketing", "User Feedback", "Quarterly Review"]
};

export const sampleActionItems = [
  {
    id: 1,
    text: "Finalize export feature implementation for multiple formats",
    priority: "high",
    completed: false,
    assignee: "Sarah's Team",
    dueDate: "2024-06-15"
  },
  {
    id: 2,
    text: "Expand marketing reach to international markets",
    priority: "high",
    completed: false,
    assignee: "John's Team",
    dueDate: "2024-06-30"
  },
  {
    id: 3,
    text: "Conduct user research for mobile app development",
    priority: "medium",
    completed: false,
    assignee: "Product Team",
    dueDate: "2024-07-15"
  },
  {
    id: 4,
    text: "Send detailed summary with action items and deadlines",
    priority: "high",
    completed: true,
    assignee: "Host",
    dueDate: "2024-05-16"
  },
  {
    id: 5,
    text: "Add collaboration features to roadmap discussion",
    priority: "medium",
    completed: false,
    assignee: "Product Team",
    dueDate: "2024-06-01"
  }
];
