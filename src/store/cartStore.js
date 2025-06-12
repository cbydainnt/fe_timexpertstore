import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient from '../config/axiosConfig'; // Import apiClient
import { useAuthStore } from './authStore'; // Import authStore để lấy userId
import { removeItemsFromCart } from '../services/cartService';

export const useCartStore = create(
    persist(
        (set, get) => ({
            // --- State ---
            items: [], // Mảng item, mỗi item giờ có thêm 'selected' và 'stock'

            // --- Actions ---

            fetchCart: async () => {
                const { isAuthenticated, user } = useAuthStore.getState();
                if (!isAuthenticated || !user) {
                    console.log("User not logged in for fetchCart, using local storage cart.");
                    // Đảm bảo item từ localStorage có cờ selected và stock (có thể là giá trị mặc định/cũ)
                    set(state => ({
                        items: state.items.map(item => ({
                            ...item,
                            selected: item.selected ?? true,
                            stock: item.stock ?? 99 // Gán stock mặc định lớn nếu chưa có
                        }))
                    }));
                    return;
                }

                console.log("Attempting to fetch cart from API for user:", user.userId);
                try {
                    // API GET /api/carts cần trả về CartDTO chứa List<CartItemDetailDTO> (có stock)
                    const response = await apiClient.get(`/carts`);
                    const backendCart = response.data; // CartDTO
                    const mappedItems = backendCart?.items?.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: parseFloat(item.price) || 0,
                        name: item.name || `Product ${item.productId}`, // Lấy name từ CartItemDetailDTO
                        imageUrl: item.imageUrl || '', // Lấy imageUrl từ CartItemDetailDTO
                        selected: true, // Mặc định chọn tất cả khi fetch
                        stock: parseInt(item.stock) === undefined || isNaN(parseInt(item.stock)) ? 99 : parseInt(item.stock), // Lấy stock từ CartItemDetailDTO
                    })) || [];
                    set({ items: mappedItems });
                    console.log("Cart fetched from API:", mappedItems);
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        set({ items: [] });
                        console.log("No cart found on server for user.");
                    } else {
                        console.error("Failed to fetch cart from API:", error);
                        set(state => ({ // Đảm bảo item từ localStorage có cờ selected và stock
                            items: state.items.map(item => ({ ...item, selected: item.selected ?? true, stock: item.stock ?? 99 }))
                        }));
                    }
                }
            },

            addItem: async (product, quantity = 1) => {
                // Cần ProductDTO có đủ thông tin (id, name, price, imageUrl, stock)
                if (!product || quantity <= 0 || product.stock === undefined || product.stock === null) {
                    console.error("Cannot add item: Invalid product data or missing stock info.", product);
                    alert("Cannot add this item, product information is incomplete.");
                    return;
                };

                const currentItems = get().items;
                const availableStock = parseInt(product.stock);
                const existingItem = currentItems.find(item => item.productId === product.productId);
                const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

                // Kiểm tra stock trước khi thêm
                if (currentQuantityInCart + quantity > availableStock) {
                    alert(`Cannot add ${quantity} item(s). Only ${availableStock - currentQuantityInCart} more available for "${product.name}".`);
                    return;
                }

                const price = parseFloat(product.price) || 0;
                let updatedItems = [];
                let itemToAddOrUpdate = null;
                const existingItemIndex = currentItems.findIndex(item => item.productId === product.productId);

                if (existingItemIndex > -1) {
                    updatedItems = currentItems.map((item, index) => {
                        if (index === existingItemIndex) {
                            itemToAddOrUpdate = { ...item, quantity: item.quantity + quantity, selected: true, stock: availableStock }; // Cập nhật stock và chọn
                            return itemToAddOrUpdate;
                        } return item;
                    });
                } else {
                    itemToAddOrUpdate = {
                        productId: product.productId, name: product.name, price: price, quantity: quantity, imageUrl: product.imageUrl, selected: true, stock: availableStock // Lưu stock và chọn
                    };
                    updatedItems = [...currentItems, itemToAddOrUpdate];
                }
                set({ items: updatedItems });

                // Gọi API backend
                const { isAuthenticated } = useAuthStore.getState();
                if (isAuthenticated) {
                    try {
                        await apiClient.post(`/carts/items`, { productId: product.productId, quantity: quantity });
                        console.log("Item added/updated on server:", itemToAddOrUpdate);
                    } catch (error) {
                        console.error("Failed to add/update item via API:", error);
                        set({ items: currentItems }); // Rollback
                        alert("Failed to add item to cart. Please try again.");
                    }
                }
            },

            // Cập nhật số lượng và kiểm tra tồn kho
            updateQuantity: async (productId, quantity) => {
                if (quantity <= 0) { get().removeItem(productId); return false; } // Xóa nếu SL <= 0

                const currentItems = get().items;
                const itemToUpdate = currentItems.find(item => item.productId === productId);

                if (!itemToUpdate) {
                    console.warn(`Item with productId ${productId} not found in cart.`);
                    return false;
                }

                // Kiểm tra tồn kho (itemToUpdate.stock đã được lưu khi fetch hoặc add)
                if (quantity > itemToUpdate.stock) {
                    console.warn(`Attempted to update quantity for ${productId} to ${quantity}, but stock is only ${itemToUpdate.stock}`);
                    alert(`Cannot set quantity to ${quantity}. Only ${itemToUpdate.stock} items available.`);
                    // Không cập nhật state hay gọi API
                    return false; // Báo hiệu update thất bại
                }

                // Nếu số lượng hợp lệ, cập nhật state
                const updatedItems = currentItems.map(item =>
                    item.productId === productId ? { ...item, quantity: quantity } : item
                );
                set({ items: updatedItems });

                // Gọi API backend
                const { isAuthenticated } = useAuthStore.getState();
                if (isAuthenticated) {
                    try {
                        await apiClient.put(`/carts/items/${productId}`, null, { params: { quantity } });
                        console.log("Item quantity updated on server:", productId, quantity);
                        return true; // Thành công
                    } catch (error) {
                        console.error("Failed to update quantity via API:", error);
                        set({ items: currentItems }); // Rollback state
                        alert("Failed to update item quantity. Please try again.");
                        return false; // Thất bại
                    }
                }
                return true; // Thành công (local)
            },

            /**
 * Xóa sản phẩm khỏi giỏ hàng.
 */
            removeItem: async (productId) => {
                const currentItems = get().items;
                const updatedItems = currentItems.filter(item => item.productId !== productId);
                set({ items: updatedItems }); // Update local state

                const { isAuthenticated } = useAuthStore.getState();
                if (isAuthenticated) {
                    try {
                        await apiClient.delete(`/carts/items/${productId}`);
                        console.log("Item removed from server:", productId);
                    } catch (error) {
                        console.error("Failed to remove item via API:", error);
                        set({ items: currentItems }); // Rollback state
                        alert("Failed to remove item. Please try again.");
                    }
                }
            },

            /**
             * Xóa toàn bộ giỏ hàng.
             */
            clearCart: async (syncWithApi = true) => {
                const currentItems = get().items; // Lưu để rollback nếu cần
                set({ items: [] }); // Update local state

                const { isAuthenticated } = useAuthStore.getState();
                if (isAuthenticated && syncWithApi) {
                    try {
                        await apiClient.delete(`/carts`);
                        console.log("Cart cleared on server.");
                    } catch (error) {
                        console.error("Failed to clear cart via API:", error);
                        // Không rollback state local khi clear cart
                        alert("Failed to clear server cart. Local cart cleared.");
                    }
                }
            },

            toggleItemSelected: (productId) => {
                set((state) => ({
                    items: state.items.map(item =>
                        item.productId === productId ? { ...item, selected: !item.selected } : item
                    )
                }));
                console.log(`Toggled selection for productId: ${productId}`);
            },

            toggleSelectAll: (isSelected) => {
                set((state) => ({
                    items: state.items.map(item => ({ ...item, selected: isSelected }))
                }));
                console.log(`Toggled select all to: ${isSelected}`);
            },

            removeOrderedItems: async (orderedProductIds) => {
                if (!orderedProductIds || orderedProductIds.length === 0) return;
                const currentItems = get().items;
                const remainingItems = currentItems.filter(item => !orderedProductIds.includes(item.productId));
                set({ items: remainingItems });

                const { isAuthenticated } = useAuthStore.getState();
                if (isAuthenticated) {
                    try {
                        await removeItemsFromCart(orderedProductIds);
                        console.log("Removed ordered items from server cart:", orderedProductIds);
                    } catch (error) {
                        console.error("Failed to remove ordered items via API:", error);
                        alert("Order placed, but failed to update the cart correctly.");
                    }
                }
            },

            // --- Selectors (Đã cập nhật) ---
            getDistinctItemCount: () => get().items.length,
            getTotalSelectedItemsQuantity: () => get().items.reduce((total, item) => item.selected ? total + item.quantity : total, 0),
            getTotalSelectedPrice: () => get().items.reduce((total, item) => {
                if (item.selected) {
                    const price = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
                    const quantity = item.quantity > 0 ? item.quantity : 0;
                    return total + (price * quantity);
                }
                return total;
            }, 0),
            areAllItemsSelected: () => get().items.length > 0 && get().items.every(item => item.selected),
            getSelectedItems: () => get().items.filter(item => item.selected),

        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => {
                return (state, error) => {
                    if (error) { console.error("Cart hydration error", error); }
                    else if (state) {
                        // Đảm bảo item load từ storage có selected và stock (mặc định)
                        const itemsProcessed = state.items.map(item => ({ ...item, selected: item.selected ?? true, stock: item.stock ?? 99 }));
                        state.items = itemsProcessed;
                        console.log("Cart hydration finished, items processed.");
                        // Fetch từ API nếu đã đăng nhập để đồng bộ stock và giá mới nhất
                        if (useAuthStore.getState().isAuthenticated) {
                            console.log("User authenticated after cart hydration, fetching cart...");
                            state.fetchCart();
                        }
                    }
                }
            }
        }
    )
);

// *** BỎ subscribe ở đây ***