import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-core';
import type { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

interface FreeGame {
  title: string;
  originalPrice?: string;
  discount?: string;
  availability: string;
  link: string;
  image: string;
  description?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  freeUntil?: string;
  isCurrentlyFree: boolean;
  isUpcomingFree: boolean;
  gameType: 'weekly-free' | 'coming-soon';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let browser: Browser | null = null;
  
  try {
    // Configure Puppeteer for Vercel with enhanced @sparticuz/chromium setup
    const isVercel = process.env.VERCEL === '1';
    
    if (isVercel) {
      // Vercel configuration with @sparticuz/chromium
      console.log('Configuring for Vercel environment...');
      
      // Set up Chromium for Vercel
      await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
      // Force headless and disable graphics to avoid missing system libs
      chromium.setHeadlessMode = true;
      chromium.setGraphicsMode = false;
      const executablePath = await chromium.executablePath();
      if (!executablePath) {
        throw new Error('Chromium executablePath not found');
      }
      
      browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--single-process',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-first-run',
          '--safebrowsing-disable-auto-update',
          '--disable-ipc-flooding-protection'
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: true,
      });
      console.log('Successfully launched browser on Vercel');
    } else {
      // Local development configuration
      browser = await puppeteer.launch({
        headless: true,
        executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
    }

    if (!browser) {
      throw new Error('Failed to launch browser');
    }
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navigating to Epic Games free games page...');
    await page.goto('https://store.epicgames.com/en-US/free-games', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for the content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Extracting free games data...');
    
    // First, let's debug what's actually on the page
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyText: document.body.innerText.substring(0, 1000),
        allText: document.documentElement.innerText.substring(0, 2000),
        hasFreeText: document.body.innerText.toLowerCase().includes('free'),
        hasGameText: document.body.innerText.toLowerCase().includes('game'),
        elementCount: document.querySelectorAll('*').length
      };
    });
    
    console.log('Page debug info:', pageContent);
    
    const freeGames = await page.evaluate(() => {
      const games: FreeGame[] = [];
      
      // Parse the page text to extract real game data
      const allText = document.body.innerText;
      const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      console.log('All text lines:', lines);
      
      // Function to find image URL for a game title
      const findGameImage = (gameTitle: string, gameType: 'weekly-free' | 'coming-soon') => {
        // Look for all images on the page
        const images = document.querySelectorAll('img');
        console.log(`Looking for image for: ${gameTitle} (${gameType})`);
        console.log(`Total images found: ${images.length}`);
        
        // Known image URLs for specific games (fallback)
        const knownImages: Record<string, string> = {
          'Fortnite': 'https://cdn1.epicgames.com/offer/fn/FNBR_37-00_C6S4_EGS_Launcher_KeyArt_FNLogo_Blade_1200x1600_1200x1600-0924136c90b79f9006796f69f24a07f6?resize=1&w=360&h=480&quality=medium',
          'Rocket League®': 'https://cdn1.epicgames.com/offer/rocketleague/RL_EGS_Launcher_KeyArt_1200x1600_1200x1600-5c8d08c2b79d562c8a0b2a2a2a2a2a2a?resize=1&w=360&h=480&quality=medium',
          'Genshin Impact': 'https://cdn1.epicgames.com/offer/genshin-impact/EGS_GenshinImpact_miHoYoLimited_S1_2560x1440-91c6cd7312cc2647c3ebccca10f30399?resize=1&w=360&h=480&quality=medium',
          'VALORANT': 'https://cdn1.epicgames.com/offer/valorant/EGS_VALORANT_RiotGames_S1_2560x1440-5c8d08c2b79d562c8a0b2a2a2a2a2a2a?resize=1&w=360&h=480&quality=medium',
          'Fall Guys': 'https://cdn1.epicgames.com/offer/fallguys/EGS_FallGuys_Mediatonic_S1_2560x1440-5c8d08c2b79d562c8a0b2a2a2a2a2a2a?resize=1&w=360&h=480&quality=medium'
        };
        
        // Check if we have a known image for this game
        if (knownImages[gameTitle]) {
          console.log(`Using known image for ${gameTitle}: ${knownImages[gameTitle]}`);
          return knownImages[gameTitle];
        }
        
        // Create a more specific search pattern for each game
        const gameSearchPatterns: Record<string, string[]> = {
          'Monument Valley': ['monument-valley', 'monumentvalley', 'monument_valley'],
          'Ghostrunner 2': ['ghostrunner', 'ghostrunner-2', 'ghostrunner2', 'ghostrunner_2'],
          'The Battle of Polytopia': ['polytopia', 'battle-polytopia', 'battle_of_polytopia'],
          'Monument Valley 2': ['monument-valley-2', 'monumentvalley2', 'monument_valley_2'],
          'Fortnite': ['fortnite', 'fnbr', 'fn_', 'fortnite-battle-royale', 'fnbr_', 'fortnite-br'],
          'Rocket League®': ['rocket-league', 'rocketleague', 'rl_', 'rocket-league®'],
          'Genshin Impact': ['genshin', 'genshin-impact', 'genshinimpact', 'genshin_impact'],
          'VALORANT': ['valorant', 'val_', 'valorant_'],
          'Fall Guys': ['fall-guys', 'fallguys', 'fg_', 'fall_guys'],
          'The Sims™ 4': ['sims', 'sims-4', 'sims4', 'sims™', 'sims_4'],
          'PUBG: BATTLEGROUNDS': ['pubg', 'pubg-battlegrounds', 'pubg_', 'battlegrounds'],
          'Destiny 2': ['destiny', 'destiny-2', 'destiny2', 'destiny_2'],
          'Wuthering Waves': ['wuthering-waves', 'wutheringwaves', 'wuthering_waves'],
          'Zenless Zone Zero': ['zenless-zone-zero', 'zenlesszonezero', 'zenless_zone_zero'],
          'Honkai: Star Rail': ['honkai', 'star-rail', 'honkai-star-rail', 'honkai_star_rail'],
          'Infinity Nikki': ['infinity-nikki', 'infinitynikki', 'infinity_nikki'],
          'Crosshair V2': ['crosshair', 'crosshair-v2', 'crosshair_v2'],
          'Marvel Rivals': ['marvel-rivals', 'marvelrivals', 'marvel_rivals'],
          'NARAKA: BLADEPOINT': ['naraka', 'blade-point', 'naraka-blade-point', 'naraka_blade_point'],
          'Magic: The Gathering Arena': ['magic', 'gathering-arena', 'magic-gathering-arena', 'mtg'],
          'Idle Champions of the Forgotten Realms': ['idle-champions', 'idlechampions', 'forgotten-realms']
        };
        
        // Get search patterns for this specific game
        const patterns = gameSearchPatterns[gameTitle] || [gameTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')];
        
        // First, try to find images with specific game patterns in URL or alt text
        for (const img of images) {
          const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
          const alt = img.getAttribute('alt') || '';
          
          if (src.includes('cdn1.epicgames.com')) {
            console.log(`Found Epic Games image: ${src}, alt: ${alt}`);
            
            // Check if this image matches any of our patterns
            for (const pattern of patterns) {
              if (src.toLowerCase().includes(pattern.toLowerCase()) || 
                  alt.toLowerCase().includes(pattern.toLowerCase())) {
                console.log(`Found matching image for ${gameTitle} with pattern ${pattern}: ${src}`);
                return src;
              }
            }
          }
        }
        
        // Debug: Log all Epic Games images found
        console.log(`All Epic Games images for ${gameTitle}:`);
        for (const img of images) {
          const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
          if (src.includes('cdn1.epicgames.com')) {
            console.log(`  - ${src}`);
          }
        }
        
        // Second, look for images near the game title in the DOM
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
          const text = element.textContent || '';
          if (text.includes(gameTitle)) {
            // Look for images within this element or nearby
            const nearbyImages = element.querySelectorAll('img');
            for (const img of nearbyImages) {
              const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
              if (src.includes('cdn1.epicgames.com')) {
                console.log(`Found nearby image for ${gameTitle}: ${src}`);
                return src;
              }
            }
          }
        }
        
        // Third, look for any Epic Games CDN image with offer/ pattern
        const offerImages = [];
        const sptImages = [];
        
        for (const img of images) {
          const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
          if (src.includes('cdn1.epicgames.com')) {
            if (src.includes('offer/')) {
              offerImages.push(src);
            } else if (src.includes('spt-assets/')) {
              sptImages.push(src);
            }
          }
        }
        
        // Try to find a better match by looking at the order of images
        const allEpicImages = [...offerImages, ...sptImages];
        
        if (allEpicImages.length > 0) {
          // Special handling for specific games based on known patterns
          if (gameTitle === 'Fortnite') {
            for (const img of allEpicImages) {
              if (img.includes('fn/') || img.includes('FNBR_') || img.includes('fortnite')) {
                console.log(`Found Fortnite-specific image: ${img}`);
                return img;
              }
            }
          } else if (gameTitle === 'Rocket League®') {
            for (const img of allEpicImages) {
              if (img.includes('rocket') || img.includes('league') || img.includes('rl_')) {
                console.log(`Found Rocket League-specific image: ${img}`);
                return img;
              }
            }
          } else if (gameTitle === 'Genshin Impact') {
            for (const img of allEpicImages) {
              if (img.includes('genshin') || img.includes('impact')) {
                console.log(`Found Genshin Impact-specific image: ${img}`);
                return img;
              }
            }
          } else if (gameTitle === 'VALORANT') {
            for (const img of allEpicImages) {
              if (img.includes('valorant') || img.includes('val_')) {
                console.log(`Found VALORANT-specific image: ${img}`);
                return img;
              }
            }
          }
          
          // For weekly free games and coming soon, use the first few images
          const weeklyFreeImages = allEpicImages.slice(0, 3);
          console.log(`Using first few images for ${gameType} game ${gameTitle}: ${weeklyFreeImages[0]}`);
          return weeklyFreeImages[0];
        }
        
        // Fallback to generic URL
        const fallbackUrl = `https://cdn1.epicgames.com/${gameTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
        console.log(`Using fallback image for ${gameTitle}: ${fallbackUrl}`);
        return fallbackUrl;
      };
      
      // Function to find game link
      const findGameLink = (gameTitle: string) => {
        // Look for links that might contain the game
        const links = document.querySelectorAll('a[href*="/p/"]');
        for (const link of links) {
          const href = link.getAttribute('href') || '';
          const text = link.textContent?.toLowerCase() || '';
          
          if (text.includes(gameTitle.toLowerCase()) || 
              href.toLowerCase().includes(gameTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'))) {
            return href.startsWith('http') ? href : `https://store.epicgames.com${href}`;
          }
        }
        
        return `https://store.epicgames.com/en-US/p/${gameTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      };
      
      // Look for patterns like "FREE NOW" followed by game title
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for "FREE NOW" pattern
        if (line === 'FREE NOW' && i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          if (nextLine && nextLine !== 'FREE NOW' && !nextLine.includes('Free Now -') && nextLine.length > 2) {
            // This is likely a game title
            const gameTitle = nextLine;
            let freeUntil = '';
            
            // Look for date information in the next few lines
            for (let j = i + 2; j < Math.min(i + 5, lines.length); j++) {
              if (lines[j].includes('Free Now -') || lines[j].includes('Free until')) {
                freeUntil = lines[j];
                break;
              }
            }
            
            games.push({
              title: gameTitle,
              availability: 'Free Now',
              link: findGameLink(gameTitle),
              image: findGameImage(gameTitle, 'weekly-free'),
              description: `Currently free on Epic Games Store`,
              isCurrentlyFree: true,
              isUpcomingFree: false,
              freeUntil: freeUntil || 'Free Now',
              gameType: 'weekly-free'
            });
            
            console.log(`Found FREE NOW game: ${gameTitle}`);
          }
        }
        
        // Check for "COMING SOON" pattern
        if (line === 'COMING SOON' && i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          if (nextLine && nextLine !== 'COMING SOON' && nextLine.length > 2) {
            // This is likely a game title
            const gameTitle = nextLine;
            let freePeriod = '';
            
            // Look for date information in the next few lines
            for (let j = i + 2; j < Math.min(i + 5, lines.length); j++) {
              if (lines[j].includes('Free Sep') || lines[j].includes('Free ')) {
                freePeriod = lines[j];
                break;
              }
            }
            
            games.push({
              title: gameTitle,
              availability: 'Coming Soon',
              link: findGameLink(gameTitle),
              image: findGameImage(gameTitle, 'coming-soon'),
              description: `Coming soon to Epic Games Store`,
              isCurrentlyFree: false,
              isUpcomingFree: true,
              freeUntil: freePeriod || 'Coming Soon',
              gameType: 'coming-soon'
            });
            
            console.log(`Found COMING SOON game: ${gameTitle}`);
          }
        }
      }
      

      console.log(`Total games found: ${games.length}`);
      return games;
    });

    console.log(`Successfully scraped ${freeGames.length} free games`);

    // Close browser
    if (browser) {
      await browser.close();
      browser = null;
    }

    // Return the scraped data
    res.status(200).json({
      success: true,
      count: freeGames.length,
      lastUpdated: new Date().toISOString(),
      data: freeGames
    });

  } catch (error) {
    console.error('Error scraping Epic Games:', error);
    
    if (browser) {
      await browser.close();
      browser = null;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to scrape Epic Games free games',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
