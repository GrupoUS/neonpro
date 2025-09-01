import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Import the SUT (system under test). We import from the implementation file.
// If your implementation file lives elsewhere, adjust this path accordingly.
import SupabaseRealtimeChat, { getSupabaseRealtimeChat } from "../supabase-realtime";
import type { SupabaseRealtimeConfig } from "../supabase-realtime";

// Mock @supabase/supabase-js createClient to return a fully stubbed client
vi.mock("@supabase/supabase-js", () => {
  // Minimal chainable query builder util
  const makeQuery = (overrides: Record<string, unknown> = {}) => {
    const qb: Record<string, unknown> = {
      __kind: "queryBuilder",
      __state: {},
      select: vi.fn().mockImplementation(function(_sel?: unknown) {
        return this;
      }),
      insert: vi.fn().mockImplementation(function(_data?: unknown) {
        return this;
      }),
      update: vi.fn().mockImplementation(function(_data?: unknown) {
        return this;
      }),
      eq: vi.fn().mockImplementation(function(_col?: string, _val?: unknown) {
        return this;
      }),
      contains: vi.fn().mockImplementation(function(_col?: string, _val?: unknown) {
        return this;
      }),
      order: vi.fn().mockImplementation(function(_col?: string, _opts?: Record<string, unknown>) {
        return this;
      }),
      limit: vi.fn().mockImplementation(function(_n?: number) {
        return this;
      }),
      single: vi.fn().mockImplementation(function() {
        return this;
      }),
      ...overrides,
    };
    return qb;
  };

  // RealtimeChannel mock with presence, broadcast, subscribe flows
  const makeChannel = (name: string) => {
    const handlers: Record<string, unknown[]> = {
      "postgres_changes": [],
      "broadcast:typing": [],
      "presence:sync": [],
      "presence:join": [],
      "presence:leave": [],
    };

    const ch: Record<string, unknown> = {
      __name: name,
      on: vi.fn().mockImplementation(
        (type: string, filterOrOpts: Record<string, unknown>, cb?: (arg: unknown) => void) => {
          // Normalize arguments for different event types
          if (type === "postgres_changes") {
            handlers["postgres_changes"].push({ filter: filterOrOpts, cb });
          } else if (type === "broadcast" && filterOrOpts?.event === "typing") {
            handlers["broadcast:typing"].push(cb);
          } else if (type === "presence") {
            const ev = filterOrOpts?.event;
            if (ev === "sync") handlers["presence:sync"].push(cb);
            if (ev === "join") handlers["presence:join"].push(cb);
            if (ev === "leave") handlers["presence:leave"].push(cb);
          }
          return ch;
        },
      ),
      subscribe: vi.fn().mockImplementation(async (cb?: (status: string) => void) => {
        if (cb) {
          await cb("SUBSCRIBED");
        }
        return ch;
      }),
      presenceState: vi.fn().mockReturnValue({
        "user-1": [{ status: "online" }],
        "user-2": [{ status: "away" }],
      }),
      track: vi.fn().mockResolvedValue({ ok: true }),
      send: vi.fn().mockResolvedValue({ ok: true }),
      // test helpers to trigger events
      __emitBroadcastTyping(payload: Record<string, unknown>) {
        handlers["broadcast:typing"].forEach((fn) => fn({ payload }));
      },
      __emitPresenceSync() {
        handlers["presence:sync"].forEach((fn) => fn());
      },
      __emitPresenceJoin(arg: Record<string, unknown>) {
        handlers["presence:join"].forEach((fn) => fn(arg));
      },
      __emitPresenceLeave(arg: Record<string, unknown>) {
        handlers["presence:leave"].forEach((fn) => fn(arg));
      },
      __emitInsert(newRow: Record<string, unknown>) {
        handlers["postgres_changes"].forEach((h) => h.cb({ new: newRow }));
      },
      __emitUpdate(newRow: Record<string, unknown>) {
        handlers["postgres_changes"].forEach((h) => h.cb({ new: newRow }));
      },
    };
    return ch;
  };

  const channels = new Map<string, unknown>();

  const client: Record<string, unknown> = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u-123" } } }),
    },
    from: vi.fn().mockImplementation((_table: string) => makeQuery()),
    channel: vi.fn().mockImplementation((name: string) => {
      const ch = makeChannel(name);
      channels.set(name, ch);
      return ch;
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null }),
    },
    removeChannel: vi.fn().mockResolvedValue({ ok: true }),
    removeAllChannels: vi.fn().mockResolvedValue({ ok: true }),
    __channels: channels,
    __makeQuery,
  };

  function __makeQuery(overrides: Record<string, unknown>) {
    return makeQuery(overrides);
  }

  return {
    createClient: vi.fn().mockReturnValue(client),
  };
});

const { createClient } = await import("@supabase/supabase-js");

const baseConfig: SupabaseRealtimeConfig = {
  supabaseUrl: "https://example.supabase.co",
  supabaseAnonKey: "anon-key",
  enablePresence: true,
  enableTypingIndicators: true,
  messageEncryption: false,
  emergencyPriority: true,
  lgpdCompliance: true,
};

describe("SupabaseRealtimeChat - initialization", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes successfully when user is authenticated and sets up global presence", async () => {
    const chat = new SupabaseRealtimeChat(baseConfig);
    await expect(chat.initialize("u-123", { professional_info: { crm: "X" } } as unknown)).resolves
      .toBeUndefined();

    // global presence channel created and track called
    const mockClient: Record<string, unknown> =
      (createClient as Record<string, unknown>).mock.results[0].value;
    expect(mockClient.channel).toHaveBeenCalledWith("global_presence");

    const globalCh = mockClient.__channels.get("global_presence");
    expect(globalCh.track).toHaveBeenCalledWith(expect.objectContaining({
      user_id: "u-123",
      status: "online",
    }));
  });

  it("throws if user is not authenticated", async () => {
    const mockClient: Record<string, unknown> =
      (createClient as Record<string, unknown>).mock.results[0].value;
    mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: null } });

    const chat = new SupabaseRealtimeChat(baseConfig);
    await expect(chat.initialize("u-999")).rejects.toThrow("User not authenticated");
    expect(mockClient.channel).not.toHaveBeenCalledWith("global_presence");
  });
});

describe("SupabaseRealtimeChat - subscribeToConversation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("subscribes, loads recent messages, and wires typing/presence handlers", async () => {
    const mockClient: Record<string, unknown> =
      (createClient as Record<string, unknown>).mock.results[0].value;

    // Mock recent messages query
    const messages = [
      {
        id: "m2",
        conversation_id: "c1",
        sender_id: "u-2",
        sender_type: "patient",
        message_type: "text",
        content: { text: "older" },
        status: "sent",
        healthcare_context: null,
        emergency_priority: false,
        lgpd_compliant: true,
        created_at: new Date(Date.now() - 2000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "m3",
        conversation_id: "c1",
        sender_id: "u-3",
        sender_type: "patient",
        message_type: "text",
        content: { text: "newer" },
        status: "sent",
        healthcare_context: null,
        emergency_priority: false,
        lgpd_compliant: true,
        created_at: new Date(Date.now() - 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    mockClient.from.mockImplementationOnce((_table: string) => {
      return (mockClient as unknown).__makeQuery({
        select: vi.fn().mockImplementation(function() {
          return this;
        }),
        eq: vi.fn().mockImplementation(function() {
          return this;
        }),
        order: vi.fn().mockImplementation(function() {
          return this;
        }),
        limit: vi.fn().mockImplementation(function() {
          return Promise.resolve({ data: messages, error: null });
        }),
      });
    });

    const chat = new SupabaseRealtimeChat(baseConfig);
    await chat.initialize("u-123");

    const onMessage = vi.fn();
    const onTyping = vi.fn();
    const onPresence = vi.fn();
    const onError = vi.fn();

    await chat.subscribeToConversation("c1", { onMessage, onTyping, onPresence, onError });

    // after subscription callback, recent messages should be delivered oldest->newest
    expect(onMessage).toHaveBeenCalledTimes(2);
    expect(onMessage.mock.calls[0][0].id).toBe("m2");
    expect(onMessage.mock.calls[1][0].id).toBe("m3");

    // typing broadcast triggers callback
    const ch = mockClient.__channels.get("conversation_c1");
    ch.__emitBroadcastTyping({ users: [{ id: "u-2", typing: true }] });
    expect(onTyping).toHaveBeenCalledWith([{ id: "u-2", typing: true }]);

    // presence sync uses presenceState
    ch.__emitPresenceSync();
    expect(onPresence).toHaveBeenCalledWith(expect.arrayContaining([
      { id: "user-1", status: "online" },
      { id: "user-2", status: "away" },
    ]));

    // presence join/leave
    ch.__emitPresenceJoin({ key: "user-9", newPresences: [{ status: "online" }] });
    expect(onPresence).toHaveBeenCalledWith([{ id: "user-9", status: "online" }]);
    ch.__emitPresenceLeave({ key: "user-9" });
    expect(onPresence).toHaveBeenCalledWith([{ id: "user-9", status: "offline" }]);

    // track called with current user presence
    expect(ch.track).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "u-123", status: "online" }),
    );
  });

  it("handles channel CLOSED and attempts reconnection", async () => {
    const mockClient: Record<string, unknown> =
      (createClient as Record<string, unknown>).mock.results[0].value;

    // Arrange a channel whose subscribe first emits CLOSED, then SUBSCRIBED on next subscribe
    const chName = "conversation_c2";
    const ch = mockClient.channel(chName);
    ch.subscribe.mockImplementationOnce(async (cb: unknown) => {
      cb && (await cb("CLOSED"));
      return ch;
    });
    mockClient.channel.mockReturnValueOnce(ch); // use our precreated channel

    // Next subscribe path (for reconnection)
    ch.subscribe.mockImplementationOnce(async (cb: unknown) => {
      cb && (await cb("SUBSCRIBED"));
      return ch;
    });
    mockClient.channel.mockReturnValueOnce(ch);

    const chat = new SupabaseRealtimeChat(baseConfig);
    await chat.initialize("u-123");

    const onError = vi.fn();
    const onMessage = vi.fn();

    // No recent messages needed; stub loadRecentMessages fetch to empty
    mockClient.from.mockImplementation((_table: string) =>
      (mockClient as unknown).__makeQuery({
        select() {
          return this;
        },
        eq() {
          return this;
        },
        order() {
          return this;
        },
        limit() {
          return Promise.resolve({ data: [], error: null });
        },
      })
    );

    const p = chat.subscribeToConversation("c2", { onMessage, onError });

    // allow setTimeout to queue reconnection
    await vi.runAllTimersAsync();

    await p;
    expect(onError).toHaveBeenCalledWith(expect.<unknown>(Error)); // Connection closed
    expect(ch.subscribe).toHaveBeenCalledTimes(2); // initial + reconnection
  });
});

describe("SupabaseRealtimeChat - sendMessage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inserts message, handles emergency flow, updates conversation last message, returns transformed ChatMessage", async () => {
    const mockClient: unknown = (createClient as unknown).mock.results[0].value;

    // Mock DB insert/select for message
    const inserted = {
      id: "m100",
      conversation_id: "c100",
      sender_id: "u-123",
      sender_type: "patient",
      message_type: "text",
      content: { text: "Isso é urgente, por favor!" },
      status: "sent",
      healthcare_context: null,
      emergency_priority: true,
      lgpd_compliant: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockClient.from.mockImplementationOnce((_table: string) =>
      (mockClient as unknown).__makeQuery({
        insert() {
          return this;
        },
        select() {
          return this;
        },
        single() {
          return Promise.resolve({ data: inserted, error: null });
        },
      })
    );

    // Mock conversation update
    mockClient.from.mockImplementationOnce((_table: string) =>
      (mockClient as unknown).__makeQuery({
        update() {
          return this;
        },
        eq() {
          return Promise.resolve({ error: null });
        },
      })
    );

    const chat = new SupabaseRealtimeChat({ ...baseConfig, emergencyPriority: true });
    await chat.initialize("u-123");

    const msg = await chat.sendMessage("c100", { text: "É muito urgente!" }, "text");
    expect(msg.id).toBe("m100");
    expect(mockClient.functions.invoke).toHaveBeenCalledWith(
      "handle-emergency-message",
      expect.objectContaining({
        body: { message: expect.objectContaining({ id: "m100" }) },
      }),
    );
    // last message update
    expect(mockClient.from).toHaveBeenNthCalledWith(2, "chat_conversations");
  });

  it("propagates insert error", async () => {
    const mockClient: unknown = (createClient as unknown).mock.results[0].value;

    mockClient.from.mockImplementationOnce((_table: string) =>
      (mockClient as unknown).__makeQuery({
        insert() {
          return this;
        },
        select() {
          return this;
        },
        single() {
          return Promise.resolve({ data: null, error: new Error("db fail") });
        },
      })
    );

    const chat = new SupabaseRealtimeChat(baseConfig);
    await chat.initialize("u-123");

    await expect(chat.sendMessage("cErr", { text: "hi" })).rejects.toThrow("db fail");
  });
});

describe("SupabaseRealtimeChat - updateMessageStatus", () => {
  it("updates status and read_at when provided", async () => {
    const mockClient: unknown = (createClient as unknown).mock.results[0].value;

    mockClient.from.mockImplementationOnce((_table: string) =>
      (mockClient as unknown).__makeQuery({
        update() {
          return this;
        },
        eq() {
          return Promise.resolve({ error: null });
        },
      })
    );

    const chat = new SupabaseRealtimeChat(baseConfig);
    await chat.initialize("u-123");

    const when = new Date("2025-01-01T00:00:00Z");
    await chat.updateMessageStatus("m-1", "read" as unknown, when);

    expect(mockClient.from).toHaveBeenCalledWith("chat_messages");
  });
});

describe("SupabaseRealtimeChat - typing indicators", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => vi.useRealTimers());

  it("sends typing start and auto-stops after timeout; stop clears timer", async () => {
    const mockClient: unknown = (createClient as unknown).mock.results[0].value;

    // Provide a channel map entry to the SUT's channels by actually subscribing
    const chat = new SupabaseRealtimeChat({ ...baseConfig, enableTypingIndicators: true });
    await chat.initialize("u-123");
    mockClient.from.mockImplementation((_table: string) =>
      (mockClient as unknown).__makeQuery({
        select() {
          return this;
        },
        eq() {
          return this;
        },
        order() {
          return this;
        },
        limit() {
          return Promise.resolve({ data: [], error: null });
        },
      })
    );
    await chat.subscribeToConversation("cTyping", { onMessage: () => {} });

    const ch = mockClient.__channels.get("conversation_cTyping");

    await chat.sendTypingIndicator("cTyping", true);
    expect(ch.send).toHaveBeenCalledWith(expect.objectContaining({
      type: "broadcast",
      event: "typing",
      payload: expect.objectContaining({ typing: true }),
    }));

    // After 3s auto-stop
    await vi.advanceTimersByTimeAsync(3000);
    expect(ch.send).toHaveBeenCalledWith(expect.objectContaining({
      type: "broadcast",
      event: "typing",
      payload: expect.objectContaining({ typing: false }),
    }));

    // Explicit stop clears timer and sends false again
    await chat.sendTypingIndicator("cTyping", false);
    expect(ch.send).toHaveBeenCalledWith(expect.objectContaining({
      type: "broadcast",
      event: "typing",
      payload: expect.objectContaining({ typing: false }),
    }));
  });

  it("no-op when typing indicators disabled or channel absent", async () => {
    const chat = new SupabaseRealtimeChat({ ...baseConfig, enableTypingIndicators: false });
    await chat.initialize("u-123");
    await expect(chat.sendTypingIndicator("nope", true)).resolves.toBeUndefined();
  });
});

describe("SupabaseRealtimeChat - unsubscribe and disconnect", () => {
  it("unsubscribe removes channel and clears typing timers", async () => {
    const mockClient: unknown = (createClient as unknown).mock.results[0].value;
    const chat = new SupabaseRealtimeChat(baseConfig);
    await chat.initialize("u-123");

    // create a channel via subscribeToConversation to populate internal maps
    mockClient.from.mockImplementation((_table: string) =>
      (mockClient as unknown).__makeQuery({
        select() {
          return this;
        },
        eq() {
          return this;
        },
        order() {
          return this;
        },
        limit() {
          return Promise.resolve({ data: [], error: null });
        },
      })
    );
    await chat.subscribeToConversation("c-unsub", { onMessage: () => {} });

    // simulate a typing timer existing
    // @ts-expect-error access private map for test via unknown
    (chat as unknown).typingTimers.set("c-unsub", setTimeout(() => {}, 10_000));

    await chat.unsubscribeFromConversation("c-unsub");
    expect(mockClient.removeChannel).toHaveBeenCalled();
    // ensure timer cleared
    // @ts-expect-error
    expect((chat as unknown).typingTimers.has("c-unsub")).toBe(false);
  });

  it("disconnect clears timers, unsubscribes, and removes all channels", async () => {
    const mockClient: unknown = (createClient as unknown).mock.results[0].value;
    const chat = new SupabaseRealtimeChat(baseConfig);
    await chat.initialize("u-123");

    mockClient.from.mockImplementation((_table: string) =>
      (mockClient as unknown).__makeQuery({
        select() {
          return this;
        },
        eq() {
          return this;
        },
        order() {
          return this;
        },
        limit() {
          return Promise.resolve({ data: [], error: null });
        },
      })
    );
    await chat.subscribeToConversation("c-d1", { onMessage: () => {} });
    await chat.subscribeToConversation("c-d2", { onMessage: () => {} });

    // add timers
    // @ts-expect-error
    (chat as unknown).typingTimers.set("c-d1", setTimeout(() => {}, 10_000));
    // @ts-expect-error
    (chat as unknown).typingTimers.set("c-d2", setTimeout(() => {}, 10_000));

    await chat.disconnect();
    expect(mockClient.removeAllChannels).toHaveBeenCalled();
  });
});

describe("SupabaseRealtimeChat - queries: getActiveConversations and createConversation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getActiveConversations maps rows and dates; filters by current user", async () => {
    const mockClient: unknown = (createClient as unknown).mock.results[0].value;

    const rows = [{
      id: "c-1",
      participant_ids: ["u-123", "u-2"],
      conversation_type: "direct",
      healthcare_context: null,
      created_by: "u-123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      participants: [{ id: "u-2" }],
      last_message: {
        id: "m-1",
        conversation_id: "c-1",
        sender_id: "u-2",
        sender_type: "patient",
        message_type: "text",
        content: { text: "hi" },
        status: "sent",
        healthcare_context: null,
        emergency_priority: false,
        lgpd_compliant: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }];

    mockClient.from.mockImplementationOnce((_table: string) =>
      (mockClient as unknown).__makeQuery({
        select() {
          return this;
        },
        contains() {
          return this;
        },
        order() {
          return Promise.resolve({ data: rows, error: null });
        },
      })
    );

    const chat = new SupabaseRealtimeChat(baseConfig);
    await chat.initialize("u-123");

    const list = await chat.getActiveConversations();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("c-1");
    expect(list[0].last_message?.id).toBe("m-1");
    expect(list[0].created_at).toBeInstanceOf(Date);
    expect(list[0].last_message?.created_at).toBeInstanceOf(Date);
  });

  it("createConversation inserts and returns mapped conversation", async () => {
    const mockClient: unknown = (createClient as unknown).mock.results[0].value;

    const row = {
      id: "c-new",
      participant_ids: ["u-123", "u-7"],
      conversation_type: "direct",
      healthcare_context: null,
      created_by: "u-123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockClient.from.mockImplementationOnce((_table: string) =>
      (mockClient as unknown).__makeQuery({
        insert() {
          return this;
        },
        select() {
          return this;
        },
        single() {
          return Promise.resolve({ data: row, error: null });
        },
      })
    );

    const chat = new SupabaseRealtimeChat(baseConfig);
    await chat.initialize("u-123");

    const conv = await chat.createConversation(["u-7"], "direct");
    expect(conv.id).toBe("c-new");
    expect(conv.created_at).toBeInstanceOf(Date);
  });
});

describe("SupabaseRealtimeChat - helpers", () => {
  it("getSenderType returns healthcare_professional when professional_info present, otherwise patient", async () => {
    const chat1 = new SupabaseRealtimeChat(baseConfig);
    await chat1.initialize("u-1", { professional_info: { specialty: "cardio" } } as unknown);
    // @ts-expect-error
    expect(chat1["getSenderType"]()).toBe("healthcare_professional");

    const chat2 = new SupabaseRealtimeChat({ ...baseConfig });
    await chat2.initialize("u-2");
    // @ts-expect-error
    expect(chat2["getSenderType"]()).toBe("patient");
  });

  it("isEmergencyMessage detects Portuguese emergency keywords", () => {
    const chat = new SupabaseRealtimeChat(baseConfig);
    // @ts-expect-error
    expect(chat["isEmergencyMessage"]({ text: "É uma situação urgente!" })).toBe(true);
    // @ts-expect-error
    expect(chat["isEmergencyMessage"]({ text: "apenas um teste" })).toBe(false);
    // @ts-expect-error
    expect(chat["isEmergencyMessage"]("nope")).toBe(false);
  });

  it("transformMessage coerces date fields and preserves content (encryption placeholder)", () => {
    const chat = new SupabaseRealtimeChat({ ...baseConfig, messageEncryption: true });
    const now = new Date().toISOString();
    // @ts-expect-error
    const msg = chat["transformMessage"]({
      id: "m-x",
      conversation_id: "c-x",
      sender_id: "u-x",
      sender_type: "patient",
      message_type: "text",
      content: { text: "encrypted?" },
      status: "sent",
      healthcare_context: null,
      emergency_priority: false,
      lgpd_compliant: true,
      created_at: now,
      updated_at: now,
      read_at: now,
    });
    expect(msg.created_at).toBeInstanceOf(Date);
    expect(msg.updated_at).toBeInstanceOf(Date);
    expect(msg.read_at).toBeInstanceOf(Date);
    expect(msg.content).toStrictEqual({ text: "encrypted?" });
  });
});

describe("getSupabaseRealtimeChat singleton", () => {
  it("throws when accessed before initialization", () => {
    // Module-level singleton retains state across tests; simulate fresh state by re-importing module.
    vi.resetModules();
    return import("../supabase-realtime").then((mod) => {
      expect(() => mod.getSupabaseRealtimeChat()).toThrow(/not initialized/i);
    });
  });

  it("returns the same instance once initialized", async () => {
    vi.resetModules();
    const mod = await import("../supabase-realtime");
    const cfg: SupabaseRealtimeConfig = { ...baseConfig };
    const inst1 = mod.getSupabaseRealtimeChat(cfg);
    const inst2 = mod.getSupabaseRealtimeChat();
    expect(inst2).toBe(inst1);
  });
});
