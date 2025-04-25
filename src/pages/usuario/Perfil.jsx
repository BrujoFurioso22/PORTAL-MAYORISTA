import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../context/AppThemeContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { toast } from "react-toastify";

// Estilos para el componente
const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${(props) => props.theme.colors.background};
`;

const PageTitle = styled.h1`
  margin: 0 0 24px 0;
  color: ${(props) => props.theme.colors.text};
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  margin-bottom: 24px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const TabButton = styled.button`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${(props) => (props.active ? props.theme.colors.primary : "transparent")};
  color: ${(props) =>
    props.active ? props.theme.colors.primary : props.theme.colors.textLight};
  font-weight: ${(props) => (props.active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const TabContent = styled.div`
  display: ${(props) => (props.active ? "block" : "none")};
`;

const Card = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px ${(props) => props.theme.colors.shadow};
`;

const CardTitle = styled.h2`
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 24px;
  color: ${(props) => props.theme.colors.text};
`;

const ProfileSection = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Avatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 16px;
  border: 3px solid ${(props) => props.theme.colors.primary};
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarActions = styled.div`
  display: flex;
  gap: 8px;
`;

const FormSection = styled.div`
  flex: 1;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const FormField = styled.div`
  flex: 1;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 16px;
`;

const PreferenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const PreferenceText = styled.div``;

const PreferenceTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.text};
`;

const PreferenceDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textLight};
`;

const AddressCard = styled.div`
  padding: 16px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  margin-bottom: 16px;
  position: relative;
`;

const AddressCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const AddressName = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.text};
`;

const AddressActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.primary};
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const AddressDetails = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.text};
  line-height: 1.5;
`;

const DefaultBadge = styled.span`
  display: inline-block;
  background-color: ${(props) => props.theme.colors.success + "33"};
  color: ${(props) => props.theme.colors.success};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-left: 8px;
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
`;

const SwitchInput = styled.input.attrs({ type: "checkbox" })`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${(props) => props.theme.colors.primary};
  }

  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(props) => props.theme.colors.border};
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

// Componente Principal
const Perfil = () => {
  const { user, updateUserInfo, changePassword } = useAuth();
  const { theme, toggleTheme } = useAppTheme();
  const [activeTab, setActiveTab] = useState("personal");

  // Estados para formularios
  const [personalInfo, setPersonalInfo] = useState({
    nombre: user?.NOMBRE_USUARIO || "",
    email: user?.EMAIL || "",
    telefono: "",
    empresa: "",
    rfc: "",
  });

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [settings, setSettings] = useState({
    receiveEmails: true,
    receiveNotifications: true,
    darkMode: theme.mode === "dark",
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "Oficina Principal",
      street: "Av. Insurgentes Sur 1235",
      colony: "Col. Extremadura Insurgentes",
      city: "Ciudad de México",
      state: "CDMX",
      postalCode: "03740",
      isDefault: true,
    },
    {
      id: 2,
      name: "Bodega",
      street: "Calle Industrial 56",
      colony: "Zona Industrial",
      city: "Toluca",
      state: "Estado de México",
      postalCode: "50071",
      isDefault: false,
    },
  ]);

  // Manejadores de cambios
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({
      ...personalInfo,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordInfo({
      ...passwordInfo,
      [name]: value,
    });
  };

  // Manejadores de envío de formularios
  const handlePersonalInfoSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para actualizar información personal
    toast.success("Información personal actualizada correctamente");
    console.log("Personal info updated:", personalInfo);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // Validación simple
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (passwordInfo.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Aquí iría la lógica para cambiar la contraseña
    toast.success("Contraseña actualizada correctamente");
    console.log("Password changed");

    // Limpiar el formulario
    setPasswordInfo({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSettingChange = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });

    // Si es el modo oscuro, aplicar el cambio inmediatamente
    if (setting === "darkMode") {
      toggleTheme();
    }
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(
      addresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      }))
    );
    toast.success("Dirección predeterminada actualizada");
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta dirección?")) {
      const filteredAddresses = addresses.filter(
        (address) => address.id !== id
      );
      setAddresses(filteredAddresses);
      toast.success("Dirección eliminada correctamente");
    }
  };

  return (
    <PageContainer>
      <PageTitle>Mi Perfil</PageTitle>

      <TabsContainer>
        <TabButton
          active={activeTab === "personal"}
          onClick={() => setActiveTab("personal")}
        >
          Información Personal
        </TabButton>
        <TabButton
          active={activeTab === "security"}
          onClick={() => setActiveTab("security")}
        >
          Seguridad
        </TabButton>
        <TabButton
          active={activeTab === "addresses"}
          onClick={() => setActiveTab("addresses")}
        >
          Direcciones
        </TabButton>
        <TabButton
          active={activeTab === "preferences"}
          onClick={() => setActiveTab("preferences")}
        >
          Preferencias
        </TabButton>
      </TabsContainer>

      {/* Tab: Información Personal */}
      <TabContent active={activeTab === "personal"}>
        <Card>
          <CardTitle>Información Personal</CardTitle>

          <ProfileSection>
            <AvatarSection>
              <Avatar>
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${personalInfo.nombre}&background=random&size=150`}
                  alt="Avatar"
                />
              </Avatar>
              <AvatarActions>
                <Button text="Cambiar foto" variant="outlined" size="small" />
              </AvatarActions>
            </AvatarSection>

            <FormSection>
              <Form onSubmit={handlePersonalInfoSubmit}>
                <FormGroup>
                  <FormField>
                    <Input
                      label="Nombre completo"
                      name="nombre"
                      value={personalInfo.nombre}
                      onChange={handlePersonalInfoChange}
                      required
                    />
                  </FormField>
                  <FormField>
                    <Input
                      label="Correo electrónico"
                      name="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      leftIconName="Mail"
                      required
                    />
                  </FormField>
                </FormGroup>

                <FormGroup>
                  <FormField>
                    <Input
                      label="Teléfono"
                      name="telefono"
                      value={personalInfo.telefono}
                      onChange={handlePersonalInfoChange}
                      leftIconName="Phone"
                    />
                  </FormField>
                  <FormField>
                    <Input
                      label="Empresa"
                      name="empresa"
                      value={personalInfo.empresa}
                      onChange={handlePersonalInfoChange}
                      leftIconName="Building"
                    />
                  </FormField>
                </FormGroup>

                <FormField>
                  <Input
                    label="RFC"
                    name="rfc"
                    value={personalInfo.rfc}
                    onChange={handlePersonalInfoChange}
                    placeholder="Ejemplo: XAXX010101000"
                  />
                </FormField>

                <FormActions>
                  <Button text="Cancelar" variant="outlined" />
                  <Button
                    text="Guardar cambios"
                    variant="solid"
                    type="submit"
                    backgroundColor={theme.colors.primary}
                  />
                </FormActions>
              </Form>
            </FormSection>
          </ProfileSection>
        </Card>
      </TabContent>

      {/* Tab: Seguridad */}
      <TabContent active={activeTab === "security"}>
        <Card>
          <CardTitle>Cambiar Contraseña</CardTitle>

          <Form onSubmit={handlePasswordSubmit}>
            <FormField>
              <Input
                label="Contraseña actual"
                name="currentPassword"
                type="password"
                value={passwordInfo.currentPassword}
                onChange={handlePasswordChange}
                leftIconName="Lock"
                required
              />
            </FormField>

            <FormGroup>
              <FormField>
                <Input
                  label="Nueva contraseña"
                  name="newPassword"
                  type="password"
                  value={passwordInfo.newPassword}
                  onChange={handlePasswordChange}
                  leftIconName="Lock"
                  required
                />
              </FormField>
              <FormField>
                <Input
                  label="Confirmar nueva contraseña"
                  name="confirmPassword"
                  type="password"
                  value={passwordInfo.confirmPassword}
                  onChange={handlePasswordChange}
                  leftIconName="Lock"
                  required
                />
              </FormField>
            </FormGroup>

            <FormActions>
              <Button text="Cancelar" variant="outlined" />
              <Button
                text="Actualizar contraseña"
                variant="solid"
                type="submit"
                backgroundColor={theme.colors.primary}
              />
            </FormActions>
          </Form>
        </Card>

        <Card>
          <CardTitle>Sesiones activas</CardTitle>

          <PreferenceItem>
            <PreferenceText>
              <PreferenceTitle>Chrome en Windows</PreferenceTitle>
              <PreferenceDescription>
                Ciudad de México, México · Activo ahora
              </PreferenceDescription>
            </PreferenceText>
            <Button
              text="Este dispositivo"
              variant="outlined"
              size="small"
              disabled
            />
          </PreferenceItem>

          <PreferenceItem>
            <PreferenceText>
              <PreferenceTitle>Safari en iPhone</PreferenceTitle>
              <PreferenceDescription>
                Ciudad de México, México · Hace 2 días
              </PreferenceDescription>
            </PreferenceText>
            <Button text="Cerrar sesión" variant="outlined" size="small" />
          </PreferenceItem>
        </Card>
      </TabContent>

      {/* Tab: Direcciones */}
      <TabContent active={activeTab === "addresses"}>
        <Card>
          <CardTitle>Mis direcciones</CardTitle>

          {addresses.map((address) => (
            <AddressCard key={address.id}>
              <AddressCardHeader>
                <AddressName>
                  {address.name}
                  {address.isDefault && (
                    <DefaultBadge>Predeterminada</DefaultBadge>
                  )}
                </AddressName>
                <AddressActions>
                  <ActionButton
                    onClick={() => handleSetDefaultAddress(address.id)}
                  >
                    {address.isDefault ? "" : "Establecer como predeterminada"}
                  </ActionButton>
                  <ActionButton onClick={() => handleDeleteAddress(address.id)}>
                    Eliminar
                  </ActionButton>
                </AddressActions>
              </AddressCardHeader>

              <AddressDetails>
                {address.street}
                <br />
                {address.colony}
                <br />
                {address.city}, {address.state} C.P. {address.postalCode}
              </AddressDetails>
            </AddressCard>
          ))}

          <Button
            text="Agregar nueva dirección"
            variant="outlined"
            leftIconName="Plus"
          />
        </Card>
      </TabContent>

      {/* Tab: Preferencias */}
      <TabContent active={activeTab === "preferences"}>
        <Card>
          <CardTitle>Notificaciones</CardTitle>

          <PreferenceItem>
            <PreferenceText>
              <PreferenceTitle>Correos electrónicos</PreferenceTitle>
              <PreferenceDescription>
                Recibe actualizaciones, ofertas y noticias por correo
              </PreferenceDescription>
            </PreferenceText>
            <Switch>
              <SwitchInput
                checked={settings.receiveEmails}
                onChange={() => handleSettingChange("receiveEmails")}
              />
              <Slider />
            </Switch>
          </PreferenceItem>

          <PreferenceItem>
            <PreferenceText>
              <PreferenceTitle>Notificaciones push</PreferenceTitle>
              <PreferenceDescription>
                Recibe alertas importantes en tu navegador
              </PreferenceDescription>
            </PreferenceText>
            <Switch>
              <SwitchInput
                checked={settings.receiveNotifications}
                onChange={() => handleSettingChange("receiveNotifications")}
              />
              <Slider />
            </Switch>
          </PreferenceItem>
        </Card>

        <Card>
          <CardTitle>Apariencia</CardTitle>

          <PreferenceItem>
            <PreferenceText>
              <PreferenceTitle>Modo oscuro</PreferenceTitle>
              <PreferenceDescription>
                Cambia la apariencia de la interfaz
              </PreferenceDescription>
            </PreferenceText>
            <Switch>
              <SwitchInput
                checked={settings.darkMode}
                onChange={() => handleSettingChange("darkMode")}
              />
              <Slider />
            </Switch>
          </PreferenceItem>
        </Card>
      </TabContent>
    </PageContainer>
  );
};

export default Perfil;
