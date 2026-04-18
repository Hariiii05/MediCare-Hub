import { useState, useEffect } from "react";
import { appointmentsApi, type Appointment } from "../api/client";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MyAppointments() {
  const { isAuthenticated, openAuthModal, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [decidingId, setDecidingId] = useState<number | null>(null);
  const isDoctor = user?.role === "doctor";

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const request = isDoctor ? appointmentsApi.listForDoctor() : appointmentsApi.list();
    request
      .then((res) => setAppointments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, isDoctor]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const handleCancel = async (appointmentId: number) => {
    const ok = window.confirm("Bạn có chắc chắn muốn huỷ lịch khám này không?");
    if (!ok) return;

    setCancellingId(appointmentId);
    try {
      await appointmentsApi.cancel(appointmentId);
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? { ...apt, status: "cancelled", can_cancel: false }
            : apt
        )
      );
    } catch {
      window.alert("Không thể huỷ lịch khám. Vui lòng thử lại sau.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleDoctorDecision = async (appointmentId: number, decision: "confirmed" | "rejected") => {
    setDecidingId(appointmentId);
    try {
      const res = await appointmentsApi.doctorDecision(appointmentId, decision);
      setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? res.data : apt)));
    } catch {
      window.alert("Không thể cập nhật trạng thái lịch khám. Vui lòng thử lại.");
    } finally {
      setDecidingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-[900px] mx-auto px-4">
        <h1 className="text-xl font-bold text-text-main mb-6">
          {isDoctor ? "Lịch hẹn của bác sĩ" : "Lịch hẹn của tôi"}
        </h1>

        {!isAuthenticated ? (
          <div className="border border-border rounded-xl p-12 text-center bg-white">
            <h3 className="font-bold text-text-main mb-2">Vui lòng đăng nhập để xem lịch hẹn</h3>
            <p className="text-sm text-text-secondary mb-4">
              Đăng nhập để quản lý lịch hẹn và theo dõi trạng thái khám.
            </p>
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-full transition text-sm"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="border border-border rounded-xl p-12 text-center bg-white">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-text-main mb-1">Chưa có lịch hẹn</h3>
            {isDoctor ? (
              <p className="text-sm text-text-secondary">
                Hiện chưa có bệnh nhân nào đặt lịch với bạn.
              </p>
            ) : (
              <>
                <p className="text-sm text-text-secondary mb-4">
                  Đặt khám ngay để được tiếp đón ưu tiên
                </p>
                <Link
                  to="/dat-kham"
                  className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-full transition text-sm"
                >
                  Đặt khám ngay
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white border border-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-text-main">
                      {apt.doctor_name || `Bác sĩ #${apt.doctor_id}`}
                    </h3>
                    {apt.clinic_name && (
                      <p className="text-sm text-text-secondary mt-0.5">{apt.clinic_name}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      apt.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : apt.status === "rejected"
                          ? "bg-gray-100 text-gray-700"
                        : apt.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {apt.status === "confirmed"
                      ? "Đã xác nhận"
                      : apt.status === "cancelled"
                        ? "Đã huỷ"
                        : apt.status === "rejected"
                          ? "Đã từ chối"
                          : "Chờ xác nhận"}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    {formatTime(apt.slot_start)}
                  </span>
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    {formatDate(apt.slot_start)}
                  </span>
                </div>

                <div className="text-sm text-text-secondary">
                  <span className="font-medium text-text-main">Triệu chứng: </span>
                  {apt.symptoms}
                </div>

                {!isDoctor && apt.can_cancel === true && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => handleCancel(apt.id)}
                      disabled={cancellingId === apt.id}
                      className="inline-block border border-red-500 text-red-600 hover:bg-red-50 font-bold py-2 px-4 rounded-full transition text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {cancellingId === apt.id ? "Đang huỷ..." : "Huỷ lịch khám"}
                    </button>
                  </div>
                )}

                {isDoctor && apt.status === "pending" && (
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDoctorDecision(apt.id, "confirmed")}
                      disabled={decidingId === apt.id}
                      className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition text-sm disabled:opacity-60"
                    >
                      {decidingId === apt.id ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDoctorDecision(apt.id, "rejected")}
                      disabled={decidingId === apt.id}
                      className="inline-block border border-red-500 text-red-600 hover:bg-red-50 font-bold py-2 px-4 rounded-full transition text-sm disabled:opacity-60"
                    >
                      Từ chối
                    </button>
                  </div>
                )}

                {apt.image_path && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${apt.image_path}`}
                    alt="Ảnh đính kèm"
                    className="w-20 h-20 object-cover rounded-lg border border-border mt-3"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
