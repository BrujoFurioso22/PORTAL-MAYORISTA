import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../../context/CartContext";
import Button from "../../components/ui/Button";
import { useAppTheme } from "../../context/AppThemeContext";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import {
  FaPlus,
  FaPencilAlt,
  FaCheck,
  FaMapMarkerAlt,
  FaFileInvoice,
} from "react-icons/fa";
import Input from "../../components/ui/Input";
import { ROUTES } from "../../constants/routes";
import RenderIcon from "../../components/ui/RenderIcon";

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
`;

const PageTitle = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 24px 0;
  color: ${({ theme }) => theme.colors.text};
  gap: 12px;
`;

const CartEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`;

const EmptyCartIcon = styled.div`
  font-size: 4rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 16px;
`;

const EmptyCartText = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 24px;
`;

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 900px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const CartItemsList = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
`;

const CartItemContainer = styled.div`
  display: flex;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.white};
`;

const ItemDetails = styled.div`
  flex: 1;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
`;

const ItemName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ItemBrand = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ItemPricing = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 8px;
  min-width: 120px;
`;

const ItemPrice = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const ItemQuantityControl = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.border : theme.colors.surface};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textLight : theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

  &:first-child {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const QuantityInput = styled.input`
  width: 40px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.error};
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
  margin-top: 8px;
  text-align: right;

  &:hover {
    text-decoration: underline;
  }
`;

const OrderSummary = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  padding: 20px;
  height: fit-content;
`;

const SummaryTitle = styled.h2`
  font-size: 1.2rem;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SummaryLabel = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
`;

const SummaryValue = styled.span`
  font-weight: ${({ $bold }) => ($bold ? "bold" : "normal")};
  color: ${({ theme }) => theme.colors.text};
`;

const TotalRow = styled(SummaryRow)`
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 1.1rem;
`;

const StockWarning = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.85rem;
  margin: 4px 0 8px;
  font-weight: 500;
`;

const StockInfo = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.8rem;
  margin-top: 6px;
`;

const StockAlertBanner = styled.div`
  background-color: ${({ theme }) => theme.colors.errorLight || "#FFEBEE"};
  color: ${({ theme }) => theme.colors.error};
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.8rem;
`;

const ShippingSection = styled.div`
  margin: 24px 0;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  padding: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const AddressCard = styled.div`
  border: 1px solid
    ${({ theme, selected }) =>
      selected ? theme.colors.primary : theme.colors.border};
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  background-color: ${({ theme, selected }) =>
    selected ? `${theme.colors.primary || "#E3F2FD"}15` : "transparent"};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) =>
      `${theme.colors.primary || "#E3F2FD"}15`};
  }
`;

const AddressInfo = styled.div`
  flex: 1;
`;

const AddressName = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const AddressDetails = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const AddressActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark || theme.colors.primary};
  }
`;

const NewAddressButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 12px;
  width: 100%;
  margin-top: 12px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) =>
      `${theme.colors.primaryLight || "#E3F2FD"}15`};
  }
`;

// Formulario de dirección
const AddressForm = styled.form`
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 12px;
  grid-column: ${({ fullWidth }) => (fullWidth ? "1 / -1" : "span 1")};
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const FormInput = styled(Input)`
  width: 100%;
  font-size: 0.9rem;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`;

const FormError = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  grid-column: 1 / -1;
  margin-top: 8px;
`;

// Nuevos estilos para las pestañas de empresas
const CompanyTabs = styled.div`
  display: flex;
  overflow-x: auto;
  margin-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const CompanyTab = styled.button`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : "transparent")};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textLight};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CompanySummary = styled.div`
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
`;

const CompanyName = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
`;

const ValidationWarning = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
  margin-top: 4px;
`;

const EmptyAddressState = styled.div`
  padding: 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  background-color: ${({ theme }) => `${theme.colors.background}80`};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80px;

  &::before {
    content: "📍";
    font-size: 1.5rem;
    margin-bottom: 8px;
  }
`;

// Y este componente para la opción de usar la misma dirección
const UseShippingAddressOption = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0 16px;

  input {
    margin-right: 8px;
  }

  label {
    cursor: pointer;
    font-size: 0.9rem;
  }
`;

// También te falta este componente usado en el formulario
const AddressFormContainer = styled.div`
  margin-top: 24px;
  padding: 20px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`;

// Y este componente para el título del formulario
const FormTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
`;

// Opcional: Badge para mostrar los ítems seleccionados por empresa
const ItemsCountBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 12px;
  margin-left: 8px;
`;
// Botón específico para pagar por empresa - más pequeño que el principal
const CompanyCheckoutButton = styled(Button)`
  font-size: 0.85rem;
  padding: 6px 12px;
  margin-top: 8px;
`;

const CartItem = ({ item, handleQuantityChange, removeFromCart }) => {
  console.log(item);

  const maxStock = item?.stock || 0;
  const discountedPrice = item?.discount
    ? item.price * (1 - item.discount / 100)
    : item?.price || 0;
  const itemTotal = discountedPrice * item.quantity;
  const isOverStock = item.quantity > maxStock;

  return (
    <CartItemContainer>
      <ItemImage src={item?.image} alt={item?.name} />

      <ItemDetails>
        <ItemName>{item?.name}</ItemName>
        <ItemBrand>{item?.brand}</ItemBrand>

        {isOverStock && (
          <StockWarning>⚠️ Stock disponible: {maxStock}</StockWarning>
        )}

        <ItemQuantityControl>
          <QuantityButton
            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            -
          </QuantityButton>
          <QuantityInput
            type="number"
            min="1"
            max={maxStock}
            value={item.quantity}
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value) || 1;
              handleQuantityChange(item.id, newQuantity);
            }}
          />
          <QuantityButton
            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
            disabled={item.quantity >= maxStock}
          >
            +
          </QuantityButton>
        </ItemQuantityControl>

        <StockInfo>
          {maxStock > 0 ? `${maxStock} disponibles` : "Sin stock"}
        </StockInfo>
      </ItemDetails>

      <ItemPricing>
        <ItemPrice>${itemTotal.toFixed(2)}</ItemPrice>
        <RemoveButton onClick={() => removeFromCart(item.id)}>
          Eliminar
        </RemoveButton>
      </ItemPricing>
    </CartItemContainer>
  );
};

// Añadir esta función para encontrar la mejor dirección disponible
const findBestAvailableAddress = (addresses, company, type) => {
  // 1. Buscar predeterminada para esta empresa
  const defaultForCompany = addresses.find(
    (addr) => addr.type === type && addr.isDefault && addr.empresa === company
  );
  if (defaultForCompany) return defaultForCompany.id;

  // 2. Buscar cualquier dirección de este tipo para esta empresa
  const anyForCompany = addresses.find(
    (addr) => addr.type === type && addr.empresa === company
  );
  if (anyForCompany) return anyForCompany.id;

  // 3. Buscar predeterminada global
  const defaultGlobal = addresses.find(
    (addr) => addr.type === type && addr.isDefault
  );
  if (defaultGlobal) return defaultGlobal.id;

  // 4. Buscar cualquier dirección de este tipo
  const anyAddress = addresses.find((addr) => addr.type === type);
  if (anyAddress) return anyAddress.id;

  // No hay direcciones disponibles
  return null;
};

const Carrito = () => {
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } =
    useCart();
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  const { user } = useAuth(); // Obtenemos el usuario actual

  // Agregar nuevos estados para manejar los dos tipos de direcciones
  const [shippingAddressId, setShippingAddressId] = useState(null);
  const [billingAddressId, setBillingAddressId] = useState(null);

  // Estados para los formularios
  const [addressFormType, setAddressFormType] = useState("S"); // "S" o "B"

  // Estados para manejar direcciones
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Estado para el formulario de dirección
  const [addressForm, setAddressForm] = useState({
    name: "",
    street: "",
    number: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    isDefault: false,
  });

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({});

  // Estados para agrupar el carrito por empresa
  const [groupedCart, setGroupedCart] = useState({});
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Función para validar que todas las direcciones estén seleccionadas
  const isAllAddressesSelected = () => {
    return Object.values(groupedCart).every((companyData) => {
      return companyData.shippingAddressId && companyData.billingAddressId;
    });
  };

  // Cargar direcciones del usuario
  useEffect(() => {
    if (user) {
      console.log(user);

      // Si el usuario tiene direcciones guardadas o usamos las de prueba
      let userAddresses = [];

      if (user.DIRECCIONES) {
        // Obtener todas las direcciones y aplanarlas en un solo array
        const allAddresses = Object.values(user.DIRECCIONES).flat();

        userAddresses = allAddresses.map((addr) => ({
          id: addr.ID.toString(),
          name: addr.CLASIFICATION,
          street: addr.STREET,
          number: "",
          city: addr.CITY,
          state: addr.STATE,
          zipCode: "",
          phone: "",
          isDefault: addr.PREDETERMINED,
          type: addr.TYPE.trim(),
          empresa: addr.EMPRESA,
          origen: addr.ORIGIN,
        }));
      } else {
        // Direcciones de prueba
        userAddresses = [
          {
            id: "1",
            name: "Casa",
            street: "Av. Principal",
            number: "123",
            city: "Ciudad Ejemplo",
            state: "Estado Ejemplo",
            zipCode: "12345",
            phone: "555-1234",
            isDefault: true,
            type: "S",
            empresa: "EMPRESA1",
          },
          {
            id: "2",
            name: "Oficina",
            street: "Calle Comercial",
            number: "456",
            city: "Ciudad Trabajo",
            state: "Estado Ejemplo",
            zipCode: "54321",
            phone: "555-5678",
            isDefault: true,
            type: "B",
            empresa: "EMPRESA1",
          },
        ];
      }

      setAddresses(userAddresses);

      // Seleccionar direcciones predeterminadas
      const defaultShipping = userAddresses.find(
        (addr) => addr.type === "S" && addr.isDefault
      );
      const defaultBilling = userAddresses.find(
        (addr) => addr.type === "B" && addr.isDefault
      );

      if (defaultShipping) {
        setShippingAddressId(defaultShipping.id);
      } else {
        // Si no hay predeterminada, buscar cualquier dirección de envío
        const anyShipping = userAddresses.find((addr) => addr.type === "S");
        if (anyShipping) setShippingAddressId(anyShipping.id);
      }

      if (defaultBilling) {
        setBillingAddressId(defaultBilling.id);
      } else {
        // Si no hay predeterminada, buscar cualquier dirección de facturación
        const anyBilling = userAddresses.find((addr) => addr.type === "B");
        if (anyBilling) setBillingAddressId(anyBilling.id);
      }
    }
  }, [user]);

  // Agrupar items del carrito por empresa
  useEffect(() => {
    const groupByCompany = () => {
      const grouped = {};
      console.log(cart);

      cart.forEach((item) => {
        const company = item.empresaId || "Sin empresa";

        if (!grouped[company]) {
          // Verificar si ya existía esta empresa en el agrupamiento anterior
          // y mantener sus direcciones seleccionadas
          grouped[company] = {
            items: [],
            total: 0,
            // Mantener las direcciones previamente seleccionadas si existían
            shippingAddressId: groupedCart[company]?.shippingAddressId || null,
            billingAddressId: groupedCart[company]?.billingAddressId || null,
          };
        }

        grouped[company].items.push(item);
        grouped[company].total += item.price * item.quantity;
      });

      // Asignar direcciones predeterminadas solo para empresas nuevas o sin dirección seleccionada
      if (addresses.length > 0) {
        Object.keys(grouped).forEach((company) => {
          // Solo asignar direcciones predeterminadas si no hay una ya seleccionada
          if (!grouped[company].shippingAddressId) {
            grouped[company].shippingAddressId = findBestAvailableAddress(
              addresses,
              company,
              "S"
            );
          }

          if (!grouped[company].billingAddressId) {
            grouped[company].billingAddressId = findBestAvailableAddress(
              addresses,
              company,
              "B"
            );
          }
        });
      }

      setGroupedCart(grouped);

      // Actualizar selectedCompany si es necesario
      if (Object.keys(grouped).length > 0) {
        if (!selectedCompany || !grouped[selectedCompany]) {
          setSelectedCompany(Object.keys(grouped)[0]);
        }
      }
    };

    groupByCompany();
  }, [cart, addresses]);

  // Función para editar una dirección existente
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name || "",
      street: address.street || "",
      number: address.number || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      phone: address.phone || "",
      isDefault: address.isDefault || false,
    });
    setShowAddressForm(true);
  };

  // Función para manejar cambios en el formulario
  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: type === "checkbox" ? checked : value,
    });

    // Limpiar errores al cambiar un campo
    setFormErrors({
      ...formErrors,
      [name]: null,
    });
  };

  // Validar formulario
  const validateAddressForm = () => {
    const errors = {};

    if (!addressForm.name.trim()) errors.name = "Nombre es requerido";
    if (!addressForm.street.trim()) errors.street = "Calle es requerida";
    if (!addressForm.city.trim()) errors.city = "Ciudad es requerida";
    if (!addressForm.state.trim())
      errors.state = "Estado/Provincia es requerido";
    if (!addressForm.zipCode.trim())
      errors.zipCode = "Código postal es requerido";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar dirección
  const handleSaveAddress = (e) => {
    e.preventDefault();

    if (!validateAddressForm()) {
      return;
    }

    let updatedAddresses;
    const newAddress = {
      ...addressForm,
      type: addressFormType,
    };

    if (editingAddress) {
      // Actualizar dirección existente
      updatedAddresses = addresses.map((addr) =>
        addr.id === editingAddress.id
          ? { ...newAddress, id: editingAddress.id }
          : addr
      );
      toast.success("Dirección actualizada correctamente");
    } else {
      // Crear nueva dirección
      const newAddressWithId = {
        ...newAddress,
        id: Date.now().toString(), // Generamos un ID único
      };
      updatedAddresses = [...addresses, newAddressWithId];
      toast.success("Dirección agregada correctamente");

      // Seleccionar la nueva dirección según el tipo
      if (newAddress.type === "S") {
        setShippingAddressId(newAddressWithId.id);
      } else if (newAddress.type === "B") {
        setBillingAddressId(newAddressWithId.id);
      }
    }

    // Si se marca como predeterminada, actualizar las otras del mismo tipo
    if (addressForm.isDefault) {
      updatedAddresses = updatedAddresses.map((addr) => ({
        ...addr,
        isDefault:
          addr.type === addressForm.type
            ? addr.id ===
              (editingAddress?.id ||
                updatedAddresses[updatedAddresses.length - 1].id)
            : addr.isDefault,
      }));
    }

    setAddresses(updatedAddresses);
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({
      name: "",
      street: "",
      number: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      isDefault: false,
    });
  };

  // Cancelar edición/creación de dirección
  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setFormErrors({});
    setAddressForm({
      name: "",
      street: "",
      number: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      isDefault: false,
    });
  };

  if (cart.length === 0) {
    return (
      <PageContainer>
        <PageTitle>Carrito de compras</PageTitle>
        <CartEmptyState>
          <EmptyCartIcon>🛒</EmptyCartIcon>
          <EmptyCartText>Tu carrito está vacío</EmptyCartText>
          <Button
            text="Ir al Catálogo"
            variant="solid"
            onClick={() => navigate("/")}
            backgroundColor={theme.colors.primary}
          />
        </CartEmptyState>
      </PageContainer>
    );
  }

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity <= 0) return;

    // Encontrar el ítem del carrito
    const cartItem = cart.find((item) => item.id === id);
    if (!cartItem) return;

    // Obtener el stock máximo del producto
    const maxStock = cartItem?.stock || 0;

    // Limitar la cantidad al stock disponible
    const validQuantity = Math.min(newQuantity, maxStock);

    // Actualizar la cantidad
    updateQuantity(id, validQuantity);

    // Mostrar mensaje si se intenta exceder el stock
    if (newQuantity > maxStock) {
      toast.warning(
        `Solo hay ${maxStock} unidades disponibles de este producto`
      );
    }
  };

  const hasInsufficientStock = cart.some(
    (item) => item.quantity > (item?.stock || 0)
  );

  // Función para verificar stock insuficiente por empresa
  const hasInsufficientStockForCompany = (company) => {
    if (!groupedCart[company]) return false;

    return groupedCart[company].items.some(
      (item) => item.quantity > (item?.stock || 0)
    );
  };
  const handleCheckoutAll = () => {
    // Verificar que todas las empresas tienen direcciones seleccionadas
    if (!isAllAddressesSelected()) {
      toast.error(
        "Por favor, selecciona direcciones de envío y facturación para todas las empresas"
      );
      return;
    }

    // Verificar stock
    if (hasInsufficientStock) {
      toast.error("Algunos productos no tienen stock suficiente");
      return;
    }

    // Preparar órdenes por empresa
    const orders = Object.entries(groupedCart).map(([company, data]) => {
      const shippingAddress = addresses.find(
        (addr) => addr.id === data.shippingAddressId
      );
      const billingAddress = addresses.find(
        (addr) => addr.id === data.billingAddressId
      );

      return {
        company,
        items: data.items,
        total: data.total,
        shippingAddress,
        billingAddress,
        date: new Date(),
        status: "pending",
      };
    });

    console.log("Procesando pedidos por empresa:", orders);

    // Aquí procesarías los pedidos con tu API
    alert(
      `Procesando ${orders.length} pedidos para diferentes empresas...\n\n` +
        orders
          .map(
            (order) =>
              `Empresa: ${order.company}\n` +
              `Total: $${order.total.toFixed(2)}\n` +
              `Dirección de envío: ${order.shippingAddress.street}, ${order.shippingAddress.city}\n` +
              `Dirección de facturación: ${order.billingAddress.street}, ${order.billingAddress.city}\n`
          )
          .join("\n")
    );

    // clearCart();
    // navigate("/");
  };

  // Función para procesar el pago de una sola empresa
  const handleCheckoutSingleCompany = (company) => {
    const companyData = groupedCart[company];

    if (!companyData) {
      toast.error("No se encontró información para esta empresa");
      return;
    }

    // Verificar direcciones
    if (!companyData.shippingAddressId || !companyData.billingAddressId) {
      toast.error("Por favor, selecciona las direcciones para esta empresa");
      return;
    }

    // Verificar stock
    if (hasInsufficientStockForCompany(company)) {
      toast.error("Algunos productos no tienen stock suficiente");
      return;
    }

    // Preparar orden para esta empresa
    const shippingAddress = addresses.find(
      (addr) => addr.id === companyData.shippingAddressId
    );
    const billingAddress = addresses.find(
      (addr) => addr.id === companyData.billingAddressId
    );

    const order = {
      company,
      items: companyData.items,
      total: companyData.total,
      shippingAddress,
      billingAddress,
      date: new Date(),
      status: "pending",
    };

    console.log(`Procesando pedido para la empresa ${company}:`, order);

    // Aquí procesarías este pedido individual con tu API
    // Esta alerta es solo para demostración
    alert(
      `Procesando pedido para la empresa ${company}:\n\n` +
        `Total: $${order.total.toFixed(2)}\n` +
        `Dirección de envío: ${order.shippingAddress.street}, ${order.shippingAddress.city}\n` +
        `Dirección de facturación: ${order.billingAddress.street}, ${order.billingAddress.city}\n` +
        `\n${order.items.length} productos en el pedido`
    );

    // Actualizar el carrito manteniendo solo los elementos de otras empresas
    // const newCart = cart.filter(item =>
    //   item.empresaId !== company
    // );
    // clearCart();
    // newCart.forEach(item => addToCart(item, item.quantity));

    // navigate("/");
  };
  const isEditingAddress = Boolean(editingAddress);

  return (
    <PageContainer>
      <PageTitle>
        <h1>Carrito de compras</h1>
        {hasInsufficientStock && (
          <StockAlertBanner>
            ⚠️ Algunos productos en tu carrito no tienen stock suficiente. Por
            favor ajusta las cantidades.
          </StockAlertBanner>
        )}
      </PageTitle>

      {/* Pestañas de empresas */}
      <CompanyTabs>
        {console.log(groupedCart)}
        {Object.keys(groupedCart).map((company) => (
          <CompanyTab
            key={company}
            $active={selectedCompany === company}
            onClick={() => setSelectedCompany(company)}
          >
            {company}
          </CompanyTab>
        ))}
      </CompanyTabs>

      <CartLayout>
        <div>
          {/* Mostrar productos solo de la empresa seleccionada */}
          <CartItemsList>
            {selectedCompany &&
              groupedCart[selectedCompany]?.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  handleQuantityChange={handleQuantityChange}
                  removeFromCart={removeFromCart}
                />
              ))}
          </CartItemsList>

          {/* Sección de dirección de envío para la empresa seleccionada */}
          <ShippingSection>
            <SectionTitle>
              <FaMapMarkerAlt /> Dirección de envío para {selectedCompany}
            </SectionTitle>

            {addresses.filter(
              (addr) => addr.type === "S" && addr.empresa === selectedCompany
            ).length > 0 ? (
              <div>
                {addresses
                  .filter(
                    (addr) =>
                      addr.type === "S" && addr.empresa === selectedCompany
                  )
                  .map((address) => (
                    <AddressCard
                      key={address.id}
                      selected={
                        groupedCart[selectedCompany]?.shippingAddressId ===
                        address.id
                      }
                      onClick={() => {
                        const updated = { ...groupedCart };
                        updated[selectedCompany].shippingAddressId = address.id;
                        setGroupedCart(updated);
                      }}
                    >
                      <AddressInfo>
                        <AddressName>
                          {address.name}{" "}
                          {address.origen === "SAP" && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "0.75rem",
                                padding: "2px 6px",
                                backgroundColor: theme.colors.background,
                                borderRadius: "4px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: theme.colors.textLight,
                              }}
                            >
                              <RenderIcon name="Lock" size={10} />
                              <span>Sistema</span>
                            </span>
                          )}
                        </AddressName>
                        <AddressDetails>
                          {address.street} {address.number}, {address.city},{" "}
                          {address.state}
                          {address.zipCode && ` (${address.zipCode})`}
                          {address.isDefault && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: theme.colors.success,
                              }}
                            >
                              • Predeterminada
                            </span>
                          )}
                        </AddressDetails>
                      </AddressInfo>
                      <AddressActions>
                        {address.origen === "SAP" ? (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(
                                "Las direcciones sincronizadas con el sistema no se pueden editar. Contacta a soporte para solicitar cambios."
                              );
                            }}
                            style={{ color: theme.colors.textLight }}
                          >
                            <RenderIcon name="Lock" size={14} />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              // Redirigir a la página de perfil con los parámetros para editar esta dirección
                              navigate(ROUTES.ECOMMERCE.PERFIL, {
                                state: {
                                  activeTab: "addresses",
                                  editAddressId: address.id,
                                  empresa: address.empresa,
                                },
                              });
                            }}
                          >
                            <FaPencilAlt size={14} />
                          </IconButton>
                        )}
                      </AddressActions>
                    </AddressCard>
                  ))}
              </div>
            ) : (
              <EmptyAddressState>
                No tienes direcciones de envío para esta empresa.
              </EmptyAddressState>
            )}

            <NewAddressButton
              onClick={() =>
                navigate(ROUTES.ECOMMERCE.PERFIL, {
                  state: {
                    activeTab: "addresses",
                    openAddressForm: true,
                    addressType: "S",
                    empresa: selectedCompany,
                  },
                })
              }
            >
              <FaPlus /> Ir a Perfil para agregar dirección de envío
            </NewAddressButton>
          </ShippingSection>

          {/* Sección de dirección de facturación similar a la de envío */}
          <ShippingSection style={{ marginTop: "24px" }}>
            <SectionTitle>
              <FaFileInvoice /> Dirección de facturación
            </SectionTitle>

            {addresses.filter(
              (addr) => addr.type === "B" && addr.empresa === selectedCompany
            ).length > 0 ? (
              <div>
                {addresses
                  .filter(
                    (addr) =>
                      addr.type === "B" && addr.empresa === selectedCompany
                  )
                  .map((address) => (
                    <AddressCard
                      key={address.id}
                      selected={
                        groupedCart[selectedCompany]?.billingAddressId ===
                        address.id
                      }
                      onClick={() => {
                        const updated = { ...groupedCart };
                        updated[selectedCompany].billingAddressId = address.id;
                        setGroupedCart(updated);
                      }}
                    >
                      <AddressInfo>
                        <AddressName>
                          {address.name}{" "}
                          {address.origen === "SAP" && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "0.75rem",
                                padding: "2px 6px",
                                backgroundColor: theme.colors.background,
                                borderRadius: "4px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: theme.colors.textLight,
                              }}
                            >
                              <RenderIcon name="Lock" size={10} />
                              <span>Sistema</span>
                            </span>
                          )}
                        </AddressName>
                        <AddressDetails>
                          {address.street} {address.number}, {address.city},{" "}
                          {address.state}
                          {address.zipCode && ` (${address.zipCode})`}
                          {address.isDefault && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: theme.colors.info,
                              }}
                            >
                              • Predeterminada
                            </span>
                          )}
                        </AddressDetails>
                      </AddressInfo>
                      <AddressActions>
                        {address.origen === "SAP" ? (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(
                                "Las direcciones sincronizadas con el sistema no se pueden editar. Contacta a soporte para solicitar cambios."
                              );
                            }}
                            style={{ color: theme.colors.textLight }}
                          >
                            <RenderIcon name="Lock" size={14} />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(ROUTES.ECOMMERCE.PERFIL, {
                                state: {
                                  activeTab: "addresses",
                                  editAddressId: address.id,
                                  empresa: address.empresa,
                                },
                              });
                            }}
                          >
                            <FaPencilAlt size={14} />
                          </IconButton>
                        )}
                      </AddressActions>
                    </AddressCard>
                  ))}
              </div>
            ) : (
              <EmptyAddressState>
                No tienes direcciones de facturación para esta empresa.
              </EmptyAddressState>
            )}

            <NewAddressButton
              onClick={() =>
                navigate(ROUTES.ECOMMERCE.PERFIL, {
                  state: {
                    activeTab: "addresses",
                    openAddressForm: true,
                    addressType: "B",
                    empresa: selectedCompany,
                  },
                })
              }
            >
              <FaPlus /> Ir a Perfil para agregar dirección de facturación
            </NewAddressButton>
          </ShippingSection>

          {/* Formulario para agregar/editar dirección */}
          {showAddressForm && (
            <AddressFormContainer>
              <FormTitle>
                {isEditingAddress
                  ? "Editar dirección"
                  : `Nueva dirección de ${
                      addressFormType === "S" ? "envío" : "facturación"
                    }`}
              </FormTitle>
              <AddressForm onSubmit={handleSaveAddress}>
                <FormGroup>
                  <FormLabel>Nombre para esta dirección</FormLabel>
                  <FormInput
                    name="name"
                    value={addressForm.name}
                    onChange={handleAddressFormChange}
                    placeholder="Ej: Mi casa, Oficina"
                    error={formErrors.name}
                  />
                  {formErrors.name && <FormError>{formErrors.name}</FormError>}
                </FormGroup>

                <FormGroup>
                  <FormLabel>Teléfono de contacto</FormLabel>
                  <FormInput
                    name="phone"
                    value={addressForm.phone}
                    onChange={handleAddressFormChange}
                    placeholder="Número de teléfono"
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Calle</FormLabel>
                  <FormInput
                    name="street"
                    value={addressForm.street}
                    onChange={handleAddressFormChange}
                    placeholder="Nombre de la calle"
                    error={formErrors.street}
                  />
                  {formErrors.street && (
                    <FormError>{formErrors.street}</FormError>
                  )}
                </FormGroup>

                <FormGroup>
                  <FormLabel>Número</FormLabel>
                  <FormInput
                    name="number"
                    value={addressForm.number}
                    onChange={handleAddressFormChange}
                    placeholder="Número exterior"
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Ciudad</FormLabel>
                  <FormInput
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressFormChange}
                    placeholder="Ciudad"
                    error={formErrors.city}
                  />
                  {formErrors.city && <FormError>{formErrors.city}</FormError>}
                </FormGroup>

                <FormGroup>
                  <FormLabel>Estado/Provincia</FormLabel>
                  <FormInput
                    name="state"
                    value={addressForm.state}
                    onChange={handleAddressFormChange}
                    placeholder="Estado o provincia"
                    error={formErrors.state}
                  />
                  {formErrors.state && (
                    <FormError>{formErrors.state}</FormError>
                  )}
                </FormGroup>

                <FormGroup>
                  <FormLabel>Código Postal</FormLabel>
                  <FormInput
                    name="zipCode"
                    value={addressForm.zipCode}
                    onChange={handleAddressFormChange}
                    placeholder="Código postal"
                    error={formErrors.zipCode}
                  />
                  {formErrors.zipCode && (
                    <FormError>{formErrors.zipCode}</FormError>
                  )}
                </FormGroup>

                <FormGroup fullWidth>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={addressForm.isDefault}
                      onChange={handleAddressFormChange}
                      style={{ marginRight: 8 }}
                    />
                    Establecer como dirección predeterminada de{" "}
                    {addressFormType === "S" ? "envío" : "facturación"}
                  </label>
                </FormGroup>

                <ButtonGroup>
                  <Button
                    text="Guardar dirección"
                    variant="solid"
                    type="submit"
                    backgroundColor={theme.colors.primary}
                  />
                  <Button
                    text="Cancelar"
                    variant="outlined"
                    type="button"
                    onClick={handleCancelAddressForm}
                  />
                </ButtonGroup>
              </AddressForm>
            </AddressFormContainer>
          )}
        </div>

        <OrderSummary>
          <SummaryTitle>Resumen del pedido</SummaryTitle>

          {/* Resumen por empresa */}
          {Object.entries(groupedCart).map(([company, data]) => (
            <CompanySummary key={company}>
              <CompanyName>{company}</CompanyName>
              <SummaryRow>
                <SummaryLabel>
                  Subtotal ({data.items.length} productos)
                </SummaryLabel>
                <SummaryValue>${data.total.toFixed(2)}</SummaryValue>
              </SummaryRow>

              {/* Validación de direcciones por empresa */}
              {!data.shippingAddressId && (
                <ValidationWarning>Falta dirección de envío</ValidationWarning>
              )}
              {!data.billingAddressId && (
                <ValidationWarning>
                  Falta dirección de facturación
                </ValidationWarning>
              )}

              {/* Botón para pagar solo esta empresa */}
              <CompanyCheckoutButton
                text={`Proceder al pedido`}
                color={theme.colors.white}
                variant="outlined"
                size="small"
                leftIconName={"ShoppingCart"}
                backgroundColor={theme.colors.primary}
                style={{ width: "100%" }}
                onClick={() => handleCheckoutSingleCompany(company)}
                disabled={
                  !data.shippingAddressId ||
                  !data.billingAddressId ||
                  hasInsufficientStockForCompany(company)
                }
              />
            </CompanySummary>
          ))}

          <TotalRow>
            <SummaryLabel>Total General</SummaryLabel>
            <SummaryValue $bold>${cartTotal.toFixed(2)}</SummaryValue>
          </TotalRow>

          {/* Botón para pagar todo junto */}
          <Button
            text="Pedir todo junto"
            variant="solid"
            backgroundColor={theme.colors.success}
            style={{ width: "100%", marginTop: "20px" }}
            onClick={handleCheckoutAll}
            disabled={!isAllAddressesSelected() || hasInsufficientStock}
          />

          <Button
            text="Seguir comprando"
            variant="outlined"
            style={{ width: "100%", marginTop: "12px" }}
            onClick={() => navigate("/")}
          />
        </OrderSummary>
      </CartLayout>
    </PageContainer>
  );
};

export default Carrito;
