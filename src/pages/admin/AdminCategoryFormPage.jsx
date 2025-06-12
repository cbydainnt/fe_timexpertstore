import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getCategoryById, createCategory, updateCategory } from '../../services/categoryService';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion'; // Animation

// Animation variants
const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { duration: 0.3 };


function AdminCategoryFormPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(categoryId);

  const [loading, setLoading] = useState(false); // Loading khi submit
  const [loadingData, setLoadingData] = useState(isEditMode); // Chỉ loading data khi edit
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', description: '' }
  });

  // Fetch data khi edit
  const fetchCategoryData = useCallback(async () => {
    if (!isEditMode) return; // Chỉ fetch khi edit
    setLoadingData(true); setError('');
    try {
      const response = await getCategoryById(categoryId);
      reset({ name: response.data.name || '', description: response.data.description || '' });
    } catch (err) {
      console.error("Error fetching category:", err);
      setError('Không tải được dữ liệu danh mục.');
      toast.error('Không tải được dữ liệu danh mục.');
    } finally { setLoadingData(false); }
  }, [categoryId, isEditMode, reset]);

  useEffect(() => { fetchCategoryData(); }, [fetchCategoryData]);

  // Submit form
  const onSubmit = async (data) => {
    setLoading(true); setError('');
    const categoryData = { name: data.name, description: data.description };

    try {
      if (isEditMode) {
        await updateCategory(categoryId, categoryData);
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await createCategory(categoryData);
        toast.success('Tạo danh mục mới thành công!');
      }
      navigate('/admin/categories'); // Quay về list
    } catch (err) {
      console.error("Error saving category:", err);
      const errorMsg = err.response?.data?.message || 'Không lưu được danh mục.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally { setLoading(false); }
  };

  if (loadingData) { return <Container className="text-center py-5"><Spinner /></Container>; }

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
        <Container fluid style={{ maxWidth: '700px' }}> {/* Giới hạn chiều rộng form */}
            <Link to="/admin/categories" className="btn btn-outline-secondary btn-sm mb-3">
                <ArrowLeft className="me-1" /> Quay lại
            </Link>

            <Card className="shadow-sm">
                <Card.Header>
                    <Card.Title as="h5">{isEditMode ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</Card.Title>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group className="mb-3" controlId="categoryName">
                            <Form.Label>Tên Danh mục <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên danh mục"
                                isInvalid={!!errors.name}
                                {...register("name", { required: "Tên danh mục là bắt buộc" })}
                            />
                            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="categoryDescription">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea" rows={3}
                                placeholder="Nhập mô tả danh mục (tùy chọn)"
                                {...register("description")}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                            <Button variant="secondary" type="button" onClick={() => navigate('/admin/categories')} disabled={loading}>
                                Hủy
                            </Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? <Spinner as="span" animation="border" size="sm" /> : (isEditMode ? 'Cập nhật' : 'Tạo')}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    </motion.div>
  );
}

export default AdminCategoryFormPage;
