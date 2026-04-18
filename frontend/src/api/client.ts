import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally (skip: đăng nhập/đăng ký sai mật khẩu cũng trả 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const reqUrl = String(error.config?.url ?? "");
    const isAuthAttempt =
      reqUrl.includes("/auth/login") || reqUrl.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  register: (data: RegisterData) => api.post<User>("/auth/register", data),
  login: (data: LoginData) => api.post<TokenResponse>("/auth/login", data),
};

// --- Clinics ---
export interface Clinic {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  image_url: string | null;
  booking_count?: number;
}

export interface ClinicListParams {
  location?: string;
  clinic_type?: string;
  booking_order?: "asc" | "desc";
}

export const clinicsApi = {
  list: (params?: ClinicListParams) => api.get<Clinic[]>("/clinics", { params }),
  listServices: (clinicId: number) => api.get<Service[]>(`/clinics/${clinicId}/services`),
};

export interface Service {
  id: number;
  clinic_id: number;
  name: string;
  price: number;
  image_url: string | null;
}

// --- Doctors ---
export interface Doctor {
  id: number;
  name: string;
  specialty: string | null;
  clinic_id: number;
  clinic_name: string | null;
  image_url: string | null;
}

export const doctorsApi = {
  list: (clinicId?: number) =>
    api.get<Doctor[]>("/doctors", {
      params: clinicId ? { clinic_id: clinicId } : {},
    }),
};

// --- Slots ---
export interface Slot {
  slot_start: string;
  available: boolean;
}

export const slotsApi = {
  getAvailable: (doctorId: number, date: string) =>
    api.get<Slot[]>(`/doctors/${doctorId}/slots`, {
      params: { date },
    }),
};

// --- Appointments ---
export interface Appointment {
  id: number;
  doctor_id: number;
  doctor_name: string | null;
  clinic_name: string | null;
  slot_start: string;
  symptoms: string;
  image_path: string | null;
  status: string;
  can_cancel?: boolean;
  created_at: string;
}

export const appointmentsApi = {
  create: (formData: FormData) =>
    api.post<Appointment>("/appointments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  list: () => api.get<Appointment[]>("/appointments"),
  listForDoctor: () => api.get<Appointment[]>("/appointments/doctor/me"),
  cancel: (appointmentId: number) => api.patch<Appointment>(`/appointments/${appointmentId}/cancel`),
  doctorDecision: (appointmentId: number, decision: "confirmed" | "rejected") => {
    const formData = new FormData();
    formData.append("decision", decision);
    return api.patch<Appointment>(`/appointments/${appointmentId}/doctor-decision`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default api;
