// All static data/constants for the landing page
import { 
  BookOpen, Users, Clock, BarChart as BarChartIcon, LogIn, UserPlus, ArrowRight, Star, Mail, 
  Sparkles, Brain, Zap, Shield, TrendingUp, Book, UserCheck, Search, Bell, 
  Settings, HelpCircle, Bookmark, Calendar, Award, Target, Code, GraduationCap, BookText, 
  Library, BookmarkCheck, Clock4, Trophy, Database, Video, Facebook, Twitter, Instagram, 
  Linkedin, Github, Youtube, Moon, Flame, MessageSquare, Download, BookCheck, Menu, X
} from 'lucide-react';

import { platformTheme } from './theme';

export const courseCategories = [
  { name: 'Computer Science', value: 400, color: platformTheme.primary.light, image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' },
  { name: 'Mathematics', value: 300, color: platformTheme.secondary.light, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' },
  { name: 'Physics', value: 200, color: platformTheme.accent.light, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' },
  { name: 'Chemistry', value: 250, color: platformTheme.primary.dark, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' },
  { name: 'Biology', value: 180, color: platformTheme.secondary.dark, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' }
];

export const platformStats = [
  { 
    category: 'Active Students', 
    value: 25000, 
    icon: 'Users',
    subcategories: [
      { name: 'Undergraduate', value: 10000 },
      { name: 'Graduate', value: 8000 },
      { name: 'PhD', value: 4000 },
      { name: 'Professional', value: 3000 }
    ],
    color: platformTheme.primary
  },
  { 
    category: 'Courses', 
    value: 15000, 
    icon: 'BookOpen',
    subcategories: [
      { name: 'Core Courses', value: 6000 },
      { name: 'Electives', value: 5000 },
      { name: 'Specializations', value: 4000 }
    ],
    color: platformTheme.secondary
  },
  { 
    category: 'Instructors', 
    value: 5000, 
    icon: 'GraduationCap',
    subcategories: [
      { name: 'Professors', value: 2000 },
      { name: 'Lecturers', value: 1500 },
      { name: 'Teaching Assistants', value: 1500 }
    ],
    color: platformTheme.accent
  }
];

export const heroContent = {
  title: "Welcome to EduPulse",
  subtitle: "AI-Powered Educational Platform",
  description: "Transform your learning experience with personalized education, interactive tools, and real-time progress tracking.",
};

export const keyFeatures = [
  {
    icon: 'Brain',
    title: "AI-Powered Learning",
    description: "Get personalized study plans and recommendations based on your learning style and progress. Our advanced algorithms adapt to your pace and preferences.",
    color: "from-blue-600 to-blue-800"
  },
  {
    icon: 'Target',
    title: "Smart Goal Tracking",
    description: "Set and achieve your study goals with our comprehensive tracking system. Visualize your progress with intuitive dashboards and milestone celebrations.",
    color: "from-purple-600 to-purple-800"
  },
  {
    icon: 'Users',
    title: "Collaborative Learning",
    description: "Join study groups and learn together with peers from around the world. Share resources, participate in discussions, and tackle challenges as a team.",
    color: "from-green-600 to-green-800"
  },
  {
    icon: 'BarChart',
    title: "Detailed Analytics",
    description: "Track your performance with detailed analytics and insights. Identify strengths, weaknesses, and opportunities for improvement with our comprehensive reporting.",
    color: "from-red-600 to-red-800"
  }
];

export const studyTools = [
  {
    icon: 'Clock',
    title: "Pomodoro Timer",
    description: "Boost focus with our built-in Pomodoro timer",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: 'BookOpen',
    title: "Smart Notes",
    description: "Create and organize your study notes efficiently",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: 'Search',
    title: "Advanced Search",
    description: "Find resources quickly with our powerful search",
    color: "from-green-500 to-green-600"
  },
  {
    icon: 'Bookmark',
    title: "Resource Library",
    description: "Access a vast collection of study materials",
    color: "from-red-500 to-red-600"
  }
];

export const gamificationFeatures = [
  {
    icon: 'Trophy',
    title: "Achievement Badges",
    description: "Earn badges for completing milestones",
    color: "from-yellow-500 to-yellow-600"
  },
  {
    icon: 'Star',
    title: "Level System",
    description: "Level up as you progress in your studies",
    color: "from-indigo-500 to-indigo-600"
  },
  {
    icon: 'Users',
    title: "Leaderboards",
    description: "Compete with friends and track rankings",
    color: "from-pink-500 to-pink-600"
  },
  {
    icon: 'Award',
    title: "Rewards",
    description: "Earn rewards for consistent study habits",
    color: "from-emerald-500 to-emerald-600"
  }
];

export const platformOverview = {
  learningAnalytics: {
    title: "Learning Analytics",
    icon: 'Brain',
    color: platformTheme.primary,
    stats: [
      { label: "Average Study Time", value: "2.5 hrs/day", icon: 'Clock', color: platformTheme.primary },
      { label: "Course Completion", value: "85%", icon: 'Trophy', color: platformTheme.success },
      { label: "Active Learners", value: "15,000+", icon: 'Users', color: platformTheme.info },
      { label: "Learning Streak", value: "7 days", icon: 'Flame', color: platformTheme.warning }
    ],
    chartData: [
      { name: "Mon", value: 2.5 },
      { name: "Tue", value: 3.0 },
      { name: "Wed", value: 2.8 },
      { name: "Thu", value: 3.2 },
      { name: "Fri", value: 2.7 },
      { name: "Sat", value: 3.5 },
      { name: "Sun", value: 2.0 }
    ]
  },
  coursePerformance: {
    title: "Course Performance",
    icon: 'BookCheck',
    color: platformTheme.secondary,
    subjects: [
      { name: "Artificial Intelligence", value: 92, color: platformTheme.primary },
      { name: "Cybersecurity", value: 88, color: platformTheme.secondary },
      { name: "Web Development", value: 85, color: platformTheme.accent },
      { name: "Data Science", value: 78, color: platformTheme.info }
    ],
    progressData: [
      { name: "Week 1", value: 75 },
      { name: "Week 2", value: 82 },
      { name: "Week 3", value: 88 },
      { name: "Week 4", value: 85 },
      { name: "Week 5", value: 90 }
    ]
  },
  studentEngagement: {
    title: "Student Engagement",
    icon: 'Users',
    color: platformTheme.accent,
    metrics: [
      { label: "Discussion Posts", value: "2,345", icon: 'MessageSquare', color: platformTheme.primary },
      { label: "Study Groups", value: "156", icon: 'Users', color: platformTheme.secondary },
      { label: "Resource Downloads", value: "8,765", icon: 'Download', color: platformTheme.accent },
      { label: "Peer Reviews", value: "1,234", icon: 'Star', color: platformTheme.info }
    ],
    engagementData: [
      { name: "Jan", value: 1200 },
      { name: "Feb", value: 1500 },
      { name: "Mar", value: 1800 },
      { name: "Apr", value: 2000 },
      { name: "May", value: 2300 }
    ]
  },
  achievementProgress: {
    title: "Achievement Progress",
    icon: 'Trophy',
    color: platformTheme.success,
    goals: [
      { label: "Badges Earned", value: "24/30", icon: 'Award', color: platformTheme.primary, progress: 80 },
      { label: "Courses Completed", value: "12/15", icon: 'Book', color: platformTheme.secondary, progress: 75 },
      { label: "Skills Mastered", value: "8/10", icon: 'Brain', color: platformTheme.accent, progress: 80 },
      { label: "Challenges Won", value: "15/20", icon: 'Trophy', color: platformTheme.success, progress: 75 }
    ]
  }
};

// ... (continue exporting all other data constants as in LandingPage.jsx)