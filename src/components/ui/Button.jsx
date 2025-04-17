import styled from "styled-components";
import RenderIcon from "./RenderIcon";
import { useRef, useState } from "react";
import RenderLoader from "./RenderLoader";

const ButtonStyled = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: ${({ $align }) =>
    $align === "left"
      ? "flex-start"
      : $align === "right"
      ? "flex-end"
      : $align === "center"
      ? "center"
      : $align};
  padding: ${({ $size }) =>
    $size === "small"
      ? "6px 12px"
      : $size === "large"
      ? "14px 24px"
      : "10px 18px"};
  font-size: ${({ $size }) =>
    $size === "small" ? "14px" : $size === "large" ? "18px" : "16px"};
  border-radius: ${({ $radius }) => $radius || "5px"};
  font-weight: ${({ $fontWeight }) => $fontWeight || 400};
  cursor: pointer;
  transition: 0.3s ease-in-out;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  height: max-content;
  border: ${({ $variant, theme }) =>
    $variant === "outline" ? `solid 1px ${theme.colors.primary}` : "none"};
  outline: none;

  background: ${({ $backgroundColor, $variant, theme }) =>
    $backgroundColor ||
    ($variant === "solid"
      ? theme.colors.primary
      : $variant === "outline"
      ? "transparent"
      : theme.colors.secondary)};

  color: ${({ $color, $variant, theme }) =>
    $color || ($variant === "solid" ? "#fff" : theme.colors.primary)};

  &:hover {
    filter: brightness(0.9);
    transform: scale(1.02);
    /* color: ${({ $color, $variant, theme }) =>
      $color ||
      ($variant === "solid" ? theme.colors.primary : theme.colors.white)}; */
  }

  &:disabled {
    background: gray;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function Button({
  text,
  variant = "solid",
  size = "medium",
  fullWidth = false,
  disabled = false,
  leftIconName,
  rightIconName,
  rightIconLibrary,
  leftIconLibrary,
  color,
  align = "center",
  backgroundColor,
  iconSize = 18,
  fontWeight,
  radius,
  onClick,
  ...props
}) {
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef();

  const handleClick = async (e) => {
    if (typeof onClick === "function") {
      const result = onClick(e);
      if (result instanceof Promise) {
        try {
          setLoading(true);
          await result;
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <ButtonStyled
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $color={color}
      $backgroundColor={backgroundColor}
      $fontWeight={fontWeight}
      $radius={radius}
      $align={align}
      disabled={disabled || loading}
      onClick={handleClick}
      ref={buttonRef}
      {...props}
    >
      {loading ? (
        <RenderLoader color={color} />
      ) : (
        <>
          {leftIconName && (
            <IconContainer>
              <RenderIcon
                name={leftIconName}
                size={iconSize}
                color={color}
                library={leftIconLibrary}
              />
            </IconContainer>
          )}
          {text}
          {rightIconName && (
            <IconContainer>
              <RenderIcon
                name={rightIconName}
                size={iconSize}
                color={color}
                library={rightIconLibrary}
              />
            </IconContainer>
          )}
        </>
      )}
    </ButtonStyled>
  );
}
