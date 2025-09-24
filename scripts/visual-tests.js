#!/usr/bin/env node
/**
 * Visual Testing Documentation Generator
 * Creates screenshots of all major components and states of the Backgammon game
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function createScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotsDir = './test-results/screenshots';
  await fs.mkdir(screenshotsDir, { recursive: true });
  
  console.log('📸 Starting visual documentation generation...');
  
  try {
    // Navigate to the game
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // 1. Main game board - desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-main-game-desktop.png'),
      fullPage: true 
    });
    console.log('✓ Desktop game board captured');
    
    // 2. Login modal
    await page.click('text=account_circle');
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-login-modal.png'),
      clip: { x: 0, y: 0, width: 800, height: 400 }
    });
    console.log('✓ Login modal captured');
    
    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // 3. Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-tablet-view.png'),
      fullPage: true 
    });
    console.log('✓ Tablet view captured');
    
    // 4. Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-mobile-view.png'),
      fullPage: true 
    });
    console.log('✓ Mobile view captured');
    
    // 5. Back to desktop for component tests
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // 6. Dice component
    const dice = page.locator('.dice');
    if (await dice.count() > 0) {
      await dice.screenshot({ 
        path: path.join(screenshotsDir, '05-dice-component.png')
      });
      console.log('✓ Dice component captured');
    }
    
    console.log('🎉 Visual documentation complete!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('❌ Error during screenshot generation:', error);
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  createScreenshots();
}

module.exports = { createScreenshots };