import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const Footer: React.FC = () => {
  return (
    <footer className="bg-theme-dark text-theme-light pt-5 pb-4">
      <div className="container">
        <div className="row">
          {/* ===== Left Section ===== */}
          <div className="col-12 col-md-3 mb-4">
            <h4
              className="mb-3 fw-extrabold"
              style={{
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                letterSpacing: "0.1em",
                color: "var(--theme-primary)",
              }}
            >
              GLOWUP.
            </h4>
            <p
              className="mb-2 fw-semibold"
              style={{ color: "var(--theme-muted)" }}
            >
              FOLLOW US
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-theme-light opacity-75 hover-opacity-100">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-theme-light opacity-75 hover-opacity-100">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-theme-light opacity-75 hover-opacity-100">
                <i className="fab fa-facebook-f"></i>
              </a>
            </div>
          </div>

          {/* ===== Desktop Sections ===== */}
          <div className="col-md-9 d-none d-md-flex justify-content-between">
            {[
              {
                title: "Products",
                items: ["Inner Care", "Skin Care", "Scalp Care"],
              },
              {
                title: "Guides",
                items: ["News", "Vision", "Q&A"],
              },
              {
                title: "Service",
                items: ["About Concierge", "Online Consultation", "Market"],
              },
              {
                title: "Contact",
                items: ["Contact Us"],
              },
            ].map((section, idx) => (
              <div key={idx}>
                <h6
                  className="mb-3 fw-semibold"
                  style={{ color: "var(--theme-primary)" }}
                >
                  {section.title}
                </h6>
                <ul className="list-unstyled">
                  {section.items.map((item, i) => (
                    <li
                      key={i}
                      className="mb-2"
                      style={{
                        color: "var(--theme-muted)",
                        cursor: "pointer",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--theme-primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--theme-muted)")
                      }
                    >
                      {item === "Contact Us" ? (
                        <Link
                          to="/contactus"
                          className="text-decoration-none"
                          style={{ color: "inherit" }}
                        >
                          {item}
                        </Link>
                      ) : (
                        item
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ===== Mobile Accordion ===== */}
          <div className="d-md-none col-12">
            <div className="accordion" id="footerAccordion">
              {[
                {
                  id: "one",
                  title: "Products",
                  items: ["Inner Care", "Skin Care", "Scalp Care"],
                },
                {
                  id: "two",
                  title: "Guides",
                  items: ["News", "Vision", "Q&A"],
                },
                {
                  id: "three",
                  title: "Service",
                  items: ["About Concierge", "Online Consultation", "Market"],
                },
                {
                  id: "four",
                  title: "Contact",
                  items: ["Contact Us"],
                },
              ].map((section, index) => (
                <div
                  className="accordion-item bg-theme-dark border-0 text-theme-light"
                  key={index}
                >
                  <h2 className="accordion-header" id={`heading${section.id}`}>
                    <button
                      className="accordion-button bg-theme-dark text-theme-light collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse${section.id}`}
                      aria-expanded="false"
                      aria-controls={`collapse${section.id}`}
                      style={{ fontWeight: "600" }}
                    >
                      {section.title}
                    </button>
                  </h2>
                  <div
                    id={`collapse${section.id}`}
                    className="accordion-collapse collapse"
                    data-bs-parent="#footerAccordion"
                  >
                    <div className="accordion-body">
                      <ul
                        className="list-unstyled mb-0"
                        style={{ color: "var(--theme-muted)" }}
                      >
                        {section.items.map((item, i) => (
                          <li key={i} className="mb-2">
                            {item === "Contact Us" ? (
                              <Link
                                to="/contact"
                                className="text-decoration-none"
                                style={{ color: "var(--theme-muted)" }}
                              >
                                {item}
                              </Link>
                            ) : (
                              item
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Divider ===== */}
        <hr className="border-theme-muted my-4" />

        {/* ===== Bottom Links ===== */}
        <div className="row">
          <div className="col-12 col-md-8 mb-3 mb-md-0">
            <div
              className="d-flex flex-column flex-md-row flex-wrap gap-2 small"
              style={{ color: "var(--theme-muted)" }}
            >
              {[
                "Company Profile",
                "Privacy Policy",
                "Cancellation Policy",
                "Terms of Service",
                "Refund / Return Policy",
              ].map((link, idx) => (
                <a
                  href="#"
                  key={idx}
                  className="text-decoration-none"
                  style={{ color: "var(--theme-muted)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--theme-primary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--theme-muted)")
                  }
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div
            className="col-12 col-md-4 small text-md-end"
            style={{ color: "var(--theme-muted)" }}
          >
            GLOWUP. © 2025 All rights reserved.
          </div>
        </div>
      </div>

      <style>{`
        :root {
          --theme-primary: #7c6f63;
          --theme-muted: #b8afa6;
          --theme-dark: #251f1c;
          --theme-muted-light: #dfdad7;
          --theme-muted-hover: #a59788;
          --theme-badge-bg: #dad3ca;
        }

        .bg-theme-dark {
          background-color: var(--theme-dark) !important;
        }
        .text-theme-light {
          color: var(--theme-muted-light) !important;
        }
        .text-theme-muted {
          color: var(--theme-muted) !important;
        }
        .border-theme-muted {
          border-color: var(--theme-muted) !important;
        }
        .hover-opacity-100:hover {
          opacity: 1 !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
