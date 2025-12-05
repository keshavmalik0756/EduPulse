import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  Settings, Shield, Bell, Eye, Lock, Trash2, Save, X, AlertTriangle,
  CheckCircle, Download, RefreshCw, Key, Mail, Clock, Target, Volume2,
  Subtitles, Zap, Moon, Sun, Accessibility, ArrowLeft, BookOpen, Users
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://edupulse-ko2w.onrender.com';

const ProfileSettings = ({ onClose }) => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('learning');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [settings, setSettings] = useState({
    learning: {
      studyReminders: true,
      dailyGoal: 60,
      preferredStudyTime: 'morning',
      difficultyLevel: 'intermediate',
      autoPlayVideos: true,
      showSubtitles: true,
      playbackSpeed: 1.0,
      darkModeForReading: false
    },
    notifications: {
      courseDeadlines: true,
      assignmentReminders: true,
      gradeUpdates: true,
      newCourseContent: true,
      discussionReplies: true,
      weeklyProgress: true,
      achievementUnlocked: true,
      studyStreakReminders: true,
      emailDigest: 'weekly'
    },
    privacy: {
      profileVisibility: 'public',
      showProgress: true,
      showAchievements: true,
      allowStudyBuddyRequests: true,
      shareStudyStats: false,
      showOnlineStatus: true
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: false,
      colorBlindSupport: false
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: 120,
      autoLogout: false,
      deviceTrust: true
    }
  });

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/settings`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async (section, newSettings) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ section, settings: newSettings })
      });

      const data = await response.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, [section]: newSettings }));
        toast.success('Settings updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update settings');
      }
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (section, key, value) => {
    const newSettings = { ...settings[section], [key]: value };
    setSettings(prev => ({ ...prev, [section]: newSettings }));
    updateSettings(section, newSettings);
  };

  const exportData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/export-data`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-data-${user?.name?.replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      toast.error('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/delete-account`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Account deleted successfully');
        localStorage.removeItem('token');
        window.location.href = '/';
      } else {
        toast.error(data.message || 'Failed to delete account');
      }
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const getRoleConfig = () => {
    switch (user?.role) {
      case 'educator':
        return { gradient: 'from-emerald-500 to-teal-500', color: 'emerald' };
      case 'admin':
        return { gradient: 'from-rose-500 to-pink-500', color: 'rose' };
      default:
        return { gradient: 'from-indigo-500 to-purple-500', color: 'indigo' };
    }
  };

  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'student':
        return '/dashboard/student';
      case 'educator':
        return '/educator/dashboard';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/home';
    }
  };

  const handleBackNavigation = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(getDashboardRoute());
    }
  };

  const roleConfig = getRoleConfig();

  const sections = [
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data', icon: Download },
    { id: 'danger', label: 'Account', icon: AlertTriangle }
  ];

  const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <button
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-all ${
        checked ? `bg-gradient-to-r ${roleConfig.gradient}` : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
        checked ? 'left-7' : 'left-1'
      }`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              title="Back to Profile"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-600 text-sm mt-1">Manage your preferences and account</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackNavigation}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sticky top-6">
              <nav className="space-y-2">
                {sections.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === id
                        ? `bg-gradient-to-r ${roleConfig.gradient} text-white shadow-lg`
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">

              {/* Learning Preferences */}
              {activeSection === 'learning' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Learning Preferences</h2>

                  {/* Daily Study Goal */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600" />
                      Daily Study Goal (minutes)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="15"
                        max="480"
                        step="15"
                        value={settings.learning.dailyGoal}
                        onChange={(e) => handleSettingChange('learning', 'dailyGoal', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-lg font-bold text-indigo-600 min-w-[60px]">
                        {settings.learning.dailyGoal}m
                      </span>
                    </div>
                  </div>

                  {/* Preferred Study Time */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Preferred Study Time
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'morning', label: 'Morning', icon: Sun },
                        { value: 'afternoon', label: 'Afternoon', icon: Sun },
                        { value: 'evening', label: 'Evening', icon: Moon }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => handleSettingChange('learning', 'preferredStudyTime', value)}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            settings.learning.preferredStudyTime === value
                              ? `border-indigo-600 bg-indigo-50 text-indigo-900`
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1" />
                          <div className="text-xs font-medium">{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Level */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      Learning Difficulty
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'beginner', label: 'Beginner' },
                        { value: 'intermediate', label: 'Intermediate' },
                        { value: 'advanced', label: 'Advanced' }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => handleSettingChange('learning', 'difficultyLevel', value)}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            settings.learning.difficultyLevel === value
                              ? `border-indigo-600 bg-gradient-to-r ${roleConfig.gradient} text-white`
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="text-sm font-medium">{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Video Settings */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-indigo-600" />
                      Video Preferences
                    </h3>
                    {[
                      { key: 'autoPlayVideos', label: 'Auto-play Videos' },
                      { key: 'showSubtitles', label: 'Show Subtitles' },
                      { key: 'darkModeForReading', label: 'Dark Mode for Reading' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{label}</span>
                        <ToggleSwitch
                          checked={settings.learning[key]}
                          onChange={(val) => handleSettingChange('learning', key, val)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Playback Speed */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Playback Speed</label>
                    <select
                      value={settings.learning.playbackSpeed}
                      onChange={(e) => handleSettingChange('learning', 'playbackSpeed', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value={0.5}>0.5x (Slow)</option>
                      <option value={0.75}>0.75x</option>
                      <option value={1.0}>1.0x (Normal)</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x (Fast)</option>
                      <option value={2.0}>2.0x (Very Fast)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Course Notifications</h3>
                    {[
                      { key: 'courseDeadlines', label: 'Course Deadlines' },
                      { key: 'assignmentReminders', label: 'Assignment Reminders' },
                      { key: 'gradeUpdates', label: 'Grade Updates' },
                      { key: 'newCourseContent', label: 'New Course Content' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{label}</span>
                        <ToggleSwitch
                          checked={settings.notifications[key]}
                          onChange={(val) => handleSettingChange('notifications', key, val)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Social & Progress</h3>
                    {[
                      { key: 'discussionReplies', label: 'Discussion Replies' },
                      { key: 'weeklyProgress', label: 'Weekly Progress Report' },
                      { key: 'achievementUnlocked', label: 'Achievement Unlocked' },
                      { key: 'studyStreakReminders', label: 'Study Streak Reminders' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{label}</span>
                        <ToggleSwitch
                          checked={settings.notifications[key]}
                          onChange={(val) => handleSettingChange('notifications', key, val)}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Email Digest</label>
                    <select
                      value={settings.notifications.emailDigest}
                      onChange={(e) => handleSettingChange('notifications', 'emailDigest', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Privacy */}
              {activeSection === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Privacy Settings</h2>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Profile Visibility</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'public', label: 'Public' },
                        { value: 'classmates', label: 'Classmates' },
                        { value: 'private', label: 'Private' }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => handleSettingChange('privacy', 'profileVisibility', value)}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            settings.privacy.profileVisibility === value
                              ? `border-indigo-600 bg-indigo-50 text-indigo-900`
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="text-sm font-medium">{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Progress Sharing</h3>
                    {[
                      { key: 'showProgress', label: 'Show Learning Progress' },
                      { key: 'showAchievements', label: 'Show Achievements' },
                      { key: 'shareStudyStats', label: 'Share Study Statistics' },
                      { key: 'allowStudyBuddyRequests', label: 'Allow Study Buddy Requests' },
                      { key: 'showOnlineStatus', label: 'Show Online Status' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{label}</span>
                        <ToggleSwitch
                          checked={settings.privacy[key]}
                          onChange={(val) => handleSettingChange('privacy', key, val)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accessibility */}
              {activeSection === 'accessibility' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Accessibility</h2>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Font Size</label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'large', label: 'Large' },
                        { value: 'extra-large', label: 'XL' }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => handleSettingChange('accessibility', 'fontSize', value)}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            settings.accessibility.fontSize === value
                              ? `border-indigo-600 bg-gradient-to-r ${roleConfig.gradient} text-white`
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="text-sm font-medium">{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Features</h3>
                    {[
                      { key: 'highContrast', label: 'High Contrast Mode' },
                      { key: 'reducedMotion', label: 'Reduced Motion' },
                      { key: 'screenReader', label: 'Screen Reader Support' },
                      { key: 'keyboardNavigation', label: 'Enhanced Keyboard Navigation' },
                      { key: 'colorBlindSupport', label: 'Color Blind Support' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{label}</span>
                        <ToggleSwitch
                          checked={settings.accessibility[key]}
                          onChange={(val) => handleSettingChange('accessibility', key, val)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security */}
              {activeSection === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Security</h2>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <Key className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-yellow-800 mt-1">Protect your account with an extra layer of security</p>
                        <button className={`mt-3 px-4 py-2 rounded-lg font-medium transition-all ${
                          settings.security.twoFactorEnabled
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : `bg-gradient-to-r ${roleConfig.gradient} text-white hover:shadow-lg`
                        }`}>
                          {settings.security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Session Security</h3>
                    {[
                      { key: 'loginAlerts', label: 'Login Alerts' },
                      { key: 'autoLogout', label: 'Auto-logout on Inactivity' },
                      { key: 'deviceTrust', label: 'Remember Trusted Devices' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{label}</span>
                        <ToggleSwitch
                          checked={settings.security[key]}
                          onChange={(val) => handleSettingChange('security', key, val)}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Session Timeout</label>
                    <select
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours (Recommended)</option>
                      <option value={240}>4 hours</option>
                      <option value={480}>8 hours</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Data & Export */}
              {activeSection === 'data' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Data & Export</h2>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900">Export Your Data</h3>
                        <p className="text-sm text-blue-800 mt-1">Download a copy of all your profile and learning data</p>
                        <button
                          onClick={exportData}
                          className={`mt-3 px-4 py-2 bg-gradient-to-r ${roleConfig.gradient} text-white rounded-lg hover:shadow-lg transition-all`}
                        >
                          Export Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Management */}
              {activeSection === 'danger' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Account Management</h2>

                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900">Permanently Delete Account</h3>
                        <p className="text-sm text-red-800 mt-1">⚠️ This action cannot be undone. All your data will be permanently deleted.</p>
                        
                        {!showDeleteConfirm ? (
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                          >
                            Delete Account
                          </button>
                        ) : (
                          <div className="mt-4 space-y-3">
                            <input
                              type="text"
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value)}
                              placeholder='Type "DELETE MY ACCOUNT"'
                              className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={deleteAccount}
                                disabled={deleteConfirmText !== 'DELETE MY ACCOUNT'}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                Confirm Delete
                              </button>
                              <button
                                onClick={() => {
                                  setShowDeleteConfirm(false);
                                  setDeleteConfirmText('');
                                }}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
