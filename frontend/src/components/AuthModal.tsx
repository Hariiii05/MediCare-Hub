import { useState, type FormEvent, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal() {
  const { authModalOpen, authModalTab, closeAuthModal, switchAuthTab, login, register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authModalOpen) {
      setUsername("");
      setPassword("");
      setError("");
      setShowPassword(false);
    }
  }, [authModalOpen, authModalTab]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (authModalTab === "login") {
        await login({ username, password });
      } else {
        await register({ username, email: `${username}@medicare.hub`, password });
      }
      closeAuthModal();
    } catch (err: any) {
      const d = err.response?.data?.detail;
      const msg = Array.isArray(d)
        ? d.map((e: { msg?: string }) => e.msg).filter(Boolean).join(" ")
        : typeof d === "string"
          ? d
          : d?.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={closeAuthModal} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl flex overflow-hidden max-w-[860px] w-full mx-4 max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-10 text-text-secondary hover:text-text-main cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left: Form */}
        <div className="flex-1 p-8 min-w-0">
          {/* Tabs */}
          <div className="flex gap-6 mb-8">
            <button
              onClick={() => switchAuthTab("login")}
              className={`text-lg pb-1 cursor-pointer transition-all ${
                authModalTab === "login"
                  ? "font-bold text-text-main border-b-2 border-text-main"
                  : "text-text-secondary font-normal"
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => switchAuthTab("register")}
              className={`text-lg pb-1 cursor-pointer transition-all ${
                authModalTab === "register"
                  ? "font-bold text-text-main border-b-2 border-text-main"
                  : "text-text-secondary font-normal"
              }`}
            >
              Đăng ký
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={authModalTab === "login" ? "Số điện thoại/ Tên đăng nhập" : "Số điện thoại"}
                className="w-full border-b border-border py-3 text-[15px] outline-none focus:border-primary transition placeholder:text-text-light"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full border-b border-border py-3 text-[15px] outline-none focus:border-primary transition placeholder:text-text-light pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-text-light hover:text-text-secondary cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  )}
                </svg>
              </button>
            </div>

            {authModalTab === "login" && (
              <div className="text-right">
                <button type="button" className="text-primary text-sm font-medium hover:underline cursor-pointer">
                  Quên mật khẩu
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold py-3.5 rounded-full transition text-[15px] cursor-pointer tracking-wider uppercase"
            >
              {loading
                ? "Đang xử lý..."
                : authModalTab === "login"
                ? "ĐĂNG NHẬP"
                : "ĐĂNG KÝ"}
            </button>
          </form>
        </div>

        {/* Right: Promo image */}
        <div className="hidden md:flex flex-col items-center justify-center bg-[#FFF5F5] w-[380px] p-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <img src="/assets/image_modal.png" alt="MediCare Hub" />
          </div>
        </div>
      </div>
    </div>
  );
}
