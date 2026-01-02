// retrieval.js - Live Web Grounding for Active MirrorOS
// Browser-native RAG: fetch context, inject into prompts, cite sources

// ============================================
// CORS-FRIENDLY DATA SOURCES
// ============================================

const SOURCES = {
    // Wikipedia - free, fast, reliable
    wikipedia: {
        search: (q) => `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*`,
        extract: (title) => `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&exintro=1&explaintext=1&format=json&origin=*`,
        parse: (data) => {
            const pages = data.query?.pages;
            if (!pages) return null;
            const page = Object.values(pages)[0];
            return page.extract || null;
        }
    },
    
    // DuckDuckGo Instant Answers
    duckduckgo: {
        instant: (q) => `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`,
        parse: (data) => {
            if (data.AbstractText) return { type: 'abstract', text: data.AbstractText, source: data.AbstractSource, url: data.AbstractURL };
            if (data.Answer) return { type: 'answer', text: data.Answer };
            if (data.Definition) return { type: 'definition', text: data.Definition, source: data.DefinitionSource };
            if (data.RelatedTopics?.length) return { type: 'related', topics: data.RelatedTopics.slice(0, 3).map(t => t.Text).filter(Boolean) };
            return null;
        }
    },
    
    // Weather (wttr.in - amazing free service)
    weather: {
        get: (location) => `https://wttr.in/${encodeURIComponent(location)}?format=j1`,
        parse: (data) => {
            const current = data.current_condition?.[0];
            const location = data.nearest_area?.[0];
            if (!current) return null;
            return {
                location: location?.areaName?.[0]?.value || 'Unknown',
                temp_c: current.temp_C,
                temp_f: current.temp_F,
                condition: current.weatherDesc?.[0]?.value,
                humidity: current.humidity,
                wind_kmph: current.windspeedKmph,
                feels_like_c: current.FeelsLikeC
            };
        }
    },
    
    // Currency exchange (exchangerate.host)
    currency: {
        convert: (from, to, amount = 1) => `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`,
        rates: () => `https://api.exchangerate.host/latest`,
        parse: (data) => data.result ? { rate: data.result, from: data.query?.from, to: data.query?.to } : null
    },
    
    // IP Geolocation (ip-api.com)
    geo: {
        lookup: () => `http://ip-api.com/json/?fields=status,country,regionName,city,lat,lon,timezone`,
        parse: (data) => data.status === 'success' ? data : null
    },
    
    // Wikidata for structured facts
    wikidata: {
        search: (q) => `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=en&format=json&origin=*`,
        entity: (id) => `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${id}&format=json&origin=*&props=labels|descriptions|claims`,
    },
    
    // Open Library for books
    books: {
        search: (q) => `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=3`,
        parse: (data) => data.docs?.slice(0, 3).map(b => ({ title: b.title, author: b.author_name?.[0], year: b.first_publish_year }))
    },
    
    // News via RSS-to-JSON (using rss2json.com free tier)
    news: {
        feed: (rssUrl) => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`,
        sources: {
            tech: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
            world: 'https://feeds.bbci.co.uk/news/world/rss.xml',
            science: 'https://www.sciencedaily.com/rss/all.xml',
        }
    }
};

// ============================================
// INTENT CLASSIFICATION
// ============================================

const INTENT_PATTERNS = {
    temporal: {
        patterns: [
            /\b(today|yesterday|this week|this month|latest|recent|current|now|just happened|breaking)\b/i,
            /\b(news|update|happening|announced|released|launched)\b/i,
            /\b(2024|2025|2026)\b/,
            /\bwhat('s| is) (new|happening)\b/i,
        ],
        weight: 1.0
    },
    weather: {
        patterns: [
            /\b(weather|temperature|rain|snow|sunny|cloudy|forecast|humid)\b/i,
            /\bhow (hot|cold|warm) is it\b/i,
            /\bwill it rain\b/i,
        ],
        weight: 1.0
    },
    factual: {
        patterns: [
            /\b(who is|what is|when did|where is|how many|how much)\b/i,
            /\b(capital of|population of|founder of|ceo of|president of)\b/i,
            /\bdefine\b/i,
        ],
        weight: 0.8
    },
    currency: {
        patterns: [
            /\b(convert|exchange rate|usd|eur|gbp|jpy|inr|currency)\b/i,
            /\b\d+\s*(dollars?|euros?|pounds?|yen|rupees?)\b/i,
            /\bhow much is .* in\b/i,
        ],
        weight: 1.0
    },
    calculation: {
        patterns: [
            /\b(calculate|compute|what is \d|solve|convert \d)\b/i,
            /\d+\s*[\+\-\*\/\^]\s*\d+/,
            /\b(percent|percentage|ratio|average|sum)\b/i,
        ],
        weight: 0.9
    },
    location: {
        patterns: [
            /\b(where am i|my location|near me|nearby|local)\b/i,
            /\b(directions to|how far is|distance to)\b/i,
        ],
        weight: 1.0
    },
    books: {
        patterns: [
            /\b(book|author|novel|written by|who wrote)\b/i,
            /\brecommend.*(book|read)\b/i,
        ],
        weight: 0.7
    },
    code: {
        patterns: [
            /\b(code|programming|function|algorithm|syntax|debug|error)\b/i,
            /\b(javascript|python|rust|java|html|css|sql)\b/i,
            /```/,
        ],
        weight: 0.3  // Low weight - usually better to let model handle directly
    },
    reasoning: {
        patterns: [
            /\b(explain|analyze|compare|think about|help me understand|why)\b/i,
            /\bwhat do you think\b/i,
            /\bshould i\b/i,
        ],
        weight: 0.2  // Low weight - let model reason
    }
};

function classifyIntent(query) {
    const scores = {};
    let maxScore = 0;
    let primaryIntent = 'reasoning';
    
    for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
        let score = 0;
        for (const pattern of config.patterns) {
            if (pattern.test(query)) {
                score += config.weight;
            }
        }
        scores[intent] = score;
        if (score > maxScore) {
            maxScore = score;
            primaryIntent = intent;
        }
    }
    
    // If no strong signal, default to reasoning (let model handle)
    if (maxScore < 0.5) {
        primaryIntent = 'reasoning';
    }
    
    return {
        primary: primaryIntent,
        scores,
        needsRetrieval: ['temporal', 'weather', 'factual', 'currency', 'location', 'books'].includes(primaryIntent) && maxScore >= 0.5
    };
}

// ============================================
// RETRIEVAL FUNCTIONS
// ============================================

async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (e) {
        clearTimeout(id);
        console.warn('[Retrieval] Fetch failed:', url, e.message);
        return null;
    }
}

async function searchWikipedia(query) {
    // First search for relevant articles
    const searchData = await fetchWithTimeout(SOURCES.wikipedia.search(query));
    if (!searchData?.query?.search?.length) return null;
    
    // Get the top result's extract
    const topResult = searchData.query.search[0];
    const extractData = await fetchWithTimeout(SOURCES.wikipedia.extract(topResult.title));
    const extract = SOURCES.wikipedia.parse(extractData);
    
    if (!extract) return null;
    
    return {
        source: 'Wikipedia',
        title: topResult.title,
        content: extract.slice(0, 1500),  // Limit context size
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topResult.title)}`
    };
}

async function searchDuckDuckGo(query) {
    const data = await fetchWithTimeout(SOURCES.duckduckgo.instant(query));
    if (!data) return null;
    
    const parsed = SOURCES.duckduckgo.parse(data);
    if (!parsed) return null;
    
    return {
        source: 'DuckDuckGo',
        type: parsed.type,
        content: parsed.text || parsed.topics?.join('; '),
        url: parsed.url
    };
}

async function getWeather(query) {
    // Extract location from query
    const locationMatch = query.match(/(?:weather|temperature|forecast)\s+(?:in|for|at)?\s*(.+)/i);
    const location = locationMatch?.[1]?.trim() || 'auto';  // 'auto' uses IP geolocation
    
    const data = await fetchWithTimeout(SOURCES.weather.get(location));
    if (!data) return null;
    
    const parsed = SOURCES.weather.parse(data);
    if (!parsed) return null;
    
    return {
        source: 'wttr.in',
        type: 'weather',
        content: `Weather in ${parsed.location}: ${parsed.temp_c}°C (${parsed.temp_f}°F), ${parsed.condition}. Humidity: ${parsed.humidity}%. Wind: ${parsed.wind_kmph} km/h. Feels like: ${parsed.feels_like_c}°C.`,
        data: parsed
    };
}

async function convertCurrency(query) {
    // Extract currency info from query
    const match = query.match(/(\d+(?:\.\d+)?)\s*([A-Z]{3})\s*(?:to|in)\s*([A-Z]{3})/i);
    if (!match) {
        // Try simpler pattern
        const simpleMatch = query.match(/([A-Z]{3})\s*(?:to|vs|\/)\s*([A-Z]{3})/i);
        if (simpleMatch) {
            const data = await fetchWithTimeout(SOURCES.currency.convert(simpleMatch[1].toUpperCase(), simpleMatch[2].toUpperCase(), 1));
            if (data?.result) {
                return {
                    source: 'exchangerate.host',
                    type: 'currency',
                    content: `1 ${simpleMatch[1].toUpperCase()} = ${data.result.toFixed(4)} ${simpleMatch[2].toUpperCase()}`
                };
            }
        }
        return null;
    }
    
    const [, amount, from, to] = match;
    const data = await fetchWithTimeout(SOURCES.currency.convert(from.toUpperCase(), to.toUpperCase(), parseFloat(amount)));
    if (!data?.result) return null;
    
    return {
        source: 'exchangerate.host',
        type: 'currency',
        content: `${amount} ${from.toUpperCase()} = ${data.result.toFixed(2)} ${to.toUpperCase()}`
    };
}

async function getLocation() {
    const data = await fetchWithTimeout(SOURCES.geo.lookup());
    if (!data) return null;
    
    return {
        source: 'IP Geolocation',
        type: 'location',
        content: `Based on your IP, you appear to be in ${data.city}, ${data.regionName}, ${data.country}. Timezone: ${data.timezone}.`,
        data
    };
}

async function searchBooks(query) {
    const data = await fetchWithTimeout(SOURCES.books.search(query));
    const books = SOURCES.books.parse(data);
    if (!books?.length) return null;
    
    const bookList = books.map(b => `"${b.title}" by ${b.author || 'Unknown'} (${b.year || 'n/a'})`).join('; ');
    
    return {
        source: 'Open Library',
        type: 'books',
        content: `Found: ${bookList}`
    };
}

async function getNews(category = 'tech') {
    const rssUrl = SOURCES.news.sources[category] || SOURCES.news.sources.tech;
    const data = await fetchWithTimeout(SOURCES.news.feed(rssUrl));
    
    if (!data?.items?.length) return null;
    
    const headlines = data.items.slice(0, 5).map(item => ({
        title: item.title,
        link: item.link,
        date: item.pubDate
    }));
    
    return {
        source: data.feed?.title || 'News',
        type: 'news',
        content: headlines.map(h => `• ${h.title}`).join('\n'),
        headlines
    };
}

// ============================================
// MAIN RETRIEVAL ORCHESTRATOR
// ============================================

async function retrieve(query) {
    const intent = classifyIntent(query);
    console.log('[Retrieval] Intent:', intent);
    
    if (!intent.needsRetrieval) {
        return { intent, results: [], context: null };
    }
    
    const results = [];
    
    try {
        switch (intent.primary) {
            case 'weather':
                const weather = await getWeather(query);
                if (weather) results.push(weather);
                break;
                
            case 'currency':
                const currency = await convertCurrency(query);
                if (currency) results.push(currency);
                break;
                
            case 'location':
                const location = await getLocation();
                if (location) results.push(location);
                break;
                
            case 'books':
                const books = await searchBooks(query);
                if (books) results.push(books);
                break;
                
            case 'temporal':
                // For temporal queries, try multiple sources
                const [ddg, wiki, news] = await Promise.all([
                    searchDuckDuckGo(query),
                    searchWikipedia(query),
                    getNews('tech')  // Default to tech news
                ]);
                if (ddg) results.push(ddg);
                if (wiki) results.push(wiki);
                if (news) results.push(news);
                break;
                
            case 'factual':
            default:
                // For factual queries, try DuckDuckGo then Wikipedia
                const ddgResult = await searchDuckDuckGo(query);
                if (ddgResult) {
                    results.push(ddgResult);
                } else {
                    const wikiResult = await searchWikipedia(query);
                    if (wikiResult) results.push(wikiResult);
                }
                break;
        }
    } catch (e) {
        console.error('[Retrieval] Error:', e);
    }
    
    // Build context string for injection
    let context = null;
    if (results.length > 0) {
        context = results.map(r => {
            let text = `[${r.source}]`;
            if (r.title) text += ` ${r.title}:`;
            text += ` ${r.content}`;
            if (r.url) text += ` (${r.url})`;
            return text;
        }).join('\n\n');
    }
    
    return { intent, results, context };
}

// ============================================
// PROMPT ENHANCEMENT
// ============================================

function enhancePrompt(originalPrompt, retrievalResult) {
    if (!retrievalResult.context) {
        return originalPrompt;
    }
    
    const systemContext = `You have access to current information from the web. Use this retrieved context to inform your response, and cite sources when relevant.

RETRIEVED CONTEXT:
${retrievalResult.context}

---

User question: ${originalPrompt}`;

    return systemContext;
}

// ============================================
// BROWSER CONTEXT GATHERING
// ============================================

async function gatherBrowserContext() {
    const context = {
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        online: navigator.onLine,
    };
    
    // Battery (if available)
    if (navigator.getBattery) {
        try {
            const battery = await navigator.getBattery();
            context.battery = {
                level: Math.round(battery.level * 100),
                charging: battery.charging
            };
        } catch (e) {}
    }
    
    // Network info (if available)
    if (navigator.connection) {
        context.network = {
            type: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink
        };
    }
    
    // Geolocation (only if previously granted)
    // We don't prompt here - that would be intrusive
    
    return context;
}

// ============================================
// EXPORTS
// ============================================

export {
    retrieve,
    enhancePrompt,
    classifyIntent,
    gatherBrowserContext,
    searchWikipedia,
    searchDuckDuckGo,
    getWeather,
    convertCurrency,
    getLocation,
    searchBooks,
    getNews,
    SOURCES
};
