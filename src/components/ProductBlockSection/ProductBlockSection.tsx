import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const SectionWrap = styled.section`
  width: 100vw;
  min-height: 520px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6vw 0;
`;

const Block = styled.div`
  display: flex;
  align-items: center;
  max-width: 1200px;
  width: 100%;
  gap: 64px;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 44px;
  }
`;

const ImgWrap = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  background: #f4efe7;
  box-shadow: 0 3px 22px 0 rgba(112, 108, 104, 0.08);
  border-radius: 10px;
  min-width: 280px;
  max-width: 410px;
  padding: 18px 18px 24px 18px;

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: 7px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  }
`;

const ContentWrap = styled.div`
  flex: 1.4;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-left: 18px;

  @media (max-width: 900px) {
    padding-left: 0;
    align-items: center;
    text-align: center;
  }
`;

const Label = styled.div`
  font-size: 0.95rem;
  color: #89817a;
  margin-bottom: 10px;
  letter-spacing: 0.02em;
  font-weight: 500;
`;

const Heading = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #23211d;
  margin-bottom: 14px;
`;

const Description = styled.p`
  font-size: 1.02rem;
  color: #4e4a44;
  max-width: 410px;
  margin-bottom: 34px;
  line-height: 1.8;
`;

const Button = styled.button`
  background: transparent;
  color: #23211d;
  border: 1px solid #bbb;
  font-size: 1rem;
  padding: 0.9rem 2.2rem 0.9rem 1.2rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;

  &:hover {
    background: #23211d;
    color: #fff;
    border-color: #23211d;
  }

  svg {
    margin-left: 12px;
    transition: transform 0.3s;
  }

  &:hover svg {
    transform: translateX(4px);
  }
`;

const ProductBlockSection: React.FC = () => {
  const navigate = useNavigate();
  const handleLearnMore = () => {
    navigate("/products");
  };

  return (
    <SectionWrap>
      <Block>
        <ImgWrap>
          <img src="/20.jpg" alt="Skincare Product" />
        </ImgWrap>
        <ContentWrap>
          <Label>Skin Care</Label>
          <Heading>Potent Solutions for Demanding Skin</Heading>
          <Description>
            Discover products tailored for mature skin and urban lifestyles,
            offering daily hydration and the added advantage of powerful
            vitamins and antioxidants.
          </Description>
          <Button onClick={handleLearnMore}>
            Learn More
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
        </ContentWrap>
      </Block>
    </SectionWrap>
  );
};

export default ProductBlockSection;
