import React from "react";
import { Nav, Card } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../Redux/Authosclice";

export default function SideBar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    dispatch(logout());
    navigate("/login");
  };
  const menuItems = [
    { Label: "Dashboard", icon: "bi-speedometer2", path: "/dashboard" },
    { Label: "Products", icon: "bi-tags-fill", path: "/dashboard/products" },
    { Label: "Orders", icon: "bi-bag-fill", path: "/dashboard/orders" },
    { Label: "Users", icon: "bi-person-fill", path: "/dashboard/user" },
    { Label: "Messages", icon: "bi-chat-dots-fill", path: "/dashboard/contact" },
    { Label: "Reports", icon: "bi-file-earmark-bar-graph-fill", path: "/dashboard/reports" },
  ];

  return (
    <div className="sidebar d-flex flex-column">
      <h3 className="text-white text-center mb-2"
        style={{
          padding: "10px 0",
          fontFamily: "'Playfair Display', serif",
          fontWeight: "700",
          fontSize: "24px",
          letterSpacing: "1px",
        }}
      >
        GlowUp
      </h3>

      <Card className="text-center mb-4"
        style={{
          backgroundColor: "#BBA591",
          color: "#fff",
        }}
      >
        <Card.Body>
          <Card.Title className="fs-5">👤 Admin</Card.Title>
          <Card.Text style={{ fontSize: "0.9rem" }}>admin@admin.com</Card.Text>
        </Card.Body>
      </Card>

      <Nav className="flex-column gap-2 mb-1">
        {menuItems.map((item) => (
          <Nav.Link
            as={Link}
            to={item.path}
            key={item.path}
            className={`d-flex align-items-center fs-6 fw-normal rounded mb-1`}
            style={{
              color: "#fff",
              backgroundColor:
                location.pathname === item.path ? "#726255" : "transparent",
              transition: "all 0.2s",
            
            }}
          >
            <span
              style={{
                marginRight: "15px",
                fontSize: "20px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <i className={`bi ${item.icon}`}></i>
            </span>
            {item.Label}
          </Nav.Link>
        ))}
      </Nav>
      <Nav.Link
          onClick={handleLogout}
          className="d-flex align-items-center ms-3 fs-6 fw-normal rounded mt-2"
          style={{
            color: "#fff",
            transition: "all 0.2s",
          }}
        >
          <span
            style={{
              marginRight: "15px",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              paddingBottom:'15px'
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
          </span>
          Logout
        </Nav.Link>

      <style>
        {`
          @media (max-width: 768px) {
            .sidebar {
              position: relative !important;
              width: 100% !important;
              height: auto !important;
              min-height: auto !important;
                            background-color: #483B32;

            }
          }

          @media (min-width: 769px) {
            .sidebar {
              position: fixed;
              top: 0;
              left: 0;
              width: 260px;
              height: 100vh;
              background-color: #483B32;
              padding: 20px 15px;
            }
          }
        `}
      </style>
    </div>
  );
}
