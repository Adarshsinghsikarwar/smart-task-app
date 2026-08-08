import Constants from "expo-constants";

const getApiUrl = () => {
  // If not in development mode (i.e. compiled APK/production build)
  if (!__DEV__) {
    return "https://smart-task-app-backend.onrender.com/api";
  }

  // If running via Expo Go, hostUri contains the development server IP (e.g. "192.168.1.100:8081")
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.developer?.projectUrl;
  if (hostUri) {
    const ip = hostUri.split(":")[0].replace("exp://", "");
    return `http://${ip}:5000/api`;
  }
  
  // Default fallback for emulator / standard localhost
  return "http://10.0.2.2:5000/api";
};

export const API_URL = getApiUrl();
console.log("[Flucy Config] Detected API Base URL:", API_URL);
