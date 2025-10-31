import React, { type JSX } from "react";
import CardUI from "./components/Card";
import { useProductsQuery } from "../../services/GetCategoriesAxios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Spinner from 'react-bootstrap/Spinner';
import "./components/categories.css"
import { useNavigate } from "react-router-dom";


const images: string[] = [
  "https://i.pinimg.com/736x/bb/c0/ea/bbc0ea4cd37abf4731a157910dcd023f.jpg",
  "https://i.pinimg.com/1200x/70/2b/42/702b429b494edfac66cc49b4c6d03600.jpg",
  "https://i.pinimg.com/1200x/5f/c1/93/5fc19362442557efc3e529b552e3442b.jpg",
  "https://i.pinimg.com/1200x/e3/fd/8c/e3fd8ca682c3330377f24129d1daa8b2.jpg"
];


export default function Categories(): JSX.Element {
  const { data, isLoading, isError } = useProductsQuery();
  const navigate = useNavigate(); 

  const handleCategoryClick = (category: string) => {
    navigate(`/products?category=${category}`);
  };


  if (isLoading)  
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spinner className="spinner-border-lg" animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
if (isError) {
  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h2 style={{ color: "red" }}>An error occurred while fetching data</h2>
    </div>
  );
}

  return (
    <div style={{ padding: "30px" }}>
      <h6 style={{ fontWeight: "lighter" }}>Categories</h6>
      <h4 style={{ fontWeight: "lighter" }}>
        Natural Face Care for Visible Transformation
      </h4>
      <p style={{ fontSize: "14px", color: "grey" }}>
        Our natural face care is based on pure ingredients and
        biotechnological plant power, designed to transform your skin and
        provide visible results —naturally.
      </p>
    <Swiper
  modules={[Pagination, Navigation, Autoplay]}
  loop={true}
  autoplay={{ delay: 5000, disableOnInteraction: false }}
  pagination={{ clickable: true, type: "bullets" }}
  navigation={true}
  style={{
    width: "100%",
    height: "auto",
    position: "relative",
  }}
  className="category-slider"
  spaceBetween={20}
  breakpoints={{
    0: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 }
  }}
>
  {data?.map((cat, i) => (
    <SwiperSlide 
      key={cat} 
      onClick={() => handleCategoryClick(cat)}
      style={{ cursor: 'pointer' }}
    >
      <CardUI title={cat} img={images[i % images.length]} />
    </SwiperSlide>
  ))}
</Swiper>

    </div>
  );
}