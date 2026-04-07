const toNumber = (value, fallback) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

const AUTH_CONSTANTS = {
	OTP_LENGTH: toNumber(process.env.OTP_LENGTH, 6),
	OTP_EXPIRY_SECONDS: toNumber(process.env.OTP_EXPIRY_SECONDS, 600),
	OTP_MAX_ATTEMPTS: toNumber(process.env.OTP_MAX_ATTEMPTS, 5),
	BCRYPT_SALT_ROUNDS: toNumber(process.env.BCRYPT_SALT_ROUNDS, 10),
};

const APP_CONSTANTS = {
	JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
	CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

module.exports = {
	AUTH_CONSTANTS,
	APP_CONSTANTS,
};
