import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import FlexBoxComponent from "../../components/common/FlexBox";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAppTheme } from "../../context/AppThemeContext";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { ROUTES } from "../../constants/routes";

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "450px",
  },
};

const FormCard = styled(FlexBoxComponent)`
  border: solid 1px ${({theme}) => theme.colors.border};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: ${({theme}) => theme.colors.surface};
`;

const Title = styled.h1`
  margin-bottom: 0.5rem;
  color: ${({theme}) => theme.colors.text};
`;

const Subtitle = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: ${({theme}) => theme.colors.text};
`;

const StepsIndicator = styled.div`
  display: flex;
  margin-bottom: 2rem;
  justify-content: center;
  width: 100%;
`;

const StepDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({theme, $active}) =>
    $active ? theme.colors.primary : theme.colors.border};
  margin: 0 6px;
  transition: background-color 0.3s;
`;

const CompanyList = styled.div`
  margin: 1rem 0;
  max-height: 150px;
  overflow-y: auto;
  width: 100%;
  border: 1px solid ${({theme}) => theme.colors.border};
  border-radius: 4px;
`;

const CompanyItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({theme}) => theme.colors.border};
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({theme}) => theme.colors.background};
  }
`;

const Checkbox = styled.input`
  margin-right: 12px;
`;

const CompanyName = styled.span`
  flex: 1;
`;

const MaskedEmail = styled.div`
  padding: 12px;
  background-color: ${({theme}) => theme.colors.background + "80"};
  border-radius: 4px;
  margin-bottom: 1rem;
  font-family: monospace;
  letter-spacing: 1px;
`;

const InfoMessage = styled.div`
  padding: 12px;
  margin: 12px 0;
  border-radius: 4px;
  background-color: ${({theme}) => theme.colors.info + "20"};
  border-left: 3px solid ${({theme}) => theme.colors.info};
  font-size: 0.9rem;
`;
const PasswordRequirements = styled.ul`
  margin: 8px 0;
  padding-left: 20px;
  font-size: 0.85rem;
  color: ${({theme}) => theme.colors.textLight};
`;

const RequirementItem = styled.li`
  margin-bottom: 4px;
  color: ${({theme, $met}) =>
    $met ? theme.colors.success : theme.colors.textLight};
`;

const Register = () => {
  const { theme } = useAppTheme();
  const navigate = useNavigate();
  const { verifyIdentification, requestAccess, verifyExistingEmail } =
    useAuth();

  // Estados
  const [step, setStep] = useState(1);
  const [identification, setIdentification] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userExists, setUserExists] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  // Nuevos estados para las contraseñas
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Limpiar errores cuando se modifican los campos
  useEffect(() => {
    setError("");
  }, [identification, email]);

  useEffect(() => {
    setPasswordError("");
  }, [password, confirmPassword]);

  const checkPasswordRequirements = () => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      allMet: hasMinLength && hasUpperCase && hasLowerCase && hasNumber,
    };
  };

  // Formatear la cédula o RUC mientras el usuario escribe
  const handleIdentificationChange = (e) => {
    const value = e.target.value;
    // Permitir solo números y limitar la longitud
    const formattedValue = value.replace(/\D/g, "").slice(0, 13);
    setIdentification(formattedValue);
  };

  // Verificar identificación
  const handleVerify = async () => {
    if (identification.length < 10) {
      setError("La cédula o RUC debe tener al menos 10 dígitos");
      return;
    }

    setLoading(true);

    try {
      // Llamar a la función de verificación del AuthContext
      const response = await verifyIdentification(identification);

      if (response.success) {
        if (response.userExists) {
          // Usuario existente
          setUserExists(true);
          setMaskedEmail(response.maskedEmail);
          // Mostrar empresas a las que ya tiene acceso y las que puede solicitar
          setAvailableCompanies(response.availableCompanies || []);
        } else {
          // Usuario nuevo
          setUserExists(false);
          // Mostrar todas las empresas disponibles para registro
          setAvailableCompanies([
            {
              id: "maxximundo",
              name: "Maxximundo",
              logo: "https://via.placeholder.com/50",
            },
            {
              id: "autollanta",
              name: "Autollanta",
              logo: "https://via.placeholder.com/50",
            },
            {
              id: "stox",
              name: "Stox",
              logo: "https://via.placeholder.com/50",
            },
            {
              id: "ikonix",
              name: "Ikonix",
              logo: "https://via.placeholder.com/50",
            },
            {
              id: "automax",
              name: "Automax",
              logo: "https://via.placeholder.com/50",
            },
          ]);
        }

        // Avanzar al siguiente paso
        setStep(2);
      } else {
        setError(response.message || "Error al verificar la identificación");
      }
    } catch (err) {
      setError("Error de conexión. Inténtelo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Verificar contraseñas
  const validatePasswords = () => {
    if (!password) {
      setPasswordError("La contraseña es obligatoria");
      return false;
    }

    const requirements = checkPasswordRequirements();
    if (!requirements.allMet) {
      setPasswordError("La contraseña no cumple con los requisitos mínimos");
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return false;
    }

    return true;
  };

  // Manejar selección de empresas
  const handleCompanyToggle = (companyId) => {
    setSelectedCompanies((prevSelected) => {
      if (prevSelected.includes(companyId)) {
        return prevSelected.filter((id) => id !== companyId);
      } else {
        return [...prevSelected, companyId];
      }
    });
  };

  // Verificar email existente
  const handleEmailVerify = async () => {
    if (!email) {
      setError("Por favor ingrese su correo electrónico");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyExistingEmail(identification, email);

      if (response.success) {
        setStep(3);
      } else {
        setError(
          response.message || "El correo electrónico ingresado no coincide"
        );
      }
    } catch (err) {
      setError("Error de conexión. Inténtelo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Solicitar acceso
  const handleRequestAccess = async () => {
    if (selectedCompanies.length === 0) {
      setError("Por favor seleccione al menos una empresa");
      return;
    }

    if (!userExists) {
      if (!email) {
        setError("Por favor ingrese un correo electrónico");
        return;
      }

      // Validación de contraseñas para usuarios nuevos
      if (!validatePasswords()) {
        return;
      }
    }

    setLoading(true);

    try {
      const requestData = {
        identification,
        email,
        companies: selectedCompanies,
        isNewUser: !userExists,
      };

      // Añadir contraseña solo para usuarios nuevos
      if (!userExists) {
        requestData.password = password;
      }

      const response = await requestAccess(requestData);

      if (response.success) {
        toast.success(
          "Solicitud enviada correctamente. Recibirás un correo con instrucciones adicionales."
        );
        // Avanzar al paso de confirmación
        setStep(4);
      } else {
        setError(response.message || "Error al procesar la solicitud");
      }
    } catch (err) {
      setError("Error de conexión. Inténtelo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Renderizar paso 1: Ingreso de cédula/RUC
  const renderStep1 = () => (
    <>
      <Title>Registro de usuario</Title>
      <Subtitle>Ingresa tu cédula o RUC</Subtitle>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify();
        }}
        style={styles.form}
      >
        <Input
          label="Cédula o RUC"
          value={identification}
          onChange={handleIdentificationChange}
          placeholder="Ejemplo: 1234567890001"
          required
          leftIconName="IdCard"
          leftIconLibrary={4}
          errorMessage={error}
        />

        <Button
          type="submit"
          text="Verificar"
          loading={loading}
          disabled={identification.length < 10 || loading}
        />

        <Button
          text="Volver a inicio de sesión"
          variant="outlined"
          onClick={() => navigate(ROUTES.AUTH.LOGIN)}
        />
      </form>
    </>
  );

  // Renderizar paso 2: Selección de empresas o verificación de email
  const renderStep2 = () => (
    <>
      <Title>Registro de usuario</Title>
      {userExists ? (
        <>
          <Subtitle>Verificar correo electrónico</Subtitle>
          <InfoMessage>
            Ya existe una cuenta asociada a esta identificación. Para continuar,
            ingresa el correo electrónico asociado a tu cuenta.
          </InfoMessage>

          <MaskedEmail>Correo registrado: {maskedEmail}</MaskedEmail>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailVerify();
            }}
            style={styles.form}
          >
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              required
              leftIconName="Mail"
              errorMessage={error}
            />

            <Button type="submit" text="Verificar correo" loading={loading} />

            <Button
              text="Volver"
              variant="outlined"
              onClick={() => setStep(1)}
            />
          </form>
        </>
      ) : (
        // Versión modificada para usuarios nuevos, con campos de contraseña
        <>
          <Subtitle>Crea tu cuenta y solicita acceso</Subtitle>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRequestAccess();
            }}
            style={styles.form}
          >
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              required
              leftIconName="Mail"
            />

            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crea una contraseña"
              required
              leftIconName="Lock"
              rightIconName={showPassword ? "EyeOff" : "Eye"}
              onRightIconClick={() => setShowPassword(!showPassword)}
            />

            <PasswordRequirements>
              <>
                <RequirementItem $met={checkPasswordRequirements().hasMinLength}>
                  Al menos 8 caracteres
                </RequirementItem>
                <RequirementItem $met={checkPasswordRequirements().hasUpperCase}>
                  Al menos una letra mayúscula
                </RequirementItem>
                <RequirementItem $met={checkPasswordRequirements().hasLowerCase}>
                  Al menos una letra minúscula
                </RequirementItem>
                <RequirementItem $met={checkPasswordRequirements().hasNumber}>
                  Al menos un número
                </RequirementItem>
              </>
            </PasswordRequirements>

            <Input
              label="Confirmar contraseña"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu contraseña"
              required
              leftIconName="Lock"
              errorMessage={passwordError}
            />

            <div>
              <label style={{ marginBottom: "8px", display: "block" }}>
                Selecciona empresas:
              </label>
              <CompanyList>
                {availableCompanies.map((company) => (
                  <CompanyItem
                    key={company.id}
                    onClick={() => handleCompanyToggle(company.id)}
                  >
                    <Checkbox
                      type="checkbox"
                      checked={selectedCompanies.includes(company.id)}
                      onChange={() => {}}
                    />
                    <CompanyName>{company.name}</CompanyName>
                  </CompanyItem>
                ))}
              </CompanyList>
              {error && (
                <div
                  style={{
                    color: theme.colors.error,
                    fontSize: "0.85rem",
                    marginTop: "8px",
                  }}
                >
                  {error}
                </div>
              )}
            </div>

            <Button
              type="submit"
              text="Solicitar acceso"
              loading={loading}
              disabled={selectedCompanies.length === 0 || !email}
            />

            <Button
              text="Volver"
              variant="outlined"
              onClick={() => setStep(1)}
            />
          </form>
        </>
      )}
    </>
  );

  // Renderizar paso 3: Selección de empresas para usuario existente
  const renderStep3 = () => (
    <>
      <Title>Registro de usuario</Title>
      <Subtitle>Solicitar acceso a nuevas empresas</Subtitle>
      <InfoMessage>
        Selecciona las empresas adicionales a las que deseas tener acceso. Tu
        solicitud será revisada por nuestro equipo.
      </InfoMessage>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRequestAccess();
        }}
        style={styles.form}
      >
        <div>
          <label style={{ marginBottom: "8px", display: "block" }}>
            Empresas disponibles:
          </label>
          <CompanyList>
            {availableCompanies
              .filter((company) => company.status !== "active") // No mostrar empresas a las que ya tiene acceso
              .map((company) => (
                <CompanyItem
                  key={company.id}
                  onClick={() => handleCompanyToggle(company.id)}
                >
                  <Checkbox
                    type="checkbox"
                    checked={selectedCompanies.includes(company.id)}
                    onChange={() => {}}
                  />
                  <CompanyName>{company.name}</CompanyName>
                </CompanyItem>
              ))}
          </CompanyList>
          {error && (
            <div
              style={{
                color: theme.colors.error,
                fontSize: "0.85rem",
                marginTop: "8px",
              }}
            >
              {error}
            </div>
          )}
        </div>

        <Button
          type="submit"
          text="Solicitar acceso"
          loading={loading}
          disabled={selectedCompanies.length === 0}
        />

        <Button text="Volver" variant="outlined" onClick={() => setStep(2)} />
      </form>
    </>
  );

  // Renderizar paso 4: Confirmación
  const renderStep4 = () => (
    <>
      <Title>¡Solicitud enviada!</Title>
      <div style={{ textAlign: "center", margin: "2rem 0" }}>
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572"
            stroke={theme.colors.success}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 4L12 14.01L9 11.01"
            stroke={theme.colors.success}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p>Hemos recibido tu solicitud de acceso correctamente.</p>
        <p>Te hemos enviado un correo electrónico con más información.</p>
        <p>Nuestro equipo revisará tu solicitud y te contactará pronto.</p>
      </div>

      <Button
        text="Ir a inicio de sesión"
        onClick={() => navigate(ROUTES.AUTH.LOGIN)}
      />
    </>
  );

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <FlexBoxComponent
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      minHeight="100vh"
      padding="20px"
      style={{ overflowY: "auto" }}
    >
      <FormCard
        flexDirection="column"
        alignItems="center"
        width="auto"
        maxWidth="500px"
      >
        <StepsIndicator>
          <StepDot $active={step >= 1} />
          <StepDot $active={step >= 2} />
          <StepDot $active={step >= 3} />
          <StepDot $active={step >= 4} />
        </StepsIndicator>

        {renderCurrentStep()}
      </FormCard>
    </FlexBoxComponent>
  );
};

export default Register;
