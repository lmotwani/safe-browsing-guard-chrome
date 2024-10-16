// Default user options
export const defaultUserOptions = {
    alertFrequency: 'daily',
    customDomains: [],
    customExtensions: [],
    trustedDomains: [],
    bypassWarningsUntil: {}
};

// List of suspicious domains (including subdomains)
export const suspiciousDomains = [
    "raw.githubusercontent.com", "github.com", "1drv.ms", "1drv.com", "docs.google.com",
    "drive.google.com", ".azurewebsites.net", "dropbox.com", "mega.nz", "pcloud.com",
    ".amazonaws.com", ".twitter.com", ".web.core.windows.net", ".blob.core.windows.net",
    ".box.com", "sites.google.com", ".cloudfront.net", "bitbucket.io", "bitbucket.org",
    "firebasestorage.googleapis.com", "storage.googleapis.com", ".herokuapp.com", ".zendesk.com",
    ".cloudwaysapps.com", ".netlify.app", ".cloudapp.azure.com", ".cloudapp.net", "gitlab.com",
    "filetransfer.io", ".sendspace.com", "wetransfer.com", "cdn.fbsbx.com", "mediafire.com",
    "cdn.discordapp.com", ".workers.dev", "slack-files.com", "youtube.com", "reddit.com",
    "pastebin.com", ".sharepoint.com", "onedrive.live.com", "app.milanote.com", ".appspot.com",
    ".wordpress.com", ".azureedge.net", ".tumblr.com", ".backblazeb2.com", ".blogspot.com",
    ".translate.goog", ".googleusercontent.com", ".typeform.com", ".github.io", ".web.app",
    ".firebaseapp.com", ".webflow.io", "icloud.com", ".duckdns.org", ".pages.dev",
    "googleweblight.com", "forms.office.com", "sway.office.com", "discord.com", "slack.com",
    "api.telegram.org", ".gofile.io", ".instagram.com", "facebook.com", ".glitch.me", "bit.ly",
    ".trycloudflare.com", "beautiful.ai", "siasky.net", ".clickfunnels.com", ".docusign.com",
    ".digitaloceanspaces.com", ".godaddysites.com", ".weebly.com", "www.canva.com", "t.co",
    ".mybluemix.net", "appdomain.cloud", "archive.org", "spark.adobe.com", ".atlassian.net",
    "dogechain.info", "paste.ee", "gitee.com", ".rf.gd", "viewer.joomag.com", "my.visme.co",
    "archive.ph", "docsend.com", ".nimbusweb.me", ".oraclecloud.com", ".azurefd.net", "parg.co",
    ".ngrok.io", "codepen.io", "pastetext.net", "notion.so", ".wixsite.com",
    "attachment.outlook.live.net", "attachments.office.net", "lnkd.in", ".myportfolio.com",
    ".notion.site", ".wasabisys.com", "rebrand.ly", "rb.gy", "genius.com", "inmotionhosting.com",
    "stonly.com", ".csb.app", ".codesandbox.io", ".000webhostapp.com", ".hostingerapp.com",
    "feedproxy.google.com", ".pagecloud.com", ".format.com", "s.id", "doc.clickup.com",
    "ufile.io", "onenoteonlinesync.onenote.com", "12ft.io", ".doubleclick.net",
    "t.m1.email.samsung.com", ".repl.co", "teletype.in", ".easywp.com", "telegra.ph",
    "filebin.net", ".fyi.to", "nt.embluemail.com", "transfer.sh", "ct.sendgrid.net",
    "nethunt.com", "trello.com", "evernote.com", "track.adform.net", ".xiti.com", "wtools.io",
    "i.imgur.com", "workflowy.com", ".mybluehost.me", ".ondigitalocean.app", ".axshare.com",
    "rentry.co", "zerobin.net", "textbin.net", "ideone.com", "4sync.com", "pastebin.pl",
    "www.uplooder.net", "graph.microsoft.com", "pastie.org", ".slab.com", ".dropmark.com",
    "filecloudonline.com", "tinyurl.com", ".azurestaticapps.net", "termbin.com", "sprunge.us",
    ".plesk.page", "cutt.ly", ".on.aws", ".mystrikingly.com", "www.surveycake.com",
    "anonfiles.com", ".linodeobjects.com", "express.adobe.com", ".fleek.co", "localhost.run",
    ".requestbin.net", "clbin.com", "ix.io", ".netlify.com",
    "sync.com", "yandex.disk", "files.fm", "uptobox.com", "bayfiles.com",
    "tinyurl.is", "is.gd", "buff.ly", "owl.ly", "goo.gl",
    ".ddns.net", ".no-ip.com",
    "jsfiddle.net", "repl.it", "gist.github.com",
    "discord.gg", "t.me",
    "zippyshare.com", "anonfile.com", "gofile.io", "uploadfiles.io", "vshare.eu",
    "userscloud.com", "krakenfiles.com", "mexashare.com", "rapidgator.net", "nitroflare.com",
    "keep2share.cc", "datafilehost.com", "filefactory.com", "dfiles.ru", "turbobit.net",
    "hitfile.net", "1fichier.com", "uploadgig.com",
    "adf.ly", "bc.vc", "ouo.io", "shorte.st", "linkvertise.com",
    ".hopto.org",
    "freemyip.com",
    "pastebin.mozilla.org", "dpaste.com", "gist.githubusercontent.com", "controlc.com",
    "justpaste.it", "hastebin.com",
    "sendbig.com", "smash.gg", "sendspace.com",
    ".xyz", ".top", ".bid", ".loan", ".win",
    ".aliyun.com",
    ".cloudsigma.com",
    "sendgrid.net",
    "mailgun.net",
    "strawpoll.me",
    "web.archive.org",
    "mega.io" // Added here
];

// Suspicious file extensions
export const suspiciousExtensions = [
    ".7z", ".a3x", ".appinstaller", ".application", ".appref-ms", ".appx", ".appxbundle",
    ".arj", ".asd", ".bat", ".bgi", ".bz2", ".cab", ".chm", ".cmd", ".com", ".cpl", ".cs", ".daa",
    ".desktopthemepackfile", ".diagcab", ".dll", ".dmg", ".doc", ".docm", ".dot", ".dotm", ".eml",
    ".exe", ".gadget", ".gz", ".hta", ".htm", ".html", ".hwpx", ".ics", ".img", ".iqy", ".iso",
    ".jar", ".jnlp", ".js", ".jse", ".library-ms", ".lnk", ".mam", ".mht", ".mhtml", ".mof", ".msc",
    ".msi", ".msrcincident", ".ocx", ".odt", ".oxps", ".pdf", ".pif", ".pot", ".potm", ".ppa",
    ".ppam", ".ppkg", ".pps", ".ppsm", ".ppt", ".pptm", ".ps1", ".pub", ".py", ".pyc", ".pyo",
    ".pyw", ".pyz", ".pyzw", ".rar", ".reg", ".rtf", ".scf", ".scpt", ".scr", ".sct",
    ".searchConnector-ms", ".service", ".settingcontent-ms", ".sh", ".sldm", ".slk", ".so", ".svg",
    ".tar", ".theme", ".themepack", ".timer", ".url", ".uue", ".vb", ".vbe", ".vbs", ".vhd", ".vhdx",
    ".wbk", ".website", ".wim", ".wiz", ".ws", ".wsf", ".wsh", ".xlam", ".xll", ".xlm", ".xls",
    ".xlsb", ".xlsm", ".xlt", ".xltm", ".xps", ".xsl", ".xz", ".z", ".zip"
];

// Function to check if a domain is suspicious
export function isSuspiciousDomain(url) {
    try {
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname;

        return suspiciousDomains.some(suspiciousDomain => {
            if (suspiciousDomain.startsWith('.')) {
                return domain.endsWith(suspiciousDomain);
            } else {
                return domain === suspiciousDomain || domain.endsWith('.' + suspiciousDomain);
            }
        });
    } catch (e) {
        console.error('Invalid URL:', url);
        return false;
    }
}

// Function to check if a file extension is suspicious
export function isSuspiciousExtension(fileUrl) {
    const extension = fileUrl.split('.').pop();
    return suspiciousExtensions.includes(`.${extension}`);
}
