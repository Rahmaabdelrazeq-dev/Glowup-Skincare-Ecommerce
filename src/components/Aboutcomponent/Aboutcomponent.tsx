import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AboutImage from "../../assets/images/aboutcomponent.jpg"
import { FaArrowRight } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/about");
  };

  return (
    <div className="w-100 position-relative">
      <img
        src={AboutImage}
        alt="About Section"
        className="img-fluid w-100"
        style={{
          objectFit: "cover",
          height: "450px",
          filter: "brightness(70%)",
        }}
      />

    
      <div
        className="position-absolute top-50 start-0 translate-middle-y text-white p-5"
        style={{
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <p
          className="text-uppercase mb-2"
          style={{
            fontSize: "14px",
            letterSpacing: "1px",
            opacity: 0.9,
          }}
        >
          Revitalize Your Body
        </p>

        <h2
          className="fw-bold mb-3"
          style={{
            fontSize: "28px",
            lineHeight: "1.3",
          }}
        >
          Effective Ingredients for Visible Results
        </h2>

        <p
          className="mb-4"
          style={{
            fontSize: "15px",
            lineHeight: "1.6",
            opacity: 0.95,
          }}
        >
          Our body products are rich in highly effective ingredients, achieve
          visible results, firm the skin and leave it feeling soft and supple.
          Fine textures that are quickly absorbed, non-greasy and in no way
          inferior to facial care. It’s time to give our body the same
          attention as our face.
        </p>

        <button
          className="btn text-white border border-light  px-4 py-2 d-inline-flex align-items-center gap-2"
          style={{
            backgroundColor: "transparent",
            transition: "all 0.3s ease",
          }}
          onClick={handleClick}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          Discover More
          <FaArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
