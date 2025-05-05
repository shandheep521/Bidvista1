import nodemailer from 'nodemailer';

// Configure nodemailer transporter
let transporter;

if (process.env.NODE_ENV === 'production') {
  // Use SendGrid or actual SMTP service in production
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'SendGrid',
    auth: {
      user: process.env.EMAIL_USER || process.env.SENDGRID_USER,
      pass: process.env.EMAIL_PASSWORD || process.env.SENDGRID_API_KEY
    }
  });
} else {
  // Use ethereal.email for development testing
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_EMAIL || 'testuser@ethereal.email',
      pass: process.env.ETHEREAL_PASSWORD || 'testpassword'
    }
  });
}

// Email templates
const emailTemplates = {
  welcome: (username) => ({
    subject: 'Welcome to BidVista - Your Journey Begins!',
    text: `Hello ${username},\n\nWelcome to BidVista! We're excited to have you join our auction platform.\n\nWith BidVista, you can:\n- Discover unique items and great deals\n- Place bids on items you love\n- Sell your own items and reach potential buyers\n\nIf you have any questions, our support team is here to help.\n\nHappy bidding!\nThe BidVista Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #31363F;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #C08A66;">Welcome to BidVista!</h1>
        </div>
        <p>Hello <strong>${username}</strong>,</p>
        <p>We're excited to have you join our auction platform!</p>
        <p>With BidVista, you can:</p>
        <ul>
          <li>Discover unique items and great deals</li>
          <li>Place bids on items you love</li>
          <li>Sell your own items and reach potential buyers</li>
        </ul>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.SITE_URL || 'https://bidvista.com'}/auctions" style="background-color: #C08A66; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Browse Auctions</a>
        </div>
        <p>If you have any questions, our support team is here to help.</p>
        <p>Happy bidding!<br>The BidVista Team</p>
      </div>
    `
  }),
  
  outbid: (username, itemTitle, currentBid) => ({
    subject: `You've been outbid on ${itemTitle}`,
    text: `Hello ${username},\n\nSomeone has placed a higher bid on "${itemTitle}".\nThe current bid is now $${currentBid}.\n\nDon't miss out! Place a new bid to stay in the running.\n\nBest regards,\nThe BidVista Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #31363F;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #C08A66;">You've Been Outbid!</h1>
        </div>
        <p>Hello <strong>${username}</strong>,</p>
        <p>Someone has placed a higher bid on "<strong>${itemTitle}</strong>".</p>
        <p>The current bid is now <strong>$${currentBid}</strong>.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.SITE_URL || 'https://bidvista.com'}/auctions/item-id" style="background-color: #C08A66; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Place New Bid</a>
        </div>
        <p>Don't miss out! Place a new bid to stay in the running.</p>
        <p>Best regards,<br>The BidVista Team</p>
      </div>
    `
  }),
  
  auctionWon: (username, itemTitle, finalBid) => ({
    subject: `Congratulations! You've won "${itemTitle}"`,
    text: `Hello ${username},\n\nCongratulations! You've won the auction for "${itemTitle}" with a final bid of $${finalBid}.\n\nPlease complete your payment to finalize the purchase.\n\nThank you for using BidVista!\nThe BidVista Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #31363F;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #C08A66;">Congratulations!</h1>
          <p style="font-size: 18px;">You've won the auction!</p>
        </div>
        <p>Hello <strong>${username}</strong>,</p>
        <p>You've won the auction for "<strong>${itemTitle}</strong>" with a final bid of <strong>$${finalBid}</strong>.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.SITE_URL || 'https://bidvista.com'}/payment" style="background-color: #C08A66; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Payment</a>
        </div>
        <p>Please complete your payment to finalize the purchase.</p>
        <p>Thank you for using BidVista!<br>The BidVista Team</p>
      </div>
    `
  }),
  
  auctionEnded: (username, itemTitle, hasBids, finalBid, buyerName) => ({
    subject: `Your auction for "${itemTitle}" has ended`,
    text: hasBids 
      ? `Hello ${username},\n\nYour auction for "${itemTitle}" has ended with a final bid of $${finalBid}.\n\nThe winning bidder is ${buyerName}. We have notified them to complete the payment.\n\nThank you for using BidVista!\nThe BidVista Team`
      : `Hello ${username},\n\nYour auction for "${itemTitle}" has ended without any bids.\n\nYou can relist the item or modify your listing to attract more bidders.\n\nThank you for using BidVista!\nThe BidVista Team`,
    html: hasBids 
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #31363F;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #C08A66;">Auction Ended</h1>
          </div>
          <p>Hello <strong>${username}</strong>,</p>
          <p>Your auction for "<strong>${itemTitle}</strong>" has ended with a final bid of <strong>$${finalBid}</strong>.</p>
          <p>The winning bidder is <strong>${buyerName}</strong>. We have notified them to complete the payment.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.SITE_URL || 'https://bidvista.com'}/seller-dashboard" style="background-color: #C08A66; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Seller Dashboard</a>
          </div>
          <p>Thank you for using BidVista!<br>The BidVista Team</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #31363F;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #C08A66;">Auction Ended</h1>
          </div>
          <p>Hello <strong>${username}</strong>,</p>
          <p>Your auction for "<strong>${itemTitle}</strong>" has ended without any bids.</p>
          <p>You can relist the item or modify your listing to attract more bidders.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.SITE_URL || 'https://bidvista.com'}/seller-dashboard" style="background-color: #C08A66; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Relist Item</a>
          </div>
          <p>Thank you for using BidVista!<br>The BidVista Team</p>
        </div>
      `
  }),
  
  passwordReset: (username, resetToken) => ({
    subject: 'Reset Your BidVista Password',
    text: `Hello ${username},\n\nWe received a request to reset your password. If you didn't make this request, you can ignore this email.\n\nTo reset your password, click the link below (valid for 1 hour):\n${process.env.SITE_URL || 'https://bidvista.com'}/reset-password?token=${resetToken}\n\nBest regards,\nThe BidVista Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #31363F;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #C08A66;">Reset Your Password</h1>
        </div>
        <p>Hello <strong>${username}</strong>,</p>
        <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.SITE_URL || 'https://bidvista.com'}/reset-password?token=${resetToken}" style="background-color: #C08A66; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          <p style="font-size: 12px; margin-top: 10px;">This link is valid for 1 hour.</p>
        </div>
        <p>Best regards,<br>The BidVista Team</p>
      </div>
    `
  })
};

// Email sending functions
export async function sendWelcomeEmail(email, username) {
  const template = emailTemplates.welcome(username);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@bidvista.com',
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

export async function sendOutbidEmail(email, username, itemTitle, currentBid, auctionId) {
  const template = emailTemplates.outbid(username, itemTitle, currentBid);
  
  // Replace placeholder with actual auction URL
  template.html = template.html.replace('/auctions/item-id', `/auctions/${auctionId}`);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@bidvista.com',
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Outbid email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending outbid email:', error);
    throw error;
  }
}

export async function sendAuctionWonEmail(email, username, itemTitle, finalBid, auctionId) {
  const template = emailTemplates.auctionWon(username, itemTitle, finalBid);
  
  // Replace placeholder with actual payment URL
  template.html = template.html.replace('/payment', `/payment/${auctionId}`);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@bidvista.com',
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Auction won email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending auction won email:', error);
    throw error;
  }
}

export async function sendAuctionEndedEmail(email, username, itemTitle, hasBids, finalBid, buyerName) {
  const template = emailTemplates.auctionEnded(username, itemTitle, hasBids, finalBid, buyerName);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@bidvista.com',
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Auction ended email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending auction ended email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email, username, resetToken) {
  const template = emailTemplates.passwordReset(username, resetToken);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@bidvista.com',
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}
