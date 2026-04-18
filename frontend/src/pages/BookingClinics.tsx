import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { clinicsApi, type Clinic } from "../api/client";

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

export default function BookingClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [clinicType, setClinicType] = useState("");
  const [bookingOrder, setBookingOrder] = useState<"" | "asc" | "desc">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    clinicsApi
      .list({
        ...(location ? { location } : {}),
        ...(clinicType ? { clinic_type: clinicType } : {}),
        ...(bookingOrder ? { booking_order: bookingOrder } : {}),
      })
      .then((r) => setClinics(r.data))
      .finally(() => setLoading(false));
  }, [location, clinicType, bookingOrder]);

  const filtered = clinics.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Green banner */}
      <section className="bg-gradient-to-r from-primary to-primary-dark py-10">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white italic mb-2">
            Đặt khám tại MediCare Hub
          </h1>
          <p className="text-white/80 text-sm mb-6">
            Để được tiếp đón ưu tiên, không chờ đợi tại các bệnh viện, phòng khám hàng đầu
          </p>
          <div className="max-w-[600px] mx-auto relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm triệu chứng, chuyên khoa, bệnh viện, phòng khám"
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white text-sm outline-none shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Filters + Listing */}
      <section className="py-8">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-text-main">
              Bệnh viện, phòng khám
            </h2>
            <div className="flex items-center gap-3">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-sm text-text-secondary bg-white outline-none"
              >
                <option value="">Chọn địa điểm</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
              </select>
              <select
                value={clinicType}
                onChange={(e) => setClinicType(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-sm text-text-secondary bg-white outline-none"
              >
                <option value="">Loại CSYT</option>
                <option value="Bệnh viện">Bệnh viện</option>
                <option value="Phòng khám">Phòng khám</option>
                <option value="Hệ thống y tế">Hệ thống y tế</option>
              </select>
              <select
                value={bookingOrder}
                onChange={(e) => setBookingOrder(e.target.value as "" | "asc" | "desc")}
                className="border border-border rounded-lg px-3 py-2 text-sm text-text-secondary bg-white outline-none"
              >
                <option value="">Số lượt đặt</option>
                <option value="asc">Tăng dần</option>
                <option value="desc">Giảm dần</option>
              </select>
            </div>
          </div>

          {/* Clinic cards grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl border border-border">
                  <div className="h-52 bg-gray-200 rounded-t-xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filtered.map((clinic) => {
                const isOpen = isClinicOpenNow();
                return (
                  <Link
                    key={clinic.id}
                    to={`/dat-kham/clinic/${clinic.id}`}
                    className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition group"
                  >
                    <div className="h-52 overflow-hidden">
                      <img
                        src={clinic.image_url || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=250&fit=crop"}
                        alt={clinic.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-text-main text-base mb-1 leading-tight">
                        {clinic.name}
                      </h3>
                      <p
                        className="text-sm text-primary leading-snug underline"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          window.open(getGoogleMapsUrl(clinic.address), "_blank", "noopener,noreferrer");
                        }}
                      >
                        {clinic.address}
                      </p>
                      <p className={`text-sm mt-2 font-medium ${isOpen ? "text-green-600" : "text-red-600"}`}>
                        {isOpen ? "Đang mở cửa" : "Đã đóng cửa"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
