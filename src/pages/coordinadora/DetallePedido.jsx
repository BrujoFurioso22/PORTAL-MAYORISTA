import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaPen,
  FaSave,
  FaTimes,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAppTheme } from "../../context/AppThemeContext";

// Estilos
const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${(props) => props.theme.colors.background};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  margin-bottom: 16px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const OrderInfo = styled.div``;

const OrderId = styled.h1`
  margin: 0 0 8px 0;
  color: ${(props) => props.theme.colors.text};
`;

const OrderDate = styled.p`
  margin: 0;
  color: ${(props) => props.theme.colors.textLight};
  font-size: 0.9rem;
`;

const OrderActions = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${(props) => props.theme.colors.shadow};
  padding: 24px;
  margin-bottom: 24px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.text};
`;

const CardAction = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;

const ProductsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px;
  color: ${(props) => props.theme.colors.textLight};
  font-weight: 500;
  font-size: 0.9rem;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  color: ${(props) => props.theme.colors.text};
  vertical-align: middle;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductDetails = styled.div``;

const ProductName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const ProductSku = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textLight};
`;

const EditableQuantity = styled.div`
  display: flex;
  align-items: center;
`;

const QuantityInput = styled.input`
  width: 60px;
  padding: 4px 8px;
  border: 1px solid
    ${(props) => (props.editing ? props.theme.colors.primary : "transparent")};
  border-radius: 4px;
  background-color: ${(props) =>
    props.editing ? props.theme.colors.background : "transparent"};
  color: ${(props) => props.theme.colors.text};
  text-align: center;

  &:focus {
    outline: none;
  }
`;

const PriceDisplay = styled.div`
  ${(props) =>
    props.editing
      ? `
    padding: 4px 8px;
    border: 1px solid ${props.theme.colors.primary};
    border-radius: 4px;
    background-color: ${props.theme.colors.background};
  `
      : ""}
`;

const TotalSummary = styled.div`
  margin-top: 20px;
  border-top: 1px solid ${(props) => props.theme.colors.border};
  padding-top: 16px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const SummaryLabel = styled.span`
  color: ${(props) => props.theme.colors.textLight};
`;

const SummaryValue = styled.span`
  color: ${(props) => props.theme.colors.text};
  font-weight: ${(props) => (props.bold ? "600" : "normal")};
`;

const InfoSection = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.text};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  margin-bottom: 8px;
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textLight};
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  color: ${(props) => props.theme.colors.text};
`;

const StatusSection = styled.div`
  margin-bottom: 24px;
`;

const StatusTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.text};
`;

const StatusOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const StatusOption = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid
    ${(props) =>
      props.selected ? props.theme.colors.primary : props.theme.colors.border};
  background-color: ${(props) =>
    props.selected
      ? props.theme.colors.primary + "20"
      : props.theme.colors.surface};
  color: ${(props) =>
    props.selected ? props.theme.colors.primary : props.theme.colors.textLight};
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
  }
`;

const StatusNotes = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  min-height: 100px;
  margin-bottom: 16px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const AddressAlert = styled.div`
  margin-top: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: ${(props) =>
    props.confirmed
      ? props.theme.colors.success + "20"
      : props.theme.colors.warning + "20"};
  border-left: 4px solid
    ${(props) =>
      props.confirmed
        ? props.theme.colors.success
        : props.theme.colors.warning};
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const AddressAlertIcon = styled.div`
  color: ${(props) =>
    props.confirmed ? props.theme.colors.success : props.theme.colors.warning};
  font-size: 1.2rem;
  margin-top: 2px;
`;

const AddressAlertContent = styled.div`
  flex: 1;
`;

const AddressAlertTitle = styled.h4`
  margin: 0 0 8px 0;
  color: ${(props) => props.theme.colors.text};
`;

const AddressAlertText = styled.p`
  margin: 0 0 12px 0;
  color: ${(props) => props.theme.colors.textLight};
`;

const EditMode = styled.div`
  margin-top: 20px;
  padding: 16px;
  background-color: ${(props) => props.theme.colors.primary + "10"};
  border-radius: 8px;
  border: 1px dashed ${(props) => props.theme.colors.primary};
  text-align: center;
`;

const EditModeText = styled.p`
  margin: 0 0 16px 0;
  color: ${(props) => props.theme.colors.primary};
  font-weight: 500;
`;

const ButtonsGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
`;

// Estados para pedidos
const orderStatuses = [
  { id: "pendiente", name: "Pendiente" },
  { id: "en_proceso", name: "En proceso" },
  { id: "en_proceso_observacion", name: "En proceso (con observación)" },
  { id: "rechazado", name: "Rechazado" },
  { id: "cancelado_cliente", name: "Cancelado por cliente" },
  { id: "completado", name: "Completado" },
  { id: "despachado", name: "Despachado" },
];

const DetallePedidoCoordinador = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { theme } = useAppTheme();

  // Estados
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProducts, setEditingProducts] = useState(false);
  const [editedProducts, setEditedProducts] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  // Cargar datos del pedido
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // En un caso real, esto sería una llamada a la API
        // Simulamos la carga con datos de ejemplo
        setTimeout(() => {
          const mockOrder = {
            id: "ORD-2025-1001",
            date: new Date(2025, 3, 15),
            status: "pendiente",
            statusHistory: [
              {
                status: "pendiente",
                date: new Date(2025, 3, 15),
                notes: "Pedido recibido",
                user: "Sistema",
              },
            ],
            customer: {
              name: "Juan Pérez",
              email: "juan@example.com",
              phone: "555-123-4567",
              ruc: "1234567890",
            },
            shipping: {
              address: "Av. Principal 123",
              city: "Ciudad de México",
              state: "CDMX",
              postalCode: "01234",
              method: "Estándar",
              cost: 120.0,
              isNewAddress: true,
            },
            payment: {
              method: "Transferencia bancaria",
              status: "Pagado",
              reference: "REF-123456",
              date: new Date(2025, 3, 15),
            },
            items: [
              {
                id: 1,
                name: "Neumático Roadcruza RA1100 265/70R16",
                sku: "ROAD-RA1100-265",
                price: 145.75,
                originalPrice: 145.75,
                quantity: 2,
                originalQuantity: 2,
                discount: 10,
                total: 262.35,
                image: "https://via.placeholder.com/50",
              },
              {
                id: 2,
                name: "Neumático Fortune FSR-303 225/65R17",
                sku: "FORT-FSR303-225",
                price: 129.99,
                originalPrice: 129.99,
                quantity: 4,
                originalQuantity: 4,
                discount: 5,
                total: 494.0,
                image: "https://via.placeholder.com/50",
              },
              {
                id: 3,
                name: "Aceite Shell Helix Ultra 5W-40 4L",
                sku: "SHELL-HU-5W40-4L",
                price: 58.9,
                originalPrice: 58.9,
                quantity: 1,
                originalQuantity: 1,
                discount: 0,
                total: 58.9,
                image: "https://via.placeholder.com/50",
              },
            ],
            subtotal: 815.25,
            discount: 39.5,
            tax: 124.2,
            // shipping: 120.00,
            total: 1019.95,
            empresa: {
              id: "autollanta",
              name: "Autollanta",
            },
          };

          setOrder(mockOrder);
          setCurrentStatus(mockOrder.status);
          setAddressConfirmed(!mockOrder.shipping.isNewAddress);
          setEditedProducts(
            mockOrder.items.map((item) => ({
              ...item,
              edited: false,
            }))
          );
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error al cargar los detalles del pedido:", error);
        toast.error("Error al cargar los detalles del pedido");
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Manejar cambio en la cantidad de un producto
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setEditedProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const originalPrice = product.originalPrice || product.price;
          const discountAmount = originalPrice * (product.discount / 100);
          const discountedPrice = originalPrice - discountAmount;
          const newTotal = discountedPrice * newQuantity;

          return {
            ...product,
            quantity: newQuantity,
            total: parseFloat(newTotal.toFixed(2)),
            edited: newQuantity !== product.originalQuantity,
          };
        }
        return product;
      })
    );
  };

  // Manejar cambio en el precio de un producto
  const handlePriceChange = (productId, newPrice) => {
    if (newPrice < 0) return;

    setEditedProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const discountAmount = newPrice * (product.discount / 100);
          const discountedPrice = newPrice - discountAmount;
          const newTotal = discountedPrice * product.quantity;

          return {
            ...product,
            price: newPrice,
            total: parseFloat(newTotal.toFixed(2)),
            edited: newPrice !== product.originalPrice,
          };
        }
        return product;
      })
    );
  };

  // Calcular totales
  const calculateTotals = () => {
    if (!editedProducts.length)
      return { subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 };

    const subtotal = editedProducts.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
    const discount = editedProducts.reduce((sum, product) => {
      const discountAmount =
        product.price * (product.discount / 100) * product.quantity;
      return sum + discountAmount;
    }, 0);

    const taxBase = subtotal - discount;
    const tax = taxBase * 0.16; // 16% de IVA
    const shipping = order?.shipping?.cost || 0;
    const total = taxBase + tax + shipping;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  };

  const totals = calculateTotals();

  // Guardar cambios en productos
  const saveProductChanges = () => {
    // Aquí iría la llamada a la API para guardar los cambios

    // Simulamos una respuesta exitosa
    setTimeout(() => {
      toast.success("Cambios guardados correctamente");

      // Actualizar el pedido con los nuevos valores
      setOrder((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          items: editedProducts.map((product) => ({
            ...product,
            originalQuantity: product.quantity,
            originalPrice: product.price,
          })),
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: totals.tax,
          total: totals.total,
        };
      });

      // Actualizar productos editados
      setEditedProducts((prev) =>
        prev.map((product) => ({
          ...product,
          originalQuantity: product.quantity,
          originalPrice: product.price,
          edited: false,
        }))
      );

      setEditingProducts(false);
    }, 600);
  };

  // Cancelar cambios en productos
  const cancelProductChanges = () => {
    // Restaurar valores originales
    setEditedProducts(
      order.items.map((item) => ({
        ...item,
        quantity: item.originalQuantity || item.quantity,
        price: item.originalPrice || item.price,
        edited: false,
      }))
    );

    setEditingProducts(false);
  };

  // Guardar cambio de estado
  const saveStatusChange = () => {
    if (currentStatus === order.status && !statusNotes.trim()) {
      toast.info("No hay cambios que guardar");
      return;
    }

    // Aquí iría la llamada a la API para guardar el cambio de estado

    // Simulamos una respuesta exitosa
    setTimeout(() => {
      const statusHistoryEntry = {
        status: currentStatus,
        date: new Date(),
        notes: statusNotes.trim(),
        user: "Coordinador", // Esto vendría del contexto de autenticación
      };

      // Actualizar el pedido con el nuevo estado
      setOrder((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          status: currentStatus,
          statusHistory: [...prev.statusHistory, statusHistoryEntry],
        };
      });

      toast.success(
        `Estado actualizado a "${
          orderStatuses.find((s) => s.id === currentStatus)?.name ||
          currentStatus
        }"`
      );
      setStatusNotes("");
    }, 600);
  };

  // Confirmar dirección
  const handleConfirmAddress = () => {
    // Aquí iría la llamada a la API para confirmar la dirección

    // Simulamos una respuesta exitosa
    setTimeout(() => {
      setAddressConfirmed(true);

      // Actualizar el pedido
      setOrder((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          shipping: {
            ...prev.shipping,
            isNewAddress: false,
          },
        };
      });

      toast.success("Dirección confirmada correctamente");
    }, 600);
  };

  if (loading) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate("/coordinadora/pedidos")}>
          <FaArrowLeft /> Volver a la lista de pedidos
        </BackButton>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          Cargando detalles del pedido...
        </div>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate("/coordinadora/pedidos")}>
          <FaArrowLeft /> Volver a la lista de pedidos
        </BackButton>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          No se encontró el pedido solicitado.
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate("/coordinadora/pedidos")}>
        <FaArrowLeft /> Volver a la lista de pedidos
      </BackButton>

      <PageHeader>
        <OrderInfo>
          <OrderId>Pedido {order.id}</OrderId>
          <OrderDate>
            Realizado el{" "}
            {format(order.date, "d 'de' MMMM, yyyy", { locale: es })}
          </OrderDate>
        </OrderInfo>

        <OrderActions>
          {!editingProducts && (
            <Button
              text="Editar pedido"
              variant="outline"
              onClick={() => setEditingProducts(true)}
              leftIcon={<FaPen size={14} />}
            />
          )}
        </OrderActions>
      </PageHeader>

      <ContentGrid>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>

            <ProductsTable>
              <TableHead>
                <tr>
                  <TableHeader>Producto</TableHeader>
                  <TableHeader>Precio</TableHeader>
                  <TableHeader>Cantidad</TableHeader>
                  <TableHeader>Descuento</TableHeader>
                  <TableHeader>Total</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {editedProducts.map((product) => (
                  <TableRow key={product.id} highlight={product.edited}>
                    <TableCell>
                      <ProductInfo>
                        <ProductImage src={product.image} alt={product.name} />
                        <ProductDetails>
                          <ProductName>{product.name}</ProductName>
                          <ProductSku>SKU: {product.sku}</ProductSku>
                        </ProductDetails>
                      </ProductInfo>
                    </TableCell>
                    <TableCell>
                      {editingProducts ? (
                        <PriceDisplay editing={true}>
                          $
                          <input
                            type="number"
                            value={product.price}
                            onChange={(e) =>
                              handlePriceChange(
                                product.id,
                                parseFloat(e.target.value)
                              )
                            }
                            style={{
                              width: "60px",
                              border: "none",
                              background: "transparent",
                              color: theme.colors.text,
                            }}
                            step="0.01"
                            min="0"
                          />
                        </PriceDisplay>
                      ) : (
                        <>${product.price.toFixed(2)}</>
                      )}
                    </TableCell>
                    <TableCell>
                      <EditableQuantity>
                        {editingProducts ? (
                          <QuantityInput
                            type="number"
                            value={product.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                product.id,
                                parseInt(e.target.value)
                              )
                            }
                            editing={true}
                            min="1"
                          />
                        ) : (
                          product.quantity
                        )}
                      </EditableQuantity>
                    </TableCell>
                    <TableCell>
                      {product.discount > 0 ? `${product.discount}%` : "-"}
                    </TableCell>
                    <TableCell>${product.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ProductsTable>

            <TotalSummary>
              <SummaryRow>
                <SummaryLabel>Subtotal:</SummaryLabel>
                <SummaryValue>${totals.subtotal.toFixed(2)}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Descuento:</SummaryLabel>
                <SummaryValue>-${totals.discount.toFixed(2)}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>IVA (16%):</SummaryLabel>
                <SummaryValue>${totals.tax.toFixed(2)}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Envío:</SummaryLabel>
                <SummaryValue>${totals.shipping.toFixed(2)}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Total:</SummaryLabel>
                <SummaryValue bold>${totals.total.toFixed(2)}</SummaryValue>
              </SummaryRow>
            </TotalSummary>

            {editingProducts && (
              <EditMode>
                <EditModeText>
                  Estás editando los productos de este pedido. Los cambios
                  realizados requerirán confirmación por parte del cliente.
                </EditModeText>
                <ButtonsGroup>
                  <Button
                    text="Cancelar"
                    variant="outline"
                    onClick={cancelProductChanges}
                    leftIcon={<FaTimes size={14} />}
                  />
                  <Button
                    text="Guardar cambios"
                    variant="solid"
                    backgroundColor={theme.colors.primary}
                    onClick={saveProductChanges}
                    leftIcon={<FaSave size={14} />}
                  />
                </ButtonsGroup>
              </EditMode>
            )}
          </Card>

          <Card>
            <CardTitle>Información del cliente</CardTitle>

            <InfoGrid style={{ marginTop: "16px" }}>
              <InfoItem>
                <InfoLabel>Nombre completo</InfoLabel>
                <InfoValue>{order.customer.name}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Email</InfoLabel>
                <InfoValue>{order.customer.email}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Teléfono</InfoLabel>
                <InfoValue>{order.customer.phone}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>RUC/Cédula</InfoLabel>
                <InfoValue>{order.customer.ruc}</InfoValue>
              </InfoItem>
            </InfoGrid>
          </Card>

          <Card>
            <CardTitle>Información de envío</CardTitle>

            <InfoGrid style={{ marginTop: "16px" }}>
              <InfoItem>
                <InfoLabel>Dirección</InfoLabel>
                <InfoValue>{order.shipping.address}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Ciudad</InfoLabel>
                <InfoValue>{order.shipping.city}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Estado/Provincia</InfoLabel>
                <InfoValue>{order.shipping.state}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Código postal</InfoLabel>
                <InfoValue>{order.shipping.postalCode}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Método de envío</InfoLabel>
                <InfoValue>{order.shipping.method}</InfoValue>
              </InfoItem>
            </InfoGrid>

            {order.shipping.isNewAddress && !addressConfirmed ? (
              <AddressAlert>
                <AddressAlertIcon>
                  <FaExclamationTriangle />
                </AddressAlertIcon>
                <AddressAlertContent>
                  <AddressAlertTitle>
                    Nueva dirección de envío
                  </AddressAlertTitle>
                  <AddressAlertText>
                    Esta dirección de envío es nueva y necesita ser confirmada
                    en el sistema.
                  </AddressAlertText>
                  <Button
                    text="Confirmar dirección"
                    variant="outline"
                    onClick={handleConfirmAddress}
                    leftIcon={<FaMapMarkerAlt size={14} />}
                  />
                </AddressAlertContent>
              </AddressAlert>
            ) : order.shipping.isNewAddress && addressConfirmed ? (
              <AddressAlert confirmed>
                <AddressAlertIcon confirmed>
                  <FaCheckCircle />
                </AddressAlertIcon>
                <AddressAlertContent>
                  <AddressAlertTitle>Dirección confirmada</AddressAlertTitle>
                  <AddressAlertText>
                    Esta dirección ha sido confirmada y guardada en el sistema.
                  </AddressAlertText>
                </AddressAlertContent>
              </AddressAlert>
            ) : null}
          </Card>
        </div>

        <div>
          <Card>
            <CardTitle>Estado del pedido</CardTitle>

            <StatusSection>
              <StatusTitle>
                Estado actual:{" "}
                {orderStatuses.find((s) => s.id === order.status)?.name}
              </StatusTitle>

              <StatusOptions>
                {orderStatuses.map((status) => (
                  <StatusOption
                    key={status.id}
                    selected={currentStatus === status.id}
                    onClick={() => setCurrentStatus(status.id)}
                  >
                    {status.name}
                  </StatusOption>
                ))}
              </StatusOptions>

              <StatusTitle>Notas (opcional)</StatusTitle>
              <StatusNotes
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Añade notas o comentarios sobre el cambio de estado..."
              />

              <Button
                text="Actualizar estado"
                variant="solid"
                backgroundColor={theme.colors.primary}
                onClick={saveStatusChange}
                style={{ width: "100%" }}
              />
            </StatusSection>
          </Card>

          <Card>
            <CardTitle>Historial de estados</CardTitle>

            {order.statusHistory.map((entry, index) => (
              <div
                key={index}
                style={{
                  padding: "12px 0",
                  borderBottom:
                    index < order.statusHistory.length - 1
                      ? `1px solid ${theme.colors.border}`
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ fontWeight: "500" }}>
                    {orderStatuses.find((s) => s.id === entry.status)?.name ||
                      entry.status}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: theme.colors.textLight,
                    }}
                  >
                    {format(new Date(entry.date), "d MMM yyyy, HH:mm", {
                      locale: es,
                    })}
                  </div>
                </div>
                {entry.notes && (
                  <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>
                    {entry.notes}
                  </div>
                )}
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: theme.colors.textLight,
                    marginTop: "4px",
                  }}
                >
                  Por: {entry.user}
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <CardTitle>Información de pago</CardTitle>

            <InfoSection style={{ marginTop: "16px" }}>
              <InfoItem>
                <InfoLabel>Método de pago</InfoLabel>
                <InfoValue>{order.payment.method}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Estado</InfoLabel>
                <InfoValue>{order.payment.status}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Referencia</InfoLabel>
                <InfoValue>{order.payment.reference}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Fecha de pago</InfoLabel>
                <InfoValue>
                  {format(new Date(order.payment.date), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </InfoValue>
              </InfoItem>
            </InfoSection>
          </Card>
        </div>
      </ContentGrid>
    </PageContainer>
  );
};

export default DetallePedidoCoordinador;
