import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, FileText, MapPin, BarChart3, Users, LogOut,
  TrendingUp, Package, Eye, IndianRupee, ChevronRight, Plus,
  Activity, Phone, Globe, Clock, Zap, RefreshCw, Sparkles
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [liveAnalytics, setLiveAnalytics] = useState(null);
  const [pageAnalytics, setPageAnalytics] = useState(null);
  const [leadsData, setLeadsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
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

  useEffect(() => {
    fetchAllData();
    
    // Refresh live data every 30 seconds
    const interval = setInterval(() => {
      if (adminToken) {
        axios.get(`${API}/admin/analytics/live`, { headers: { 'X-Admin-Token': adminToken } })
          .then(res => setLiveAnalytics(res.data))
          .catch(() => {});
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchAllData, adminToken]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
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
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-green-100 text-sm">Live Visitors Now</p>
                      <p className="text-3xl font-bold">{liveAnalytics?.live_visitors?.total || 0}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm">Total Visits</p>
                    <p className="text-2xl font-bold">{liveAnalytics?.total_visits?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-5 border border-gray-100" data-testid="stat-orders">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.total_orders || 0}</p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100" data-testid="stat-revenue">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-green-600" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">₹{analytics?.total_revenue?.toLocaleString() || 0}</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100" data-testid="stat-leads">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{leadsData?.stats?.total_leads || 0}</p>
                  <p className="text-sm text-gray-500">Phone Leads</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100" data-testid="stat-blogs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.total_blogs || 0}</p>
                  <p className="text-sm text-gray-500">Blog Posts</p>
                </div>
              </div>

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
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-6">Page Performance (Last 7 Days)</h3>
                
                {Object.keys(pageAnalytics?.page_analytics?.page_totals || {}).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(pageAnalytics.page_analytics.page_totals)
                      .sort(([,a], [,b]) => b - a)
                      .map(([page, visits]) => (
                        <div key={page} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900">{page}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ 
                                  width: `${Math.min(100, (visits / Math.max(...Object.values(pageAnalytics.page_analytics.page_totals))) * 100)}%` 
                                }}
                              />
                            </div>
                            <span className="font-bold text-gray-900 w-16 text-right">{visits.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
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
    </div>
  );
}

export default AdminDashboard;
