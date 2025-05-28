// components/admin/ChartCard.jsx
import React, { useState } from 'react';
import { Card, Modal, Button } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';

const ChartCard = ({ title, chart, footer, height = 350 }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card className="shadow-sm h-100">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Card.Title as="h6" className="mb-0">{title}</Card.Title>
          {chart && (
            <Button
              variant="light"
              size="sm"
              onClick={() => setShowModal(true)}
              title="Phóng to biểu đồ"
            >
              <Search />
            </Button>
          )}
        </Card.Header>
        {chart && <Card.Body style={{ height, overflow: 'hidden' }}>{chart}</Card.Body>}
        {footer && <Card.Body>{footer}</Card.Body>}
      </Card>

      {chart && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ height: 500 }}>{chart}</div>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default ChartCard;