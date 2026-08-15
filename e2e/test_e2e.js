const { chromium } = require('playwright');
const { spawn } = require('child_process');

(async () => {
  console.log('Starting frontend server...');
  const frontend = spawn('npm', ['run', 'dev', '--', '--port', '5173'], { cwd: '../interface' });
  
  // Wait 5 seconds for vite to start
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('Launching Playwright...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  
  const artifactDir = '/Users/neelanjanbanerjee/.gemini/antigravity-ide/brain/f7c05883-e4b6-4b5e-82bb-c34ab9019ed9';
  
  try {
    console.log('Navigating to /welcome...');
    await page.goto('http://localhost:5173/welcome');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${artifactDir}/walkthrough_welcome.png` });
    console.log('Saved walkthrough_welcome.png');
    
    console.log('Clicking Get Started...');
    await page.locator('text=Start Planning Free').first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${artifactDir}/walkthrough_signup.png` });
    console.log('Saved walkthrough_signup.png');
    
    console.log('Filling out signup...');
    // The inputs don't have standard test-ids, so we'll use placeholder or type
    await page.fill('input[type="text"]', 'Test User');
    await page.fill('input[type="email"]', `test_${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard or error toast
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${artifactDir}/walkthrough_dashboard.png` });
    console.log('Saved walkthrough_dashboard.png');
    
    console.log('Testing Hotel Management (Rooms)...');
    await page.goto('http://localhost:5173/rooms');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${artifactDir}/walkthrough_rooms.png` });
    console.log('Saved walkthrough_rooms.png');
    
  } catch(e) {
    console.error('Error during walkthrough:', e);
  } finally {
    await browser.close();
    frontend.kill();
    console.log('Done.');
  }
})();
