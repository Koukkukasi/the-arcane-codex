# 🎭 Playwright Testing Guide

**Comprehensive E2E and Integration Testing with Playwright**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Test Projects](#test-projects)
5. [Writing Tests](#writing-tests)
6. [Best Practices](#best-practices)
7. [Debugging](#debugging)
8. [CI/CD Integration](#cicd-integration)

---

## Overview

The Arcane Codex uses Playwright for end-to-end (E2E) and integration testing. Playwright provides:

- ✅ **Fast and Reliable** - Tests run in parallel with automatic retries
- ✅ **Cross-Browser** - Test in Chromium, Firefox, and WebKit
- ✅ **API Testing** - Test REST APIs without browser overhead
- ✅ **Screenshots & Videos** - Automatic capture on failures
- ✅ **Test Reports** - Beautiful HTML reports

---

## Test Structure

```
tests/
├── database/               # Database layer tests
│   ├── connection.test.ts         # Connection pooling, transactions
│   ├── player-repository.test.ts  # Player CRUD operations
│   └── party-repository.test.ts   # Party/lobby operations
├── api/                    # API endpoint tests
│   └── auth.test.ts               # Authentication & JWT
├── battle/                 # Battle system unit tests
│   └── battle.test.ts
├── multiplayer/            # Multiplayer integration tests
│   ├── party-api.test.ts
│   ├── socketio-multiplayer.test.ts
│   └── e2e-multiplayer.test.ts
└── ui/                     # UI component tests
    └── multiplayer-lobby.test.ts
```

---

## Running Tests

### Quick Commands

```bash
# Run all tests
npm test

# Run specific test project
npm run test:database     # Database tests
npm run test:api          # API tests
npm run test:e2e          # E2E tests
npm run test:socketio     # Socket.IO tests

# Run with UI (interactive mode)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# View test report
npm run test:report
```

### Using Batch Scripts (Windows)

```bash
# Run all tests
test-playwright.bat

# Run specific category
test-playwright.bat database
test-playwright.bat api
test-playwright.bat auth

# Interactive UI mode
test-playwright.bat ui

# View report
test-playwright.bat report
```

---

## Test Projects

Playwright is configured with multiple test projects for different test types:

### 1. Database Tests (`database-tests`)

**Purpose:** Test database connection, repositories, and queries

**Tests Include:**
- Connection pooling and health checks
- Transaction commit/rollback
- SQL injection prevention
- Player CRUD operations
- Party/lobby management
- Member operations
- Stats calculations

**Run Command:**
```bash
npm run test:database
```

**Example Test:**
```typescript
test('should create a new player', async () => {
  const player = await playerRepo.createPlayer({
    player_id: 'test123',
    username: 'TestUser',
    email: 'test@example.com'
  });

  expect(player).toBeDefined();
  expect(player.username).toBe('TestUser');
});
```

---

### 2. API Tests (`api-tests`)

**Purpose:** Test REST API endpoints and authentication

**Tests Include:**
- JWT token generation and verification
- Token expiration and refresh
- Protected route access control
- Session management
- CORS handling

**Run Command:**
```bash
npm run test:api
```

**Example Test:**
```typescript
test('should generate valid access token', () => {
  const token = JWTService.generateAccessToken({
    userId: 'user123',
    username: 'testuser',
    role: 'player'
  });

  expect(token).toBeDefined();
  const decoded = JWTService.verifyAccessToken(token);
  expect(decoded.userId).toBe('user123');
});
```

---

### 3. Multiplayer Tests (`multiplayer-*`)

**Purpose:** Test multiplayer functionality and real-time features

**Tests Include:**
- Party creation and joining
- Socket.IO events
- Player synchronization
- Chat messaging
- Real-time updates

**Run Command:**
```bash
npm run test:e2e
npm run test:socketio
```

---

### 4. UI Tests (`multiplayer-ui`)

**Purpose:** Test UI components and user interactions

**Tests Include:**
- Lobby interface
- Character creation
- Battle UI
- Responsive design

**Run Command:**
```bash
npm run test:ui-tests
```

---

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeAll(async () => {
    // Setup before all tests
  });

  test.beforeEach(async () => {
    // Setup before each test
  });

  test('should do something', async () => {
    // Test implementation
    expect(result).toBe(expected);
  });

  test.afterEach(async () => {
    // Cleanup after each test
  });

  test.afterAll(async () => {
    // Cleanup after all tests
  });
});
```

### Database Test Example

```typescript
import { DatabaseConnection } from '../../src/database/connection';
import { PlayerRepository } from '../../src/database/repositories/player.repository';

test.describe('Player Operations', () => {
  let dbConnection: DatabaseConnection;
  let playerRepo: PlayerRepository;

  test.beforeAll(async () => {
    dbConnection = DatabaseConnection.getInstance();
    playerRepo = new PlayerRepository();
  });

  test.afterAll(async () => {
    await dbConnection.close();
  });

  test('should create player', async () => {
    const player = await playerRepo.createPlayer({
      player_id: 'test123',
      username: 'TestUser',
      email: 'test@example.com'
    });

    expect(player.username).toBe('TestUser');
  });
});
```

### API Test Example

```typescript
test('should require authentication', async ({ request }) => {
  const response = await request.get('http://localhost:3000/api/players/me', {
    headers: {
      'Authorization': 'Bearer invalid-token'
    }
  });

  expect(response.status()).toBe(401);
});
```

---

## Best Practices

### 1. Test Isolation

✅ **Do:** Clean up test data after each test
```typescript
test.afterEach(async () => {
  await dbConnection.query('DELETE FROM test_table WHERE id = $1', [testId]);
});
```

❌ **Don't:** Leave test data that affects other tests

---

### 2. Use Unique Identifiers

✅ **Do:** Generate unique IDs for each test
```typescript
import { v4 as uuidv4 } from 'uuid';

test.beforeEach(() => {
  testId = `test_${uuidv4()}`;
});
```

❌ **Don't:** Use hardcoded IDs that can cause conflicts

---

### 3. Descriptive Test Names

✅ **Do:** Write clear, specific test names
```typescript
test('should calculate win rate correctly when player has 7 victories and 3 defeats', async () => {
  // Test implementation
});
```

❌ **Don't:** Use vague names
```typescript
test('test stats', async () => {
  // What stats? How?
});
```

---

### 4. Test One Thing at a Time

✅ **Do:** Focus each test on a single behavior
```typescript
test('should create player with required fields', async () => {
  const player = await playerRepo.createPlayer({
    player_id: 'test',
    username: 'Test',
    email: 'test@example.com'
  });
  expect(player).toBeDefined();
});

test('should reject duplicate player_id', async () => {
  // Separate test for validation
});
```

❌ **Don't:** Test multiple unrelated behaviors in one test

---

### 5. Handle Async Operations

✅ **Do:** Use async/await properly
```typescript
test('should update player', async () => {
  const updated = await playerRepo.updatePlayer(id, { username: 'New' });
  expect(updated?.username).toBe('New');
});
```

❌ **Don't:** Forget to await promises
```typescript
test('should update player', async () => {
  playerRepo.updatePlayer(id, { username: 'New' }); // Missing await!
  // Test will pass but update may not complete
});
```

---

## Debugging

### Run Tests in UI Mode

```bash
npm run test:ui
```

**Features:**
- Interactive test explorer
- Step through tests
- Watch mode
- Time travel debugging

---

### Run Tests in Headed Mode

```bash
npm run test:headed
```

See the browser while tests run.

---

### Debug Specific Test

```bash
npx playwright test tests/database/player-repository.test.ts --debug
```

---

### View Test Traces

```bash
npx playwright show-trace trace.zip
```

---

### Screenshots and Videos

Failed tests automatically capture:
- **Screenshots** - Saved to `test-results/`
- **Videos** - Saved to `test-results/` (on failure)
- **Traces** - Full execution trace

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to `main`, `master`, or `develop`
- Pull requests

**Workflow:** `.github/workflows/ci.yml`

```yaml
- name: Run Playwright tests
  run: npm test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

---

### Local CI Simulation

```bash
# Run tests as CI would
CI=true npm test
```

**CI Mode Differences:**
- Retries failing tests (2 retries)
- Forbids `.only()` tests
- Uses fresh server instance

---

## Test Coverage

### Current Coverage

- ✅ **Database Layer:** 60+ tests
  - Connection pooling
  - Repositories (Player, Party, Session, Chat, Audit)
  - Transactions and rollbacks

- ✅ **Authentication:** 20+ tests
  - JWT generation and verification
  - Token refresh
  - Protected routes

- ✅ **Multiplayer:** 15+ tests
  - Party management
  - Socket.IO events
  - Real-time sync

- ✅ **UI Components:** 10+ tests
  - Lobby interface
  - Character creation
  - Battle system

**Total:** 105+ E2E and integration tests

---

## Troubleshooting

### Tests Can't Connect to Database

**Solution:**
```bash
# Start database containers
docker-compose up -d db redis

# Wait for readiness
timeout /t 10

# Run tests
npm test
```

---

### Port Already in Use

**Solution:**
```bash
# Kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in playwright.config.ts
baseURL: 'http://localhost:3001'
```

---

### Tests Timeout

**Solution:**

Edit `playwright.config.ts`:
```typescript
use: {
  timeout: 60000, // 60 seconds
}
```

---

### Database State Issues

**Solution:**

Reset test database:
```bash
reset-db.bat
```

---

## Additional Resources

- **[Playwright Documentation](https://playwright.dev/)** - Official docs
- **[Test Examples](../tests/)** - Browse existing tests
- **[Best Practices](https://playwright.dev/docs/best-practices)** - Playwright best practices

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:database` | Database tests only |
| `npm run test:api` | API tests only |
| `npm run test:ui` | Interactive UI mode |
| `npm run test:headed` | Run with visible browser |
| `npm run test:report` | View HTML report |
| `test-playwright.bat` | Windows batch runner |
| `test-playwright.bat database` | Database tests (Windows) |

---

**Happy Testing! 🎭**
