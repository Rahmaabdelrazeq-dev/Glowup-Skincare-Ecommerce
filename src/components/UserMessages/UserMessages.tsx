import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Badge } from "react-bootstrap";
import toast from "react-hot-toast";

const API_URL = "https://68f6879e6b852b1d6f170246.mockapi.io/contact";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  reply?: string;
  status?: string;
}

interface Props {
  userEmail: string;
}

const UserMessages: React.FC<Props> = ({ userEmail }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;

    async function fetchMessages() {
      try {
        const { data } = await axios.get(API_URL);

      
        const userMsgs = data.filter((msg: Message) => msg.email === userEmail);
        setMessages(userMsgs);
      } catch {
        toast.error("❌ Failed to load messages");
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [userEmail]);

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
      <h2 className="text-center mb-4 text-dark">My Messages</h2>

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
              <th>Message</th>
              <th>Status</th>
              <th>Reply</th>
            </tr>
          </thead>
          <tbody className="text-center align-middle">
            {messages.map((msg, index) => (
              <tr key={msg.id}>
                <td>{index + 1}</td>
                <td style={{ maxWidth: "300px", whiteSpace: "pre-wrap" }}>
                  {msg.message}
                </td>
                <td>
                  <Badge bg={getStatusColor(msg.status)}>
                    {msg.status || "Pending"}
                  </Badge>
                </td>
                <td style={{ maxWidth: "300px", whiteSpace: "pre-wrap" }}>
                  {msg.reply ? msg.reply : <span className="text-muted">No reply yet</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default UserMessages;

