package org.sushitrsh.vscodemobile;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private static final String START_URL = "https://vscode.dev/?vscode-lang=id-id";

    private WebView webView;
    private ProgressBar progressBar;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        progressBar = findViewById(R.id.progressBar);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMediaPlaybackRequiresUserGesture(false);
        // Needed so vscode.dev can persist workspace state, extensions, settings sync, etc.
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);

        // vscode.dev opens GitHub sign-in / settings sync in a popup window.
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(android.view.View.GONE);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                if (newProgress >= 100) {
                    progressBar.setVisibility(android.view.View.GONE);
                } else {
                    progressBar.setVisibility(android.view.View.VISIBLE);
                }
            }

            // Handle popup windows (GitHub OAuth login, Settings Sync, etc.)
            // Shown in a full-screen dialog so the login flow is visible, then closes itself.
            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                final android.app.Dialog popupDialog = new android.app.Dialog(MainActivity.this, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
                WebView popup = new WebView(MainActivity.this);
                WebSettings popupSettings = popup.getSettings();
                popupSettings.setJavaScriptEnabled(true);
                popupSettings.setDomStorageEnabled(true);
                popup.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView v, String url) {
                        // Close the popup once the OAuth flow redirects back to vscode.dev
                        if (url != null && url.contains("vscode.dev")) {
                            popupDialog.dismiss();
                            return true;
                        }
                        return false;
                    }
                });
                popup.setWebChromeClient(new WebChromeClient() {
                    @Override
                    public void onCloseWindow(WebView w) {
                        popupDialog.dismiss();
                    }
                });

                popupDialog.setContentView(popup);
                popupDialog.setOnDismissListener(d -> popup.destroy());
                popupDialog.show();

                android.webkit.WebView.WebViewTransport transport = (android.webkit.WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(popup);
                resultMsg.sendToTarget();
                return true;
            }
        });

        webView.loadUrl(START_URL);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
