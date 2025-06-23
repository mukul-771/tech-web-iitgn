const url = 'https://firebasestorage.googleapis.com/v0/b/tech-website-prod.firebasestorage.app/o/team/iitgnhacks-2024/ChatGPT Image May 28, 2025, 10_30_52 PM.png?alt=media&token=f63bfc63-037c-4749-92a9-225f2832e87f';

function sanitizeFirebaseUrl(url) {
  if (!url) return '';
  
  try {
    if (url.includes('firebasestorage.googleapis.com')) {
      let processedUrl = url;
      if (url.includes('%2F') || url.includes('%3A') || url.includes('%3F') || url.includes('%3D')) {
        processedUrl = decodeURIComponent(url);
      }
      
      const urlObj = new URL(processedUrl);
      const pathParts = urlObj.pathname.split('/');
      const encodedPath = pathParts.map(part => 
        part === '' ? '' : encodeURIComponent(decodeURIComponent(part))
      ).join('/');
      urlObj.pathname = encodedPath;
      
      if (!urlObj.searchParams.has('alt') || urlObj.searchParams.get('alt') !== 'media') {
        urlObj.searchParams.set('alt', 'media');
      }
      
      return urlObj.toString();
    }
    
    return url;
  } catch (error) {
    console.error('Error:', error);
    return url || '';
  }
}

const sanitized = sanitizeFirebaseUrl(url);
console.log('Original:', url);
console.log('Sanitized:', sanitized);
