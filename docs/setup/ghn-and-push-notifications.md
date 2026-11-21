# GHN test và thông báo đơn hàng

## Luồng đã triển khai

Shop xác nhận đơn → hệ thống xếp hàng tạo vận đơn GHN test → GHN gửi trạng
thái lấy hàng, phân loại, vận chuyển, giao hàng, giao thất bại hoặc hoàn hàng.
Shop không tự đánh dấu đã bàn giao. Mỗi trạng thái mới được lưu vào lịch sử
và hộp thông báo của người mua/shop. App/web đang mở nhận cập nhật tự động;
Android/iOS đã cài đặt có thể nhận push khi đóng app sau khi cấu hình bên dưới.

GHN trong mã này **chỉ dùng staging** (`dev-online-gateway.ghn.vn`). Chưa bật
GHN production. Web đóng trình duyệt chưa có Web Push trong thay đổi này.

## 1. Cập nhật backend

Áp dụng migration trên database đã sao lưu bằng SDK .NET 10:

```powershell
cd backend
dotnet tool restore
dotnet ef database update --project BCOBCA.DAL --startup-project BCOBCA.DAL
```

Hai migration mới: `GhnLifecycleAndPushNotifications`, `PushDeviceSessionBinding`.
Không tự chạy migration vào database thực tế trong phiên triển khai mã này.

Thêm biến môi trường vào backend (không commit token/secret):

```dotenv
Shipping__Ghn__TestToken=<token GHN staging đang có>
Shipping__Ghn__FulfillmentEnabled=true
Shipping__Ghn__WebhookSecret=<chuỗi bí mật ngẫu nhiên ít nhất 32 ký tự>
Push__Enabled=true
# Nếu bật bảo mật truy cập Expo Push Service:
Push__ExpoAccessToken=<Expo access token của server>
```

`Push__ExpoAccessToken` là tùy chọn; bỏ dòng đó nếu chưa bật bảo mật push bên Expo.
Giữ khóa ASP.NET Data Protection trên ổ đĩa bền vững và dùng chung key ring
giữa các backend instance. Token thiết bị lưu dưới dạng được bảo vệ bằng key ring;
mất khóa khiến token cũ không thể giải mã cho đến khi thiết bị đăng ký lại.

Đơn mới lưu snapshot yêu cầu GHN lúc checkout. Đơn cũ không có snapshot bị chặn
xác nhận với thông báo rõ ràng; không suy diễn địa chỉ hoặc kích thước hiện tại
để thay thế dữ liệu khi đặt hàng. Dùng đơn mới trên staging để kiểm thử.

## 2. Đăng ký webhook GHN staging

Backend phải có URL HTTPS công khai để GHN gọi được. Trong Developer Portal
**staging**, cấu hình webhook đơn hàng:

- URL: `https://<backend-public>/api/shipping/ghn/callback`
- Header tùy chỉnh `X-GHN-Webhook-Secret`: cùng giá trị secret trên backend.
- Bật sự kiện tạo đơn, chuyển trạng thái và COD; timeout nên đủ cho việc xác
  minh giao hàng với GHN (ví dụ 30 giây).

GHN tự retry callback lỗi. Backend chống trùng theo vận đơn/loại sự kiện/thời điểm,
không cho trạng thái cuối lùi về trạng thái trước. Sự kiện giao thành công được
tra lại qua API GHN; chỉ hoàn tất thanh toán COD khi GHN xác nhận đã thu đúng
tổng tiền checkout. Thu COD gồm tổng tiền hàng và phí/giảm giá đã chốt; shop
trả cước GHN để tránh người nhận trả phí vận chuyển hai lần.

Nguồn: [Webhook GHN](https://developer.ghn.vn/en/docs/webhook/callback-order-status),
[tạo đơn](https://developer.ghn.vn/vi/docs/order/create),
[trạng thái GHN](https://developer.ghn.vn/vi/docs/master-data/order-status).

## 3. Tạo dự án EAS và cấu hình push Android/iOS

Repository chưa có EAS Project ID hoặc khóa FCM/APNs. Không điền ID giả.
Tạo/liên kết dự án Expo/EAS của chủ ứng dụng; đặt UUID thật trong
`frontend/app.json`:

```json
{
  "expo": {
    "extra": { "eas": { "projectId": "<UUID dự án EAS thật>" } }
  }
}
```

Giữ nguyên các trường hiện có của `app.json`. Có thể dùng biến build
`EXPO_PUBLIC_EAS_PROJECT_ID` nếu không đặt trong config.

Android: tạo Firebase app với package `com.bcobca.app`, cấu hình FCM v1 cho
dự án EAS và gắn file Google Services theo hướng dẫn Expo. iOS: dùng bundle ID
`com.bcobca.app`, cấu hình APNs cho tài khoản Apple Developer của chủ app.

```powershell
cd frontend
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest credentials
npx eas-cli@latest build --platform android
# Khi đã có tài khoản/thiết bị iOS phù hợp:
npx eas-cli@latest build --platform ios
```

Không chạy các lệnh tạo bản build tính phí hoặc upload credential tự động trong
phiên chỉnh mã. Cài bản build có native push; không kiểm thử push Android qua
Expo Go. Vào **Thông báo → Bật thông báo trên điện thoại**, cấp quyền hệ điều
hành. Nếu thiếu Project ID, app hiển thị lỗi cấu hình thay vì báo bật thành công.

Hướng dẫn chính thức: [Expo push setup](https://docs.expo.dev/push-notifications/push-notifications-setup/),
[FCM v1](https://docs.expo.dev/push-notifications/fcm-credentials/),
[gửi push và receipt](https://docs.expo.dev/push-notifications/sending-notifications/).

## 4. Kiểm thử hoạt động

1. Tạo một đơn mới bằng người mua trên GHN staging; đăng nhập shop xác nhận.
2. Kiểm tra xuất hiện mã vận đơn, thông báo chờ lấy hàng và nút shop tự bàn giao
   không còn tồn tại.
3. Cho GHN staging chuyển các trạng thái; kiểm tra cả lịch sử, hộp thông báo và
   chi tiết đơn cập nhật khi mở app/web. Chuyển lại giữa các trang không cần reload.
4. Đóng app đã cài native build; chuyển trạng thái test và xác nhận push trên
   thiết bị. Chạm push mở đúng đơn khi đăng nhập.
5. Gửi lặp callback: không thêm lịch sử/thông báo trùng. Đăng xuất/đổi tài khoản:
   hàng đợi không gửi thông báo tài khoản cũ sang phiên mới.

Push có hàng đợi retry, kiểm tra Expo receipt và vô hiệu hóa token không còn hợp
lệ. Receipt được chấp nhận không bảo đảm điện thoại luôn hiển thị: quyền, kết nối,
cài đặt tiết kiệm pin và chính sách hệ điều hành vẫn áp dụng. Không hỗ trợ bỏ qua
force-stop của hệ điều hành. Push có thể được gửi lại sau lỗi/crash; dữ liệu mang
notification ID để đối chiếu với hộp thông báo bền vững.

GHN báo giao thất bại/hoàn hàng tạo thông báo và lịch sử; không tự khẳng định đã
hoàn tiền. Thanh toán/đối soát hoàn hàng cần quy trình riêng. Các đơn kết thúc bằng
hoàn hàng/sự cố cần được shop/admin xử lý tiếp, không đánh dấu giao thành công.
