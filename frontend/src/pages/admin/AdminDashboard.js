import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, FileText, MapPin, BarChart3, Users, LogOut,
  TrendingUp, Package, Eye, IndianRupee, ChevronRight, Plus,
  Activity, Phone, Globe, Clock, Zap, RefreshCw, Sparkles, Stethoscope,
  Home, ShoppingCart, Lock, Settings, Calendar, Filter, ChevronDown
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Date range presets
const DATE_PRESETS = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 14 Days', value: 14 },
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 3 Months', value: 90 },
  { label: 'Last 6 Months', value: 180 },
  { label: 'Last 1 Year', value: 365 }
];

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [liveAnalytics, setLiveAnalytics] = useState(null);
  const [pageAnalytics, setPageAnalytics] = useState(null);
  const [leadsData, setLeadsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Date filter state
  const [selectedDays, setSelectedDays] = useState(7);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dayWiseData, setDayWiseData] = useState(null);
  const [loadingDayWise, setLoadingDayWise] = useState(false);
  
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('adminToken');

  const fetchAllData = useCallback(async () => {
    if (!adminToken) {
      navigate('/admin');
      return;
    }

    try {
      const headers = { 'X-Admin-Token': adminToken };
      
      const [overviewRes, liveRes, pagesRes, leadsRes] = await Promise.all([
        axios.get(`${API}/admin/analytics/overview`, { headers }),
        axios.get(`${API}/admin/analytics/live`, { headers }),
        axios.get(`${API}/admin/analytics/pages?days=7`, { headers }),
        axios.get(`${API}/admin/analytics/leads`, { headers })
      ]);
      
      setAnalytics(overviewRes.data);
      setLiveAnalytics(liveRes.data);
      setPageAnalytics(pagesRes.data);
      setLeadsData(leadsRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  }, [adminToken, navigate]);

  // Fetch day-wise analytics data with date filter
  const fetchDayWiseData = useCallback(async (days, startDate = null, endDate = null) => {
    if (!adminToken) return;
    
    setLoadingDayWise(true);
    try {
      const headers = { 'X-Admin-Token': adminToken };
      let url = `${API}/admin/analytics/daywise?days=${days}`;
      
      if (startDate && endDate) {
        url = `${API}/admin/analytics/daywise?start_date=${startDate}&end_date=${endDate}`;
      }
      
      const res = await axios.get(url, { headers });
      setDayWiseData(res.data);
    } catch (err) {
      console.error('Error fetching day-wise data:', err);
    } finally {
      setLoadingDayWise(false);
    }
  }, [adminToken]);

  useEffect(() => {
    fetchAllData();
    fetchDayWiseData(selectedDays);
    
    // Refresh live data every 30 seconds
    const interval = setInterval(() => {
      if (adminToken) {
        axios.get(`${API}/admin/analytics/live`, { headers: { 'X-Admin-Token': adminToken } })
          .then(res => setLiveAnalytics(res.data))
          .catch(() => {});
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchAllData, fetchDayWiseData, adminToken, selectedDays]);

  // Handle date preset change
  const handlePresetChange = (days) => {
    setSelectedDays(days);
    setCustomStartDate('');
    setCustomEndDate('');
    setShowDatePicker(false);
    fetchDayWiseData(days);
  };

  // Handle custom date range
  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      fetchDayWiseData(0, customStartDate, customEndDate);
      setShowDatePicker(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.new.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    try {
      await axios.post(`${API}/admin/change-password`, {
        current_password: passwordData.current,
        new_password: passwordData.new
      }, {
        headers: { 'X-Admin-Token': adminToken }
      });
      
      setPasswordSuccess('Password changed successfully! Please login again.');
      setTimeout(() => {
        localStorage.removeItem('adminToken');
        navigate('/admin');
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200 z-40 hidden lg:block">
        <div className="p-6">
          <h1 className="text-xl font-bold text-green-500">Celesta Glow</h1>
          <p className="text-sm text-gray-500">Admin Panel</p>
        </div>

        <nav className="px-4 space-y-1">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-green-600 bg-green-50 rounded-xl font-medium" data-testid="nav-dashboard">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/blogs" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl" data-testid="nav-blogs">
            <FileText size={20} /> Blog Posts
          </Link>
          <Link to="/admin/locations" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl" data-testid="nav-locations">
            <MapPin size={20} /> Location Pages
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl" data-testid="nav-orders">
            <Package size={20} /> Orders
          </Link>
          <Link to="/admin/ai-studio" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl" data-testid="nav-ai">
            <Sparkles size={20} /> AI Studio
          </Link>
          <Link to="/admin/consultations" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl" data-testid="nav-consultations">
            <Stethoscope size={20} /> Consultations
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200">
          <button 
            onClick={() => setShowPasswordModal(true)} 
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl w-full mb-2"
            data-testid="settings-btn"
          >
            <Settings size={20} /> Settings
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl w-full" data-testid="logout-btn">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-green-500">Admin</h1>
          <button onClick={handleLogout} className="text-gray-600"><LogOut size={20} /></button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Page Header with Refresh */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-500 mt-1">Real-time analytics & insights</p>
            </div>
            <button 
              onClick={fetchAllData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['overview', 'live', 'pages', 'leads'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'live' && `Live (${liveAnalytics?.live_visitors?.total || 0})`}
                {tab === 'pages' && 'Page Analytics'}
                {tab === 'leads' && `Leads (${leadsData?.stats?.total_leads || 0})`}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Live Visitors Banner */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 mb-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-green-100 text-sm">Live Visitors Now</p>
                      <p className="text-2xl sm:text-3xl font-bold truncate">{liveAnalytics?.live_visitors?.total || 0}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm">Total Visits</p>
                    <p className="text-xl sm:text-2xl font-bold truncate">{liveAnalytics?.total_visits?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>

              {/* Page Visit Totals */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-100" data-testid="stat-homepage">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-gray-500 truncate">Homepage</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {(liveAnalytics?.page_totals?.Homepage || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100" data-testid="stat-product">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-gray-500 truncate">Product</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {(liveAnalytics?.page_totals?.['Product Page'] || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100" data-testid="stat-checkout">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-500 truncate">Checkout</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {(liveAnalytics?.page_totals?.Checkout || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 overflow-hidden" data-testid="stat-orders">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{analytics?.total_orders || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Total Orders</p>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 overflow-hidden" data-testid="stat-revenue">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IndianRupee className="w-5 h-5 text-green-600" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">₹{analytics?.total_revenue?.toLocaleString() || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Revenue</p>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 overflow-hidden" data-testid="stat-leads">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{leadsData?.stats?.total_leads || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Phone Leads</p>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 overflow-hidden" data-testid="stat-blogs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{analytics?.total_blogs || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Blog Posts</p>
                </div>
              </div>

              {/* Top Locations */}
              {liveAnalytics?.top_locations?.top_states?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-500" />
                    Top Visitor Locations
                  </h3>
                  <div className="space-y-3">
                    {liveAnalytics.top_locations.top_states.slice(0, 5).map((loc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="font-medium text-gray-900">{loc.location}</span>
                        </div>
                        <span className="text-green-600 font-semibold">{loc.visits} orders</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link to="/admin/blogs/new" className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Plus className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-700">Create Blog Post</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-green-600" />
                    </Link>
                    <Link to="/admin/ai-studio" className="flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-700">AI Content Studio</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-purple-600" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
                  {analytics?.recent_orders?.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.recent_orders.slice(0, 3).map((order) => (
                        <div key={order.order_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900">{order.name}</p>
                            <p className="text-xs text-gray-500">{order.order_id}</p>
                          </div>
                          <p className="font-bold text-green-600">₹{order.amount}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No orders yet</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Live Tab */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="font-semibold text-gray-900">Live Visitors by Page</h3>
                </div>
                
                {Object.keys(liveAnalytics?.live_visitors?.by_page || {}).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(liveAnalytics.live_visitors.by_page).map(([page, count]) => (
                      <div key={page} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{page}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-green-500" />
                          <span className="font-bold text-green-600">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No live visitors at the moment</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pages Tab */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              {/* Date Filter Section */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-green-500" />
                    Date Range Filter
                  </h3>
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200"
                  >
                    <Calendar className="w-4 h-4" />
                    Custom Date
                    <ChevronDown className={`w-4 h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {/* Preset Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {DATE_PRESETS.map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => handlePresetChange(preset.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDays === preset.value && !customStartDate
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      data-testid={`filter-${preset.value}d`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                
                {/* Custom Date Picker */}
                {showDatePicker && (
                  <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        data-testid="start-date-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        data-testid="end-date-input"
                      />
                    </div>
                    <button
                      onClick={handleCustomDateApply}
                      disabled={!customStartDate || !customEndDate}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="apply-date-btn"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Day-wise Analytics Table */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  Day-wise Visitor Analytics
                  {loadingDayWise && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
                </h3>
                
                {dayWiseData?.daily_stats?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Home className="w-4 h-4" /> Homepage
                            </div>
                          </th>
                          <th className="pb-3 font-medium text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Package className="w-4 h-4" /> Product
                            </div>
                          </th>
                          <th className="pb-3 font-medium text-center">
                            <div className="flex items-center justify-center gap-1">
                              <ShoppingCart className="w-4 h-4" /> Checkout
                            </div>
                          </th>
                          <th className="pb-3 font-medium text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayWiseData.daily_stats.map((day, i) => (
                          <tr key={day.date} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                            <td className="py-3 font-medium text-gray-900">
                              {new Date(day.date).toLocaleDateString('en-IN', { 
                                weekday: 'short', 
                                day: 'numeric', 
                                month: 'short' 
                              })}
                            </td>
                            <td className="py-3 text-center">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {day.homepage || 0}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                {day.product || 0}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                {day.checkout || 0}
                              </span>
                            </td>
                            <td className="py-3 text-center font-bold text-gray-900">
                              {day.total || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-green-50 font-bold">
                          <td className="py-3 text-gray-900">Total</td>
                          <td className="py-3 text-center text-blue-700">
                            {dayWiseData.totals?.homepage || 0}
                          </td>
                          <td className="py-3 text-center text-purple-700">
                            {dayWiseData.totals?.product || 0}
                          </td>
                          <td className="py-3 text-center text-green-700">
                            {dayWiseData.totals?.checkout || 0}
                          </td>
                          <td className="py-3 text-center text-gray-900">
                            {dayWiseData.totals?.total || 0}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No visitor data for selected date range</p>
                  </div>
                )}
              </div>

              {/* Page Performance Summary */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-6">Page Performance Summary</h3>
                
                {Object.keys(pageAnalytics?.page_analytics?.page_totals || {}).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(pageAnalytics.page_analytics.page_totals)
                      .sort(([,a], [,b]) => b - a)
                      .map(([page, visits]) => {
                        const maxVisits = Math.max(...Object.values(pageAnalytics.page_analytics.page_totals));
                        const percentage = Math.min(100, (visits / maxVisits) * 100);
                        return (
                          <div key={page} className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                              <Globe className="w-5 h-5 text-gray-400" />
                              <span className="font-medium text-gray-900">{page}</span>
                            </div>
                            <div className="relative h-8 bg-gray-200 rounded-lg overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-lg flex items-center justify-end pr-3 transition-all"
                                style={{ width: `${Math.max(percentage, 15)}%` }}
                              >
                                {percentage >= 15 && (
                                  <span className="font-bold text-white text-sm">{visits.toLocaleString()}</span>
                                )}
                              </div>
                              {percentage < 15 && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-700 text-sm">
                                  {visits.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No page data available yet</p>
                  </div>
                )}
              </div>

              {/* Hourly Distribution */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Hourly Traffic Distribution
                </h3>
                <div className="flex items-end gap-1 h-32">
                  {Object.entries(pageAnalytics?.hourly_distribution || {}).map(([hour, count]) => {
                    const maxCount = Math.max(...Object.values(pageAnalytics?.hourly_distribution || {1: 1}));
                    const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                      <div key={hour} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-green-500 rounded-t transition-all"
                          style={{ height: `${Math.max(4, height)}%` }}
                          title={`${hour}:00 - ${count} visits`}
                        />
                        {parseInt(hour) % 4 === 0 && (
                          <span className="text-xs text-gray-400 mt-1">{hour}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              {/* Leads Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <p className="text-2xl font-bold text-gray-900">{leadsData?.stats?.total_leads || 0}</p>
                  <p className="text-sm text-gray-500">Total Leads</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <p className="text-2xl font-bold text-green-600">{leadsData?.stats?.converted_leads || 0}</p>
                  <p className="text-sm text-gray-500">Converted</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <p className="text-2xl font-bold text-blue-600">{leadsData?.stats?.conversion_rate || 0}%</p>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <p className="text-2xl font-bold text-purple-600">{leadsData?.stats?.today_leads || 0}</p>
                  <p className="text-sm text-gray-500">Today's Leads</p>
                </div>
              </div>

              {/* Leads List */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-6">Visitor Phone Numbers</h3>
                
                {leadsData?.leads?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3 font-medium">Phone</th>
                          <th className="pb-3 font-medium">Page</th>
                          <th className="pb-3 font-medium">Discount</th>
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leadsData.leads.slice(0, 20).map((lead) => (
                          <tr key={lead.id} className="border-b last:border-0">
                            <td className="py-3 font-medium text-gray-900">+91 {lead.phone}</td>
                            <td className="py-3 text-gray-600">{lead.page}</td>
                            <td className="py-3">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                ₹{lead.discount_amount} OFF
                              </span>
                            </td>
                            <td className="py-3 text-gray-500 text-sm">
                              {new Date(lead.claimed_at).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                lead.converted 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {lead.converted ? 'Converted' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Phone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No leads collected yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          <Link to="/admin/dashboard" className="flex flex-col items-center p-2 text-green-600">
            <LayoutDashboard size={20} />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link to="/admin/blogs" className="flex flex-col items-center p-2 text-gray-500">
            <FileText size={20} />
            <span className="text-xs mt-1">Blogs</span>
          </Link>
          <Link to="/admin/ai-studio" className="flex flex-col items-center p-2 text-gray-500">
            <Sparkles size={20} />
            <span className="text-xs mt-1">AI</span>
          </Link>
          <Link to="/admin/orders" className="flex flex-col items-center p-2 text-gray-500">
            <Package size={20} />
            <span className="text-xs mt-1">Orders</span>
          </Link>
        </div>
      </nav>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" data-testid="password-modal">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm">
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Enter current password"
                  data-testid="current-password-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Min 8 characters"
                  data-testid="new-password-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Confirm new password"
                  data-testid="confirm-password-input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ current: '', new: '', confirm: '' });
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600"
                data-testid="change-password-btn"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
