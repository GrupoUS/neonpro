import { describe, expect, it } from "vitest";
import { InMemoryRiskService } from "../../index";

describe("Risk exposure recompute", () => {
  it(_"exposure = probability * impact",_async () => {
