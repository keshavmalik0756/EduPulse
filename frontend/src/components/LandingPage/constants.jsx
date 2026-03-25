import { 
  Zap, 
  ArrowRight, 
  Play, 
  Users, 
  Sparkles, 
  BookOpen, 
  Award, 
  TrendingUp,
  Target,
  Flame,
  BrainCircuit,
  Shield,
  Trophy,
  Medal,
  Activity
} from "lucide-react";

export const navLinks = [
  { name: 'Educators', href: '#educators', id: 'educators', icon: Users },
  { name: 'Features', href: '#features', id: 'features', icon: Sparkles },
  { name: 'Curriculum', href: '#curriculum', id: 'curriculum', icon: BookOpen },
  { name: 'Success', href: '#success', id: 'success', icon: Trophy },
];

export const LANDING_HERO_DATA = {
  badge: {
    text: "AI-Powered Learning Platform",
    icon: Zap
  },
  title: ["Learn Smarter.", "Grow Faster."],
  subtitle: "Powered by EduPulse AI",
  description:
    "Unlock personalized learning powered by AI. Master in-demand skills, track your progress in real-time, and accelerate your career with intelligent insights designed for the modern learner.",
  buttons: [
    {
      label: "Start Learning Now",
      icon: ArrowRight,
      primary: true
    },
    {
      label: "Watch Demo",
      icon: Play,
      primary: false
    }
  ]
};

export const EDUCATORS = [
  {
    name: "Dr. Aris Thorne",
    role: "AI Ethics & Logic",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop",
    rating: 4.9,
    students: "12k+",
    courses: 14,
    tags: ["MIT Fellow", "Google AI"]
  },
  {
    name: "Sarah Jenkins",
    role: "Full-Stack Architecture",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop",
    rating: 5.0,
    students: "8.5k+",
    courses: 22,
    tags: ["Ex-Meta", "Next.js Core"]
  },
  {
    name: "Prof. Marcus Chen",
    role: "Quantum Computing",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop",
    rating: 4.8,
    students: "15k+",
    courses: 9,
    tags: ["Stanford PhD", "IBM Q"]
  },
  {
    name: "Elena Rodriguez",
    role: "UI/UX Psychology",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&auto=format&fit=crop",
    rating: 4.9,
    students: "20k+",
    courses: 31,
    tags: ["Design Lead", "Apple"]
  }
];

export const courses = [
  {
    id: 1,
    title: "Deep Learning & AI Architectures",
    educator: "Dr. Aris Thorne",
    rating: 4.9,
    students: "8.2k",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    tag: "Best Seller",
    color: "sky"
  },
  {
    id: 2,
    title: "Full-Stack Mastery with Next.js",
    educator: "Sarah Jenkins",
    rating: 5.0,
    students: "12.5k",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800",
    tag: "Pro-Level",
    color: "emerald"
  },
  {
    id: 3,
    title: "UI/UX Psychology & Micro-Interactions",
    educator: "Elena Rodriguez",
    rating: 4.8,
    students: "5.4k",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=800",
    tag: "Design Focus",
    color: "indigo"
  },
  {
    id: 4,
    title: "Quantum Algorithms & Computing",
    educator: "Prof. Marcus Chen",
    rating: 4.9,
    students: "3.1k",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800",
    tag: "Elite",
    color: "rose"
  }
];

export const testimonials = [
  {
    id: 1,
    name: "James Wilson",
    role: "Software Engineer at Google",
    content: "EduPulse's AI mentor is unlike anything I've seen. It doesn't just give answers; it helps you think through the problem from first principles.",
    rank: "Elite Tier",
    color: "from-blue-500 to-indigo-500",
    image: "https://i.pravatar.cc/100?img=32"
  },
  {
    id: 2,
    name: "Sofia Martinez",
    role: "UI/UX Designer",
    content: "The design psychology courses here are incredible. I learned more in two weeks than I did in a year of self-study.",
    rank: "Master Tier",
    color: "from-emerald-500 to-teal-500",
    image: "https://i.pravatar.cc/100?img=44"
  },
  {
    id: 3,
    name: "Ryan Chen",
    role: "CS Student",
    content: "The spaced repetition flashcards are a game changer. I've never felt more confident before a technical interview.",
    rank: "Top 1%",
    color: "from-orange-500 to-rose-500",
    image: "https://i.pravatar.cc/100?img=12"
  },
  {
    id: 4,
    name: "Emma Thompson",
    role: "Data Scientist",
    content: "I love the granular analytics. It showed me exactly where I was losing focus and helped me adjust my study habits.",
    rank: "Diamond",
    color: "from-sky-500 to-blue-500",
    image: "https://i.pravatar.cc/100?img=15"
  }
];
