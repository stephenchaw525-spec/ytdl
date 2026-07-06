#!/usr/bin/env node
/**
 * after_prepare hook: Android's WebView does nothing when JS triggers a
 * file download (unlike a normal browser tab) unless the app explicitly
 * hands the request off to Android's DownloadManager. This patches the
 * generated MainActivity.java to add that hand-off, every time Cordova
 * regenerates the platforms/ folder.
 */
const fs = require("fs");
const path = require("path");

module.exports = function (context) {
  const projectRoot = context.opts.projectRoot;
  const configXml = fs.readFileSync(path.join(projectRoot, "config.xml"), "utf8");
  const idMatch = configXml.match(/id=["']([^"']+)["']/);
  if (!idMatch) {
    console.warn("[download-listener hook] Could not find widget id in config.xml, skipping.");
    return;
  }

  const pkgPath = idMatch[1].replace(/\./g, "/");
  const mainActivityPath = path.join(
    projectRoot, "platforms", "android", "app", "src", "main", "java", pkgPath, "MainActivity.java"
  );

  if (!fs.existsSync(mainActivityPath)) {
    console.warn("[download-listener hook] MainActivity.java not found at", mainActivityPath);
    return;
  }

  let content = fs.readFileSync(mainActivityPath, "utf8");
  if (content.includes("setDownloadListener")) {
    return; // already patched, nothing to do
  }

  const importBlock = [
    "import android.app.DownloadManager;",
    "import android.net.Uri;",
    "import android.os.Environment;",
    "import android.webkit.WebView;",
    "import android.webkit.URLUtil;",
    "import android.webkit.CookieManager;",
    "import android.content.Context;",
    "import android.widget.Toast;",
  ].join("\n");

  content = content.replace(/(package [^;]+;\n)/, `$1\n${importBlock}\n`);

  const downloadListenerCode = `
        WebView webView = (WebView) appView.getEngine().getView();
        webView.setDownloadListener(new android.webkit.DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                try {
                    DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                    request.addRequestHeader("User-Agent", userAgent);
                    String filename = URLUtil.guessFileName(url, contentDisposition, mimeType);
                    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);
                    DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                    dm.enqueue(request);
                    Toast.makeText(getApplicationContext(), "Mengunduh: " + filename, Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    Toast.makeText(getApplicationContext(), "Gagal mengunduh: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            }
        });
`;

  content = content.replace(/(loadUrl\([^)]*\);\n)/, `$1${downloadListenerCode}`);

  fs.writeFileSync(mainActivityPath, content, "utf8");
  console.log("[download-listener hook] Patched MainActivity.java successfully.");
};
