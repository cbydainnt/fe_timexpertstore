// // src/pages/admin/AdminStaffListPage.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { Link, useSearchParams } from 'react-router-dom';
// // Import services
// import { getAllStaffAdmin, deleteUserAdmin } from '../../services/userService';
// // Import Bootstrap
// import { Container, Table, Button, Spinner, Alert, Card, InputGroup, FormControl, Form, Row, Col, Pagination as BsPagination, Badge } from 'react-bootstrap';
// // Import icons
// import { PersonPlus, Search, Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
// import LoadingSpinner from '../../components/common/LoadingSpinner';
// import { toast } from 'react-toastify';
// import { motion } from 'framer-motion';
// import { useAuthStore } from '../../store/authStore'; // Import để kiểm tra quyền Admin

// // Animation variants
// const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
// const pageTransition = { duration: 0.3 };

// // Helper format date
// const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try { return new Date(dateString).toLocaleDateString('vi-VN'); }
//     catch { return dateString; }
// };
// // Helper get role variant
// const getRoleVariant = (role) => {
//     if (role === 'ADMIN') return 'danger';
//     if (role === 'STAFF') return 'warning';
//     return 'secondary';
// };

// function AdminStaffListPage() {
//     const [staffList, setStaffList] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [searchParams, setSearchParams] = useSearchParams();
//     const { user: adminUser } = useAuthStore(); // Lấy thông tin admin/staff đang đăng nhập

//     // Pagination state
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(0);
//     const itemsPerPage = 15;

//     // Search state
//     const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

//     // Fetch staff list
//     const fetchStaff = useCallback(async () => {
//         setLoading(true); setError(null);
//         try {
//             const page = parseInt(searchParams.get('page') || '0');
//             const currentSearch = searchParams.get('search') || undefined;
//             setCurrentPage(page + 1);

//             const params = {
//                 page: page, size: itemsPerPage,
//                 sortBy: searchParams.get('sortBy') || 'userId',
//                 sortDir: searchParams.get('sortDir') || 'asc',
//                 ...(currentSearch && { search: currentSearch }), // Backend cần hỗ trợ search
//                 // role: 'STAFF' // Hàm service getAllStaffAdmin đã tự thêm
//             };
//             const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== ''));

//             // *** Backend cần API GET /api/admin/users?role=STAFF ***
//             const response = await getAllStaffAdmin(filteredParams);
//             setStaffList(response.data?.content || []);
//             setTotalPages(response.data?.totalPages || 0);

//         } catch (err) {
//             console.error("Error fetching staff list:", err);
//             setError(err.response?.data?.message || 'Failed to load staff list.');
//             setStaffList([]); setTotalPages(0);
//         } finally { setLoading(false); }
//     }, [searchParams]);

//     useEffect(() => { fetchStaff(); }, [fetchStaff]);

//     // Xử lý tìm kiếm
//     const handleSearch = (e) => {
//          e.preventDefault();
//          const newParams = new URLSearchParams(searchParams);
//          if (searchTerm) newParams.set('search', searchTerm); else newParams.delete('search');
//          newParams.set('page', '0');
//          setSearchParams(newParams);
//     };

//      // Xử lý khi nhấn nút Reset
//      const handleReset = () => {
//          setSearchTerm('');
//          setSearchParams({});
//      };

//     // Xử lý phân trang
//     const handlePageChange = (newPage) => {
//         if (newPage >= 1 && newPage <= totalPages) {
//             const newParams = new URLSearchParams(searchParams);
//             newParams.set('page', String(newPage - 1));
//             setSearchParams(newParams);
//         }
//     };

//     // Xử lý xóa Staff (chỉ Admin)
//      const handleDeleteStaff = async (userId, username) => {
//          if (window.confirm(`DELETE staff member "${username}" (ID: ${userId})? This is permanent!`)) {
//              try {
//                  await deleteUserAdmin(userId);
//                  toast.success(`Staff member "${username}" deleted successfully!`);
//                  fetchStaff(); // Tải lại danh sách
//              } catch (err) {
//                  console.error("Error deleting staff:", err);
//                  toast.error(err.response?.data?.message || 'Failed to delete staff member.');
//              }
//          }
//      };

//     // --- Pagination Logic ---
//     let paginationItems = [];
//     if (totalPages > 1) {
//         let startPage = Math.max(1, currentPage - 2);
//         let endPage = Math.min(totalPages, currentPage + 2);
//         if (currentPage - 2 <= 0) { endPage = Math.min(totalPages, endPage + (2 - currentPage + 1)); }
//         if (currentPage + 2 >= totalPages) { startPage = Math.max(1, startPage - (currentPage + 2 - totalPages)); }
//         endPage = Math.min(totalPages, startPage + 4);
//         startPage = Math.max(1, endPage - 4);

//         paginationItems.push(<BsPagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />);
//         paginationItems.push(<BsPagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />);
//         if (startPage > 1) paginationItems.push(<BsPagination.Ellipsis key="start-ellipsis" onClick={() => handlePageChange(startPage - 1)} />);
//         for (let number = startPage; number <= endPage; number++) {
//             paginationItems.push( <BsPagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>{number}</BsPagination.Item> );
//         }
//         if (endPage < totalPages) paginationItems.push(<BsPagination.Ellipsis key="end-ellipsis" onClick={() => handlePageChange(endPage + 1)} />);
//         paginationItems.push(<BsPagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />);
//         paginationItems.push(<BsPagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />);
//     }
//     // --- End Pagination Logic ---

//     const isAdmin = adminUser?.role === 'ADMIN'; // Kiểm tra quyền Admin

//     return (
//         <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
//             <Container fluid>
//                 {/* Header */}
//                 <Row className="align-items-center mb-4">
//                     <Col xs={12} md> <h1 className="h3 mb-0 text-gray-800">Manage Staff</h1> </Col>
//                     {/* Chỉ Admin thấy nút Add Staff */}
//                     {isAdmin && (
//                          <Col xs={12} md="auto" className="mt-2 mt-md-0">
//                              <Link to="/admin/staff/new"> {/* Cần tạo route và component form */}
//                                  <Button variant="primary" size="sm"><PersonPlus className="me-1"/> Add New Staff</Button>
//                              </Link>
//                          </Col>
//                     )}
//                 </Row>

//                 {/* Search Bar */}
//                 <Card className="shadow-sm mb-4">
//                     <Card.Body className="p-2">
//                          <Form onSubmit={handleSearch}>
//                              <Row className="g-2 align-items-end">
//                                  <Col>
//                                      <InputGroup size="sm">
//                                           <InputGroup.Text><Search /></InputGroup.Text>
//                                           <FormControl placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//                                      </InputGroup>
//                                  </Col>
//                                   <Col xs="auto"> <Button type="submit" variant="primary" size="sm">Search</Button> </Col>
//                                    <Col xs="auto"> <Button variant="outline-secondary" size="sm" onClick={handleReset}>Reset</Button> </Col>
//                              </Row>
//                          </Form>
//                     </Card.Body>
//                 </Card>

//                 {loading && <LoadingSpinner />}
//                 {error && !loading && <Alert variant="danger">{error}</Alert>}

//                 {/* Bảng Nhân viên */}
//                 {!loading && !error && (
//                     <Card className="shadow-sm">
//                         <Card.Body className="p-0">
//                             <Table striped bordered hover responsive="md" size="sm" className="mb-0 admin-table">
//                                 <thead className="table-light">
//                                     <tr>
//                                         <th>ID</th>
//                                         <th>Name</th>
//                                         <th>Email</th>
//                                         <th>Phone</th>
//                                         <th>Role</th>
//                                         <th>Joined</th>
//                                         <th className="text-center">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {staffList.length > 0 ? (
//                                         staffList.map((staff) => (
//                                             <tr key={staff.userId}>
//                                                 <td>{staff.userId}</td>
//                                                 <td>{`${staff.firstName || ''} ${staff.lastName || ''}`.trim()}</td>
//                                                 <td>{staff.email}</td>
//                                                 <td>{staff.phone || '-'}</td>
//                                                 <td><Badge bg={getRoleVariant(staff.role)}>{staff.role}</Badge></td>
//                                                 <td>{formatDate(staff.createdAt)}</td>
//                                                 <td className="text-center">
//                                                     {/* Link xem chi tiết */}
//                                                     <Link to={`/admin/staff/${staff.userId}`} className="btn btn-sm btn-outline-info me-1 px-2 py-1" title="View Details"><Eye /></Link>
//                                                     {/* Chỉ Admin có quyền sửa/xóa */}
//                                                     {isAdmin && (
//                                                         <>
//                                                             {/* Nút sửa (ví dụ: chuyển đến form edit staff) */}
//                                                              <Link to={`/admin/staff/edit/${staff.userId}`} className="btn btn-sm btn-outline-warning me-1 px-2 py-1" title="Edit Staff"> <PencilSquare /> </Link>
//                                                             {/* Nút xóa */}
//                                                              <Button variant="outline-danger" size="sm" className="px-2 py-1" onClick={() => handleDeleteStaff(staff.userId, staff.username)} title="Delete Staff"><Trash /></Button>
//                                                         </>
//                                                     )}
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr><td colSpan="7" className="text-center text-muted py-4">No staff members found.</td></tr>
//                                     )}
//                                 </tbody>
//                             </Table>
//                         </Card.Body>
//                     </Card>
//                 )}

//                 {/* Phân trang */}
//                 {totalPages > 1 && !loading && ( <div className="d-flex justify-content-center mt-4"> <BsPagination>{paginationItems}</BsPagination> </div> )}
//             </Container>
//         </motion.div>
//     );
// }
// export default AdminStaffListPage;
