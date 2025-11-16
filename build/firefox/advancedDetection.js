// Advanced threat detection capabilities
// Includes homograph detection, typosquatting, TLD analysis, and URL obfuscation

// Top 1000 popular domains for typosquatting detection
const popularDomains = new Set([
    "google.com", "youtube.com", "facebook.com", "amazon.com", "twitter.com",
    "instagram.com", "linkedin.com", "netflix.com", "reddit.com", "ebay.com",
    "microsoft.com", "apple.com", "paypal.com", "yahoo.com", "wikipedia.org",
    "zoom.us", "office.com", "live.com", "twitch.tv", "pinterest.com",
    "adobe.com", "spotify.com", "dropbox.com", "github.com", "stackoverflow.com",
    "wordpress.com", "whatsapp.com", "tiktok.com", "bing.com", "outlook.com",
    "salesforce.com", "chase.com", "bankofamerica.com", "wellsfargo.com", "citibank.com",
    "usbank.com", "capitalone.com", "discover.com", "amex.com", "etsy.com",
    "walmart.com", "target.com", "bestbuy.com", "homedepot.com", "costco.com",
    "craigslist.org", "indeed.com", "glassdoor.com", "zillow.com", "airbnb.com",
    "uber.com", "lyft.com", "doordash.com", "grubhub.com", "yelp.com"
]);

// Suspicious TLDs that are free or cheap and commonly abused
const suspiciousTLDs = new Set([
    "tk", "ml", "ga", "cf", "gq", "top", "work", "buzz", "loan", "download",
    "racing", "review", "stream", "win", "bid", "date", "faith", "party",
    "trade", "webcam", "science", "accountant", "cricket", "men", "online",
    "xyz", "club", "icu", "live", "site", "space", "website", "tech"
]);

// Common keyboard typos (adjacent keys)
const keyboardAdjacency = {
    'q': ['w', 'a'], 'w': ['q', 'e', 's'], 'e': ['w', 'r', 'd'],
    'r': ['e', 't', 'f'], 't': ['r', 'y', 'g'], 'y': ['t', 'u', 'h'],
    'u': ['y', 'i', 'j'], 'i': ['u', 'o', 'k'], 'o': ['i', 'p', 'l'],
    'p': ['o', 'l'], 'a': ['q', 's', 'z'], 's': ['w', 'a', 'd', 'x'],
    'd': ['e', 's', 'f', 'c'], 'f': ['r', 'd', 'g', 'v'], 'g': ['t', 'f', 'h', 'b'],
    'h': ['y', 'g', 'j', 'n'], 'j': ['u', 'h', 'k', 'm'], 'k': ['i', 'j', 'l'],
    'l': ['o', 'k', 'p'], 'z': ['a', 'x'], 'x': ['s', 'z', 'c'],
    'c': ['d', 'x', 'v'], 'v': ['f', 'c', 'b'], 'b': ['g', 'v', 'n'],
    'n': ['h', 'b', 'm'], 'm': ['j', 'n']
};

// Homograph characters (lookalikes)
const homographs = {
    // Cyrillic lookalikes
    'a': ['а', 'ɑ'], // Latin 'a' vs Cyrillic 'а'
    'c': ['с', 'ϲ'], // Latin 'c' vs Cyrillic 'с'
    'e': ['е', 'ҽ'], // Latin 'e' vs Cyrillic 'е'
    'o': ['о', 'ο'], // Latin 'o' vs Cyrillic 'о' and Greek 'ο'
    'p': ['р', 'ρ'], // Latin 'p' vs Cyrillic 'р'
    'x': ['х', 'χ'], // Latin 'x' vs Cyrillic 'х'
    'y': ['у', 'ү'], // Latin 'y' vs Cyrillic 'у'
    'i': ['і', 'ı'], // Latin 'i' vs Cyrillic 'і'
    's': ['ѕ'], // Latin 's' vs Cyrillic 'ѕ'
    'h': ['һ'], // Latin 'h' vs Cyrillic 'һ'
    'j': ['ј'], // Latin 'j' vs Cyrillic 'ј'
    'k': ['к'], // Latin 'k' vs Cyrillic 'к'
    'm': ['м'], // Latin 'm' vs Cyrillic 'м'
    'n': ['п'], // Latin 'n' vs Cyrillic 'п'
    't': ['т'], // Latin 't' vs Cyrillic 'т'
    'v': ['ν'], // Latin 'v' vs Greek 'ν'
    'w': ['ԝ'], // Latin 'w' vs Cyrillic 'ԝ'
};

/**
 * Detect homograph attacks (IDN spoofing)
 * Returns object with detection result and details
 */
export function detectHomograph(hostname) {
    const threats = [];

    // Check for punycode (xn--)
    if (hostname.includes('xn--')) {
        threats.push({
            type: 'punycode',
            severity: 'high',
            message: 'Domain uses punycode encoding (xn--), which may hide the real characters'
        });
    }

    // Check for mixed character sets
    const hasCyrillic = /[\u0400-\u04FF]/.test(hostname);
    const hasGreek = /[\u0370-\u03FF]/.test(hostname);
    const hasLatin = /[a-zA-Z]/.test(hostname);

    if ((hasCyrillic || hasGreek) && hasLatin) {
        threats.push({
            type: 'mixed_charset',
            severity: 'critical',
            message: 'Domain mixes Latin with Cyrillic/Greek characters (homograph attack)'
        });
    }

    // Check if domain looks like popular site with homographs
    for (const popularDomain of popularDomains) {
        if (hostname === popularDomain) continue; // Skip if exact match

        const similarity = calculateHomographSimilarity(hostname, popularDomain);
        if (similarity > 0.8) {
            threats.push({
                type: 'homograph_similarity',
                severity: 'critical',
                message: `Domain very similar to ${popularDomain} using lookalike characters`,
                targetDomain: popularDomain,
                similarity: similarity
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
 * Calculate similarity between two strings considering homograph characters
 */
function calculateHomographSimilarity(str1, str2) {
    if (str1.length !== str2.length) return 0;

    let matches = 0;
    for (let i = 0; i < str1.length; i++) {
        const char1 = str1[i];
        const char2 = str2[i];

        if (char1 === char2) {
            matches++;
        } else {
            // Check if they're homographs
            for (const [latinChar, lookalikes] of Object.entries(homographs)) {
                if ((char1 === latinChar && lookalikes.includes(char2)) ||
                    (char2 === latinChar && lookalikes.includes(char1))) {
                    matches++;
                    break;
                }
            }
        }
    }

    return matches / str1.length;
}

/**
 * Detect typosquatting attempts
 */
export function detectTyposquatting(hostname) {
    const threats = [];
    const domainWithoutTLD = hostname.split('.')[0];

    for (const popularDomain of popularDomains) {
        const popularWithoutTLD = popularDomain.split('.')[0];

        // Skip if exact match
        if (hostname === popularDomain) continue;

        const distance = levenshteinDistance(domainWithoutTLD, popularWithoutTLD);

        // One character different
        if (distance === 1) {
            threats.push({
                type: 'typosquatting_one_char',
                severity: 'high',
                message: `Domain is one character different from ${popularDomain}`,
                targetDomain: popularDomain,
                distance: distance
            });
            break;
        }

        // Two characters different (still suspicious)
        if (distance === 2 && domainWithoutTLD.length > 4) {
            threats.push({
                type: 'typosquatting_two_char',
                severity: 'medium',
                message: `Domain is very similar to ${popularDomain}`,
                targetDomain: popularDomain,
                distance: distance
            });
            break;
        }

        // Check for keyboard adjacency typos
        if (isKeyboardTypo(domainWithoutTLD, popularWithoutTLD)) {
            threats.push({
                type: 'typosquatting_keyboard',
                severity: 'high',
                message: `Domain appears to be a keyboard typo of ${popularDomain}`,
                targetDomain: popularDomain
            });
            break;
        }

        // Check for repeated characters (gooogle.com)
        if (hasRepeatedCharacters(domainWithoutTLD, popularWithoutTLD)) {
            threats.push({
                type: 'typosquatting_repeated',
                severity: 'medium',
                message: `Domain has repeated characters similar to ${popularDomain}`,
                targetDomain: popularDomain
            });
            break;
        }

        // Check for missing character (gogle.com)
        if (hasMissingCharacter(domainWithoutTLD, popularWithoutTLD)) {
            threats.push({
                type: 'typosquatting_missing',
                severity: 'high',
                message: `Domain appears to be ${popularDomain} with missing character`,
                targetDomain: popularDomain
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
 * Levenshtein distance (edit distance) between two strings
 */
function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

/**
 * Check if one string is a keyboard typo of another
 */
function isKeyboardTypo(str1, str2) {
    if (Math.abs(str1.length - str2.length) > 1) return false;

    let differences = 0;
    const maxLen = Math.max(str1.length, str2.length);

    for (let i = 0; i < maxLen; i++) {
        const char1 = str1[i];
        const char2 = str2[i];

        if (char1 !== char2) {
            differences++;

            // Check if characters are keyboard-adjacent
            if (keyboardAdjacency[char1] && !keyboardAdjacency[char1].includes(char2)) {
                return false;
            }
        }
    }

    return differences === 1;
}

/**
 * Check if string has repeated characters compared to target
 */
function hasRepeatedCharacters(str1, str2) {
    // Remove consecutive duplicates from str1
    const deduplicated = str1.replace(/(.)\1+/g, '$1');
    return deduplicated === str2;
}

/**
 * Check if string is missing a character compared to target
 */
function hasMissingCharacter(str1, str2) {
    if (str2.length - str1.length !== 1) return false;

    for (let i = 0; i < str2.length; i++) {
        const withoutChar = str2.slice(0, i) + str2.slice(i + 1);
        if (withoutChar === str1) return true;
    }

    return false;
}

/**
 * Detect suspicious TLDs
 */
export function detectSuspiciousTLD(hostname) {
    const threats = [];
    const tld = hostname.split('.').pop().toLowerCase();

    if (suspiciousTLDs.has(tld)) {
        threats.push({
            type: 'suspicious_tld',
            severity: 'medium',
            message: `.${tld} domains are free/cheap and frequently used by scammers`,
            tld: tld
        });
    }

    return {
        detected: threats.length > 0,
        threats: threats
    };
}

/**
 * Detect URL obfuscation techniques
 */
export function detectURLObfuscation(url) {
    const threats = [];

    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;

        // IP address instead of domain
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
            threats.push({
                type: 'ip_address',
                severity: 'medium',
                message: 'URL uses IP address instead of domain name'
            });
        }

        // Excessive subdomains (more than 4)
        const subdomainCount = hostname.split('.').length - 2;
        if (subdomainCount > 4) {
            threats.push({
                type: 'excessive_subdomains',
                severity: 'low',
                message: `URL has ${subdomainCount} subdomains, which is unusual`,
                count: subdomainCount
            });
        }

        // @ symbol trick (http://google.com@evil.com)
        if (parsedUrl.username || url.includes('@')) {
            threats.push({
                type: 'at_symbol_trick',
                severity: 'critical',
                message: 'URL contains @ symbol, which can hide the real domain'
            });
        }

        // Very long URL (potential data exfiltration or obfuscation)
        if (url.length > 200) {
            threats.push({
                type: 'long_url',
                severity: 'low',
                message: `URL is ${url.length} characters long, which is suspicious`,
                length: url.length
            });
        }

        // Excessive URL encoding
        const encodedChars = (url.match(/%[0-9A-F]{2}/gi) || []).length;
        if (encodedChars > 10) {
            threats.push({
                type: 'excessive_encoding',
                severity: 'medium',
                message: `URL has ${encodedChars} encoded characters, possible obfuscation`,
                count: encodedChars
            });
        }

        // Data URI (data:text/html,...)
        if (url.startsWith('data:')) {
            threats.push({
                type: 'data_uri',
                severity: 'high',
                message: 'Data URI detected, which can contain embedded malicious content'
            });
        }

        // Port number on HTTP/HTTPS (unusual)
        if (parsedUrl.port && !['80', '443', ''].includes(parsedUrl.port)) {
            threats.push({
                type: 'unusual_port',
                severity: 'low',
                message: `URL uses unusual port ${parsedUrl.port}`,
                port: parsedUrl.port
            });
        }

    } catch (error) {
        // Invalid URL
        return { detected: false, threats: [] };
    }

    return {
        detected: threats.length > 0,
        threats: threats
    };
}

/**
 * Comprehensive URL analysis
 * Runs all detection methods and returns combined results
 */
export function analyzeURL(url) {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;

        const homograph = detectHomograph(hostname);
        const typosquatting = detectTyposquatting(hostname);
        const suspiciousTLD = detectSuspiciousTLD(hostname);
        const obfuscation = detectURLObfuscation(url);

        const allThreats = [
            ...homograph.threats,
            ...typosquatting.threats,
            ...suspiciousTLD.threats,
            ...obfuscation.threats
        ];

        // Calculate overall risk score (0-100)
        let riskScore = 0;
        allThreats.forEach(threat => {
            if (threat.severity === 'critical') riskScore += 40;
            else if (threat.severity === 'high') riskScore += 25;
            else if (threat.severity === 'medium') riskScore += 15;
            else if (threat.severity === 'low') riskScore += 5;
        });
        riskScore = Math.min(100, riskScore);

        return {
            url: url,
            hostname: hostname,
            detected: allThreats.length > 0,
            riskScore: riskScore,
            threats: allThreats,
            categories: {
                homograph: homograph.detected,
                typosquatting: typosquatting.detected,
                suspiciousTLD: suspiciousTLD.detected,
                obfuscation: obfuscation.detected
            }
        };
    } catch (error) {
        return {
            url: url,
            detected: false,
            riskScore: 0,
            threats: [],
            error: error.message
        };
    }
}
