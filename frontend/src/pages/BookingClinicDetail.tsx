import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { clinicsApi, doctorsApi, type Clinic, type Doctor, type Service } from "../api/client";

const OPENING_PERIODS = [
  { start: "07:30", end: "12:00" },
  { start: "13:00", end: "19:00" },
];

function toMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function isClinicOpenNow() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return OPENING_PERIODS.some(({ start, end }) => {
    const startMinutes = toMinutes(start);
    const endMinutes = toMinutes(end);
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  });
}

function getGoogleMapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export default function BookingClinicDetail() {
  const { clinicId } = useParams<{ clinicId: string }>();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinicId) return;
    const id = parseInt(clinicId);
    if (Number.isNaN(id)) {
      setClinic(null);
      setDoctors([]);
      setServices([]);
      setLoading(false);
      return;
    }
    Promise.all([
      clinicsApi.list(), // lấy tất cả phòng khám
      doctorsApi.list(id), // lấy bác sĩ theo clinic
      clinicsApi.listServices(id),
    ]).then(([clinicsRes, doctorsRes, servicesRes]) => {
      const found = clinicsRes.data.find((c) => Number(c.id) === id);
      setClinic(found || null);
      setDoctors(doctorsRes.data);
      setServices(servicesRes.data);
    }).finally(() => setLoading(false));
  }, [clinicId]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center text-text-secondary">
        Không tìm thấy cơ sở y tế
      </div>
    );
  }

  const isOpen = isClinicOpenNow();

  return (
    <div>
      {/* Clinic header */}
      <section className="bg-white border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Clinic image */}
            <div className="md:w-[420px] rounded-xl overflow-hidden shrink-0">
              <img
                src={clinic.image_url || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&h=320&fit=crop"}
                alt={clinic.name}
                className="w-full h-64 object-cover"
              />
            </div>
            {/* Clinic info */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-text-main uppercase mb-3">
                {clinic.name}
              </h1>
              <div className="space-y-2.5 text-sm text-text-secondary">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Lượt ĐK: {(clinic.booking_count ?? 0).toLocaleString("vi-VN")}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    Đánh giá: 5
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <a
                    href={getGoogleMapsUrl(clinic.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {clinic.address}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Giờ mở cửa: (07:30 - 12:00, 13:00 - 19:00)</span>
                </div>
                <div>
                  <span className={`font-medium ${isOpen ? "text-green-600" : "text-red-600"}`}>
                    {isOpen ? "Đang mở cửa" : "Đã đóng cửa"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services section */}
      <section className="py-8 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-center text-lg font-bold text-text-main mb-6">
            Đặt khám dịch vụ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/dat-kham/slots/${doctors[0]?.id || 1}?type=service`}
                state={{
                  isService: true,
                  serviceName: service.name,
                  servicePrice: `${service.price.toLocaleString("vi-VN")} đ`,
                  serviceImage: service.image_url || "/assets/booking_clinics_1.png"
                }}
                className="border border-border rounded-xl p-5 flex items-start gap-4 hover:shadow-md transition"
              >
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center shrink-0">
                  <img src={service.image_url || "/assets/booking_clinics_1.png"} alt="" />
                </div>
                <div>
                  <p className="text-sm text-text-main font-medium leading-snug">
                    {service.name}
                  </p>
                  <p className="text-primary font-bold text-sm mt-2">
                    {service.price.toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-center">
            <button className="text-primary font-bold text-sm underline italic cursor-pointer">
              Xem tất cả dịch vụ
            </button>
          </p>
        </div>
      </section>

      {/* Doctors section */}
      <section className="py-8 bg-bg-gray">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-center text-lg font-bold text-text-main mb-6">
            Đặt khám bác sĩ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-xl border border-border overflow-hidden"
              >
                <div className="p-5 text-center">
                  <img
                    src={doctor.image_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face"}
                    alt={doctor.name}
                    className="w-28 h-28 rounded-full object-cover mx-auto mb-3"
                  />
                  <p className="font-bold text-sm text-text-main">{doctor.name}</p>
                  <div className="flex items-center justify-center gap-3 text-xs text-text-light mt-1 mb-2">
                    <span className="flex items-center gap-0.5">
                      <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      20
                    </span>
                    <span className="flex items-center gap-0.5">
                      <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                      5
                    </span>
                  </div>
                  {doctor.specialty && (
                    <span className="inline-block text-xs border border-border rounded-full px-3 py-1 text-text-secondary mb-3">
                      {doctor.specialty}
                    </span>
                  )}
                  <div className="text-xs text-text-secondary mb-1">Giá khám:</div>
                  <div className="text-primary font-bold text-sm mb-3">350.000 đ</div>
                </div>
                <Link
                  to={`/dat-kham/slots/${doctor.id}`}
                  className="block bg-primary text-white text-center py-2.5 text-sm font-semibold hover:bg-primary-dark transition"
                >
                  Đặt khám
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center mt-6">
            <button className="text-primary font-bold text-sm underline italic cursor-pointer">
              Xem tất cả bác sĩ
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
