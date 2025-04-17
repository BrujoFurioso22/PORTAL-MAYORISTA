import React from "react";
import FlexBoxComponent from "../components/common/FlexBox";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <FlexBoxComponent
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FlexBoxComponent justifyContent="center">
        No dispone de permisos para ingresar en esta seccion
      </FlexBoxComponent>
      <Button onClick={() => navigate("/")} text={"Regresar"} />
    </FlexBoxComponent>
  );
};

export default Unauthorized;
