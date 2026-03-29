import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, Users, Clock, Calendar, Eye, MousePointer, 
  MapPin, Monitor, ChevronRight, ChevronDown, Home, Package,
  ShoppingCart, FileText, Filter, RefreshCw, User, Activity,
  CheckCircle, XCircle, Smartphone
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function AdminUserJourney() {
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('adminToken');
  
  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDays, setSelectedDays] = useState(7);
  const [expandedVisitor, setExpandedVisitor] = useState(null);
  const [visitorJourney, setVisitorJourney] = useState(null);
  const [loadingJourney, setLoadingJourney] = useState(false);

  const fetchData = useCallback(async () => {
    if (!adminToken) {
      navigate('/admin');
      return;
    }

    setLoading(true);
    try {
      const headers = { 'X-Admin-Token': adminToken };
      
      let visitorsUrl = `${API}/admin/user-tracking/visitors?days=${selectedDays}`;
      let statsUrl = `${API}/admin/user-tracking/stats?days=${selectedDays}`;
      
      if (selectedDate) {
        visitorsUrl = `${API}/admin/user-tracking/visitors?date=${selectedDate}`;
        statsUrl = `${API}/admin/user-tracking/stats?date=${selectedDate}`;
      }
      
      const [visitorsRes, statsRes] = await Promise.all([
        axios.get(visitorsUrl, { headers }),
        axios.get(statsUrl, { headers })
      ]);
      
      setVisitors(visitorsRes.data.visitors || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  }, [adminToken, navigate, selectedDays, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchVisitorJourney = async (visitorId) => {
    if (expandedVisitor === visitorId) {
      setExpandedVisitor(null);
      setVisitorJourney(null);
      return;
    }

    setExpandedVisitor(visitorId);
    setLoadingJourney(true);
    
    try {
      const res = await axios.get(
        `${API}/admin/user-tracking/visitor/${visitorId}`,
        { headers: { 'X-Admin-Token': adminToken } }
      );
      setVisitorJourney(res.data);
    } catch (err) {
      console.error('Error fetching journey:', err);
    } finally {
      setLoadingJourney(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '-';
    const date = new Date(ts);
    return date.toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPageIcon = (page) => {
    const p = (page || '').toLowerCase();
    if (p.includes('home')) return <Home className="w-4 h-4 text-blue-500" />;
    if (p.includes('product')) return <Package className="w-4 h-4 text-purple-500" />;
    if (p.includes('checkout')) return <ShoppingCart className="w-4 h-4 text-green-500" />;
    if (p.includes('blog')) return <FileText className="w-4 h-4 text-orange-500" />;
    return <Eye className="w-4 h-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">User Journey Tracking</h1>
                <p className="text-sm text-gray-500">Track visitor behavior across your site</p>
              </div>
            </div>
            <button 
              onClick={fetchData}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Date indicator when specific date selected */}
        {selectedDate && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              Showing data for: {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button
              onClick={() => setSelectedDate('')}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Show all dates
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Total Visitors</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total_visitors}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">New Visitors</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.new_visitors}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-500">Returning</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.returning_visitors}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-orange-500" />
                <span className="text-xs text-gray-500">Reached Checkout</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.reached_checkout}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Address Entered</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.address_entered}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-cyan-500" />
                <span className="text-xs text-gray-500">Avg. Time</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatTime(stats.avg_time_spent)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            
            {/* Date Picker */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedDays(7);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                data-testid="date-picker"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>

            <span className="text-gray-300">|</span>

            {/* Quick Filters */}
            <div className="flex gap-2">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => {
                    setSelectedDays(days);
                    setSelectedDate('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedDays === days && !selectedDate
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Last {days} days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visitors List */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Visitors ({visitors.length})</h2>
          </div>

          {visitors.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {visitors.map((visitor) => (
                <div key={visitor.visitor_id || visitor.profile?.visitor_id} className="p-4">
                  {/* Visitor Row */}
                  <button
                    onClick={() => fetchVisitorJourney(visitor.visitor_id || visitor.profile?.visitor_id)}
                    className="w-full text-left"
                    data-testid={`visitor-row-${visitor.visitor_id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          {(visitor.visitor_id || '?').charAt(2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {(visitor.visitor_id || visitor.profile?.visitor_id || 'Unknown').substring(0, 20)}...
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {visitor.pages_visited || visitor.visits_today || 0} pages
                            </span>
                            <span className="flex items-center gap-1">
                              <MousePointer className="w-3 h-3" />
                              {visitor.actions_count || visitor.actions_today || 0} actions
                            </span>
                            {visitor.profile?.total_time_spent && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(visitor.profile.total_time_spent)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Location Badge */}
                        {(visitor.location_place?.state || visitor.profile?.location_place?.state) && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {visitor.location_place?.state || visitor.profile?.location_place?.state}
                          </span>
                        )}
                        {/* Phone Badge */}
                        {(visitor.phone || visitor.profile?.phone) && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            {visitor.phone || visitor.profile?.phone}
                          </span>
                        )}
                        {/* Discount Badge */}
                        {(visitor.discount_claimed || visitor.profile?.discount_claimed) && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                            ₹{visitor.discount_amount || visitor.profile?.discount_amount || 50} OFF
                          </span>
                        )}
                        {(visitor.reached_checkout || visitor.profile?.reached_checkout) && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Checkout</span>
                        )}
                        {(visitor.address_entered || visitor.profile?.address_entered) && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Address</span>
                        )}
                        <ChevronDown 
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedVisitor === (visitor.visitor_id || visitor.profile?.visitor_id) ? 'rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Journey */}
                  {expandedVisitor === (visitor.visitor_id || visitor.profile?.visitor_id) && (
                    <div className="mt-4 pl-13 border-t border-gray-100 pt-4">
                      {loadingJourney ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="w-5 h-5 animate-spin text-green-500" />
                        </div>
                      ) : visitorJourney ? (
                        <div className="space-y-4">
                          {/* Profile Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">First Seen</p>
                              <p className="text-sm font-medium">{formatTimestamp(visitorJourney.profile?.first_seen)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">Last Seen</p>
                              <p className="text-sm font-medium">{formatTimestamp(visitorJourney.profile?.last_seen)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">Total Visits</p>
                              <p className="text-sm font-medium">{visitorJourney.profile?.total_visits || 0}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">Screen Size</p>
                              <p className="text-sm font-medium flex items-center gap-1">
                                {visitorJourney.profile?.screen_size?.includes('x') && 
                                  parseInt(visitorJourney.profile.screen_size.split('x')[0]) < 768 
                                  ? <Smartphone className="w-3 h-3" /> 
                                  : <Monitor className="w-3 h-3" />
                                }
                                {visitorJourney.profile?.screen_size || '-'}
                              </p>
                            </div>
                          </div>

                          {/* Customer Details - Phone, Location, Discount */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            {/* Phone */}
                            {visitorJourney.profile?.phone && (
                              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                <p className="text-xs text-purple-600 mb-1 flex items-center gap-1">
                                  <Smartphone className="w-3 h-3" /> Phone Number
                                </p>
                                <p className="text-sm font-bold text-purple-800">{visitorJourney.profile.phone}</p>
                              </div>
                            )}
                            
                            {/* Location */}
                            {visitorJourney.profile?.location_place && (
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                <p className="text-xs text-blue-600 mb-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> Location
                                </p>
                                <p className="text-sm font-bold text-blue-800">
                                  {visitorJourney.profile.location_place.city && `${visitorJourney.profile.location_place.city}, `}
                                  {visitorJourney.profile.location_place.state || visitorJourney.profile.location_place.district || 'Unknown'}
                                </p>
                                {visitorJourney.profile.location_place.pincode && (
                                  <p className="text-xs text-blue-600">PIN: {visitorJourney.profile.location_place.pincode}</p>
                                )}
                              </div>
                            )}
                            
                            {/* Discount Claimed */}
                            {visitorJourney.profile?.discount_claimed && (
                              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                <p className="text-xs text-green-600 mb-1 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Discount Claimed
                                </p>
                                <p className="text-sm font-bold text-green-800">
                                  ₹{visitorJourney.profile.discount_amount || 50} OFF
                                  <span className="text-xs font-normal ml-1">
                                    ({visitorJourney.profile.discount_type === 'exit' ? 'Exit Offer' : 'Welcome Offer'})
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Time by Page */}
                          {visitorJourney.time_by_page && Object.keys(visitorJourney.time_by_page).length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Time Spent by Page</h4>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(visitorJourney.time_by_page).map(([page, time]) => (
                                  <div key={page} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                    {getPageIcon(page)}
                                    <span className="text-sm text-gray-700">{page}</span>
                                    <span className="text-sm font-medium text-green-600">{formatTime(time)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Page Journey Timeline */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Page Journey</h4>
                            <div className="space-y-2">
                              {visitorJourney.page_visits?.slice(-10).map((visit, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <div className="w-8 text-center">
                                    {getPageIcon(visit.page)}
                                  </div>
                                  <div className="flex-1 bg-gray-50 rounded-lg p-2 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">{visit.page}</span>
                                    <span className="text-xs text-gray-500">{formatTimestamp(visit.timestamp)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          {visitorJourney.actions?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Actions Taken</h4>
                              <div className="flex flex-wrap gap-2">
                                {visitorJourney.actions.slice(-10).map((action, i) => (
                                  <div key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm">
                                    {action.action}
                                    {action.details?.form_name && ` (${action.details.form_name})`}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No journey data available</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No visitors tracked yet</p>
              <p className="text-sm text-gray-400 mt-1">Visitors will appear here once they browse your site</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUserJourney;
