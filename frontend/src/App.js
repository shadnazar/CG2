import { useState } from 'react';
import '@/App.css';
import axios from 'axios';
import { ChevronLeft, ShieldCheck, Star, Sparkles, Truck, Clock, CheckCircle2, Package } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PRODUCT_IMAGES = [
  'https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/ig243hne_IMG_9115.png',
  'https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/bjk8ksay_IMG_9675.png',
  'https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/g5vzgxym_IMG_9676.png',
  'https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/hry8n67v_IMG_9677.png',
  'https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/ak0hq7r8_IMG_9678.png'
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('PREPAID');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      alert('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!formData.address.trim()) {
      alert('Please enter your complete address');
      return false;
    }
    return true;
  };

  const handleBuyNow = () => {
    setCurrentStep(2);
  };

  const handleContinueToPayment = () => {
    if (validateForm()) {
      setCurrentStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const amount = paymentMethod === 'COD' ? 1199 : 899;
      const response = await axios.post(`${API}/orders`, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        payment_method: paymentMethod,
        amount: amount
      });
      setOrderDetails(response.data);
      setCurrentStep(4);
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep < 4) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="App">
      <div className="app-container">
        {currentStep > 1 && currentStep < 4 && (
          <div className="sticky-header">
            <button
              data-testid="back-button"
              onClick={handleBack}
              className="flex items-center text-gray-700 hover:text-[#4C1D95] transition-colors"
            >
              <ChevronLeft size={24} />
              <span className="ml-1 font-medium">Back</span>
            </button>
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 w-8 rounded-full transition-all ${
                    step <= currentStep - 1 ? 'bg-[#4C1D95]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {currentStep === 1 && <ProductPage onBuyNow={handleBuyNow} currentImageIndex={currentImageIndex} setCurrentImageIndex={setCurrentImageIndex} />}
        {currentStep === 2 && (
          <CheckoutPage
            formData={formData}
            handleFormChange={handleFormChange}
            handleContinue={handleContinueToPayment}
          />
        )}
        {currentStep === 3 && (
          <PaymentPage
            formData={formData}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            handlePlaceOrder={handlePlaceOrder}
            loading={loading}
          />
        )}
        {currentStep === 4 && <ConfirmationPage orderDetails={orderDetails} />}
      </div>
    </div>
  );
}

function ProductPage({ onBuyNow, currentImageIndex, setCurrentImageIndex }) {
  return (
    <div className="animate-fade-in">
      <div className="relative">
        <img
          src={PRODUCT_IMAGES[currentImageIndex]}
          alt="Celesta Glow Serum"
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute top-4 right-4 bg-[#F59E0B] text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
          40% OFF
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {PRODUCT_IMAGES.map((_, idx) => (
            <button
              key={idx}
              data-testid={`image-dot-${idx}`}
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-2 w-2 rounded-full transition-all ${
                idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 pb-32">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Celesta Glow
          </h1>
          <p className="text-lg text-[#475569] font-medium">Advanced Anti-Aging Face Serum</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
              ))}
            </div>
            <span className="text-sm text-[#94A3B8]">4.67/5 (300 reviews)</span>
          </div>
        </div>

        <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} color="#F59E0B" />
            <span className="font-bold text-[#1E293B]">Special Launch Offer</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#4C1D95]">₹899</span>
            <span className="text-xl text-[#94A3B8] line-through">₹1,499</span>
            <span className="text-sm bg-[#059669] text-white px-2 py-1 rounded-full font-semibold">Save ₹600</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Fights Aging from Within
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '✨', text: 'Reduces Fine Lines' },
              { icon: '💧', text: 'Deep Hydration' },
              { icon: '🌟', text: 'Boosts Collagen' },
              { icon: '✨', text: 'Even Skin Tone' }
            ].map((benefit, idx) => (
              <div key={idx} data-testid={`benefit-${idx}`} className="benefit-card">
                <div className="text-3xl mb-2">{benefit.icon}</div>
                <p className="text-sm font-medium text-[#1E293B]">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Clinically Proven Ingredients
          </h3>
          <div className="space-y-2">
            {['0.3% Retinol', 'Niacinamide', 'Hyaluronic Acid', 'Vitamin E', 'Alpha Arbutin'].map((ingredient, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 size={18} color="#059669" />
                <span className="text-[#475569]">{ingredient}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Trusted by 10,000+ Customers
          </h3>
          <div className="testimonial-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#4C1D95] rounded-full flex items-center justify-center text-white font-bold">
                S
              </div>
              <div>
                <p className="font-semibold text-[#1E293B]">Shahana</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[#475569] italic">
              "My skin feels healthier every week. Perfect for Indian climate. Lightweight but effective!"
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          {[
            { icon: <ShieldCheck size={20} />, text: 'Dermatologist Tested' },
            { icon: <Package size={20} />, text: 'Made in India' }
          ].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[#4C1D95]">
              {badge.icon}
              <span className="text-sm font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky-cta">
        <button
          data-testid="buy-now-button"
          onClick={onBuyNow}
          className="btn-primary"
        >
          Buy Now - Get 40% OFF
        </button>
      </div>
    </div>
  );
}

function CheckoutPage({ formData, handleFormChange, handleContinue }) {
  return (
    <div className="p-6 animate-slide-up">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          Delivery Details
        </h2>
        <p className="text-[#475569]">Fill in your details to unlock exclusive offers</p>
      </div>

      <div className="bg-gradient-to-r from-[#4C1D95] to-[#6d28d9] text-white p-4 rounded-2xl mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={20} />
          <span className="font-bold">Unlock Extra ₹300 OFF!</span>
        </div>
        <p className="text-sm opacity-90">Choose prepaid payment and save more</p>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-2">Full Name *</label>
          <input
            data-testid="name-input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            placeholder="Enter your full name"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-2">Phone Number *</label>
          <div className="flex gap-2">
            <div className="input-field w-16 text-center" style={{ width: '60px' }}>+91</div>
            <input
              data-testid="phone-input"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              placeholder="Enter 10-digit number"
              className="input-field"
              maxLength="10"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-2">Complete Address *</label>
          <textarea
            data-testid="address-input"
            name="address"
            value={formData.address}
            onChange={handleFormChange}
            placeholder="House No, Street, City, State, PIN Code"
            className="input-field"
            rows="4"
            required
          />
        </div>
      </div>

      <button
        data-testid="continue-button"
        onClick={handleContinue}
        className="btn-primary"
      >
        Continue to Payment
      </button>
    </div>
  );
}

function PaymentPage({ formData, paymentMethod, setPaymentMethod, handlePlaceOrder, loading }) {
  return (
    <div className="p-6 animate-slide-up">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          Choose Payment Method
        </h2>
        <p className="text-[#475569]">Select your preferred payment option</p>
      </div>

      <div className="space-y-4 mb-6">
        <div
          data-testid="prepaid-option"
          onClick={() => setPaymentMethod('PREPAID')}
          className={`payment-option ${paymentMethod === 'PREPAID' ? 'selected' : ''}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="radio"
                  checked={paymentMethod === 'PREPAID'}
                  onChange={() => setPaymentMethod('PREPAID')}
                  className="w-5 h-5"
                />
                <span className="font-bold text-lg text-[#1E293B]">Pay Online</span>
                <span className="bg-[#059669] text-white text-xs px-2 py-1 rounded-full font-semibold">SAVE ₹300</span>
              </div>
              <p className="text-sm text-[#475569] ml-7">UPI, Cards, Netbanking via Razorpay</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#059669]">₹899</p>
              <p className="text-sm text-[#94A3B8] line-through">₹1,199</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#059669] ml-7">
            <Truck size={18} />
            <span className="text-sm font-medium">Fast Delivery (2-3 Days)</span>
          </div>
        </div>

        <div
          data-testid="cod-option"
          onClick={() => setPaymentMethod('COD')}
          className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="radio"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="w-5 h-5"
                />
                <span className="font-bold text-lg text-[#1E293B]">Cash on Delivery</span>
              </div>
              <p className="text-sm text-[#475569] ml-7">Pay when you receive</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#4C1D95]">₹1,199</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#F59E0B] ml-7">
            <Clock size={18} />
            <span className="text-sm font-medium">Delivery in 5-7 Business Days</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <h3 className="font-semibold text-[#1E293B] mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#475569]">Product Price</span>
            <span className="font-medium">₹1,499</span>
          </div>
          <div className="flex justify-between text-[#059669]">
            <span>Launch Discount (40%)</span>
            <span className="font-medium">- ₹600</span>
          </div>
          {paymentMethod === 'PREPAID' && (
            <div className="flex justify-between text-[#059669]">
              <span>Prepaid Discount</span>
              <span className="font-medium">- ₹300</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total Amount</span>
            <span className="text-[#4C1D95]">₹{paymentMethod === 'COD' ? '1,199' : '899'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-center mb-4 text-sm text-[#475569]">
        <ShieldCheck size={18} color="#059669" />
        <span>Secure checkout powered by Razorpay</span>
      </div>

      <button
        data-testid="place-order-button"
        onClick={handlePlaceOrder}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Processing...' : `Place Order - ₹${paymentMethod === 'COD' ? '1,199' : '899'}`}
      </button>
    </div>
  );
}

function ConfirmationPage({ orderDetails }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-screen animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-[#059669] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={48} color="white" />
        </div>
        <h2 className="text-3xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          Order Confirmed!
        </h2>
        <p className="text-[#475569]">Thank you for your purchase</p>
      </div>

      <div className="bg-gradient-to-br from-[#4C1D95] to-[#6d28d9] text-white rounded-2xl p-6 w-full mb-6">
        <div className="text-center mb-4">
          <p className="text-sm opacity-90 mb-1">Your Order ID</p>
          <p data-testid="order-id" className="text-3xl font-bold tracking-wider">{orderDetails?.order_id}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            {orderDetails?.payment_method === 'COD' ? <Clock size={20} /> : <Truck size={20} />}
            <span className="font-semibold">Delivery Timeline</span>
          </div>
          <p data-testid="delivery-timeline" className="text-lg">{orderDetails?.delivery_timeline}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 w-full mb-6">
        <h3 className="font-semibold text-[#1E293B] mb-4">Delivery Details</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-[#94A3B8] text-xs mb-1">Name</p>
            <p className="text-[#1E293B] font-medium">{orderDetails?.name}</p>
          </div>
          <div>
            <p className="text-[#94A3B8] text-xs mb-1">Phone</p>
            <p className="text-[#1E293B] font-medium">+91 {orderDetails?.phone}</p>
          </div>
          <div>
            <p className="text-[#94A3B8] text-xs mb-1">Address</p>
            <p className="text-[#1E293B] font-medium">{orderDetails?.address}</p>
          </div>
          <div>
            <p className="text-[#94A3B8] text-xs mb-1">Payment Method</p>
            <p className="text-[#1E293B] font-medium">{orderDetails?.payment_method}</p>
          </div>
          <div className="pt-3 border-t">
            <p className="text-[#94A3B8] text-xs mb-1">Amount Paid</p>
            <p className="text-[#4C1D95] font-bold text-xl">₹{orderDetails?.amount}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#FFFBEB] border border-[#F59E0B]/20 rounded-2xl p-4 w-full">
        <p className="text-sm text-[#475569] text-center">
          📧 Order confirmation has been sent to your registered email
        </p>
      </div>
    </div>
  );
}

export default App;