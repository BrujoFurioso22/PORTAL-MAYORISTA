import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-toastify";
import { useAppTheme } from "../../context/AppThemeContext";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import RenderIcon from "../../components/ui/RenderIcon";
import { order_getOrderById } from "../../services/order/order";
import { baseLinkImages } from "../../constants/links";

// Estilos del componente
const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BackLink = styled(Button)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  margin-bottom: 16px;
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
  flex-wrap: wrap;
  gap: 16px;
`;

const OrderTitle = styled.div``;

const OrderNumber = styled.h1`
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const OrderDate = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
`;

const OrderActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: ${({ theme, status }) => {
    switch (status) {
      case "PENDIENTE":
        return theme.colors.warning + "33";
      case "CONFIRMADO":
        return theme.colors.info + "33";
      case "ENTREGADO":
        return theme.colors.success + "33";
      case "CANCELADO":
        return theme.colors.error + "33";
      default:
        return theme.colors.border;
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case "PENDIENTE":
        return theme.colors.warning;
      case "CONFIRMADO":
        return theme.colors.info;
      case "ENTREGADO":
        return theme.colors.success;
      case "CANCELADO":
        return theme.colors.error;
      default:
        return theme.colors.textLight;
    }
  }};
`;

const Section = styled.section`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.p`
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Value = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const ProductsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const ProductsHead = styled.thead`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ProductsHeadCell = styled.th`
  text-align: left;
  padding: 12px 16px;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 500;
  font-size: 0.9rem;
`;

const ProductsBody = styled.tbody``;

const ProductRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ProductCell = styled.td`
  padding: 16px;
  vertical-align: middle;
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.span`
  font-weight: 500;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text};
`;

const ProductSKU = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const OrderSummary = styled.div`
  margin-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 16px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
    margin-top: 12px;
    font-weight: bold;
    font-size: 1.1rem;
  }
`;

const SummaryLabel = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
`;

const SummaryValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

const EditableSection = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  background-color: ${({ theme }) => theme.colors.primary}10;
`;

const EditableSectionTitle = styled.h3`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
`;

const AddressAlert = styled.div`
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: ${({ theme, $confirmed }) =>
    $confirmed ? theme.colors.success + "20" : theme.colors.warning + "20"};
  border-left: 4px solid
    ${({ theme, $confirmed }) =>
      $confirmed ? theme.colors.success : theme.colors.warning};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AddressAlertContent = styled.div`
  flex: 1;
`;

const AddressAlertTitle = styled.h4`
  margin: 0 0 4px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const AddressAlertText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
`;

const DetallePedidoCoordinador = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  const { user } = useAuth();

  // Estados del componente
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [newDiscount, setNewDiscount] = useState(0);
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  // Opciones de estado disponibles para coordinador
  const statusOptions = [
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "CONFIRMADO", label: "Confirmado" },
    { value: "ENTREGADO", label: "Entregado" },
    { value: "CANCELADO", label: "Cancelado" },
  ];

  // Traducir estado a español para mostrar
  const translateStatus = (status) => {
    const statusMap = {
      PENDIENTE: "Pendiente",
      CONFIRMADO: "Confirmado",
      ENTREGADO: "Entregado",
      CANCELADO: "Cancelado",
    };
    return statusMap[status] || status;
  };

  // Cargar datos del pedido
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await order_getOrderById(orderId);

        if (response.success && response.data && response.data.length > 0) {
          const apiOrder = response.data[0];
          const cabecera = apiOrder.CABECERA;
          const detalle = apiOrder.DETALLE || [];

          const statusHistory = Array.isArray(cabecera.STATUS)
            ? cabecera.STATUS
            : [];
          const currentStatusObj =
            statusHistory[statusHistory.length - 1] || {};
          const currentStatus =
            currentStatusObj.VALUE_CATALOG || cabecera.STATUS;

          // Calcular el subtotal
          const subtotal = detalle.reduce(
            (sum, item) => sum + item.PRICE * item.QUANTITY,
            0
          );

          // Calcular descuentos y totales igual que en DetallePedido.jsx
          const items = detalle.map((item) => ({
            id: item.PRODUCT_CODE,
            name: item.MAESTRO?.DMA_NOMBREITEM || "Producto",
            sku: item.PRODUCT_CODE,
            price: item.PRICE,
            quantity: item.QUANTITY,
            promotionalDiscount: item.PROMOTIONAL_DISCOUNT || 0,
            total: item.PRICE * item.QUANTITY,
            image: item.MAESTRO?.DMA_RUTAIMAGEN
              ? `${baseLinkImages}${item.MAESTRO.DMA_RUTAIMAGEN}`
              : "https://placehold.co/50x50/png",
          }));

          // 1. Subtotal sin descuentos
          const rawSubtotal = items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          );
          // 2. Total de descuentos promocionales (por producto)
          const totalPromotionalDiscount = items.reduce(
            (acc, item) =>
              acc +
              item.price *
                item.quantity *
                ((Number(item.promotionalDiscount) || 0) / 100),
            0
          );
          // 3. Subtotal después de descuentos promocionales
          const subtotalAfterPromo = rawSubtotal - totalPromotionalDiscount;
          // 4. Descuento general (cliente) sobre el subtotal con promo
          const generalDiscount =
            subtotalAfterPromo * (Number(cabecera.DISCOUNT || 0) / 100);
          // 5. Subtotal después de descuento general
          const subtotalAfterGeneral = subtotalAfterPromo - generalDiscount;
          // 6. Descuento adicional (coordinadora) sobre el subtotal con promo y general
          const aditionalDiscount =
            subtotalAfterGeneral *
            (Number(cabecera.ADITIONAL_DISCOUNT || 0) / 100);
          // 7. Total final antes de IVA
          const totalFinal = subtotalAfterGeneral - aditionalDiscount;
          // IVA como porcentaje
          const ivaPct = Number(cabecera.IVA_DETAIL?.IVA_PERCENTAGE || 15);
          const valorIVA = (totalFinal < 0 ? 0 : totalFinal) * (ivaPct / 100);
          const totalConIva = (totalFinal < 0 ? 0 : totalFinal) + valorIVA;

          // Verificar si tiene direcciones nuevas
          const hasNewAddress =
            cabecera.SHIPPING_ADDRESS?.ORIGIN === "CLIENT" ||
            cabecera.BILLING_ADDRESS?.ORIGIN === "CLIENT";

          const formattedOrder = {
            id: cabecera.ID_CART_HEADER,
            date: new Date(cabecera.createdAt),
            status: currentStatus,
            aditionalDiscount: cabecera.ADITIONAL_DISCOUNT || 0,
            discount: cabecera.DISCOUNT || 0,
            iva: ivaPct,
            customer: {
              name: cabecera.USER.NAME_USER,
              email: cabecera.USER.EMAIL,
              phone: "No disponible",
            },
            shipping: {
              address: cabecera.SHIPPING_ADDRESS.STREET,
              city: cabecera.SHIPPING_ADDRESS.CITY,
              state: cabecera.SHIPPING_ADDRESS.STATE,
            },
            billing: {
              address: cabecera.BILLING_ADDRESS.STREET,
              city: cabecera.BILLING_ADDRESS.CITY,
              state: cabecera.BILLING_ADDRESS.STATE,
            },
            items,
            subtotal: rawSubtotal,
            total: totalConIva,
            empresaInfo: {
              id: cabecera.ENTERPRISE,
              name: cabecera.ENTERPRISE,
            },
            hasNewAddress: hasNewAddress,
            originalData: apiOrder,
            // Para desglose
            rawSubtotal,
            totalPromotionalDiscount,
            subtotalAfterPromo,
            generalDiscount,
            subtotalAfterGeneral,
            totalFinal,
            valorIVA,
            totalConIva,
          };

          setOrderDetails(formattedOrder);
          setNewStatus(formattedOrder.status);
          setNewDiscount(formattedOrder.discount);
          setAddressConfirmed(!hasNewAddress);
          setError(null);
        } else {
          setError("No se encontraron detalles del pedido");
        }
      } catch (error) {
        console.error("Error al cargar detalles del pedido:", error);
        setError(`Error al cargar detalles: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Calcular total con nuevo descuento
  const calculateNewTotal = () => {
    if (!orderDetails) return 0;
    return Math.max(0, orderDetails.subtotal - newDiscount);
  };

  // Guardar cambio de estado
  const handleSaveStatus = async () => {
    try {
      // Aquí iría la llamada a la API para actualizar el estado
      // await updateOrderStatus(orderId, newStatus);

      setOrderDetails((prev) => ({ ...prev, status: newStatus }));
      setEditingStatus(false);
      toast.success("Estado actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  // Guardar cambio de descuento
  const handleSaveDiscount = async () => {
    try {
      // Aquí iría la llamada a la API para actualizar el descuento
      // await updateOrderDiscount(orderId, newDiscount);

      const newTotal = calculateNewTotal();
      setOrderDetails((prev) => ({
        ...prev,
        discount: newDiscount,
        total: newTotal,
      }));
      setEditingDiscount(false);
      toast.success("Descuento aplicado correctamente");
    } catch (error) {
      console.error("Error al aplicar descuento:", error);
      toast.error("Error al aplicar el descuento");
    }
  };

  // Confirmar dirección nueva
  const handleConfirmAddress = async () => {
    try {
      // Aquí iría la llamada a la API para confirmar la dirección
      // await confirmOrderAddress(orderId);

      setAddressConfirmed(true);
      toast.success("Dirección confirmada correctamente");
    } catch (error) {
      console.error("Error al confirmar dirección:", error);
      toast.error("Error al confirmar la dirección");
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setOrderDetails((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      const updatedSubtotal = updatedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      const updatedTotalPromotionalDiscount = updatedItems.reduce(
        (acc, item) =>
          acc +
          item.price *
            item.quantity *
            ((Number(item.promotionalDiscount) || 0) / 100),
        0
      );
      const updatedSubtotalAfterPromo =
        updatedSubtotal - updatedTotalPromotionalDiscount;
      const updatedGeneralDiscount =
        updatedSubtotalAfterPromo * (Number(prev.discount) / 100);
      const updatedSubtotalAfterGeneral =
        updatedSubtotalAfterPromo - updatedGeneralDiscount;
      const updatedAditionalDiscount =
        updatedSubtotalAfterGeneral * (Number(prev.aditionalDiscount) / 100);
      const updatedTotalFinal =
        updatedSubtotalAfterGeneral - updatedAditionalDiscount;
      const updatedValorIVA = updatedTotalFinal * (Number(prev.iva) / 100);
      const updatedTotalConIva = updatedTotalFinal + updatedValorIVA;

      return {
        ...prev,
        items: updatedItems,
        rawSubtotal: updatedSubtotal,
        totalPromotionalDiscount: updatedTotalPromotionalDiscount,
        subtotalAfterPromo: updatedSubtotalAfterPromo,
        generalDiscount: updatedGeneralDiscount,
        subtotalAfterGeneral: updatedSubtotalAfterGeneral,
        aditionalDiscount: updatedAditionalDiscount,
        totalFinal: updatedTotalFinal,
        valorIVA: updatedValorIVA,
        totalConIva: updatedTotalConIva,
      };
    });
  };

  const handleRemoveProduct = (productId) => {
    setOrderDetails((prev) => {
      const updatedItems = prev.items.filter((item) => item.id !== productId);
      if (updatedItems.length === 0) {
        return { ...prev, items: [], status: "CANCELADO" };
      }

      const updatedSubtotal = updatedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      const updatedTotalPromotionalDiscount = updatedItems.reduce(
        (acc, item) =>
          acc +
          item.price *
            item.quantity *
            ((Number(item.promotionalDiscount) || 0) / 100),
        0
      );
      const updatedSubtotalAfterPromo =
        updatedSubtotal - updatedTotalPromotionalDiscount;
      const updatedGeneralDiscount =
        updatedSubtotalAfterPromo * (Number(prev.discount) / 100);
      const updatedSubtotalAfterGeneral =
        updatedSubtotalAfterPromo - updatedGeneralDiscount;
      const updatedAditionalDiscount =
        updatedSubtotalAfterGeneral * (Number(prev.aditionalDiscount) / 100);
      const updatedTotalFinal =
        updatedSubtotalAfterGeneral - updatedAditionalDiscount;
      const updatedValorIVA = updatedTotalFinal * (Number(prev.iva) / 100);
      const updatedTotalConIva = updatedTotalFinal + updatedValorIVA;

      return {
        ...prev,
        items: updatedItems,
        rawSubtotal: updatedSubtotal,
        totalPromotionalDiscount: updatedTotalPromotionalDiscount,
        subtotalAfterPromo: updatedSubtotalAfterPromo,
        generalDiscount: updatedGeneralDiscount,
        subtotalAfterGeneral: updatedSubtotalAfterGeneral,
        aditionalDiscount: updatedAditionalDiscount,
        totalFinal: updatedTotalFinal,
        valorIVA: updatedValorIVA,
        totalConIva: updatedTotalConIva,
      };
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <BackLink
          onClick={() => navigate("/coordinadora")}
          text="← Volver a gestión de pedidos"
        />
        <EmptyState>Cargando detalles del pedido...</EmptyState>
      </PageContainer>
    );
  }

  if (error || !orderDetails) {
    return (
      <PageContainer>
        <BackLink
          onClick={() => navigate("/coordinadora")}
          text="← Volver a gestión de pedidos"
        />
        <EmptyState>
          <h2>Pedido no encontrado</h2>
          <p>
            {error ||
              "No pudimos encontrar la información del pedido solicitado."}
          </p>
          <Button
            text="Volver a gestión de pedidos"
            variant="solid"
            onClick={() => navigate("/coordinadora")}
          />
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackLink
        onClick={() => navigate("/coordinadora")}
        text="← Volver a gestión de pedidos"
      />

      <PageHeader>
        <OrderTitle>
          <OrderNumber>
            Pedido #{orderDetails.id.substring(0, 12)}...
          </OrderNumber>
          <OrderDate>
            Realizado el{" "}
            {format(orderDetails.date, "d 'de' MMMM, yyyy", { locale: es })}
          </OrderDate>
        </OrderTitle>

        <OrderActions>
          <StatusBadge status={orderDetails.status}>
            {translateStatus(orderDetails.status)}
          </StatusBadge>
        </OrderActions>
      </PageHeader>

      {/* Alerta de dirección nueva */}
      {orderDetails.hasNewAddress && !addressConfirmed && (
        <AddressAlert $confirmed={addressConfirmed}>
          <RenderIcon
            name="FaExclamationTriangle"
            size={20}
            style={{ color: theme.colors.warning }}
          />
          <AddressAlertContent>
            <AddressAlertTitle>
              Dirección nueva requiere revisión
            </AddressAlertTitle>
            <AddressAlertText>
              Este pedido tiene una dirección nueva que necesita ser verificada
              antes de procesar.
            </AddressAlertText>
          </AddressAlertContent>
          <Button
            text="Confirmar dirección"
            variant="solid"
            size="small"
            backgroundColor={theme.colors.warning}
            onClick={handleConfirmAddress}
          />
        </AddressAlert>
      )}

      {/* Gestión del pedido dividido en tres cuadros */}
      <Section>
        <SectionTitle>
          <RenderIcon name="FaCog" size={18} /> Gestión del pedido
        </SectionTitle>

        <TwoColumns>
          <EditableSection>
            <EditableSectionTitle>
              <RenderIcon name="FaEdit" size={16} /> Cambiar estado del pedido
            </EditableSectionTitle>

            {editingStatus ? (
              <FormRow>
                <Select
                  options={statusOptions}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  width="200px"
                  label="Nuevo estado"
                />
                <Button
                  text="Guardar"
                  variant="solid"
                  size="small"
                  backgroundColor={theme.colors.success}
                  leftIconName="FaSave"
                  onClick={handleSaveStatus}
                />
                <Button
                  text="Cancelar"
                  variant="outlined"
                  size="small"
                  leftIconName="FaTimes"
                  onClick={() => {
                    setEditingStatus(false);
                    setNewStatus(orderDetails.status);
                  }}
                />
              </FormRow>
            ) : (
              <FormRow>
                <div>
                  <Label>Estado actual:</Label>
                  <Value>{translateStatus(orderDetails.status)}</Value>
                </div>
                <Button
                  text="Editar estado"
                  variant="outlined"
                  size="small"
                  leftIconName="FaEdit"
                  onClick={() => setEditingStatus(true)}
                />
              </FormRow>
            )}
          </EditableSection>

          <EditableSection>
            <EditableSectionTitle>
              <RenderIcon name="FaPercentage" size={16} /> Aplicar descuento
            </EditableSectionTitle>

            {editingDiscount ? (
              <FormRow>
                <Input
                  type="number"
                  min="0"
                  max={orderDetails.subtotal}
                  step="0.01"
                  value={newDiscount}
                  onChange={(e) =>
                    setNewDiscount(parseFloat(e.target.value) || 0)
                  }
                  label="Descuento ($)"
                  width="150px"
                />
                <div>
                  <Label>Nuevo total:</Label>
                  <Value>${calculateNewTotal().toFixed(2)}</Value>
                </div>
                <Button
                  text="Aplicar"
                  variant="solid"
                  size="small"
                  backgroundColor={theme.colors.success}
                  leftIconName="FaSave"
                  onClick={handleSaveDiscount}
                />
                <Button
                  text="Cancelar"
                  variant="outlined"
                  size="small"
                  leftIconName="FaTimes"
                  onClick={() => {
                    setEditingDiscount(false);
                    setNewDiscount(orderDetails.discount);
                  }}
                />
              </FormRow>
            ) : (
              <FormRow>
                <div>
                  <Label>Descuento actual:</Label>
                  <Value>${orderDetails.discount.toFixed(2)}</Value>
                </div>
                <div>
                  <Label>Total:</Label>
                  <Value>${orderDetails.total.toFixed(2)}</Value>
                </div>
                <Button
                  text="Editar descuento"
                  variant="outlined"
                  size="small"
                  leftIconName="FaEdit"
                  onClick={() => setEditingDiscount(true)}
                />
              </FormRow>
            )}
          </EditableSection>

          <EditableSection>
            <EditableSectionTitle>
              <RenderIcon name="FaBox" size={16} /> Gestión de productos
            </EditableSectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {orderDetails.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                    background: theme.colors.surface,
                    borderRadius: 8,
                    boxShadow: `0 1px 4px ${theme.colors.shadow}`,
                    padding: 16,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 6,
                      background: "#f6f6f6",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span
                          style={{
                            fontWeight: 500,
                            marginBottom: 4,
                            color: theme.colors.text,
                            fontSize: "1.08rem",
                          }}
                        >
                          {item.name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: theme.colors.textLight,
                          }}
                        >
                          SKU: {item.sku}
                        </span>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 110 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: theme.colors.primary,
                            fontSize: "1.08rem",
                          }}
                        >
                          ${item.price.toFixed(2)}
                        </div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: theme.colors.textLight,
                          }}
                        >
                          Precio
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 8,
                        gap: 12,
                      }}
                    >
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(item.id, parseInt(e.target.value, 10))
                        }
                        label="Cantidad"
                        width="100px"
                      />
                      <Button
                        text="Eliminar"
                        variant="outlined"
                        size="small"
                        leftIconName="FaTrash"
                        onClick={() => handleRemoveProduct(item.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </EditableSection>
        </TwoColumns>
      </Section>

      {/* Información del pedido */}
      <TwoColumns>
        <Section>
          <SectionTitle>
            <RenderIcon name="FaInfoCircle" size={18} /> Información del pedido
          </SectionTitle>

          <InfoItem>
            <Label>N° Pedido:</Label>
            <Value>{orderDetails.id}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Empresa:</Label>
            <Value>{orderDetails.empresaInfo.name}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Fecha de pedido:</Label>
            <Value>
              {format(orderDetails.date, "d 'de' MMMM, yyyy", { locale: es })}
            </Value>
          </InfoItem>
        </Section>
        <Section>
          <SectionTitle>
            <RenderIcon name="FaUser" size={18} /> Datos del cliente
          </SectionTitle>

          <InfoItem>
            <Label>Nombre:</Label>
            <Value>{orderDetails.customer.name}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Email:</Label>
            <Value>{orderDetails.customer.email}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Contacto Principal:</Label>
            <Value>
              {(() => {
                const empresa =
                  orderDetails.empresaInfo?.name ||
                  orderDetails.empresaInfo?.id;
                const telefonosEmpresa = user.TELEFONOS?.[empresa] || [];
                if (telefonosEmpresa.length === 0) return "No disponible";
                const principal =
                  telefonosEmpresa.find((t) => t.PREDETERMINED) ||
                  telefonosEmpresa[0];
                return principal
                  ? `${principal.PHONE_NUMBER}`
                  : "No disponible";
              })()}
            </Value>
          </InfoItem>
        </Section>
      </TwoColumns>

      {/* Direcciones */}
      <TwoColumns>
        <Section>
          <SectionTitle>
            <RenderIcon name="FaShippingFast" size={18} /> Información de envío
          </SectionTitle>

          <InfoItem>
            <Label>Dirección:</Label>
            <Value>{orderDetails.shipping.address}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Ciudad:</Label>
            <Value>{orderDetails.shipping.city}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Estado/Provincia:</Label>
            <Value>{orderDetails.shipping.state}</Value>
          </InfoItem>
        </Section>

        <Section>
          <SectionTitle>
            <RenderIcon name="FaFileInvoiceDollar" size={18} /> Información de
            facturación
          </SectionTitle>

          <InfoItem>
            <Label>Dirección:</Label>
            <Value>{orderDetails.billing.address}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Ciudad:</Label>
            <Value>{orderDetails.billing.city}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Estado/Provincia:</Label>
            <Value>{orderDetails.billing.state}</Value>
          </InfoItem>
        </Section>
      </TwoColumns>

      {/* Productos */}
      <Section>
        <SectionTitle>
          <RenderIcon name="FaBoxOpen" size={18} /> Productos
        </SectionTitle>

        {/* Mostrar descuentos si existen */}
        {(orderDetails.aditionalDiscount > 0 || orderDetails.discount > 0) && (
          <div style={{ marginBottom: 16 }}>
            {orderDetails.discount > 0 && (
              <div
                style={{
                  background: theme.colors.info + "22",
                  border: `1px solid ${theme.colors.info}`,
                  color: theme.colors.info,
                  borderRadius: 6,
                  padding: "8px 12px",
                  marginBottom: 6,
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <RenderIcon name="FaTag" size={16} style={{ marginRight: 6 }} />
                Descuento general de cliente aplicado: {orderDetails.discount}%
              </div>
            )}
            {orderDetails.aditionalDiscount > 0 && (
              <div
                style={{
                  background: theme.colors.success + "22",
                  border: `1px solid ${theme.colors.success}`,
                  color: theme.colors.success,
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <RenderIcon name="FaTag" size={16} style={{ marginRight: 6 }} />
                Descuento especial aplicado por coordinadora:{" "}
                {orderDetails.aditionalDiscount}%
              </div>
            )}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {orderDetails.items.map((item) => {
            const promoPct = Number(item.promotionalDiscount) || 0;
            const price = item.price;
            const qty = Number(item.quantity);
            const promoDiscount = price * qty * (promoPct / 100);
            const subtotal = price * qty;
            const total = subtotal - promoDiscount;

            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 16,
                  background: theme.colors.surface,
                  borderRadius: 8,
                  boxShadow: `0 1px 4px ${theme.colors.shadow}`,
                  padding: 16,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 6,
                    background: "#f6f6f6",
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span
                        style={{
                          fontWeight: 500,
                          marginBottom: 4,
                          color: theme.colors.text,
                          fontSize: "1.08rem",
                        }}
                      >
                        {item.name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: theme.colors.textLight,
                        }}
                      >
                        SKU: {item.sku}
                      </span>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 110 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: theme.colors.primary,
                          fontSize: "1.08rem",
                        }}
                      >
                        ${total.toFixed(2)}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: theme.colors.textLight,
                        }}
                      >
                        Total
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 8,
                      gap: 12,
                    }}
                  >
                    <div
                      style={{ color: theme.colors.text, fontSize: "0.98rem" }}
                    >
                      x{qty} · ${price.toFixed(2)} c/u ={" "}
                      <b>${subtotal.toFixed(2)}</b>
                    </div>
                    {promoPct > 0 && (
                      <div
                        style={{
                          color: theme.colors.success,
                          fontWeight: 500,
                          fontSize: "0.98rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        -{promoPct}% (${promoDiscount.toFixed(2)})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <OrderSummary>
          <SummaryRow>
            <SummaryLabel>Subtotal:</SummaryLabel>
            <SummaryValue>${orderDetails.rawSubtotal.toFixed(2)}</SummaryValue>
          </SummaryRow>
          {orderDetails.totalPromotionalDiscount > 0 && (
            <>
              <SummaryRow>
                <SummaryLabel>Descuentos promocionales:</SummaryLabel>
                <SummaryValue>
                  -${orderDetails.totalPromotionalDiscount.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel></SummaryLabel>
                <SummaryValue>
                  ${orderDetails.subtotalAfterPromo.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
            </>
          )}
          {orderDetails.discount > 0 && (
            <>
              <SummaryRow>
                <SummaryLabel>Descuento general:</SummaryLabel>
                <SummaryValue>
                  -${orderDetails.generalDiscount.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel></SummaryLabel>
                <SummaryValue>
                  ${orderDetails.subtotalAfterGeneral.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
            </>
          )}
          {orderDetails.aditionalDiscount > 0 && (
            <>
              <SummaryRow>
                <SummaryLabel>Descuento especial:</SummaryLabel>
                <SummaryValue>
                  -${orderDetails.aditionalDiscount.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Subtotal tras descuento especial:</SummaryLabel>
                <SummaryValue>
                  $
                  {(orderDetails.totalFinal < 0
                    ? 0
                    : orderDetails.totalFinal
                  ).toFixed(2)}
                </SummaryValue>
              </SummaryRow>
            </>
          )}
          {/* Fila de IVA */}
          {orderDetails.iva > 0 && (
            <SummaryRow>
              <SummaryLabel>IVA ({orderDetails.iva}%):</SummaryLabel>
              <SummaryValue>+${orderDetails.valorIVA.toFixed(2)}</SummaryValue>
            </SummaryRow>
          )}
          <SummaryRow>
            <SummaryLabel>Total:</SummaryLabel>
            <SummaryValue>${orderDetails.totalConIva.toFixed(2)}</SummaryValue>
          </SummaryRow>
        </OrderSummary>
      </Section>
    </PageContainer>
  );
};

export default DetallePedidoCoordinador;
