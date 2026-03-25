import {
  Sparkles,
  Search,
  ArrowRight,
  BrainCircuit,
  Rocket,
  Trophy,
  BookOpen,
  TrendingUp,
  Star,
  Play
} from 'lucide-react';
import { TbDeviceDesktopAnalytics } from "react-icons/tb";
import { LiaUikit } from "react-icons/lia";
import { MdAppShortcut, MdCastForEducation } from "react-icons/md";
import { FaHackerrank, FaSackDollar, FaUsers } from "react-icons/fa6";
import { AiFillOpenAI } from "react-icons/ai";
import { SiGoogledataproc, SiGoogleanalytics, SiOpenaccess } from "react-icons/si";
import { GiCyberEye } from "react-icons/gi";
import { BiSupport } from "react-icons/bi";

export const HERO_CONTENT = {
  badge: {
    icon: Sparkles,
    text: "Neural Genesis",
    gradient: "from-blue-500/10 to-emerald-500/10"
  },
  title: ["Master", "Your", "Future"],
  subtitle: "With Intelligence.",
  description: "Continuum of evolution. Synchronize with the pulse of global knowledge. Accelerated learning architectures designed for the next generation of leaders.",
  highlightText: "next generation",
  buttons: [
    {
      label: "Explore Courses",
      icon: ArrowRight,
      primary: true,
      action: "view_courses"
    },
    {
      label: "Smart AI Search",
      icon: Search,
      primary: false,
      secondaryIcon: Search,
      secondaryIconBg: "bg-blue-500/10",
      secondaryIconColor: "text-blue-600"
    }
  ]
};

export const CHIPS = [
  {
    icon: Rocket,
    label: "Status",
    value: "Hyper-Learning Active",
    color: "from-emerald-500 to-teal-400",
    shadow: "shadow-emerald-500/20",
    position: "top-[25%] right-[10%]",
    delay: 1,
    duration: 6
  },
  {
    icon: Trophy,
    label: "Standing",
    value: "Global Elite Tier",
    color: "from-blue-600 to-indigo-500",
    shadow: "shadow-blue-500/20",
    position: "bottom-[30%] left-[8%]",
    delay: 1.2,
    duration: 7
  }
];

export const EXPLORE_CATEGORIES = [
  { name: "Web Dev", icon: TbDeviceDesktopAnalytics, color: "from-blue-100 to-sky-50", glow: "from-blue-500/20 to-sky-400/10", textColor: "text-blue-600" },
  { name: "UI/UX Design", icon: LiaUikit, color: "from-emerald-100 to-green-50", glow: "from-emerald-500/20 to-green-400/10", textColor: "text-emerald-600" },
  { name: "App Dev", icon: MdAppShortcut, color: "from-amber-100 to-orange-50", glow: "from-amber-500/20 to-orange-400/10", textColor: "text-amber-600" },
  { name: "Hacking", icon: FaHackerrank, color: "from-red-100 to-orange-50", glow: "from-red-500/20 to-orange-400/10", textColor: "text-red-600" },
  { name: "AI/ML", icon: AiFillOpenAI, color: "from-sky-100 to-blue-50", glow: "from-sky-500/20 to-blue-400/10", textColor: "text-sky-600" },
  { name: "Data Science", icon: SiGoogledataproc, color: "from-indigo-100 to-blue-50", glow: "from-indigo-500/20 to-blue-400/10", textColor: "text-indigo-600" },
  { name: "Analytics", icon: SiGoogleanalytics, color: "from-emerald-100 to-teal-50", glow: "from-emerald-500/20 to-teal-400/10", textColor: "text-emerald-600" },
  { name: "Cyber Security", icon: GiCyberEye, color: "from-orange-100 to-amber-50", glow: "from-orange-500/20 to-amber-400/10", textColor: "text-orange-600" },
];

export const LOGOS_FEATURES = [
  {
    icon: MdCastForEducation,
    text: "20k+ Courses",
    color: "text-blue-600",
    glow: "from-blue-500/20 to-blue-400/10",
  },
  {
    icon: SiOpenaccess,
    text: "Lifetime Access",
    color: "text-emerald-600",
    glow: "from-emerald-500/20 to-teal-400/10",
  },
  {
    icon: FaSackDollar,
    text: "Value for Money",
    color: "text-amber-600",
    glow: "from-amber-500/20 to-yellow-400/10",
  },
  {
    icon: BiSupport,
    text: "24/7 Support",
    color: "text-sky-600",
    glow: "from-sky-500/20 to-blue-400/10",
  },
  {
    icon: FaUsers,
    text: "Global Community",
    color: "text-indigo-600",
    glow: "from-indigo-500/20 to-purple-400/10",
  },
];

export const ORBS = [
  { color: "bg-sky-400", size: "w-[600px] h-[600px]", top: "-top-40", left: "-left-40", delay: 0, duration: 25 },
  { color: "bg-emerald-300", size: "w-[500px] h-[500px]", top: "top-1/3", left: "right-[-10%]", delay: 2, duration: 30 },
  { color: "bg-amber-200", size: "w-[700px] h-[700px]", top: "bottom-[-10%]", left: "left-1/4", delay: 5, duration: 35 },
  { color: "bg-blue-300", size: "w-[400px] h-[400px]", top: "top-1/2", left: "right-1/5", delay: 1, duration: 20 },
  { color: "bg-purple-200", size: "w-[300px] h-[300px]", top: "top-10", left: "right-1/4", delay: 3, duration: 15 },
];

export const CARD_PAGE_CONTENT = {
  badge: {
    icon: TrendingUp,
    text: "Trending Courses"
  },
  title: "Master ",
  highlightedTitle: "Future Skills",
  description: "Learn from industry experts with AI-powered learning paths."
};

export const CARD_PAGE_ORBS = [
  { color: "bg-blue-400", size: "w-[800px] h-[800px]", top: "-top-20", left: "-left-20", delay: 0, duration: 30 },
  { color: "bg-emerald-300", size: "w-[600px] h-[600px]", top: "top-1/4", left: "right-[-5%]", delay: 2, duration: 25 },
  { color: "bg-sky-200", size: "w-[700px] h-[700px]", top: "bottom-[-15%]", left: "left-1/3", delay: 4, duration: 35 },
];

export const HOME_STATIC_ASSETS = {
  NOISE_BG: "url(\"data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noiseFilter%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E\")"
};
