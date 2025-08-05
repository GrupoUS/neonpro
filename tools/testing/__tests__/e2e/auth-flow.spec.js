"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var test_1 = require("@playwright/test");
test_1.test.describe('Authentication Flow', function () {
    test_1.test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Navigate to the login page
                return [4 /*yield*/, page.goto('/login')];
                case 1:
                    // Navigate to the login page
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should display login page correctly', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Check if login page elements are present
                return [4 /*yield*/, (0, test_1.expect)(page.locator('h1')).toContainText('Login')];
                case 1:
                    // Check if login page elements are present
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('input[type="email"]')).toBeVisible()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('input[type="password"]')).toBeVisible()];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('button[type="submit"]')).toBeVisible()
                        // Check Google login button
                    ];
                case 4:
                    _c.sent();
                    // Check Google login button
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('text=Entrar com Google')).toBeVisible()];
                case 5:
                    // Check Google login button
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should show validation errors for invalid inputs', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Try to submit empty form
                return [4 /*yield*/, page.click('button[type="submit"]')
                    // Check for validation errors
                ];
                case 1:
                    // Try to submit empty form
                    _c.sent();
                    // Check for validation errors
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('text=Email is required')).toBeVisible()];
                case 2:
                    // Check for validation errors
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('text=Password is required')).toBeVisible()
                        // Test invalid email format
                    ];
                case 3:
                    _c.sent();
                    // Test invalid email format
                    return [4 /*yield*/, page.fill('input[type="email"]', 'invalid-email')];
                case 4:
                    // Test invalid email format
                    _c.sent();
                    return [4 /*yield*/, page.click('button[type="submit"]')];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('text=Invalid email format')).toBeVisible()];
                case 6:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should handle login with invalid credentials', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Fill form with invalid credentials
                return [4 /*yield*/, page.fill('input[type="email"]', 'test@example.com')];
                case 1:
                    // Fill form with invalid credentials
                    _c.sent();
                    return [4 /*yield*/, page.fill('input[type="password"]', 'wrongpassword')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.click('button[type="submit"]')
                        // Should show error message
                    ];
                case 3:
                    _c.sent();
                    // Should show error message
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('text=Invalid credentials')).toBeVisible()
                        // Should remain on login page
                    ];
                case 4:
                    // Should show error message
                    _c.sent();
                    // Should remain on login page
                    return [4 /*yield*/, (0, test_1.expect)(page.url()).toContain('/login')];
                case 5:
                    // Should remain on login page
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should redirect to dashboard after successful login', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Mock successful login (in real test, you'd use test credentials)
                // For demo purposes, we'll simulate the successful flow
                return [4 /*yield*/, page.fill('input[type="email"]', 'demo@neonpro.com')];
                case 1:
                    // Mock successful login (in real test, you'd use test credentials)
                    // For demo purposes, we'll simulate the successful flow
                    _c.sent();
                    return [4 /*yield*/, page.fill('input[type="password"]', 'demopassword')
                        // Click login button
                    ];
                case 2:
                    _c.sent();
                    // Click login button
                    return [4 /*yield*/, page.click('button[type="submit"]')
                        // Should redirect to dashboard (adjust URL based on your routing)
                    ];
                case 3:
                    // Click login button
                    _c.sent();
                    // Should redirect to dashboard (adjust URL based on your routing)
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/dashboard/)
                        // Should see dashboard elements
                    ];
                case 4:
                    // Should redirect to dashboard (adjust URL based on your routing)
                    _c.sent();
                    // Should see dashboard elements
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('text=Dashboard')).toBeVisible()];
                case 5:
                    // Should see dashboard elements
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should navigate to signup page', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Click signup link
                return [4 /*yield*/, page.click('text=Create account')
                    // Should navigate to signup page
                ];
                case 1:
                    // Click signup link
                    _c.sent();
                    // Should navigate to signup page
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/signup/)];
                case 2:
                    // Should navigate to signup page
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('h1')).toContainText('Sign Up')];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Google OAuth Flow', function () {
    (0, test_1.test)('should open Google OAuth popup', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var popup;
        var page = _b.page, context = _b.context;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto('/login')
                    // Mock popup behavior (real test would handle actual OAuth)
                ];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, Promise.all([
                            context.waitForEvent('page'),
                            page.click('text=Entrar com Google')
                        ])
                        // Verify popup opened with correct URL
                    ];
                case 2:
                    popup = (_c.sent())[0];
                    // Verify popup opened with correct URL
                    (0, test_1.expect)(popup.url()).toContain('accounts.google.com');
                    return [4 /*yield*/, popup.close()];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Sign Up Flow', function () {
    test_1.test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto('/signup')];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should display signup form correctly', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, test_1.expect)(page.locator('h1')).toContainText('Sign Up')];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('input[name="name"]')).toBeVisible()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('input[type="email"]')).toBeVisible()];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('input[type="password"]')).toBeVisible()];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('button[type="submit"]')).toBeVisible()];
                case 5:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should validate password requirements', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.fill('input[name="name"]', 'Test User')];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, page.fill('input[type="email"]', 'test@example.com')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.fill('input[type="password"]', '123')]; // Weak password
                case 3:
                    _c.sent(); // Weak password
                    return [4 /*yield*/, page.click('button[type="submit"]')
                        // Should show password validation error
                    ];
                case 4:
                    _c.sent();
                    // Should show password validation error
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('text=Password must be at least 8 characters')).toBeVisible()];
                case 5:
                    // Should show password validation error
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should handle successful signup', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.fill('input[name="name"]', 'Test User')];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, page.fill('input[type="email"]', 'newuser@example.com')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.fill('input[type="password"]', 'securepassword123')];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, page.click('button[type="submit"]')
                        // Should show success message or redirect
                    ];
                case 4:
                    _c.sent();
                    // Should show success message or redirect
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('text=Account created successfully')).toBeVisible()];
                case 5:
                    // Should show success message or redirect
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Authentication State Persistence', function () {
    (0, test_1.test)('should maintain login state across page refreshes', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Login first
                return [4 /*yield*/, page.goto('/login')];
                case 1:
                    // Login first
                    _c.sent();
                    return [4 /*yield*/, page.fill('input[type="email"]', 'demo@neonpro.com')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.fill('input[type="password"]', 'demopassword')];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, page.click('button[type="submit"]')];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/dashboard/)
                        // Refresh page
                    ];
                case 5:
                    _c.sent();
                    // Refresh page
                    return [4 /*yield*/, page.reload()
                        // Should still be logged in
                    ];
                case 6:
                    // Refresh page
                    _c.sent();
                    // Should still be logged in
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/dashboard/)];
                case 7:
                    // Should still be logged in
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('text=Dashboard')).toBeVisible()];
                case 8:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should redirect to login when accessing protected route', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Try to access dashboard without being logged in
                return [4 /*yield*/, page.goto('/dashboard')
                    // Should redirect to login
                ];
                case 1:
                    // Try to access dashboard without being logged in
                    _c.sent();
                    // Should redirect to login
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/login/)];
                case 2:
                    // Should redirect to login
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Logout Flow', function () {
    test_1.test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Login first
                return [4 /*yield*/, page.goto('/login')];
                case 1:
                    // Login first
                    _c.sent();
                    return [4 /*yield*/, page.fill('input[type="email"]', 'demo@neonpro.com')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.fill('input[type="password"]', 'demopassword')];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, page.click('button[type="submit"]')];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/dashboard/)];
                case 5:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should logout successfully', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Click logout button (adjust selector based on your UI)
                return [4 /*yield*/, page.click('[data-testid="logout-button"]')
                    // Should redirect to login page
                ];
                case 1:
                    // Click logout button (adjust selector based on your UI)
                    _c.sent();
                    // Should redirect to login page
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/login/)
                        // Try to access dashboard again
                    ];
                case 2:
                    // Should redirect to login page
                    _c.sent();
                    // Try to access dashboard again
                    return [4 /*yield*/, page.goto('/dashboard')
                        // Should redirect back to login
                    ];
                case 3:
                    // Try to access dashboard again
                    _c.sent();
                    // Should redirect back to login
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/login/)];
                case 4:
                    // Should redirect back to login
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Error Boundaries', function () {
    (0, test_1.test)('should display error boundary when authentication fails critically', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Simulate a critical auth error (you might need to mock this)
                return [4 /*yield*/, page.goto('/login')
                    // Inject script to simulate error
                ];
                case 1:
                    // Simulate a critical auth error (you might need to mock this)
                    _c.sent();
                    // Inject script to simulate error
                    return [4 /*yield*/, page.evaluate(function () {
                            // Simulate critical error in auth context
                            window.dispatchEvent(new Event('auth-critical-error'));
                        })
                        // Should show error boundary
                    ];
                case 2:
                    // Inject script to simulate error
                    _c.sent();
                    // Should show error boundary
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('text=Oops! Algo deu errado')).toBeVisible()];
                case 3:
                    // Should show error boundary
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('button:has-text("Tentar novamente")')).toBeVisible()];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should recover from error boundary', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto('/login')
                    // Trigger error
                ];
                case 1:
                    _c.sent();
                    // Trigger error
                    return [4 /*yield*/, page.evaluate(function () {
                            window.dispatchEvent(new Event('auth-critical-error'));
                        })];
                case 2:
                    // Trigger error
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('text=Oops! Algo deu errado')).toBeVisible()
                        // Click retry button
                    ];
                case 3:
                    _c.sent();
                    // Click retry button
                    return [4 /*yield*/, page.click('button:has-text("Tentar novamente")')
                        // Should recover and show login form again
                    ];
                case 4:
                    // Click retry button
                    _c.sent();
                    // Should recover and show login form again
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('input[type="email"]')).toBeVisible()];
                case 5:
                    // Should recover and show login form again
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Accessibility', function () {
    (0, test_1.test)('should be keyboard navigable', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto('/login')
                    // Tab through form elements
                ];
                case 1:
                    _c.sent();
                    // Tab through form elements
                    return [4 /*yield*/, page.keyboard.press('Tab')];
                case 2:
                    // Tab through form elements
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('input[type="email"]')).toBeFocused()];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, page.keyboard.press('Tab')];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('input[type="password"]')).toBeFocused()];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, page.keyboard.press('Tab')];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('button[type="submit"]')).toBeFocused()];
                case 7:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should have proper ARIA labels', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto('/login')
                    // Check for proper ARIA labels
                ];
                case 1:
                    _c.sent();
                    // Check for proper ARIA labels
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('input[type="email"]')).toHaveAttribute('aria-label', /email/i)];
                case 2:
                    // Check for proper ARIA labels
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('input[type="password"]')).toHaveAttribute('aria-label', /password/i)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator('button[type="submit"]')).toHaveAttribute('aria-label', /login|sign in/i)];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Performance', function () {
    (0, test_1.test)('should load login page within performance budget', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var startTime, loadTime;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    startTime = Date.now();
                    return [4 /*yield*/, page.goto('/login')];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, page.waitForLoadState('networkidle')];
                case 2:
                    _c.sent();
                    loadTime = Date.now() - startTime;
                    // Should load within 3 seconds (adjust based on your requirements)
                    (0, test_1.expect)(loadTime).toBeLessThan(3000);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should have good Core Web Vitals', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var lcp;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto('/login')
                    // Measure Largest Contentful Paint (LCP)
                ];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, page.evaluate(function () {
                            return new Promise(function (resolve) {
                                new PerformanceObserver(function (list) {
                                    var entries = list.getEntries();
                                    var lastEntry = entries[entries.length - 1];
                                    resolve(lastEntry.startTime);
                                }).observe({ entryTypes: ['largest-contentful-paint'] });
                            });
                        })
                        // LCP should be under 2.5 seconds
                    ];
                case 2:
                    lcp = _c.sent();
                    // LCP should be under 2.5 seconds
                    (0, test_1.expect)(lcp).toBeLessThan(2500);
                    return [2 /*return*/];
            }
        });
    }); });
});
