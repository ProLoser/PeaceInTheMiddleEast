# Testing Documentation

This directory contains comprehensive tests with screenshots for the Backgammon application.

## Test Structure

### Visual Regression Tests
- `main-game.spec.ts` - Tests the main game board layout and components
- `avatar.spec.ts` - Tests avatar component in different states
- `dialogues.spec.ts` - Tests modal dialogues (login, friends, chat, profile)
- `responsive.spec.ts` - Tests responsive design across different screen sizes
- `game-interactions.spec.ts` - Tests game piece interactions and dice rolling

## Screenshot Categories

### 1. Main Game Views
- **Desktop View** (1200x800): Full game board with all components visible
- **Tablet View** (768x1024): Portrait orientation optimized for tablets
- **Mobile View** (375x667): Mobile-optimized layout

### 2. Component Screenshots
- **Login Modal**: Authentication options (email, Google, guest)
- **Dice Component**: Game dice in various states
- **Game Board**: Individual board sections and pieces
- **Avatar**: User avatars in different states

### 3. Interactive States
- **Initial State**: Game board on first load
- **Piece Selected**: Game pieces with selection highlighting
- **Dice Rolled**: Before and after dice roll animations

## Running Tests

### Prerequisites
```bash
npm install
npm run build
```

### Start the Development Server
```bash
npm run preview
```

### Run All Tests
```bash
npm run test
```

### Run Tests with Visual Interface
```bash
npm run test:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
```

### Debug Tests
```bash
npm run test:debug
```

### Generate Visual Documentation
```bash
node scripts/visual-tests.js
```

## Test Configuration

The tests are configured via `playwright.config.ts`:
- Tests run against `http://localhost:4173` (preview server)
- Screenshots are captured on test failures
- Tests run on multiple browsers/devices:
  - Desktop Chrome
  - Mobile Chrome (Pixel 5)
  - Mobile Safari (iPhone 12)

## Screenshots Storage

- Test screenshots: `test-results/`
- Visual documentation: `test-results/screenshots/`
- Baseline images for comparison: `tests/screenshots/`

## Best Practices

1. **Wait for Network Idle**: Always wait for `networkidle` state before taking screenshots
2. **Consistent Viewport**: Use standard viewport sizes for comparable results
3. **Handle Dynamic Content**: Mock or handle time-based and random content
4. **Full Page Screenshots**: Use `fullPage: true` for complete layouts
5. **Component Screenshots**: Take focused shots of individual components

## Debugging Failed Tests

1. Check the HTML report: `npx playwright show-report`
2. Review failed screenshot comparisons
3. Update baselines if changes are intentional: `npx playwright test --update-snapshots`

## CI/CD Integration

Tests are designed to run in CI environments:
- Uses headless browsers by default
- Generates HTML reports
- Captures screenshots on failures
- Retries flaky tests automatically