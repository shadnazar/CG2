import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, Sparkles, ChevronRight, Package, Check, Clock, ArrowRight, Truck, Shield, Filter, Heart } from 'lucide-react';
import { addToCart, addComboToCart } from './Homepage';

const API = process.env.REACT_APP_BACKEND_URL;

const FILTERS = [
  { id: 'all',         label: 'All' },
  { id: 'bestsellers', label: 'Bestsellers' },
  { id: 'new',         label: 'New Launch' },
  { id: 'tbl',         label: 'Coming Soon' },
];

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const [prodRes, comboRes, settRes] = await Promise.all([
          axios.get(`${API}/api/products`),
          axios.get(`${API}/api/combos`),
          axios.get(`${API}/api/site-settings`),
        ]);
        setProducts(prodRes.data);
        setCombos(comboRes.data);
        setSettings(settRes.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    })();
  }, []);

  const completeKit = combos.find(c => c.combo_id === 'complete-anti-aging-kit');
  const otherCombos = combos.filter(c => c.combo_id !== 'complete-anti-aging-kit');

  const visibleProducts = useMemo(() => {
    if (filter === 'all') return products;
    if (filter === 'bestsellers') return products.filter(p => p.badge === 'Bestseller');
    if (filter === 'new') return products.filter(p => p.badge === 'New Launch');
    if (filter === 'tbl') return products.filter(p => p.is_to_be_launched);
    return products;
  }, [products, filter]);

  // Stable per-product social proof counts (don't re-randomize on filter change)
  const socialProof = useMemo(() => {
    const map = {};
    products.forEach(p => {
      map[p.slug] = {
        orders: Math.floor(Math.random() * 40) + 30,
        piecesLeft: Math.floor(Math.random() * 20) + 5,
        viewing: Math.floor(Math.random() * 20) + 8,
      };
    });
    return map;
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-emerald-50/40">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50" data-testid="shop-page">
      {/* HERO HEADER */}
      <section className="relative overflow-hidden border-b border-emerald-100/60">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white to-amber-50/40" />
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 12% 30%, rgba(16,185,129,0.15) 0%, transparent 42%), radial-gradient(circle at 88% 70%, rgba(250,204,21,0.10) 0%, transparent 45%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-emerald-700">Home</Link>
            <ChevronRight size={13} />
            <span className="text-emerald-800 font-semibold">Shop</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] text-emerald-700 font-bold uppercase mb-2">
                <Sparkles size={12} /> Curated Collection
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.05] tracking-tight">
                Shop the entire <span className="italic text-emerald-700">Celesta Glow</span> range
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-3 max-w-2xl leading-relaxed">
                Clinically-formulated for Indian skin · Free shipping · Cash on Delivery · 30-day return on every order.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full border border-emerald-100"><Truck size={14} className="text-emerald-600" /> Free Ship</div>
              <div className="flex items-center gap-1.5 text-emerald-800 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full border border-emerald-100"><Shield size={14} className="text-emerald-600" /> 30-Day Return</div>
              <div className="flex items-center gap-1.5 text-emerald-800 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full border border-emerald-100"><Check size={14} className="text-emerald-600" /> COD</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* COMPLETE KIT — brand-aligned premium card */}
        {completeKit && (
          <section className="relative mb-10 sm:mb-14" data-testid="shop-complete-kit-section">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="h-px w-10 bg-emerald-600/40" />
                <span className="text-[11px] tracking-[0.4em] text-emerald-700 font-bold">SIGNATURE BUNDLE</span>
                <span className="h-px w-10 bg-emerald-600/40" />
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                The Complete <span className="italic text-emerald-700">Anti-Aging</span> Ritual
              </h2>
            </div>

            <div className="relative rounded-[28px] overflow-hidden bg-white ring-1 ring-emerald-100 shadow-2xl shadow-emerald-900/[0.08]">
              {/* Top status bar */}
              <div className="flex items-center justify-between px-5 sm:px-7 py-3 border-b border-emerald-50 bg-gradient-to-r from-emerald-50/60 via-amber-50/30 to-transparent">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                  </span>
                  <span className="text-[11px] tracking-widest text-emerald-800 font-bold">BEST SELLER · BEST VALUE</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}
                  <span className="text-[11px] text-gray-600 ml-1 font-semibold">4.9 · 12k+</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* LEFT — Image */}
                <div className="lg:col-span-7 relative bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/40 p-6 sm:p-8 lg:p-10 flex items-center justify-center">
                  <div className="absolute top-5 left-5 sm:top-7 sm:left-7 z-10">
                    <div className="bg-amber-400 text-amber-950 font-black text-xs sm:text-sm px-3 py-1.5 rounded-full shadow-lg shadow-amber-900/20 tracking-wide">
                      SAVE ₹{(completeKit.mrp_total - completeKit.combo_prepaid_price)?.toLocaleString()}
                    </div>
                  </div>
                  <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-10">
                    <div className="bg-emerald-700 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg tracking-wide">
                      −{completeKit.discount_percent}% OFF
                    </div>
                  </div>

                  <div className="relative w-full aspect-[4/3] sm:aspect-[5/4] flex items-center justify-center">
                    {settings.bundle_hero_image ? (
                      <img src={settings.bundle_hero_image} alt={completeKit.name} className="w-full h-full object-contain drop-shadow-2xl" />
                    ) : (
                      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                        {completeKit.product_slugs?.slice(0,5).map((slug, i) => {
                          const p = products.find(pr => pr.slug === slug);
                          return (
                            <div key={slug} className={`bg-white rounded-2xl shadow-xl shadow-emerald-900/10 ring-1 ring-emerald-100 p-3 aspect-square flex items-center justify-center ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                              {p?.images?.[0] ? <img src={p.images[0]} alt={p.short_name} className="w-full h-full object-contain" /> : <Sparkles className="w-8 h-8 text-emerald-300" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT — Brand emerald details panel */}
                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white relative">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(250,204,21,0.25) 0%, transparent 40%)' }} />
                  <div className="relative">
                    <h3 className="font-heading text-2xl sm:text-3xl font-black leading-tight">{completeKit.name}</h3>
                    <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">{completeKit.description}</p>

                    <div className="mt-5 space-y-2.5">
                      <p className="text-[11px] tracking-[0.25em] text-amber-300 font-bold">WHAT'S INSIDE</p>
                      {completeKit.product_slugs?.map(slug => {
                        const p = products.find(pr => pr.slug === slug);
                        return p ? (
                          <div key={slug} className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 ring-1 ring-white/15 overflow-hidden">
                              {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-7 h-7 object-contain" /> : <Sparkles size={12} className="text-amber-300" />}
                            </div>
                            <span className="text-sm text-white/95 font-medium flex-1 truncate">{p.short_name}</span>
                            <span className="text-xs text-emerald-200/60 line-through">₹{p.mrp}</span>
                          </div>
                        ) : null;
                      })}
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/15">
                      <div className="flex items-end gap-3 mb-1">
                        <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">₹{completeKit.combo_prepaid_price?.toLocaleString()}</span>
                        <span className="text-base text-white/40 line-through mb-1.5">₹{completeKit.mrp_total?.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-amber-300 font-semibold">You save ₹{(completeKit.mrp_total - completeKit.combo_prepaid_price)?.toLocaleString()} · ~₹{Math.round(completeKit.combo_prepaid_price/60)}/day for 60 days</p>
                    </div>

                    <button
                      onClick={() => addComboToCart(completeKit.combo_id)}
                      className="group/btn mt-5 w-full relative overflow-hidden bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black py-4 rounded-2xl text-sm tracking-wide shadow-2xl shadow-amber-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      data-testid="shop-add-kit"
                    >
                      <ShoppingCart size={18} />
                      <span>ADD COMPLETE KIT</span>
                      <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-emerald-100/70">
                      <span className="flex items-center gap-1"><Truck size={11} /> Free shipping</span>
                      <span className="flex items-center gap-1"><Shield size={11} /> 30-day return</span>
                      <span className="flex items-center gap-1"><Check size={11} /> COD avail.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION HEADER + FILTERS */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-[0.25em] mb-1">Our Range</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-gray-900">Individual Products</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-emerald-700/60 hidden sm:inline" />
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${
                  filter === f.id
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20'
                    : 'bg-white text-gray-700 border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
                data-testid={`shop-filter-${f.id}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT GRID */}
        {visibleProducts.length === 0 ? (
          <div className="bg-white border border-emerald-100 rounded-2xl p-10 text-center text-sm text-gray-500">
            No products in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-12">
            {visibleProducts.map(product => {
              const sp = socialProof[product.slug] || { orders: 0, piecesLeft: 0, viewing: 0 };
              const { orders, piecesLeft, viewing } = sp;
              return (
                <div key={product.slug} className="group bg-white rounded-2xl ring-1 ring-emerald-50 hover:ring-emerald-200 overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/[0.08] hover:-translate-y-1 transition-all duration-300 relative" data-testid={`shop-product-${product.slug}`}>
                  {product.is_to_be_launched ? (
                    <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white text-[11px] font-bold px-3 py-1.5 text-center tracking-wide flex items-center justify-center gap-1.5">
                      <Clock size={11} />
                      {product.days_to_launch != null ? `LAUNCHING IN ${product.days_to_launch} DAY${product.days_to_launch === 1 ? '' : 'S'}` : 'COMING SOON'}
                    </div>
                  ) : product.badge ? (
                    <div className={`text-[11px] font-bold px-3 py-1.5 text-center tracking-wide ${product.badge === 'Bestseller' ? 'bg-amber-400 text-amber-950' : product.badge === 'New Launch' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                      {product.badge.toUpperCase()}
                    </div>
                  ) : null}

                  {/* Wishlist heart (visual only, brand-aligned) */}
                  <button aria-label="Wishlist" className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur ring-1 ring-emerald-100 flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
                    <Heart size={14} />
                  </button>

                  <Link to={`/product/${product.slug}`}>
                    <div className="aspect-square bg-gradient-to-br from-stone-50 to-emerald-50/40 flex items-center justify-center p-5 group-hover:scale-105 transition-transform duration-500 relative">
                      {product.images?.[0] ? <img src={product.images[0]} alt={product.short_name} className="w-full h-full object-contain" /> : <Sparkles className="w-10 h-10 text-emerald-200" />}
                    </div>
                  </Link>

                  {!product.is_to_be_launched && (
                    <div className="bg-amber-50/70 border-y border-amber-100 px-2 py-1.5 flex items-center justify-around text-[10px] font-semibold gap-1">
                      <span className="text-amber-800 flex items-center gap-0.5"><Sparkles size={10} className="text-amber-500" /> {viewing} viewing</span>
                      <span className="text-emerald-800 flex items-center gap-0.5"><Check size={10} className="text-emerald-600" /> {orders} sold</span>
                      <span className="text-rose-700 flex items-center gap-0.5">{piecesLeft} left</span>
                    </div>
                  )}

                  <div className="p-3.5">
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug mb-1 group-hover:text-emerald-700 line-clamp-2 transition-colors">{product.short_name}</h3>
                    </Link>
                    <p className="text-xs text-gray-400 line-clamp-1 mb-2">{product.key_ingredients}</p>

                    <div className="flex items-baseline gap-1.5 mb-1.5">
                      <span className="text-lg sm:text-xl font-black text-gray-900">₹{product.prepaid_price}</span>
                      <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                      <span className="text-[11px] font-bold text-emerald-700">{product.discount_percent}% off</span>
                    </div>

                    {!product.is_to_be_launched && (
                      <div className="bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-1.5 mb-2.5 flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0"><Check size={9} className="text-white" /></div>
                        <p className="text-[11px] text-amber-900 font-semibold">₹{product.prepaid_price - 50} with <span className="font-mono font-bold">WELCOME50</span></p>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />)}</div>
                      <span className="text-[11px] text-gray-500">({product.reviews_count?.toLocaleString()})</span>
                    </div>

                    {product.is_to_be_launched ? (
                      product.preorder_enabled ? (
                        <button onClick={() => { addToCart(product.slug); axios.post(`${API}/api/products/${product.slug}/preorder-count`).catch(()=>{}); }} className="w-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors" data-testid={`shop-preorder-${product.slug}`}>
                          <Clock size={15} /> Preorder Now
                        </button>
                      ) : (
                        <button disabled className="w-full bg-gray-100 text-gray-400 text-xs sm:text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                          <Clock size={15} /> Coming Soon
                        </button>
                      )
                    ) : (
                      <button onClick={() => addToCart(product.slug)} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md hover:shadow-emerald-900/10" data-testid={`shop-add-${product.slug}`}>
                        <ShoppingCart size={15} /> Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MORE COMBO DEALS */}
        {otherCombos.length > 0 && (
          <section className="mt-2">
            <div className="mb-5">
              <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-[0.25em] mb-1">Bundle & Save</p>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-gray-900">More Combo Deals</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {otherCombos.map(combo => (
                <div key={combo.combo_id} className="group bg-white rounded-2xl ring-1 ring-emerald-50 hover:ring-emerald-200 overflow-hidden hover:shadow-xl hover:shadow-emerald-900/[0.08] hover:-translate-y-0.5 transition-all duration-300" data-testid={`shop-combo-card-${combo.combo_id}`}>
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-emerald-50 via-white to-amber-50/50 overflow-hidden">
                    {combo.image ? (
                      <img src={combo.image} alt={combo.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="w-14 h-14 text-emerald-200" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {combo.badge && (
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md ${combo.badge === 'Popular' ? 'bg-amber-400 text-amber-950' : 'bg-emerald-700 text-white'}`}>{combo.badge}</span>
                      )}
                      <span className="bg-white/90 backdrop-blur text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">{combo.product_slugs?.length} Products</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-amber-400 text-amber-950 text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg">SAVE {combo.discount_percent}%</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base sm:text-lg font-black text-gray-900 mb-1">{combo.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2">{combo.description}</p>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-gray-900">₹{combo.combo_prepaid_price?.toLocaleString()}</span>
                          <span className="text-sm text-gray-400 line-through">₹{combo.mrp_total?.toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-emerald-700 font-semibold">You save ₹{(combo.mrp_total - combo.combo_prepaid_price)?.toLocaleString()}</p>
                      </div>
                      <button onClick={() => addComboToCart(combo.combo_id)} className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all" data-testid={`shop-add-combo-${combo.combo_id}`}>
                        <ShoppingCart size={14} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ShopPage;
