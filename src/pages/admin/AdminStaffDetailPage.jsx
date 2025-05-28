// // src/pages/admin/AdminStaffDetailPage.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { getUserDetailsAdmin, updateUserRoleAdmin, deleteUserAdmin } from '../../services/userService';
// import { Container, Row, Col, Card, Button, Spinner, Alert, Tabs, Tab, Table, Badge, Form, Pagination as BsPagination } from 'react-bootstrap';
// import { ArrowLeft, PersonFill, EnvelopeFill, TelephoneFill, GeoAltFill, CalendarEvent, PersonVcard, ShieldLockFill, PencilSquare, Trash } from 'react-bootstrap-icons';
// import LoadingSpinner from '../../components/common/LoadingSpinner';
// import { toast } from 'react-toastify';
// import { motion } from 'framer-motion';
// import { useAuthStore } from '../../store/authStore';

// // Animation variants
// const pageVariants = { /* ... */ };
// const pageTransition = { /* ... */ };

// // Role Enum
// const Role = { ADMIN: 'ADMIN', STAFF: 'STAFF', BUYER: 'BUYER' };

// // Helpers
// const formatDate = (dateString) => {/* ... */};
// const getRoleVariant = (role) => {/* ... */};

// function AdminStaffDetailPage() {
//     const { staffId } = useParams(); // Lấy userId từ URL
//     const navigate = useNavigate();
//     const { user: adminUser } = useAuthStore();
//     const [staff, setStaff] = useState(null); // UserDTO của nhân viên
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // State cho sửa Role
//     const [isEditingRole, setIsEditingRole] = useState(false);
//     const [selectedRole, setSelectedRole] = useState('');
//     const [updatingRole, setUpdatingRole] = useState(false);

//     // Fetch staff details
//     const fetchStaffDetails = useCallback(async () => {
//         if (!staffId) { setError("Invalid Staff ID."); setLoading(false); return; }
//         setLoading(true); setError(null);
//         try {
//             const response = await getUserDetailsAdmin(staffId);
//             // Kiểm tra xem user lấy về có phải STAFF hoặc ADMIN không (phòng trường hợp URL bị sửa)
//             if (response.data && (response.data.role === Role.STAFF || response.data.role === Role.ADMIN)) {
//                  setStaff(response.data);
//                  setSelectedRole(response.data.role);
//             } else {
//                  throw new Error("User found is not Staff or Admin.");
//             }
//         } catch (err) {
//             console.error("Error fetching staff details:", err);
//             setError(err.response?.data?.message || 'Failed to load staff data.');
//             if (err.response?.status === 404) { setTimeout(() => navigate('/admin/staff', { replace: true }), 3000); }
//         } finally { setLoading(false); }
//     }, [staffId, navigate]);

//     useEffect(() => { fetchStaffDetails(); }, [fetchStaffDetails]);

//     // Xử lý thay đổi Role (chỉ Admin)
//     const handleRoleChange = async () => {
//          if (!staff || !selectedRole || selectedRole === staff.role) { setIsEditingRole(false); return; }
//          // Ngăn Admin tự hạ quyền của chính mình (nếu cần)
//          if (adminUser?.userId === staff.userId && selectedRole !== Role.ADMIN) {
//               toast.error("Admin cannot change their own role.");
//               setSelectedRole(staff.role); // Reset lại
//               setIsEditingRole(false);
//               return;
//          }
//          setUpdatingRole(true);
//          try {
//               await updateUserRoleAdmin(staff.userId, selectedRole);
//               toast.success(`Role for ${staff.username} updated to ${selectedRole}`);
//               setStaff(prev => ({ ...prev, role: selectedRole }));
//               setIsEditingRole(false);
//          } catch (err) { /* ... error handling ... */ }
//          finally { setUpdatingRole(false); }
//     };

//     // Xử lý xóa Staff (chỉ Admin)
//     const handleDeleteStaff = async () => {
//         if (!staff) return;
//          // Ngăn Admin tự xóa chính mình
//          if (adminUser?.userId === staff.userId) {
//               toast.error("Admin cannot delete their own account.");
//               return;
//          }
//         if (window.confirm(`DELETE staff member "${staff.username}"? This is permanent!`)) {
//             try {
//                 await deleteUserAdmin(staff.userId);
//                 toast.success(`Staff member "${staff.username}" deleted.`);
//                 navigate('/admin/staff', { replace: true });
//             } catch (err) { /* ... error handling ... */ }
//         }
//     };

//     // --- Render UI ---
//     if (loading) return <LoadingSpinner />;
//     if (error && !staff) return ( <Container><Alert variant="danger">{error}</Alert><Link to="/admin/staff">Back</Link></Container> );
//     if (!staff) return ( <Container><Alert variant="warning">Staff member not found.</Alert><Link to="/admin/staff">Back</Link></Container> );

//     const isAdmin = adminUser?.role === 'ADMIN';

//     return (
//         <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
//             <Container fluid>
//                 {/* Header trang */}
//                 <Row className="align-items-center mb-3">
//                     <Col xs="auto"> <Link to="/admin/staff" className="btn btn-outline-secondary btn-sm"><ArrowLeft /> Back</Link> </Col>
//                     <Col> <h1 className="h4 mb-0 text-gray-800">Staff Details - {staff.firstName} {staff.lastName} (ID: {staff.userId})</h1> </Col>
//                     {/* Chỉ Admin có thể xóa */}
//                     {isAdmin && staff.userId !== adminUser?.userId && ( // Thêm kiểm tra không xóa chính mình
//                          <Col xs="auto"> <Button variant="outline-danger" size="sm" onClick={handleDeleteStaff}><Trash className="me-1"/> Delete Staff</Button> </Col>
//                     )}
//                 </Row>

//                 <Row>
//                     {/* Cột thông tin */}
//                     <Col lg={5} xl={4} className="mb-4 mb-lg-0">
//                         <Card className="shadow-sm h-100">
//                             <Card.Header> <h6 className="m-0 fw-bold text-primary"> <PersonVcard className="me-1"/> Staff Information</h6> </Card.Header>
//                             <Card.Body className="small">
//                                 <p><strong>Username:</strong> {staff.username}</p>
//                                 <p><strong>Email:</strong> <a href={`mailto:${staff.email}`}>{staff.email}</a></p>
//                                 <p><strong>Phone:</strong> {staff.phone || 'N/A'}</p>
//                                 <p><strong>Address:</strong> {staff.address || 'N/A'}</p>
//                                 <p><strong>Joined:</strong> {formatDate(staff.createdAt)}</p>
//                                 {/* Role (Admin có thể sửa) */}
//                                 <div className="d-flex align-items-center mt-2">
//                                      <strong className="me-2">Role:</strong>
//                                      {isEditingRole && isAdmin ? (
//                                          <Form.Select size="sm" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={{width: '150px'}} disabled={updatingRole}>
//                                              {/* Chỉ cho phép đổi giữa STAFF và BUYER (Admin không đổi thành Admin khác) */}
//                                              <option value={Role.STAFF}>{Role.STAFF}</option>
//                                              <option value={Role.BUYER}>{Role.BUYER}</option>
//                                              {/* Nếu đang xem Admin thì vẫn hiển thị Admin */}
//                                              {staff.role === Role.ADMIN && <option value={Role.ADMIN} disabled>{Role.ADMIN}</option>}
//                                          </Form.Select>
//                                      ) : ( <Badge bg={getRoleVariant(staff.role)}>{staff.role}</Badge> )}
//                                      {/* Nút Edit/Save/Cancel Role (chỉ Admin và không phải chính mình) */}
//                                      {isAdmin && staff.userId !== adminUser?.userId && (
//                                          <>
//                                              {!isEditingRole ? (
//                                                  <Button variant="link" size="sm" className="p-0 ms-2" onClick={() => setIsEditingRole(true)}><PencilSquare/></Button>
//                                              ) : (
//                                                  <>
//                                                      <Button variant="success" size="sm" className="ms-2 px-2 py-0" onClick={handleRoleChange} disabled={updatingRole || selectedRole === staff.role}> {updatingRole ? <Spinner size="sm"/> : 'Save'} </Button>
//                                                       <Button variant="light" size="sm" className="ms-1 px-2 py-0" onClick={() => {setIsEditingRole(false); setSelectedRole(staff.role);}} disabled={updatingRole}> Cancel </Button>
//                                                  </>
//                                              )}
//                                          </>
//                                      )}
//                                 </div>
//                             </Card.Body>
//                         </Card>
//                     </Col>

//                     {/* Cột hoạt động (Placeholder) */}
//                     <Col lg={7} xl={8}>
//                         <Card className="shadow-sm">
//                              <Card.Header> <h6 className="m-0 fw-bold text-primary"> <ShieldLockFill className="me-1"/> Activity & Permissions</h6> </Card.Header>
//                              <Card.Body> <p className="text-muted">(Placeholder for staff activity logs, assigned tasks, specific permissions, etc.)</p> </Card.Body>
//                         </Card>
//                     </Col>
//                 </Row>
//             </Container>
//         </motion.div>
//     );
// }

// export default AdminStaffDetailPage;
