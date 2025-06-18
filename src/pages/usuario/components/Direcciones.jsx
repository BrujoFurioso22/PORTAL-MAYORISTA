import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useAuth } from "../../../context/AuthContext";
import { useAppTheme } from "../../../context/AppThemeContext";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import RenderIcon from "../../../components/ui/RenderIcon";
import { toast } from "react-toastify";
import { FaLock, FaCheck, FaCopy } from "react-icons/fa";
import {
  addresses_createAddress,
  addresses_updateAddress,
} from "../../../services/users/addresses";
import { auth_me } from "../../../services/auth/auth";
import { useLocation } from "react-router-dom";

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`;

const CardTitle = styled.h2`
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.text};
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
  margin-top: 2px;
  gap: 16px;
`;

const AddressCard = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
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
  color: ${({ theme }) => theme.colors.text};
`;

const AddressActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px 8px;

  &:hover {
    text-decoration: underline;
    background-color: ${({ theme }) => `${theme.colors.primary}15`}33;
    border-radius: 4px;
  }
`;

const AddressDetails = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;
`;

const DefaultBadge = styled.span`
  display: inline-block;
  background-color: ${({ theme, $type }) =>
    $type === "B" ? theme.colors.info + "33" : theme.colors.success + "33"};
  color: ${({ theme, $type }) =>
    $type === "B" ? theme.colors.info : theme.colors.success};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-left: 8px;
`;

const CompanyFilter = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
`;

const CompanyFilterLabel = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
`;

const CompanyFilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;
`;

const SapBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primary + "33"};
  color: ${({ theme }) => theme.colors.primary};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-left: 8px;
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
`;

const AddressFormContainer = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

const FormTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const CheckboxField = styled.div`
  display: flex;
  align-items: center;
  margin: 16px 0;
`;

const CheckboxLabel = styled.label`
  margin-left: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
`;

const ModalOverlay = styled.div`
  display: ${({ $show }) => ($show ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const ModalBody = styled.div`
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  gap: 12px;
`;

const CompanySelect = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const CompanyOption = styled.div`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  cursor: pointer;
  text-align: center;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}15`};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TypeFilterButton = styled(Button)`
  background: ${({ theme, $active }) =>
    $active ? `${theme.colors.primary}15` : "transparent"};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.border};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textLight};
  padding: 4px 12px;
  border-radius: 4px;
  margin-right: 8px;
  cursor: pointer;
  font-size: 0.85rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme, $active }) =>
      !$active ? "rgba(33, 150, 243, 0.05)" : `${theme.colors.primary}15`};
  }
`;

const TypeBadge = styled.span`
  display: inline-block;
  background-color: ${({ theme, $type }) =>
    $type === "B" ? theme.colors.info + "33" : theme.colors.success + "33"};
  color: ${({ theme, $type }) =>
    $type === "B" ? theme.colors.info : theme.colors.success};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: 8px;
  font-weight: 500;
`;

const InfoMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.info + "15"};
  border: 1px solid ${({ theme }) => theme.colors.info + "33"};
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.info};
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const WarningMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.warning + "15"};
  border: 1px solid ${({ theme }) => theme.colors.warning + "33"};
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const Direcciones = () => {
  const { user, setUser } = useAuth();
  const { theme } = useAppTheme();
  const location = useLocation();

  // Estados para el CRUD de direcciones
  const [selectedEmpresa, setSelectedEmpresa] = useState(
    user?.EMPRESAS[0] || "MAXXIMUNDO"
  );

  const [addressForm, setAddressForm] = useState({
    ID: null,
    ACCOUNT_USER: user?.ACCOUNT_USER || "",
    CLASIFICATION: "GENERAL",
    TYPE: "S",
    COUNTRY: "EC",
    STATE: "",
    CITY: "",
    STREET: "",
    PREDETERMINED: false,
    EMPRESA: selectedEmpresa,
    ORIGIN: "USER",
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressErrors, setAddressErrors] = useState({});
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [addressToAssign, setAddressToAssign] = useState(null);
  const [addressTypeFilter, setAddressTypeFilter] = useState("all");

  // Obtener la lista de empresas disponibles
  const empresasDisponibles = useMemo(() => {
    return user && user.DIRECCIONES ? Object.keys(user.DIRECCIONES) : [];
  }, [user?.DIRECCIONES]);

  // Función para formatear el tipo de dirección
  const formatAddressType = (type) => {
    if (!type) return "";
    const trimmedType = type.trim();

    switch (trimmedType) {
      case "B":
        return "Facturación";
      case "S":
        return "Envío";
      default:
        return type;
    }
  };

  // Obtener direcciones filtradas por empresa y tipo
  const getAddressesByCompany = () => {
    if (!user || !user.DIRECCIONES) return [];

    const addresses = user.DIRECCIONES[selectedEmpresa] || [];

    const filteredByType =
      addressTypeFilter === "all"
        ? addresses
        : addresses.filter((addr) => addr.TYPE.trim() === addressTypeFilter);

    return [...filteredByType].sort((a, b) => {
      if (a.PREDETERMINED && !b.PREDETERMINED) return -1;
      if (!a.PREDETERMINED && b.PREDETERMINED) return 1;
      if (a.ORIGIN === "USER" && b.ORIGIN === "SAP") return -1;
      if (a.ORIGIN === "SAP" && b.ORIGIN === "USER") return 1;
      return a.CLASIFICATION.localeCompare(b.CLASIFICATION);
    });
  };

  const filteredAddresses = getAddressesByCompany();

  // Manejadores de eventos
  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: value.toUpperCase(),
    });

    if (addressErrors[name]) {
      setAddressErrors({
        ...addressErrors,
        [name]: null,
      });
    }
  };

  const handleAddNewAddress = () => {
    setAddressForm({
      ID: null,
      ACCOUNT_USER: user.ACCOUNT_USER || "",
      CLASIFICATION: "",
      TYPE: "S",
      COUNTRY: "EC",
      STATE: "",
      CITY: "",
      STREET: "",
      PREDETERMINED: false,
      EMPRESA: selectedEmpresa,
      ORIGIN: "USER",
    });
    setShowAddressForm(true);
    setAddressErrors({});
  };

  const validateAddressForm = () => {
    const errors = {};

    if (!addressForm.CLASIFICATION?.trim())
      errors.CLASIFICATION = "La clasificación es obligatoria";
    if (!addressForm.STREET?.trim())
      errors.STREET = "La dirección es obligatoria";
    if (!addressForm.CITY?.trim()) errors.CITY = "La ciudad es obligatoria";
    if (!addressForm.STATE?.trim())
      errors.STATE = "El estado/provincia es obligatorio";

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (addressForm.PREDETERMINED) {
      const addressType = addressForm.TYPE.trim();
      const otherAddressesOfSameType = filteredAddresses.filter(
        (addr) =>
          addr.TYPE.trim() === addressType &&
          addr.PREDETERMINED &&
          addr.ID !== null
      );

      for (const otherAddress of otherAddressesOfSameType) {
        await addresses_updateAddress(otherAddress.ID, {
          ...otherAddress,
          PREDETERMINED: false,
        });
      }
    }

    if (!validateAddressForm()) return;

    const toastId = toast.loading("Creando dirección...");

    try {
      const addressData = {
        ACCOUNT_USER: addressForm.ACCOUNT_USER,
        CLASIFICATION: addressForm.CLASIFICATION,
        TYPE: addressForm.TYPE,
        COUNTRY: addressForm.COUNTRY,
        STATE: addressForm.STATE,
        CITY: addressForm.CITY,
        STREET: addressForm.STREET,
        PREDETERMINED: addressForm.PREDETERMINED,
        ORIGIN: "USER",
        EMPRESA: selectedEmpresa,
      };

      let result = await addresses_createAddress(addressData);

      if (result.success) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const resultAuthMe = await auth_me();
          if (resultAuthMe && resultAuthMe.user) {
            setUser(resultAuthMe.user);
            toast.update(toastId, {
              render: "Dirección creada correctamente",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
            setShowAddressForm(false);
          } else {
            throw new Error("No se pudo obtener la información actualizada");
          }
        } catch (refreshError) {
          console.error("Error al actualizar datos de usuario:", refreshError);
          toast.update(toastId, {
            render:
              "La dirección se guardó pero hubo un problema al actualizar la vista. Por favor, recarga la página.",
            type: "warning",
            isLoading: false,
            autoClose: 5000,
          });
          setShowAddressForm(false);
        }
      } else {
        toast.update(toastId, {
          render: `Error: ${result.error}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Error al guardar dirección:", error);
      toast.update(toastId, {
        render: "Error al guardar la dirección. Por favor, inténtalo de nuevo.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
  };

  const handleSetDefaultAddress = async (id) => {
    const toastId = toast.loading("Actualizando dirección predeterminada...");

    try {
      const addressToUpdate = filteredAddresses.find((addr) => addr.ID === id);

      if (!addressToUpdate) {
        toast.update(toastId, {
          render: "Error: Dirección no encontrada",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      const addressType = addressToUpdate.TYPE.trim();
      const addressData = {
        ...addressToUpdate,
        PREDETERMINED: true,
      };

      const otherAddressesOfSameType = filteredAddresses.filter(
        (addr) =>
          addr.TYPE.trim() === addressType &&
          addr.PREDETERMINED &&
          addr.ID !== id
      );

      if (otherAddressesOfSameType.length > 0) {
        for (const otherAddress of otherAddressesOfSameType) {
          await addresses_updateAddress(otherAddress.ID, {
            ...otherAddress,
            PREDETERMINED: false,
          });
        }
      }

      const result = await addresses_updateAddress(id, addressData);

      if (result.success) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const resultAuthMe = await auth_me();
          if (resultAuthMe && resultAuthMe.user) {
            setUser(resultAuthMe.user);
            toast.update(toastId, {
              render: `Dirección establecida como predeterminada para ${formatAddressType(
                addressType
              )}`,
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
          } else {
            throw new Error("No se pudo obtener la información actualizada");
          }
        } catch (refreshError) {
          console.error("Error al actualizar datos de usuario:", refreshError);
          toast.update(toastId, {
            render:
              "La dirección se actualizó pero hubo un problema al actualizar la vista. Por favor, recarga la página.",
            type: "warning",
            isLoading: false,
            autoClose: 5000,
          });
        }
      } else {
        toast.update(toastId, {
          render: `Error: ${result.error}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Error al actualizar dirección predeterminada:", error);
      toast.update(toastId, {
        render: "Error al actualizar. Por favor, inténtalo de nuevo.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const handleAssignToCompany = (empresaId) => {
    if (!addressToAssign || !empresaId) return;

    const newAddress = {
      ...addressToAssign,
      ID: Date.now(),
      EMPRESA: empresaId,
      PREDETERMINED: false,
    };

    let updatedDirections = { ...user.DIRECCIONES };

    if (!updatedDirections[empresaId]) {
      updatedDirections[empresaId] = [];
    }

    updatedDirections[empresaId].push(newAddress);

    const updatedUser = {
      ...user,
      DIRECCIONES: updatedDirections,
    };

    setShowAssignModal(false);
    toast.success(`Dirección asignada a la empresa seleccionada`);
  };

  // Efectos
  useEffect(() => {
    if (location.state) {
      const { openAddressForm, addressType, empresa } = location.state;

      if (openAddressForm) {
        if (empresa && empresasDisponibles.includes(empresa)) {
          setSelectedEmpresa(empresa);
        }

        setTimeout(() => {
          setAddressForm({
            ID: null,
            ACCOUNT_USER: user.ACCOUNT_USER || "",
            CLASIFICATION: "",
            TYPE: addressType || "S",
            COUNTRY: "EC",
            STATE: "",
            CITY: "",
            STREET: "",
            PREDETERMINED: false,
            EMPRESA: empresa || selectedEmpresa,
            ORIGIN: "USER",
          });

          setShowAddressForm(true);
          setAddressErrors({});
        }, 0);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user, empresasDisponibles, selectedEmpresa]);

  // Modal de asignación de direcciones
  const AssignAddressModal = () => (
    <ModalOverlay $show={showAssignModal}>
      <Modal>
        <ModalHeader>
          <ModalTitle>Asignar dirección a otra empresa</ModalTitle>
          <RenderIcon
            name="FaTimes"
            onClick={() => setShowAssignModal(false)}
          />
        </ModalHeader>
        <ModalBody>
          <p>Selecciona la empresa a la que deseas asignar esta dirección:</p>
          <p>
            <strong>{addressToAssign?.CLASIFICATION}</strong> -{" "}
            {addressToAssign?.STREET}
          </p>

          <CompanySelect>
            {empresasDisponibles
              .filter((empresa) => empresa !== selectedEmpresa)
              .map((empresa, idx) => (
                <CompanyOption
                  key={idx}
                  onClick={() => handleAssignToCompany(empresa)}
                >
                  {empresa}
                </CompanyOption>
              ))}
          </CompanySelect>
        </ModalBody>
        <ModalFooter>
          <Button
            text="Cancelar"
            variant="outlined"
            onClick={() => setShowAssignModal(false)}
          />
        </ModalFooter>
      </Modal>
    </ModalOverlay>
  );

  return (
    <>
      <Card>
        <CardTitle>Mis direcciones</CardTitle>
        <InfoMessage>
          <div>
            <strong>Gestión de prioridades:</strong> Puedes establecer una
            dirección de envio como
            <strong> predeterminada</strong> y otra de facturación como{" "}
            <strong> predeterminada</strong>. Estas serán utilizadas para los
            pedidos que realices.
          </div>
        </InfoMessage>

        {/* Selector de empresa para filtrar direcciones */}
        <div
          style={{
            display: "flex",
            flexDirection: showAddressForm ? "column" : "row",
            justifyContent: "space-between",
            alignItems: "stretch",
            marginBottom: "10px",
          }}
        >
          <CompanyFilter>
            <CompanyFilterLabel>Ver direcciones para:</CompanyFilterLabel>
            <Select
              value={selectedEmpresa}
              onChange={(e) =>
                setSelectedEmpresa(e && e.target ? e.target.value : e)
              }
              name="EMPRESA"
              options={empresasDisponibles.map((empresa) => ({
                value: empresa,
                label: empresa,
              }))}
            />
          </CompanyFilter>

          {/* Formulario para agregar/editar dirección */}
          {showAddressForm ? (
            <>
              <AddressFormContainer>
                <FormTitle>
                  {`Nueva dirección para ${selectedEmpresa}`}
                </FormTitle>
                <InfoMessage>
                  <RenderIcon name="FaInfoCircle" size={16} />
                  <div>
                    <strong>Importante:</strong>
                    <br />
                    Tu dirección será enviada para ser agregada a nuestro
                    sistema. Toma en cuenta que esta dirección no será editable,
                    así que asegúrate de que la información sea correcta antes
                    de guardar.
                  </div>
                </InfoMessage>

                <Form onSubmit={handleSaveAddress}>
                  <FormGroup>
                    <FormField>
                      <Select
                        value={addressForm.TYPE}
                        label={"Tipo de dirección"}
                        onChange={handleAddressFormChange}
                        name="TYPE"
                        width="100%"
                        options={[{ value: "S", label: "ENVIO" }]}
                      />
                    </FormField>
                    <FormField>
                      <Input
                        label="Dirección completa"
                        name="STREET"
                        value={addressForm.STREET}
                        onChange={handleAddressFormChange}
                        error={addressErrors.STREET}
                        placeholder="CALLE, NÚMERO, REFERENCIA"
                        required
                      />
                    </FormField>
                  </FormGroup>

                  <FormGroup>
                    <FormField>
                      <Input
                        label="Ciudad"
                        name="CITY"
                        value={addressForm.CITY}
                        onChange={handleAddressFormChange}
                        error={addressErrors.CITY}
                        placeholder="CIUDAD"
                        required
                      />
                    </FormField>
                    <FormField>
                      <Input
                        label="Estado/Provincia"
                        name="STATE"
                        value={addressForm.STATE}
                        onChange={handleAddressFormChange}
                        error={addressErrors.STATE}
                        placeholder="PROVINCIA"
                        required
                      />
                    </FormField>
                  </FormGroup>

                  <FormActions>
                    <Button
                      text="Cancelar"
                      variant="outlined"
                      type="button"
                      onClick={handleCancelAddressForm}
                    />
                    <Button
                      text={"Guardar dirección"}
                      variant="solid"
                      type="submit"
                      backgroundColor={theme.colors.primary}
                    />
                  </FormActions>
                </Form>
              </AddressFormContainer>
              <span
                style={{
                  height: "1px",
                  width: "100%",
                  display: "block",
                  marginTop: "16px",
                  marginBottom: "8px",
                  backgroundColor: theme.colors.border,
                }}
              />
            </>
          ) : (
            <Button
              text="Agregar nueva dirección"
              variant="outlined"
              size="small"
              leftIconName={"FaPlus"}
              onClick={handleAddNewAddress}
            />
          )}
        </div>

        {/* Selector de tipo de dirección */}
        <div style={{ marginBottom: "16px", marginLeft: "12px" }}>
          <span
            style={{
              marginRight: "12px",
              fontSize: "0.9rem",
              color: theme.colors.textLight,
            }}
          >
            Filtrar por tipo:
          </span>
          <TypeFilterButton
            $active={addressTypeFilter === "all"}
            onClick={() => setAddressTypeFilter("all")}
            text="Todas"
          />
          <TypeFilterButton
            $active={addressTypeFilter === "B"}
            onClick={() => setAddressTypeFilter("B")}
            text="Facturación "
          />
          <TypeFilterButton
            $active={addressTypeFilter === "S"}
            onClick={() => setAddressTypeFilter("S")}
            text="Envío"
          />
        </div>

        {filteredAddresses.length > 0 ? (
          filteredAddresses.map((address) => (
            <AddressCard key={address.ID}>
              <AddressCardHeader>
                <AddressName>
                  {address.CLASIFICATION}
                  {address.PREDETERMINED && (
                    <DefaultBadge $type={address.TYPE.trim()}>
                      Predeterminada {formatAddressType(address.TYPE)}
                    </DefaultBadge>
                  )}
                  {!address.PREDETERMINED && (
                    <TypeBadge $type={address.TYPE.trim()}>
                      {formatAddressType(address.TYPE)}
                    </TypeBadge>
                  )}
                  {address.ORIGIN === "SAP" && (
                    <SapBadge>
                      <FaLock size={10} style={{ marginRight: "4px" }} />
                      Sistema
                    </SapBadge>
                  )}
                </AddressName>
                <AddressActions>
                  {!address.PREDETERMINED && (
                    <ActionButton
                      onClick={() => handleSetDefaultAddress(address.ID)}
                      size="small"
                      leftIconName="FaCheck"
                      text="Establecer predeterminada"
                    />
                  )}

                  {address.ORIGIN === "SAP" && (
                    <ActionButton
                      onClick={() =>
                        toast.info(
                          "Para modificar esta dirección, contacta a soporte."
                        )
                      }
                      size="small"
                      leftIconName="FaLock"
                      text="Sincronizada con sistema"
                    />
                  )}
                </AddressActions>
              </AddressCardHeader>

              <AddressDetails>
                {address.STREET}
                <br />
                {address.CITY}, {address.STATE}
                {address.COUNTRY !== "EC" && <>, {address.COUNTRY}</>}
              </AddressDetails>
            </AddressCard>
          ))
        ) : (
          <EmptyState>
            No tienes direcciones guardadas para esta empresa.
          </EmptyState>
        )}
      </Card>

      {/* Modal para asignar dirección a otra empresa */}
      <AssignAddressModal />
    </>
  );
};

export default Direcciones;
