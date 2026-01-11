const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Send email using Gmail REST API (works on Render - uses HTTPS, not SMTP)
const sendWithGmailAPI = async (mailOptions) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  
  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });
  
  // Get access token
  const { token } = await oauth2Client.getAccessToken();
  
  // Create email content
  const fromMatch = mailOptions.from.match(/"?([^"<]+)"?\s*<([^>]+)>/);
  const senderName = fromMatch ? fromMatch[1].trim() : 'Sawaikar\'s Cashew Store';
  const senderEmail = fromMatch ? fromMatch[2] : process.env.EMAIL_USER;
  
  // Create MIME message
  const messageParts = [
    `From: "${senderName}" <${senderEmail}>`,
    `To: ${mailOptions.to}`,
    `Subject: ${mailOptions.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="boundary"',
    '',
    '--boundary',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    mailOptions.text || '',
    '',
    '--boundary',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    mailOptions.html || '',
    '',
    '--boundary--'
  ];
  
  const message = messageParts.join('\n');
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  // Send via Gmail API
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });
  
  return { messageId: result.data.id };
};

// Send email using Mailjet HTTP API (works immediately, any recipient)
const sendWithMailjetAPI = async (mailOptions) => {
  const fromMatch = mailOptions.from.match(/"?([^"<]+)"?\s*<([^>]+)>/);
  const senderName = fromMatch ? fromMatch[1].trim() : 'Sawaikar\'s Cashew Store';
  const senderEmail = fromMatch ? fromMatch[2] : process.env.EMAIL_USER;
  
  const auth = Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`).toString('base64');
  
  const response = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Messages: [{
        From: { Email: senderEmail, Name: senderName },
        To: [{ Email: mailOptions.to }],
        Subject: mailOptions.subject,
        HTMLPart: mailOptions.html,
        TextPart: mailOptions.text
      }]
    })
  });
  
  const data = await response.json();
  
  if (!response.ok || (data.Messages && data.Messages[0].Status === 'error')) {
    throw new Error(data.ErrorMessage || JSON.stringify(data) || 'Mailjet API error');
  }
  
  return { messageId: data.Messages?.[0]?.To?.[0]?.MessageID || 'sent' };
};

// Send email using Resend HTTP API (requires verified domain for real recipients)
const sendWithResendAPI = async (mailOptions) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Resend API error');
  }
  
  return { messageId: data.id };
};

// Send email using Brevo HTTP API (requires account activation)
const sendWithBrevoAPI = async (mailOptions) => {
  // Parse sender info
  const fromMatch = mailOptions.from.match(/"?([^"<]+)"?\s*<([^>]+)>/);
  const senderName = fromMatch ? fromMatch[1].trim() : 'Sawaikar\'s Cashew Store';
  const senderEmail = fromMatch ? fromMatch[2] : process.env.EMAIL_USER;
  
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: mailOptions.to }],
      subject: mailOptions.subject,
      htmlContent: mailOptions.html,
      textContent: mailOptions.text
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || JSON.stringify(data) || 'Brevo API error');
  }
  
  return { messageId: data.messageId };
};

// Create transporter for sending emails (fallback for local dev)
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    console.warn('⚠️ Gmail credentials not configured for local fallback.');
    return null;
  }
  
  console.log('📧 Using Gmail SMTP for local dev:', emailUser);
  
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
};

// Helper function to format price (convert paise to rupees)
const formatPrice = (priceInPaise) => {
  const priceInRupees = (priceInPaise || 0) / 100;
  return priceInRupees.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

// Generate HTML for items table rows
const generateItemsHtml = (items) => {
  return items.map(item => {
    const itemTotal = formatPrice(item.price * item.quantity);
    return '<tr>' +
      '<td style="padding: 14px 12px; border-bottom: 1px solid #FEF3C7; color: #374151; font-size: 14px;">' + item.name + '</td>' +
      '<td style="padding: 14px 12px; border-bottom: 1px solid #FEF3C7; text-align: center; color: #374151; font-size: 14px;">' + item.quantity + '</td>' +
      '<td style="padding: 14px 12px; border-bottom: 1px solid #FEF3C7; text-align: right; color: #374151; font-size: 14px; font-weight: 600;">₹' + itemTotal + '</td>' +
      '</tr>';
  }).join('');
};

// Generate shipping address HTML
const generateAddressHtml = (shippingAddress) => {
  if (!shippingAddress) return '';
  
  const name = shippingAddress.name || '';
  const street = shippingAddress.street || shippingAddress.address || '';
  const city = shippingAddress.city || '';
  const state = shippingAddress.state || '';
  const pincode = shippingAddress.pincode || '';
  const country = shippingAddress.country || 'India';
  const phone = shippingAddress.phone ? '<br>📞 ' + shippingAddress.phone : '';
  
  return name + '<br>' + street + '<br>' + city + ', ' + state + ' - ' + pincode + '<br>' + country + phone;
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order) => {
  console.log('📧 sendOrderConfirmationEmail called for:', order.userEmail);
  
  // Calculate values
  const userName = order.userName || 'Valued Customer';
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const currentYear = new Date().getFullYear();
  
  // Prices: item.price is in paise, order.totalAmount is also in paise
  const subtotal = formatPrice(order.totalAmount - (order.shippingFee || 0));
  const shipping = (order.shippingFee || 0);
  const shippingDisplay = shipping > 0 ? '₹' + formatPrice(shipping) : 'FREE';
  const total = formatPrice(order.totalAmount);
  
  const paymentStatusBadge = order.paymentStatus === 'completed' 
    ? '<span style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">✓ PAID</span>'
    : '<span style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">PENDING</span>';

  // Plain text version
  const plainTextEmail = 'Hi ' + userName + ',\n\n' +
    'Your order is confirmed! ✅\n\n' +
    'Thank you for your purchase at Sawaikar\'s Cashew Store!\n\n' +
    'ORDER DETAILS\n' +
    '─────────────────────────────\n' +
    'Order ID: ' + order.orderId + '\n' +
    'Date: ' + orderDate + '\n' +
    'Payment Status: ' + order.paymentStatus.toUpperCase() + '\n' +
    (order.transactionId ? 'Transaction ID: ' + order.transactionId + '\n' : '') +
    '\nITEMS ORDERED\n' +
    '─────────────────────────────\n' +
    order.items.map(item => '• ' + item.name + ' x ' + item.quantity + ' - ₹' + formatPrice(item.price * item.quantity)).join('\n') + '\n\n' +
    'Subtotal: ₹' + subtotal + '\n' +
    'Shipping: ' + shippingDisplay + '\n' +
    'TOTAL: ₹' + total + '\n\n' +
    'We\'ll notify you once your order is shipped.\n\n' +
    'Questions? Contact us at:\n' +
    '📧 support@sawaikarcashew.com\n' +
    '📞 +91 98765 43210\n\n' +
    'Thank you for choosing Sawaikar\'s Cashew Store!';

  // HTML Email Template
  const htmlEmail = '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
    '<title>Order Confirmation - Sawaikar\'s Cashew Store</title>' +
    '<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->' +
    '</head>' +
    '<body style="margin: 0; padding: 0; background-color: #FFF7ED; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif;">' +
    
    '<!-- Main Container -->' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFF7ED;">' +
    '<tr><td align="center" style="padding: 20px 10px;">' +
    
    '<!-- Email Container -->' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">' +
    
    '<!-- Header Banner -->' +
    '<tr>' +
    '<td style="background: linear-gradient(135deg, #D97706 0%, #B45309 100%); padding: 35px 30px; text-align: center;">' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
    '<tr><td align="center">' +
    '<span style="display: inline-block; background: rgba(255,255,255,0.2); border-radius: 50%; width: 40px; height: 40px; line-height: 40px; font-size: 20px; margin-bottom: 10px;">✓</span>' +
    '</td></tr>' +
    '<tr><td align="center">' +
    '<h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Sawaikar\'s</h1>' +
    '<p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;">Premium Cashews</p>' +
    '</td></tr>' +
    '</table>' +
    '</td>' +
    '</tr>' +
    
    '<!-- Main Content -->' +
    '<tr>' +
    '<td style="padding: 35px 30px;">' +
    
    '<!-- Greeting -->' +
    '<p style="margin: 0 0 8px 0; color: #6B7280; font-size: 15px;">Hi <strong style="color: #D97706;">' + userName + '</strong>,</p>' +
    
    '<!-- Main Heading -->' +
    '<h2 style="margin: 0 0 15px 0; color: #1F2937; font-size: 26px; font-weight: 700;">Your order is confirmed! <span style="font-size: 28px;">✅</span></h2>' +
    
    '<!-- Body Text -->' +
    '<p style="margin: 0 0 25px 0; color: #6B7280; font-size: 15px; line-height: 1.6;">Thank you for your purchase! We\'re getting your order ready to be shipped.</p>' +
    
    '<!-- Order ID & Status Box -->' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 12px; border: 2px solid #D97706; margin-bottom: 25px;">' +
    '<tr><td style="padding: 20px;">' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
    '<tr>' +
    '<td style="vertical-align: top;">' +
    '<p style="margin: 0 0 5px 0; color: #92400E; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</p>' +
    '<p style="margin: 0; color: #D97706; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">' + order.orderId + '</p>' +
    '</td>' +
    '<td style="text-align: right; vertical-align: top;">' +
    '<p style="margin: 0 0 5px 0; color: #92400E; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Payment Status</p>' +
    paymentStatusBadge +
    '</td>' +
    '</tr>' +
    (order.transactionId ? '<tr><td colspan="2" style="padding-top: 12px;"><p style="margin: 0; color: #92400E; font-size: 12px;"><strong>Transaction ID:</strong> ' + order.transactionId + '</p></td></tr>' : '') +
    '</table>' +
    '</td></tr>' +
    '</table>' +
    
    '<!-- Items Ordered Section -->' +
    '<h3 style="margin: 0 0 15px 0; color: #D97706; font-size: 16px; font-weight: 700; display: flex; align-items: center;"><span style="margin-right: 8px;">📦</span> Items Ordered</h3>' +
    
    '<!-- Items Table -->' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #FFFFFF; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(217, 119, 6, 0.1); margin-bottom: 25px;">' +
    '<thead>' +
    '<tr style="background: #D97706;">' +
    '<th style="padding: 14px 12px; text-align: left; color: #FFFFFF; font-size: 13px; font-weight: 600;">Item</th>' +
    '<th style="padding: 14px 12px; text-align: center; color: #FFFFFF; font-size: 13px; font-weight: 600;">Qty</th>' +
    '<th style="padding: 14px 12px; text-align: right; color: #FFFFFF; font-size: 13px; font-weight: 600;">Price</th>' +
    '</tr>' +
    '</thead>' +
    '<tbody>' +
    generateItemsHtml(order.items) +
    '<!-- Subtotal -->' +
    '<tr>' +
    '<td colspan="2" style="padding: 12px; text-align: right; color: #6B7280; font-size: 14px;">Subtotal:</td>' +
    '<td style="padding: 12px; text-align: right; color: #374151; font-size: 14px; font-weight: 600;">₹' + subtotal + '</td>' +
    '</tr>' +
    '<!-- Shipping -->' +
    '<tr>' +
    '<td colspan="2" style="padding: 12px; text-align: right; color: #6B7280; font-size: 14px;">Shipping:</td>' +
    '<td style="padding: 12px; text-align: right; color: ' + (shipping > 0 ? '#374151' : '#10B981') + '; font-size: 14px; font-weight: 600;">' + shippingDisplay + '</td>' +
    '</tr>' +
    '<!-- Total -->' +
    '<tr style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);">' +
    '<td colspan="2" style="padding: 16px 12px; text-align: right; color: #92400E; font-size: 16px; font-weight: 700;"><span style="margin-right: 5px;">💰</span> Total:</td>' +
    '<td style="padding: 16px 12px; text-align: right; color: #D97706; font-size: 22px; font-weight: 800;">₹' + total + '</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    
    '<!-- Shipping Address -->' +
    (order.shippingAddress ? 
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #FFFFFF; border-radius: 10px; border-left: 4px solid #D97706; box-shadow: 0 2px 8px rgba(217, 119, 6, 0.08); margin-bottom: 20px;">' +
    '<tr><td style="padding: 18px 20px;">' +
    '<h4 style="margin: 0 0 12px 0; color: #D97706; font-size: 14px; font-weight: 700;"><span style="margin-right: 6px;">📍</span> Shipping Address</h4>' +
    '<p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.7;">' + generateAddressHtml(order.shippingAddress) + '</p>' +
    '</td></tr>' +
    '</table>' : '') +
    
    '<!-- What\'s Next Box -->' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 12px; margin-bottom: 25px;">' +
    '<tr><td style="padding: 20px; text-align: center;">' +
    '<p style="margin: 0; color: #92400E; font-size: 15px;"><span style="font-size: 20px; margin-right: 8px;">🚚</span><strong>What\'s Next?</strong></p>' +
    '<p style="margin: 8px 0 0 0; color: #92400E; font-size: 13px; line-height: 1.5;">We\'ll notify you once your order is shipped. You can track your order anytime in your account.</p>' +
    '</td></tr>' +
    '</table>' +
    
    '<!-- CTA Button -->' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
    '<tr><td align="center">' +
    '<a href="' + (process.env.FRONTEND_URL || 'http://localhost:3000') + '/orders" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 15px rgba(217, 119, 6, 0.3);">View Order on Website</a>' +
    '</td></tr>' +
    '</table>' +
    
    '</td>' +
    '</tr>' +
    
    '<!-- Footer -->' +
    '<tr>' +
    '<td style="background: linear-gradient(135deg, #92400E 0%, #78350F 100%); padding: 30px; text-align: center;">' +
    '<p style="margin: 0 0 15px 0; color: #FFFFFF; font-size: 15px; font-weight: 600;">Questions about your order?</p>' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 15px; margin-bottom: 20px;">' +
    '<tr><td style="padding: 12px; text-align: center;">' +
    '<p style="margin: 0 0 8px 0; color: #FDE68A; font-size: 14px;">📧 <a href="mailto:support@sawaikarcashew.com" style="color: #FDE68A; text-decoration: none;">support@sawaikarcashew.com</a></p>' +
    '<p style="margin: 0; color: #FDE68A; font-size: 14px;">📞 +91 98765 43210</p>' +
    '</td></tr>' +
    '</table>' +
    '<p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 13px; line-height: 1.6;">Thank you for choosing Sawaikar\'s Cashew Store!<br>© ' + currentYear + ' Sawaikar\'s Cashew Store. All rights reserved.</p>' +
    '</td>' +
    '</tr>' +
    
    '</table>' +
    '<!-- End Email Container -->' +
    
    '</td></tr>' +
    '</table>' +
    '<!-- End Main Container -->' +
    
    '</body>' +
    '</html>';

  // Determine sender email based on provider
  // Priority: Gmail API > Mailjet > Brevo > Resend > SMTP
  const useGmailAPI = !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN);
  const useMailjetAPI = !!(process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY);
  const useBrevoAPI = !!process.env.BREVO_API_KEY;
  const useResendAPI = !!process.env.RESEND_API_KEY;
  
  const fromEmail = '"Sawaikar\'s Cashew Store" <' + (process.env.EMAIL_USER || 'sawaikarcashewstore1980@gmail.com') + '>';

  const mailOptions = {
    from: fromEmail,
    to: order.userEmail,
    subject: 'Order Confirmed! 🥜 ' + order.orderId + ' | Sawaikar\'s Cashew Store',
    text: plainTextEmail,
    html: htmlEmail
  };

  try {
    // Priority 1: Gmail API (works on Render, uses your Gmail account)
    if (useGmailAPI) {
      console.log('📧 Sending via Gmail API to:', order.userEmail);
      const info = await sendWithGmailAPI(mailOptions);
      console.log('✅ Order confirmation email sent via Gmail API to ' + order.userEmail);
      console.log('   Message ID: ' + info.messageId);
      return { success: true, messageId: info.messageId, provider: 'Gmail API' };
    }
    // Priority 2: Mailjet API (works immediately, any recipient)
    else if (useMailjetAPI) {
      console.log('📧 Sending via Mailjet HTTP API to:', order.userEmail);
      const info = await sendWithMailjetAPI(mailOptions);
      console.log('✅ Order confirmation email sent via Mailjet to ' + order.userEmail);
      console.log('   Message ID: ' + info.messageId);
      return { success: true, messageId: info.messageId, provider: 'Mailjet' };
    }
    // Priority 2: Brevo API (requires account activation)
    else if (useBrevoAPI) {
      console.log('📧 Sending via Brevo HTTP API to:', order.userEmail);
      const info = await sendWithBrevoAPI(mailOptions);
      console.log('✅ Order confirmation email sent via Brevo to ' + order.userEmail);
      console.log('   Message ID: ' + info.messageId);
      return { success: true, messageId: info.messageId, provider: 'Brevo' };
    }
    // Priority 2: Resend API (requires verified domain for real recipients)
    else if (useResendAPI) {
      console.log('📧 Sending via Resend HTTP API...');
      mailOptions.from = '"Sawaikar\'s Cashew Store" <onboarding@resend.dev>';
      const info = await sendWithResendAPI(mailOptions);
      console.log('✅ Order confirmation email sent via Resend to ' + order.userEmail);
      console.log('   Message ID: ' + info.messageId);
      return { success: true, messageId: info.messageId, provider: 'Resend' };
    } 
    // Priority 3: SMTP for local development
    else {
      const transporter = createTransporter();
      if (!transporter) {
        return { success: false, error: 'Email service not configured' };
      }
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Order confirmation email sent via SMTP to ' + order.userEmail);
      console.log('   Message ID: ' + info.messageId);
      return { success: true, messageId: info.messageId };
    }
  } catch (error) {
    console.error('❌ Error sending email: ' + error.message);
    return { success: false, error: error.message };
  }
};

// Send order shipped email
const sendOrderShippedEmail = async (order) => {
  const transporter = createTransporter();
  const userName = order.userName || 'Valued Customer';
  const currentYear = new Date().getFullYear();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  const trackingInfo = order.trackingNumber 
    ? '<p style="margin: 10px 0; color: #059669; font-size: 16px; font-weight: 700;">📦 Tracking Number: ' + order.trackingNumber + '</p>'
    : '';
  
  const estimatedDelivery = order.estimatedDelivery 
    ? '<p style="margin: 5px 0; color: #6B7280;">Estimated Delivery: ' + new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '</p>'
    : '';

  const htmlEmail = '<!DOCTYPE html>' +
    '<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>' +
    '<body style="margin: 0; padding: 0; background-color: #FFF7ED; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif;">' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFF7ED;">' +
    '<tr><td align="center" style="padding: 20px 10px;">' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">' +
    
    '<!-- Header -->' +
    '<tr><td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 35px 30px; text-align: center;">' +
    '<span style="font-size: 50px;">🚚</span>' +
    '<h1 style="margin: 15px 0 5px 0; color: #FFFFFF; font-size: 28px; font-weight: 800;">Your Order is On Its Way!</h1>' +
    '<p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">Sawaikar\'s Premium Cashews</p>' +
    '</td></tr>' +
    
    '<!-- Content -->' +
    '<tr><td style="padding: 35px 30px;">' +
    '<p style="margin: 0 0 8px 0; color: #6B7280; font-size: 15px;">Hi <strong style="color: #059669;">' + userName + '</strong>,</p>' +
    '<h2 style="margin: 0 0 20px 0; color: #1F2937; font-size: 22px;">Great news! Your order has been shipped! 📦</h2>' +
    '<p style="margin: 0 0 25px 0; color: #6B7280; font-size: 15px; line-height: 1.6;">Your premium cashews are on their way to you. Here are the shipping details:</p>' +
    
    '<!-- Order Info Box -->' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); border-radius: 12px; border: 2px solid #059669; margin-bottom: 25px;">' +
    '<tr><td style="padding: 20px;">' +
    '<p style="margin: 0 0 5px 0; color: #047857; font-size: 12px; font-weight: 600; text-transform: uppercase;">Order ID</p>' +
    '<p style="margin: 0 0 15px 0; color: #059669; font-size: 18px; font-weight: 800;">' + order.orderId + '</p>' +
    trackingInfo +
    estimatedDelivery +
    '</td></tr>' +
    '</table>' +
    
    '<!-- What to Expect -->' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #F0FDF4; border-radius: 12px; margin-bottom: 25px;">' +
    '<tr><td style="padding: 20px; text-align: center;">' +
    '<p style="margin: 0; color: #047857; font-size: 15px;"><strong>📍 What to Expect</strong></p>' +
    '<p style="margin: 8px 0 0 0; color: #047857; font-size: 13px; line-height: 1.5;">Your order will be delivered to your doorstep. Please keep your phone handy for delivery updates!</p>' +
    '</td></tr>' +
    '</table>' +
    
    '<!-- CTA Button -->' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
    '<tr><td align="center">' +
    '<a href="' + frontendUrl + '/orders" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);">Track Your Order</a>' +
    '</td></tr>' +
    '</table>' +
    '</td></tr>' +
    
    '<!-- Footer -->' +
    '<tr><td style="background: linear-gradient(135deg, #047857 0%, #065F46 100%); padding: 25px; text-align: center;">' +
    '<p style="margin: 0 0 10px 0; color: #FFFFFF; font-size: 14px;">Questions? Contact us at</p>' +
    '<p style="margin: 0; color: #A7F3D0; font-size: 13px;">📧 support@sawaikarcashew.com | 📞 +91 98765 43210</p>' +
    '<p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.7); font-size: 12px;">© ' + currentYear + ' Sawaikar\'s Cashew Store</p>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';

  const plainTextEmail = 'Hi ' + userName + ',\n\n' +
    'Great news! Your order ' + order.orderId + ' has been shipped! 🚚\n\n' +
    (order.trackingNumber ? 'Tracking Number: ' + order.trackingNumber + '\n' : '') +
    (order.estimatedDelivery ? 'Estimated Delivery: ' + new Date(order.estimatedDelivery).toLocaleDateString('en-IN') + '\n' : '') +
    '\nTrack your order at: ' + frontendUrl + '/orders\n\n' +
    'Thank you for choosing Sawaikar\'s Cashew Store!';

  try {
    await transporter.sendMail({
      from: '"Sawaikar\'s Cashew Store" <' + process.env.EMAIL_USER + '>',
      to: order.userEmail,
      subject: '🚚 Your Order is On Its Way! | ' + order.orderId,
      text: plainTextEmail,
      html: htmlEmail
    });
    console.log('✅ Shipped email sent to ' + order.userEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending shipped email: ' + error.message);
    return { success: false, error: error.message };
  }
};

// Send order delivered email
const sendOrderDeliveredEmail = async (order) => {
  const transporter = createTransporter();
  const userName = order.userName || 'Valued Customer';
  const currentYear = new Date().getFullYear();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const htmlEmail = '<!DOCTYPE html>' +
    '<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>' +
    '<body style="margin: 0; padding: 0; background-color: #FFF7ED; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif;">' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFF7ED;">' +
    '<tr><td align="center" style="padding: 20px 10px;">' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">' +
    
    '<!-- Header -->' +
    '<tr><td style="background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); padding: 35px 30px; text-align: center;">' +
    '<span style="font-size: 50px;">🎉</span>' +
    '<h1 style="margin: 15px 0 5px 0; color: #FFFFFF; font-size: 28px; font-weight: 800;">Your Order Has Arrived!</h1>' +
    '<p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">Sawaikar\'s Premium Cashews</p>' +
    '</td></tr>' +
    
    '<!-- Content -->' +
    '<tr><td style="padding: 35px 30px;">' +
    '<p style="margin: 0 0 8px 0; color: #6B7280; font-size: 15px;">Hi <strong style="color: #7C3AED;">' + userName + '</strong>,</p>' +
    '<h2 style="margin: 0 0 20px 0; color: #1F2937; font-size: 22px;">Your order has been delivered! 🥜</h2>' +
    '<p style="margin: 0 0 25px 0; color: #6B7280; font-size: 15px; line-height: 1.6;">We hope you enjoy your premium cashews! Your satisfaction means the world to us.</p>' +
    
    '<!-- Order Info Box -->' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%); border-radius: 12px; border: 2px solid #7C3AED; margin-bottom: 25px;">' +
    '<tr><td style="padding: 20px; text-align: center;">' +
    '<p style="margin: 0 0 5px 0; color: #6D28D9; font-size: 12px; font-weight: 600; text-transform: uppercase;">Order ID</p>' +
    '<p style="margin: 0; color: #7C3AED; font-size: 18px; font-weight: 800;">' + order.orderId + '</p>' +
    '<p style="margin: 15px 0 0 0; color: #059669; font-size: 16px; font-weight: 700;">✅ Delivered Successfully</p>' +
    '</td></tr>' +
    '</table>' +
    
    '<!-- Review Request -->' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #FEF3C7; border-radius: 12px; margin-bottom: 25px;">' +
    '<tr><td style="padding: 20px; text-align: center;">' +
    '<p style="margin: 0; color: #92400E; font-size: 15px;"><span style="font-size: 20px; margin-right: 8px;">⭐</span><strong>How was your experience?</strong></p>' +
    '<p style="margin: 8px 0 0 0; color: #92400E; font-size: 13px; line-height: 1.5;">Your feedback helps us serve you better! Leave a review on the products you purchased.</p>' +
    '</td></tr>' +
    '</table>' +
    
    '<!-- CTA Buttons -->' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
    '<tr><td align="center" style="padding-bottom: 10px;">' +
    '<a href="' + frontendUrl + '/orders" style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); color: #FFFFFF; text-decoration: none; padding: 14px 35px; border-radius: 10px; font-size: 14px; font-weight: 700; margin: 5px;">View Order Details</a>' +
    '<a href="' + frontendUrl + '/products" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #FFFFFF; text-decoration: none; padding: 14px 35px; border-radius: 10px; font-size: 14px; font-weight: 700; margin: 5px;">Shop Again</a>' +
    '</td></tr>' +
    '</table>' +
    '</td></tr>' +
    
    '<!-- Footer -->' +
    '<tr><td style="background: linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%); padding: 25px; text-align: center;">' +
    '<p style="margin: 0 0 10px 0; color: #FFFFFF; font-size: 14px;">Thank you for choosing us! 💜</p>' +
    '<p style="margin: 0; color: #DDD6FE; font-size: 13px;">📧 support@sawaikarcashew.com | 📞 +91 98765 43210</p>' +
    '<p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.7); font-size: 12px;">© ' + currentYear + ' Sawaikar\'s Cashew Store</p>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';

  const plainTextEmail = 'Hi ' + userName + ',\n\n' +
    'Your order ' + order.orderId + ' has been delivered! 🎉\n\n' +
    'We hope you enjoy your premium cashews!\n\n' +
    'Please leave a review to help us improve: ' + frontendUrl + '/orders\n\n' +
    'Thank you for choosing Sawaikar\'s Cashew Store!';

  try {
    await transporter.sendMail({
      from: '"Sawaikar\'s Cashew Store" <' + process.env.EMAIL_USER + '>',
      to: order.userEmail,
      subject: '🎉 Your Order Has Been Delivered! | ' + order.orderId,
      text: plainTextEmail,
      html: htmlEmail
    });
    console.log('✅ Delivered email sent to ' + order.userEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending delivered email: ' + error.message);
    return { success: false, error: error.message };
  }
};

// Send low stock alert email (to admin)
const sendLowStockAlertEmail = async (products) => {
  const transporter = createTransporter();
  const currentYear = new Date().getFullYear();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  
  const productRows = products.map(p => 
    '<tr><td style="padding: 12px; border-bottom: 1px solid #FEE2E2;">' + p.name + '</td>' +
    '<td style="padding: 12px; border-bottom: 1px solid #FEE2E2; text-align: center; color: ' + (p.stock <= 5 ? '#DC2626' : '#F59E0B') + '; font-weight: 700;">' + p.stock + '</td></tr>'
  ).join('');

  const htmlEmail = '<!DOCTYPE html>' +
    '<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>' +
    '<body style="margin: 0; padding: 0; background-color: #FEF2F2; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif;">' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FEF2F2;">' +
    '<tr><td align="center" style="padding: 20px 10px;">' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">' +
    
    '<!-- Header -->' +
    '<tr><td style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); padding: 30px; text-align: center;">' +
    '<span style="font-size: 40px;">⚠️</span>' +
    '<h1 style="margin: 10px 0 0 0; color: #FFFFFF; font-size: 24px; font-weight: 800;">Low Stock Alert!</h1>' +
    '</td></tr>' +
    
    '<!-- Content -->' +
    '<tr><td style="padding: 30px;">' +
    '<p style="margin: 0 0 20px 0; color: #6B7280; font-size: 15px;">The following products are running low on stock and need restocking:</p>' +
    
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #FEE2E2;">' +
    '<tr style="background: #DC2626;"><th style="padding: 12px; text-align: left; color: white;">Product</th><th style="padding: 12px; text-align: center; color: white;">Stock</th></tr>' +
    productRows +
    '</table>' +
    
    '<p style="margin: 20px 0 0 0; color: #DC2626; font-size: 14px; font-weight: 600;">⚡ Please restock these items soon to avoid stockouts!</p>' +
    '</td></tr>' +
    
    '<!-- Footer -->' +
    '<tr><td style="background: #FEE2E2; padding: 20px; text-align: center;">' +
    '<p style="margin: 0; color: #991B1B; font-size: 12px;">© ' + currentYear + ' Sawaikar\'s Cashew Store - Admin Alert</p>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';

  try {
    await transporter.sendMail({
      from: '"Sawaikar\'s Inventory Alert" <' + process.env.EMAIL_USER + '>',
      to: adminEmail,
      subject: '⚠️ Low Stock Alert - ' + products.length + ' Products Need Restocking',
      html: htmlEmail
    });
    console.log('✅ Low stock alert sent to admin');
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending low stock alert: ' + error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { 
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendLowStockAlertEmail
};
