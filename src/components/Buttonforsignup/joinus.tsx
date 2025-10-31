import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";

const ButtonWrapper = styled.div<{ $visible: boolean }>`
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 9999;
  transition: all 0.3s ease-in-out;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  pointer-events: ${(props) => (props.$visible ? "auto" : "none")};
`;

const JoinButton = styled.button`
  background-color: #7c6f63;
  color: #fff;
  border: none;
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s;

  &:hover {
    background-color: #6a5c52;
  }
`;

const CloseIcon = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #fff;
  color: #333;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
`;

const JoinCommunity: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const dismissed = localStorage.getItem("dismissJoinButton");

    if (
      !token &&
      !dismissed &&
      location.pathname !== "/signup" &&
      location.pathname !== "/login"
    ) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location.pathname]);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem("dismissJoinButton", "true");
  };

  const handleJoin = () => {
    navigate("/signup");
  };

  return (
    <ButtonWrapper $visible={visible}>
      <CloseIcon onClick={handleClose}>×</CloseIcon>
      <JoinButton onClick={handleJoin}>Join our community</JoinButton>
    </ButtonWrapper>
  );
};

export default JoinCommunity;

