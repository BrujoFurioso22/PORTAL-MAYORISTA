import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import FlexBoxComponent from "../../components/common/FlexBox";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import styled from "styled-components";

// Styled Components
const LoginContainer = styled(FlexBoxComponent)`
  min-height: 100vh;
  width: 100%;
  padding: 2rem;
`;

const LoginCard = styled(FlexBoxComponent)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  padding: 2.5rem;
  max-width: 420px;
  width: 100%;

  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const LoginTitle = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const LoginSubtitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;
`;

const ForgotPasswordLink = styled.div`
  align-self: flex-end;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.85rem;
  margin-top: 0.25rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark};
    text-decoration: underline;
  }
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.border};
  margin: 1.5rem 0;
`;

const RegisterContainer = styled(FlexBoxComponent)`
  gap: 12px;
  margin-top: 0.5rem;
`;

const RegisterText = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
  margin: 0;
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, navigateToHomeByRole } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigateToHomeByRole();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(email, password);
      if (response.success) {
        handleNavigate();
      } else {
        setErrorMessage(response.message || "Error al iniciar sesión");
      }
    } catch (error) {
      setErrorMessage("Error de conexión. Inténtelo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      setErrorMessage("");
    }
  }, [email, password]);

  const handleRegisterClick = () => {
    navigate(ROUTES.AUTH.REGISTER);
  };

  const handleForgotPassword = () => {
    navigate(ROUTES.AUTH.FORGOT_PASSWORD);
  };

  return (
    <LoginContainer
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <LoginCard flexDirection="column" alignItems="center">
        <LoginTitle>Bienvenido a MISTOX</LoginTitle>
        <LoginSubtitle>Iniciar Sesión</LoginSubtitle>

        <LoginForm onSubmit={handleLogin}>
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="Ingresa tu correo"
            leftIconName="FaEnvelope"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />

          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="Ingresa tu contraseña"
            leftIconName="FaLock"
            rightIconName={showPassword ? "FaEyeSlash" : "FaEye"}
            onRightIconClick={() => setShowPassword(!showPassword)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            errorMessage={errorMessage}
            fullWidth
          />

          <ForgotPasswordLink onClick={handleForgotPassword}>
            ¿Olvidaste tu contraseña?
          </ForgotPasswordLink>

          <Button
            type="button"
            text={isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            onClick={handleLogin}
            fullWidth
          />

          <Divider />

          <RegisterContainer flexDirection="column" alignItems="center">
            <RegisterText>¿No tienes una cuenta?</RegisterText>
            <Button
              type="button"
              text="Registrarse"
              onClick={handleRegisterClick}
              variant="outlined"
            />
          </RegisterContainer>
        </LoginForm>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
