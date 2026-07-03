import React, { useState } from "react";
import { View, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { colors } from "./src/theme";
import HomeScreen from "./src/screens/HomeScreen";
import DownloadsScreen, { DownloadItem } from "./src/screens/DownloadsScreen";
import MoreScreen from "./src/screens/MoreScreen";
import BottomNav, { Screen } from "./src/components/BottomNav";
import DownloadSheet from "./src/components/DownloadSheet";
import { onDownloadProgress } from "./src/services/YtdlpBridge";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  React.useEffect(() => {
    return onDownloadProgress((p) => {
      setDownloads((prev) =>
        prev.map((d) =>
          d.id === p.downloadId ? { ...d, status: p.status, percent: p.percent } : d
        )
      );
    });
  }, []);

  const handleSubmitUrl = (url: string) => setSheetUrl(url);

  const handleDownloadStarted = (label: string) => {
    setDownloads((prev) => [
      {
        id: String(Date.now()),
        title: "Mengambil info…",
        channel: "",
        type: "Video",
        quality: label,
        status: "queued",
        percent: 0,
      },
      ...prev,
    ]);
    setScreen("downloads");
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={{ flex: 1 }}>
        {screen === "home" && (
          <HomeScreen onSubmitUrl={handleSubmitUrl} onOpenDownloads={() => setScreen("downloads")} />
        )}
        {screen === "downloads" && <DownloadsScreen downloads={downloads} />}
        {screen === "more" && <MoreScreen />}
      </View>

      <BottomNav screen={screen} setScreen={setScreen} />

      <DownloadSheet
        url={sheetUrl}
        visible={!!sheetUrl}
        onClose={() => setSheetUrl(null)}
        onDownloadStarted={handleDownloadStarted}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
