# BCOBCA Frontend

React Native + Expo SDK 58, Expo Router, TypeScript; dùng chung Android, iOS và Web. Repository: https://github.com/BCOBCA/frontend. API: https://github.com/BCOBCA/backend.

## Chạy độc lập

Cài Node.js phù hợp Expo SDK 58, rồi chạy trong thư mục clone:

```powershell
npm ci
Copy-Item .env.example .env
# Đặt API URL trong .env; backend cần chạy trước.
npm run web
```

Chỉ sao chép env mẫu khi chưa có `.env`. Nếu cổng 8081 đang bận, chạy `npm run web -- --port 8082` và thêm origin tương ứng vào CORS env của backend.

- Web: `EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api`.
- Android Emulator: `EXPO_PUBLIC_ANDROID_API_BASE_URL=http://10.0.2.2:5000/api`.
- Thiết bị thật: dùng LAN IP của máy chạy API, cấu hình listen/AllowedHosts/CORS trong backend env.
- `EXPO_PUBLIC_*` được đưa vào bundle, tuyệt đối không chứa secret.

```powershell
npm run android
npm run ios
```

Android cần thiết bị hoặc emulator đang chạy. iOS simulator cần macOS; native development build cần thiết lập Expo/EAS phù hợp. Chưa xác minh runtime native trên thiết bị; export bundle không thay thế kiểm thử đó.

## Kiểm tra

```powershell
npm run lint -- --max-warnings 0
npm run typecheck
npm test
npm run build
npx expo export --platform all
```

Trong workspace phát triển: lint/TypeScript sạch, 10 tests session/refresh đạt, bundle Web/Android/iOS xuất thành công. Audit hiện có 24 cảnh báo moderate trong Expo/ESLint tooling, không có high/critical; không force downgrade SDK.

`app/` chứa 41 route screens; `src/` chứa shared UI, API client, session/store và theme; `tests/` chứa API session regression tests. Năm tab chính: Trang chủ, Danh mục, Ưu đãi, Giỏ hàng, Thành viên. Các màn hình dùng API thật, có loading/error/empty state; không seed dữ liệu kinh doanh giả.

Thanh toán COD trước; báo giá dịch vụ chỉ xem, nhân viên xử lý tiếp. SMTP, nội dung chính sách/tài sản thương hiệu chính thức và production deployment cần cấu hình/kiểm tra tiếp.
