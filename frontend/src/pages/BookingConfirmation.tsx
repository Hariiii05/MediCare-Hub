import { useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface ConfirmationState {
  doctorId: number;
  doctor: { name: string; specialty?: string; clinic_name?: string } | null;
  slotStart: string;
  date: string;
  symptoms: string;
}

export default function BookingConfirmation() {
  const location = useLocation();
  const state = location.state as ConfirmationState | null;
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowToast(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!state) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-16 text-center text-text-secondary">
        <p>Không có thông tin đặt khám.</p>
        <Link to="/dat-kham" className="text-primary font-bold underline mt-2 inline-block">
          Quay lại đặt khám
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 relative">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-primary text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
          <span className="text-sm font-medium">Đặt khám thành công</span>
          <button onClick={() => setShowToast(false)} className="text-white/80 hover:text-white cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="max-w-[800px] mx-auto px-4">
        <h1 className="text-center text-xl font-bold text-text-main mb-6">
          Thông tin đặt khám
        </h1>

        {/* Stepper - both completed */}
        <div className="flex items-center justify-center gap-0 mb-8 max-w-[500px] mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm font-semibold text-primary">Thông tin đặt khám</span>
          </div>
          <div className="flex-1 h-0.5 bg-primary mx-3" />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm font-semibold text-primary">Hoàn thành đặt khám</span>
          </div>
        </div>

        {/* Service info card */}
        <div className="border border-border rounded-xl p-6 mb-6 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-text-main">
                {state.doctor?.name || "Dịch vụ khám"}
              </p>
              {state.doctor?.specialty && (
                <p className="text-sm text-text-secondary">{state.doctor.specialty}</p>
              )}
              <p className="text-sm text-text-secondary mt-1">
                Giá dịch vụ: <span className="text-primary font-bold">350.000 đ</span>
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="border border-border rounded-xl p-6 bg-white">
          <h3 className="font-bold text-text-main mb-3">
            Một số lưu ý trước khi tới khám:
          </h3>
          <ol className="text-sm text-text-secondary space-y-1.5 list-decimal list-inside">
            <li>Mang đầy đủ giấy tờ cần thiết (CCCD, BHYT nếu có).</li>
            <li>Đến trước giờ hẹn từ 5–10 phút để làm thủ tục.</li>
            <li>Nhịn ăn/uống nếu có yêu cầu trước khi khám.</li>
            <li>Chuẩn bị sẵn thông tin về tiền sử bệnh (nếu có).</li>
            <li>Tuân thủ hướng dẫn của nhân viên y tế.</li>
          </ol>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            to="/appointments"
            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition text-sm"
          >
            Xem lịch hẹn của tôi
          </Link>
          <Link
            to="/dat-kham"
            className="border-2 border-primary text-primary hover:bg-primary-light font-bold py-3 px-8 rounded-full transition text-sm"
          >
            Đặt khám tiếp
          </Link>
        </div>
      </div>
    </div>
  );
}
