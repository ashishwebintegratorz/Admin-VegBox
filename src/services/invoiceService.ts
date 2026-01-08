import api from "./api";

export const invoiceService = {
    getInvoices: async (page = 1, limit = 10, filters: any = {}) => {
        const response = await api.get("/invoices", {
            params: { page, limit, ...filters },
        });
        return response.data;
    },

    getInvoiceById: async (id: string) => {
        const response = await api.get(`/invoices/${id}`);
        return response.data;
    },

    getInvoiceByOrderId: async (orderId: string) => {
        const response = await api.get(`/invoices/order/${orderId}`);
        return response.data;
    },
};
