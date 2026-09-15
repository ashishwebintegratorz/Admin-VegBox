import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, userService, orderService, productService, categoryService, driverService, adminService, zoneService, settingService, adminUserService, bannerService } from "../services/api";

// Auth Hooks
export const useSendOtp = () => {
    return useMutation({
        mutationFn: ({ phone, role }: { phone: string; role?: string }) =>
            authService.sendOtp(phone, role),
    });
};

export const useVerifyOtp = () => {
    return useMutation({
        mutationFn: ({ phone, code, role, pin }: { phone: string; code: string; role?: string; pin?: string }) =>
            authService.verifyOtp(phone, code, role, pin),
    });
};

export const useLoginWithPin = () => {
    return useMutation({
        mutationFn: ({ phone, pin }: { phone: string; pin: string }) =>
            authService.loginWithPin(phone, pin),
    });
};

// User Hooks
export const useProfile = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: () => userService.getProfile().then(res => res.data.data || res.data),
    });
};

export const useDriversList = () => {
    return useQuery({
        queryKey: ["drivers"],
        queryFn: () => driverService.getAllDrivers().then(res => {
            const data = res?.data?.data || res?.data;
            if (!data) return [];
            return Array.isArray(data) ? data : (data.drivers || data.users || []);
        }),
    });
};

export const useFreeDriversList = () => {
    return useQuery({
        queryKey: ["drivers", "free"],
        queryFn: () => driverService.getFreeDrivers().then(res => {
            const data = res.data.data || res.data;
            return Array.isArray(data) ? data : (data.drivers || data.users || []);
        }),
    });
};

// Order Hooks
export const useOrders = (status?: string, deliveryStatus?: string) => {
    return useQuery({
        queryKey: ["orders", status, deliveryStatus],
        queryFn: () => orderService.listAllOrders(status, deliveryStatus).then(res => {
            const data = res.data.data || res.data;
            return Array.isArray(data) ? data : (data.orders || []);
        }),
        refetchInterval: 5000,
    });
};

export const useOrder = (orderId: string) => {
    return useQuery({
        queryKey: ["order", orderId],
        queryFn: () => orderService.getOrder(orderId).then(res => res.data.data || res.data),
        enabled: !!orderId,
    });
};

export const useAssignDriver = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, driverId }: { orderId: string; driverId: string }) =>
            orderService.assignDriver(orderId, driverId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, status, deliveryStatus }: { orderId: string; status?: string; deliveryStatus?: string }) =>
            orderService.updateOrderStatus(orderId, status, deliveryStatus),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["order"] });
        },
    });
};

export const useRescheduleOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, timeSlot, scheduleDate }: { orderId: string; timeSlot: string; scheduleDate: string }) =>
            orderService.rescheduleOrder(orderId, timeSlot, scheduleDate),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["order"] });
        },
    });
};

// Product Hooks
export const useProducts = (params?: { page?: number; limit?: number; search?: string; category?: string; sort?: string; minPrice?: number; maxPrice?: number }) => {
    return useQuery({
        queryKey: ["products", params],
        queryFn: () => productService.listProducts(params).then(res => res.data),
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => productService.createProduct(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, formData }: { id: string; formData: FormData }) => productService.updateProduct(id, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => productService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryService.listCategories().then(res => {
            const data = res.data.data || res.data;
            return Array.isArray(data) ? data : (data.categories || []);
        }),
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => categoryService.createCategory(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => categoryService.updateCategory(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => categoryService.deleteCategory(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    });
};

// Banner Hooks
export const useBanners = () => {
    return useQuery({
        queryKey: ["banners"],
        queryFn: () => bannerService.getBanners().then((res: any) => {
            const data = res.data.data || res.data;
            return Array.isArray(data) ? data : (data.banners || []);
        }),
    });
};

export const useCreateBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => bannerService.createBanner(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
    });
};

export const useUpdateBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => bannerService.updateBanner(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
    });
};

export const useDeleteBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => bannerService.deleteBanner(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
    });
};

export const useDashboardMetrics = () => {
    return useQuery({
        queryKey: ["dashboardMetrics"],
        queryFn: () => adminService.getDashboardMetrics().then(res => res.data || res),
    });
};

// Zone Hooks
export const useZones = () => {
    return useQuery({
        queryKey: ["zones"],
        queryFn: () => zoneService.getZones().then(res => {
            const data = res.data.data || res.data;
            return Array.isArray(data) ? data : [];
        }),
    });
};

export const useCreateZone = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => zoneService.createZone(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] });
        },
    });
};

export const useUpdateZone = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => zoneService.updateZone(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] });
        },
    });
};

export const useDeleteZone = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => zoneService.deleteZone(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] });
        },
    });
};

// Admin User Hooks
export const useAdminUsers = () => {
    return useQuery({
        queryKey: ["adminUsers"],
        queryFn: () => adminUserService.getAllUsers().then(res => res.data),
    });
};

export const useBlockUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminUserService.blockUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
        },
    });
};

// Settings Hooks
export const useSettings = () => {
    return useQuery({
        queryKey: ["settings"],
        queryFn: () => settingService.getSettings().then(res => res.data.settings),
    });
};

export const useUpdateSetting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ key, value }: { key: string; value: any }) => settingService.updateSetting(key, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
    });
};

// Notifications & Coupons Hooks
export const useUsersList = (type?: string) => {
    return useQuery({
        queryKey: ["usersList", type],
        queryFn: () => adminService.getUsersList(type),
    });
};

export const useBroadcastNotification = () => {
    return useMutation({
        mutationFn: (data: FormData) => adminService.broadcastNotification(data),
    });
};

export const useBroadcastCoupon = () => {
    return useMutation({
        mutationFn: (data: FormData) => adminService.broadcastCoupon(data),
    });
};

export const useCoupons = () => {
    return useQuery({
        queryKey: ["coupons"],
        queryFn: () => adminService.getCoupons(),
    });
};

export const useUpdateCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData | any }) => adminService.updateCoupon(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
    });
};

export const useDeleteCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminService.deleteCoupon(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
    });
};

export const useNotifications = () => {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: () => adminService.getNotifications(),
    });
};

export const useUpdateNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData | any }) => adminService.updateNotification(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminService.deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};
