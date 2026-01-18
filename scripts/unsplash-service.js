/**
 * 📸 MoneyWithSense - Unsplash Service
 *
 * Integration with Unsplash API for real finance and lifestyle photos
 * Free tier: 50 requests/hour, 5000/month
 */

// ===== CONFIGURATION =====
const CONFIG = {
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
  baseUrl: 'https://api.unsplash.com',
  defaultPerPage: 10
};

/**
 * Search photos on Unsplash
 * @param {string} query - Search terms
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of photos
 */
export async function searchPhotos(query, options = {}) {
  const {
    perPage = 7,
    orientation = 'portrait',
    orderBy = 'relevant'
  } = options;
  
  if (!CONFIG.accessKey) {
    console.warn('⚠️ UNSPLASH_ACCESS_KEY not configured - using placeholders');
    return getPlaceholderPhotos(perPage);
  }
  
  const params = new URLSearchParams({
    query,
    per_page: perPage,
    orientation,
    order_by: orderBy
  });
  
  try {
    const response = await fetch(
      `${CONFIG.baseUrl}/search/photos?${params}`,
      {
        headers: {
          'Authorization': `Client-ID ${CONFIG.accessKey}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map(photo => ({
      id: photo.id,
      url: photo.urls.regular, // 1080px
      urlFull: photo.urls.full,
      urlSmall: photo.urls.small,
      width: photo.width,
      height: photo.height,
      description: photo.description || photo.alt_description,
      author: {
        name: photo.user.name,
        username: photo.user.username,
        link: photo.user.links.html
      },
      downloadLink: photo.links.download_location,
      color: photo.color
    }));
    
  } catch (error) {
    console.error('❌ Unsplash error:', error.message);
    return getPlaceholderPhotos(perPage);
  }
}

/**
 * Search for finance-related photos
 * @param {Array<string>} keywords - Keywords from article
 * @returns {Promise<Array>} Photos optimized for content
 */
export async function searchFinancePhotos(keywords = []) {
  // Build optimized query for personal finance
  const baseQueries = [
    'money saving',
    'financial planning',
    'investment growth',
    'budget notebook',
    'piggy bank savings'
  ];
  
  // Combine with specific article keywords
  const customQuery = keywords.length > 0 
    ? keywords.slice(0, 3).join(' ') + ' finance'
    : baseQueries[Math.floor(Math.random() * baseQueries.length)];
  
  console.log(`📸 Unsplash search: "${customQuery}"`);
  
  const photos = await searchPhotos(customQuery, {
    perPage: 10,
    orientation: 'portrait'
  });
  
  // If few photos, add generic search
  if (photos.length < 7) {
    const morePhotos = await searchPhotos('personal finance money', {
      perPage: 7 - photos.length,
      orientation: 'portrait'
    });
    photos.push(...morePhotos);
  }
  
  return photos.slice(0, 7);
}

/**
 * Get a single photo for keyword
 */
export async function getPhotoForSlide(keyword, slideType = 'content') {
  // Specific queries for slide type
  const queryMap = {
    'hook': `${keyword} money finance`,
    'content': `${keyword} personal finance`,
    'cta': 'success achievement celebration'
  };
  
  const query = queryMap[slideType] || `${keyword} finance`;
  const photos = await searchPhotos(query, { perPage: 3 });
  
  return photos[0] || null;
}

/**
 * Placeholder photos when Unsplash not available
 */
function getPlaceholderPhotos(count) {
  const placeholders = [
    {
      id: 'placeholder-1',
      url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1080',
      description: 'Financial planning workspace',
      author: { name: 'Unsplash', username: 'unsplash' },
      color: '#1a365d'
    },
    {
      id: 'placeholder-2',
      url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1080',
      description: 'Piggy bank savings',
      author: { name: 'Unsplash', username: 'unsplash' },
      color: '#0c4a6e'
    },
    {
      id: 'placeholder-3',
      url: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1080',
      description: 'Dollar bills',
      author: { name: 'Unsplash', username: 'unsplash' },
      color: '#0284c7'
    },
    {
      id: 'placeholder-4',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080',
      description: 'Financial charts',
      author: { name: 'Unsplash', username: 'unsplash' },
      color: '#0369a1'
    },
    {
      id: 'placeholder-5',
      url: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=1080',
      description: 'Calculator and documents',
      author: { name: 'Unsplash', username: 'unsplash' },
      color: '#1e40af'
    },
    {
      id: 'placeholder-6',
      url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080',
      description: 'Stock market display',
      author: { name: 'Unsplash', username: 'unsplash' },
      color: '#c2410c'
    },
    {
      id: 'placeholder-7',
      url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1080',
      description: 'Investment growth',
      author: { name: 'Unsplash', username: 'unsplash' },
      color: '#059669'
    }
  ];
  
  return placeholders.slice(0, count);
}

/**
 * Trigger download tracking for Unsplash (required by ToS)
 */
export async function trackDownload(downloadLink) {
  if (!CONFIG.accessKey || !downloadLink) return;
  
  try {
    await fetch(downloadLink, {
      headers: {
        'Authorization': `Client-ID ${CONFIG.accessKey}`
      }
    });
  } catch (error) {
    // Silently fail - not critical
  }
}

/**
 * Test Unsplash connection
 */
export async function testConnection() {
  console.log('\n📸 Testing Unsplash connection...\n');
  
  if (!CONFIG.accessKey) {
    console.log('⚠️ UNSPLASH_ACCESS_KEY not configured');
    console.log('   Use: export UNSPLASH_ACCESS_KEY=your_key');
    return false;
  }
  
  try {
    const photos = await searchPhotos('personal finance money', { perPage: 3 });
    
    console.log(`✅ Connection OK - ${photos.length} photos found\n`);
    
    photos.forEach((photo, i) => {
      console.log(`${i + 1}. ${photo.description || 'No description'}`);
      console.log(`   📷 by ${photo.author.name}`);
      console.log(`   🔗 ${photo.url.substring(0, 50)}...`);
      console.log('');
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// CLI
if (process.argv[1]?.includes('unsplash-service')) {
  testConnection();
}

export default {
  searchPhotos,
  searchFinancePhotos,
  getPhotoForSlide,
  trackDownload,
  testConnection
};
