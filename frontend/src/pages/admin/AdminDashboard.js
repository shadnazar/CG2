import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, FileText, MapPin, BarChart3, Settings, LogOut,
  TrendingUp, Package, Eye, IndianRupee, ChevronRight, Plus
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin');
      return;
    }

    fetchAnalytics();
  }, [adminToken, navigate]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API}/admin/analytics/overview`, {
        headers: { 'X-Admin-Token': adminToken }
      });
      setAnalytics(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

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
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-green-600 bg-green-50 rounded-xl font-medium"
            data-testid="nav-dashboard"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link
            to="/admin/blogs"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl"
            data-testid="nav-blogs"
          >
            <FileText size={20} />
            Blog Posts
          </Link>
          <Link
            to="/admin/locations"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl"
            data-testid="nav-locations"
          >
            <MapPin size={20} />
            Location Pages
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl"
            data-testid="nav-orders"
          >
            <Package size={20} />
            Orders
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl w-full"
            data-testid="logout-btn"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-green-500">Admin</h1>
          <button onClick={handleLogout} className="text-gray-600">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
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

            <div className="bg-white rounded-2xl p-5 border border-gray-100" data-testid="stat-blogs">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics?.total_blogs || 0}</p>
              <p className="text-sm text-gray-500">Blog Posts</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100" data-testid="stat-locations">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics?.total_locations || 0}</p>
              <p className="text-sm text-gray-500">Location Pages</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <Link
                  to="/admin/blogs/new"
                  className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                  data-testid="quick-action-blog"
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">Create Blog Post</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-600" />
                </Link>
                <Link
                  to="/admin/locations/new"
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  data-testid="quick-action-location"
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-700">Create Location Page</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </Link>
              </div>
            </div>

            {/* Top Blogs */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Top Blog Posts</h3>
                <Link to="/admin/blogs" className="text-green-500 text-sm hover:underline">
                  View All
                </Link>
              </div>
              {analytics?.top_blogs?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.top_blogs.map((blog, i) => (
                    <div key={blog.slug} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">{blog.title}</p>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm ml-4">
                        <Eye size={14} />
                        {blog.view_count || 0}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No blog posts yet</p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Orders</h3>
              <Link to="/admin/orders" className="text-green-500 text-sm hover:underline">
                View All
              </Link>
            </div>
            {analytics?.recent_orders?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3 font-medium">Order ID</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Payment</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recent_orders.map((order) => (
                      <tr key={order.order_id} className="border-b last:border-0">
                        <td className="py-3 font-medium text-gray-900">{order.order_id}</td>
                        <td className="py-3 text-gray-600">{order.name}</td>
                        <td className="py-3 text-gray-900">₹{order.amount}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.payment_method === 'COD' 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {order.payment_method}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No orders yet</p>
            )}
          </div>
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
          <Link to="/admin/locations" className="flex flex-col items-center p-2 text-gray-500">
            <MapPin size={20} />
            <span className="text-xs mt-1">Locations</span>
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
