import styled from "styled-components";

const FlexBox = styled.div`
  display: flex;
  flex-direction: ${({ $flexDirection }) => $flexDirection || "row"};
  justify-content: ${({ $justifyContent }) => $justifyContent || "flex-start"};
  align-items: ${({ $alignItems }) => $alignItems || "flex-start"};
  gap: ${({ $gap }) => $gap || "10px"};
  width: ${({ $width }) => $width || "100%"};
  height: ${({ $height }) => $height || "auto"};
`;

export default function FlexBoxComponent({
  flexDirection,
  justifyContent,
  alignItems,
  gap,
  width,
  height,
  children,
  ...props
}) {
  return (
    <FlexBox
      $flexDirection={flexDirection}
      $justifyContent={justifyContent}
      $alignItems={alignItems}
      $gap={gap}
      $width={width}
      $height={height}
      {...props}
    >
      {children}
    </FlexBox>
  );
}
