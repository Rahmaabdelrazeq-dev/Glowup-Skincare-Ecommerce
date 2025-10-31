import React from "react";
import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";

const slides = [
  { title: "Elegant Skincare", image: "/nnn.jpg" },
  { title: "Premium Creams", image: "/112.jpg" },
  { title: "Natural Radiance", image: "/r.jpg" },
];

const Section = styled.section`
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 700px;
  overflow: hidden;
`;

const SlideBackground = styled.div<{ bg: string }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: url(${(props) => props.bg}) center center / cover no-repeat;
  z-index: 1;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(36, 32, 28, 0.18) 0%,
      rgba(36, 32, 28, 0.05) 60%,
      rgba(0, 0, 0, 0.03) 100%
    );
    z-index: 2;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 3;
  max-width: 560px;
  margin-left: 7vw;
  margin-top: 16vh;
  color: #fff;

  @media (max-width: 1100px) {
    margin-top: 8vw;
    max-width: 94vw;
  }
`;

const SmallTitle = styled.div`
  color: #f2f2f2;
  font-size: 18px;
  margin-bottom: 1rem;
  font-weight: 400;
  letter-spacing: 0.02em;
`;

const BigTitle = styled.h1`
  font-size: 2.4rem;
  font-weight: 700;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  font-size: 1.12rem;
  color: #e3e3e3;
  line-height: 1.7;
  margin-bottom: 2.2rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
  border-radius: 4px;
  font-size: 1.09rem;
  padding: 0.95rem 2.3rem 0.95rem 1.1rem;
  cursor: pointer;
  margin-top: 0.2rem;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: #fff;
    color: #222;
  }

  svg {
    margin-left: 11px;
    transition: transform 0.3s;
  }

  &:hover svg {
    transform: translateX(5px);
  }
`;

// --- THE FIX: pagination dots always centered ---
const StyledSwiper = styled(Swiper)`
  width: 100%;
  height: 100%;

  .swiper-pagination {
    width: 100% !important;
    position: absolute !important;
    bottom: 38px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 10;
    pointer-events: none;
  }

  .swiper-pagination-bullets {
    display: flex;
    justify-content: center;
    width: 100%;
    pointer-events: none;
  }

  .swiper-pagination-bullet {
    width: 28px;
    height: 5px;
    border-radius: 5px;
    background: #fff;
    opacity: 0.44;
    margin: 0 6px !important;
    transition: opacity 0.3s;
    pointer-events: auto;
  }

  .swiper-pagination-bullet-active {
    opacity: 1;
    background: #fff;
  }
`;
// --- end fix ---

const CarouselSection: React.FC = () => {
  const navigate = useNavigate();
  const handleDiscover = () => navigate("/products");

  return (
    <Section>
      <StyledSwiper
        modules={[Autoplay, EffectFade, Pagination]}
        autoplay={{ delay: 2900, disableOnInteraction: false }}
        effect="fade"
        loop
        pagination={{ clickable: true }}
      >
        {slides.map((s, idx) => (
          <SwiperSlide key={idx}>
            <SlideBackground bg={s.image} />
            <Content>
              <SmallTitle>Treat Your Body Like Your Face</SmallTitle>
              <BigTitle>{s.title}</BigTitle>
              <Description>
                A combination of nature and advanced technology. Vegan, natural,
                skin-friendly and rich in effective biotechnological
                ingredients.
              </Description>
              <Button onClick={handleDiscover}>
                Discover More
                <svg
                  width="25"
                  height="25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Button>
            </Content>
          </SwiperSlide>
        ))}
      </StyledSwiper>
    </Section>
  );
};

export default CarouselSection;
