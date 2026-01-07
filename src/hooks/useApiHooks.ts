import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, userService, orderService, productService, categoryService, driverService } from "../services/api";

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
            const data = res.data.data || res.data;
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
