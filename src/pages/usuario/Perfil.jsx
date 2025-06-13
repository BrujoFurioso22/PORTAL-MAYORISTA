import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../context/AppThemeContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaLock,
  FaCheck,
  FaCopy,
} from "react-icons/fa";
import {
  addresses_createAddress,
  addresses_deleteAddress,
  addresses_updateAddress,
} from "../../services/users/addresses";
import { auth_me } from "../../services/auth/auth";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "../../components/ui/Select";
import RenderIcon from "../../components/ui/RenderIcon";

// Estilos para el componente
const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
`;

const PageTitle = styled.h1`
  margin: 0 0 24px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 24px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const TabButton = styled(Button)`
  padding: 12px 24px;
  background: none;
  border: none;
  border-radius: 0;
  border-bottom: 2px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : "transparent")};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textLight};
  font-weight: ${({ theme, $active }) => ($active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TabContent = styled.div`
  display: ${({ $active }) => ($active ? "block" : "none")};
`;

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
  border: 3px solid ${({ theme }) => theme.colors.primary};
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
  margin-top: 2px;
  gap: 16px;
`;

const PreferenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const PreferenceText = styled.div``;

const PreferenceTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const PreferenceDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
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
    background-color: ${({ theme }) => theme.colors.primary};
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
  background-color: ${({ theme }) => theme.colors.border};
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

// Nuevo componente para mostrar empresas disponibles
const EmpresasList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.98rem;
`;

// Estilos para el filtro de empresas
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

// Estilos para SAP Badge
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

// Estilos para el estado vacío
const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
`;

// Estilos para el formulario de dirección
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

// Estilos para el checkbox
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

// Estilos para el modal
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

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textLight};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
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

// Añade esta definición justo después de CompanyFilterSelect o junto a los demás styled-components
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

// También falta la definición del badge de tipo que se usa en los address cards
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

// También parece que falta la función formatAddressType
// Agrega esta función dentro del componente Perfil
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

// Componente Principal
const Perfil = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useAppTheme();
  const [activeTab, setActiveTab] = useState("personal");

  // Estados para formularios
  const [personalInfo, setPersonalInfo] = useState({
    nombre: user?.NAME_USER || "",
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

  // Nuevos estados para manejar el CRUD
  // Estado para la empresa seleccionada actualmente para filtrar direcciones
  const [selectedEmpresa, setSelectedEmpresa] = useState(
    user?.EMPRESAS[0] || "MAXXIMUNDO"
  );

  // Estado para el formulario de dirección con la nueva estructura
  const [addressForm, setAddressForm] = useState({
    ID: null,
    ACCOUNT_USER: user.ACCOUNT_USER || "",
    CLASIFICATION: "GENERAL",
    TYPE: "S",
    COUNTRY: "EC",
    STATE: "",
    CITY: "",
    STREET: "",
    PREDETERMINED: false,
    EMPRESA: selectedEmpresa, // Ahora usamos directamente el nombre
    ORIGIN: "USER",
  });

  // Estado para controlar si el formulario está visible
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Estado para manejar errores de validación
  const [addressErrors, setAddressErrors] = useState({});

  // Estado para controlar si estamos editando o creando una dirección
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Estado para el modal de asignación de empresas
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [addressToAssign, setAddressToAssign] = useState(null);

  // Estado para filtrar por tipo de dirección
  const [addressTypeFilter, setAddressTypeFilter] = useState("all"); // "all", "B", "S"

  const { setUser } = useAuth();

  // Obtener la lista de empresas disponibles (solo nombres)
  const empresasDisponibles = useMemo(() => {
    return user && user.DIRECCIONES ? Object.keys(user.DIRECCIONES) : [];
  }, [user?.DIRECCIONES]);

  // Usamos useEffect para cargar las direcciones al iniciar o cuando cambie el usuario
  useEffect(() => {
    // Si el usuario tiene direcciones, las cargamos
    if (user && user.DIRECCIONES) {
      console.log("Direcciones cargadas del usuario:", user.DIRECCIONES);
    }
  }, [user]);

  // Versión extendida con más criterios de ordenamiento
  const getAddressesByCompany = () => {
    if (!user || !user.DIRECCIONES) return [];

    // Obtenemos las direcciones de la empresa seleccionada
    const addresses = user.DIRECCIONES[selectedEmpresa] || [];

    // Filtramos por tipo si es necesario
    const filteredByType =
      addressTypeFilter === "all"
        ? addresses
        : addresses.filter((addr) => addr.TYPE.trim() === addressTypeFilter);

    // Ordenamos con múltiples criterios
    return [...filteredByType].sort((a, b) => {
      // Criterio 1: Dirección predeterminada primero
      if (a.PREDETERMINED && !b.PREDETERMINED) return -1;
      if (!a.PREDETERMINED && b.PREDETERMINED) return 1;

      // Criterio 2: Origen (USER antes que SAP)
      if (a.ORIGIN === "USER" && b.ORIGIN === "SAP") return -1;
      if (a.ORIGIN === "SAP" && b.ORIGIN === "USER") return 1;

      // Criterio 3: Por clasificación alfabéticamente
      return a.CLASIFICATION.localeCompare(b.CLASIFICATION);
    });
  };

  // Obtenemos las direcciones filtradas por la empresa actual
  const filteredAddresses = getAddressesByCompany();

  // Función para obtener todas las direcciones (aplanadas)
  const getAllAddresses = () => {
    if (!user || !user.DIRECCIONES) return [];

    // Aplanamos todas las direcciones en un solo array
    return Object.values(user.DIRECCIONES).flat();
  };

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

  // Función para manejar cambios en el formulario
  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: type === "checkbox" ? checked : value,
    });

    // Limpiar error al cambiar un campo
    if (addressErrors[name]) {
      setAddressErrors({
        ...addressErrors,
        [name]: null,
      });
    }
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

  // Función para iniciar la edición de una dirección
  const handleEditAddress = (address) => {
    if (address.ORIGIN === "SAP") {
      toast.warning(
        "No puedes editar una dirección sincronizada con SAP. Contacta a soporte para solicitar cambios."
      );
      return;
    }

    // Adaptamos la dirección al formato del formulario
    setAddressForm({
      ...address,
    });

    setIsEditingAddress(true);
    setShowAddressForm(true);
    setAddressErrors({});
  };

  // Función para iniciar la creación de una nueva dirección
  const handleAddNewAddress = () => {
    console.log(user);

    setAddressForm({
      ID: null,
      ACCOUNT_USER: user.ACCOUNT_USER || "",
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
    setIsEditingAddress(false);
    setShowAddressForm(true);
    setAddressErrors({});
  };

  // Actualizar la función handleSaveAddress para usar las nuevas funciones de API
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (addressForm.PREDETERMINED) {
      // Si estamos marcando como predeterminada, desmarcar cualquier otra dirección del mismo tipo
      const addressType = addressForm.TYPE.trim();
      const otherAddressesOfSameType = filteredAddresses.filter(
        (addr) =>
          addr.TYPE.trim() === addressType &&
          addr.PREDETERMINED &&
          addr.ID !== (isEditingAddress ? addressForm.ID : null)
      );

      // Desmarcar otras direcciones predeterminadas del mismo tipo
      for (const otherAddress of otherAddressesOfSameType) {
        await addresses_updateAddress(otherAddress.ID, {
          ...otherAddress,
          PREDETERMINED: false,
        });
      }
    }

    if (!validateAddressForm()) return;

    // Mostrar indicador de carga
    const toastId = toast.loading(
      isEditingAddress ? "Actualizando dirección..." : "Creando dirección..."
    );

    try {
      // Preparar los datos para la API
      const addressData = {
        ACCOUNT_USER: addressForm.ACCOUNT_USER,
        CLASIFICATION: addressForm.CLASIFICATION,
        TYPE: addressForm.TYPE,
        COUNTRY: addressForm.COUNTRY,
        STATE: addressForm.STATE,
        CITY: addressForm.CITY,
        STREET: addressForm.STREET,
        PREDETERMINED: addressForm.PREDETERMINED,
        ORIGIN: "USER", // Las direcciones creadas por el usuario siempre tendrán origen USER
        EMPRESA: selectedEmpresa,
      };

      let result;

      if (isEditingAddress) {
        // Llamar a la API para actualizar
        result = await addresses_updateAddress(addressForm.ID, addressData);
        const resultAuthMe = await auth_me();
        const resultUsuario = resultAuthMe.user;
        setUser(resultUsuario);
        console.log(resultAuthMe.user.DIRECCIONES);
      } else {
        // Llamar a la API para crear
        result = await addresses_createAddress(addressData);
        const resultAuthMe = await auth_me();
        const resultUsuario = resultAuthMe.user;
        setUser(resultUsuario);
        console.log(resultAuthMe.user.DIRECCIONES);
      }

      if (result.success) {
        // Actualizar el usuario completo mediante auth_me
        try {
          // Pequeña pausa para dar tiempo a que la BD se actualice
          await new Promise((resolve) => setTimeout(resolve, 300));

          const resultAuthMe = await auth_me();
          if (resultAuthMe && resultAuthMe.user) {
            // Actualizar el usuario en el contexto
            setUser(resultAuthMe.user);

            toast.update(toastId, {
              render: isEditingAddress
                ? "Dirección actualizada correctamente"
                : "Dirección creada correctamente",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });

            // Cerrar el formulario
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

  // Función para cancelar la edición/creación
  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
  };

  // Función para validar el formulario
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

  // Función para establecer una dirección como predeterminada
  const handleSetDefaultAddress = async (id) => {
    // Mostrar indicador de carga
    const toastId = toast.loading("Actualizando dirección predeterminada...");

    try {
      // Obtener la dirección que queremos establecer como predeterminada
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

      // Obtener el tipo de dirección (B o S)
      const addressType = addressToUpdate.TYPE.trim();

      // Preparar los datos para la API - CORREGIDO AQUÍ, debe ser TRUE
      const addressData = {
        ...addressToUpdate,
        PREDETERMINED: true, // Corregido, ahora es true
      };

      // Primero desmarcar cualquier otra dirección del mismo tipo como predeterminada
      const otherAddressesOfSameType = filteredAddresses.filter(
        (addr) =>
          addr.TYPE.trim() === addressType &&
          addr.PREDETERMINED &&
          addr.ID !== id
      );

      // Si hay otras direcciones predeterminadas del mismo tipo, desmarcarlas
      if (otherAddressesOfSameType.length > 0) {
        for (const otherAddress of otherAddressesOfSameType) {
          await addresses_updateAddress(otherAddress.ID, {
            ...otherAddress,
            PREDETERMINED: false,
          });
        }
      }

      // Ahora marcar la dirección seleccionada como predeterminada
      const result = await addresses_updateAddress(id, addressData);

      if (result.success) {
        // Actualizar el usuario completo mediante auth_me
        try {
          // Pequeña pausa para dar tiempo a que la BD se actualice
          await new Promise((resolve) => setTimeout(resolve, 300));

          const resultAuthMe = await auth_me();
          if (resultAuthMe && resultAuthMe.user) {
            // Actualizar el usuario en el contexto
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

  // Función para eliminar una dirección
  const handleDeleteAddress = async (id) => {
    const addressToDelete = filteredAddresses.find((addr) => addr.ID === id);

    if (addressToDelete.ORIGIN === "SAP") {
      toast.warning(
        "No puedes eliminar una dirección sincronizada con SAP. Contacta a soporte para solicitar cambios."
      );
      return;
    }

    if (window.confirm("¿Estás seguro de eliminar esta dirección?")) {
      // Mostrar indicador de carga
      const toastId = toast.loading("Eliminando dirección...");

      try {
        // Llamar a la API para eliminar
        const response = await addresses_deleteAddress(id);

        if (response.status === 200) {
          // Actualizar el usuario completo mediante auth_me
          try {
            // Pequeña pausa para dar tiempo a que la BD se actualice
            await new Promise((resolve) => setTimeout(resolve, 300));

            const resultAuthMe = await auth_me();
            if (resultAuthMe && resultAuthMe.user) {
              // Actualizar el usuario en el contexto
              setUser(resultAuthMe.user);

              toast.update(toastId, {
                render: "Dirección eliminada correctamente",
                type: "success",
                isLoading: false,
                autoClose: 3000,
              });
            } else {
              throw new Error("No se pudo obtener la información actualizada");
            }
          } catch (refreshError) {
            console.error(
              "Error al actualizar datos de usuario:",
              refreshError
            );
            toast.update(toastId, {
              render:
                "La dirección se eliminó pero hubo un problema al actualizar la vista. Por favor, recarga la página.",
              type: "warning",
              isLoading: false,
              autoClose: 5000,
            });
          }
        } else {
          toast.update(toastId, {
            render: "Error al eliminar la dirección",
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      } catch (error) {
        console.error("Error al eliminar dirección:", error);
        toast.update(toastId, {
          render:
            "Error al eliminar la dirección. Por favor, inténtalo de nuevo.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    }
  };

  // Función para abrir el modal de asignación de dirección a otra empresa
  const handleOpenAssignModal = (address) => {
    setAddressToAssign({ ...address });
    setShowAssignModal(true);
  };

  // Función para asignar una dirección a otra empresa
  const handleAssignToCompany = (empresaId) => {
    if (!addressToAssign || !empresaId) return;

    // Crear una copia de la dirección para la nueva empresa
    const newAddress = {
      ...addressToAssign,
      ID: Date.now(), // Nueva ID
      EMPRESA: empresaId,
      PREDETERMINED: false, // No será predeterminada en la nueva empresa
    };

    // Simulamos la actualización
    let updatedDirections = { ...user.DIRECCIONES };

    // Aseguramos que existe el array para la empresa destino
    if (!updatedDirections[empresaId]) {
      updatedDirections[empresaId] = [];
    }

    // Agregamos la dirección a la nueva empresa
    updatedDirections[empresaId].push(newAddress);

    // Actualizamos el estado local
    const updatedUser = {
      ...user,
      DIRECCIONES: updatedDirections,
    };
    // updateUser(updatedUser);

    setShowAssignModal(false);
    toast.success(`Dirección asignada a la empresa seleccionada`);
  };

  // JSX para el Tab de Direcciones
  const renderAddressesTab = () => {
    return (
      <TabContent $active={activeTab === "addresses"}>
        <Card>
          <CardTitle>Mis direcciones</CardTitle>

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
              <CompanyFilterSelect
                value={selectedEmpresa}
                onChange={(e) => setSelectedEmpresa(e.target.value)}
              >
                {empresasDisponibles.map((empresa, idx) => (
                  <option key={idx} value={empresa}>
                    {empresa}
                  </option>
                ))}
              </CompanyFilterSelect>
            </CompanyFilter>
            {/* Formulario para agregar/editar dirección */}
            {showAddressForm ? (
              <>
                <AddressFormContainer>
                  <FormTitle>
                    {isEditingAddress
                      ? `Editar dirección para ${selectedEmpresa}`
                      : `Nueva dirección para ${selectedEmpresa}`}
                  </FormTitle>
                  <Form onSubmit={handleSaveAddress}>
                    <FormGroup>
                      <FormField>
                        <Input
                          label="Clasificación de la dirección"
                          name="CLASIFICATION"
                          value={addressForm.CLASIFICATION}
                          onChange={handleAddressFormChange}
                          error={addressErrors.CLASIFICATION}
                          placeholder="Ej: Casa, Oficina, Almacén"
                          required
                        />
                      </FormField>
                      <FormField>
                        <Select
                          value={addressForm.TYPE}
                          label={"Tipo de dirección"}
                          onChange={handleAddressFormChange}
                          name="TYPE"
                          options={[
                            { value: "B", label: "Facturación" },
                            { value: "S", label: "Envío" },
                          ]}
                        />
                      </FormField>
                    </FormGroup>

                    <FormField>
                      <Input
                        label="Dirección completa"
                        name="STREET"
                        value={addressForm.STREET}
                        onChange={handleAddressFormChange}
                        error={addressErrors.STREET}
                        placeholder="Calle, número, referencias"
                        required
                      />
                    </FormField>

                    <FormGroup>
                      <FormField>
                        <Input
                          label="Ciudad"
                          name="CITY"
                          value={addressForm.CITY}
                          onChange={handleAddressFormChange}
                          error={addressErrors.CITY}
                          placeholder="Ciudad"
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
                          placeholder="Estado o provincia"
                          required
                        />
                      </FormField>
                    </FormGroup>

                    <CheckboxField>
                      <input
                        type="checkbox"
                        id="isPredetermined"
                        name="PREDETERMINED"
                        checked={addressForm.PREDETERMINED}
                        onChange={(e) => {
                          setAddressForm({
                            ...addressForm,
                            PREDETERMINED: e.target.checked,
                          });
                        }}
                      />
                      <CheckboxLabel htmlFor="isPredetermined">
                        Establecer como dirección predeterminada para{" "}
                        {selectedEmpresa}
                      </CheckboxLabel>
                    </CheckboxField>

                    <FormActions>
                      <Button
                        text="Cancelar"
                        variant="outlined"
                        type="button"
                        onClick={handleCancelAddressForm}
                      />
                      <Button
                        text={
                          isEditingAddress
                            ? "Guardar cambios"
                            : "Guardar dirección"
                        }
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
                        SAP
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

                    {/* Acciones según el origen de la dirección */}
                    {address.ORIGIN === "SAP" ? (
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
                    ) : (
                      <>
                        <ActionButton
                          onClick={() => handleEditAddress(address)}
                          size="small"
                          leftIconName="FaEdit"
                          text="Editar"
                        />

                        <ActionButton
                          onClick={() => handleDeleteAddress(address.ID)}
                          size="small"
                          leftIconName="FaTrash"
                          text="Eliminar"
                        />
                      </>
                    )}

                    {/* Opción para asignar a otra empresa */}
                    {empresasDisponibles.length > 1 && (
                      <ActionButton
                        onClick={() => handleOpenAssignModal(address)}
                        style={{ marginLeft: "8px" }}
                        size="small"
                        leftIconName="FaCopy"
                        text="Asignar a otra empresa"
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
      </TabContent>
    );
  };

  // JSX para el Modal de Asignación de Empresas
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

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay parámetros en el state de la navegación
    if (location.state) {
      const { activeTab, openAddressForm, addressType, empresa } =
        location.state;

      // Activar la pestaña de direcciones
      if (activeTab) {
        setActiveTab(activeTab);
      }

      // Si se solicitó abrir el formulario de dirección
      if (openAddressForm) {
        // Seleccionar la empresa si se especificó
        if (empresa && empresasDisponibles.includes(empresa)) {
          setSelectedEmpresa(empresa);
        }

        // Configurar el formulario para el tipo específico
        // Hacemos esto en un setTimeout para asegurar que selectedEmpresa
        // ya se ha actualizado si fue necesario
        setTimeout(() => {
          setAddressForm({
            ID: null,
            ACCOUNT_USER: user.ACCOUNT_USER || "",
            CLASIFICATION: addressType === "B" ? "FACTURACIÓN" : "ENVÍO",
            TYPE: addressType || "S",
            COUNTRY: "EC",
            STATE: "",
            CITY: "",
            STREET: "",
            PREDETERMINED: false,
            EMPRESA: empresa || selectedEmpresa,
            ORIGIN: "USER",
          });

          setIsEditingAddress(false);
          setShowAddressForm(true);
          setAddressErrors({});
        }, 0);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user, empresasDisponibles]);

  return (
    <PageContainer>
      <PageTitle>Mi Perfil</PageTitle>

      <TabsContainer>
        <TabButton
          $active={activeTab === "personal"}
          onClick={() => setActiveTab("personal")}
          text={"Información Personal"}
          size="small"
        />
        <TabButton
          $active={activeTab === "security"}
          onClick={() => setActiveTab("security")}
          text={"Seguridad"}
          size="small"
        />
        <TabButton
          $active={activeTab === "addresses"}
          onClick={() => setActiveTab("addresses")}
          text={"Direcciones"}
          size="small"
        />
        <TabButton
          $active={activeTab === "preferences"}
          onClick={() => setActiveTab("preferences")}
          text={"Preferencias"}
          size="small"
        />
      </TabsContainer>

      {/* Tab: Información Personal */}
      <TabContent $active={activeTab === "personal"}>
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
            </AvatarSection>
            <FormSection>
              {/* Mostrar solo los datos, no formulario */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <div>
                  <strong>Nombre completo:</strong>
                  <div>{personalInfo.nombre}</div>
                </div>
                <div>
                  <strong>Correo electrónico:</strong>
                  <div>{personalInfo.email}</div>
                </div>
                <div>
                  <strong>Teléfono:</strong>
                  <div>
                    {personalInfo.telefono || (
                      <span style={{ color: "#aaa" }}>No registrado</span>
                    )}
                  </div>
                </div>
                <div>
                  <strong>Empresas disponibles:</strong>
                  {user?.EMPRESAS.length > 0 ? (
                    <EmpresasList>
                      {user?.EMPRESAS.map((empresa, idx) => (
                        <li key={idx}>{empresa}</li>
                      ))}
                    </EmpresasList>
                  ) : (
                    <div style={{ color: "#aaa" }}>Sin empresas asignadas</div>
                  )}
                </div>
              </div>
              <FormActions>
                <Button
                  text="Solicitar cambio de información"
                  variant="outlined"
                  onClick={() =>
                    toast.info(
                      "Para modificar tus datos, contacta a soporte o solicita el cambio a tu administrador."
                    )
                  }
                />
              </FormActions>
            </FormSection>
          </ProfileSection>
        </Card>
      </TabContent>

      {/* Tab: Seguridad */}
      <TabContent $active={activeTab === "security"}>
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
                leftIconName="FaLock"
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
                  leftIconName="FaLock"
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
                  leftIconName="FaLock"
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
      </TabContent>

      {/* Tab: Direcciones */}
      {renderAddressesTab()}

      {/* Modal para asignar dirección a otra empresa */}
      <AssignAddressModal />

      {/* Tab: Preferencias */}
      <TabContent $active={activeTab === "preferences"}>
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
