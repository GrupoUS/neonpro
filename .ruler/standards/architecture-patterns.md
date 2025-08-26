# Validated Architecture Patterns

## 🏗 PROGRESSIVE ARCHITECTURE FRAMEWORK

Architecture patterns that scale intelligently with system complexity, domain requirements, and
enterprise needs.

**Core Principle**: Right-sized architecture for the problem domain with clear evolution paths.

## 📊 ARCHITECTURE COMPLEXITY MATRIX

```yaml
architecture_levels:
  L1_L2_simple:
    patterns: ["MVC", "Layered", "Repository"]
    complexity: "Single service, basic CRUD operations"
    scale: "< 10K users, < 100 requests/sec"

  L3_L4_modular:
    patterns: ["Modular Monolith", "CQRS", "Event Sourcing"]
    complexity: "Multiple bounded contexts, complex business logic"
    scale: "< 100K users, < 1K requests/sec"

  L5_L6_distributed:
    patterns: ["Microservices", "Saga", "API Gateway"]
    complexity: "Distributed system, cross-service transactions"
    scale: "< 1M users, < 10K requests/sec"

  L7_L8_enterprise:
    patterns: ["Event-Driven", "CQRS+ES", "Hexagonal"]
    complexity: "Mission-critical, high availability, audit trails"
    scale: "< 10M users, < 100K requests/sec"

  L9_L10_critical:
    patterns: ["Actor Model", "Event Sourcing", "Immutable Infrastructure"]
    complexity: "Life-critical, regulatory compliance, zero downtime"
    scale: "Unlimited scale, sub-millisecond response"
```

## 🏗 L1-L2: FOUNDATIONAL PATTERNS

**Scope**: Simple applications, MVPs, basic CRUD operations\
**Scale**: < 10K users, < 100 requests/second

### Repository Pattern

```typescript
// ✅ Clean separation of data access logic
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserRequest): Promise<User>;
  update(id: string, user: UpdateUserRequest): Promise<User>;
  delete(id: string): Promise<void>;
}

class PostgreSQLUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  async create(user: CreateUserRequest): Promise<User> {
    const result = await this.db.query(
      `INSERT INTO users (email, name, created_at) 
       VALUES ($1, $2, NOW()) RETURNING *`,
      [user.email, user.name],
    );
    return this.mapToUser(result.rows[0]);
  }

  private mapToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

### Layered Architecture

```typescript
// ✅ Clear separation of concerns in layers
// Presentation Layer
class UserController {
  constructor(private readonly userService: UserService) {}

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Business Logic Layer
class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async getUserById(id: string): Promise<User | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid user ID');
    }
    return await this.userRepo.findById(id);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    // Business validation
    if (!userData.email || !isValidEmail(userData.email)) {
      throw new Error('Valid email is required');
    }

    // Check for duplicates
    const existingUser = await this.userRepo.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    return await this.userRepo.create(userData);
  }
}

// Data Access Layer (Repository from above)
```

### Simple MVC Pattern

```typescript
// ✅ Model-View-Controller for web applications
// Model
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// View (React Component)
const UserProfile: React.FC<{ user: User; }> = ({ user }) => (
  <div className="user-profile">
    <h2>{user.name}</h2>
    <p>Email: {user.email}</p>
    <p>Member since: {user.createdAt.toLocaleDateString()}</p>
  </div>
);

// Controller
class UserProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly view: React.ComponentType<{ user: User; }>,
  ) {}

  async handleUserRequest(userId: string): Promise<React.ReactElement> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return React.createElement(this.view, { user });
  }
}
```

## 🔧 L3-L4: MODULAR PATTERNS

**Scope**: Complex business logic, multiple bounded contexts\
**Scale**: < 100K users, < 1K requests/second

### Modular Monolith

```typescript
// ✅ Domain-driven modular organization
// User Module
export namespace UserModule {
  export interface UserService {
    createUser(user: CreateUserRequest): Promise<User>;
    getUserById(id: string): Promise<User | null>;
  }

  export interface UserEvents {
    userCreated(user: User): Promise<void>;
    userUpdated(user: User): Promise<void>;
  }

  class UserServiceImpl implements UserService {
    constructor(
      private readonly userRepo: UserRepository,
      private readonly events: UserEvents,
    ) {}

    async createUser(userData: CreateUserRequest): Promise<User> {
      const user = await this.userRepo.create(userData);
      await this.events.userCreated(user);
      return user;
    }
  }
}

// Order Module
export namespace OrderModule {
  export interface OrderService {
    createOrder(order: CreateOrderRequest): Promise<Order>;
    getOrdersByUser(userId: string): Promise<Order[]>;
  }

  class OrderServiceImpl implements OrderService {
    constructor(
      private readonly orderRepo: OrderRepository,
      private readonly userService: UserModule.UserService,
    ) {}

    async createOrder(orderData: CreateOrderRequest): Promise<Order> {
      // Cross-module interaction
      const user = await this.userService.getUserById(orderData.userId);
      if (!user) {
        throw new Error('User not found');
      }

      return await this.orderRepo.create({
        ...orderData,
        userEmail: user.email,
      });
    }
  }
}
```

### CQRS (Command Query Responsibility Segregation)

```typescript
// ✅ Separate read and write models
// Command Side (Write)
interface Command {
  execute(): Promise<void>;
}

class CreateUserCommand implements Command {
  constructor(
    private readonly userData: CreateUserRequest,
    private readonly userWriteRepo: UserWriteRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(): Promise<void> {
    const user = await this.userWriteRepo.create(this.userData);
    await this.eventBus.publish(new UserCreatedEvent(user));
  }
}

class UpdateUserCommand implements Command {
  constructor(
    private readonly userId: string,
    private readonly updates: UpdateUserRequest,
    private readonly userWriteRepo: UserWriteRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(): Promise<void> {
    const user = await this.userWriteRepo.update(this.userId, this.updates);
    await this.eventBus.publish(new UserUpdatedEvent(user));
  }
}

// Query Side (Read)
interface Query<TResult> {
  execute(): Promise<TResult>;
}

class GetUserByIdQuery implements Query<User | null> {
  constructor(
    private readonly userId: string,
    private readonly userReadRepo: UserReadRepository,
  ) {}

  async execute(): Promise<User | null> {
    return await this.userReadRepo.findById(this.userId);
  }
}

class GetUsersByEmailDomainQuery implements Query<User[]> {
  constructor(
    private readonly domain: string,
    private readonly userReadRepo: UserReadRepository,
  ) {}

  async execute(): Promise<User[]> {
    return await this.userReadRepo.findByEmailDomain(this.domain);
  }
}

// Command/Query Bus
class CommandBus {
  async execute(command: Command): Promise<void> {
    await command.execute();
  }
}

class QueryBus {
  async execute<TResult>(query: Query<TResult>): Promise<TResult> {
    return await query.execute();
  }
}
```

### Event Sourcing Pattern

```typescript
// ✅ Store events instead of current state
interface DomainEvent {
  id: string;
  aggregateId: string;
  eventType: string;
  eventData: any;
  timestamp: Date;
  version: number;
}

class UserAggregate {
  private events: DomainEvent[] = [];

  constructor(
    public readonly id: string,
    private email: string,
    private name: string,
    private version: number = 0,
  ) {}

  static fromEvents(events: DomainEvent[]): UserAggregate {
    const firstEvent = events[0];
    if (firstEvent.eventType !== 'UserCreated') {
      throw new Error('Invalid event stream');
    }

    const user = new UserAggregate(
      firstEvent.aggregateId,
      firstEvent.eventData.email,
      firstEvent.eventData.name,
    );

    // Apply remaining events
    events.slice(1).forEach(event => user.applyEvent(event));

    return user;
  }

  updateEmail(newEmail: string): void {
    if (newEmail === this.email) return;

    this.addEvent('UserEmailUpdated', {
      oldEmail: this.email,
      newEmail: newEmail,
    });

    this.email = newEmail;
  }

  private addEvent(eventType: string, eventData: any): void {
    const event: DomainEvent = {
      id: generateUUID(),
      aggregateId: this.id,
      eventType,
      eventData,
      timestamp: new Date(),
      version: this.version + 1,
    };

    this.events.push(event);
    this.version = event.version;
  }

  private applyEvent(event: DomainEvent): void {
    switch (event.eventType) {
      case 'UserEmailUpdated':
        this.email = event.eventData.newEmail;
        break;
      case 'UserNameUpdated':
        this.name = event.eventData.newName;
        break;
    }
    this.version = event.version;
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}

// Event Store
interface EventStore {
  saveEvents(aggregateId: string, events: DomainEvent[]): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
}
```

## 🌐 L5-L6: DISTRIBUTED PATTERNS

**Scope**: Microservices, distributed transactions, high scalability\
**Scale**: < 1M users, < 10K requests/second

### Microservices Architecture

```typescript
// ✅ Independent, deployable services
// User Service
class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly eventBus: EventBus,
    private readonly serviceRegistry: ServiceRegistry,
  ) {}

  async createUser(userData: CreateUserRequest): Promise<User> {
    const user = await this.userRepo.create(userData);

    // Publish event for other services
    await this.eventBus.publish('user.created', {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    });

    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepo.findById(id);
  }
}

// Order Service (separate service)
class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly userServiceClient: UserServiceClient,
    private readonly eventBus: EventBus,
  ) {}

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    // Call user service to validate user exists
    const user = await this.userServiceClient.getUser(orderData.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const order = await this.orderRepo.create(orderData);

    await this.eventBus.publish('order.created', {
      orderId: order.id,
      userId: order.userId,
      amount: order.amount,
    });

    return order;
  }
}

// Inter-service communication
interface UserServiceClient {
  getUser(id: string): Promise<User | null>;
  createUser(user: CreateUserRequest): Promise<User>;
}

class HttpUserServiceClient implements UserServiceClient {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly serviceRegistry: ServiceRegistry,
  ) {}

  async getUser(id: string): Promise<User | null> {
    const userServiceUrl = await this.serviceRegistry.getServiceUrl('user-service');

    try {
      const response = await this.httpClient.get(`${userServiceUrl}/users/${id}`);
      return response.data;
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }
}
```

### API Gateway Pattern

```typescript
// ✅ Single entry point for all client requests
class APIGateway {
  constructor(
    private readonly userService: UserServiceClient,
    private readonly orderService: OrderServiceClient,
    private readonly authService: AuthServiceClient,
    private readonly rateLimiter: RateLimiter,
    private readonly circuitBreaker: CircuitBreaker,
  ) {}

  // Aggregate multiple service calls
  async getUserDashboard(userId: string, authToken: string): Promise<UserDashboard> {
    // Authentication
    const authResult = await this.authService.validateToken(authToken);
    if (!authResult.isValid) {
      throw new UnauthorizedError('Invalid token');
    }

    // Rate limiting
    await this.rateLimiter.checkLimit(userId, { maxRequests: 100, window: 60000 });

    // Parallel service calls with circuit breaker
    const [user, orders, preferences] = await Promise.all([
      this.circuitBreaker.execute(() => this.userService.getUser(userId)),
      this.circuitBreaker.execute(() => this.orderService.getUserOrders(userId)),
      this.circuitBreaker.execute(() => this.userService.getUserPreferences(userId)),
    ]);

    return {
      user,
      orders,
      preferences,
      timestamp: new Date(),
    };
  }

  // Request transformation and routing
  async routeRequest(request: APIRequest): Promise<APIResponse> {
    const route = this.determineRoute(request.path);

    switch (route.service) {
      case 'user':
        return await this.forwardToUserService(request);
      case 'order':
        return await this.forwardToOrderService(request);
      default:
        throw new NotFoundError('Service not found');
    }
  }
}

// Circuit Breaker for fault tolerance
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new ServiceUnavailableError('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

### Saga Pattern (Distributed Transactions)

```typescript
// ✅ Manage distributed transactions across services
interface SagaStep {
  execute(): Promise<void>;
  compensate(): Promise<void>;
}

class CreateOrderSaga {
  private steps: SagaStep[] = [];

  constructor(
    private readonly orderData: CreateOrderRequest,
    private readonly userService: UserServiceClient,
    private readonly orderService: OrderServiceClient,
    private readonly paymentService: PaymentServiceClient,
    private readonly inventoryService: InventoryServiceClient,
  ) {
    this.setupSteps();
  }

  private setupSteps(): void {
    // Step 1: Reserve inventory
    this.steps.push({
      execute: async () => {
        await this.inventoryService.reserveItems(this.orderData.items);
      },
      compensate: async () => {
        await this.inventoryService.releaseItems(this.orderData.items);
      },
    });

    // Step 2: Create order
    this.steps.push({
      execute: async () => {
        await this.orderService.createOrder(this.orderData);
      },
      compensate: async () => {
        await this.orderService.cancelOrder(this.orderData.id);
      },
    });

    // Step 3: Process payment
    this.steps.push({
      execute: async () => {
        await this.paymentService.processPayment({
          orderId: this.orderData.id,
          amount: this.orderData.amount,
          paymentMethod: this.orderData.paymentMethod,
        });
      },
      compensate: async () => {
        await this.paymentService.refundPayment(this.orderData.id);
      },
    });
  }

  async execute(): Promise<void> {
    const executedSteps: SagaStep[] = [];

    try {
      for (const step of this.steps) {
        await step.execute();
        executedSteps.push(step);
      }
    } catch (error) {
      // Compensate in reverse order
      for (const step of executedSteps.reverse()) {
        try {
          await step.compensate();
        } catch (compensationError) {
          // Log compensation failure but continue
          console.error('Saga compensation failed:', compensationError);
        }
      }
      throw error;
    }
  }
}
```

## 🏢 L7-L8: ENTERPRISE PATTERNS

**Scope**: Mission-critical systems, high availability, comprehensive audit trails\
**Scale**: < 10M users, < 100K requests/second

### Event-Driven Architecture

```typescript
// ✅ Loose coupling through events
interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}

class DistributedEventBus implements EventBus {
  constructor(
    private readonly messageQueue: MessageQueue,
    private readonly eventStore: EventStore,
    private readonly logger: Logger,
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    // Store event for replay capability
    await this.eventStore.append(event);

    // Publish to message queue
    await this.messageQueue.publish(event.type, {
      ...event,
      publishedAt: new Date(),
    });

    this.logger.info('Event published', {
      eventId: event.id,
      eventType: event.type,
      aggregateId: event.aggregateId,
    });
  }

  subscribe(eventType: string, handler: EventHandler): void {
    this.messageQueue.subscribe(eventType, async (message) => {
      try {
        await handler.handle(message.data);
        await this.messageQueue.acknowledge(message);
      } catch (error) {
        this.logger.error('Event handler failed', {
          eventType,
          error: error.message,
          messageId: message.id,
        });

        // Dead letter queue for failed messages
        await this.messageQueue.sendToDeadLetter(message);
      }
    });
  }
}

// Event Handler with retry logic
abstract class EventHandler {
  constructor(
    protected readonly logger: Logger,
    protected readonly retryPolicy: RetryPolicy = new ExponentialBackoffRetry(),
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    const attempt = async () => {
      await this.processEvent(event);
    };

    await this.retryPolicy.execute(attempt);
  }

  abstract processEvent(event: DomainEvent): Promise<void>;
}

// Specific event handlers
class UserCreatedHandler extends EventHandler {
  constructor(
    private readonly emailService: EmailService,
    private readonly analyticsService: AnalyticsService,
    logger: Logger,
  ) {
    super(logger);
  }

  async processEvent(event: DomainEvent): Promise<void> {
    if (event.type !== 'UserCreated') return;

    const userData = event.data;

    // Send welcome email
    await this.emailService.sendWelcomeEmail({
      to: userData.email,
      name: userData.name,
      userId: event.aggregateId,
    });

    // Track analytics
    await this.analyticsService.track('user_registered', {
      userId: event.aggregateId,
      registrationSource: userData.source,
      timestamp: event.timestamp,
    });
  }
}
```

### Hexagonal Architecture (Ports and Adapters)

```typescript
// ✅ Clean separation of core business logic from external dependencies
// Domain (Core Business Logic)
interface User {
  id: UserId;
  email: Email;
  name: string;
  isActive: boolean;
}

class UserDomainService {
  async createUser(userData: CreateUserData): Promise<User> {
    // Pure business logic
    if (!this.isValidEmail(userData.email)) {
      throw new InvalidEmailError('Email format is invalid');
    }

    return {
      id: generateUserId(),
      email: userData.email,
      name: userData.name,
      isActive: true,
    };
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// Ports (Interfaces)
interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}

interface NotificationService {
  sendWelcomeEmail(user: User): Promise<void>;
}

interface AuditLogger {
  logUserAction(action: string, userId: UserId, details: any): Promise<void>;
}

// Application Service (Use Cases)
class CreateUserUseCase {
  constructor(
    private readonly userDomainService: UserDomainService,
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      return CreateUserResult.failure('User already exists');
    }

    // Create user using domain service
    const user = await this.userDomainService.createUser(command);

    // Save user
    await this.userRepository.save(user);

    // Send notification
    await this.notificationService.sendWelcomeEmail(user);

    // Log action
    await this.auditLogger.logUserAction('user_created', user.id, {
      email: user.email,
      timestamp: new Date(),
    });

    return CreateUserResult.success(user);
  }
}

// Adapters (Infrastructure)
class PostgresUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async save(user: User): Promise<void> {
    await this.db.query(
      'INSERT INTO users (id, email, name, is_active) VALUES ($1, $2, $3, $4)',
      [user.id, user.email, user.name, user.isActive],
    );
  }

  async findById(id: UserId): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }
}

class EmailNotificationService implements NotificationService {
  constructor(private readonly emailClient: EmailClient) {}

  async sendWelcomeEmail(user: User): Promise<void> {
    await this.emailClient.send({
      to: user.email,
      subject: 'Welcome!',
      template: 'welcome',
      data: { name: user.name },
    });
  }
}

class DatabaseAuditLogger implements AuditLogger {
  constructor(private readonly db: Database) {}

  async logUserAction(action: string, userId: UserId, details: any): Promise<void> {
    await this.db.query(
      'INSERT INTO audit_log (action, user_id, details, timestamp) VALUES ($1, $2, $3, NOW())',
      [action, userId, JSON.stringify(details)],
    );
  }
}
```

## 🏥 L9-L10: CRITICAL PATTERNS

**Scope**: Healthcare, financial, life-critical systems with regulatory compliance\
**Scale**: Unlimited scale, sub-millisecond response requirements

### Actor Model for Concurrent Processing

```typescript
// ✅ Isolated, message-passing concurrency
interface Message {
  id: string;
  type: string;
  payload: any;
  sender?: string;
  timestamp: Date;
}

abstract class Actor {
  protected readonly id: string;
  protected readonly mailbox: Message[] = [];
  protected isProcessing = false;

  constructor(id: string) {
    this.id = id;
  }

  async send(message: Message): Promise<void> {
    this.mailbox.push(message);
    if (!this.isProcessing) {
      await this.processMessages();
    }
  }

  private async processMessages(): Promise<void> {
    this.isProcessing = true;

    while (this.mailbox.length > 0) {
      const message = this.mailbox.shift();
      if (message) {
        try {
          await this.receive(message);
        } catch (error) {
          await this.handleError(message, error);
        }
      }
    }

    this.isProcessing = false;
  }

  abstract receive(message: Message): Promise<void>;
  abstract handleError(message: Message, error: Error): Promise<void>;
}

// Healthcare Patient Actor - Critical data processing
class PatientActor extends Actor {
  private patientData: PatientData | null = null;
  private readonly auditTrail: AuditEvent[] = [];

  constructor(
    patientId: string,
    private readonly patientRepo: PatientRepository,
    private readonly complianceValidator: ComplianceValidator,
    private readonly encryptionService: EncryptionService,
  ) {
    super(patientId);
  }

  async receive(message: Message): Promise<void> {
    switch (message.type) {
      case 'UPDATE_MEDICAL_RECORD':
        await this.updateMedicalRecord(message.payload);
        break;
      case 'GRANT_CONSENT':
        await this.grantConsent(message.payload);
        break;
      case 'REQUEST_DATA_EXPORT':
        await this.exportPatientData(message.payload);
        break;
      case 'DELETE_PATIENT_DATA':
        await this.deletePatientData(message.payload);
        break;
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }

  private async updateMedicalRecord(payload: UpdateMedicalRecordPayload): Promise<void> {
    // Load current state if not already loaded
    if (!this.patientData) {
      this.patientData = await this.patientRepo.findById(this.id);
    }

    // Validate compliance (LGPD, ANVISA, CFM)
    const validationResult = await this.complianceValidator.validateMedicalUpdate(
      this.patientData,
      payload.update,
      payload.professionalId,
    );

    if (!validationResult.isCompliant) {
      throw new ComplianceViolationError(validationResult.violations);
    }

    // Encrypt sensitive data
    const encryptedUpdate = await this.encryptionService.encryptMedicalData(
      payload.update,
      { algorithm: 'AES-256-GCM', keyVersion: 'v3' },
    );

    // Apply update immutably
    this.patientData = {
      ...this.patientData,
      medicalRecords: [
        ...this.patientData.medicalRecords,
        {
          id: generateRecordId(),
          data: encryptedUpdate,
          professionalId: payload.professionalId,
          timestamp: new Date(),
          hash: await this.calculateDataHash(encryptedUpdate),
        },
      ],
      version: this.patientData.version + 1,
    };

    // Persist with audit trail
    await this.patientRepo.saveWithAudit(this.patientData, {
      action: 'medical_record_updated',
      performedBy: payload.professionalId,
      timestamp: new Date(),
      dataHash: await this.calculateDataHash(this.patientData),
    });

    // Add to audit trail
    this.auditTrail.push({
      id: generateAuditId(),
      action: 'medical_record_updated',
      timestamp: new Date(),
      performedBy: payload.professionalId,
      dataHash: await this.calculateDataHash(this.patientData),
    });
  }

  private async grantConsent(payload: ConsentPayload): Promise<void> {
    // LGPD compliance - explicit consent management
    const consentRecord: ConsentRecord = {
      id: generateConsentId(),
      patientId: this.id,
      consentType: payload.type,
      granular: payload.permissions,
      grantedAt: new Date(),
      digitalSignature: payload.digitalSignature,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    };

    // Cryptographic proof of consent
    const consentHash = await this.encryptionService.generateConsentHash(consentRecord);

    this.patientData = {
      ...this.patientData!,
      consents: [...this.patientData!.consents, consentRecord],
      version: this.patientData!.version + 1,
    };

    await this.patientRepo.saveWithAudit(this.patientData, {
      action: 'consent_granted',
      performedBy: this.id,
      timestamp: new Date(),
      consentHash,
    });
  }

  async handleError(message: Message, error: Error): Promise<void> {
    // Critical error handling for healthcare data
    await this.auditTrail.push({
      id: generateAuditId(),
      action: 'error_occurred',
      timestamp: new Date(),
      error: error.message,
      messageId: message.id,
      messageType: message.type,
    });

    // Dead letter queue for critical failures
    await this.sendToDeadLetter(message, error);

    // Alert compliance team for regulatory violations
    if (error instanceof ComplianceViolationError) {
      await this.alertComplianceTeam(error, message);
    }
  }
}
```

### Immutable Infrastructure Pattern

```typescript
// ✅ Zero-mutation deployment and rollback strategy
interface DeploymentSnapshot {
  readonly id: string;
  readonly version: string;
  readonly timestamp: Date;
  readonly configuration: Readonly<SystemConfiguration>;
  readonly serviceVersions: ReadonlyMap<string, string>;
  readonly dataSchemaVersion: string;
  readonly complianceChecksums: ReadonlyMap<string, string>;
}

class ImmutableDeploymentManager {
  constructor(
    private readonly containerRegistry: ContainerRegistry,
    private readonly configManager: ConfigurationManager,
    private readonly databaseMigrator: DatabaseMigrator,
    private readonly loadBalancer: LoadBalancer,
    private readonly complianceValidator: ComplianceValidator,
  ) {}

  async deployNewVersion(deploymentConfig: DeploymentConfiguration): Promise<DeploymentResult> {
    // Create immutable snapshot
    const snapshot = await this.createDeploymentSnapshot(deploymentConfig);

    try {
      // Validate compliance before deployment
      const complianceResult = await this.complianceValidator.validateDeployment(snapshot);
      if (!complianceResult.isCompliant) {
        throw new ComplianceViolationError(complianceResult.violations);
      }

      // Deploy infrastructure as code
      const infrastructure = await this.deployInfrastructure(snapshot);

      // Deploy application services
      const services = await this.deployServices(snapshot, infrastructure);

      // Migrate data schema if needed
      if (snapshot.dataSchemaVersion !== await this.getCurrentSchemaVersion()) {
        await this.databaseMigrator.migrateToVersion(
          snapshot.dataSchemaVersion,
          { rollbackEnabled: true },
        );
      }

      // Health check new deployment
      const healthCheck = await this.performHealthChecks(services);
      if (!healthCheck.isHealthy) {
        throw new DeploymentHealthCheckError(healthCheck.issues);
      }

      // Switch traffic gradually (blue-green deployment)
      await this.switchTrafficGradually(services);

      return DeploymentResult.success(snapshot);
    } catch (error) {
      // Automatic rollback on failure
      await this.rollbackToLastKnownGood();
      throw error;
    }
  }

  private async createDeploymentSnapshot(
    config: DeploymentConfiguration,
  ): Promise<DeploymentSnapshot> {
    return {
      id: generateDeploymentId(),
      version: config.version,
      timestamp: new Date(),
      configuration: Object.freeze({ ...config.systemConfig }),
      serviceVersions: new Map(config.services.map(s => [s.name, s.version])),
      dataSchemaVersion: config.dataSchemaVersion,
      complianceChecksums: new Map(
        config.complianceArtifacts.map(a => [a.type, a.checksum]),
      ),
    };
  }

  async rollbackToSnapshot(snapshotId: string): Promise<void> {
    const snapshot = await this.getSnapshot(snapshotId);

    // Rollback services
    await this.deployServices(snapshot, await this.getCurrentInfrastructure());

    // Rollback database schema
    await this.databaseMigrator.rollbackToVersion(snapshot.dataSchemaVersion);

    // Update load balancer routing
    await this.loadBalancer.updateRouting(snapshot.serviceVersions);
  }
}
```

## 🎯 ARCHITECTURE DECISION FRAMEWORK

### Pattern Selection Matrix

```yaml
decision_factors:
  complexity_level:
    simple: "L1-L2 patterns sufficient"
    moderate: "L3-L4 patterns recommended"
    complex: "L5-L6 patterns required"
    enterprise: "L7-L8 patterns mandatory"
    critical: "L9-L10 patterns non-negotiable"

  scalability_requirements:
    low: "< 1K users, monolithic patterns OK"
    medium: "< 100K users, modular patterns recommended"
    high: "< 1M users, distributed patterns required"
    very_high: "> 1M users, event-driven architecture mandatory"
    extreme: "Unlimited scale, actor model + immutable infrastructure"

  compliance_requirements:
    none: "Standard patterns sufficient"
    basic: "Audit trails required"
    regulatory: "Healthcare/financial compliance patterns mandatory"

  availability_requirements:
    standard: "99% uptime, basic error handling"
    high: "99.9% uptime, circuit breakers required"
    very_high: "99.99% uptime, chaos engineering validation"
    extreme: "99.999% uptime, zero-downtime deployments"
```

### Anti-Patterns to Avoid

```typescript
// ❌ Avoid: Distributed monolith
class BadOrderService {
  async createOrder(order: CreateOrderRequest): Promise<Order> {
    // DON'T: Synchronous calls to multiple services without proper error handling
    const user = await userService.getUser(order.userId); // Blocks if user service is down
    const inventory = await inventoryService.checkStock(order.items); // Another blocking call
    const pricing = await pricingService.calculatePrice(order.items); // Yet another dependency

    // This creates a distributed monolith - all services must be up for this to work
    return await orderRepo.create({ ...order, userId: user.id, total: pricing.total });
  }
}

// ✅ Better: Resilient microservice with async patterns
class GoodOrderService {
  async createOrder(order: CreateOrderRequest): Promise<Order> {
    // Validate locally first
    const validationResult = await this.validateOrderRequest(order);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors);
    }

    // Create order optimistically
    const newOrder = await this.orderRepo.create({
      ...order,
      status: 'pending_validation',
    });

    // Publish event for async processing
    await this.eventBus.publish('order.created', {
      orderId: newOrder.id,
      userId: order.userId,
      items: order.items,
    });

    return newOrder;
  }
}
```

---

**🏛 CONSTITUTIONAL ADHERENCE**: All patterns must align with VIBECODER principles, progressive
quality frameworks, and domain-specific compliance requirements (healthcare, financial, etc.).

**🔄 EVOLUTION PATH**: Patterns provide clear upgrade paths from simpler to more complex
architectures as system requirements grow.
