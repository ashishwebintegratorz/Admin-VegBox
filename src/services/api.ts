import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BASIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        const userData = JSON.parse(userStr);
        // Handle common backend nesting: response.data.data.accessToken or response.data.token
        const token = userData?.data?.accessToken || userData?.data?.token || userData?.accessToken || userData?.token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const authService = {
    sendOtp: (phone: string, role?: string) =>
        api.post("/auth/send-otp", { phone, role }),

    verifyOtp: (phone: string, code: string, role?: string, pin?: string) =>
        api.post("/auth/verify-otp", { phone, code, role, pin }),

    loginWithPin: (phone: string, pin: string) =>
        api.post("/auth/login-with-pin", { phone, pin }),
};

export const userService = {
    getProfile: () => api.get("/user/me"),
};

export const driverService = {
    getAllDrivers: () => api.get("/drivers/all"),
    getFreeDrivers: () => api.get("/drivers/free"),
    toggleOnline: (isOnline: boolean) =>
        api.put("/drivers/toggle-online", { isOnline }),
    reachedStore: () => api.put("/drivers/reached-store"),
};

export const orderService = {
    getDriverOrders: (deliveryStatus?: string) =>
        api.get("/orders/driver/my-orders", { params: { deliveryStatus } }),

    updateDriverOrderStatus: (orderId: string, status: string) =>
        api.put(`/orders/driver/update-status/${orderId}`, { status }),

    listAllOrders: (status?: string, deliveryStatus?: string) =>
        api.get("/orders/all", { params: { status, deliveryStatus } }),

    assignDriver: (orderId: string, driverId: string) =>
        api.put(`/orders/assign-driver/${orderId}`, { driverId }),

    updateOrderStatus: (orderId: string, status?: string, deliveryStatus?: string) =>
        api.put(`/orders/update-status/${orderId}`, { status, deliveryStatus }),
};

export const productService = {
    listProducts: (params?: any) => api.get("/products/all", { params }),
    getProduct: (id: string) => api.get(`/products/${id}`),
    createProduct: (formData: FormData) => api.post("/products/add", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateProduct: (id: string, formData: FormData) => api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteProduct: (id: string) => api.delete(`/products/${id}`),
};

export const categoryService = {
    listCategories: () => api.get("/categories"),
};

export default api;
