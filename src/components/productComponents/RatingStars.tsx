
import React from 'react';

interface RatingStarsProps {
  rating: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array(fullStars)
        .fill(0)
        .map((_, i) => (
          <svg key={`full-${i}`} width="16" height="16" fill="gold" viewBox="0 0 16 16">
            <path d="M3.612 15.443 4.54 10.5.708 6.813l5.332-.766L8 1.5l1.96 4.547 5.332.766-3.832 3.687.928 4.943L8 13.187l-4.389 2.256z" />
          </svg>
        ))}

      {hasHalfStar && (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="gold" />
              <stop offset="50%" stopColor="lightgray" />
            </linearGradient>
          </defs>
          <path
            fill="url(#halfGrad)"
            d="M3.612 15.443 4.54 10.5.708 6.813l5.332-.766L8 1.5l1.96 4.547 5.332.766-3.832 3.687.928 4.943L8 13.187l-4.389 2.256z"
          />
        </svg>
      )}

      {Array(emptyStars)
        .fill(0)
        .map((_, i) => (
          <svg key={`empty-${i}`} width="16" height="16" fill="lightgray" viewBox="0 0 16 16">
            <path d="M3.612 15.443 4.54 10.5.708 6.813l5.332-.766L8 1.5l1.96 4.547 5.332.766-3.832 3.687.928 4.943L8 13.187l-4.389 2.256z" />
          </svg>
        ))}
    </div>
  );
};

export default RatingStars;
