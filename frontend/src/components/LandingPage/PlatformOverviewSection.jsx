import React from 'react';
import { motion } from 'framer-motion';
import SectionTitle from './SectionTitle';
import { platformOverview } from './data';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, LineChart, Line } from 'recharts';
import * as LucideIcons from 'lucide-react';

function renderIcon(icon, size = 24) {
  if (typeof icon === 'string' && LucideIcons[icon]) {
    const Icon = LucideIcons[icon];
    return <Icon size={size} />;
  }
  return icon;
}

const LearningAnalyticsCard = () => (
  <motion.div 
    className={`p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg`}
    whileHover={{ 
      scale: 1.02, 
      boxShadow: `0 25px 50px -12px ${platformOverview.learningAnalytics.color.light}60`,
      y: -5
    }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <motion.div className="flex items-center gap-4 mb-6" whileHover={{ x: 5 }}>
      <motion.div 
        className={`p-3 rounded-xl ${platformOverview.learningAnalytics.color.bg} border border-white/10`}
        whileHover={{ rotate: 360 }} 
        transition={{ duration: 0.5 }}
      >
        {renderIcon(platformOverview.learningAnalytics.icon, 40)}
      </motion.div>
      <motion.h3 
        className={`text-xl font-bold text-blue-300`}
        whileHover={{ scale: 1.05 }}
      >
        {platformOverview.learningAnalytics.title}
      </motion.h3>
    </motion.div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {platformOverview.learningAnalytics.stats.map((stat, idx) => (
        <motion.div 
          key={idx} 
          className={`p-4 rounded-xl ${stat.color.bg} border border-white/10`}
          whileHover={{ 
            scale: 1.05, 
            backgroundColor: `${stat.color.light}20`,
            y: -3
          }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className={`p-2 rounded-lg ${stat.color.bg} border border-white/10`}
              whileHover={{ rotate: 360 }} 
              transition={{ duration: 0.5 }}
            >
              {renderIcon(stat.icon, 24)}
            </motion.div>
            <div>
              <p className={`text-sm text-blue-200`}>{stat.label}</p>
              <h4 className="text-xl font-bold text-white">{stat.value}</h4>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={platformOverview.learningAnalytics.chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={platformOverview.learningAnalytics.color.light} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={platformOverview.learningAnalytics.color.light} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis dataKey="name" stroke="white" />
          <YAxis stroke="white" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.95)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '8px', 
              color: '#fff' 
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={platformOverview.learningAnalytics.color.light} 
            fillOpacity={1} 
            fill="url(#colorValue)" 
            strokeWidth={3}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const CoursePerformanceCard = () => (
  <motion.div 
    className={`p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg`}
    whileHover={{ 
      scale: 1.02, 
      boxShadow: `0 25px 50px -12px ${platformOverview.coursePerformance.color.light}60`,
      y: -5
    }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <motion.div className="flex items-center gap-4 mb-6" whileHover={{ x: 5 }}>
      <motion.div 
        className={`p-3 rounded-xl ${platformOverview.coursePerformance.color.bg} border border-white/10`}
        whileHover={{ rotate: 360 }} 
        transition={{ duration: 0.5 }}
      >
        {renderIcon(platformOverview.coursePerformance.icon, 40)}
      </motion.div>
      <motion.h3 
        className={`text-xl font-bold text-emerald-300`}
        whileHover={{ scale: 1.05 }}
      >
        {platformOverview.coursePerformance.title}
      </motion.h3>
    </motion.div>
    <div className="h-[200px] mb-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={platformOverview.coursePerformance.subjects}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis dataKey="name" stroke="white" />
          <YAxis stroke="white" domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.95)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '8px', 
              color: '#fff' 
            }} 
          />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
          >
            {platformOverview.coursePerformance.subjects.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color.light} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={platformOverview.coursePerformance.progressData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis dataKey="name" stroke="white" />
          <YAxis stroke="white" domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.95)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '8px', 
              color: '#fff' 
            }} 
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={platformOverview.coursePerformance.color.light} 
            strokeWidth={3} 
            dot={{ 
              fill: platformOverview.coursePerformance.color.light, 
              strokeWidth: 2, 
              r: 5 
            }} 
            activeDot={{ r: 8, stroke: platformOverview.coursePerformance.color.dark, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const StudentEngagementCard = () => (
  <motion.div 
    className={`p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg`}
    whileHover={{ 
      scale: 1.02, 
      boxShadow: `0 25px 50px -12px ${platformOverview.studentEngagement.color.light}60`,
      y: -5
    }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <motion.div className="flex items-center gap-4 mb-6" whileHover={{ x: 5 }}>
      <motion.div 
        className={`p-3 rounded-xl ${platformOverview.studentEngagement.color.bg} border border-white/10`}
        whileHover={{ rotate: 360 }} 
        transition={{ duration: 0.5 }}
      >
        {renderIcon(platformOverview.studentEngagement.icon, 40)}
      </motion.div>
      <motion.h3 
        className={`text-xl font-bold text-amber-300`}
        whileHover={{ scale: 1.05 }}
      >
        {platformOverview.studentEngagement.title}
      </motion.h3>
    </motion.div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {platformOverview.studentEngagement.metrics.map((metric, idx) => (
        <motion.div 
          key={idx} 
          className={`p-4 rounded-xl ${metric.color.bg} border border-white/10`}
          whileHover={{ 
            scale: 1.05, 
            backgroundColor: `${metric.color.light}20`,
            y: -3
          }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className={`p-2 rounded-lg ${metric.color.bg} border border-white/10`}
              whileHover={{ rotate: 360 }} 
              transition={{ duration: 0.5 }}
            >
              {renderIcon(metric.icon, 24)}
            </motion.div>
            <div>
              <p className={`text-sm text-amber-200`}>{metric.label}</p>
              <h4 className="text-xl font-bold text-white">{metric.value}</h4>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={platformOverview.studentEngagement.engagementData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis dataKey="name" stroke="white" />
          <YAxis stroke="white" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.95)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '8px', 
              color: '#fff' 
            }} 
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={platformOverview.studentEngagement.color.light} 
            strokeWidth={3} 
            dot={{ 
              fill: platformOverview.studentEngagement.color.light, 
              strokeWidth: 2, 
              r: 5 
            }} 
            activeDot={{ r: 8, stroke: platformOverview.studentEngagement.color.dark, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const AchievementProgressCard = () => (
  <motion.div 
    className={`p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg`}
    whileHover={{ 
      scale: 1.02, 
      boxShadow: `0 25px 50px -12px ${platformOverview.achievementProgress.color.light}60`,
      y: -5
    }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <motion.div className="flex items-center gap-4 mb-6" whileHover={{ x: 5 }}>
      <motion.div 
        className={`p-3 rounded-xl ${platformOverview.achievementProgress.color.bg} border border-white/10`}
        whileHover={{ rotate: 360 }} 
        transition={{ duration: 0.5 }}
      >
        {renderIcon(platformOverview.achievementProgress.icon, 40)}
      </motion.div>
      <motion.h3 
        className={`text-xl font-bold text-purple-300`}
        whileHover={{ scale: 1.05 }}
      >
        {platformOverview.achievementProgress.title}
      </motion.h3>
    </motion.div>
    <div className="space-y-4">
      {platformOverview.achievementProgress.goals.map((goal, idx) => (
        <motion.div 
          key={idx} 
          className={`p-4 rounded-xl ${goal.color.bg} border border-white/10`}
          whileHover={{ 
            scale: 1.05, 
            backgroundColor: `${goal.color.light}20`,
            y: -2
          }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div 
              className={`p-2 rounded-lg ${goal.color.bg} border border-white/10`}
              whileHover={{ rotate: 360 }} 
              transition={{ duration: 0.5 }}
            >
              {renderIcon(goal.icon, 24)}
            </motion.div>
            <div>
              <p className={`text-sm text-purple-200`}>{goal.label}</p>
              <h4 className="text-xl font-bold text-white">{goal.value}</h4>
            </div>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              whileInView={{ width: `${goal.progress}%` }} 
              transition={{ duration: 1, delay: idx * 0.1 }}
              className="h-full rounded-full" 
              style={{ backgroundColor: goal.color.light }} 
            />
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const PlatformOverviewSection = () => (
  <section id="overview">
    <div className="py-16 bg-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle>Platform Overview</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LearningAnalyticsCard />
          <CoursePerformanceCard />
          <StudentEngagementCard />
          <AchievementProgressCard />
        </div>
      </div>
    </div>
  </section>
);

export default PlatformOverviewSection;