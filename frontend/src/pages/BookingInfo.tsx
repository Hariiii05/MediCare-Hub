import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { appointmentsApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface BookingState {
  doctorId: number;
  doctor: { name: string; specialty?: string; clinic_name?: string } | null;
  slotStart: string;
  date: string;
}

export default function BookingInfo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = location.state as BookingState | null;

  const [symptoms, setSymptoms] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!state) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-16 text-center text-text-secondary">
        Không có thông tin đặt khám. Vui lòng quay lại chọn lịch khám.
      </div>
    );
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const formatDateVN = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError("Vui lòng nhập triệu chứng");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("doctor_id", String(state.doctorId));
      formData.append("slot_start", state.slotStart);
      formData.append("symptoms", symptoms);
      if (image) formData.append("image", image);

      await appointmentsApi.create(formData);
      navigate("/dat-kham/confirmation", { state: { ...state, symptoms } });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Đặt khám thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-[800px] mx-auto px-4">
        <h1 className="text-center text-xl font-bold text-text-main mb-6">
          Thông tin đặt khám
        </h1>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-8 max-w-[500px] mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm font-semibold text-primary">Thông tin đặt khám</span>
          </div>
          <div className="flex-1 h-0.5 bg-primary mx-3" />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-border" />
            <span className="text-sm text-text-light">Hoàn thành đặt khám</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Patient info card */}
          <div className="border border-border rounded-xl p-5 mb-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Người tới khám</p>
                <p className="font-bold text-text-main">{user?.username || "Bệnh nhân"}</p>
              </div>
            </div>
          </div>

          {/* Appointment info card */}
          <div className="border border-border rounded-xl p-5 mb-4 bg-bg-gray">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-text-secondary">Giờ hẹn:</span>
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                {formatTime(state.slotStart)}
              </span>
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                {formatDateVN(state.date)}
              </span>
            </div>
            <div className="flex items-center gap-4 border-t border-border pt-3">
              <div className="w-14 h-14 bg-white rounded-lg border border-border flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text-main">
                  {state.doctor?.name || "Dịch vụ khám"}
                </p>
                <p className="text-sm text-text-secondary">
                  Giá dịch vụ: <span className="text-primary font-bold">350.000 đ</span>
                </p>
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="border border-border rounded-xl p-5 mb-6 bg-white relative">
            <label className="block text-sm font-medium text-text-main mb-2">
              Triệu chứng <span className="text-red-500">*</span>
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value.slice(0, 500))}
              placeholder="Mô tả triệu chứng của bạn..."
              rows={4}
              className="w-full text-sm outline-none resize-none text-text-main placeholder:text-text-light"
            />
            <div className="flex items-center justify-between mt-2">
              <label className="cursor-pointer text-text-light hover:text-primary transition">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </label>
              <span className="text-xs text-text-light">{symptoms.length}/500</span>
            </div>
            {image && (
              <p className="text-xs text-primary mt-1">{image.name}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-3.5 px-20 rounded-full transition text-sm cursor-pointer uppercase tracking-wider"
            >
              {loading ? "Đang đặt khám..." : "ĐẶT KHÁM"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
