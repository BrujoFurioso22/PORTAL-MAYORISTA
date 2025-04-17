// tokenService.js
import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY_TOKEN;

export const guardarToken = (token) => {
  const encrypted = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
  localStorage.setItem("token", encrypted);
};

export const obtenerToken = () => {
  const encrypted = localStorage.getItem("token");
  if (!encrypted) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};

export const guardarRefreshToken = (token) => {
  const encrypted = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
  localStorage.setItem("refresh_token", encrypted);
};

export const obtenerRefreshToken = () => {
  const encrypted = localStorage.getItem("refresh_token");
  if (!encrypted) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};

export const eliminarTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
};
