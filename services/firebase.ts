
import * as firebaseApp from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// --- HƯỚNG DẪN CẤU HÌNH FIREBASE CHO CPHACO ---
// 1. Truy cập https://console.firebase.google.com/
// 2. Tạo dự án mới (Ví dụ: cphaco-farm-manager)
// 3. Chọn biểu tượng Web (</>) để thêm ứng dụng web.
// 4. Copy nội dung object `firebaseConfig` và thay thế vào bên dưới.
// 5. Vào mục Firestore Database -> Create Database -> Start in Test Mode (để chạy thử).

// TODO: Thay thế thông tin bên dưới bằng cấu hình thật của bạn
const firebaseConfig = {
  apiKey: "AIzaSyAsBvL39fwkFirO5CBIuYA_6VsXO1p_8nc",
  authDomain: "quanlyhoamau.firebaseapp.com",
  projectId: "quanlyhoamau",
  storageBucket: "quanlyhoamau.firebasestorage.app",
  messagingSenderId: "38271039452",
  appId: "1:38271039452:web:9260b634eb15232b324119",
  measurementId: "G-TPSCCX96NZ"
};

// Kiểm tra xem đã cấu hình chưa (Dựa vào API Key mẫu)
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    // Use type assertion to avoid TypeScript error about missing export if types are mismatched
    // This handles cases where @types/firebase (v8) might be interfering with firebase (v9) imports
    app = (firebaseApp as any).initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.warn("Chưa cấu hình Firebase. Ứng dụng sẽ chạy ở chế độ Offline (LocalStorage).");
}

export { db };