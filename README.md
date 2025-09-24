# Open Source BackGammon

Personal passion side project that came from an idea on how to connect the Turkish and Israeli sides of my family through common hobbies.

I use this project to test out the latest AI tools. Open to feedback.

Play for free with anyone, no registration or installation required.

https://backgammon.family

## Goals
- [x] Works on phone, tablet, and computers
- [x] Simple SheshBesh Backgammon (rules)
- [x] My safta (grandma) can use it (intuitive ui)
- [x] My father can play with my grandmother (multiplayer)
- [x] I can play with my father (notifications)
- [ ] I can play with my father-in-law (translations)
- [x] No ads, no fee, no complexity

## AI Tools Tested
This wasn't originally a goal but ended up being a great way to test AI 

<img width="920" alt="image" src="https://github.com/ProLoser/PeaceInTheMiddleEast/assets/67395/d359b701-2eed-482c-9b23-055c57d980a5">
<img width="920" alt="image" src="https://github.com/ProLoser/PeaceInTheMiddleEast/assets/67395/5dc9a48c-6dfc-473d-9ce4-85ff62057794">

- [x] GitHub Codespaces
- [x] GitHub Copilot
- [x] studio.firebase.google.com
- [x] Jules.google.com
- [x] aistudio.google.com
- [x] cursor
- [x] Amazon q
- [x] ChatGPT 
## Setup
1. `yarn`
2. `yarn start`

## Testing
This project includes comprehensive visual regression testing with screenshots using Playwright.

### Running Tests
```bash
# Build and start preview server
npm run build
npm run preview

# Run all tests
npm test

# Run tests with visual UI
npm run test:ui

# Generate visual documentation
npm run test:visual
```

### Test Coverage
- ✅ **Main Game Board**: Desktop, tablet, and mobile responsive layouts
- ✅ **Login Modal**: Authentication options with visual verification
- ✅ **Game Components**: Dice, pieces, and board interactions
- ✅ **Cross-browser**: Chrome, Mobile Chrome, Mobile Safari
- ✅ **Screenshot Comparisons**: Automatic visual regression detection

See `tests/README.md` for detailed testing documentation.

### Visual Test Results
![Main Game Board](https://github.com/user-attachments/assets/d4247042-ee57-45a2-b925-fa5a3cd36c3d)
*Desktop view showing the complete Backgammon board*

![Login Modal](https://github.com/user-attachments/assets/c71f8648-c181-4d4f-858a-6131ccd35945)
*Login modal with authentication options*

![Tablet View](https://github.com/user-attachments/assets/4ce114e3-9ce9-416f-a844-aad9bd460ded)
*Tablet portrait orientation - responsive design*
