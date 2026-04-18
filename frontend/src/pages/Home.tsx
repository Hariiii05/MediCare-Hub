import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  clinicsApi,
  doctorsApi,
  type Clinic,
  type Doctor,
} from "../api/client";

export default function Home() {
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    clinicsApi.list().then((r) => setClinics(r.data));
    doctorsApi.list().then((r) => setDoctors(r.data));
  }, []);

  return (
    <div>
      {/* 1. Hero banner */}
      <section className="w-full">
        <img
          src="/assets/banner.png"
          alt="MediCare Hub - Trang web chăm sóc sức khoẻ chủ động 24/7"
          className="w-full h-auto block"
        />
      </section>

      {/* 2. Promotions */}
      <section className="bg-white py-10" style={{paddingTop: '20px', paddingBottom: '30px'}}>
        <div className="page-content">
          <h2 className="text-center text-xl md:text-2xl font-bold text-primary mb-1">
            Ưu đãi hấp dẫn chỉ có tại MediCare Hub
          </h2>
          <p className="text-center text-sm font-bold text-text-secondary text-xl mb-6" style={{paddingBottom: '8px', color: '#0E51AC'}}>
            được nhiều khách hàng lựa chọn
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
            <div className="rounded-xl overflow-hidden shadow-sm border border-border/50">
              <img
                src="/assets/image_1.png"
                alt="Ưu đãi Bác sĩ Đồng Hành"
                className="w-full h-44 md:h-48 object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-sm border border-border/50">
              <img
                src="/assets/image_2.png"
                alt="Ưu đãi Mùa lễ hội"
                className="w-full h-44 md:h-48 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Clinics & Doctors — mint green background matching Figma */}
      <section className="py-12" style={{ backgroundColor: "#EFF9F5", paddingTop: '20px' }}>
        <div className="page-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* Left: Cơ sở y tế hàng đầu — 2 large cards */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary mb-6">
                Cơ sở y tế hàng đầu
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {clinics.slice(0, 2).map((clinic, index) => (
                  <Link
                    key={clinic.id}
                    to={`/dat-kham/clinic/${clinic.id}`}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/30 hover:shadow-md transition flex flex-col"
                  >
                    <img
                      src={`/assets/facilities_${index + 1}.png`}
                      alt={clinic.name}
                      className="w-full aspect-[16/10] object-cover"
                    />
                  </Link>
                ))}
              </div>
              
              {!isDoctor && (
                <p className="text-center mt-4">
                  <Link to="/dat-kham" className="inline-block text-primary font-bold text-sm hover:opacity-80 transition">
                    Xem tất cả cơ sở y tế
                  </Link>
                </p>
              )}
            </div>

            {/* Right: Bác sĩ nổi bật — No icons, cleaner layout */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary mb-6">
                Bác sĩ nổi bật
              </h2>
              <div className="space-y-5">
                {doctors.slice(0, 3).map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-border/30 flex items-center gap-5"
                  >
                    <img
                      src={
                        doctor.image_url ||
                        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face"
                      }
                      alt={doctor.name}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm md:text-base text-text-main mb-1.5">
                        {doctor.name}
                      </p>
                      {doctor.specialty && (
                        <p className="text-xs md:text-sm text-text-secondary mb-1">
                          Chuyên khoa {doctor.specialty}
                        </p>
                      )}
                      {doctor.clinic_name && (
                        <p className="text-xs md:text-sm text-text-secondary">
                          {doctor.clinic_name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {!isDoctor && (
                <p className="text-center mt-3">
                  <Link to="/dat-kham" className="inline-block text-primary font-bold text-sm underline hover:opacity-80 transition">
                    Xem tất cả bác sĩ
                  </Link>
                </p>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 4. Info — bordered box on white bg */}
      <section className="bg-white py-10">
        <div className="page-content">
          <div className="border border-border rounded-xl p-6 md:p-8 bg-[#E6F5F2]">
            <h3 className="text-primary font-bold text-sm md:text-base mb-4">
              MediCare Hub là ứng dụng chăm sóc sức khỏe trực tuyến 24/7, với nhiều tính năng nổi bật
            </h3>
            <ul className="text-sm text-text-secondary space-y-2 list-disc pl-5">
              <li>Đặt lịch khám ưu tiên tại các cơ sở y tế trên toàn quốc, nói không với xếp hàng lấy số</li>
              <li>Tư vấn trực tuyến 1:1 với bác sĩ thông qua video call mọi lúc mọi nơi</li>
              <li>Miễn phí chat riêng bác sĩ, đảm bảo sự riêng tư, hỗ trợ kịp thời, chuyên môn cao</li>
              <li>Gọi bác sĩ khẩn cấp SOS hoạt động 24/7</li>
              <li>Ngoài ra còn nhiều tính năng hữu ích như: Mua thuốc online giao ngay tại nhà, Quản lý Hồ sơ sức khỏe, Cộng đồng hỏi đáp sức khỏe, Nghe tiếng ho, Đếm bước chân...</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
