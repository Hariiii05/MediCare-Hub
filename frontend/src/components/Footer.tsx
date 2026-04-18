import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-[#24AC7C] text-white">
      <div className="page-content py-10">
        <div className="grid grid-cols-1 md:grid-cols-[1.25fr_1fr_1fr] gap-8 md:gap-10 items-start">
          {/* Company Info */}
          <div>
            <Logo variant="footer" className="mb-4" />
            <p className="font-bold text-sm mb-4">
              CÔNG TY TNHH 1 THÀNH VIÊN MEDICARE
            </p>
            <div className="space-y-2.5 text-sm text-white/90">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>
                  Tầng 6, tòa A2, 207 Giải phóng, phường Bạch Mai, Hà Nội, Việt
                  Nam
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>1900 8386</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>maketing@medicare.hub.com</span>
              </div>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-3 text-sm">
            <a href="#" className="block hover:underline text-white/90">
              Đặt lịch khám
            </a>
            <a href="#" className="block hover:underline text-white/90">
              Đăng ký tư vấn trực tuyến
            </a>
            <a href="#" className="block hover:underline text-white/90">
              Hỏi đáp
            </a>
            <a href="#" className="block hover:underline text-white/90">
              Hồ sơ sức khoẻ
            </a>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-3 text-sm">
            <a href="#" className="block hover:underline text-white/90">
              Điều khoản sử dụng
            </a>
            <a href="#" className="block hover:underline text-white/90">
              Chính sách bảo mật
            </a>
            <a href="#" className="block hover:underline text-white/90">
              Quy chế hoạt động
            </a>
            <a href="#" className="block hover:underline text-white/90">
              Trung tâm trợ giúp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
