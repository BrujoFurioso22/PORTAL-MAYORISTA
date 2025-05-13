import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import FlexBoxComponent from "../../components/common/FlexBox";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";

// Styled Components (reutilizando algunos del Login)
const Container = styled(FlexBoxComponent)`
  min-height: 100vh;
  width: 100%;
  padding: 2rem;
`;

const Card = styled(FlexBoxComponent)`
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const Subtitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;
`;

const BackLink = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s ease;
  margin-bottom: 20px;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark};
    text-decoration: underline;
  }
`;

const CodeInputContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 10px 0;
`;

const CodeDigit = styled.input`
  width: 40px;
  height: 50px;
  text-align: center;
  font-size: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;

const Message = styled.div`
  margin: 8px 0;
  font-size: 0.9rem;
  color: ${({ theme, type }) =>
    type === "success" ? theme.colors.success : theme.colors.error};
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { verifyEmailExists, sendVerificationCode, verifyCode, resetPassword } =
    useAuth();
  const navigate = useNavigate();

  // Referencias para los inputs de código
  const codeInputRefs = Array.from({ length: 6 }, () => React.createRef());

  // Manejar cambio en el input de código
  const handleCodeChange = (index, value) => {
    if (value.length > 1) {
      // Si se pega un código completo
      const pastedCode = value.slice(0, 6).split("");
      const newCode = [...code];

      pastedCode.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });

      setCode(newCode);

      // Enfocar el último input o el siguiente vacío
      const nextEmptyIndex = newCode.findIndex((digit) => digit === "");
      if (nextEmptyIndex !== -1) {
        codeInputRefs[nextEmptyIndex].current.focus();
      } else {
        codeInputRefs[5].current.focus();
      }
    } else {
      // Manejo normal de un solo dígito
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-avanzar al siguiente input
      if (value !== "" && index < 5) {
        codeInputRefs[index + 1].current.focus();
      }
    }
  };

  // Manejar tecla backspace en el input de código
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeInputRefs[index - 1].current.focus();
    }
  };

  // Verificar correo electrónico
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await verifyEmailExists(email);
      if (response.success && response.exists) {
        // Enviar código de verificación
        const codeResponse = await sendVerificationCode(email);
        if (codeResponse.success) {
          toast.success("Código de verificación enviado a su correo");
          setStep(2);
        } else {
          setMessage({ text: codeResponse.message, type: "error" });
        }
      } else {
        setMessage({
          text: "No existe una cuenta asociada a este correo electrónico",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "Error al verificar el correo", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar código ingresado
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    const codeString = code.join("");
    if (codeString.length !== 6) {
      setMessage({
        text: "Ingrese el código de 6 dígitos completo",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await verifyCode(codeString);
      if (response.success && response.isValid) {
        toast.success("Código verificado correctamente");
        setStep(3);
      } else {
        setMessage({ text: response.message, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error al verificar el código", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Establecer nueva contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    if (password !== confirmPassword) {
      setMessage({ text: "Las contraseñas no coinciden", type: "error" });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({
        text: "La contraseña debe tener al menos 6 caracteres",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await resetPassword(password);
      if (response.success) {
        toast.success("Contraseña actualizada correctamente");
        // Redirigir al login después de un breve momento
        setTimeout(() => {
          navigate(ROUTES.AUTH.LOGIN);
        }, 1500);
      } else {
        setMessage({ text: response.message, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error al actualizar la contraseña", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Volver al paso anterior o al login
  const handleBack = () => {
    if (step === 1) {
      navigate(ROUTES.AUTH.LOGIN);
    } else {
      setStep(step - 1);
      setMessage({ text: "", type: "" });
    }
  };

  useEffect(() => {
    // Limpiar mensaje al cambiar inputs
    if (message.text) {
      setMessage({ text: "", type: "" });
    }
  }, [email, code, password, confirmPassword]);

  return (
    <Container
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Card flexDirection="column" alignItems="center">
        <BackLink onClick={handleBack}>
          <FaArrowLeft /> {step === 1 ? "Volver al inicio de sesión" : "Volver"}
        </BackLink>

        <Title>Recuperar contraseña</Title>
        {step === 1 && <Subtitle>Ingresa tu correo electrónico</Subtitle>}
        {step === 2 && <Subtitle>Ingresa el código de verificación</Subtitle>}
        {step === 3 && <Subtitle>Establece tu nueva contraseña</Subtitle>}

        {step === 1 && (
          <Form onSubmit={handleVerifyEmail}>
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="Ingresa tu correo"
              leftIconName="Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            {message.text && (
              <Message type={message.type}>{message.text}</Message>
            )}

            <Button
              type="submit"
              text={isLoading ? "Verificando..." : "Continuar"}
              loading={isLoading}
              fullWidth
            />
          </Form>
        )}

        {step === 2 && (
          <Form onSubmit={handleVerifyCode}>
            <p style={{ textAlign: "center", margin: "0 0 16px" }}>
              Hemos enviado un código de verificación de 6 dígitos a {email}
            </p>

            <CodeInputContainer>
              {code.map((digit, index) => (
                <CodeDigit
                  key={index}
                  ref={codeInputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={6} // Permitir pegado de código completo
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  required
                />
              ))}
            </CodeInputContainer>

            {message.text && (
              <Message type={message.type}>{message.text}</Message>
            )}

            <Button
              type="submit"
              text={isLoading ? "Verificando..." : "Verificar código"}
              loading={isLoading}
              fullWidth
            />

            <Button
              type="button"
              text="Reenviar código"
              variant="outlined"
              onClick={() => sendVerificationCode(email)}
              fullWidth
            />
          </Form>
        )}

        {step === 3 && (
          <Form onSubmit={handleResetPassword}>
            <Input
              label="Nueva contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu nueva contraseña"
              leftIconName="Lock"
              rightIconName={showPassword ? "EyeOff" : "Eye"}
              onRightIconClick={() => setShowPassword(!showPassword)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            <Input
              label="Confirmar contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="Confirma tu nueva contraseña"
              leftIconName="Lock"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
            />

            {message.text && (
              <Message type={message.type}>{message.text}</Message>
            )}

            <Button
              type="submit"
              text={isLoading ? "Actualizando..." : "Actualizar contraseña"}
              loading={isLoading}
              fullWidth
            />
          </Form>
        )}
      </Card>
    </Container>
  );
};

export default ForgotPassword;
