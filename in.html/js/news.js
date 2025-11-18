// ======================================
// RSS FEEDS CONFIGURATION
// ======================================
const RSS_FEEDS = {
    tech: [
        'https://www.theverge.com/rss/index.xml',
        'https://www.wired.com/feed/rss',
        'https://techcrunch.com/feed/',
        'https://www.engadget.com/rss.xml',
        'https://www.techradar.com/rss',
        'https://arstechnica.com/feed/',
        'https://www.cnet.com/rss/news/',
        'https://www.zdnet.com/news/rss.xml'
    ],
    finance: [
        'https://www.cnbc.com/id/100727362/device/rss/rss.html',
        'https://feeds.bloomberg.com/markets/news.rss',
        'https://www.marketwatch.com/rss/topstories',
        'https://finance.yahoo.com/news/rssindex',
        'https://www.investing.com/rss/news.rss',
        'https://seekingalpha.com/market_currents.xml',
        'https://www.fool.com/feeds/index.aspx'
    ],
    gambling: [
        'https://www.casino.org/news/feed/',
        'https://www.pokernews.com/news/feed',
        'https://www.onlinecasinoreviewer.com/feed/',
        'https://www.casino.org/blog/feed/',
        'https://www.cardplayer.com/poker-news/rss-feed'
    ],
    fashion: [
        'https://www.vogue.com/feed/rss',
        'https://www.harpersbazaar.com/rss/all.xml/',
        'https://wwd.com/feed/',
        'https://fashionista.com/feed',
        'https://www.refinery29.com/en-us/rss.xml'
    ],
    lifestyle: [
        'https://www.bonappetit.com/feed/rss',
        'https://www.architecturaldigest.com/feed/rss',
        'https://www.gq.com/feed/rss',
        'https://www.menshealth.com/rss/all.xml/',
        'https://www.womenshealthmag.com/rss/all.xml/'
    ]
};

// ======================================
// PLACEHOLDER CONTENT
// ======================================
const PLACEHOLDER_CONTENT = {
    tech: [
        {
            title: 'Latest Tech Innovations Transform Digital Landscape',
            content: 'Technology companies unveil groundbreaking innovations across AI, cloud computing, and consumer electronics. Industry leaders announce strategic partnerships and product launches.',
            excerpt: 'Technology companies unveil groundbreaking innovations across AI, cloud computing, and consumer electronics...',
            external_url: 'https://techcrunch.com',
            image_url: 'https://placehold.co/600x400/16162a/00d4ff?text=Tech+News',
            published_at: new Date().toISOString(),
            section: 'tech',
            category: 'news',
            quality_score: 90
        },
        {
            title: 'AI and Machine Learning Advances Continue',
            content: 'Artificial intelligence research reaches new milestones with improved natural language processing and computer vision capabilities. Tech giants invest billions in AI development.',
            excerpt: 'Artificial intelligence research reaches new milestones with improved capabilities...',
            external_url: 'https://theverge.com',
            image_url: 'https://placehold.co/600x400/16162a/00d4ff?text=AI+News',
            published_at: new Date().toISOString(),
            section: 'tech',
            category: 'ai',
            quality_score: 88
        }
    ],
    finance: [
        {
            title: 'Global Markets React to Economic Indicators',
            content: 'Financial markets worldwide show movements as investors analyze economic data and central bank policies. Analysts provide insights on market trends and investment opportunities.',
            excerpt: 'Financial markets worldwide show movements as investors analyze economic data...',
            external_url: 'https://cnbc.com',
            image_url: 'https://placehold.co/600x400/16162a/00ff88?text=Finance+News',
            published_at: new Date().toISOString(),
            section: 'finance',
            category: 'markets',
            quality_score: 87
        },
        {
            title: 'Investment Strategies for Changing Markets',
            content: 'Financial advisors share strategies for portfolio diversification and risk management. Experts discuss asset allocation and long-term investment approaches.',
            excerpt: 'Financial advisors share strategies for portfolio diversification and risk management...',
            external_url: 'https://marketwatch.com',
            image_url: 'https://placehold.co/600x400/16162a/00ff88?text=Investment+News',
            published_at: new Date().toISOString(),
            section: 'finance',
            category: 'investing',
            quality_score: 85
        }
    ],
    gambling: [
        {
            title: 'Casino Industry Embraces Digital Transformation',
            content: 'Gaming operators integrate advanced technology platforms to enhance player experiences. Online gambling markets expand with regulatory approvals in multiple jurisdictions.',
            excerpt: 'Gaming operators integrate advanced technology platforms to enhance player experiences...',
            external_url: 'https://casino.org',
            image_url: 'https://placehold.co/600x400/16162a/ffd700?text=Casino+News',
            published_at: new Date().toISOString(),
            section: 'gambling',
            category: 'casino',
            quality_score: 84
        },
        {
            title: 'Sports Betting Markets Show Growth',
            content: 'Sports betting continues expansion across new markets with enhanced mobile platforms. Operators report increased user engagement and betting volumes.',
            excerpt: 'Sports betting continues expansion across new markets with enhanced mobile platforms...',
            external_url: 'https://casino.org',
            image_url: 'https://placehold.co/600x400/16162a/ffd700?text=Betting+News',
            published_at: new Date().toISOString(),
            section: 'gambling',
            category: 'sports',
            quality_score: 82
        }
    ],
    fashion: [
        {
            title: 'Fashion Week Highlights Latest Trends',
            content: 'Major fashion events showcase designer collections featuring innovative styles and sustainable materials. Industry leaders present spring collections with bold statements.',
            excerpt: 'Major fashion events showcase designer collections featuring innovative styles...',
            external_url: 'https://vogue.com',
            image_url: 'https://placehold.co/600x400/16162a/ff3399?text=Fashion+News',
            published_at: new Date().toISOString(),
            section: 'fashion',
            category: 'trends',
            quality_score: 86
        },
        {
            title: 'Sustainable Fashion Gains Momentum',
            content: 'Fashion brands commit to eco-friendly practices and ethical production methods. Consumers show increasing preference for sustainable clothing options.',
            excerpt: 'Fashion brands commit to eco-friendly practices and ethical production methods...',
            external_url: 'https://harpersbazaar.com',
            image_url: 'https://placehold.co/600x400/16162a/ff3399?text=Sustainable+Fashion',
            published_at: new Date().toISOString(),
            section: 'fashion',
            category: 'sustainability',
            quality_score: 83
        }
    ],
    lifestyle: [
        {
            title: 'Wellness Trends Shape Modern Living',
            content: 'Health and wellness experts share insights on balanced lifestyles, nutrition, and mental well-being. New approaches to holistic health gain popularity.',
            excerpt: 'Health and wellness experts share insights on balanced lifestyles and nutrition...',
            external_url: 'https://gq.com',
            image_url: 'https://placehold.co/600x400/16162a/ff8800?text=Wellness+News',
            published_at: new Date().toISOString(),
            section: 'lifestyle',
            category: 'wellness',
            quality_score: 85
        },
        {
            title: 'Travel Destinations for 2025',
            content: 'Travel experts recommend exciting destinations combining culture, adventure, and relaxation. Emerging locations offer unique experiences for modern travelers.',
            excerpt: 'Travel experts recommend exciting destinations combining culture and adventure...',
            external_url: 'https://bonappetit.com',
            image_url: 'https://placehold.co/600x400/16162a/ff8800?text=Travel+News',
            published_at: new Date().toISOString(),
            section: 'lifestyle',
            category: 'travel',
            quality_score: 81
        }
    ]
};

// ======================================
// RSS FETCHING FUNCTIONS
// ======================================
async function fetchRSSFeed(feedUrl, section) {
    const CORS_PROXIES = [
        'https://api.allorigins.win/get?url=',
        'https://corsproxy.io/?'
    ];
    
    let lastError = null;
    
    for (const proxy of CORS_PROXIES) {
        try {
            const proxyUrl = proxy + encodeURIComponent(feedUrl);
            const response = await fetch(proxyUrl, { timeout: 10000 });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            let text = await response.text();
            
            // Handle AllOrigins format
            if (proxy.includes('allorigins.win')) {
                try {
                    const data = JSON.parse(text);
                    text = data.contents;
                } catch (e) {
                    // Not JSON, use text as is
                }
            }
            
            if (!text || text.length < 100) {
                throw new Error('Empty or invalid response');
            }
            
            const articles = parseRSSFeed(text, section);
            
            if (articles.length > 0) {
                console.log(`✅ Successfully fetched ${articles.length} articles from ${feedUrl}`);
                return articles;
            }
            
        } catch (error) {
            lastError = error;
            console.warn(`❌ Proxy failed (${proxy}):`, error.message);
            continue;
        }
    }
    
    throw new Error(`All proxies failed for ${feedUrl}: ${lastError?.message}`);
}

function parseRSSFeed(xmlText, section) {
    const articles = [];
    
    try {
        const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/gi) || [];
        
        for (const item of itemMatches.slice(0, 5)) {
            const title = extractFromXML(item, 'title');
            const description = extractFromXML(item, 'description');
            const link = extractFromXML(item, 'link');
            const pubDate = extractFromXML(item, 'pubDate');
            
            // Extract media/images
            const mediaContent = item.match(/<media:content[^>]+url="([^"]+)"/i);
            const mediaThumbnail = item.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
            const enclosure = item.match(/<enclosure[^>]+url="([^"]+)"/i);
            
            if (title && description && link) {
                const cleanDescription = cleanHTML(description);
                const cleanTitle = cleanHTML(title);
                
                if (cleanTitle.length > 10 && cleanDescription.length > 20) {
                    articles.push({
                        title: cleanTitle,
                        content: cleanDescription,
                        excerpt: cleanDescription.substring(0, 150) + '...',
                        external_url: link,
                        image_url: mediaContent?.[1] || mediaThumbnail?.[1] || enclosure?.[1],
                        published_at: new Date(pubDate || Date.now()).toISOString(),
                        section: section,
                        category: section,
                        quality_score: 80
                    });
                }
            }
        }
        
    } catch (error) {
        console.error('❌ RSS parse error:', error);
    }
    
    return articles;
}

function cleanHTML(text) {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function extractFromXML(xml, tagName) {
    if (!xml) return null;
    
    const patterns = [
        new RegExp(`<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tagName}>`, 'i'),
        new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i')
    ];
    
    for (const pattern of patterns) {
        const match = xml.match(pattern);
        if (match && match[1]) {
            return cleanHTML(match[1]);
        }
    }
    
    return null;
}

async function fetchRSSFeeds(feedUrls, section) {
    const allArticles = [];
    
    const fetchPromises = feedUrls.map(async (feedUrl) => {
        try {
            const articles = await fetchRSSFeed(feedUrl, section);
            return articles;
        } catch (error) {
            console.warn(`⚠️ RSS feed skipped (${feedUrl}):`, error.message);
            return [];
        }
    });
    
    const results = await Promise.allSettled(fetchPromises);
    
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            allArticles.push(...result.value);
        }
    });
    
    // Remove duplicates
    const uniqueArticles = removeDuplicates(allArticles);
    
    return uniqueArticles.slice(0, 20);
}

function removeDuplicates(articles) {
    const seen = new Set();
    
    return articles.filter(article => {
        const key = article.title.toLowerCase().trim().substring(0, 60);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ======================================
// DISPLAY FUNCTIONS
// ======================================
function displayPlaceholderContent() {
    console.log('📋 Displaying placeholder content...');
    
    // Display placeholders for each section on home page
    const sections = ['tech', 'finance', 'gambling', 'fashion', 'lifestyle'];
    
    sections.forEach(section => {
        const homeContainer = document.getElementById(`home-${section}-posts`);
        if (homeContainer && PLACEHOLDER_CONTENT[section]) {
            homeContainer.innerHTML = PLACEHOLDER_CONTENT[section]
                .slice(0, 2)
                .map(post => createPostCard(post, section))
                .join('');
        }
    });
}

function displayPosts(news) {
    console.log('📄 Displaying posts...');
    
    // Display on section pages
    ['tech', 'finance', 'gambling', 'fashion', 'lifestyle'].forEach(section => {
        const postsContainer = document.getElementById(`${section}-posts`);
        
        if (postsContainer && news[section] && news[section].length > 0) {
            postsContainer.innerHTML = news[section]
                .map(post => createPostCard(post, section))
                .join('');
        }
    });
    
    // Display on home page
    displayFeaturedPosts(news);
}

function displayFeaturedPosts(news) {
    ['tech', 'finance', 'gambling', 'fashion', 'lifestyle'].forEach(section => {
        const homeContainer = document.getElementById(`home-${section}-posts`);
        
        if (homeContainer && news[section] && news[section].length > 0) {
            const featuredPosts = news[section].slice(0, 2);
            homeContainer.innerHTML = featuredPosts
                .map(post => createPostCard(post, section))
                .join('');
        }
    });
}

// ======================================
// FETCH LATEST NEWS
// ======================================
async function fetchLatestNews() {
    console.log('📡 Fetching latest news...');
    
    try {
        const [techNews, financeNews, gamblingNews, fashionNews, lifestyleNews] = await Promise.all([
            fetchRSSFeeds(RSS_FEEDS.tech, 'tech'),
            fetchRSSFeeds(RSS_FEEDS.finance, 'finance'),
            fetchRSSFeeds(RSS_FEEDS.gambling, 'gambling'),
            fetchRSSFeeds(RSS_FEEDS.fashion, 'fashion'),
            fetchRSSFeeds(RSS_FEEDS.lifestyle, 'lifestyle')
        ]);
        
        window.currentNews = {
            tech: techNews.length > 0 ? techNews : PLACEHOLDER_CONTENT.tech,
            finance: financeNews.length > 0 ? financeNews : PLACEHOLDER_CONTENT.finance,
            gambling: gamblingNews.length > 0 ? gamblingNews : PLACEHOLDER_CONTENT.gambling,
            fashion: fashionNews.length > 0 ? fashionNews : PLACEHOLDER_CONTENT.fashion,
            lifestyle: lifestyleNews.length > 0 ? lifestyleNews : PLACEHOLDER_CONTENT.lifestyle
        };
        
        console.log('✅ News loaded:', {
            tech: window.currentNews.tech.length,
            finance: window.currentNews.finance.length,
            gambling: window.currentNews.gambling.length,
            fashion: window.currentNews.fashion.length,
            lifestyle: window.currentNews.lifestyle.length
        });
        
        displayPosts(window.currentNews);
        
    } catch (error) {
        console.error('❌ Error fetching news:', error);
        window.currentNews = PLACEHOLDER_CONTENT;
        displayPosts(window.currentNews);
    }
}