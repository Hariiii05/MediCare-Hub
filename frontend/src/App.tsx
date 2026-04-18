import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import BookingClinics from "./pages/BookingClinics";
import BookingClinicDetail from "./pages/BookingClinicDetail";
import BookingTimeSlots from "./pages/BookingTimeSlots";
import BookingInfo from "./pages/BookingInfo";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyAppointments from "./pages/MyAppointments";

function App() {
  return (
    <BrowserRouter> /* Quản lý URL */
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dat-kham" element={<BookingClinics />} />
            <Route path="/dat-kham/clinic/:clinicId" element={<BookingClinicDetail />} />
            <Route path="/dat-kham/slots/:doctorId" element={<BookingTimeSlots />} />
            <Route
              path="/dat-kham/info"
              element={
                <ProtectedRoute>
                  <BookingInfo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dat-kham/confirmation"
              element={
                <ProtectedRoute>
                  <BookingConfirmation />
                </ProtectedRoute>
              }
            />
            <Route path="/appointments" element={<MyAppointments />} />
            {/* Placeholder routes */}
            <Route path="/hoi-dap" element={<div className="max-w-[1200px] mx-auto px-4 py-16 text-center text-text-secondary">Trang Hỏi đáp bác sĩ (sắp ra mắt)</div>} />
            <Route path="/ho-so" element={<div className="max-w-[1200px] mx-auto px-4 py-16 text-center text-text-secondary">Trang Hồ sơ sức khoẻ (sắp ra mắt)</div>} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}


export default App;
