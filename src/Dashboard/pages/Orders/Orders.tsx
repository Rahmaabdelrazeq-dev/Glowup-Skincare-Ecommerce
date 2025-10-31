import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Modal,
  Spinner,
  Table,
  Form,
  Row,
  Col,
  Pagination,
  Card,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../Redux/Store";
import {
  deleteOrderAsync,
  fetchOrdersAsync,
  Order,
  updateOrderAsync,
} from "../../../Redux/OrderSlice";
import "./orders.css";
import Swal from "sweetalert2";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
export default function Orders() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.orders
  );
  useEffect(() => {
    dispatch(fetchOrdersAsync());
  }, [dispatch]);

  const [statusFilter, setStatusFilter] = useState("All");
  const [userSearch, setUserSearch] = useState("");
  const [orderIdSearch, setOrderIdSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showActionsModal, setShowActionsModal] = useState(false);
  
  const itemsPerPage = 5;
  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowModal(true);
  };

  const handleDeleteOrder = (order: Order) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete order #${order.id}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteOrderAsync(order.id))
          .unwrap()
          .then(() => {
            Swal.fire(
              "Deleted!",
              `Order #${order.id} has been deleted.`,
              "success"
            );
          })
          .catch((err) => {
            Swal.fire("Error!", `${err}`, "error");
          });
      }
    });
  };

  const handleSave = async () => {
    if (selectedOrder && selectedOrder.status !== newStatus) {
      const updatedOrder = { ...selectedOrder, status: newStatus };
      try {
        await dispatch(updateOrderAsync(updatedOrder)).unwrap();
        setShowModal(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        alert(err);
      }
    } else {
      setShowModal(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "completed":
        return "success";
      case "canceled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const statusMatch =
      statusFilter.toLowerCase() === "all" ||
      order.status.toLowerCase() === statusFilter.toLowerCase();
    const userMatch = order.userName
      .toLowerCase()
      .includes(userSearch.toLowerCase());
    const orderMatch = order.id.includes(orderIdSearch);

    return statusMatch && userMatch && orderMatch;
  });
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage]);
  if (loading) return <div className="text-center py-5">
              <Spinner animation="border" style={{ color: "#d7c8b2" }} />
            </div>;
  if (error) return <p className="text-danger m-4">{error}</p>;

  return (
        <Card className=" shadow-sm mt-0" style={{ backgroundColor: "#ffffff", borderRadius: "12px"}}>
    <div className=" py-4">
      <h2 className="text-center mb-4 dashboard-title" style={{  color: '#a39173'}}>
        Orders Management
      </h2>

      <Row className="filter-row justify-content-center mb-4">
        <Col md={3} sm={12} className="mb-2">
          <Form.Select
            name="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Canceled">Canceled</option>
            <option value="Completed">Completed</option>
          </Form.Select>
        </Col>

        <Col md={3} sm={12} className="mb-2">
          <Form.Control
            type="text"
            placeholder="🔍 Search by user"
            className="filter-input"
            onChange={(e) => setUserSearch(e.target.value)}
          />
        </Col>

        <Col md={3} sm={12}>
          <Form.Control
            type="text"
            placeholder="🔍 Search by Order ID"
            className="filter-input"
            onChange={(e) => setOrderIdSearch(e.target.value)}
          />
        </Col>
      </Row>

      {/* Table */}
      <div className="table-container px-2">
        <Table
          responsive
          bordered
          hover
          className="orders-table text-center align-middle"
        >
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total ($)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

                <tbody style={{ verticalAlign: "middle", textAlign: "center" }}>
            {paginatedOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td className="fw-semibold">{order.userName}</td>
                <td>{new Date(order.date).toLocaleString()}</td>
                <td>
                  {order.items.map((item) => (
                    <div key={item.id}>
                      {item.name.split(" ").slice(0, 2).join(" ")} ×{" "}
                      {item.quantity}
                    </div>
                  ))}
                </td>
                <td className="fw-semibold">${order.total.toFixed(2)}</td>
                <td>
                  <Badge
                    bg={getStatusVariant(order.status)}
                    className="status-badge"
                  >
                    {order.status.toUpperCase()}
                  </Badge>
                </td>
                 <td>
                    <Button
  variant="light"
  size="sm"
  onClick={() => {
    setSelectedOrder(order); 
    setShowActionsModal(true);
  }}
>
  <i className="bi bi-three-dots-vertical fs-5"></i>
</Button>


                                      </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>User Name</Form.Label>
          <Form.Control
            type="text"
            value={selectedOrder?.userName}
            readOnly
            className="mb-3"
          />
          <Form.Label>Total</Form.Label>
          <Form.Control
            type="text"
            value={selectedOrder?.total}
            readOnly
            className="mb-3"
          />
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Actions Modal */}
<Modal show={showActionsModal} onHide={() => setShowActionsModal(false)} centered>
  <Modal.Header closeButton className="border-0">
    <Modal.Title className="fw-bold text-center w-100" style={{
    }}>
       Order Actions
    </Modal.Title>
  </Modal.Header>
  <Modal.Body className="text-center py-2">
    <p className="text-muted mb-4" style={{
      color:'#a6977f'
    }}>Choose what you’d like to do with this order</p>
    
    <div className="d-flex flex-column justify-content-center align-items-center gap-3 pb-3">
      <Button
        className="action-btn w-75 py-2"
        variant="primary"
        onClick={() => {
          setShowActionsModal(false);
          handleEditClick(selectedOrder!);
        }}
      >
         Edit Order
      </Button>

      <Button
        className="action-btn w-75 py-2"
        variant="danger"
        onClick={() => {
          setShowActionsModal(false);
          handleDeleteOrder(selectedOrder!);
        }}
      >
       Delete Order
      </Button>
    </div>
  </Modal.Body>
</Modal>

      

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          />

          <AnimatePresence mode="wait">
            {[...Array(totalPages)].map((_, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                style={{ listStyle: "none", display: "inline-block" }}
              >
                <Pagination.Item
                  active={currentPage === index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              </motion.li>
            ))}
          </AnimatePresence>

          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          />
        </Pagination>
      </div>
    </div>
    </Card>
  );
}
