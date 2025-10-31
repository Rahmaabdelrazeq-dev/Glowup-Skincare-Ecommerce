import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center py-5"
      style={{
        height: "100vh",
        backgroundColor: "#f7f8fa",
        color: "#50473eff",
     
      }}
    >
    <img src="https://ex-coders.com/html/boimela/assets/img/404.png" width={"400px"} height={"300px"}/>
      <h1 style={{ fontSize: "5rem", fontWeight: "700" }}>404</h1>
      <h3 style={{ fontSize: "1.8rem", marginBottom: "15px" }}>
        Oops! Page not found 😢
      </h3>
      <p style={{ maxWidth: "400px", color: "#6f6358" }}>
        The page you’re looking for doesn’t exist or has been moved.
      </p>

      <Link
        to="/home"
        style={{
          backgroundColor: "#50473eff",
          color: "#fff",
          padding: "10px 25px",
          borderRadius: "10px",
          textDecoration: "none",
          marginTop: "20px",
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}
