import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { FaCreditCard, FaUniversity, FaWallet, FaMobileAlt } from 'react-icons/fa';
import { SiPhonepe, SiPaytm, SiGooglepay } from 'react-icons/si';

// API Base URL for production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to generate random barcode string
function generateBarcode() {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

// Helper to get payment method icon and display text
function getPaymentMethodDisplay(txn) {
  const paymentInfo = txn.paymentInfo || {};
  const method = (paymentInfo.type || txn.method || '').toLowerCase();
  
  // UPI Payment
  if (method === 'upi') {
    const upiId = paymentInfo.vpa || paymentInfo.upiId || txn.upiId;
    return {
      icon: <FaMobileAlt style={{fontSize: '1.2rem', color: '#5f4dee', marginRight: '6px'}} />,
      text: 'UPI',
      details: upiId || 'UPI Payment'
    };
  }
  
  // Card Payment
  if (method === 'card') {
    const cardLast4 = paymentInfo.cardLast4;
    const network = paymentInfo.network || 'Card';
    return {
      icon: <FaCreditCard style={{fontSize: '1.2rem', color: '#ff6b6b', marginRight: '6px'}} />,
      text: network || 'Card',
      details: cardLast4 ? `**** ${cardLast4}` : 'Card Payment'
    };
  }
  
  // Netbanking Payment
  if (method === 'netbanking') {
    const bank = paymentInfo.bank || txn.bank;
    return {
      icon: <FaUniversity style={{fontSize: '1.2rem', color: '#4ecdc4', marginRight: '6px'}} />,
      text: 'Netbanking',
      details: bank || 'Netbanking'
    };
  }
  
  // Wallet Payment
  if (method === 'wallet') {
    const wallet = paymentInfo.wallet;
    let walletIcon = <FaWallet style={{fontSize: '1.2rem', color: '#f39c12', marginRight: '6px'}} />;
    
    // Use specific wallet icons if available
    if (wallet && wallet.toLowerCase().includes('paytm')) {
      walletIcon = <SiPaytm style={{fontSize: '1.2rem', color: '#00baf2', marginRight: '6px'}} />;
    } else if (wallet && wallet.toLowerCase().includes('phonepe')) {
      walletIcon = <SiPhonepe style={{fontSize: '1.2rem', color: '#5f259f', marginRight: '6px'}} />;
    } else if (wallet && wallet.toLowerCase().includes('gpay')) {
      walletIcon = <SiGooglepay style={{fontSize: '1.2rem', color: '#4285f4', marginRight: '6px'}} />;
    }
    
    return {
      icon: walletIcon,
      text: 'Wallet',
      details: wallet || 'Wallet Payment'
    };
  }
  
  // Default/Other
  return {
    icon: <FaCreditCard style={{fontSize: '1.2rem', color: '#95a5a6', marginRight: '6px'}} />,
    text: method || 'N/A',
    details: txn.txnId || '-'
  };
}

const PaymentHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: clerkUser, isLoaded } = useUser();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isLoaded) return;
      
      if (!clerkUser) {
        // Fallback to localStorage if not logged in
        const allTxns = JSON.parse(localStorage.getItem('allTransactions') || '[]');
        allTxns.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(allTxns);
        setLoading(false);
        return;
      }

      try {
        // Fetch orders from MongoDB
        const userEmail = clerkUser.primaryEmailAddress?.emailAddress;
        if (!userEmail) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/orders?email=${userEmail}`);
        const orders = response.data || [];
        
        // Transform orders to transaction format
        const transformedTxns = orders.map(order => ({
          orderId: order.orderId || order._id,
          txnId: order.razorpayPaymentId || order.transactionId,
          date: order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A',
          amount: order.totalAmount || order.totalPrice || 0,
          status: order.paymentStatus === 'completed' ? 'Confirmed' : order.orderStatus || 'Pending',
          method: (order.paymentInfo?.type || order.paymentMethod || 'N/A').toUpperCase(),
          type: order.paymentInfo?.type || order.paymentMethod,
          items: order.items || [],
          products: order.items || [],
          paymentInfo: order.paymentInfo || {},
          upiId: order.paymentInfo?.vpa || order.paymentInfo?.upiId,
          bank: order.paymentInfo?.bank,
          // Include shipping address from order
          shippingAddress: order.shippingAddress || null,
          userPhone: order.userPhone || order.shippingAddress?.phone || ''
        }));
        
        // Sort by most recent first
        transformedTxns.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(transformedTxns);
      } catch (error) {
        console.error('Error fetching payment history:', error);
        // Fallback to localStorage on error
        const allTxns = JSON.parse(localStorage.getItem('allTransactions') || '[]');
        allTxns.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(allTxns);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [clerkUser, isLoaded]);

  // Helper to generate SVG barcode (longer version)
  function getBarcodeSVG(code, longer = false) {
    let bars = '';
    const height = longer ? 60 : 40;
    for (let i = 0; i < code.length; i++) {
      const width = (parseInt(code[i]) % 2 === 0) ? 4 : 2;
      bars += `<rect x="${i*8}" y="0" width="${width}" height="${height}" fill="#222" />`;
    }
    return `<svg width="${code.length*8}" height="${height}">${bars}</svg>`;
  }

  // Store information (Bill To - seller details)
  const storeInfo = {
    name: "Sawaikar's Cashew Store",
    owner: 'Shreyas Sawaikar',
    address: '123 Cashew Lane',
    city: 'Goa',
    state: 'Goa',
    pin: '403001',
    country: 'India',
    phone: '9876543210',
    email: 'sawaikarcashewstore1980@gmail.com',
    gstin: '22ABCDE1234F1Z5'
  };

  // Get customer info from Clerk user (Ship To - buyer details)
  const getCustomerInfo = () => {
    if (!isLoaded || !clerkUser) {
      // Fallback to localStorage if Clerk user not available
      const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        name: loggedInUser.name || 'Customer',
        address: loggedInUser.address || '',
        city: loggedInUser.city || '',
        state: loggedInUser.state || '',
        pin: loggedInUser.pin || '',
        email: loggedInUser.email || 'Not Provided',
        phone: loggedInUser.phone || '',
      };
    }
    
    // Get user metadata from Clerk
    const metadata = clerkUser.publicMetadata || {};
    const unsafeMetadata = clerkUser.unsafeMetadata || {};
    
    return {
      name: clerkUser.fullName || clerkUser.firstName || 'Customer',
      address: metadata.address || unsafeMetadata.address || '',
      city: metadata.city || unsafeMetadata.city || '',
      state: metadata.state || unsafeMetadata.state || '',
      pin: metadata.pin || unsafeMetadata.pin || '',
      email: clerkUser.primaryEmailAddress?.emailAddress || 'Not Provided',
      phone: clerkUser.primaryPhoneNumber?.phoneNumber || metadata.phone || unsafeMetadata.phone || '',
    };
  };

  const customer = getCustomerInfo();

  function downloadInvoice(txn) {
    const barcode = generateBarcode();
    const orderId = txn.orderId || txn.txnId || barcode;
    const invoiceDate = txn.date || new Date().toLocaleString();
    // Use all product names for description, fallback to items/products arrays, else single name
    let itemName = '-';
    if (Array.isArray(txn.items) && txn.items.length > 0) {
      itemName = txn.items.map(p => p.name || p.productName).filter(Boolean).join(', ');
    } else if (Array.isArray(txn.products) && txn.products.length > 0) {
      itemName = txn.products.map(p => p.name || p.productName).filter(Boolean).join(', ');
    } else {
      itemName = txn.productName || txn.name || txn.itemName || txn.description || '-';
    }
    const itemQty = txn.qty || 1;
    
    // FIX: Amount is stored in paise, convert to rupees for display
    // Razorpay stores amounts in paise (smallest currency unit)
    // If amount is > 10000, it's likely in paise (e.g., ₹100 = 10000 paise)
    const amountInPaise = txn.amount || 0;
    const amountInRupees = amountInPaise > 10000 ? amountInPaise / 100 : amountInPaise;
    const itemRate = amountInRupees;
    
    // Get customer info - prefer shipping address from order, then fallback to Clerk
    const shippingAddr = txn.shippingAddress;
    let customerInfo;
    let customerAddress;
    
    console.log('Invoice - Shipping Address:', shippingAddr); // Debug log
    
    if (shippingAddr && (shippingAddr.address || shippingAddr.street || shippingAddr.city)) {
      // Use shipping address from order
      customerInfo = {
        name: shippingAddr.name || getCustomerInfo().name,
        address: shippingAddr.address || shippingAddr.street || '',
        city: shippingAddr.city || '',
        state: shippingAddr.state || '',
        pin: shippingAddr.pincode || shippingAddr.zipCode || shippingAddr.pin || '',
        email: getCustomerInfo().email,
        phone: shippingAddr.phone || txn.userPhone || ''
      };
      customerAddress = [customerInfo.address, customerInfo.city, customerInfo.state, customerInfo.pin].filter(Boolean).join(', ');
      if (!customerAddress) customerAddress = 'Address not provided';
    } else {
      // Fallback to Clerk user info
      customerInfo = getCustomerInfo();
      customerAddress = [customerInfo.address, customerInfo.city, customerInfo.state, customerInfo.pin].filter(Boolean).join(', ') || 'Address not provided';
    }
    
    // Final display amount in rupees
    const displayAmount = amountInRupees;
    
    const invoiceHtml = `
      <html><head><title>Invoice - ${orderId}</title><style>
        body { font-family: Arial, sans-serif; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px #eee; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #eee; padding: 12px; text-align: left; vertical-align: top; }
        .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #8B4513; }
        .barcode { font-family: monospace; font-size: 18px; margin-top: 8px; }
        .barcode-img { display: block; margin: 10px 0; height: 60px; }
        .section-title { font-weight: bold; color: #8B4513; margin-bottom: 8px; font-size: 14px; }
        .store-name { font-weight: bold; font-size: 16px; color: #333; }
        .customer-name { font-weight: bold; font-size: 16px; color: #333; }
        .info-line { margin: 4px 0; color: #555; }
        .total-section { background: #FFF8DC; padding: 12px; margin-top: 10px; border-radius: 5px; }
      </style></head><body>
      <div class="invoice-box">
        <div class="header">🥜 Tax Invoice</div>
        <table>
          <tr>
            <td style="width: 60%;">
              <div class="section-title">FROM (Seller)</div>
              <div class="store-name">${storeInfo.name}</div>
              <div class="info-line">Proprietor: ${storeInfo.owner}</div>
              <div class="info-line">${storeInfo.address}, ${storeInfo.city}, ${storeInfo.state} - ${storeInfo.pin}</div>
              <div class="info-line">📞 ${storeInfo.phone}</div>
              <div class="info-line">✉️ ${storeInfo.email}</div>
              <div class="info-line">GSTIN: ${storeInfo.gstin}</div>
            </td>
            <td>
              <div class="section-title">INVOICE DETAILS</div>
              <div class="info-line"><b>Invoice No:</b> ${barcode}</div>
              <div class="info-line"><b>Order ID:</b> ${orderId}</div>
              <div class="info-line"><b>Date:</b> ${invoiceDate}</div>
              <div class="info-line"><b>Payment:</b> ${txn.method?.toUpperCase() || 'N/A'}</div>
            </td>
          </tr>
          <tr>
            <td>
              <div class="section-title">BILL TO (Customer)</div>
              <div class="customer-name">${customerInfo.name}</div>
              <div class="info-line">${customerAddress}</div>
              ${customerInfo.phone ? `<div class="info-line">📞 ${customerInfo.phone}</div>` : ''}
              <div class="info-line">✉️ ${customerInfo.email}</div>
            </td>
            <td>
              <div class="section-title">SHIP TO</div>
              <div class="customer-name">${customerInfo.name}</div>
              <div class="info-line">${customerAddress}</div>
              ${customerInfo.phone ? `<div class="info-line">📞 ${customerInfo.phone}</div>` : ''}
            </td>
          </tr>
        </table>
        <br/>
        <table>
          <tr style="background: #8B4513; color: white;">
            <th style="width: 60px;">Sl No.</th>
            <th>Description</th>
            <th style="width: 80px;">Qty</th>
            <th style="width: 100px;">Rate</th>
            <th style="width: 100px;">Amount</th>
          </tr>
          <tr>
            <td style="text-align: center;">1</td>
            <td>${itemName}</td>
            <td style="text-align: center;">${itemQty}</td>
            <td style="text-align: right;">₹${Number(displayAmount).toLocaleString()}</td>
            <td style="text-align: right;">₹${Number(displayAmount).toLocaleString()}</td>
          </tr>
        </table>
        <div class="total-section">
          <b>Total Amount: ₹${Number(displayAmount).toLocaleString()}</b><br/>
          <b>Status: <span style="color: ${txn.status?.toLowerCase() === 'success' || txn.status?.toLowerCase() === 'confirmed' ? '#2e7d32' : '#e74c3c'};">${txn.status}</span></b>
        </div>
        <br/>
        <div class="barcode">
          <b>Barcode:</b> ${barcode}<br/>
          ${getBarcodeSVG(barcode, true)}
        </div>
        <br/><br/>
        <small style="color: #888;">This is a computer generated invoice. Thank you for shopping with Sawaikar's!</small>
      </div></body></html>
    `;
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${orderId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

              return (
                <div style={{padding: '24px 16px', maxWidth: 900, margin: '0 auto'}}>
                  <h2 style={{marginBottom: 18}}>Payment History</h2>
                  
                  {loading ? (
                    <div style={{color:'#888', fontSize:'1.1rem', textAlign:'center', padding:'40px 0'}}>Loading payment history...</div>
                  ) : transactions.length === 0 ? (
                    <div style={{color:'#888', fontSize:'1.1rem'}}>No payment transactions found.</div>
                  ) : (
                    <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:8, boxShadow:'0 0 8px #eee', textAlign:'center'}}>
                      <thead>
                        <tr style={{background:'#f8f9fa'}}>
                          <th style={{padding:'10px 8px'}}>Date & Time</th>
                          <th>Item</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Details</th>
                          <th>Status</th>
                          <th>Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((txn, idx) => {
                          // Robust: show all product names if products array exists, else fallback to other fields
                          // Extract product names from txn.items if present, else fallback to other fields
                          let itemName = '-';
                          if (Array.isArray(txn.items) && txn.items.length > 0) {
                            itemName = txn.items.map(p => p.name || p.productName).filter(Boolean).join(', ');
                          } else if (Array.isArray(txn.products) && txn.products.length > 0) {
                            itemName = txn.products.map(p => p.name || p.productName).filter(Boolean).join(', ');
                          } else {
                            itemName = txn.productName || txn.name || txn.itemName || txn.description || '-';
                          }
                          
                          const paymentDisplay = getPaymentMethodDisplay(txn);
                          const statusColor = ['success', 'completed', 'confirmed'].includes(txn.status?.toLowerCase()) ? '#28a745' : 
                                             txn.status?.toLowerCase() === 'cancelled' ? '#888' : '#e74c3c';
                          
                          // Convert amount from paise to rupees if needed
                          // Razorpay stores amounts in paise (₹100 = 10000 paise)
                          const displayAmount = txn.amount > 10000 ? (txn.amount / 100) : txn.amount;
                          
                          return (
                            <tr key={idx} style={{borderBottom:'1px solid #f0f0f0', height: '52px'}}>
                              <td style={{padding:'14px 10px'}}>{txn.date}</td>
                              <td style={{padding:'14px 18px', fontWeight: 500, fontSize: '1.08rem', letterSpacing: '0.5px'}}>{itemName}</td>
                              <td style={{padding:'14px 10px'}}>₹{Number(displayAmount).toLocaleString()}</td>
                              <td style={{padding:'14px 10px'}}>
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                  {paymentDisplay.icon}
                                  <span style={{fontWeight: 500}}>{paymentDisplay.text}</span>
                                </div>
                              </td>
                              <td style={{padding:'14px 10px', fontSize: '0.95rem', color: '#555'}}>{paymentDisplay.details}</td>
                              <td style={{padding:'14px 10px'}}>
                                <span style={{
                                  color: statusColor,
                                  fontWeight: 600,
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  background: statusColor + '15',
                                  fontSize: '0.9rem'
                                }}>
                                  {txn.status}
                                </span>
                              </td>
                              <td style={{padding:'14px 10px'}}>
                                {['success', 'completed', 'paid', 'confirmed'].includes(txn.status?.toLowerCase()) ? (
                                  <button style={{padding:'8px 18px', fontSize:15, background:'#d2691e', color:'#fff', border:'none', borderRadius:4, cursor:'pointer'}} onClick={() => downloadInvoice(txn)}>Download Invoice</button>
                                ) : (
                                  <span style={{color: '#888', fontSize: '13px'}}>No Invoice</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            };

            export default PaymentHistory;
