import { useAuth } from "../context/AuthContext";

export default function TopBar() {
  const { isAuthenticated, user, logout, openAuthModal } = useAuth();

  return (
    <div className="bg-primary text-white text-sm">
      <div className="page-content flex items-center justify-between h-10">
        <div className="flex items-center gap-2">
          <span>Hotline đặt khám:</span>
          <a href="tel:19008386" className="flex items-center gap-1 font-semibold hover:underline">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            1900 8386
          </a>
        </div>
        <div>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span>Xin chào, <strong>{user?.username}</strong></span>
              <button
                onClick={logout}
                className="hover:underline cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("register")}
              className="hover:underline cursor-pointer font-medium"
            >
              Đăng ký / Đăng nhập
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
