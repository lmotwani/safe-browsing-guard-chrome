import { suspiciousDomains, suspiciousExtensions, defaultUserOptions } from './config.js';
import { getWeekNumber, isSuspiciousDomain, isSuspiciousExtension, showSubtleAlert } from './utils.js';
import { analyzeURL } from './advancedDetection.js';
import { analyzeDownload, OpenPhishFeed } from './downloadAnalyzer.js';

let userOptions = { ...defaultUserOptions };
const shownDownloadWarnings = new Set();

// Initialize OpenPhish feed
const openPhishFeed = new OpenPhishFeed();

const educationalResources = [
    {
        title: "Understanding Phishing Attacks",
        url: "https://consumer.ftc.gov/articles/how-recognize-and-avoid-phishing-scams"
    },
    {
        title: "Malware Prevention Tips",
        url: "https://consumer.ftc.gov/articles/malware-how-protect-against-detect-and-remove-it"
    },
    {
        title: "Safe Browsing Practices",
        url: "https://www.techtarget.com/searchsecurity/definition/malware"
    },
    {
        title: "Scan files with VirusTotal",
        url: "https://www.virustotal.com/gui/home/upload"
    }
];

async function loadUserOptions() {
    try {
        const data = await chrome.storage.sync.get(['userOptions']);
        userOptions = data.userOptions || { ...defaultUserOptions };
        if (!userOptions.bypassWarningsUntil) {
            userOptions.bypassWarningsUntil = {};
        }
    } catch (error) {
        console.error("Error loading user options:", error);
    }
}

async function saveUserOptions() {
    try {
        await chrome.storage.sync.set({ userOptions });
    } catch (error) {
        console.error("Error saving user options:", error);
    }
}

async function markSiteVisited(domain) {
    try {
        await chrome.storage.local.set({
            [domain]: {
                lastVisited: Date.now(),
                date: new Date().getDate()
            }
        });
    } catch (error) {
        console.error("Error marking site visited:", error);
    }
}

async function hasSiteBeenFlaggedToday(domain) {
    try {
        const data = await chrome.storage.local.get([domain]);
        const visitData = data[domain];
        return visitData && visitData.date === new Date().getDate();
    } catch (error) {
        console.error("Error checking site flags:", error);
        return false;
    }
}

async function markSiteVisitedThisWeek(domain) {
    try {
        const thisWeek = getWeekNumber(new Date());
        await chrome.storage.local.set({
            [`${domain}_week`]: {
                week: thisWeek,
                timestamp: Date.now()
            }
        });
    } catch (error) {
        console.error("Error marking weekly visit:", error);
    }
}

async function hasSiteBeenFlaggedThisWeek(domain) {
    try {
        const data = await chrome.storage.local.get([`${domain}_week`]);
        const weekData = data[`${domain}_week`];
        return weekData && weekData.week === getWeekNumber(new Date());
    } catch (error) {
        console.error("Error checking weekly flags:", error);
        return false;
    }
}

async function checkUrlAndShowAlert(url, tabId) {
    if (!userOptions || userOptions.alertFrequency === 'never') return;

    try {
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname;

        if (domain === 'chrome.google.com' && parsedUrl.pathname.startsWith('/webstore')) {
            return;
        }

        if (!userOptions.bypassWarningsUntil) {
            userOptions.bypassWarningsUntil = {};
        }

        const bypassUntil = userOptions.bypassWarningsUntil[domain];
        if (bypassUntil && bypassUntil > Date.now()) return;

        if (!userOptions.trustedDomains) {
            userOptions.trustedDomains = [];
        }

        // Check if domain is trusted
        if (userOptions.trustedDomains.includes(domain)) return;

        // Traditional suspicious domain check
        const suspiciousDomainResult = isSuspiciousDomain(url, userOptions, suspiciousDomains);

        // Advanced threat detection
        const advancedAnalysis = analyzeURL(url);

        // Check OpenPhish database
        const phishCheck = await openPhishFeed.checkURL(url);

        // Determine if we should show alert
        const isThreatDetected = suspiciousDomainResult || advancedAnalysis.detected || phishCheck.detected;

        if (isThreatDetected) {
            const shouldShow = userOptions.alertFrequency === 'always' ||
                (userOptions.alertFrequency === 'daily' && !(await hasSiteBeenFlaggedToday(domain))) ||
                (userOptions.alertFrequency === 'weekly' && !(await hasSiteBeenFlaggedThisWeek(domain)));

            if (shouldShow) {
                // Build comprehensive alert message
                let alertMessage = `⚠️ Security Warning: ${domain}\n\n`;

                if (phishCheck.detected) {
                    alertMessage += `🎣 PHISHING DETECTED: This URL is in the OpenPhish database of known phishing sites!\n\n`;
                }

                if (suspiciousDomainResult) {
                    alertMessage += `This domain is flagged as potentially suspicious and may be abused for phishing or malware distribution.\n\n`;
                }

                if (advancedAnalysis.detected) {
                    alertMessage += `Advanced threats detected:\n`;
                    advancedAnalysis.threats.slice(0, 3).forEach(threat => {
                        alertMessage += `• ${threat.message}\n`;
                    });

                    if (advancedAnalysis.riskScore > 0) {
                        alertMessage += `\nRisk Score: ${advancedAnalysis.riskScore}/100\n`;
                    }
                }

                alertMessage += `\nProceed with extreme caution!`;

                await showSubtleAlert(alertMessage, tabId);

                if (userOptions.alertFrequency === 'daily') {
                    await markSiteVisited(domain);
                } else if (userOptions.alertFrequency === 'weekly') {
                    await markSiteVisitedThisWeek(domain);
                }
            }
        }
    } catch (error) {
        console.error("Error in checkUrlAndShowAlert:", error);
    }
}

async function updateTabIcon(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        if (tab && tab.url) {
            const suspiciousDomainResult = isSuspiciousDomain(tab.url, userOptions, suspiciousDomains);
            const iconPath = suspiciousDomainResult
                ? {
                    "16": "icons/icon-warning-svg.png",
                    "48": "icons/icon-warning-svg.png",
                    "128": "icons/icon-warning-svg.png"
                }
                : {
                    "16": "icons/icon16.png",
                    "48": "icons/icon48.png",
                    "128": "icons/icon128.png"
                };

            await chrome.action.setIcon({
                tabId: tabId,
                path: iconPath
            });
        }
    } catch (error) {
        console.error("Error updating tab icon:", error);
    }
}

async function showWarningPopup(downloadItem, downloadAnalysis, urlAnalysis, phishCheck) {
    const uniqueDownloadId = `${downloadItem.url}-${downloadItem.filename}`;

    if (shownDownloadWarnings.has(uniqueDownloadId)) return;

    shownDownloadWarnings.add(uniqueDownloadId);

    let url, domain;
    if (downloadItem.url.startsWith('blob:')) {
        url = new URL(downloadItem.referrer);
        domain = url.hostname;
    } else {
        url = new URL(downloadItem.url);
        domain = url.hostname;
    }

    const fileExtension = downloadItem.filename.split('.').pop().toLowerCase();

    const isDomainSuspicious = isSuspiciousDomain(url.href, userOptions, suspiciousDomains);
    const isExtensionSuspicious = isSuspiciousExtension(fileExtension, userOptions, suspiciousExtensions);

    // Build comprehensive threat details
    const threatDetails = {
        downloadThreats: downloadAnalysis.detected ? downloadAnalysis.threats : [],
        urlThreats: urlAnalysis.detected ? urlAnalysis.threats : [],
        phishingDetected: phishCheck.detected,
        riskScore: Math.max(downloadAnalysis.riskScore || 0, urlAnalysis.riskScore || 0)
    };

    const urlParams = new URLSearchParams({
        url: downloadItem.url,
        referrer: downloadItem.referrer,
        filename: downloadItem.filename,
        downloadId: downloadItem.id.toString(),
        suspiciousDomain: isDomainSuspicious.toString(),
        suspiciousExtension: isExtensionSuspicious.toString(),
        threatDetails: JSON.stringify(threatDetails)
    });

    try {
        await chrome.tabs.create({
            url: `popup.html?${urlParams.toString()}`,
            active: true
        });
    } catch (error) {
        console.error("Error showing warning popup:", error);
    }
}

function exportOptions() {
    const exportData = JSON.stringify(userOptions);
    const blob = new Blob([exportData], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
        url: url,
        filename: 'safe_browsing_guard_options.json'
    });
}

async function importOptions(fileContent) {
    try {
        const importedOptions = JSON.parse(fileContent);
        userOptions = { ...defaultUserOptions, ...importedOptions };
        await saveUserOptions();
        return { success: true, message: "Options imported successfully" };
    } catch (error) {
        console.error("Error importing options:", error);
        return { success: false, message: "Failed to import options" };
    }
}

(async () => {
    await loadUserOptions();

    // Initialize OpenPhish feed
    await openPhishFeed.initialize();
    console.log('OpenPhish feed initialized:', openPhishFeed.getStats());

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
            await updateTabIcon(tabId);
            await checkUrlAndShowAlert(tab.url, tabId);
        }
    });

    chrome.tabs.onActivated.addListener(async (activeInfo) => {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab.url && tab.url.startsWith('http')) {
            await updateTabIcon(activeInfo.tabId);
            await checkUrlAndShowAlert(tab.url, activeInfo.tabId);
        }
    });

    chrome.downloads.onCreated.addListener(async (downloadItem) => {
        try {
            let checkUrl;
            if (downloadItem.url.startsWith('blob:')) {
                checkUrl = downloadItem.referrer;
            } else {
                checkUrl = downloadItem.url;
            }

            const referrerUrl = new URL(checkUrl);
            const domain = referrerUrl.hostname;
            const fileExtension = downloadItem.filename.split('.').pop().toLowerCase();

            // Traditional checks
            const isDomainSuspicious = isSuspiciousDomain(checkUrl, userOptions, suspiciousDomains);
            const isExtensionSuspicious = isSuspiciousExtension(fileExtension, userOptions, suspiciousExtensions);

            // Advanced download analysis
            const downloadAnalysis = analyzeDownload(downloadItem);

            // Advanced URL analysis
            const urlAnalysis = analyzeURL(checkUrl);

            // Check OpenPhish database
            const phishCheck = await openPhishFeed.checkURL(checkUrl);

            // Determine if download is suspicious
            const isSuspicious = isDomainSuspicious ||
                                isExtensionSuspicious ||
                                downloadAnalysis.detected ||
                                urlAnalysis.detected ||
                                phishCheck.detected;

            if (isSuspicious) {
                await chrome.downloads.pause(downloadItem.id);
                await showWarningPopup(downloadItem, downloadAnalysis, urlAnalysis, phishCheck);
            }
        } catch (error) {
            console.error("Error handling suspicious download:", error);
        }
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        const handlers = {
            async continueDownload() {
                try {
                    await chrome.downloads.resume(request.downloadId);
                    sendResponse({ success: true });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
            },
            async cancelDownload() {
                try {
                    const downloadItem = await chrome.downloads.search({id: request.downloadId});
                    if (downloadItem.length > 0) {
                        await chrome.downloads.cancel(request.downloadId);
                        if (downloadItem[0].filename) {
                            await chrome.downloads.removeFile(request.downloadId);
                        }
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ success: false, error: "Download not found" });
                    }
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
            },
            async bypassWarnings() {
                const domain = request.domain;
                userOptions.bypassWarningsUntil[domain] = Date.now() + (24 * 60 * 60 * 1000);
                await saveUserOptions();
                sendResponse({ success: true });
            },
            async updateUserOptions() {
                userOptions = request.options;
                await saveUserOptions();
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tabs.length > 0) {
                    await updateTabIcon(tabs[0].id);
                    await checkUrlAndShowAlert(tabs[0].url, tabs[0].id);
                }
                sendResponse({ success: true });
            },
            async openOptionsPage() {
                await chrome.runtime.openOptionsPage();
                sendResponse({ success: true });
            },
            getEducationalResources() {
                sendResponse({ success: true, resources: educationalResources });
            },
            exportOptions() {
                exportOptions();
                sendResponse({ success: true });
            },
            async importOptions() {
                const result = await importOptions(request.fileContent);
                sendResponse(result);
            }
        };

        const handler = handlers[request.action];
        if (handler) {
            handler();
            return true; // Keep the message channel open for async response
        }
    });
})();

chrome.runtime.onInstalled.addListener(async () => {
    try {
        await chrome.action.setIcon({
            path: {
                "16": "icons/icon16.png",
                "48": "icons/icon48.png",
                "128": "icons/icon128.png"
            }
        });
    } catch (error) {
        console.error("Error setting default icon:", error);
    }
});

chrome.action.onClicked.addListener((tab) => {
    chrome.runtime.openOptionsPage();
});
