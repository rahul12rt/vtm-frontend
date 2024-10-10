import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

export const decrypt = (cipherText, key = ENCRYPTION_KEY) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Error decrypting data: ", error);
    return null;
  }
};
