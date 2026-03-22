import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Truck, Star, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY;

const PREPAID_PRICE = 399;
const COD_PRICE = 450;
const COD_ADVANCE = 49;
const MRP = 1499;

function ProductPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('product');
  const [recentOrders, setRecentOrders] = useState(30);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    house_number: '',
    area: '',
    pincode: '',
    state: ''
  });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('prepaid');
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    axios.post(`${API}/track?page=product&session_id=${sessionId}`).catch(err => console.log(err));
    
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: 'Celesta Glow Anti-Aging Serum',
        content_category: 'Skincare',
        value: PREPAID_PRICE,
        currency: 'INR'
      });
    }

    const fetchRecentOrders = async () => {
      try {
        const response = await axios.get(`${API}/stats/recent-orders`);
        setRecentOrders(response.data.count);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchRecentOrders();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.match(/^[6-9]\d{9}$/)) newErrors.phone = 'Enter valid 10-digit Indian phone number';
    if (!formData.house_number.trim()) newErrors.house_number = 'House/Flat number is required';
    if (!formData.area.trim()) newErrors.area = 'Area/Locality is required';
    if (!formData.pincode.match(/^\d{6}$/)) newErrors.pincode = 'Enter valid 6-digit pincode';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePincodeChange = async (pincode) => {
    setFormData(prev => ({ ...prev, pincode }));
    if (pincode.length === 6) {
      try {
        const response = await axios.get(`${API}/pincode/${pincode}/state`);
        if (response.data.state) {
          setFormData(prev => ({ ...prev, state: response.data.state }));
        }
      } catch (error) {
        console.log('Pincode lookup failed');
      }
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    setLoading(true);

    const amount = paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_ADVANCE;
    
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      const orderResponse = await axios.post(`${API}/create-razorpay-order`, { amount });
      
      const options = {
        key: RAZORPAY_KEY,
        amount: orderResponse.data.amount,
        currency: 'INR',
        name: 'Celesta Glow',
        description: paymentMethod === 'prepaid' ? 'Celesta Glow Anti-Aging Serum' : 'COD Advance Payment',
        order_id: orderResponse.data.id,
        handler: async function (response) {
          try {
            await axios.post(`${API}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            const orderData = {
              ...formData,
              payment_method: paymentMethod === 'prepaid' ? 'Prepaid' : 'COD (Advance Paid)',
              amount: paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_PRICE
            };

            const order = await axios.post(`${API}/orders`, orderData);
            setOrderConfirmed(order.data);
            setStep('confirmation');
            
            if (window.fbq) {
              window.fbq('track', 'Purchase', {
                value: orderData.amount,
                currency: 'INR',
                content_name: 'Celesta Glow Anti-Aging Serum'
              });
            }
          } catch (error) {
            console.error('Order creation failed:', error);
            alert('Payment successful but order creation failed. Please contact support.');
          }
          setLoading(false);
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
          email: formData.email
        },
        theme: { color: '#0066CC' },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  // Product View
  if (step === 'product') {
    return (
      <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
            {/* Product Image */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <img
                src="https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/ig243hne_IMG_9115.png"
                alt="Celesta Glow Anti-Aging Serum"
                style={{ width: '100%', maxWidth: '400px', margin: '0 auto', display: 'block' }}
              />
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
                <div style={{ padding: '8px 16px', background: '#E3F2FD', borderRadius: '50px', fontSize: '12px', color: '#0066CC', fontWeight: '600' }}>
                  Dermatologist Tested
                </div>
                <div style={{ padding: '8px 16px', background: '#E8F5E9', borderRadius: '50px', fontSize: '12px', color: '#28A745', fontWeight: '600' }}>
                  Clinically Proven
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', color: '#212529' }}>
                Celesta Glow Anti-Aging Face Serum
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#FFC107" color="#FFC107" />)}
                </div>
                <span style={{ color: '#6C757D', fontSize: '14px' }}>4.8/5 ({recentOrders}+ reviews)</span>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '700', color: '#0066CC' }}>₹{PREPAID_PRICE}</span>
                  <span style={{ fontSize: '24px', color: '#6C757D', textDecoration: 'line-through' }}>₹{MRP}</span>
                  <span style={{ padding: '4px 12px', background: '#28A745', color: 'white', borderRadius: '4px', fontSize: '14px', fontWeight: '600' }}>
                    {Math.round((1 - PREPAID_PRICE/MRP) * 100)}% OFF
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#6C757D' }}>Inclusive of all taxes. Free shipping across India.</p>
              </div>

              <div style={{ background: '#FEF3C7', padding: '16px', borderRadius: '8px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={24} color="#F59E0B" />
                <span style={{ color: '#92400E', fontWeight: '500' }}>Limited Time Offer - {recentOrders}+ people ordered today!</span>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#212529' }}>Key Benefits</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    'Reduces wrinkles and fine lines in 4-6 weeks',
                    'Boosts collagen production naturally',
                    'Deep hydration with Hyaluronic Acid',
                    'Retinol formula for cell renewal',
                    'Suitable for all skin types'
                  ].map((benefit, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CheckCircle2 size={20} color="#28A745" />
                      <span style={{ color: '#495057', fontSize: '14px' }}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('checkout')}
                data-testid="buy-now-button"
                style={{ 
                  width: '100%', 
                  padding: '18px 40px', 
                  background: '#0066CC', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,102,204,0.3)'
                }}
              >
                Buy Now - ₹{PREPAID_PRICE}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '24px', padding: '16px', background: 'white', borderRadius: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <ShieldCheck size={24} color="#0066CC" />
                  <p style={{ fontSize: '12px', color: '#6C757D', marginTop: '4px' }}>100% Genuine</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Truck size={24} color="#0066CC" />
                  <p style={{ fontSize: '12px', color: '#6C757D', marginTop: '4px' }}>Free Delivery</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <AlertCircle size={24} color="#0066CC" />
                  <p style={{ fontSize: '12px', color: '#6C757D', marginTop: '4px' }}>COD Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout Form
  if (step === 'checkout') {
    return (
      <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: '#212529' }}>Checkout</h1>
            <p style={{ color: '#6C757D', marginBottom: '32px' }}>Complete your order for Celesta Glow Anti-Aging Serum</p>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#212529' }}>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  data-testid="name-input"
                  style={{ width: '100%', padding: '14px', border: `1px solid ${errors.name ? '#DC3545' : '#DEE2E6'}`, borderRadius: '8px', fontSize: '16px' }}
                />
                {errors.name && <p style={{ color: '#DC3545', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#212529' }}>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  placeholder="10-digit mobile number"
                  data-testid="phone-input"
                  style={{ width: '100%', padding: '14px', border: `1px solid ${errors.phone ? '#DC3545' : '#DEE2E6'}`, borderRadius: '8px', fontSize: '16px' }}
                />
                {errors.phone && <p style={{ color: '#DC3545', fontSize: '12px', marginTop: '4px' }}>{errors.phone}</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#212529' }}>Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="For order updates"
                  data-testid="email-input"
                  style={{ width: '100%', padding: '14px', border: '1px solid #DEE2E6', borderRadius: '8px', fontSize: '16px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#212529' }}>House/Flat Number *</label>
                <input
                  type="text"
                  value={formData.house_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, house_number: e.target.value }))}
                  placeholder="House no., Building name"
                  data-testid="house-input"
                  style={{ width: '100%', padding: '14px', border: `1px solid ${errors.house_number ? '#DC3545' : '#DEE2E6'}`, borderRadius: '8px', fontSize: '16px' }}
                />
                {errors.house_number && <p style={{ color: '#DC3545', fontSize: '12px', marginTop: '4px' }}>{errors.house_number}</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#212529' }}>Area/Locality *</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  placeholder="Street, Colony, Area"
                  data-testid="area-input"
                  style={{ width: '100%', padding: '14px', border: `1px solid ${errors.area ? '#DC3545' : '#DEE2E6'}`, borderRadius: '8px', fontSize: '16px' }}
                />
                {errors.area && <p style={{ color: '#DC3545', fontSize: '12px', marginTop: '4px' }}>{errors.area}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#212529' }}>Pincode *</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit pincode"
                    data-testid="pincode-input"
                    style={{ width: '100%', padding: '14px', border: `1px solid ${errors.pincode ? '#DC3545' : '#DEE2E6'}`, borderRadius: '8px', fontSize: '16px' }}
                  />
                  {errors.pincode && <p style={{ color: '#DC3545', fontSize: '12px', marginTop: '4px' }}>{errors.pincode}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#212529' }}>State</label>
                  <input
                    type="text"
                    value={formData.state}
                    readOnly
                    placeholder="Auto-detected"
                    style={{ width: '100%', padding: '14px', border: '1px solid #DEE2E6', borderRadius: '8px', fontSize: '16px', background: '#F8F9FA' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#212529' }}>Payment Method</h3>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '16px', 
                    border: `2px solid ${paymentMethod === 'prepaid' ? '#0066CC' : '#DEE2E6'}`, 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    background: paymentMethod === 'prepaid' ? '#E3F2FD' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'prepaid'}
                    onChange={() => setPaymentMethod('prepaid')}
                    style={{ marginRight: '12px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#212529' }}>Pay Online - ₹{PREPAID_PRICE}</div>
                    <div style={{ fontSize: '14px', color: '#28A745' }}>Save ₹{COD_PRICE - PREPAID_PRICE} + Fast Delivery (2-3 days)</div>
                  </div>
                </label>

                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '16px', 
                    border: `2px solid ${paymentMethod === 'cod' ? '#0066CC' : '#DEE2E6'}`, 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    background: paymentMethod === 'cod' ? '#E3F2FD' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    style={{ marginRight: '12px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#212529' }}>Cash on Delivery - ₹{COD_PRICE}</div>
                    <div style={{ fontSize: '14px', color: '#6C757D' }}>Pay ₹{COD_ADVANCE} now + ₹{COD_PRICE - COD_ADVANCE} on delivery</div>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              data-testid="place-order-button"
              style={{ 
                width: '100%', 
                padding: '18px', 
                background: loading ? '#6C757D' : '#0066CC', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '18px', 
                fontWeight: '600', 
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '32px'
              }}
            >
              {loading ? 'Processing...' : `Pay ₹${paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_ADVANCE} & Place Order`}
            </button>

            <button
              onClick={() => setStep('product')}
              style={{ 
                width: '100%', 
                padding: '14px', 
                background: 'transparent', 
                color: '#6C757D', 
                border: 'none', 
                fontSize: '14px', 
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              ← Back to Product
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Order Confirmation
  if (step === 'confirmation' && orderConfirmed) {
    return (
      <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle2 size={40} color="#28A745" />
            </div>
            
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: '#212529' }}>Order Confirmed!</h1>
            <p style={{ color: '#6C757D', marginBottom: '32px' }}>Thank you for your purchase</p>

            <div style={{ background: '#0066CC', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '32px' }}>
              <p style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Order ID</p>
              <p style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '2px' }}>{orderConfirmed.order_id}</p>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#212529' }}>Order Details</h3>
              <div style={{ background: '#F8F9FA', padding: '20px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#6C757D' }}>Product</span>
                  <span style={{ fontWeight: '500' }}>Celesta Glow Serum (30ml)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#6C757D' }}>Amount</span>
                  <span style={{ fontWeight: '600', color: '#28A745' }}>₹{orderConfirmed.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#6C757D' }}>Payment</span>
                  <span style={{ fontWeight: '500' }}>{orderConfirmed.payment_method}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6C757D' }}>Delivery</span>
                  <span style={{ fontWeight: '500' }}>{orderConfirmed.delivery_timeline}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#212529' }}>Delivery Address</h3>
              <div style={{ background: '#F8F9FA', padding: '20px', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>{orderConfirmed.name}</p>
                <p style={{ color: '#6C757D', marginBottom: '4px' }}>+91 {orderConfirmed.phone}</p>
                <p style={{ color: '#6C757D' }}>{orderConfirmed.house_number}, {orderConfirmed.area}, {orderConfirmed.state} - {orderConfirmed.pincode}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              style={{ 
                width: '100%', 
                padding: '16px', 
                background: '#0066CC', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '16px', 
                fontWeight: '600', 
                cursor: 'pointer'
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default ProductPage;
