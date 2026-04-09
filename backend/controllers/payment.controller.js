const crypto = require('crypto');
const Razorpay = require('razorpay');
const Plan = require('../models/Plan');
const User = require('../models/User');

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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification fields',
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay secret key is missing',
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const plan = await Plan.findOne({ planId, isActive: true }).select('planId name price period');
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isPremium: true },
      { new: true }
    ).select('name email isPremium');

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        planId: plan.planId,
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
