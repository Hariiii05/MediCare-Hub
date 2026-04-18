# Database Schema Design

## 1. System Overview

Hệ thống quản lý đặt lịch khám bệnh gồm các bảng sau:

- users
- doctors
- clinics
- services
- appointments

Các bảng được liên kết với nhau thông qua **Primary Key (PK)** và **Foreign Key (FK)** để quản lý bác sĩ, phòng khám, dịch vụ và lịch hẹn của bệnh nhân.

---

# 2. Table Relationships

### users (1) — (1) doctors
Một tài khoản người dùng có thể đại diện cho một bác sĩ.

### clinics (1) — (N) doctors
Một phòng khám có thể có nhiều bác sĩ.

### clinics (1) — (N) services
Một phòng khám có thể cung cấp nhiều dịch vụ.

### doctors (1) — (N) appointments
Một bác sĩ có thể có nhiều lịch hẹn khám.

### services (1) — (N) appointments
Một dịch vụ có thể được đặt trong nhiều lịch hẹn.

### users (1) — (N) appointments
Một bệnh nhân có thể tạo nhiều lịch hẹn.

---

# 3. Table: users

Mô tả: Lưu thông tin tài khoản người dùng trong hệ thống.

| Column | Data Type | Null | Unique | Default | Description |
|------|------|------|------|------|------|
| id | INT | No | Yes | AUTO_INCREMENT | Primary key |
| username | VARCHAR(100) | No | Yes | - | Tên đăng nhập |
| email | VARCHAR(150) | No | Yes | - | Email người dùng |
| password_hash | VARCHAR(255) | No | No | - | Mật khẩu đã mã hóa |
| role | VARCHAR(20) | No | No | 'patient' | Vai trò (patient, doctor, admin) |

Primary Key:  
id

Unique Constraints:
- username
- email

---

# 4. Table: doctors

Mô tả: Lưu thông tin bác sĩ.

| Column | Data Type | Null | Unique | Default | Description |
|------|------|------|------|------|------|
| id | INT | No | Yes | AUTO_INCREMENT | Primary key |
| name | VARCHAR(100) | No | No | - | Tên bác sĩ |
| specialty | VARCHAR(100) | No | No | - | Chuyên khoa |
| clinic_id | INT | No | No | - | Khóa ngoại tới clinics |
| image_url | VARCHAR(255) | Yes | No | NULL | Ảnh bác sĩ |

Foreign Key:

clinic_id → clinics(id)

ON DELETE RESTRICT  
ON UPDATE CASCADE

---

# 5. Table: clinics

Mô tả: Lưu thông tin phòng khám.

| Column | Data Type | Null | Unique | Default | Description |
|------|------|------|------|------|------|
| id | INT | No | Yes | AUTO_INCREMENT | Primary key |
| name | VARCHAR(150) | No | No | - | Tên phòng khám |
| address | VARCHAR(255) | No | No | - | Địa chỉ |
| phone | VARCHAR(20) | No | No | - | Số điện thoại |
| image_url | VARCHAR(255) | Yes | No | NULL | Ảnh phòng khám |

Primary Key:  
id

---

# 6. Table: services

Mô tả: Lưu thông tin các dịch vụ khám bệnh.

| Column | Data Type | Null | Unique | Default | Description |
|------|------|------|------|------|------|
| id | INT | No | Yes | AUTO_INCREMENT | Primary key |
| name | VARCHAR(150) | No | No | - | Tên dịch vụ |
| specialty | VARCHAR(100) | No | No | - | Chuyên khoa |
| clinic_id | INT | No | No | - | Khóa ngoại tới clinics |
| image_url | VARCHAR(255) | Yes | No | NULL | Ảnh dịch vụ |

Foreign Key:

clinic_id → clinics(id)

ON DELETE RESTRICT  
ON UPDATE CASCADE

---

# 7. Table: appointments

Mô tả: Lưu thông tin lịch hẹn khám bệnh.

| Column | Data Type | Null | Unique | Default | Description |
|------|------|------|------|------|------|
| id | INT | No | Yes | AUTO_INCREMENT | Primary key |
| patient_id | INT | No | No | - | Khóa ngoại tới users |
| doctor_id | INT | No | No | - | Khóa ngoại tới doctors |
| service_id | INT | No | No | - | Khóa ngoại tới services |
| slot_start | DATETIME | No | No | - | Thời gian bắt đầu khám |
| symptoms | TEXT | No | No | NULL | Mô tả triệu chứng |
| image_path | VARCHAR(255) | Yes | No | NULL | Ảnh đính kèm |
| status | VARCHAR(30) | No | No | 'pending' | Trạng thái lịch hẹn |
| created_at | DATETIME | No | No | CURRENT_TIMESTAMP | Thời điểm tạo |

Foreign Keys:

patient_id → users(id)  
ON DELETE CASCADE

doctor_id → doctors(id)  
ON DELETE RESTRICT

service_id → services(id)  
ON DELETE RESTRICT

---