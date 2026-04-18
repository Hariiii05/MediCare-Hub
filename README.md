## Hướng dẫn chạy

### 1. Backend

```bash
cd backend

# Tạo virtual environment (lần đầu)
python3 -m venv venv
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Seed dữ liệu mẫu
python seed.py

# Khởi động server
uvicorn main:app --reload --port 8000
```

API: **http://localhost:8000** | Docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend

# Cài đặt dependencies (lần đầu)
npm install

# Khởi động dev server
npm run dev
```

App: **http://localhost:5173**

## Dữ liệu mẫu

Sau khi chạy `python seed.py`:

- **4 Phòng khám:** Tổ hợp phòng khám MEDIPLUS, Bệnh viện 199 - Đà Nẵng, Hệ thống y tế Thu Cúc TCI, Phòng khám Đa khoa Quốc tế Thu Cúc
- **5 Bác sĩ** với chuyên khoa khác nhau
- **Tài khoản test:** username `testpatient`, password `password123`

## Luồng đặt khám (5 bước)

1. **Chọn phòng khám** - Tìm kiếm và duyệt danh sách cơ sở y tế
2. **Chọn bác sĩ** - Xem thông tin phòng khám, dịch vụ, và bác sĩ
3. **Chọn giờ khám** - Chọn ngày và khung giờ trống (30 phút/slot)
4. **Nhập thông tin** - Triệu chứng + ảnh đính kèm (tuỳ chọn)
5. **Xác nhận** - Hiển thị kết quả đặt khám thành công

## Tính năng

- **Đăng ký / Đăng nhập** - Modal form, JWT-based session
- **Duyệt phòng khám** - Tìm kiếm, lọc, xem chi tiết
- **Đặt khám bác sĩ** - Chọn slot thời gian, first-come-first-served
- **Nhập triệu chứng** - Text + upload ảnh
- **Lịch hẹn của tôi** - Xem lịch sử và trạng thái đặt khám
