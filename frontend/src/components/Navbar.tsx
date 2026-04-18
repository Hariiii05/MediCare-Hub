import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";

  const navItems = [
    ...(!isDoctor ? [{ label: "Đặt khám", path: "/dat-kham" }] : []),
    { label: "Lịch hẹn của tôi", path: "/appointments" },
    { label: "Hỏi đáp bác sĩ", path: "/hoi-dap" },
    { label: "Hồ sơ sức khoẻ", path: "/ho-so" },
  ];

  return (
    <nav className="bg-white border-b border-border">
      <div className="page-content flex items-center justify-between h-16">
        <Link to="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-[15px] font-medium transition-colors hover:text-primary ${
                location.pathname.startsWith(item.path)
                  ? "text-primary"
                  : "text-text-main"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
