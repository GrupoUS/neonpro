import { describe, expect, it } from "vitest";
import { InMemoryPolicyService } from "../../index";

describe(_"Policy evaluation aggregation",_() => {
  it(_"aggregates rule results into final status",_async () => {
    const svc = new InMemoryPolicyService();
    await svc.register({
      id: "POL-1",
      name: "Encryption Policy",
      rules: [
        { id: "RULE-1", type: "boolean", evaluate: () => true },
        { id: "RULE-2", type: "boolean", evaluate: () => false },
      ],
    });
    const result = await svc.evaluate("POL-1");
    expect(result.total).toBe(2);
    expect(result.passed).toBe(1);
    expect(result.status).toBe("partial");
  });
});
