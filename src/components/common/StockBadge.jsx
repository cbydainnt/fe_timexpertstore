import React from 'react';
import { Badge } from 'react-bootstrap';
import './StockBadge.css'; 

import { useTranslation } from 'react-i18next'; 

function StockBadge({ stock, className = '' }) {

  const { t } = useTranslation();

  let badgeClass = 'stock-checking';
   let text = t('stockBadge.checking', 'Đang kiểm tra...');

  if (stock !== undefined && stock !== null && !isNaN(stock)) {
    if (stock > 0) {
      badgeClass = 'stock-in';
      text = t('stockBadge.inStock', 'Còn hàng');
    } else {
      badgeClass = 'stock-out';
      text = t('stockBadge.outOfStock', 'Hết hàng');
    }
  }
  return (
    <Badge className={`stock-badge ${badgeClass} ${className}`} pill>
      {text}
    </Badge>
  );
}

export default StockBadge;
