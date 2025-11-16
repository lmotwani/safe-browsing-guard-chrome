# Safe Browsing Guard v2.0 - Advanced Threat Protection 🛡️

**Production-Ready Chrome Extension for Advanced Phishing & Malware Protection**

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-Apache%202.0-green)
![Manifest](https://img.shields.io/badge/manifest-v3-orange)
![Free](https://img.shields.io/badge/cost-FREE%20FOREVER-brightgreen)

---

## 🚀 What's New in v2.0

### Advanced Threat Detection
- **Homograph Attack Detection**: Catches sophisticated IDN spoofing using Cyrillic/Greek lookalike characters
- **Typosquatting Detection**: Identifies domains mimicking popular brands (paypa1.com, g00gle.com)
- **OpenPhish Integration**: Real-time phishing database with 10,000+ known phishing URLs
- **URL Obfuscation Detection**: Identifies IP addresses, @ tricks, data URIs, and encoding abuse
- **Download Analysis**: Advanced file inspection with double extension and RTLO attack detection
- **Risk Scoring**: Intelligent 0-100 risk assessment for every URL and download

### Enhanced User Experience
- **Smart Icon Updates**: Visual indicators change based on threat level (even for pinned extensions)
- **Detailed Threat Breakdown**: See exactly why a site or download is flagged
- **Severity Levels**: Color-coded warnings (Critical/High/Medium/Low)
- **Phishing Alerts**: Immediate warnings for known phishing sites

---

## 📊 Detection Capabilities

✅ **150+ Suspicious Domains** (LOTS Project)
✅ **100+ Dangerous File Extensions**
✅ **10,000+ Known Phishing URLs** (OpenPhish)
✅ **Homograph Attacks** (IDN/Punycode spoofing)
✅ **Typosquatting** (50+ popular brands)
✅ **25+ Suspicious TLDs** (.tk, .ml, .ga, .xyz, etc.)
✅ **URL Obfuscation** (IP addresses, @ tricks, data URIs)
✅ **Double Extension Attacks** (invoice.pdf.exe)
✅ **Social Engineering** (urgent keywords in filenames)
✅ **File Masquerading** (executables pretending to be documents)

---

## 💰 Cost

**100% FREE FOREVER** - No subscriptions, no API keys, no hidden costs

All features use:
- Free APIs with generous limits
- Client-side processing for privacy
- Open-source threat feeds
- No data collection or tracking

---

## 🔒 Privacy & Security

- ✅ All URL analysis performed **locally** (client-side)
- ✅ OpenPhish feed cached **locally** for offline protection
- ✅ **Zero telemetry** - no browsing data sent to external servers
- ✅ No tracking or user profiling
- ✅ Open-source codebase for transparency

---

## 📦 Installation

### From Chrome Web Store (Recommended)
_Coming soon - under review_

### Manual Installation (Developer Mode)
1. Download the `safe-browsing-guard-v2.0.0.zip` release
2. Extract to a folder
3. Open Chrome and go to `chrome://extensions/`
4. Enable **Developer mode** (top right)
5. Click **Load unpacked**
6. Select the extracted folder
7. Done! The extension will start protecting you immediately

---

## 🎯 How It Works

### On-Page Protection
When you visit a website, Safe Browsing Guard:
1. ✅ Checks domain against LOTS Project suspicious domains
2. ✅ Analyzes URL for homograph attacks and typosquatting
3. ✅ Queries local OpenPhish database for known phishing sites
4. ✅ Detects URL obfuscation techniques
5. ✅ Calculates risk score and displays appropriate warnings
6. ✅ Updates extension icon to reflect threat level

### Download Protection
When you download a file, Safe Browsing Guard:
1. ✅ Analyzes filename for suspicious patterns
2. ✅ Checks for double extension attacks
3. ✅ Detects hidden extensions (spaces, RTLO attacks)
4. ✅ Identifies social engineering keywords
5. ✅ Checks source URL for threats
6. ✅ **Pauses download** and shows detailed warning popup

### Visual Indicators

| Icon | Status | Meaning |
|------|--------|---------|
| ![Green](icons/icon16.png) | ✅ Safe | No threats detected |
| ![Orange](icons/icon-warning-svg.png) | ⚠️ Warning | Suspicious domain/activity detected |

**Hover over the icon** to see:
- "Safe Browsing Guard - No Threats Detected"
- "⚠️ Safe Browsing Guard - Warning!"
- "🎣 Safe Browsing Guard - PHISHING DETECTED!"
- "⚠️ Safe Browsing Guard - High Risk (85/100)"

---

## ⚙️ Configuration

### Alert Frequency
- **Always**: Show warnings every time
- **Daily**: Once per domain per day
- **Weekly**: Once per domain per week
- **Never**: Disable on-page alerts (download warnings still active)

### Custom Lists
- **Trusted Domains**: Whitelist domains you trust
- **Custom Suspicious Domains**: Add your own suspicious domains
- **Custom File Extensions**: Add additional dangerous file types

### 24-Hour Bypass
Check "Don't show warnings for this domain for 24 hours" on any alert to temporarily suppress warnings.

---

## 🧪 Testing the Extension

### Test Homograph Detection
Try visiting: `xn--80ak6aa92e.com` (Apple in Cyrillic)

### Test Typosquatting Detection
Try: `gooogle.com`, `paypa1.com`, `facebok.com`

### Test Suspicious TLDs
Try any domain with: `.tk`, `.ml`, `.ga`, `.xyz`, `.top`

### Test Download Protection
Try downloading a file named: `invoice.pdf.exe` or `urgent_payment.exe`

### Test OpenPhish
The extension will automatically detect known phishing URLs from the OpenPhish database.

**Note**: For safety, these are example patterns. The extension will warn you about real threats.

---

## 📈 Performance

- **Lightweight**: < 100KB total size
- **Fast**: Client-side analysis with no API delays
- **Efficient**: Minimal memory footprint (~5-10MB)
- **Offline-Ready**: Works without internet (uses cached OpenPhish data)
- **Battery-Friendly**: No continuous background processing

---

## 🛠️ Technical Details

### Architecture
```
safe-browsing-guard/
├── manifest.json              # Extension manifest (v3)
├── background.js              # Service worker & core logic
├── advancedDetection.js       # URL threat analysis engine
├── downloadAnalyzer.js        # Download analysis & OpenPhish
├── config.js                  # Domain/extension lists
├── utils.js                   # Utility functions
├── popup.html/js/css          # Download warning UI
├── options.html/js/css        # Settings page
└── icons/                     # Extension icons
```

### APIs Used
- **OpenPhish**: Free phishing URL feed (hourly updates)
- **Chrome Extensions API**: tabs, downloads, storage, scripting
- **Manifest V3**: Modern Chrome extension platform

### Storage Usage
- **Local Storage**: OpenPhish feed (~500KB-1MB)
- **Sync Storage**: User preferences (~5-10KB)
- **Total**: < 2MB

---

## 🐛 Troubleshooting

### OpenPhish Not Updating
- Check console for errors: `chrome://extensions/` → Details → Inspect views → background.html
- Logs show: `OpenPhish: Feed updated successfully - XXXX URLs loaded`
- If failed: Extension uses cached data or falls back to other detection methods

### Icons Not Changing
- Ensure you're on an HTTP/HTTPS site (not chrome:// or file://)
- Check that domain isn't in "Trusted Domains" list
- Try reloading the extension

### Warnings Not Showing
- Check Alert Frequency setting (not set to "Never")
- Verify domain isn't in bypass list
- Check if you dismissed a daily/weekly warning already

### Storage Quota Exceeded
- OpenPhish feed limits to 10,000 URLs
- Clear browser data if needed
- Extension will work in memory-only mode if storage fails

---

## 🤝 Contributing

### Reporting Issues
Found a bug or false positive? Please report:
1. Browser version
2. Extension version
3. URL/domain causing issue
4. Expected vs actual behavior
5. Console logs (if applicable)

### Feature Requests
Have ideas for improvements? Submit a feature request with:
1. Use case description
2. Proposed implementation
3. Why it would benefit users

---

## 📄 License

Apache License 2.0 - See [LICENSE](LICENSE) for details

---

## 📚 Resources

### Threat Databases
- [LOTS Project](https://lots-project.com/) - Living Off Trusted Sites
- [OpenPhish](https://openphish.com/) - Community phishing feed
- [FileSec](https://filesec.io/) - Dangerous file extensions

### Educational
- [FTC: How to Recognize Phishing](https://consumer.ftc.gov/articles/how-recognize-and-avoid-phishing-scams)
- [FTC: Malware Protection](https://consumer.ftc.gov/articles/malware-how-protect-against-detect-and-remove-it)
- [VirusTotal](https://www.virustotal.com/) - File scanning service

---

## 📞 Support

- **Documentation**: See [CHANGELOG.md](CHANGELOG.md) for version history
- **Privacy Policy**: See [privacy_policy.md](privacy_policy.md)
- **Issues**: Report bugs via GitHub Issues
- **Questions**: Check readme.md for additional information

---

## ⭐ Star This Project

If this extension helps protect you from threats, please consider:
- ⭐ Starring the repository
- 📢 Sharing with friends and colleagues
- 💬 Leaving a review on Chrome Web Store
- ☕ Supporting the developer

---

**Made with ❤️ for a safer internet**

*Last updated: November 16, 2025*
*Version: 2.0.0*
