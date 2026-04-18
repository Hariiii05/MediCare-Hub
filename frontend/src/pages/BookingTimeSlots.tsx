import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doctorsApi, slotsApi, type Doctor, type Slot } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function BookingTimeSlots() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, openAuthModal } = useAuth();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const state = location.state as {
    isService?: boolean;
    serviceName?: string;
    servicePrice?: string;
    serviceImage?: string;
  } | null;

  const searchParams = new URLSearchParams(location.search);
  const isService = state?.isService || searchParams.get("type") === "service";
  const serviceName = state?.serviceName || "Dịch vụ khám tổng quát";
  const servicePrice = state?.servicePrice || "350.000 đ";
  const serviceImage = state?.serviceImage || "/assets/booking_clinics_1.png";

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    doctorsApi.list().then((r) => {
      const found = r.data.find((d) => d.id === parseInt(doctorId));
      setDoctor(found || null);
      setLoading(false);
    });
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId || !selectedDate) return;
    slotsApi.getAvailable(parseInt(doctorId), selectedDate).then((r) => setSlots(r.data));
  }, [doctorId, selectedDate]);

  const morningSlots = slots.filter((s) => {
    const h = new Date(s.slot_start).getHours();
    return h < 12;
  });
  const afternoonSlots = slots.filter((s) => {
    const h = new Date(s.slot_start).getHours();
    return h >= 12;
  });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const formatDateVN = (dateStr: string) => {
    const d = new Date(dateStr);
    return `Ngày ${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };

  const handleBookAtClinic = () => {
    if (!selectedSlot) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    navigate(`/dat-kham/info`, {
      state: {
        doctorId: parseInt(doctorId!),
        doctor,
        slotStart: selectedSlot,
        date: selectedDate,
      },
    });
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-[900px] mx-auto px-4">
        {/* Doctor/Service info */}
        <div className="bg-white border border-border rounded-xl p-6 flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-primary-light rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {isService ? (
               <img src={serviceImage} alt={serviceName} className="w-full h-full object-cover" />
            ) : doctor?.image_url ? (
               <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" />
            ) : (
               <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
               </svg>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-main leading-snug">
              {isService ? serviceName : (doctor?.name || "Dịch vụ khám")}
            </h2>
            {!isService && doctor?.specialty && (
              <p className="text-sm text-text-secondary mt-1">Chuyên khoa: {doctor.specialty}</p>
            )}
            <p className="text-primary font-bold text-sm mt-1">
              Giá dịch vụ: <span>{isService ? servicePrice : "350.000 đ"}</span>
            </p>
          </div>
        </div>

        {/* Schedule section */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="font-bold text-text-main">Lịch khám tại viện</h3>
            <div 
              className="relative border-2 border-primary text-primary font-medium text-sm rounded-lg px-4 py-2 flex items-center justify-between cursor-pointer bg-white min-w-[200px]"
              onClick={() => dateInputRef.current?.showPicker()}
            >
              <span>{selectedDate ? formatDateVN(selectedDate) : "Chọn ngày"}</span>
              <svg className="w-4 h-4 text-primary ml-2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                ref={dateInputRef}
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                  }
                }}
                className="absolute opacity-0 w-0 h-0 p-0 m-0 border-none overflow-hidden"
                style={{ bottom: 0, left: 0 }}
              />
            </div>
          </div>

          {/* Morning slots */}
          <div className="mb-5">
            <p className="text-sm text-text-secondary mb-3">Buổi sáng</p>
            <div className="flex flex-wrap gap-2">
              {morningSlots.map((slot) => (
                <button
                  key={slot.slot_start}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.slot_start)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    selectedSlot === slot.slot_start
                      ? "bg-primary text-white border-primary cursor-default"
                      : slot.available
                      ? "border-border text-text-main hover:border-primary bg-white cursor-pointer"
                      : "border-border text-text-light bg-gray-100 opacity-50 cursor-not-allowed line-through"
                  }`}
                >
                  {formatTime(slot.slot_start)}
                </button>
              ))}
              {morningSlots.length === 0 && (
                <p className="text-sm text-text-light">Đang tải...</p>
              )}
            </div>
          </div>

          {/* Afternoon slots */}
          <div className="mb-6">
            <p className="text-sm text-text-secondary mb-3">Buổi chiều</p>
            <div className="flex flex-wrap gap-2">
              {afternoonSlots.map((slot) => (
                <button
                  key={slot.slot_start}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.slot_start)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    selectedSlot === slot.slot_start
                      ? "bg-primary text-white border-primary cursor-default"
                      : slot.available
                      ? "border-border text-text-main hover:border-primary bg-white cursor-pointer"
                      : "border-border text-text-light bg-gray-100 opacity-50 cursor-not-allowed line-through"
                  }`}
                >
                  {formatTime(slot.slot_start)}
                </button>
              ))}
              {afternoonSlots.length === 0 && (
                <p className="text-sm text-text-light">Đang tải...</p>
              )}
            </div>
          </div>

          <button
            disabled={!selectedSlot}
            onClick={handleBookAtClinic}
            className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-3 px-8 rounded-full transition text-sm cursor-pointer"
          >
            Đặt khám
            <span className="block text-xs font-normal opacity-80">Tại cơ sở y tế</span>
          </button>
        </div>

        {/* Detail section */}
        <div className="bg-white border border-border rounded-xl p-6 mt-6">
          <h3 className="font-bold text-text-main text-sm uppercase tracking-wide">
            THÔNG TIN CHI TIẾT DỊCH VỤ/ BÁC SĨ
          </h3>
          <p className="text-sm text-text-secondary mt-3">
            {isService 
              ? `${serviceName} - ${doctor?.clinic_name || "Cơ sở y tế"}`
              : `${doctor?.name} - ${doctor?.specialty || "Đa khoa"} - ${doctor?.clinic_name}`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
