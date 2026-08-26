import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BASIC_API_URL || "https://veg-bk-dp.onrender.com/api/v1";

const api = axios.create({
    baseURL: API_BASE_URL,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

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

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const userStr = localStorage.getItem("user");
                if (!userStr) throw new Error("No user stored");

                const userData = JSON.parse(userStr);
                const refreshToken = userData?.data?.refreshToken || userData?.refreshToken;

                if (!refreshToken) throw new Error("No refresh token available");

                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { token: newAccessToken } = response.data;

                // Update stored user data with new access token
                if (userData.data) {
                    userData.data.accessToken = newAccessToken;
                } else {
                    userData.token = newAccessToken;
                }
                localStorage.setItem("user", JSON.stringify(userData));

                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                authService.logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export const authService = {
    sendOtp: (phone: string, role?: string) =>
        api.post("/auth/send-otp", { phone, role }),

    verifyOtp: (phone: string, code: string, role?: string, pin?: string) =>
        api.post("/auth/verify-otp", { phone, code, role, pin }),

    loginWithPin: (phone: string, pin: string) =>
        api.post("/auth/login-with-pin", { phone, pin }),

    refreshToken: (refreshToken: string) =>
        api.post("/auth/refresh", { refreshToken }),

    logout: () => {
        localStorage.removeItem("user");
        window.location.href = "/signin";
    }
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
    onboardDriver: (formData: FormData) => api.post("/drivers/onboard", formData),
};

export const orderService = {
    getDriverOrders: (deliveryStatus?: string) =>
        api.get("/orders/driver/my-orders", { params: { deliveryStatus } }),

    updateDriverOrderStatus: (orderId: string, status: string) =>
        api.put(`/orders/driver/update-status/${orderId}`, { status }),

    listAllOrders: (status?: string, deliveryStatus?: string) =>
        api.get("/orders/all", { params: { status, deliveryStatus } }),

    getOrder: (orderId: string) =>
        api.get(`/orders/${orderId}`),

    assignDriver: (orderId: string, driverId: string) =>
        api.put(`/orders/assign-driver/${orderId}`, { driverId }),

    updateOrderStatus: (orderId: string, status?: string, deliveryStatus?: string) =>
        api.put(`/orders/update-status/${orderId}`, { status, deliveryStatus }),

    rescheduleOrder: (orderId: string, timeSlot: string, scheduleDate: string) =>
        api.put(`/orders/reschedule/${orderId}`, { timeSlot, scheduleDate }),
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

export const adminService = {
    getDashboardMetrics: () => api.get("/admin/dashboard").then(res => res.data),
    getUsersList: (type?: string) => api.get(`/admin/users-list${type ? `?type=${type}` : ''}`).then(res => res.data),
    broadcastNotification: (data: FormData) => api.post("/admin/broadcast-notification", data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
    broadcastCoupon: (data: FormData) => api.post("/admin/broadcast-coupon", data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
    getCoupons: () => api.get("/admin/coupons").then(res => res.data),
    updateCoupon: (id: string, data: FormData | any) => {
        const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
        return api.put(`/admin/coupons/${id}`, data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined).then(res => res.data);
    },
    deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`).then(res => res.data),
    getNotifications: () => api.get("/admin/notifications").then(res => res.data),
    updateNotification: (id: string, data: FormData | any) => {
        const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
        return api.put(`/admin/notifications/${id}`, data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined).then(res => res.data);
    },
    deleteNotification: (id: string) => api.delete(`/admin/notifications/${id}`).then(res => res.data),
};

export const zoneService = {
    getZones: () => api.get("/zones"),
    createZone: (data: any) => api.post("/zones", data),
    updateZone: (id: string, data: any) => api.put(`/zones/${id}`, data),
    deleteZone: (id: string) => api.delete(`/zones/${id}`),
};

export const settingService = {
    getSettings: () => api.get("/settings"),
    updateSetting: (key: string, value: any) => api.put(`/settings/${key}`, { value }),
};

export const adminUserService = {
    getAllUsers: () => api.get("/user/all"),
    blockUser: (id: string) => api.put(`/user/block/${id}`),
};

export default api;
