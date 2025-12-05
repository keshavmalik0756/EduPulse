import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Camera, Edit3, Save, X, Upload, Trash2, FileText,
  CheckCircle, AlertCircle, BookOpen, Mail, Calendar, TrendingUp,
  BarChart3, Eye, EyeOff, Copy, RefreshCw, Lock, Award, Clock,
  Star, Settings, ArrowLeft, Zap, Target, Shield, Bell
} from 'lucide-react';
import { getUser } from '../redux/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://edupulse-ko2w.onrender.com';

const Profile = ({ onClose }) => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    description: user?.description || '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileStats, setProfileStats] = useState(null);
  const [showPhotoUrl, setShowPhotoUrl] = useState(false);

  // Fetch profile stats
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        description: user.description || '',
      });
      setAvatarPreview(user.avatar?.url || null);
      fetchProfileStats();
    }
  }, [user]);

  const fetchProfileStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile/complete`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setProfileStats(data);
      }
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const updateField = async (fieldName, value) => {
    if (!value.trim()) {
      toast.error(`${fieldName} cannot be empty`);
      return;
    }

    setIsUploading(true);
    try {
      const endpoint = `${API_BASE_URL}/api/users/profile`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [fieldName]: value })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully!`);
        setEditingField(null);
        dispatch(getUser());
      } else {
        toast.error(data.message || `Failed to update ${fieldName}`);
      }
    } catch (error) {
      toast.error(`Failed to update ${fieldName}`);
    } finally {
      setIsUploading(false);
    }
  };

  const updateAvatar = async () => {
    if (!avatar) return;
    setIsUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('avatar', avatar);

      const response = await fetch(`${API_BASE_URL}/api/users/avatar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formDataToSend
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Avatar updated successfully!');
        setAvatar(null);
        dispatch(getUser());
      } else {
        toast.error(data.message || 'Failed to update avatar');
      }
    } catch (error) {
      toast.error('Failed to update avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    setIsUploading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/avatar`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Avatar removed successfully!');
        setAvatarPreview(null);
        setAvatar(null);
        dispatch(getUser());
      } else {
        toast.error(data.message || 'Failed to remove avatar');
      }
    } catch (error) {
      toast.error('Failed to remove avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const getRoleConfig = () => {
    switch (user?.role) {
      case 'educator':
        return {
          gradient: 'from-emerald-500 to-teal-500',
          bgGradient: 'from-emerald-900/20 to-teal-900/20',
          color: 'emerald',
          title: 'Educator',
          badge: 'EDUCATOR',
          icon: BookOpen
        };
      case 'admin':
        return {
          gradient: 'from-rose-500 to-pink-500',
          bgGradient: 'from-rose-900/20 to-pink-900/20',
          color: 'rose',
          title: 'Administrator',
          badge: 'ADMIN',
          icon: Shield
        };
      default:
        return {
          gradient: 'from-indigo-500 to-purple-500',
          bgGradient: 'from-indigo-900/20 to-purple-900/20',
          color: 'indigo',
          title: 'Student',
          badge: 'STUDENT',
          icon: User
        };
    }
  };

  const roleConfig = getRoleConfig();
  const RoleIcon = roleConfig.icon;

  if (!user || !profileStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 lg:py-10">
        {/* Header with Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackNavigation}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600 text-sm mt-1">Manage your account and preferences</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile/settings')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            title="Go to Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </motion.button>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8"
        >
          {/* Background Pattern */}
          <div className={`h-32 bg-gradient-to-r ${roleConfig.gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-pattern"></div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row gap-6 -mt-16 relative z-10">
              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <div className="relative group">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-all"
                    />
                  ) : (
                    <div className={`w-32 h-32 rounded-2xl bg-gradient-to-r ${roleConfig.gradient} flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-105 transition-all`}>
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}

                  {/* Avatar Actions */}
                  <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                    <label className={`p-2 bg-gradient-to-r ${roleConfig.gradient} rounded-lg cursor-pointer hover:scale-110 transition-all`}>
                      <Camera className="w-5 h-5 text-white" />
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                    {user?.avatar?.url && (
                      <button
                        onClick={removeAvatar}
                        disabled={isUploading}
                        className="p-2 bg-red-500 rounded-lg hover:scale-110 transition-all disabled:opacity-50"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>

                  {/* Upload Button */}
                  {avatar && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={updateAvatar}
                      disabled={isUploading}
                      className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r ${roleConfig.gradient} text-white rounded-full text-xs font-medium hover:shadow-lg transition-all disabled:opacity-50`}
                    >
                      {isUploading ? <RefreshCw className="w-3 h-3 animate-spin inline" /> : <Upload className="w-3 h-3 inline" />}
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 bg-gradient-to-r ${roleConfig.gradient} text-white text-xs font-bold rounded-full`}>
                    {roleConfig.badge}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {user?.name || 'User Name'}
                </h2>
                <p className="text-gray-600 mb-4">{roleConfig.title}</p>
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Profile Completeness */}
              <div className="w-full sm:w-64 pt-4">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Profile Complete</span>
                    <span className={`text-2xl font-bold bg-gradient-to-r ${roleConfig.gradient} bg-clip-text text-transparent`}>
                      {profileStats?.profileCompleteness?.percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${profileStats?.profileCompleteness?.percentage || 0}%` }}
                      transition={{ duration: 1 }}
                      className={`bg-gradient-to-r ${roleConfig.gradient} h-2 rounded-full`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { key: 'hasName', label: 'Name', icon: User },
                      { key: 'hasEmail', label: 'Email', icon: Mail },
                      { key: 'hasDescription', label: 'Bio', icon: FileText },
                      { key: 'hasPhoto', label: 'Photo', icon: Camera }
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center gap-1">
                        {profileStats?.profileCompleteness?.[key] ? (
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-gray-400" />
                        )}
                        <span className="text-gray-600">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
        >
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'edit', label: 'Edit Profile', icon: Edit3 },
            { id: 'stats', label: 'Statistics', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === id
                  ? `bg-gradient-to-r ${roleConfig.gradient} text-white shadow-lg`
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Profile Information */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Profile Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Full Name</label>
                    <p className="text-gray-900 font-medium">{user?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Email Address</label>
                    <p className="text-gray-900 font-medium break-all">{user?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Role</label>
                    <div className="flex items-center gap-2">
                      <RoleIcon className="w-4 h-4 text-indigo-600" />
                      <span className="text-gray-900 font-medium capitalize">{user?.role}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Bio</label>
                    <p className="text-gray-700 leading-relaxed">
                      {user?.description || `No bio added yet. Click edit to add one.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  {roleConfig.title} Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(profileStats?.roleStats || {}).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100 text-center"
                    >
                      <div className={`text-2xl font-bold bg-gradient-to-r ${roleConfig.gradient} bg-clip-text text-transparent mb-1`}>
                        {value}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'edit' && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                Edit Profile Information
              </h3>
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name *</label>
                  {editingField === 'name' ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                      <button
                        onClick={() => updateField('name', formData.name)}
                        disabled={isUploading}
                        className={`px-4 py-2 bg-gradient-to-r ${roleConfig.gradient} text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50`}
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingField(null);
                          setFormData(prev => ({ ...prev, name: user?.name || '' }));
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-900 font-medium">{user?.name || 'Not provided'}</span>
                      <button
                        onClick={() => setEditingField('name')}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address *</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-900 font-medium break-all">{user?.email || 'Not provided'}</span>
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Description Field */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Bio (Max 500 characters)</label>
                  {editingField === 'description' ? (
                    <div className="space-y-2">
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder="Tell us about yourself..."
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formData.description.length}/500 characters
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateField('description', formData.description)}
                            disabled={isUploading}
                            className={`px-4 py-2 bg-gradient-to-r ${roleConfig.gradient} text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50`}
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingField(null);
                              setFormData(prev => ({ ...prev, description: user?.description || '' }));
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700 flex-1">
                        {user?.description || 'No bio provided. Click edit to add one.'}
                      </p>
                      <button
                        onClick={() => setEditingField('description')}
                        className="text-indigo-600 hover:text-indigo-700 flex-shrink-0 ml-2"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Object.entries(profileStats?.roleStats || {}).map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-r ${roleConfig.gradient} rounded-lg`}>
                      {key.includes('course') ? (
                        <BookOpen className="w-5 h-5 text-white" />
                      ) : key.includes('student') ? (
                        <User className="w-5 h-5 text-white" />
                      ) : key.includes('achievement') ? (
                        <Award className="w-5 h-5 text-white" />
                      ) : (
                        <BarChart3 className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${roleConfig.gradient} bg-clip-text text-transparent mb-2`}>
                    {value}
                  </div>
                  <div className="text-gray-600 font-medium capitalize text-sm">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
