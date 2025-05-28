import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, columns }) => {
  return (
    <Row>
      {products.map((product) => (
        <Col key={product.id} xs={12} sm={6} md={columns === 3 ? 4 : 3} lg={columns === 3 ? 3 : 2}>
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid;
    