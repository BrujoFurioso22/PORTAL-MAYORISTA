import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../../context/CartContext";
import Button from "../../components/ui/Button";
import { useAppTheme } from "../../context/AppThemeContext";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { FaPlus, FaPencilAlt, FaCheck, FaMapMarkerAlt, FaFileInvoice } from "react-icons/fa";
import Input from "../../components/ui/Input";

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
  font-weight: ${({ bold }) => (bold ? "bold" : "normal")};
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

const Carrito = () => {
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } =
    useCart();
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  const { user } = useAuth(); // Obtenemos el usuario actual

  // Agregar nuevos estados para manejar los dos tipos de direcciones
  const [shippingAddressId, setShippingAddressId] = useState(null);
  const [billingAddressId, setBillingAddressId] = useState(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Estados para los formularios
  const [addressFormType, setAddressFormType] = useState("S"); // "S" o "B"

  // Estados para manejar direcciones
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
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

  // Cargar direcciones del usuario
  useEffect(() => {
    if (user) {
      console.log(user);

      // Si el usuario tiene direcciones guardadas o usamos las de prueba
      let userAddresses = [];
      
      if (user.DIRECCIONES) {
        // Obtener todas las direcciones y aplanarlas en un solo array
        const allAddresses = Object.values(user.DIRECCIONES).flat();
        
        userAddresses = allAddresses.map(addr => ({
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
          empresa: addr.EMPRESA
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
            empresa: "EMPRESA1"
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
            empresa: "EMPRESA1"
          }
        ];
      }
      
      setAddresses(userAddresses);
      
      // Seleccionar direcciones predeterminadas
      const defaultShipping = userAddresses.find(addr => addr.type === "S" && addr.isDefault);
      const defaultBilling = userAddresses.find(addr => addr.type === "B" && addr.isDefault);
      
      if (defaultShipping) {
        setShippingAddressId(defaultShipping.id);
      } else {
        // Si no hay predeterminada, buscar cualquier dirección de envío
        const anyShipping = userAddresses.find(addr => addr.type === "S");
        if (anyShipping) setShippingAddressId(anyShipping.id);
      }
      
      if (defaultBilling) {
        setBillingAddressId(defaultBilling.id);
      } else {
        // Si no hay predeterminada, buscar cualquier dirección de facturación
        const anyBilling = userAddresses.find(addr => addr.type === "B");
        if (anyBilling) setBillingAddressId(anyBilling.id);
      }
    }
  }, [user]);

  // Función para seleccionar una dirección
  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
  };

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
      type: addressFormType
    };
    
    if (editingAddress) {
      // Actualizar dirección existente
      updatedAddresses = addresses.map(addr => 
        addr.id === editingAddress.id ? {...newAddress, id: editingAddress.id} : addr
      );
      toast.success("Dirección actualizada correctamente");
    } else {
      // Crear nueva dirección
      const newAddressWithId = {
        ...newAddress,
        id: Date.now().toString() // Generamos un ID único
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
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.type === addressForm.type 
          ? addr.id === (editingAddress?.id || updatedAddresses[updatedAddresses.length - 1].id)
          : addr.isDefault
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
      isDefault: false
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
  const handleCheckout = () => {
    // Verificar que hay direcciones seleccionadas
    if (!shippingAddressId) {
      toast.error("Por favor selecciona una dirección de envío");
      return;
    }
    
    if (!sameAsShipping && !billingAddressId) {
      toast.error("Por favor selecciona una dirección de facturación");
      return;
    }
    
    // Verificar que no hay productos sin stock suficiente
    if (hasInsufficientStock) {
      toast.error("Algunos productos no tienen stock suficiente");
      return;
    }
    
    // Obtener las direcciones seleccionadas
    const shippingAddress = addresses.find(addr => addr.id === shippingAddressId);
    const billingAddress = sameAsShipping 
      ? shippingAddress
      : addresses.find(addr => addr.id === billingAddressId);
    
    // Crear objeto de pedido
    const order = {
      items: cart,
      total: cartTotal,
      shippingAddress: shippingAddress,
      billingAddress: billingAddress,
      date: new Date(),
      status: "pending"
    };
    
    // Aquí procesarías el pedido con tu API
    console.log("Procesando pedido:", order);
    
    // Mensaje provisional
    alert(
      `Procesando pedido...\n\n` +
      `Dirección de envío: ${shippingAddress.street} ${shippingAddress.number || ""}, ${shippingAddress.city}\n\n` +
      `Dirección de facturación: ${billingAddress.street} ${billingAddress.number || ""}, ${billingAddress.city}\n\n` +
      `Total: $${cartTotal.toFixed(2)}`
    );
    
    clearCart();
    navigate("/");
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

      <CartLayout>
        <div>
          <CartItemsList>
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                handleQuantityChange={handleQuantityChange}
                removeFromCart={removeFromCart}
              />
            ))}
          </CartItemsList>

          {/* Sección de dirección de envío */}
          <ShippingSection>
            <SectionTitle>
              <FaMapMarkerAlt /> Dirección de envío
            </SectionTitle>

            {addresses.filter(addr => addr.type === "S").length > 0 ? (
              <div>
                {addresses
                  .filter(addr => addr.type === "S")
                  .map((address) => (
                  <AddressCard
                    key={address.id}
                    selected={shippingAddressId === address.id}
                    onClick={() => setShippingAddressId(address.id)}
                  >
                    <AddressInfo>
                      <AddressName>{address.name}</AddressName>
                      <AddressDetails>
                        {address.street} {address.number}, {address.city}, {address.state} 
                        {address.zipCode && ` (${address.zipCode})`}
                        {address.isDefault && (
                          <span style={{ marginLeft: 8, color: theme.colors.success }}>
                            • Predeterminada
                          </span>
                        )}
                      </AddressDetails>
                    </AddressInfo>
                    <AddressActions>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(address);
                        }}
                      >
                        <FaPencilAlt size={14} />
                      </IconButton>
                    </AddressActions>
                  </AddressCard>
                ))}
              </div>
            ) : (
              <EmptyAddressState>
                No tienes direcciones de envío guardadas
              </EmptyAddressState>
            )}

            <NewAddressButton onClick={() => handleAddNewAddress("S")}>
              <FaPlus /> Agregar nueva dirección de envío
            </NewAddressButton>
          </ShippingSection>

          {/* Sección de dirección de facturación */}
          <ShippingSection style={{ marginTop: "24px" }}>
            <SectionTitle>
              <FaFileInvoice /> Dirección de facturación
            </SectionTitle>
            
            <UseShippingAddressOption>
              <input
                type="checkbox"
                id="sameAsShipping"
                checked={sameAsShipping}
                onChange={(e) => setSameAsShipping(e.target.checked)}
              />
              <label htmlFor="sameAsShipping">
                Usar la misma dirección de envío para facturación
              </label>
            </UseShippingAddressOption>

            {!sameAsShipping && (
              <>
                {addresses.filter(addr => addr.type === "B").length > 0 ? (
                  <div>
                    {addresses
                      .filter(addr => addr.type === "B")
                      .map((address) => (
                      <AddressCard
                        key={address.id}
                        selected={billingAddressId === address.id}
                        onClick={() => setBillingAddressId(address.id)}
                      >
                        <AddressInfo>
                          <AddressName>{address.name}</AddressName>
                          <AddressDetails>
                            {address.street} {address.number}, {address.city}, {address.state} 
                            {address.zipCode && ` (${address.zipCode})`}
                            {address.isDefault && (
                              <span style={{ marginLeft: 8, color: theme.colors.info }}>
                                • Predeterminada
                              </span>
                            )}
                          </AddressDetails>
                        </AddressInfo>
                        <AddressActions>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                          >
                            <FaPencilAlt size={14} />
                          </IconButton>
                        </AddressActions>
                      </AddressCard>
                    ))}
                  </div>
                ) : (
                  <EmptyAddressState>
                    No tienes direcciones de facturación guardadas
                  </EmptyAddressState>
                )}
                
                <NewAddressButton onClick={() => handleAddNewAddress("B")}>
                  <FaPlus /> Agregar nueva dirección de facturación
                </NewAddressButton>
              </>
            )}
          </ShippingSection>

          {/* Formulario para agregar/editar dirección */}
          {showAddressForm && (
            <AddressFormContainer>
              <FormTitle>
                {isEditingAddress 
                  ? "Editar dirección" 
                  : `Nueva dirección de ${addressFormType === "S" ? "envío" : "facturación"}`
                }
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
                  {formErrors.street && <FormError>{formErrors.street}</FormError>}
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
                  {formErrors.state && <FormError>{formErrors.state}</FormError>}
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
                  {formErrors.zipCode && <FormError>{formErrors.zipCode}</FormError>}
                </FormGroup>

                <FormGroup fullWidth>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={addressForm.isDefault}
                      onChange={handleAddressFormChange}
                      style={{ marginRight: 8 }}
                    />
                    Establecer como dirección predeterminada de {addressFormType === "S" ? "envío" : "facturación"}
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

          <SummaryRow>
            <SummaryLabel>Subtotal ({cart.length} productos)</SummaryLabel>
            <SummaryValue>${cartTotal.toFixed(2)}</SummaryValue>
          </SummaryRow>

          <SummaryRow>
            <SummaryLabel>Descuentos</SummaryLabel>
            <SummaryValue>$0.00</SummaryValue>
          </SummaryRow>

          <SummaryRow>
            <SummaryLabel>Envío</SummaryLabel>
            <SummaryValue>Gratis</SummaryValue>
          </SummaryRow>

          <TotalRow>
            <SummaryLabel>Total</SummaryLabel>
            <SummaryValue bold>${cartTotal.toFixed(2)}</SummaryValue>
          </TotalRow>

          {/* Verificar que hay direcciones seleccionadas */}
          <Button
            text="Proceder al pago"
            variant="solid"
            backgroundColor={theme.colors.success}
            style={{ width: "100%", marginTop: "20px" }}
            onClick={handleCheckout}
            disabled={
              hasInsufficientStock || 
              !shippingAddressId || 
              (!sameAsShipping && !billingAddressId)
            }
          />
          
          {!shippingAddressId && (
            <div style={{
              color: theme.colors.error,
              fontSize: "0.8rem",
              textAlign: "center",
              marginTop: "8px"
            }}>
              Debes seleccionar una dirección de envío
            </div>
          )}
          
          {!sameAsShipping && !billingAddressId && (
            <div style={{
              color: theme.colors.error,
              fontSize: "0.8rem",
              textAlign: "center",
              marginTop: "8px"
            }}>
              Debes seleccionar una dirección de facturación
            </div>
          )}

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
