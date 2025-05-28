import React from 'react';
import { Badge } from 'react-bootstrap';
import './StockBadge.css'; // nếu chưa có thì tạo file này để tách CSS

function StockBadge({ stock, className = '' }) {
  let badgeClass = 'stock-checking';
  let text = 'Đang kiểm tra...';

  if (stock !== undefined && stock !== null && !isNaN(stock)) {
    if (stock > 0) {
      badgeClass = 'stock-in';
      text = 'Còn hàng';
    } else {
      badgeClass = 'stock-out';
      text = 'Hết hàng';
    }
  }

  return (
    <Badge className={`stock-badge ${badgeClass} ${className}`} pill>
      {text}
    </Badge>
  );
}

export default StockBadge;
