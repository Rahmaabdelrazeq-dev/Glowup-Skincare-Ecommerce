import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Spinner, Badge } from "react-bootstrap";
import toast from "react-hot-toast";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  reply?: string;
  status?: string;
}

const API_URL = "https://68f6879e6b852b1d6f170246.mockapi.io/contact";

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);

  async function fetchMessages() {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      setMessages(data);
    } catch (err) {
      toast.error("❌ Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);


  async function handleSave() {
    if (!selectedMsg) return;

    try {
      await axios.put(`${API_URL}/${selectedMsg.id}`, {
        reply,
        status,
      });
      toast.success("✅ Message updated successfully");
      setShowModal(false);
      fetchMessages();
    } catch {
      toast.error("❌ Failed to update message");
    }
  }


  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "In Progress":
        return "info";
      case "Resolved":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4 fw-bold text-dark">Messages Management</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="dark" />
        </div>
      ) : messages.length === 0 ? (
        <p className="text-center text-muted">No messages found.</p>
      ) : (
        <Table bordered hover responsive>
          <thead className="table-dark text-center">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Status</th>
              <th>Reply</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="text-center align-middle">
            {messages.map((msg, index) => (
              <tr key={msg.id}>
                <td>{index + 1}</td>
                <td>{msg.name}</td>
                <td>{msg.email}</td>
                <td style={{ maxWidth: "250px", whiteSpace: "pre-wrap" }}>
                  {msg.message}
                </td>
                <td>
                  <Badge bg={getStatusColor(msg.status)}>{msg.status || "Pending"}</Badge>
                </td>
                <td style={{ maxWidth: "250px", whiteSpace: "pre-wrap" }}>
                  {msg.reply ? msg.reply : <span className="text-muted">No reply yet</span>}
                </td>
                <td>
                  <Button
                    variant="dark"
                    size="sm"
                    onClick={() => {
                      setSelectedMsg(msg);
                      setReply(msg.reply || "");
                      setStatus(msg.status || "Pending");
                      setShowModal(true);
                    }}
                  >
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}


      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Manage Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reply</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write your reply..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminMessages;
