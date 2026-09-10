import axios from "axios";
import * as SecureStore from "expo-secure-store";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const freeRoutes = ["/login", "/refreshLogin", "/register"];

export const axiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 5000,
  headers: {
    Authorization: extractAccessToken()
      ? `Bearer ${extractAccessToken()}`
      : null,
  },
});

function extractAccessToken() {
  return SecureStore.getItem("accessToken");
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = extractAccessToken();
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    // pegando requisição que foi tentada sem sucesso
    const originalConfig = err.config;

    if (!freeRoutes.includes(originalConfig.url) && err.response) {
      // access token expirado retoranando 401
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          const rs = await axiosInstance.post("/refreshLogin", {
            refreshToken: SecureStore.getItem("refreshToken"),
          });

          const { accessToken, refreshToken } = rs.data;

          SecureStore.setItem("accessToken", accessToken);
          SecureStore.setItem("refreshToken", refreshToken);

          return axiosInstance(originalConfig);
        } catch (_error) {
          return Promise.reject(_error);
        }
      }
    }

    return Promise.reject(err);
  },
);
