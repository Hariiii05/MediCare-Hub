export default function Logo({
  className = "",
  variant = "header",
}: {
  className?: string;
  variant?: "header" | "footer";
}) {
  const isHeader = variant === "header";
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={isHeader ? "/assets/logo_header.png" : "/assets/logo_footer.png"}
        alt="MediCare Hub"
        className={isHeader ? "h-12 md:h-14 object-contain shrink-0" : "h-16 md:h-20 object-contain shrink-0"}
      />
    </div>
  );
}
