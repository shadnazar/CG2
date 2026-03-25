import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, Sparkles, FileText, MapPin, Lightbulb, 
  Loader2, Check, AlertCircle, Copy, Save
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function AdminAIStudio() {
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('adminToken');
  
  const [activeMode, setActiveMode] = useState('blog');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // Blog generation
  const [blogTopic, setBlogTopic] = useState('');
  const [blogKeywords, setBlogKeywords] = useState('');
  const [blogAudience, setBlogAudience] = useState('Indian adults 28+');
  
  // Location generation
  const [locState, setLocState] = useState('');
  const [locCity, setLocCity] = useState('');
  
  // Topic suggestions
  const [suggestedTopics, setSuggestedTopics] = useState([]);

  const handleGenerateBlog = async () => {
    if (!blogTopic.trim()) {
      setError('Please enter a topic');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const res = await axios.post(`${API}/admin/ai/generate-blog`, {
        topic: blogTopic,
        keywords: blogKeywords ? blogKeywords.split(',').map(k => k.trim()) : null,
        target_audience: blogAudience
      }, {
        headers: { 'X-Admin-Token': adminToken }
      });
      
      setResult({ type: 'blog', data: res.data.article });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLocation = async () => {
    if (!locState.trim()) {
      setError('Please select a state');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const res = await axios.post(`${API}/admin/ai/generate-location`, {
        state: locState,
        city: locCity || null
      }, {
        headers: { 'X-Admin-Token': adminToken }
      });
      
      setResult({ type: 'location', data: res.data.content });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTopics = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.get(`${API}/admin/ai/suggest-topics?count=5`, {
        headers: { 'X-Admin-Token': adminToken }
      });
      
      setSuggestedTopics(res.data.topics);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBlog = async () => {
    if (!result?.data) return;
    
    setLoading(true);
    try {
      await axios.post(`${API}/admin/blogs`, {
        title: result.data.title,
        content: result.data.content,
        meta_description: result.data.meta_description,
        keywords: result.data.keywords,
        status: 'draft',
        language: 'en'
      }, {
        headers: { 'X-Admin-Token': adminToken }
      });
      
      navigate('/admin/blogs');
    } catch (err) {
      setError('Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!result?.data) return;
    
    setLoading(true);
    try {
      await axios.post(`${API}/admin/locations`, {
        state: locState,
        city: locCity || null,
        title: result.data.title,
        description: result.data.description,
        climate: result.data.climate,
        skin_issues: result.data.skin_issues,
        recommendations: result.data.recommendations
      }, {
        headers: { 'X-Admin-Token': adminToken }
      });
      
      navigate('/admin/locations');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const INDIAN_STATES = [
    'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 
    'West Bengal', 'Rajasthan', 'Uttar Pradesh', 'Kerala', 'Telangana',
    'Andhra Pradesh', 'Punjab', 'Haryana', 'Bihar', 'Madhya Pradesh'
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link to="/admin/dashboard" className="text-gray-600">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-purple-500" size={24} />
              AI Content Studio
            </h1>
            <p className="text-sm text-gray-500">Generate SEO content with AI</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Credit Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Credit Usage Warning</p>
            <p className="text-sm text-amber-700">Each AI generation uses credits. Use sparingly for best ROI.</p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveMode('blog'); setResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeMode === 'blog' 
                ? 'bg-purple-500 text-white' 
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <FileText size={18} /> Generate Blog
          </button>
          <button
            onClick={() => { setActiveMode('location'); setResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeMode === 'location' 
                ? 'bg-purple-500 text-white' 
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <MapPin size={18} /> Generate Location
          </button>
          <button
            onClick={() => { setActiveMode('topics'); handleSuggestTopics(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeMode === 'topics' 
                ? 'bg-purple-500 text-white' 
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <Lightbulb size={18} /> Topic Ideas
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Blog Generation Form */}
        {activeMode === 'blog' && !result && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic *</label>
              <input
                type="text"
                value={blogTopic}
                onChange={(e) => setBlogTopic(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="e.g., Best anti-aging tips for women over 30"
                data-testid="blog-topic-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (comma-separated)</label>
              <input
                type="text"
                value={blogKeywords}
                onChange={(e) => setBlogKeywords(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="anti-aging, skincare, serum, wrinkles"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <input
                type="text"
                value={blogAudience}
                onChange={(e) => setBlogAudience(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Indian adults 28+"
              />
            </div>
            <button
              onClick={handleGenerateBlog}
              disabled={loading}
              className="w-full py-3 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="generate-blog-btn"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? 'Generating...' : 'Generate Blog Article'}
            </button>
          </div>
        )}

        {/* Location Generation Form */}
        {activeMode === 'location' && !result && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
              <select
                value={locState}
                onChange={(e) => setLocState(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                data-testid="location-state-select"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City (Optional)</label>
              <input
                type="text"
                value={locCity}
                onChange={(e) => setLocCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="e.g., Mumbai, Bangalore"
              />
            </div>
            <button
              onClick={handleGenerateLocation}
              disabled={loading}
              className="w-full py-3 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="generate-location-btn"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? 'Generating...' : 'Generate Location Content'}
            </button>
          </div>
        )}

        {/* Topic Suggestions */}
        {activeMode === 'topics' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Suggested Blog Topics</h3>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="animate-spin mx-auto mb-3 text-purple-500" size={32} />
                <p className="text-gray-500">Generating topic ideas...</p>
              </div>
            ) : suggestedTopics.length > 0 ? (
              <div className="space-y-3">
                {suggestedTopics.map((topic, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{topic.topic}</h4>
                        <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {topic.keywords?.map(kw => (
                            <span key={kw} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setBlogTopic(topic.topic);
                          setBlogKeywords(topic.keywords?.join(', ') || '');
                          setActiveMode('blog');
                        }}
                        className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Click to generate topic suggestions</p>
              </div>
            )}
          </div>
        )}

        {/* Generated Blog Result */}
        {result?.type === 'blog' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Check className="text-green-500" size={20} />
                Blog Generated Successfully
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setResult(null)}
                  className="px-3 py-1 border border-gray-200 rounded-lg text-gray-600 text-sm"
                >
                  New
                </button>
                <button
                  onClick={handleSaveBlog}
                  disabled={loading}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 flex items-center gap-1"
                >
                  <Save size={14} /> Save as Draft
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Title</span>
                <button onClick={() => copyToClipboard(result.data.title)} className="text-gray-400 hover:text-gray-600">
                  <Copy size={14} />
                </button>
              </div>
              <p className="font-semibold text-gray-900">{result.data.title}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Meta Description</span>
                <button onClick={() => copyToClipboard(result.data.meta_description)} className="text-gray-400 hover:text-gray-600">
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-gray-700">{result.data.meta_description}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Content Preview</span>
                <button onClick={() => copyToClipboard(result.data.content)} className="text-gray-400 hover:text-gray-600">
                  <Copy size={14} />
                </button>
              </div>
              <div 
                className="prose prose-sm max-w-none text-gray-700 max-h-64 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: result.data.content }}
              />
            </div>
            
            <div className="flex flex-wrap gap-1">
              {result.data.keywords?.map(kw => (
                <span key={kw} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Generated Location Result */}
        {result?.type === 'location' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Check className="text-green-500" size={20} />
                Location Content Generated
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setResult(null)}
                  className="px-3 py-1 border border-gray-200 rounded-lg text-gray-600 text-sm"
                >
                  New
                </button>
                <button
                  onClick={handleSaveLocation}
                  disabled={loading}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 flex items-center gap-1"
                >
                  <Save size={14} /> Save Location
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-500">Title</span>
                <p className="font-semibold text-gray-900 mt-1">{result.data.title}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-500">Description</span>
                <p className="text-gray-700 mt-1">{result.data.description}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-500">Climate</span>
                <p className="text-gray-700 mt-1">{result.data.climate}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-500">Common Skin Issues</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.data.skin_issues?.map(issue => (
                    <span key={issue} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-500">Recommendations</span>
                <p className="text-gray-700 mt-1">{result.data.recommendations}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAIStudio;
