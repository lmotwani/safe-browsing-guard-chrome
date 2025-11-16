// Download Metadata Analysis and OpenPhish Integration

/**
 * Analyze download for suspicious patterns
 */
export function analyzeDownload(downloadItem) {
    const threats = [];
    const filename = downloadItem.filename;

    // Double extension detection
    const doubleExt = detectDoubleExtension(filename);
    if (doubleExt.detected) {
        threats.push(...doubleExt.threats);
    }

    // Hidden extension detection (spaces before extension)
    const hiddenExt = detectHiddenExtension(filename);
    if (hiddenExt.detected) {
        threats.push(...hiddenExt.threats);
    }

    // Suspicious filename patterns
    const suspiciousName = detectSuspiciousFilename(filename);
    if (suspiciousName.detected) {
        threats.push(...suspiciousName.threats);
    }

    // Very long filename (hiding extension)
    if (filename.length > 100) {
        threats.push({
            type: 'long_filename',
            severity: 'medium',
            message: `Filename is ${filename.length} characters long, possibly hiding extension`,
            length: filename.length
        });
    }

    // Masquerading detection (executable with doc name)
    const masquerade = detectMasquerading(filename);
    if (masquerade.detected) {
        threats.push(...masquerade.threats);
    }

    // Calculate risk score
    let riskScore = 0;
    threats.forEach(threat => {
        if (threat.severity === 'critical') riskScore += 40;
        else if (threat.severity === 'high') riskScore += 25;
        else if (threat.severity === 'medium') riskScore += 15;
        else if (threat.severity === 'low') riskScore += 5;
    });
    riskScore = Math.min(100, riskScore);

    return {
        filename: filename,
        detected: threats.length > 0,
        riskScore: riskScore,
        threats: threats
    };
}

/**
 * Detect double extensions (file.pdf.exe)
 */
function detectDoubleExtension(filename) {
    const threats = [];
    const parts = filename.split('.');

    if (parts.length > 2) {
        const executableExtensions = ['exe', 'scr', 'bat', 'cmd', 'com', 'pif', 'vbs', 'js', 'jar', 'msi', 'app', 'dmg'];
        const lastExt = parts[parts.length - 1].toLowerCase();
        const secondLastExt = parts[parts.length - 2].toLowerCase();

        const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'gif', 'txt', 'zip'];

        if (executableExtensions.includes(lastExt) && docExtensions.includes(secondLastExt)) {
            threats.push({
                type: 'double_extension',
                severity: 'critical',
                message: `File appears to be ${secondLastExt} but is actually ${lastExt} (double extension attack)`,
                realExtension: lastExt,
                fakeExtension: secondLastExt
            });
        }
    }

    return {
        detected: threats.length > 0,
        threats: threats
    };
}

/**
 * Detect hidden extensions (spaces before .exe)
 */
function detectHiddenExtension(filename) {
    const threats = [];

    // Check for spaces before extension
    if (/\s+\.(exe|scr|bat|cmd|vbs|js)$/i.test(filename)) {
        threats.push({
            type: 'hidden_extension',
            severity: 'critical',
            message: 'File has spaces before extension to hide its true type',
            pattern: 'spaces_before_ext'
        });
    }

    // Right-to-left override character (Unicode trickery)
    if (filename.includes('\u202E')) {
        threats.push({
            type: 'rtlo_attack',
            severity: 'critical',
            message: 'File uses Unicode right-to-left override to hide extension',
            pattern: 'rtlo'
        });
    }

    return {
        detected: threats.length > 0,
        threats: threats
    };
}

/**
 * Detect suspicious filename patterns
 */
function detectSuspiciousFilename(filename) {
    const threats = [];

    // Social engineering keywords
    const urgentWords = /\b(urgent|invoice|payment|refund|verify|suspended|account|security|alert|confirm|update|action|required|immediate)\b/i;
    if (urgentWords.test(filename)) {
        threats.push({
            type: 'social_engineering',
            severity: 'medium',
            message: 'Filename contains urgent/suspicious keywords often used in phishing',
            pattern: 'urgent_keywords'
        });
    }

    // Financial keywords
    const financialWords = /\b(bank|paypal|payment|invoice|receipt|order|transaction|tax|irs|w2|w-2|1099)\b/i;
    if (financialWords.test(filename)) {
        threats.push({
            type: 'financial_lure',
            severity: 'low',
            message: 'Filename contains financial keywords, be cautious',
            pattern: 'financial_keywords'
        });
    }

    // Random character patterns (keyboard mashing)
    if (/[a-z]{20,}/i.test(filename) || /[0-9]{10,}/.test(filename)) {
        threats.push({
            type: 'random_characters',
            severity: 'low',
            message: 'Filename contains long sequences of characters, possibly auto-generated',
            pattern: 'long_sequence'
        });
    }

    return {
        detected: threats.length > 0,
        threats: threats
    };
}

/**
 * Detect masquerading (executable pretending to be document)
 */
function detectMasquerading(filename) {
    const threats = [];
    const lower = filename.toLowerCase();

    const docNames = ['invoice', 'report', 'document', 'receipt', 'order', 'statement', 'form', 'resume', 'cv', 'letter', 'contract'];
    const executableExts = /\.(exe|scr|bat|cmd|vbs|js|jar|com|pif|msi|app)$/i;

    for (const docName of docNames) {
        if (lower.includes(docName) && executableExts.test(lower)) {
            threats.push({
                type: 'masquerading',
                severity: 'high',
                message: `File name suggests a document (${docName}) but is actually an executable`,
                docType: docName
            });
            break;
        }
    }

    return {
        detected: threats.length > 0,
        threats: threats
    };
}

/**
 * OpenPhish Feed Integration
 */
export class OpenPhishFeed {
    constructor() {
        this.phishingUrls = new Set();
        this.lastUpdate = 0;
        this.updateInterval = 60 * 60 * 1000; // 1 hour
        this.feedUrl = 'https://openphish.com/feed.txt';
        this.maxUrls = 10000; // Limit storage size
    }

    /**
     * Initialize and load cached feed
     */
    async initialize() {
        try {
            const data = await chrome.storage.local.get(['openphish_urls', 'openphish_lastupdate']);

            if (data.openphish_urls && Array.isArray(data.openphish_urls)) {
                this.phishingUrls = new Set(data.openphish_urls);
                this.lastUpdate = data.openphish_lastupdate || 0;
                console.log(`OpenPhish: Loaded ${this.phishingUrls.size} cached URLs`);
            }

            // Update if cache is old or empty
            if (Date.now() - this.lastUpdate > this.updateInterval || this.phishingUrls.size === 0) {
                console.log('OpenPhish: Cache stale or empty, updating...');
                await this.updateFeed();
            }

            // Set up periodic updates
            this.startPeriodicUpdates();
        } catch (error) {
            console.error('Error initializing OpenPhish feed:', error);
            // Extension will continue to work without OpenPhish data
            console.warn('OpenPhish feed unavailable - extension will use other detection methods');
        }
    }

    /**
     * Fetch latest OpenPhish feed
     */
    async updateFeed() {
        try {
            console.log('OpenPhish: Fetching latest feed...');

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(this.feedUrl, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Safe-Browsing-Guard-Extension/2.0.0'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const text = await response.text();
            const urls = text.split('\n')
                .map(url => url.trim())
                .filter(url => url.length > 0 && url.startsWith('http'))
                .slice(0, this.maxUrls); // Limit size to 10,000 URLs

            if (urls.length === 0) {
                throw new Error('OpenPhish feed returned no URLs');
            }

            this.phishingUrls = new Set(urls);
            this.lastUpdate = Date.now();

            // Check storage quota before saving
            try {
                await chrome.storage.local.set({
                    openphish_urls: Array.from(this.phishingUrls),
                    openphish_lastupdate: this.lastUpdate
                });

                console.log(`OpenPhish: Feed updated successfully - ${this.phishingUrls.size} URLs loaded`);
            } catch (storageError) {
                console.error('OpenPhish: Storage error:', storageError);
                // Even if storage fails, keep URLs in memory
                console.warn('OpenPhish: URLs cached in memory only (storage quota exceeded)');
            }

            return {
                success: true,
                count: this.phishingUrls.size,
                timestamp: this.lastUpdate
            };
        } catch (error) {
            console.error('OpenPhish: Feed update failed:', error.message);

            // If update fails but we have cached data, that's okay
            if (this.phishingUrls.size > 0) {
                console.warn(`OpenPhish: Using ${this.phishingUrls.size} cached URLs from previous update`);
                return {
                    success: false,
                    error: error.message,
                    usingCache: true,
                    cacheSize: this.phishingUrls.size
                };
            }

            return {
                success: false,
                error: error.message,
                usingCache: false
            };
        }
    }

    /**
     * Start periodic updates
     */
    startPeriodicUpdates() {
        setInterval(() => {
            this.updateFeed();
        }, this.updateInterval);
    }

    /**
     * Check if URL is in phishing database
     */
    async checkURL(url) {
        try {
            // Normalize URL
            const normalized = this.normalizeURL(url);

            // Direct match
            if (this.phishingUrls.has(normalized)) {
                return {
                    detected: true,
                    type: 'openphish_exact',
                    severity: 'critical',
                    message: 'URL found in OpenPhish phishing database',
                    source: 'OpenPhish'
                };
            }

            // Check without protocol
            const withoutProtocol = normalized.replace(/^https?:\/\//, '');
            if (this.phishingUrls.has(withoutProtocol)) {
                return {
                    detected: true,
                    type: 'openphish_match',
                    severity: 'critical',
                    message: 'URL matches known phishing site',
                    source: 'OpenPhish'
                };
            }

            return {
                detected: false,
                message: 'URL not found in phishing database'
            };
        } catch (error) {
            console.error('Error checking URL against OpenPhish:', error);
            return {
                detected: false,
                error: error.message
            };
        }
    }

    /**
     * Normalize URL for comparison
     */
    normalizeURL(url) {
        try {
            // Remove trailing slashes and fragments
            let normalized = url.toLowerCase();
            normalized = normalized.replace(/#.*$/, '');
            normalized = normalized.replace(/\/+$/, '');
            return normalized;
        } catch (error) {
            return url;
        }
    }

    /**
     * Get feed statistics
     */
    getStats() {
        return {
            urlCount: this.phishingUrls.size,
            lastUpdate: this.lastUpdate,
            lastUpdateFormatted: new Date(this.lastUpdate).toLocaleString(),
            nextUpdate: this.lastUpdate + this.updateInterval,
            isStale: Date.now() - this.lastUpdate > this.updateInterval
        };
    }

    /**
     * Force update
     */
    async forceUpdate() {
        return await this.updateFeed();
    }
}
