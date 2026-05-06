const crypto = require('crypto');
const Razorpay = require('razorpay');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    const err = new Error('Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env.');
    err.status = 400;
    throw err;
  }

  return new Razorpay({ key_id, key_secret });
};

const parseAmountInRupees = (price = '') => {
  const digits = String(price).replace(/[^0-9.]/g, '');
  const amount = Number(digits);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.round(amount * 100);
};

// POST /api/payments/create-order
exports.createOrder = async (req, res, next) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, message: 'planId is required' });
    }

    const plan = await Plan.findOne({ planId, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const amount = parseAmountInRupees(plan.price);
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Invalid plan amount' });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `plan_${plan.planId}_${Date.now()}`,
      notes: {
        planId: plan.planId,
        planName: plan.name,
        userId: String(req.user.id),
      },
    });

    // Create transaction record with pending status
    const transaction = await Transaction.create({
      user: req.user.id,
      planId: plan.planId,
      planName: plan.name,
      planPrice: plan.price,
      planPeriod: plan.period,
      razorpayOrderId: order.id,
      amount,
      currency: 'INR',
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: {
        planId: plan.planId,
        name: plan.name,
        price: plan.price,
        period: plan.period,
      },
      order,
      transactionId: transaction._id,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = req.body;

    console.log('🔍 Verifying payment:', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature?.substring(0, 10) + '...',
      planId,
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification fields',
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('❌ Razorpay secret key missing');
      return res.status(400).json({
        success: false,
        message: 'Razorpay secret key is missing',
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    console.log('🔐 Signature comparison:', {
      expected: expectedSignature.substring(0, 10) + '...',
      received: razorpay_signature.substring(0, 10) + '...',
      match: expectedSignature === razorpay_signature
    });

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Invalid signature');
      // Update transaction as failed
      await Transaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { 
          status: 'failed',
          errorMessage: 'Invalid payment signature'
        }
      );
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const plan = await Plan.findOne({ planId, isActive: true }).select('planId name price period');
    if (!plan) {
      console.error('❌ Plan not found');
      // Update transaction as failed
      await Transaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { 
          status: 'failed',
          errorMessage: 'Plan not found'
        }
      );
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    console.log('✅ Plan found:', plan.planId);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isPremium: true },
      { new: true }
    ).select('name email isPremium');

    console.log('✅ User updated to premium');

    // Update transaction as success
    const transaction = await Transaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'success',
      },
      { new: true }
    );

    console.log('✅ Transaction updated:', transaction?._id);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        planId: plan.planId,
        transactionId: transaction?._id,
      },
      plan,
      user: {
        name: user?.name,
        email: user?.email,
        isPremium: Boolean(user?.isPremium),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/transaction-history
exports.getTransactionHistory = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/cancel-transaction/:transactionId
exports.cancelTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending transactions can be cancelled',
      });
    }

    transaction.status = 'cancelled';
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction cancelled successfully',
      transaction,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/debug - Test endpoint to verify setup
exports.debugPaymentSetup = async (req, res, next) => {
  try {
    const checks = {
      razorpayKeyId: !!process.env.RAZORPAY_KEY_ID,
      razorpayKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
      mongoConnection: !!req.user,
      transactionsCount: await Transaction.countDocuments({ user: req.user.id }),
      latestTransaction: await Transaction.findOne({ user: req.user.id }).sort('-createdAt'),
    };

    res.status(200).json({
      success: true,
      message: 'Debug info',
      checks,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
