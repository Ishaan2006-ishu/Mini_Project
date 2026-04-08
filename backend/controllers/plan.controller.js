const Plan = require('../models/Plan');

const DEFAULT_PLANS = [
  {
    planId: 'basic',
    name: 'Basic',
    price: '₹299',
    period: '/month',
    badge: null,
    features: [
      '5 scheduled interviews/month',
      'Company-specific questions',
      'AI feedback report',
      'Email reminders',
    ],
    cta: 'Get Basic',
    highlight: false,
    sortOrder: 1,
  },
  {
    planId: 'pro',
    name: 'Pro',
    price: '₹599',
    period: '/month',
    badge: 'Most Popular',
    features: [
      'Unlimited scheduled interviews',
      'Company-specific questions',
      'Detailed AI feedback report',
      'Email & SMS reminders',
      'Resume-based questions',
      'Priority support',
    ],
    cta: 'Get Pro',
    highlight: true,
    sortOrder: 2,
  },
  {
    planId: 'yearly',
    name: 'Pro Yearly',
    price: '₹4,999',
    period: '/year',
    badge: 'Best Value',
    features: [
      'Everything in Pro',
      '2 months free',
      'Exclusive company guides',
      'Mock panel interviews',
      'Career coaching session',
    ],
    cta: 'Get Yearly',
    highlight: false,
    sortOrder: 3,
  },
];

const bootstrapPlansIfEmpty = async () => {
  const count = await Plan.estimatedDocumentCount();
  if (count > 0) return;
  await Plan.insertMany(DEFAULT_PLANS);
};

// GET /api/plans
exports.getPlans = async (req, res, next) => {
  try {
    await bootstrapPlansIfEmpty();

    const plans = await Plan.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .select('planId name price period badge features cta highlight');

    res.status(200).json({
      success: true,
      plans,
    });
  } catch (err) {
    next(err);
  }
};
