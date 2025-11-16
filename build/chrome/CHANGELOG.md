# Changelog

All notable changes to Safe Browsing Guard will be documented in this file.

## [2.0.0] - 2025-11-16

### 🚀 Major New Features

#### Advanced URL Threat Detection
- **Homograph Attack Detection**: Detects IDN spoofing and punycode domains (xn--) that use lookalike characters
  - Identifies mixed character sets (Latin + Cyrillic + Greek)
  - Recognizes homograph attacks against popular brands (e.g., paypal.com vs pаypal.com with Cyrillic 'а')
  - Calculates similarity scores to detect sophisticated spoofing attempts

- **Typosquatting Detection**: Identifies domains that mimic popular websites
  - Levenshtein distance calculation to find domains 1-2 characters different from top brands
  - Keyboard adjacency detection for common typing mistakes
  - Repeated character detection (e.g., gooogle.com)
  - Missing character detection (e.g., gogle.com)
  - Checks against database of 50+ popular domains

- **Suspicious TLD Detection**: Flags high-risk top-level domains
  - Detects 25+ suspicious TLDs (.tk, .ml, .ga, .xyz, etc.)
  - These TLDs are free/cheap and heavily abused by scammers

- **URL Obfuscation Detection**: Identifies various URL manipulation techniques
  - IP address URLs instead of domain names
  - Excessive subdomains (>4 levels deep)
  - @ symbol tricks (http://google.com@evil.com)
  - Very long URLs (>200 characters)
  - Excessive URL encoding (>10 encoded characters)
  - Data URI detection (data:text/html,...)
  - Unusual port numbers

#### OpenPhish Integration (100% Free!)
- **Real-time Phishing Database**: Integrates with OpenPhish free API
  - Hourly updated feed of 10,000+ known phishing URLs
  - Automatic background updates every hour
  - Local caching for offline protection
  - Zero-cost, no API key required
  - Immediate critical warnings for known phishing sites

#### Advanced Download Analysis
- **Double Extension Detection**: Catches files masquerading with fake extensions
  - Detects patterns like "invoice.pdf.exe"
  - Identifies hidden executable extensions

- **Hidden Extension Detection**:
  - Detects spaces before extensions to hide file type
  - Identifies Unicode right-to-left override (RTLO) attacks

- **Social Engineering Pattern Detection**:
  - Flags urgent keywords (invoice, payment, urgent, verify, suspended)
  - Detects financial lures (bank, paypal, tax, IRS)
  - Identifies random character patterns

- **File Masquerading Detection**:
  - Catches executables pretending to be documents
  - Detects patterns like "invoice.exe" or "document.scr"

#### Risk Scoring System
- **Comprehensive Risk Assessment**: 0-100 risk score for URLs and downloads
  - Critical threats: 40 points each
  - High severity: 25 points each
  - Medium severity: 15 points each
  - Low severity: 5 points each
  - Color-coded display (red/orange/yellow/green)

#### Enhanced Warning UI
- **Detailed Threat Breakdown**: Popup now shows:
  - Phishing detection alerts (when URL found in OpenPhish database)
  - Risk score with color coding
  - Separate sections for download threats and URL threats
  - Severity levels for each threat (Critical/High/Medium/Low)
  - Specific threat descriptions and mitigation advice

### 🔧 Technical Improvements

#### New Modules
- `advancedDetection.js`: Advanced URL threat analysis engine
- `downloadAnalyzer.js`: Download analysis and OpenPhish integration
- Modular architecture for easier maintenance and updates

#### Performance Optimizations
- Client-side threat detection (no external API calls except OpenPhish)
- Efficient Set-based lookups for popular domain matching
- Cached OpenPhish feed with hourly background updates
- Local storage for threat database

### 📊 Detection Capabilities

The extension now detects:
1. ✅ 150+ suspicious domains (LOTS Project)
2. ✅ 100+ dangerous file extensions
3. ✅ 10,000+ known phishing URLs (OpenPhish)
4. ✅ Homograph attacks (IDN spoofing)
5. ✅ Typosquatting (50+ popular brands)
6. ✅ 25+ suspicious TLDs
7. ✅ URL obfuscation techniques
8. ✅ Double extension attacks
9. ✅ Social engineering filenames
10. ✅ File masquerading

### 💰 Cost

**100% FREE FOREVER**
- All features use free services and APIs
- No paid subscriptions required
- No API keys with costs
- OpenPhish: Free unlimited access
- All detection algorithms: Client-side only

### 🔒 Privacy

- All URL analysis performed locally (client-side)
- OpenPhish feed downloaded and cached locally
- No user browsing data sent to external servers
- No tracking or telemetry

## [1.0.1] - Previous Version

### Features
- Basic suspicious domain detection (LOTS Project)
- Dangerous file extension blocking
- Customizable alert frequency
- Trusted domain whitelist
- Download warnings

---

## Upgrade Notes

When upgrading from 1.x to 2.0:
- OpenPhish feed will download automatically on first run (~10-30 seconds)
- All existing settings and trusted domains are preserved
- New threat detection runs automatically, no configuration needed
- Download warnings now include detailed threat analysis
