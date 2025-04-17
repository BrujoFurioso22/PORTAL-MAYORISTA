import React from "react";
import styled from "styled-components";

const Loader = styled.div`
  border: 2px solid #f3f3f3;
  border-top: 2px solid ${({ $color }) => $color || "#fff"};
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const RenderLoader = ({ color }) => {
  return <Loader $color={color} />;
};

export default RenderLoader;
