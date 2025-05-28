// src/pages/admin/AdminProductFormPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form'; // Thêm Controller nếu dùng component phức tạp
import { getProductById, createProduct, uploadProductImagesAPI, updateProduct } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { Container, Card, Form, Button, Spinner, Alert, Row, Col, Image, InputGroup } from 'react-bootstrap';
import { ArrowLeft, StarFill, Upload, Trash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

// Animation variants
const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { duration: 0.3 };

function AdminProductFormPage() {
    const { t } = useTranslation();
    const { productId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(productId);

    const [loading, setLoading] = useState(false); // Loading khi submit
    const [loadingData, setLoadingData] = useState(isEditMode); // Loading khi fetch data
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]); // Danh sách category cho select

    // State cho quản lý ảnh (ví dụ đơn giản)
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedPrimaryImage, setSelectedPrimaryImage] = useState(null);

    const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm({
        defaultValues: { // Khởi tạo giá trị mặc định
            name: '', description: '', price: '', stock: '', barcode: '', brand: '', model: '',
            movement: '', caseMaterial: '', strapMaterial: '', dialColor: '', waterResistance: '',
            categoryId: '', images: [] // Thêm images nếu cần quản lý file trực tiếp
        }
    });

    // Fetch categories
    useEffect(() => {
        getAllCategories()
            .then(res => setCategories(res.data || []))
            .catch(err => console.error("Failed to load categories:", err));
    }, []);

    // Fetch product data khi edit
    const fetchProductData = useCallback(async () => {
        if (!isEditMode) return;
        setLoadingData(true); setError('');
        try {
            const response = await getProductById(productId);
            const productData = response.data;
            reset({
                name: productData.name || '',
                description: productData.description || '',
                price: productData.price || '',
                stock: productData.stock === undefined ? '' : productData.stock, // Xử lý stock
                barcode: productData.barcode || '',
                brand: productData.brand || '',
                model: productData.model || '',
                movement: productData.movement || '',
                caseMaterial: productData.caseMaterial || '',
                strapMaterial: productData.strapMaterial || '',
                dialColor: productData.dialColor || '',
                waterResistance: productData.waterResistance || '',
                categoryId: productData.categoryId || '',
            });
            const BASE_IMAGE_URL = 'http://localhost:8080';
            const productImageUrls = productData.imageUrls
                ? productData.imageUrls.map(url =>
                    url.startsWith('http') ? url : `${BASE_IMAGE_URL}${url}`
                )
                : [];

            const primaryImage = productData.primaryImageUrl
                ? (productData.primaryImageUrl.startsWith('http')
                    ? productData.primaryImageUrl
                    : `${BASE_IMAGE_URL}${productData.primaryImageUrl}`)
                : (productImageUrls.length > 0 ? productImageUrls[0] : null);

            setImagePreviews(productImageUrls.map(url => ({
                url,
                isNew: false // Đánh dấu là ảnh đã có trên server
            })));

            setSelectedPrimaryImage(primaryImage);

        } catch (err) {
            console.error("Error fetching product:", err);
            setError('Failed to load product data.');
            toast.error('Failed to load product data.');
        } finally { setLoadingData(false); }
    }, [productId, isEditMode, reset]);

    useEffect(() => { fetchProductData(); }, [fetchProductData]);


    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        const newImageObjects = files.map(file => ({
            url: URL.createObjectURL(file), // blob URL for preview
            isNew: true,
            file: file // File object để upload
        }));
        setImagePreviews(prev => [...prev, ...newImageObjects]);
        // Tự động chọn ảnh đầu tiên mới thêm làm ảnh chính nếu chưa có ảnh chính
        if (!selectedPrimaryImage && newImageObjects.length > 0) {
            setSelectedPrimaryImage(newImageObjects[0].url);
        }
    };

    const handleRemoveImage = (urlToRemove) => {
        const imageToRemove = imagePreviews.find(img => img.url === urlToRemove);
        if (!imageToRemove) return;

        setImagePreviews(prev => prev.filter(img => img.url !== urlToRemove));

        if (imageToRemove.isNew && imageToRemove.url.startsWith('blob:')) {
            URL.revokeObjectURL(urlToRemove); // Thu hồi blob URL
        }
        // Nếu ảnh bị xóa là ảnh chính, chọn lại ảnh chính
        if (selectedPrimaryImage === urlToRemove) {
            const remainingImages = imagePreviews.filter(img => img.url !== urlToRemove);
            setSelectedPrimaryImage(remainingImages.length > 0 ? remainingImages[0].url : null);
        }
    };

    const handleSetPrimary = (url) => {
        setSelectedPrimaryImage(url);
        // TODO: Cần gửi thông tin ảnh nào là primary lên backend khi save/update
        console.log("Set primary image (preview):", url);
    };
    // --- Kết thúc xử lý ảnh ---


    // Submit form
    const onSubmit = async (data) => {
        setLoading(true); setError('');
        let finalPrimaryImageUrl = selectedPrimaryImage;
        const finalImageUrls = [];

        // Bước 1: Upload các ảnh mới (có isNew: true và file)
        const filesToUpload = imagePreviews.filter(img => img.isNew && img.file).map(img => img.file);
        let uploadedServerUrls = [];

        if (filesToUpload.length > 0) {
            try {
                const response = await uploadProductImagesAPI(filesToUpload); // API trả về List<String>
                uploadedServerUrls = response.data;
                toast.info(`${uploadedServerUrls.length} ảnh mới đã được tải lên.`);
            } catch (uploadError) {
                console.error("Error uploading new images:", uploadError);
                setError(uploadError.response?.data?.message || "Lỗi tải lên ảnh mới.");
                toast.error("Lỗi tải lên ảnh mới.");
                setLoading(false);
                return;
            }
        }

        // Bước 2: Xây dựng finalImageUrls và finalPrimaryImageUrl
        let newFileIndex = 0;
        let tempFinalPrimaryImageUrl = selectedPrimaryImage;
        imagePreviews.forEach(preview => {
            if (preview.isNew && preview.file) { // Chỉ xử lý ảnh mới có file
                if (newFileIndex < uploadedServerUrls.length) {
                    const serverUrl = uploadedServerUrls[newFileIndex++];
                    finalImageUrls.push(serverUrl);
                    if (selectedPrimaryImage === preview.url) { // Nếu blob URL này là ảnh chính đã chọn
                        tempFinalPrimaryImageUrl = serverUrl; // Cập nhật ảnh chính thành URL server
                    }
                } else {
                    // Lỗi: Số lượng URL trả về ít hơn số file mới định upload
                    console.warn(`Mismatch: Missing server URL for new image (blob: ${preview.url})`);
                }
            } else if (!preview.isNew) { // Ảnh cũ (URL từ server)
                finalImageUrls.push(preview.url);
            }
        });
        finalPrimaryImageUrl = tempFinalPrimaryImageUrl;

        // Đảm bảo finalPrimaryImageUrl nằm trong finalImageUrls, nếu không thì chọn cái đầu tiên
        if (finalPrimaryImageUrl && !finalImageUrls.includes(finalPrimaryImageUrl)) {
            finalPrimaryImageUrl = finalImageUrls.length > 0 ? finalImageUrls[0] : null;
        } else if (!finalPrimaryImageUrl && finalImageUrls.length > 0) {
            finalPrimaryImageUrl = finalImageUrls[0];
        }
        const categoryIdValue = data.categoryId ? parseInt(data.categoryId, 10) : null;
        if (!categoryIdValue || isNaN(categoryIdValue) || categoryIdValue <= 0) {
            setError("Vui lòng chọn một danh mục hợp lệ cho sản phẩm.");
            toast.error("Vui lòng chọn một danh mục hợp lệ.");
            setLoading(false);
            return; // Dừng xử lý nếu categoryId không hợp lệ
        }

        const productPayload = {
            name: data.name, description: data.description,
            price: data.price ? parseFloat(data.price) : null,
            stock: (data.stock !== undefined && data.stock !== null && data.stock !== '') ? parseInt(data.stock, 10) : 0,
            categoryId: categoryIdValue,
            barcode: data.barcode, brand: data.brand, model: data.model,
            movement: data.movement, caseMaterial: data.caseMaterial,
            strapMaterial: data.strapMaterial, dialColor: data.dialColor,
            waterResistance: data.waterResistance,
            imageUrls: finalImageUrls,
            primaryImageUrl: finalPrimaryImageUrl,
        };
        console.log("Submitting Product Payload to backend:", productPayload);
        try {
            if (isEditMode) {
                await updateProduct(productId, productPayload);
                toast.success('Cập nhật sản phẩm thành công!');
            } else {
                await createProduct(productPayload);
                toast.success('Thêm sản phẩm thành công!');
            }
            navigate('/admin/products');
        } catch (err) { /* ... error handling ... */
            console.error("Error saving product:", err);
            const errorMsg = err.response?.data?.message || 'Lưu sản phẩm thất bại.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally { setLoading(false); }
    };

    if (loadingData && isEditMode) { return <Container className="text-center py-5"><Spinner /></Container>; }

    return (
        <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Container fluid>
                <Row className="justify-content-center">
                    <Col lg={10} xl={8}> {/* Cho form rộng hơn */}
                        <Link to="/admin/products" className="btn btn-outline-secondary btn-sm mb-3"><ArrowLeft className="me-1" /> Quay lại</Link>
                        <Card className="shadow-sm">
                            <Card.Header>
                                <Card.Title as="h5">{isEditMode ? 'Cập nhật Sản phẩm' : 'Thêm sản phẩm mới'}</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    {/* --- Thông tin cơ bản --- */}
                                    <Row>
                                        <Form.Group as={Col} md={8} className="mb-3" controlId="productName">
                                            <Form.Label>Tên sản phẩm <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" isInvalid={!!errors.name} {...register("name", { required: "Product name is required" })} />
                                            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} md={4} className="mb-3" controlId="productCategory">
                                            <Form.Label>Danh mục<span className="text-danger">*</span></Form.Label>
                                            <Form.Select isInvalid={!!errors.categoryId} {...register("categoryId", { required: "Category is required" })}>
                                                <option value="">Chọn Danh mục...</option>
                                                {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>)}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.categoryId?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Form.Group className="mb-3" controlId="productDescription">
                                        <Form.Label>Mô tả</Form.Label>
                                        <Form.Control as="textarea" rows={4} {...register("description")} />
                                    </Form.Group>
                                    <Row>
                                        <Form.Group as={Col} md={6} className="mb-3" controlId="productPrice">
                                            <Form.Label>Giá (VND) <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="number" step="1000" min="0" isInvalid={!!errors.price} {...register("price",
                                                {
                                                    required: "Giá là bắt buộc",
                                                    valueAsNumber: true,
                                                    min: { value: 0.01, message: "Giá phải lớn hơn 0" }
                                                })} />
                                            <Form.Control.Feedback type="invalid">{errors.price?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} md={6} className="mb-3" controlId="productStock">
                                            <Form.Label>Số lượng <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="number" min="0" isInvalid={!!errors.stock} {...register("stock",
                                                {
                                                    required: "Số lượng là bắt buộc",
                                                    valueAsNumber: true,
                                                    min: { value: 0, message: "Số lượng không được âm" }
                                                })} />
                                            <Form.Control.Feedback type="invalid">{errors.stock?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>

                                    {/* --- Hình ảnh --- */}
                                    <Form.Group className="mb-3" controlId="productImagesUpload">
                                        <Form.Label>Hình ảnh sản phẩm</Form.Label>
                                        <Form.Control type="file" multiple onChange={handleImageChange} accept="image/png, image/jpeg, image/gif, image/webp" />
                                        <Form.Text className="text-muted">
                                            Thêm ảnh mới cho sản phẩm. Chọn một ảnh làm ảnh chính bằng cách nhấp vào ngôi sao.
                                        </Form.Text>
                                        <div className="mt-3 d-flex flex-wrap" style={{ gap: '10px' }}>
                                            {imagePreviews.map((img, index) => (
                                                <div key={img.url /*Sử dụng URL làm key vì nó sẽ là duy nhất (blob hoặc server URL)*/} className="position-relative border rounded p-1 text-center" style={{ width: '120px', height: '120px' }}>
                                                    <Image
                                                        src={img.url}
                                                        alt={`Preview ${index}`}
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                                                        }}
                                                    />
                                                    <Button variant="light" size="sm" className="position-absolute top-0 end-0 m-1 p-0 px-1 lh-1" onClick={() => handleRemoveImage(img.url)} title="Xóa ảnh này"> <Trash size={14} color="red" /> </Button>
                                                    <Button
                                                        variant={selectedPrimaryImage === img.url ? "warning" : "outline-secondary"}
                                                        size="sm"
                                                        className="position-absolute top-0 start-0 m-1 p-0 px-1 lh-1"
                                                        onClick={() => handleSetPrimary(img.url)}
                                                        title={selectedPrimaryImage === img.url ? "Ảnh chính" : "Đặt làm ảnh chính"}
                                                    >
                                                        <StarFill size={12} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </Form.Group>


                                    {/* --- Thông số kỹ thuật --- */}
                                    <h5 className="mt-4 mb-3 pt-3 border-top">Thông số kỹ thuật</h5>
                                    <Row>
                                        <Form.Group as={Col} md={6} className="mb-3"> <Form.Label>Thương hiệu</Form.Label> <Form.Control type="text" {...register("brand")} /> </Form.Group>
                                        <Form.Group as={Col} md={6} className="mb-3"> <Form.Label>	Mẫu mã</Form.Label> <Form.Control type="text" {...register("model")} /> </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Group as={Col} md={6} className="mb-3"> <Form.Label>Loại máy </Form.Label> <Form.Control type="text" {...register("movement")} /> </Form.Group>
                                        <Form.Group as={Col} md={6} className="mb-3"> <Form.Label>Chất liệu vỏ đồng hồ</Form.Label> <Form.Control type="text" {...register("caseMaterial")} /> </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Group as={Col} md={6} className="mb-3"> <Form.Label>	Chất liệu dây đeo</Form.Label> <Form.Control type="text" {...register("strapMaterial")} /> </Form.Group>
                                        <Form.Group as={Col} md={6} className="mb-3"> <Form.Label>Màu mặt số</Form.Label> <Form.Control type="text" {...register("dialColor")} /> </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Group as={Col} md={6} className="mb-3"> <Form.Label>Khả năng chống nước</Form.Label> <Form.Control type="text" {...register("waterResistance")} /> </Form.Group>
                                        <Form.Group as={Col} md={6} className="mb-3"> <Form.Label>Barcode</Form.Label> <Form.Control type="text" {...register("barcode")} /> </Form.Group>
                                    </Row>

                                    {/* Submit Buttons */}
                                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                                        <Button variant="secondary" type="button" onClick={() => navigate('/admin/products')} disabled={loading}>Hủy</Button>
                                        <Button variant="primary" type="submit" disabled={loading}>
                                            {loading ? <Spinner size="sm" /> : (isEditMode ? 'Cập nhật' : 'Thêm')}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </motion.div>
    );
}

export default AdminProductFormPage;
