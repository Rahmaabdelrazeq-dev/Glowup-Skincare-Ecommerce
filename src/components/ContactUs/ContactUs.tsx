import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill out all fields.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        "https://68f6879e6b852b1d6f170246.mockapi.io/contact",
        formData
      );
      toast.success("✅ Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("❌ Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        background: "linear-gradient(180deg, #f9f8f7 0%, #f2ece6 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          padding: "2.8rem 3rem",
          maxWidth: "560px",
          width: "100%",
          boxShadow: "0 8px 28px rgba(170, 150, 130, 0.22)",
          border: "1px solid #eee2d5",
        }}
      >
        <h2
          style={{
            color: "#7c6f63",
            textAlign: "center",
            marginBottom: "0.4rem",
            fontWeight: "700",
            letterSpacing: "0.04em",
          }}
        >
          Get in Touch{" "}
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#aa9c8d",
            marginBottom: "2rem",
            fontSize: "0.95rem",
          }}
        >
          We'd love to hear from you! Fill out the form below and we’ll reach
          out soon.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.3rem" }}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1.3rem" }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Message</label>
            <textarea
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              style={{ ...inputStyle, height: "130px", resize: "none" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#7c6f63",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "0.9rem 0",
              width: "100%",
              fontWeight: "600",
              letterSpacing: "0.02em",
              cursor: "pointer",
              fontSize: "1.05rem",
              transition: "background-color 0.25s ease",
            }}
            onMouseOver={(e) =>
              !loading && (e.currentTarget.style.backgroundColor = "#8e8377")
            }
            onMouseOut={(e) =>
              !loading && (e.currentTarget.style.backgroundColor = "#7c6f63")
            }
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "0.55rem",
  fontWeight: 600,
  color: "#7c6f63",
  fontSize: "1rem",
  letterSpacing: "0.02em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.85rem 1rem",
  borderRadius: "8px",
  border: "1.4px solid #d9cfc3",
  outline: "none",
  backgroundColor: "#fafaf8",
  fontSize: "0.98rem",
  color: "#3c2f2f",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

export default ContactUs;
