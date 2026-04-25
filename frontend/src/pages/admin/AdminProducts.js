import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, Plus, Edit, Trash2, Image, DollarSign, Eye, EyeOff, Save, X, ChevronDown, Tag, Settings, Layers } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [editProduct, setEditProduct] = useState(null);
  const [editCombo, setEditCombo] = useState(null);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, max_uses: 100, expiry_days: 30 });
  const [editSettings, setEditSettings] = useState(null);
  const adminToken = sessionStorage.getItem('adminToken');

  const headers = { 'X-Admin-Token': adminToken };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, c, cp, s] = await Promise.all([
        axios.get(`${API}/products?active_only=false`, { headers }),
        axios.get(`${API}/combos?active_only=false`, { headers }),
        axios.get(`${API}/admin/coupons`, { headers }),
        axios.get(`${API}/site-settings`)
      ]);
      setProducts(p.data);
      setCombos(c.data);
      setCoupons(cp.data);
      setSettings(s.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    if (!adminToken) { navigate('/admin'); return; }
    fetchAll();
  }, []);

  const updateProduct = async (slug, data) => {
    try {
      await axios.put(`${API}/admin/products/${slug}`, data, { headers });
      fetchAll();
      setEditProduct(null);
    } catch (err) { alert(err.response?.data?.detail || 'Update failed'); }
  };

  const toggleProductActive = async (slug, isActive) => {
    await updateProduct(slug, { is_active: !isActive });
  };

  const updateCombo = async (comboId, data) => {
    try {
      await axios.put(`${API}/admin/combos/${comboId}`, data, { headers });
      fetchAll();
      setEditCombo(null);
    } catch (err) { alert('Update failed'); }
  };

  const createCoupon = async () => {
    if (!newCoupon.code.trim()) return;
    try {
      await axios.post(`${API}/admin/coupons`, { ...newCoupon, code: newCoupon.code.toUpperCase() }, { headers });
      setNewCoupon({ code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, max_uses: 100, expiry_days: 30 });
      fetchAll();
    } catch (err) { alert('Coupon creation failed'); }
  };

  const deleteCoupon = async (code) => {
    if (!window.confirm('Delete this coupon?')) return;
    await axios.delete(`${API}/admin/coupons/${code}`, { headers });
    fetchAll();
  };

  const updateSiteSettings = async () => {
    try {
      await axios.put(`${API}/admin/site-settings`, editSettings, { headers });
      setEditSettings(null);
      fetchAll();
    } catch (err) { alert('Update failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;

  const tabs = [
    { key: 'products', label: 'Products', icon: Package },
    { key: 'combos', label: 'Combos', icon: Layers },
    { key: 'coupons', label: 'Coupons', icon: Tag },
    { key: 'settings', label: 'Site Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6" data-testid="admin-products">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-500 text-sm">{products.length} products, {combos.length} combos, {coupons.length} coupons</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`} data-testid={`tab-${tab.key}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {products.map(product => (
            <div key={product.slug} className={`bg-white rounded-2xl border ${product.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50/50'} p-4`} data-testid={`admin-product-${product.slug}`}>
              {editProduct?.slug === product.slug ? (
                /* Edit Mode */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="text-xs font-semibold text-gray-500">Product Name</label><input value={editProduct.name} onChange={e => setEditProduct({...editProduct, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="text-xs font-semibold text-gray-500">Short Name</label><input value={editProduct.short_name} onChange={e => setEditProduct({...editProduct, short_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="text-xs font-semibold text-gray-500">MRP (₹)</label><input type="number" value={editProduct.mrp} onChange={e => setEditProduct({...editProduct, mrp: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="text-xs font-semibold text-gray-500">Prepaid Price (₹)</label><input type="number" value={editProduct.prepaid_price} onChange={e => setEditProduct({...editProduct, prepaid_price: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="text-xs font-semibold text-gray-500">COD Price (₹)</label><input type="number" value={editProduct.cod_price} onChange={e => setEditProduct({...editProduct, cod_price: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="text-xs font-semibold text-gray-500">COD Advance (₹)</label><input type="number" value={editProduct.cod_advance} onChange={e => setEditProduct({...editProduct, cod_advance: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="text-xs font-semibold text-gray-500">Discount %</label><input type="number" value={editProduct.discount_percent} onChange={e => setEditProduct({...editProduct, discount_percent: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="text-xs font-semibold text-gray-500">Badge</label><input value={editProduct.badge || ''} onChange={e => setEditProduct({...editProduct, badge: e.target.value})} placeholder="Bestseller, New Launch..." className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  </div>
                  <div><label className="text-xs font-semibold text-gray-500">Tagline</label><input value={editProduct.tagline || ''} onChange={e => setEditProduct({...editProduct, tagline: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-xs font-semibold text-gray-500">Description</label><textarea value={editProduct.description || ''} onChange={e => setEditProduct({...editProduct, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} /></div>
                  <div><label className="text-xs font-semibold text-gray-500">Images (one URL per line)</label><textarea value={(editProduct.images || []).join('\n')} onChange={e => setEditProduct({...editProduct, images: e.target.value.split('\n').filter(Boolean)})} placeholder="https://example.com/image1.jpg" className="w-full px-3 py-2 border rounded-lg text-sm font-mono" rows={3} /></div>
                  <div className="flex gap-2">
                    <button onClick={() => updateProduct(product.slug, editProduct)} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold"><Save size={14} /> Save</button>
                    <button onClick={() => setEditProduct(null)} className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"><X size={14} /> Cancel</button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{product.name}</h3>
                      {product.badge && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium">{product.badge}</span>}
                      {!product.is_active && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Inactive</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{product.key_ingredients} | {product.size}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="font-bold text-gray-900">Prepaid: ₹{product.prepaid_price}</span>
                      <span className="text-gray-500">COD: ₹{product.cod_price}</span>
                      <span className="text-gray-400 line-through">MRP: ₹{product.mrp}</span>
                      <span className="text-green-600 text-xs font-bold">{product.discount_percent}% OFF</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setEditProduct({...product})} className="p-2 hover:bg-gray-100 rounded-lg" title="Edit"><Edit size={16} className="text-gray-500" /></button>
                    <button onClick={() => toggleProductActive(product.slug, product.is_active)} className="p-2 hover:bg-gray-100 rounded-lg" title={product.is_active ? 'Deactivate' : 'Activate'}>
                      {product.is_active ? <Eye size={16} className="text-green-500" /> : <EyeOff size={16} className="text-red-500" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Combos Tab */}
      {activeTab === 'combos' && (
        <div className="space-y-4">
          {combos.map(combo => (
            <div key={combo.combo_id} className="bg-white rounded-2xl border border-gray-200 p-4" data-testid={`admin-combo-${combo.combo_id}`}>
              {editCombo?.combo_id === combo.combo_id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-semibold text-gray-500">Name</label><input value={editCombo.name} onChange={e => setEditCombo({...editCombo, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="text-xs font-semibold text-gray-500">Badge</label><input value={editCombo.badge || ''} onChange={e => setEditCombo({...editCombo, badge: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="text-xs font-semibold text-gray-500">MRP Total (₹)</label><input type="number" value={editCombo.mrp_total} onChange={e => setEditCombo({...editCombo, mrp_total: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="text-xs font-semibold text-gray-500">Prepaid Price (₹)</label><input type="number" value={editCombo.combo_prepaid_price} onChange={e => setEditCombo({...editCombo, combo_prepaid_price: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="text-xs font-semibold text-gray-500">COD Price (₹)</label><input type="number" value={editCombo.combo_cod_price} onChange={e => setEditCombo({...editCombo, combo_cod_price: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="text-xs font-semibold text-gray-500">Discount %</label><input type="number" value={editCombo.discount_percent} onChange={e => setEditCombo({...editCombo, discount_percent: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  </div>
                  <div><label className="text-xs font-semibold text-gray-500">Description</label><textarea value={editCombo.description || ''} onChange={e => setEditCombo({...editCombo, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
                  <div className="flex gap-2">
                    <button onClick={() => updateCombo(combo.combo_id, editCombo)} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold"><Save size={14} /> Save</button>
                    <button onClick={() => setEditCombo(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{combo.name}</h3>
                      {combo.badge && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">{combo.badge}</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{combo.product_slugs?.join(', ')} | {combo.discount_percent}% OFF</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">Prepaid: ₹{combo.combo_prepaid_price} | COD: ₹{combo.combo_cod_price} <span className="text-gray-400 line-through ml-2">MRP: ₹{combo.mrp_total}</span></p>
                  </div>
                  <button onClick={() => setEditCombo({...combo})} className="p-2 hover:bg-gray-100 rounded-lg"><Edit size={16} className="text-gray-500" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-3">Create Coupon</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <input value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} placeholder="Code (e.g., SAVE10)" className="px-3 py-2 border rounded-lg text-sm" />
              <select value={newCoupon.discount_type} onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
              <input type="number" value={newCoupon.discount_value} onChange={e => setNewCoupon({...newCoupon, discount_value: Number(e.target.value)})} placeholder="Value" className="px-3 py-2 border rounded-lg text-sm" />
              <input type="number" value={newCoupon.min_order_amount} onChange={e => setNewCoupon({...newCoupon, min_order_amount: Number(e.target.value)})} placeholder="Min order ₹" className="px-3 py-2 border rounded-lg text-sm" />
              <input type="number" value={newCoupon.max_uses} onChange={e => setNewCoupon({...newCoupon, max_uses: Number(e.target.value)})} placeholder="Max uses" className="px-3 py-2 border rounded-lg text-sm" />
              <input type="number" value={newCoupon.expiry_days} onChange={e => setNewCoupon({...newCoupon, expiry_days: Number(e.target.value)})} placeholder="Expiry (days)" className="px-3 py-2 border rounded-lg text-sm" />
            </div>
            <button onClick={createCoupon} className="mt-3 flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold"><Plus size={14} /> Create Coupon</button>
          </div>
          {coupons.map(coupon => (
            <div key={coupon.code} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-gray-900 text-lg">{coupon.code}</span>
                <p className="text-sm text-gray-500 mt-1">
                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `₹${coupon.discount_value} off`}
                  {coupon.min_order_amount > 0 && ` | Min ₹${coupon.min_order_amount}`}
                  {` | Used: ${coupon.used_count || 0}/${coupon.max_uses}`}
                </p>
              </div>
              <button onClick={() => deleteCoupon(coupon.code)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-bold text-gray-900">Site Settings</h3>
          {editSettings ? (
            <>
              <div><label className="text-xs font-semibold text-gray-500">Hero Title</label><input value={editSettings.hero_title || ''} onChange={e => setEditSettings({...editSettings, hero_title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="text-xs font-semibold text-gray-500">Hero Subtitle</label><textarea value={editSettings.hero_subtitle || ''} onChange={e => setEditSettings({...editSettings, hero_subtitle: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
              <div><label className="text-xs font-semibold text-gray-500">Hero Banner Image URL</label><input value={editSettings.hero_banner_image || ''} onChange={e => setEditSettings({...editSettings, hero_banner_image: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="text-xs font-semibold text-gray-500">Bundle Kit Hero Image URL</label><input value={editSettings.bundle_hero_image || ''} onChange={e => setEditSettings({...editSettings, bundle_hero_image: e.target.value})} placeholder="Single image for Complete Kit bundle card" className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="text-xs font-semibold text-gray-500">COD Advance Amount (₹)</label><input type="number" value={editSettings.cod_advance_amount || 29} onChange={e => setEditSettings({...editSettings, cod_advance_amount: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-gray-500">Pre-Sale Mode</label>
                <button onClick={() => setEditSettings({...editSettings, presale_enabled: !editSettings.presale_enabled})} className={`px-4 py-1.5 rounded-full text-sm font-bold ${editSettings.presale_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {editSettings.presale_enabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
              {editSettings.presale_enabled && (
                <>
                  <div><label className="text-xs font-semibold text-gray-500">Pre-Sale Title</label><input value={editSettings.presale_title || ''} onChange={e => setEditSettings({...editSettings, presale_title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-xs font-semibold text-gray-500">Pre-Sale Badge</label><input value={editSettings.presale_badge || ''} onChange={e => setEditSettings({...editSettings, presale_badge: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-xs font-semibold text-gray-500">Pre-Sale Price (₹)</label><input type="number" value={editSettings.presale_price || ''} onChange={e => setEditSettings({...editSettings, presale_price: Number(e.target.value)})} placeholder="e.g., 2 or 20" className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                </>
              )}
              <div className="flex gap-2">
                <button onClick={updateSiteSettings} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold"><Save size={14} /> Save</button>
                <button onClick={() => setEditSettings(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Hero Title</p><p className="font-medium">{settings.hero_title || 'Not set'}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">COD Advance</p><p className="font-medium">₹{settings.cod_advance_amount || 29}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Pre-Sale</p><p className="font-medium">{settings.presale_enabled ? 'ENABLED' : 'Disabled'}</p></div>
              </div>
              <button onClick={() => setEditSettings({...settings})} className="flex items-center gap-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold"><Edit size={14} /> Edit Settings</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
