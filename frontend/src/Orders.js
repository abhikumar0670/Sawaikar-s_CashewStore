import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaUniversity, FaWallet, FaMobileAlt } from 'react-icons/fa';
import { FiTruck, FiRefreshCw, FiFileText, FiX } from 'react-icons/fi';
import placeholderImg from './assets/placeholderImg';
import OrderTracking from './components/OrderTracking';
import { useCartContext } from './context/cart_context';

const OrdersContainer = styled.div`
  margin: 40px auto;
  max-width: 900px;
  background: #f7f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 24px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #888;
  font-size: 1.1rem;
  padding: 40px 0;
`;

const Order = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e5e5e5;
  background: #fff;
  border-radius: 10px;
  margin: 0 0 24px 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const OrderDetails = styled.div`
  flex: 2;
  font-size: 1rem;
  color: #222;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const OrderItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 12px;
`;

const ProductImg = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
  background: #fafafa;
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const OrderActions = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: ${props => props.variant === 'return' ? '#D2691E' : props.variant === 'cancel' ? '#8B4513' : '#CD853F'};
  color: #fff;
  padding: 8px 18px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  &:hover {
    background: ${props => props.variant === 'return' ? '#B8860B' : props.variant === 'cancel' ? '#654321' : '#A0522D'};
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  ${({ status }) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return `background: rgba(46, 125, 50, 0.15); color: #2e7d32;`;
      case 'shipped':
        return `background: rgba(33, 150, 243, 0.15); color: #1976d2;`;
      case 'processing':
      case 'confirmed':
        return `background: rgba(205, 133, 63, 0.2); color: #8B4513;`;
      case 'cancelled':
        return `background: rgba(211, 47, 47, 0.15); color: #d32f2f;`;
      default:
        return `background: rgba(255, 193, 7, 0.2); color: #f57c00;`;
    }
  }}
`;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
  const [reordering, setReordering] = useState(null);
  const { user, isLoaded } = useUser();
  const { addToCart, clearCart } = useCartContext();
  const navigate = useNavigate();

  // Fetch orders from database based on user email
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoaded) return;
      
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userEmail = user.primaryEmailAddress?.emailAddress;
        if (!userEmail) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/orders?email=${userEmail}`);
        const fetchedOrders = response.data || [];
        
        // Sort by most recent first
        fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isLoaded]);

  // Cancel order handler
  const handleCancel = async (orderId) => {
    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
      setOrders(orders.map(order =>
        order.orderId === orderId ? { ...order, orderStatus: 'cancelled' } : order
      ));
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  // Return order handler
  const handleReturn = async (orderId) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
        orderStatus: 'return_initiated'
      });
      setOrders(orders.map(order =>
        order.orderId === orderId ? { ...order, orderStatus: 'return_initiated' } : order
      ));
      toast.success('Return initiated successfully');
    } catch (error) {
      console.error('Error initiating return:', error);
      toast.error('Failed to initiate return');
    }
  };

  // Track order handler - show modal with tracking timeline
  const handleTrack = (order) => {
    setSelectedOrderForTracking(order.orderId);
  };

  // Reorder handler
  const handleReorder = async (orderId) => {
    try {
      setReordering(orderId);
      const response = await axios.post(`http://localhost:5000/api/orders/${orderId}/reorder`);
      const { reorderData } = response.data;

      if (reorderData.unavailableItems && reorderData.unavailableItems.length > 0) {
        toast.warn(`Some items are unavailable: ${reorderData.unavailableItems.map(i => i.name).join(', ')}`);
      }

      // Clear current cart and add items
      clearCart();
      
      for (const item of reorderData.items) {
        addToCart(item.productId, item.quantity, {
          id: item.productId,
          name: item.name,
          price: item.price,
          image: [item.image],
          color: item.color || '#f5deb3',
          stock: 100
        });
      }

      toast.success('Items added to cart! Proceed to checkout.');
    } catch (error) {
      console.error('Error reordering:', error);
      const errorMsg = error.response?.data?.message;
      if (errorMsg?.includes('will be added soon') || errorMsg?.includes('available') || errorMsg?.includes('None')) {
        toast.error('Items will be added soon... Stock is being processed!');
      } else {
        toast.error(errorMsg || 'Failed to reorder');
      }
    } finally {
      setReordering(null);
    }
  };

  // Get image for product
  const getProductImage = (item) => {
    if (item.image) return item.image;
    
    const name = (item.name || '').toLowerCase();
    try {
      if (name.includes('honey roasted') || name.includes('flavored')) return require('./assets/Honey-Roasted-Cashews.jpg');
      if (name.includes('roasted') && name.includes('salted')) return require('./assets/Honey-Roasted-Cashews.jpg');
      if (name.includes('cashew')) return require('./assets/Honey-Roasted-Cashews.jpg');
      if (name.includes('almond')) return require('./assets/almond.jpg');
      if (name.includes('pista')) return require('./assets/pista.jpg');
      if (name.includes('date')) return require('./assets/date.jpg');
      if (name.includes('fig')) return require('./assets/driedfigs.jpg');
      if (name.includes('hamper')) return require('./assets/dry-fruits-hamper.jpg');
      if (name.includes('resin')) return require('./assets/resins.jpg');
      if (name.includes('walnut')) return require('./assets/walnaut.jpg');
      if (name.includes('chickpea')) return require('./assets/RoastedChickpeas.jpg');
      if (name.includes('trail')) return require('./assets/trailmixrecipe.jpg');
      if (name.includes('granola')) return require('./assets/Granola-Bars.jpg');
      return placeholderImg;
    } catch (e) {
      return placeholderImg;
    }
  };

  if (loading) {
    return (
      <OrdersContainer>
        <LoadingMessage>Loading your orders...</LoadingMessage>
      </OrdersContainer>
    );
  }

  if (!user) {
    return (
      <OrdersContainer>
        <LoadingMessage>Please log in to view your orders.</LoadingMessage>
      </OrdersContainer>
    );
  }

  return (
    <OrdersContainer>
      <h2 style={{ marginBottom: '24px', color: '#8B4513', borderBottom: '2px solid #CD853F', paddingBottom: '12px' }}>
        📦 My Orders
      </h2>
      {orders.length === 0 ? (
        <LoadingMessage>No orders yet. Start shopping to see your orders here!</LoadingMessage>
      ) : (
        orders.map(order => (
          <Order key={order._id || order.orderId}>
            <OrderDetails>
              <div style={{fontWeight:600, fontSize:'1.08rem', marginBottom:2}}>
                Order ID: <span style={{fontWeight:400, color: '#8B4513'}}>{order.orderId || order._id?.slice(-8).toUpperCase()}</span>
              </div>
              <div>
                Status: <StatusBadge status={order.orderStatus || order.status}>{order.orderStatus || order.status || 'Placed'}</StatusBadge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Payment: <StatusBadge status={order.paymentStatus}>{order.paymentStatus || 'Pending'}</StatusBadge>
                {(() => {
                  const paymentInfo = order.paymentInfo || {};
                  const method = (paymentInfo.type || order.paymentMethod || '').toLowerCase();
                  let icon = null;
                  let details = '';
                  
                  if (method === 'upi') {
                    icon = <FaMobileAlt style={{color: '#5f4dee', fontSize: '1rem'}} />;
                    details = paymentInfo.vpa || paymentInfo.upiId || 'UPI';
                  } else if (method === 'card') {
                    icon = <FaCreditCard style={{color: '#ff6b6b', fontSize: '1rem'}} />;
                    details = paymentInfo.cardLast4 ? `**** ${paymentInfo.cardLast4}` : 'Card';
                  } else if (method === 'netbanking') {
                    icon = <FaUniversity style={{color: '#4ecdc4', fontSize: '1rem'}} />;
                    details = paymentInfo.bank || 'Netbanking';
                  } else if (method === 'wallet') {
                    icon = <FaWallet style={{color: '#f39c12', fontSize: '1rem'}} />;
                    details = paymentInfo.wallet || 'Wallet';
                  } else {
                    details = method || 'N/A';
                  }
                  
                  return (
                    <span style={{ marginLeft: '4px', color: '#666', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {icon}
                      ({details})
                    </span>
                  );
                })()}
              </div>
              <div>Amount: <b style={{ color: '#8B4513' }}>₹{((order.totalAmount || order.totalPrice || 0) / 100).toLocaleString()}</b></div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>
                Ordered: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
              </div>
              <OrderItems>
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} style={{display:'flex',alignItems:'center',gap:10,minWidth:180}}>
                    <ProductImg 
                      src={getProductImage(item)} 
                      alt={item.name} 
                      onError={e => {e.target.onerror=null; e.target.src=placeholderImg}} 
                    />
                    <ItemInfo>
                      <div style={{fontWeight:500}}>{item.name}</div>
                      <div style={{color:'#666',fontSize:'0.97rem'}}>Qty: {item.quantity || item.amount}</div>
                      <div style={{color:'#8B4513',fontSize:'0.9rem'}}>₹{((item.price || 0) / 100).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </ItemInfo>
                  </div>
                ))}
              </OrderItems>
            </OrderDetails>
            <OrderActions>
              <Button onClick={() => handleTrack(order)}>
                <FiTruck style={{ marginRight: '6px' }} />
                Track
              </Button>
              <Button 
                onClick={() => handleReorder(order.orderId)}
                disabled={reordering === order.orderId}
              >
                <FiRefreshCw style={{ marginRight: '6px' }} />
                {reordering === order.orderId ? 'Adding...' : 'Reorder'}
              </Button>
              {order.paymentStatus === 'completed' && (
                <Button 
                  onClick={() => toast.info('📄 Visit Payment History to view/download invoice', { 
                    position: 'top-right',
                    autoClose: 3000 
                  })}
                  title="View/Download Invoice"
                >
                  <FiFileText style={{ marginRight: '6px' }} />
                  Invoice
                </Button>
              )}
              <Button 
                variant="return" 
                onClick={() => handleReturn(order.orderId)} 
                disabled={order.orderStatus !== 'delivered'}
              >
                Return
              </Button>
              <Button 
                variant="cancel" 
                onClick={() => handleCancel(order.orderId)} 
                disabled={!['placed', 'confirmed'].includes(order.orderStatus)}
              >
                Cancel
              </Button>
            </OrderActions>
          </Order>
        ))
      )}

      {/* Tracking Modal */}
      {selectedOrderForTracking && (
        <TrackingModal>
          <TrackingModalContent>
            <CloseModalBtn onClick={() => setSelectedOrderForTracking(null)}>
              <FiX />
            </CloseModalBtn>
            <OrderTracking 
              orderId={selectedOrderForTracking} 
              onReorder={(id) => {
                setSelectedOrderForTracking(null);
                handleReorder(id);
              }}
            />
          </TrackingModalContent>
        </TrackingModal>
      )}
    </OrdersContainer>
  );
};

const TrackingModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
`;

const TrackingModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 20px;
`;

const CloseModalBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;

  &:hover {
    background: #e5e7eb;
  }

  svg {
    width: 20px;
    height: 20px;
    color: #374151;
  }
`;

export default Orders;

