import React from "react";
import FlexBoxComponent from "../components/common/FlexBox";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <FlexBoxComponent
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FlexBoxComponent justifyContent="center">
        404 | Page Not Found
      </FlexBoxComponent>
      <Button onClick={() => navigate("/")} text={"Home"} />
    </FlexBoxComponent>
  );
};

export default NotFound;
