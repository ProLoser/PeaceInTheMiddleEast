# Copilot Instructions for Backgammon.Family

## Project Overview
This is an open-source backgammon game built with React, TypeScript, and Firebase. The project aims to connect people across cultures and generations through a shared love of backgammon (SheshBesh).

**Live Site:** https://backgammon.family

## Technology Stack
- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** Styled Components + CSS
- **Backend:** Firebase (Firestore, Authentication, Hosting, Functions)
- **Internationalization:** i18next with auto-translation
- **State Management:** React hooks and Firebase real-time updates
- **Package Manager:** Yarn (v1.22.22)
- **Node Version:** 20.19.5

## Project Structure
```
/
├── src/               # Main application source code
│   ├── Board/        # Game board components (Dice, Piece, Point, Toolbar)
│   ├── Dialogues/    # Modal dialogs and UI overlays
│   ├── Types.ts      # TypeScript type definitions
│   ├── Utils.ts      # Utility functions
│   ├── firebase.config.ts  # Firebase configuration
│   └── i18n.ts       # Internationalization setup
├── functions/        # Firebase Cloud Functions
├── public/           # Static assets
└── .github/          # GitHub workflows and configurations
```

## Development Commands
- `yarn` - Install dependencies
- `yarn start` or `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn tsc` - Run TypeScript compiler check
- `yarn lint` - Run ESLint
- `yarn preview` - Preview production build

## Coding Standards
1. **TypeScript:** Use strict mode with proper type annotations
2. **React:** Functional components with hooks (no class components)
3. **Styling:** Use styled-components for component-specific styles, CSS files for global styles
4. **Linting:** Follow ESLint rules configured in the project
5. **File Naming:** PascalCase for component files (.tsx), camelCase for utilities (.ts)
6. **Imports:** Use ES6 module imports, keep imports organized

## Key Features
- Real-time multiplayer using Firebase Firestore
- Progressive Web App (PWA) support
- Internationalization with automatic translation
- Mobile-first responsive design
- No authentication required for basic gameplay
- Firebase authentication for user profiles and game history

## Firebase Integration
- **Firestore:** Real-time game state synchronization
- **Authentication:** FirebaseUI for user sign-in
- **Functions:** Backend logic in the `functions/` directory
- **Hosting:** Deployed to Firebase Hosting

## Guidelines for AI Assistance
1. **Keep it Simple:** The project emphasizes simplicity - no ads, no complexity, easy to use
2. **Mobile-First:** Always consider mobile, tablet, and desktop experiences
3. **Accessibility:** Code should be accessible (tested with grandparents in mind)
4. **Multiplayer:** Consider real-time synchronization when modifying game logic
5. **No Breaking Changes:** Maintain backward compatibility with existing games
6. **Type Safety:** Always use TypeScript types, avoid `any` when possible
7. **Performance:** Consider Firebase read/write costs and optimize queries

## Testing & Validation
- Build the project with `yarn build` before submitting changes
- Run `yarn tsc` to check for TypeScript errors
- Run `yarn lint` to ensure code style compliance
- Test on mobile viewport sizes (responsive design is critical)
- Verify Firebase integration works locally before pushing

## Common Patterns
- Use Firebase hooks for real-time data: `useEffect` with Firestore listeners
- Leverage i18next for all user-facing text: `useTranslation()` hook
- Component state managed with `useState` and `useEffect`
- Styled components follow the pattern: `const StyledComponent = styled.div\`...\``

## Special Considerations
- **Game Rules:** SheshBesh backgammon rules (traditional variant)
- **Notifications:** Push notifications for turn-based gameplay
- **Translations:** Support for multiple languages to connect families
- **Privacy:** No data collection beyond what's needed for gameplay
