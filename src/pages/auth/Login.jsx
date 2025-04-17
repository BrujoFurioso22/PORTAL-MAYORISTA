import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import FlexBoxComponent from "../../components/common/FlexBox";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAppTheme } from "../../context/AppThemeContext";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "350px",
  },
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const { theme } = useAppTheme();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("📌 LoginPage cargado en el cliente");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await login(email, password);
    if (response.success) {
      // Navegar a la ruta principal después del inicio de sesión exitoso
      navigate('/');
    } else {
      setErrorMessage(response.message);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      setErrorMessage("");
    }
  }, [email, password]);

  return (
    <FlexBoxComponent
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <FlexBoxComponent
        flexDirection="column"
        alignItems="center"
        width="auto"
        style={{
          border: `solid 1px ${theme.colors.border}`,
          padding: "2rem",
        }}
      >
        <h1>Bienvenido a MISTOX</h1>
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="Ingresa tu correo"
            leftIconName="Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="Ingresa tu contraseña"
            leftIconName="Lock"
            rightIconName={showPassword ? "EyeOff" : "Eye"}
            onRightIconClick={() => setShowPassword(!showPassword)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            errorMessage={errorMessage}
          />
          <Button type="submit" text="Iniciar Sesión" />
        </form>
      </FlexBoxComponent>
    </FlexBoxComponent>
  );
};

export default Login;
