// Global Jest setup - runs once before all tests
// Ensures consistent timezone across the entire test suite

module.exports = async () => {
	// Force UTC timezone for all date operations
	process.env.TZ = "UTC";
};
