// src/utils/orderUtils.js

export const OrderStatus = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    COMPLETED: 'COMPLETED',
    CANCELED: 'CANCELED',
};

export const getStatusVariant = (status) => {
    switch (status) {
        case 'COMPLETED': return 'success';
        case 'SHIPPED': return 'info';
        case 'PROCESSING': return 'warning';
        case 'PENDING': return 'secondary';
        case 'PAID': return 'primary';
        case 'CANCELED': return 'danger';
        default: return 'light';
    }
};

export const getStatusLabel = (status) => {
    switch (status) {
        case 'PENDING': return 'Chờ xử lý';
        case 'PAID': return 'Đã thanh toán';
        case 'PROCESSING': return 'Đang xử lý';
        case 'SHIPPED': return 'Đã giao hàng';
        case 'COMPLETED': return 'Hoàn thành';
        case 'CANCELED': return 'Đã hủy';
        default: return status;
    }
};
