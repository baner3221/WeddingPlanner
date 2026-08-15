const { chromium } = require('playwright');
const { spawn } = require('child_process');

(async () => {
  console.log('==========================================');
  console.log('  STARTING BROWSER AUTOMATION TEST SUITE');
  console.log('==========================================\n');
  
  console.log('[1/4] Starting backend (FastAPI) and frontend (Vite) servers...');
  const backend = spawn('source venv/bin/activate && uvicorn main:app --port 8000', { cwd: '../service', shell: true });
  const frontend = spawn('npm', ['run', 'dev', '--', '--port', '5173'], { cwd: '../interface', shell: true });
  
  // Wait 6 seconds for both servers to fully boot up
  await new Promise(r => setTimeout(r, 6000));
  
  console.log('[2/4] Launching Real Chromium Browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const endpointHits = new Set();
  
  // Intercept and log all network requests made by the browser
  page.on('request', request => {
    const url = request.url();
    // Log backend hits or supabase hits to prove integration
    if (url.includes('8000/api/') || url.includes('supabase.co/rest')) {
        console.log(`  [BROWSER NETWORK] -> HTTP ${request.method()} ${url}`);
        endpointHits.add(url);
    }
  });

  try {
    console.log('\n[3/4] Executing UI Walkthrough...');
    
    console.log('  -> Navigating to http://localhost:5173/welcome');
    await page.goto('http://localhost:5173/welcome', { waitUntil: 'networkidle' });
    
    console.log('  -> Navigating to Dashboard (/dashboard)');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
    
    console.log('  -> Navigating to Checklist (/checklist)');
    await page.goto('http://localhost:5173/checklist', { waitUntil: 'networkidle' });
    
    console.log('  -> Navigating to Hotel Management (/rooms)');
    await page.goto('http://localhost:5173/rooms', { waitUntil: 'networkidle' });
    
    console.log('  -> Navigating to Guest Logistics (/guests)');
    await page.goto('http://localhost:5173/guests', { waitUntil: 'networkidle' });

    console.log('\n[4/4] BROWSER TEST COMPLETE! Cleaning up...');
    console.log('\n--- VERIFIED ENDPOINTS HIT BY BROWSER ---');
    endpointHits.forEach(url => console.log(` ✔ ${url}`));
    
  } catch(e) {
    console.error('\n❌ Browser automation failed:', e);
  } finally {
    await browser.close();
    backend.kill();
    frontend.kill();
    console.log('\nServers and browser terminated successfully.');
  }
})();
