# Đối chiếu bảy ảnh tham khảo

Ảnh đều 869 × 1883; đơn vị thiết kế logic suy ra khoảng 393 × 852. Không xem pixel screenshot là dp cố định.

- Ảnh 1: phần cuối Thành viên. List ngăn cách mảnh, icon 24dp, row khoảng 56dp, 2 card affiliate/points ngang; footer/version trước tabbar.
- Ảnh 2: đầu Thành viên. Vùng nền xám, thẻ bo góc, avatar/tên và barcode, tiêu đề điểm, lời cảm ơn, ba chỉ số trong hàng trắng; trạng thái đơn cuộn ngang; hai card reward.
- Ảnh 3: Giỏ hàng. Header đỏ khoảng 72dp (bao gồm status bar gốc), body nền rất sáng, minh họa xám và empty text; tổng tiền/nút disabled ngay trên tabbar.
- Ảnh 4: Ưu đãi. Nền đỏ kết thúc bo hai góc dưới, card quyền lợi trắng, nút đen; empty voucher giữa thân trang. Điểm danh phải gọi API.
- Ảnh 5: Danh mục. Header/search đỏ, filter icon/logo trên trắng; một dịch vụ card ở cột trái, hình, favorite và nút viền đỏ. Không thêm giá cho tư vấn.
- Ảnh 6: Trang chủ đã cuộn. Lưới thương hiệu 3 × 2, filter thương hiệu, grid product/service 2 cột, floating support/share.
- Ảnh 7: đầu Trang chủ. Banner ngang khoảng 393 × 224; bốn shortcut đỏ icon trắng, thương hiệu 3 × 2, filter bên dưới.

Token ban đầu: primary #DF403B; background #F3F3F7; surface #FFFFFF; text #24242B; muted #777985; border #E8E8ED. Tinh chỉnh bằng sample pixel trong ảnh khi triển khai theme.
Tabbar trắng 5 mục đều nhau, icon 24dp, label khoảng 12dp, active đỏ. Safe area thật; không vẽ home indicator/status bar giả.
Text chính khoảng 16dp, section title 20dp/600, body 14dp; spacing 8/12/16/24; card radius khoảng 8–16dp tùy loại. Giữ text scale hệ thống và vùng bấm ít nhất 44dp.

Banner/logo/hình sản phẩm phải có URL dữ liệu thật. Chưa có tài sản gốc tách riêng ngoài screenshot; không tự nhận ảnh thương hiệu tự dựng là tài sản chính thức. Empty catalog hợp lệ khi database chưa có nội dung.
