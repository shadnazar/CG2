import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, DollarSign, MousePointer, ShoppingBag, 
  ArrowLeft, Copy, CheckCircle, RefreshCw, Gift,
  TrendingUp, Clock, ExternalLink
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [testReferralCode, setTestReferralCode] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const adminToken = sessionStorage.getItem('adminToken') || 'celestaglow2024';

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/referrals`, {
        headers: { 'X-Admin-Token': adminToken }
      });
      setReferrals(res.data.referrals || []);
      setSummary(res.data.summary || {});
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestPurchase = async () => {
    if (!testReferralCode) return;
    
    try {
      const res = await axios.post(
        `${API}/admin/referrals/test-purchase?referral_code=${testReferralCode}`,
        {},
        { headers: { 'X-Admin-Token': adminToken } }
      );
      setTestResult(res.data);
      if (res.data.success) {
        fetchReferrals(); // Refresh data
      }
    } catch (err) {
      setTestResult({ success: false, error: 'Test failed' });
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(`https://celestaglow.com?ref=${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Referral Program</h1>
              <p className="text-sm text-gray-500">Track referrals and earnings</p>
            </div>
          </div>
          <button
            onClick={fetchReferrals}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.total_referrers || 0}</p>
                <p className="text-xs text-gray-500">Total Referrers</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MousePointer className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.total_clicks || 0}</p>
                <p className="text-xs text-gray-500">Link Clicks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.total_purchases || 0}</p>
                <p className="text-xs text-gray-500">Referral Purchases</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{summary.total_earnings || 0}</p>
                <p className="text-xs text-gray-500">Total Earnings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Section */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-500" />
            Test Referral Purchase
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Simulate a purchase through a referral link to test the system
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={testReferralCode}
              onChange={(e) => setTestReferralCode(e.target.value.toUpperCase())}
              placeholder="Enter referral code (e.g., CG12AB34)"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              onClick={handleTestPurchase}
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600"
            >
              Test Purchase
            </button>
          </div>
          {testResult && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.success 
                ? `✅ Test purchase recorded! ₹${testResult.earnings_added} added to ${testResult.referrer_name}'s earnings.`
                : `❌ ${testResult.error || 'Test failed'}`
              }
            </div>
          )}
        </div>

        {/* Referrals Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Gift size={18} className="text-purple-500" />
              All Referrers ({referrals.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : referrals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No referrers yet</p>
              <p className="text-sm">Referral links are generated after each order</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Referrer</th>
                    <th className="px-4 py-3 text-left">Code</th>
                    <th className="px-4 py-3 text-center">Clicks</th>
                    <th className="px-4 py-3 text-center">Purchases</th>
                    <th className="px-4 py-3 text-right">Earnings</th>
                    <th className="px-4 py-3 text-right">Pending</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {referrals.map((ref, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{ref.referrer_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{ref.referrer_phone}</p>
                          <p className="text-xs text-gray-400">{formatDate(ref.created_at)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {ref.referral_code}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-blue-600 font-medium">{ref.total_referrals || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-green-600 font-medium">{ref.successful_purchases || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-gray-900">₹{ref.total_earnings || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-amber-600 font-medium">₹{ref.earnings_pending || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => copyToClipboard(ref.referral_code)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-green-600"
                          title="Copy referral link"
                        >
                          {copiedCode === ref.referral_code ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-purple-50 to-green-50 rounded-xl p-4 border border-purple-100">
          <h4 className="font-semibold text-gray-900 mb-2">How Referral Program Works</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Customer buys → Gets unique referral link via email</li>
            <li>• Friend uses link → Gets ₹100 discount at checkout</li>
            <li>• Friend completes purchase → Original customer earns ₹200</li>
            <li>• Earnings tracked here → Pay manually or integrate UPI</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminReferrals;
