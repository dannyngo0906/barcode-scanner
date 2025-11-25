/**
 * Script này dùng để copy/paste vào Browser Console khi đã login vào NocoDB
 * Nó sẽ tự động tìm và copy token vào clipboard
 */

(function() {
  console.clear();
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: cyan');
  console.log('%c  🔍 NocoDB Token Finder', 'color: cyan; font-size: 20px; font-weight: bold');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: cyan');
  console.log('');

  let token = null;
  let source = '';

  // Method 1: Try localStorage
  console.log('🔍 Checking localStorage...');
  token = localStorage.getItem('nc_token');
  if (token) {
    source = 'localStorage.nc_token';
    console.log('%c✅ Found in localStorage!', 'color: green');
  }

  // Method 2: Try nc_auth in localStorage
  if (!token) {
    console.log('🔍 Checking localStorage (nc_auth)...');
    token = localStorage.getItem('nc_auth');
    if (token) {
      source = 'localStorage.nc_auth';
      console.log('%c✅ Found in localStorage (nc_auth)!', 'color: green');
    }
  }

  // Method 3: Try cookies
  if (!token) {
    console.log('🔍 Checking cookies...');
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const trimmed = cookie.trim();

      // Try xc-auth cookie
      if (trimmed.startsWith('xc-auth=')) {
        token = trimmed.substring(8);
        source = 'cookie.xc-auth';
        console.log('%c✅ Found in cookies (xc-auth)!', 'color: green');
        break;
      }

      // Try nc_token cookie
      if (trimmed.startsWith('nc_token=')) {
        token = trimmed.substring(9);
        source = 'cookie.nc_token';
        console.log('%c✅ Found in cookies (nc_token)!', 'color: green');
        break;
      }
    }
  }

  // Method 4: Try sessionStorage
  if (!token) {
    console.log('🔍 Checking sessionStorage...');
    token = sessionStorage.getItem('nc_token');
    if (token) {
      source = 'sessionStorage.nc_token';
      console.log('%c✅ Found in sessionStorage!', 'color: green');
    }
  }

  // Method 5: Try to extract from any local storage key containing 'token' or 'auth'
  if (!token) {
    console.log('🔍 Deep scanning localStorage...');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth'))) {
        const value = localStorage.getItem(key);
        if (value && value.length > 20) {
          console.log(`   Found potential token in: ${key}`);
          token = value;
          source = `localStorage.${key}`;
          console.log('%c✅ Found in localStorage scan!', 'color: green');
          break;
        }
      }
    }
  }

  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: cyan');

  if (token) {
    // Clean token (remove quotes if any)
    token = token.replace(/^["']|["']$/g, '');

    console.log('%c✅ TOKEN FOUND!', 'color: green; font-size: 18px; font-weight: bold');
    console.log('');
    console.log('%cSource:', 'color: blue; font-weight: bold', source);
    console.log('%cToken preview:', 'color: blue; font-weight: bold',
      `${token.substring(0, 15)}...${token.substring(token.length - 10)}`);
    console.log('%cToken length:', 'color: blue; font-weight: bold', token.length, 'characters');
    console.log('');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: green');
    console.log('%cFull token (copy this):', 'color: orange; font-size: 14px; font-weight: bold');
    console.log('%c' + token, 'color: white; background: black; padding: 10px; font-family: monospace');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: green');
    console.log('');
    console.log('%c📋 Copy to .env file:', 'color: orange; font-weight: bold; font-size: 14px');
    console.log('%cNOCODB_TOKEN=' + token, 'color: white; background: #2d2d2d; padding: 10px; font-family: monospace; font-size: 12px');
    console.log('');

    // Try to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(token)
        .then(() => {
          console.log('%c✅ TOKEN COPIED TO CLIPBOARD!', 'color: green; font-size: 16px; font-weight: bold');
          console.log('%cPaste it into your .env file (line 9)', 'color: yellow');

          // Show alert
          alert('✅ Token copied to clipboard!\n\nPaste it into .env file:\nNOCODB_TOKEN=' + token.substring(0, 20) + '...');
        })
        .catch((err) => {
          console.log('%c⚠️  Could not auto-copy. Please copy manually.', 'color: orange');
        });
    } else {
      console.log('%c⚠️  Clipboard API not available. Please copy manually.', 'color: orange');

      // Fallback: select and prompt to copy
      const tokenDiv = document.createElement('div');
      tokenDiv.textContent = token;
      tokenDiv.style.position = 'absolute';
      tokenDiv.style.left = '-9999px';
      document.body.appendChild(tokenDiv);

      try {
        const range = document.createRange();
        range.selectNode(tokenDiv);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        console.log('%c✅ Token selected! Press Ctrl+C to copy.', 'color: green');
        alert('Token is ready! Press Ctrl+C to copy it.');
      } catch (err) {
        console.log('%c❌ Auto-copy failed. Please copy manually from above.', 'color: red');
      }

      document.body.removeChild(tokenDiv);
    }

  } else {
    console.log('%c❌ NO TOKEN FOUND!', 'color: red; font-size: 18px; font-weight: bold');
    console.log('');
    console.log('%cPossible reasons:', 'color: orange; font-weight: bold');
    console.log('  1. You are not logged in to NocoDB');
    console.log('  2. Token is stored differently in this NocoDB version');
    console.log('  3. You need to create a token from Account Settings > API Tokens');
    console.log('');
    console.log('%cWhat to do:', 'color: cyan; font-weight: bold');
    console.log('  1. Make sure you are logged in: https://db.salesai.vn');
    console.log('  2. Go to Account Settings (click avatar) > API Tokens');
    console.log('  3. Create a new token for base: pc6dn5x2psu1vsz');
    console.log('  4. Copy the token and paste into .env file');
  }

  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: cyan');
  console.log('');

  return token;
})();
