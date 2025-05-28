// src/pages/public/CartPage.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
// Import Bootstrap components (Đảm bảo có Table, Form, Image,...)
import { Container, Row, Col, Card, Table, Button, FormControl, Image, Form, Alert, Badge } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import StockBadge from '../../components/common/StockBadge'; // Import StockBadge đã sửa (chỉ còn hàng/hết hàng)
// Import service Yêu thích (nếu dùng nút Lưu)
import { addFavorite } from '../../services/favoriteService';
import { removeItemsFromCart } from '../../services/cartService';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };
function CartPage() {

  const { t } = useTranslation();

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    items, removeItem, updateQuantity, toggleItemSelected,
    toggleSelectAll, areAllItemsSelected, getTotalSelectedPrice,
    getSelectedItems, getDistinctItemCount, fetchCart
  } = useCartStore();

  // Hàm xử lý thay đổi số lượng từ input
  const handleQuantityChange = async (productId, newQuantity) => {
    const quantityNum = parseInt(newQuantity, 10);
    let finalQuantity = 1;
    if (!isNaN(quantityNum) && quantityNum > 0) {
      finalQuantity = quantityNum;
    } else if (newQuantity === '') {
      // Nếu đang xóa dở thì chưa làm gì, chờ blur
      return;
    }
    // Gọi action updateQuantity (nó sẽ kiểm tra stock và alert nếu cần)
    await updateQuantity(productId, finalQuantity);
  };


  // Xử lý khi input số lượng mất focus
  const handleQuantityBlur = () => {
    if (quantity === '' || quantity <= 0) {
      setQuantity(1);
    }
  };

  // Hàm xử lý khi bấm nút + (kiểm tra stock trước khi gọi update)
  const handleIncreaseQuantity = async (item) => {
    // Lấy stock từ item trong state (đã được fetch/lưu từ trước)
    if (item.quantity < item.stock) {
      await updateQuantity(item.productId, item.quantity + 1);
    } else {
      // *** HIỂN THỊ ALERT KHI ĐẠT SỐ LƯỢNG TỐI ĐA ***
      toast.infor(`Số lượng sản phẩm "${item.name || 'này'}" trong kho không đủ. Bạn chỉ có thể mua tối đa ${item.stock} sản phẩm.`);
    }
  };

  // Hàm xử lý khi bấm nút -
  const handleDecreaseQuantity = async (item) => {
    await updateQuantity(item.productId, Math.max(1, item.quantity - 1));
  }

  // Hàm xử lý xóa item (gọi action từ store)
  const handleRemoveItem = (productId, productName) => {
    if (window.confirm(t('cartPage.confirmRemoveItem', 'Xóa "{{productName}}" khỏi giỏ hàng của bạn?', { productName: productName || 'sản phẩm này' }))) {
      removeItem(productId);
      toast.success(t('toastMessages.itemRemovedFromCart', 'Đã xóa "{{itemName}}" khỏi giỏ hàng!', { itemName: productName || 'Sản phẩm' }));
    }
  };

  const handleDeleteSelected = async () => {
    const selectedItems = getSelectedItems();
    if (window.confirm(t('cartPage.confirmDeleteSelected', 'Bạn có chắc chắn muốn xóa {{count}} mục đã chọn?', { count: selectedItems.length }))) {
      const productIds = selectedItems.map(item => item.productId);
      try {
        await removeItemsFromCart(productIds);
        if (typeof fetchCart === 'function') {
          await fetchCart();
        }
        toast.success(t('cartPage.selectedItemsRemoved', "Đã xóa các mục đã chọn."));
      } catch (error) {
        console.error("Error removing selected items:", error); //
        toast.error(t('cartPage.errorRemovingSelected', "Không thể xóa tất cả các mục đã chọn. Vui lòng thử lại."));
      }
    }
  };

  const handleAddSelectedToFavorites = async () => {
    if (!isAuthenticated) { alert("Vui lòng đăng nhập trước."); navigate('/login'); return; }
    if (selectedItems.length === 0) { toast.warn("Vui lòng chọn mục để lưu."); return; }
    let successCount = 0; let failCount = 0;
    const promises = selectedItems.map(async (item) => {
      try {
        await addFavorite(item.productId); // Gọi service thêm yêu thích
        successCount++;
      } catch (error) {
        console.error(`Failed to add product ${item.productId} to favorites:`, error);
        failCount++;
      }
    });
    await Promise.all(promises);
    toast.info(`${successCount} mục đã lưu vào mục yêu thích.${failCount > 0 ? ` ${failCount} mục không thành công.` : ''}`);
  };

  // Hàm định dạng giá
  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Lấy các giá trị cần thiết
  const allSelected = areAllItemsSelected();
  const selectedItems = getSelectedItems();
  const totalSelectedPrice = getTotalSelectedPrice();
  const distinctItemCount = getDistinctItemCount();

  // --- Render UI ---
  if (items.length === 0) { //
    return (
      <Container className="text-center py-5">
        <h2 className="h4 font-weight-light mb-4">{t('cartPage.emptyCartTitle', 'Giỏ hàng của bạn đang trống')}</h2>
        <p className="text-muted mb-4">{t('cartPage.emptyCartMessage', 'Có vẻ như bạn chưa thêm bất cứ thứ gì vào giỏ hàng của mình.')}</p>
        <Link to="/products">
          <Button variant="primary">{t('cartPage.continueShopping', 'Tiếp tục mua sắm')}</Button>
        </Link>
      </Container>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {/* // Thêm mb-5 để tạo khoảng trống cho thanh tổng kết */}
      <Container className="py-1 mb-5">
        <h1 className="mb-4">{t('cartPage.title', 'Giỏ hàng')}</h1>
        <Row>
          {/* Cột danh sách sản phẩm - Chiếm toàn bộ chiều rộng */}
          <Col lg={12}>
            <Card className="shadow-sm">
              <Card.Body className="p-0">
                {/* Bảng hiển thị giỏ hàng */}
                <Table responsive hover className="mb-0 align-middle cart-table-layout">
                  <thead className="table-light">
                    <tr>
                      {/* Checkbox Header */}
                      <th className="text-center px-3" style={{ width: '5%' }}>
                        <Form.Check type="checkbox" id="header-select-all" aria-label="Select all items" checked={allSelected} onChange={(e) => toggleSelectAll(e.target.checked)} />
                      </th>
                      {/* *** THAY ĐỔI CỘT: Sản Phẩm giờ bao gồm cả Đơn giá và Tồn kho *** */}
                      <th style={{ width: '40%' }}>{t('cartPage.table.product', 'Sản Phẩm')}</th>
                      <th className="text-center" style={{ width: '20%' }}>{t('cartPage.table.quantity', 'Số Lượng')}</th>
                      <th className="text-end" style={{ width: '20%' }}>{t('cartPage.table.amount', 'Số Tiền')}</th>
                      <th className="text-center" style={{ width: '10%' }}>{t('cartPage.table.actions', 'Thao Tác')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.productId}>
                        {/* Checkbox */}
                        <td className="text-center px-3">
                          <Form.Check type="checkbox" id={`select-item-${item.productId}`} aria-label={`Select ${item.name}`} checked={item.selected || false} onChange={() => toggleItemSelected(item.productId)} />
                        </td>
                        {/* Cột Sản Phẩm (Ảnh, Tên, Đơn giá, Tồn kho) */}
                        <td>
                          <div className="d-flex align-items-center">
                            {/* Ảnh */}
                            <Image
                              src={
                                item.imageUrl?.startsWith('http')
                                  ? item.imageUrl
                                  : `http://localhost:8080${item.imageUrl}`
                              }
                              alt={item.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/60?text=Image+Error';
                              }}
                              style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                              className="me-3 border rounded flex-shrink-0"
                            />

                            {/* Thông tin text */}
                            <div className="flex-grow-1">
                              <Link to={`/products/${item.productId}`} className="fw-medium text-dark text-decoration-none mb-1 d-block">{item.name || `Product ID: ${item.productId}`}</Link>
                              {/* Đơn giá */}
                              <div className="text-muted small mb-1">{t('cartPage.summary.unitPrice', 'Đơn giá')}: {formatPrice(item.price)}</div>
                              {/* Trạng thái tồn kho */}
                              <StockBadge stock={item.stock} />
                            </div>
                          </div>
                        </td>
                        {/* Số Lượng */}
                        <td className="text-center">
                          <div className="d-inline-flex align-items-center justify-content-center border rounded" style={{ maxWidth: '100px' }}>
                            <Button variant="light" size="sm" className="px-2" onClick={() => handleDecreaseQuantity(item)} disabled={item.quantity <= 1}>-</Button>
                            <FormControl type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item.productId, e.target.value)} onBlur={(e) => handleQuantityBlur(item.productId, e.target.value)} className="text-center border-0 shadow-none px-1" style={{ width: '50px' }} min="1" max={item.stock} aria-label={`Quantity for ${item.name}`} />
                            <Button variant="light" size="sm" className="px-2" onClick={() => handleIncreaseQuantity(item)} disabled={item.quantity >= item.stock}>+</Button>
                          </div>
                        </td>
                        {/* Số Tiền (Thành tiền) */}
                        <td className="text-end fw-medium">{formatPrice(item.price * item.quantity)}</td>
                        {/* Thao Tác (Xóa) */}
                        <td className="text-center">
                          <Button variant="link" size="sm" className="text-danger p-1" onClick={() => handleRemoveItem(item.productId, item.name || '')} title="Remove item">
                            <Trash size={20} color='gray' /> {/* Có thể tăng size icon một chút */}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* --- Thanh Tổng kết và Hành động ở dưới cùng (Giữ nguyên) --- */}
          <Col xs={12} className="mt-4">
            <Card className="shadow-sm cart-summary-bar" >
              <Card.Body className="p-2">
                <Row className="align-items-center gx-3">
                  {/* Phần bên trái: Chọn tất cả, Xóa, Lưu */}
                  <Col xs={12} md={6} className="d-flex align-items-center justify-content-center justify-content-md-start mb-2 mb-md-0">
                    <Form.Check type="checkbox" id="select-all-bottom" label={t('cartPage.summary.selectAll', 'Chọn Tất Cả ({{count}})', { count: distinctItemCount })} checked={allSelected} onChange={(e) => toggleSelectAll(e.target.checked)} className="me-3" />
                    <Button variant="link" size="sm" className="text-danger me-3 ps-0 pe-0" onClick={handleDeleteSelected} disabled={selectedItems.length === 0}>{t('cartPage.summary.deleteSelected', 'Xóa')}</Button>
                    {isAuthenticated && <Button variant="link" size="sm" className="ps-0 pe-0" onClick={handleAddSelectedToFavorites} disabled={selectedItems.length === 0}>{t('cartPage.summary.saveToFavorites', 'Lưu vào mục Đã thích')}</Button>}
                  </Col>
                  <Col xs={12} md={6} className="d-flex align-items-center justify-content-center justify-content-md-end">
                    <div className="me-3 text-end">
                      <span className="text-muted small d-block d-md-inline">{t('cartPage.summary.totalForItems', 'Tổng cộng ({{count}} Sản phẩm):', { count: selectedItems.length })}</span>
                      <span className="h5 mb-0 text fw-bold">{formatPrice(totalSelectedPrice)}</span>
                    </div>
                    <Link to="/checkout" className={`${selectedItems.length === 0 ? 'pe-none' : ''}`} aria-disabled={selectedItems.length === 0}>
                      <Button variant="dark" disabled={selectedItems.length === 0} style={{ minWidth: '120px' }}>{t('cartPage.summary.proceedToCheckout', 'Tiến hành đặt hàng')}</Button>
                    </Link>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
}

export default CartPage;