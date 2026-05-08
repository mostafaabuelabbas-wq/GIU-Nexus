// In-memory set of invalidated JWT IDs (jti claims).
// When a user logs out, their token's jti is added here.
// The protect middleware checks this set before allowing access.
//
// NOTE: This resets on server restart. For production, use Redis instead.

const blacklistedTokens = new Set();

module.exports = blacklistedTokens;
