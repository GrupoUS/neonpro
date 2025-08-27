# Code Freeze

Use `// CODE-FREEZE: [reason]` to protect critical code from AI modifications.

## Syntax

```javascript
// CODE-FREEZE: Validated payment logic
function processPayment(amount, cardData) {
    return paymentGateway.charge(amount, cardData);
}
// END CODE-FREEZE
```

## Guidelines for AI

- **NEVER** modify code between `// CODE-FREEZE` and `// END CODE-FREEZE`
- **SUGGEST** alternatives instead of changing protected code
- **DOCUMENT** any need to modify protected code

> Protects production code, security logic, and critical integrations.