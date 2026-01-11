import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  // Secret key - nên thay đổi thành key phức tạp hơn
  // Hoặc lấy từ environment config
  private readonly SECRET_KEY = 'HAU_EXAM_SYSTEM_2026_SECRET_KEY_DO_NOT_SHARE';

  /**
   * Mã hóa string
   */
  encrypt(text: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(text, this.SECRET_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('❌ Lỗi mã hóa:', error);
      return '';
    }
  }

  /**
   * Giải mã string
   */
  decrypt(encryptedText: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, this.SECRET_KEY).toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('❌ Lỗi giải mã:', error);
      return '';
    }
  }

  /**
   * Hash string (one-way, không thể giải mã)
   */
  hash(text: string): string {
    return CryptoJS.SHA256(text).toString();
  }
}
