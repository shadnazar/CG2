import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, Package, Truck, Phone } from 'lucide-react';
import { trackPurchase } from '../utils/metaPixel';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pixelFired, setPixelFired] = useState(false);

  useEffect(() => {
    const fetchOrderAndTrack = async () => {
      try {
        // Fetch order details from backend
        const response = await axios.get(`${API}/orders/${orderId}`);
        const orderData = response.data;
        setOrder(orderData);

        // Fire Purchase event ONLY ONCE
        if (!pixelFired && orderData) {
          // Track Purchase via module
          trackPurchase(orderData.order_id, orderData.amount);

          // Direct fbq call for Purchase - CRITICAL for Meta tracking
          if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'Purchase', {
              value: orderData.amount,
              currency: 'INR',
              content_name: 'Super Anti-Aging Serum',
              content_category: 'Skincare',
              content_ids: ['celestaglow_serum_001'],
              content_type: 'product',
              num_items: 1,
              order_id: orderData.order_id
            });
            console.log('[Meta Pixel] Purchase fired on order success page - order_id:', orderData.order_id, 'value:', orderData.amount);
          }

          setPixelFired(true);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderAndTrack();
    }
  }, [orderId, pixelFired]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-500 text-white px-6 py-2 rounded-full"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-8">
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={40} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1" data-testid="order-success-title">
          Order Confirmed!
        </h1>
        <p className="text-gray-500">Thank you for choosing Celesta Glow</p>
      </div>

      {/* Order ID Card */}
      <div className="bg-white rounded-2xl shadow-sm p-5 text-center mb-5" data-testid="order-id-card">
        <p className="text-gray-500 text-sm mb-1">Order ID</p>
        <p className="text-2xl font-bold text-green-500 tracking-wider">{order.order_id}</p>
      </div>

      {/* Order Timeline */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Order Placed</p>
              <p className="text-xs text-gray-500">Your order has been confirmed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Package size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-400">Packing</p>
              <p className="text-xs text-gray-400">We're preparing your order</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Truck size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-400">Shipping</p>
              <p className="text-xs text-gray-400">Expected: {order.delivery_timeline || '2-3 business days'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Product</span>
            <span className="text-gray-900 font-medium">Super Anti-Aging Serum</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Quantity</span>
            <span className="text-gray-900">1</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount Paid</span>
            <span className="text-green-600 font-bold">₹{order.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method</span>
            <span className="text-gray-900">{order.payment_method}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
        <p className="text-gray-600 text-sm">
          {order.name}<br />
          <span className="flex items-center gap-1 mt-1">
            <Phone size={14} />
            +91 {order.phone}
          </span>
          {order.house_number}, {order.area}<br />
          {order.state} - {order.pincode}
        </p>
      </div>

      {/* Continue Shopping Button */}
      <button
        onClick={() => navigate('/')}
        className="w-full bg-gray-900 text-white font-semibold py-4 rounded-full"
        data-testid="continue-shopping-button"
      >
        Continue Shopping
      </button>

      {/* Support Info */}
      <p className="text-center text-xs text-gray-500 mt-4">
        Need help? Contact us on WhatsApp: +91 9446125745
      </p>
    </div>
  );
}

export default OrderSuccessPage;
