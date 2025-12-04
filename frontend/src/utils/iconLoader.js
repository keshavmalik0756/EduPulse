// Lazy load icons to avoid importing the entire lucide-react library
const iconCache = {};

const iconMap = {
  'Users': () => import('lucide-react').then(m => m.Users),
  'BookOpen': () => import('lucide-react').then(m => m.BookOpen),
  'GraduationCap': () => import('lucide-react').then(m => m.GraduationCap),
  'Brain': () => import('lucide-react').then(m => m.Brain),
  'Target': () => import('lucide-react').then(m => m.Target),
  'BarChart': () => import('lucide-react').then(m => m.BarChart),
  'Clock': () => import('lucide-react').then(m => m.Clock),
  'Search': () => import('lucide-react').then(m => m.Search),
  'Bookmark': () => import('lucide-react').then(m => m.Bookmark),
  'Trophy': () => import('lucide-react').then(m => m.Trophy),
  'Star': () => import('lucide-react').then(m => m.Star),
  'Award': () => import('lucide-react').then(m => m.Award),
  'Flame': () => import('lucide-react').then(m => m.Flame),
  'BookCheck': () => import('lucide-react').then(m => m.BookCheck),
  'MessageSquare': () => import('lucide-react').then(m => m.MessageSquare),
  'Download': () => import('lucide-react').then(m => m.Download),
  'Book': () => import('lucide-react').then(m => m.Book),
};

export const getIcon = async (iconName) => {
  if (!iconName) return null;
  
  if (iconCache[iconName]) {
    return iconCache[iconName];
  }
  
  if (iconMap[iconName]) {
    try {
      const Icon = await iconMap[iconName]();
      iconCache[iconName] = Icon;
      return Icon;
    } catch (error) {
      console.error(`Failed to load icon: ${iconName}`, error);
      return null;
    }
  }
  
  return null;
};

// Synchronous version for known icons (pre-imported)
import {
  Users,
  BookOpen,
  GraduationCap,
  Brain,
  Target,
  BarChart,
  Clock,
  Search,
  Bookmark,
  Trophy,
  Star,
  Award,
  Flame,
  BookCheck,
  MessageSquare,
  Download,
  Book,
} from 'lucide-react';

export const iconRegistry = {
  Users,
  BookOpen,
  GraduationCap,
  Brain,
  Target,
  BarChart,
  Clock,
  Search,
  Bookmark,
  Trophy,
  Star,
  Award,
  Flame,
  BookCheck,
  MessageSquare,
  Download,
  Book,
};

export const renderIcon = (iconName, size = 24) => {
  const Icon = iconRegistry[iconName];
  if (Icon) {
    return Icon;
  }
  return null;
};
