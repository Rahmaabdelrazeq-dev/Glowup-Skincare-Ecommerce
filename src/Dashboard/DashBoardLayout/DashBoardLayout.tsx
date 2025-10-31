import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar";
import MainNavbar from "../components/NavBar";

export default function DashboardLayout() {
  return (
    <div style={{ backgroundColor: "#F9F6F2" }}>
      <div className="d-none d-md-block">
        <SideBar />
      </div>

      <div className="d-block d-md-none">
        <SideBar />
      </div>

      <div
        className="d-flex flex-column"
        style={{
          marginLeft: "260px",
          minHeight: "100vh",
          backgroundColor: "#FDFBF6",
        }}
      >
        <style>
          {`
            @media (max-width: 768px) {
              .d-flex.flex-column {
                margin-left: 0 !important;
              }
            }
          `}
        </style>

        <MainNavbar />

        <div
          style={{
            flexGrow: 1,
            padding: "30px 25px",
            backgroundColor: "#FAF8F5",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            overflowY: "auto",
            height: "calc(100vh - 80px)",
          }}
        >
          <div
            style={{
              width: "100%",
              padding: "20px",
              backgroundColor: "white",
              borderRadius: "14px",
              boxShadow: "0 4px 20px rgb(200 190 170 / 0.3)",
            }}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
