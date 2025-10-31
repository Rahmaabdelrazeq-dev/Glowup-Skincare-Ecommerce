import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  Form,
  Table,
  Spinner,
  Pagination,
  Card,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import * as Yup from "yup";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface OrderItem {
  name: string;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  total: number;
  items: OrderItem[];
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [minPaid, setMinPaid] = useState("");

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const [showActionsModal, setShowActionsModal] = useState(false);
  const [selectedUserForActions, setSelectedUserForActions] =
    useState<User | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const USERS_API = "https://68e8fa40f2707e6128cd055c.mockapi.io/user";
  const ORDERS_API =
    "https://68f278b4b36f9750deecbed2.mockapi.io/data/api/orders";

  useEffect(() => {
    fetchUsers();
    fetchOrders();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const { data } = await axios.get(USERS_API);
      setUsers(data);
    } catch (err) {
      toast.error("Failed to fetch users!");
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrders() {
    try {
      const { data } = await axios.get(ORDERS_API);
      setOrders(data);
    } catch (err) {
      toast.error("Failed to fetch orders!");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();

    try {
      await validationSchema.validate(formValues, { abortEarly: false });
      const existingUser = users.find(
        (user) => user.email.toLowerCase() === formValues.email.toLowerCase()
      );

      if (existingUser) {
        toast.error("Email already exists!");
        return;
      }
      await axios.post(USERS_API, formValues);
      toast.success("User added successfully!");

      setShowAddModal(false);
      setFormValues({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (err: any) {
      if (err instanceof Yup.ValidationError) {
        const messages = err.errors.join("\n");
        toast.error(messages);
      } else {
        toast.error("Error adding user!");
      }
    }
  }

  function handleEdit(user: User) {
    setSelectedUser(user);
    setFormValues({
      name: user.name,
      email: user.email,
      password: user.password,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!selectedUser) return;
    try {
      const { data } = await axios.put(
        `${USERS_API}/${selectedUser.id}`,
        formValues
      );
      setUsers(users.map((u) => (u.id === data.id ? data : u)));
      toast.success("User updated successfully!");
      setShowModal(false);
    } catch {
      toast.error("Error updating user!");
    }
  }

  async function handleDelete() {
    if (!userToDelete) return;
    try {
      await axios.delete(`${USERS_API}/${userToDelete.id}`);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      toast.success("User deleted successfully!");
    } catch {
      toast.error("Error deleting user!");
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  }

  function handleViewOrders(user: User) {
    const userOrders = orders.filter((o) => o.userId === user.id);
    setSelectedOrders(userOrders);
    setShowOrdersModal(true);
  }

  function getTotalPaid(userId: string) {
    const userOrders = orders.filter((o) => o.userId === userId);
    return userOrders.reduce((sum, order) => sum + order.total, 0);
  }

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const totalPages = Math.ceil(users.length / usersPerPage);

  const filteredUsers = users.filter((user) => {
    const totalPaid = getTotalPaid(user.id);
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMin = !minPaid || totalPaid >= parseFloat(minPaid || "0");
    return matchesSearch && matchesMin;
  });

  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <Card className="shadow-sm container mt-3" style={{ borderRadius: "12px" }}>
      <Container className="py-4">
        <h2 className="text-center mb-4" style={{ color: "#a39173" }}>
          Users Management
        </h2>

        {/* Search & Filter */}
        <Row className="mb-3 align-items-center">
          <Col xs={12} md={6} className="mb-2">
            <Form.Control
              type="text"
              placeholder="🔍 Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={6} md={3} className="mb-2">
            <Form.Control
              type="number"
              placeholder="Min total paid"
              value={minPaid}
              onChange={(e) => setMinPaid(e.target.value)}
            />
          </Col>
          <Col xs={6} md={3}>
            <Button
              variant="success"
              className="w-100"
              onClick={() => setShowAddModal(true)}
            >
              + Add User
            </Button>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <div className="overflow-auto">
            <Table
              bordered
              hover
              responsive
              className="text-center align-middle table-sm"
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Total Paid</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>{indexOfFirstUser + index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.password}</td>
                      <td>{getTotalPaid(user.id).toFixed(2)} EGP</td>
                      <td>
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => {
                            setSelectedUserForActions(user);
                            setShowActionsModal(true);
                          }}
                        >
                          <i className="bi bi-three-dots-vertical fs-5"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-2">
            <Pagination>
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              />
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              />
            </Pagination>
          </div>
        )}

        {/* Edit User Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          fullscreen="sm-down"
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="text"
                  name="password"
                  value={formValues.password}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add User Modal */}
        <Modal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          fullscreen="sm-down"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddUser}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="text"
                  name="password"
                  value={formValues.password}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Add User
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Actions Modal */}
        <Modal
          show={showActionsModal}
          onHide={() => setShowActionsModal(false)}
          fullscreen="sm-down"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Actions</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-column gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  if (selectedUserForActions)
                    handleEdit(selectedUserForActions);
                  setShowActionsModal(false);
                }}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setUserToDelete(selectedUserForActions);
                  setShowDeleteModal(true);
                  setShowActionsModal(false);
                }}
              >
                Delete
              </Button>
              <Button
                variant="info"
                onClick={() => {
                  if (selectedUserForActions)
                    handleViewOrders(selectedUserForActions);
                  setShowActionsModal(false);
                }}
              >
                View Orders
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        {/* Delete Modal */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          fullscreen="sm-down"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Delete User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete{" "}
            <strong>{userToDelete?.name}</strong>?
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Orders Modal */}
        <Modal
          show={showOrdersModal}
          onHide={() => setShowOrdersModal(false)}
          size="lg"
          fullscreen="sm-down"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Orders</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrders.length > 0 ? (
              selectedOrders.map((order) => (
                <Card key={order.id} className="mb-2">
                  <Card.Body>
                    <Card.Title>Order #{order.id}</Card.Title>
                    <Card.Text>Total: {order.total.toFixed(2)} EGP</Card.Text>
                    <Card.Text>
                      Items: {order.items.map((i) => i.name).join(", ")}
                    </Card.Text>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No orders found for this user.</p>
            )}
          </Modal.Body>
        </Modal>
      </Container>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          success: {
            style: {
              background: "#4caf50",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#4caf50",
            },
          },
          error: {
            style: {
              background: "#f44336",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#f44336",
            },
          },
        }}
      />
    </Card>
  );
};

export default Users;
