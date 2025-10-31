import React from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';

const CustomStatCard = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }

  /* ضمان إن المحتوى ما يكبرش عن الكارد */
  min-width: 0;
`;

const StatIconContainer = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${(props) => props.$color + '15'};
  color: ${(props) => props.$color};
  font-size: 1.8rem;
  flex-shrink: 0;
`;

const StatTextWrapper = styled.div`
  min-width: 0;
  flex: 1;
  overflow: hidden;
`;

const StatTitle = styled(Card.Title)`
  font-size: clamp(0.8rem, 1vw, 1rem);
  color: #6c757d;
  margin-bottom: 0.1rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatValue = styled(Card.Text)`
  font-size: clamp(1.2rem, 2vw, 1.8rem);
  font-weight: 700;
  color: #343a40;
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  isClickable?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const StatisticCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  isClickable = false,
  isActive = false,
  onClick,
}) => (
  <CustomStatCard
    className={`mb-4 ${isClickable ? 'cursor-pointer' : ''}`}
    style={
      isActive
        ? {
            borderLeft: `5px solid ${color}`,
            backgroundColor: `${color}10`,
            transform: 'translateY(-3px)',
          }
        : {}
    }
    onClick={onClick}
  >
    <Card.Body className="d-flex align-items-center p-3 flex-wrap">
      <StatIconContainer $color={color} className="me-3">
        <i className={`bi ${icon}`}></i>
      </StatIconContainer>
      <StatTextWrapper>
        <StatTitle>{title}</StatTitle>
        <StatValue>{value}</StatValue>
      </StatTextWrapper>
    </Card.Body>
  </CustomStatCard>
);

export default StatisticCard;
