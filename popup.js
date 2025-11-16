document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const downloadId = parseInt(urlParams.get('downloadId'));
    const url = urlParams.get('url');
    const filename = urlParams.get('filename');
    const threatDetailsJSON = urlParams.get('threatDetails');

    document.getElementById('filename').textContent = filename || 'Unknown';
    document.getElementById('source').textContent = url || 'Unknown';

    // Display advanced threat information
    if (threatDetailsJSON) {
        try {
            const threatDetails = JSON.parse(decodeURIComponent(threatDetailsJSON));
            displayAdvancedThreats(threatDetails);
        } catch (error) {
            console.error('Error parsing threat details:', error);
        }
    }

    const resources = await getEducationalResources();

    const warningContent = document.querySelector('.warning-content');
    if (warningContent && resources.length > 0) {
        const resourcesList = document.createElement('ul');
        resources.forEach(resource => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = resource.url;
            a.textContent = resource.title;
            a.target = '_blank';
            li.appendChild(a);
            resourcesList.appendChild(li);
        });
        warningContent.appendChild(resourcesList);
    }

    const domain = new URL(url).hostname;
    let isTrusted = await isDomainTrusted(domain);
    updateUI(isTrusted);

    document.getElementById('whitelistButton').addEventListener('click', async () => {
        try {
            const { userOptions = { trustedDomains: [] } } = await chrome.storage.sync.get('userOptions');

            if (!isTrusted) {
                userOptions.trustedDomains.push(domain);
                await chrome.storage.sync.set({ userOptions });
                console.log(`${domain} added to trusted domains:`, userOptions.trustedDomains);
            } else {
                userOptions.trustedDomains = userOptions.trustedDomains.filter(d => d !== domain);
                await chrome.storage.sync.set({ userOptions });
                console.log(`${domain} removed from trusted domains:`, userOptions.trustedDomains);
            }

            await chrome.runtime.sendMessage({ action: 'updateUserOptions', options: userOptions });
            isTrusted = !isTrusted;
            updateUI(isTrusted);
        } catch (error) {
            console.error('Error updating trusted domains list:', error);
        }
    });

    document.getElementById('cancelButton').addEventListener('click', async () => {
        try {
            await chrome.runtime.sendMessage({
                action: 'cancelDownload',
                downloadId: downloadId
            });
        } catch (error) {
            console.error('Error canceling download:', error);
        } finally {
            window.close();
        }
    });

    document.getElementById('continueButton').addEventListener('click', async () => {
        try {
            if (document.getElementById('bypassWarnings').checked && url) {
                await chrome.runtime.sendMessage({
                    action: 'bypassWarnings',
                    domain: domain
                });
            }
    
            await chrome.runtime.sendMessage({
                action: 'continueDownload',
                downloadId: downloadId
            });
        } catch (error) {
            console.error('Error continuing download:', error);
        } finally {
            window.close();
        }
    });

    const closeButton = document.getElementById('closeButton');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            window.close();
        });
    }
});

async function getEducationalResources() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getEducationalResources' });
        if (response && response.success) {
            return response.resources;
        } else {
            console.error('Failed to fetch educational resources');
            return [];
        }
    } catch (error) {
        console.error('Error loading educational resources:', error);
        return [];
    }
}

async function isDomainTrusted(domain) {
    try {
        const { userOptions = { trustedDomains: [] } } = await chrome.storage.sync.get('userOptions');
        return userOptions.trustedDomains.includes(domain);
    } catch (error) {
        console.error('Error checking if domain is trusted:', error);
        return false;
    }
}

function updateUI(isTrusted) {
    const whitelistButton = document.getElementById('whitelistButton');
    if (whitelistButton) {
        whitelistButton.textContent = isTrusted ? 'Remove from Trusted Domains' : 'Add to Trusted Domains';
    }
}

function displayAdvancedThreats(threatDetails) {
    const warningContent = document.querySelector('.warning-content');
    if (!warningContent) return;

    // Create advanced threats section
    const threatsSection = document.createElement('div');
    threatsSection.className = 'advanced-threats';
    threatsSection.style.cssText = 'background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px;';

    let threatsHTML = '<h3 style="margin-top: 0; color: #856404;">🔍 Advanced Threat Analysis</h3>';

    // Show phishing detection
    if (threatDetails.phishingDetected) {
        threatsHTML += `
            <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 10px; margin: 10px 0; border-radius: 4px;">
                <strong style="color: #721c24;">🎣 PHISHING DETECTED</strong>
                <p style="margin: 5px 0; color: #721c24;">This URL is in the OpenPhish database of known phishing sites!</p>
            </div>
        `;
    }

    // Show risk score
    if (threatDetails.riskScore > 0) {
        const riskColor = threatDetails.riskScore > 70 ? '#dc3545' :
                         threatDetails.riskScore > 40 ? '#ffc107' : '#28a745';
        threatsHTML += `
            <div style="margin: 10px 0;">
                <strong>Risk Score:</strong>
                <span style="color: ${riskColor}; font-size: 1.2em; font-weight: bold;">${threatDetails.riskScore}/100</span>
            </div>
        `;
    }

    // Show download threats
    if (threatDetails.downloadThreats && threatDetails.downloadThreats.length > 0) {
        threatsHTML += '<div style="margin: 10px 0;"><strong>📁 Download Threats:</strong><ul style="margin: 5px 0;">';
        threatDetails.downloadThreats.forEach(threat => {
            const severityColor = {
                'critical': '#dc3545',
                'high': '#fd7e14',
                'medium': '#ffc107',
                'low': '#28a745'
            }[threat.severity] || '#6c757d';

            threatsHTML += `<li style="color: ${severityColor}; margin: 5px 0;">
                <strong>[${threat.severity.toUpperCase()}]</strong> ${threat.message}
            </li>`;
        });
        threatsHTML += '</ul></div>';
    }

    // Show URL threats
    if (threatDetails.urlThreats && threatDetails.urlThreats.length > 0) {
        threatsHTML += '<div style="margin: 10px 0;"><strong>🌐 URL Threats:</strong><ul style="margin: 5px 0;">';
        threatDetails.urlThreats.forEach(threat => {
            const severityColor = {
                'critical': '#dc3545',
                'high': '#fd7e14',
                'medium': '#ffc107',
                'low': '#28a745'
            }[threat.severity] || '#6c757d';

            threatsHTML += `<li style="color: ${severityColor}; margin: 5px 0;">
                <strong>[${threat.severity.toUpperCase()}]</strong> ${threat.message}
            </li>`;
        });
        threatsHTML += '</ul></div>';
    }

    threatsSection.innerHTML = threatsHTML;

    // Insert before file-info div
    const fileInfo = warningContent.querySelector('.file-info');
    if (fileInfo) {
        warningContent.insertBefore(threatsSection, fileInfo);
    } else {
        warningContent.appendChild(threatsSection);
    }
}
