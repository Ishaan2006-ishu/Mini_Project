const Company = require('../models/Company');

const DEFAULT_COMPANIES = [
  {
    name: 'Google',
    slug: 'google',
    logo: '🔵',
    color: 'from-blue-50 to-indigo-50',
    border: 'border-blue-100',
    sortOrder: 1,
    roles: [
      { title: 'Software Engineer (SDE-1)', level: 'Entry', questions: 8, sortOrder: 1 },
      { title: 'Software Engineer (SDE-2)', level: 'Mid', questions: 10, sortOrder: 2 },
      { title: 'Senior Software Engineer', level: 'Senior', questions: 10, sortOrder: 3 },
      { title: 'Product Manager', level: 'Mid', questions: 8, sortOrder: 4 },
    ],
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    logo: '🟠',
    color: 'from-orange-50 to-amber-50',
    border: 'border-orange-100',
    sortOrder: 2,
    roles: [
      { title: 'SDE-1', level: 'Entry', questions: 8, sortOrder: 1 },
      { title: 'SDE-2', level: 'Mid', questions: 10, sortOrder: 2 },
      { title: 'SDE-3', level: 'Senior', questions: 10, sortOrder: 3 },
      { title: 'Data Engineer', level: 'Mid', questions: 8, sortOrder: 4 },
    ],
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    logo: '🟦',
    color: 'from-sky-50 to-blue-50',
    border: 'border-sky-100',
    sortOrder: 3,
    roles: [
      { title: 'Software Engineer', level: 'Entry', questions: 8, sortOrder: 1 },
      { title: 'Senior SDE', level: 'Senior', questions: 10, sortOrder: 2 },
      { title: 'Cloud Architect', level: 'Senior', questions: 10, sortOrder: 3 },
    ],
  },
  {
    name: 'Meta',
    slug: 'meta',
    logo: '🔷',
    color: 'from-indigo-50 to-purple-50',
    border: 'border-indigo-100',
    sortOrder: 4,
    roles: [
      { title: 'Software Engineer E3', level: 'Entry', questions: 8, sortOrder: 1 },
      { title: 'Software Engineer E4', level: 'Mid', questions: 10, sortOrder: 2 },
      { title: 'Staff Engineer', level: 'Senior', questions: 10, sortOrder: 3 },
    ],
  },
  {
    name: 'Apple',
    slug: 'apple',
    logo: '⬛',
    color: 'from-gray-50 to-slate-50',
    border: 'border-gray-200',
    sortOrder: 5,
    roles: [
      { title: 'iOS Developer', level: 'Mid', questions: 8, sortOrder: 1 },
      { title: 'macOS Engineer', level: 'Senior', questions: 10, sortOrder: 2 },
      { title: 'ML Engineer', level: 'Mid', questions: 8, sortOrder: 3 },
    ],
  },
  {
    name: 'Netflix',
    slug: 'netflix',
    logo: '🔴',
    color: 'from-red-50 to-rose-50',
    border: 'border-red-100',
    sortOrder: 6,
    roles: [
      { title: 'Senior Software Engineer', level: 'Senior', questions: 10, sortOrder: 1 },
      { title: 'Backend Engineer', level: 'Mid', questions: 8, sortOrder: 2 },
      { title: 'Data Scientist', level: 'Mid', questions: 8, sortOrder: 3 },
    ],
  },
  {
    name: 'Flipkart',
    slug: 'flipkart',
    logo: '🟡',
    color: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-100',
    sortOrder: 7,
    roles: [
      { title: 'SDE-1', level: 'Entry', questions: 8, sortOrder: 1 },
      { title: 'SDE-2', level: 'Mid', questions: 10, sortOrder: 2 },
      { title: 'Product Manager', level: 'Mid', questions: 8, sortOrder: 3 },
    ],
  },
  {
    name: 'Infosys',
    slug: 'infosys',
    logo: '🟢',
    color: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-100',
    sortOrder: 8,
    roles: [
      { title: 'Systems Engineer', level: 'Entry', questions: 6, sortOrder: 1 },
      { title: 'Senior Systems Engineer', level: 'Mid', questions: 8, sortOrder: 2 },
      { title: 'Technology Analyst', level: 'Mid', questions: 8, sortOrder: 3 },
    ],
  },
  {
    name: 'TCS',
    slug: 'tcs',
    logo: '🔵',
    color: 'from-blue-50 to-cyan-50',
    border: 'border-blue-100',
    sortOrder: 9,
    roles: [
      { title: 'Assistant System Engineer', level: 'Entry', questions: 6, sortOrder: 1 },
      { title: 'IT Analyst', level: 'Mid', questions: 8, sortOrder: 2 },
      { title: 'Technical Lead', level: 'Senior', questions: 10, sortOrder: 3 },
    ],
  },
];

const bootstrapCompaniesIfEmpty = async () => {
  const count = await Company.estimatedDocumentCount();
  if (count > 0) return;
  await Company.insertMany(DEFAULT_COMPANIES);
};

// GET /api/companies
exports.getCompanies = async (req, res, next) => {
  try {
    await bootstrapCompaniesIfEmpty();

    const docs = await Company.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('name slug logo color border roles sortOrder');

    const companies = docs.map((company) => {
      const activeRoles = (company.roles || [])
        .filter((role) => role.isActive !== false)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      return {
        id: company._id,
        name: company.name,
        slug: company.slug,
        logo: company.logo,
        color: company.color,
        border: company.border,
        roles: activeRoles.map((role) => ({
          title: role.title,
          level: role.level,
          questions: role.questions,
        })),
      };
    });

    res.status(200).json({ success: true, companies });
  } catch (err) {
    next(err);
  }
};
