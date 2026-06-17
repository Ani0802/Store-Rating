import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number; // 0 to 5
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  interactive = false,
  onChange,
  size = 20,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleClick = (val: number) => {
    if (interactive && onChange) {
      onChange(val);
    }
  };

  const handleMouseEnter = (val: number) => {
    if (interactive) {
      setHoverRating(val);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  return (
    <div 
      style={{ 
        display: "inline-flex", 
        gap: "0.25rem", 
        alignItems: "center" 
      }}
    >
      {[1, 2, 3, 4, 5].map((starVal) => {
        const isFilled = starVal <= displayRating;
        return (
          <Star
            key={starVal}
            size={size}
            onClick={() => handleClick(starVal)}
            onMouseEnter={() => handleMouseEnter(starVal)}
            onMouseLeave={handleMouseLeave}
            style={{
              cursor: interactive ? "pointer" : "default",
              transition: "all 0.15s ease",
              fill: isFilled ? "var(--status-warning)" : "transparent",
              stroke: isFilled ? "var(--status-warning)" : "var(--text-muted)",
              transform: interactive && hoverRating && starVal <= hoverRating ? "scale(1.2)" : "scale(1)",
            }}
          />
        );
      })}
    </div>
  );
};
export default RatingStars;
