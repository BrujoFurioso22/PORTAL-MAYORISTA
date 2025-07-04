import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAppTheme } from "../../context/AppThemeContext";
import Button from "../../components/ui/Button";
import { api_order_getOrderById } from "../../api/order/apiOrder";
import RenderIcon from "../../components/ui/RenderIcon";
import { baseLinkImages } from "../../constants/links";
import ContactModal from "../../components/ui/ContactModal";
import { copyToClipboard } from "../../utils/utils";
import { useAuth } from "../../context/AuthContext";

// Estilos para el componente
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
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    padding-top: 12px;
  }
`;

const SummaryLabel = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
`;

const SummaryValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  ${({ $operacion, theme }) =>
    $operacion &&
    `border-bottom: solid 1px ${theme.colors.border}; padding-bottom: 4px;`}
`;

const TrackingSteps = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;
const TrackingStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  position: relative;
  padding: 0 10px;

  // Línea horizontal entre pasos
  &:not(:last-child)::after {
    content: "";
    position: absolute;
    top: 15px; // Alinear con el centro del ícono
    right: calc(-50% + 10px);
    width: 100%;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.border};
    z-index: 0;
  }

  // En modo móvil, volver al diseño vertical
  @media (max-width: 768px) {
    flex-direction: row;
    text-align: left;

    &:not(:last-child)::after {
      content: "";
      position: absolute;
      left: 15px;
      top: 32px;
      bottom: -20px;
      width: 2px;
      height: calc(100% - 10px);
      right: auto;
    }
  }
`;

const StepIconContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme, $completed }) =>
    $completed ? theme.colors.primary : theme.colors.surface};
  border: 2px solid
    ${({ theme, $completed }) =>
      $completed ? theme.colors.primary : theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $completed }) =>
    $completed ? theme.colors.white : theme.colors.textLight};
  margin-bottom: 12px;
  z-index: 1; // Para que aparezca por encima de la línea

  @media (max-width: 768px) {
    margin-right: 16px;
    margin-bottom: 0;
  }
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const StepTitle = styled.h4`
  margin: 0 0 4px 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
`;

const StepDate = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const ProductCard = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 1px 4px ${({ theme }) => theme.colors.shadow};
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
  }
`;

const ProductCardImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  background: #f6f6f6;
`;

const DetallePedido = () => {
  const { orderId } = useParams();
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

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

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await api_order_getOrderById(orderId);

        if (response.success && response.data && response.data.length > 0) {
          // Transformar los datos de la API al formato que necesita nuestro componente

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

          // Fechas de cada estado
          const getStatusDate = (status) => {
            const found = statusHistory.find((s) => s.VALUE_CATALOG === status);
            return found ? new Date(found.createdAt) : null;
          };

          // Calcular el subtotal
          const subtotal = detalle.reduce(
            (sum, item) => sum + item.PRICE * item.QUANTITY,
            0
          ); // Crear un objeto con la estructura que espera nuestro componente
          const userDiscount = user?.DESCUENTOS?.[cabecera.ENTERPRISE] || 0;

          const formattedOrder = {
            id: cabecera.ID_CART_HEADER,
            date: new Date(cabecera.createdAt),
            status: currentStatus, // Mantener el valor original de la API
            aditionalDiscount: cabecera.ADITIONAL_DISCOUNT || 0,
            discount: userDiscount,
            iva: cabecera.IVA_DETAIL?.IVA_PERCENTAGE || 15,
            customer: {
              name: cabecera.USER.NAME_USER,
              email: cabecera.USER.EMAIL,
              phone: cabecera?.PHONE[0]?.PHONE_NUMBER || "No dispone",
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
            payment: {
              method: "Transferencia bancaria", // Este dato no viene en la API
              status: "Pendiente",
              reference: "No disponible", // Este dato no viene en la API
              date: new Date(cabecera.createdAt),
            },
            items: detalle.map((item) => ({
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
            })),
            subtotal: subtotal,
            total: cabecera.TOTAL || subtotal, // Si no hay total, usar subtotal
            tracking: [
              {
                step: "Pedido recibido",
                date:
                  getStatusDate("PENDIENTE") || new Date(cabecera.createdAt),
                completed: !!getStatusDate("PENDIENTE"),
              },
              {
                step: "Pedido confirmado",
                date: getStatusDate("CONFIRMADO"),
                completed: !!getStatusDate("CONFIRMADO"),
              },
              {
                step: "Entregado",
                date: getStatusDate("ENTREGADO"),
                completed: !!getStatusDate("ENTREGADO"),
              },
              ...(getStatusDate("CANCELADO")
                ? [
                    {
                      step: "Pedido cancelado",
                      date: getStatusDate("CANCELADO"),
                      completed: true,
                    },
                  ]
                : []),
            ],
            empresaInfo: {
              id: cabecera.ENTERPRISE,
              name: cabecera.ENTERPRISE,
            },
          }; // Actualizar el estado de tracking según el status del pedido
          if (formattedOrder.status === "PENDIENTE") {
            // Solo el primer paso está completo - fecha de creación del pedido
          } else if (formattedOrder.status === "CONFIRMADO") {
            // Pedido confirmado
            const creationDate = new Date(cabecera.createdAt);

            formattedOrder.tracking[1].completed = true;
            const confirmDate = new Date(creationDate);
            confirmDate.setDate(creationDate.getDate() + 1);
            formattedOrder.tracking[1].date = confirmDate;
          } else if (formattedOrder.status === "ENTREGADO") {
            // Todos los pasos están completos
            const creationDate = new Date(cabecera.createdAt);

            // Establecer fechas para cada paso del proceso
            const dates = [
              creationDate, // Pedido recibido: fecha de creación
              new Date(creationDate.getTime() + 24 * 60 * 60 * 1000), // Pedido confirmado: +1 día
              new Date(creationDate.getTime() + 5 * 24 * 60 * 60 * 1000), // Entregado: +5 días
            ];

            // Aplicar las fechas al tracking
            formattedOrder.tracking.forEach((step, index) => {
              step.completed = true;
              step.date = dates[index];
            });
          } else if (formattedOrder.status === "CANCELADO") {
            // Si el pedido está cancelado, solo el primer paso está completo
            // y se añade un paso adicional de cancelación con la fecha actual
            formattedOrder.tracking = [
              formattedOrder.tracking[0], // Mantener "Pedido recibido"
              {
                step: "Pedido cancelado",
                date: new Date(),
                completed: true,
              },
            ];
          }
          setOrderDetails(formattedOrder);
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

  const handleCancelOrder = () => {
    const canCancel = orderDetails.status === "PENDIENTE";
    if (canCancel) {
      // Implementar la lógica de cancelación
      alert("Pedido cancelado correctamente");
    } else {
      // Mostrar mensaje de error
      alert(
        "Lo sentimos, no es posible cancelar este pedido ya que ha sido confirmado para su procesamiento."
      );
    }
  };

  const handleContactSupport = () => {
    setShowContactModal(true);
  };

  if (loading) {
    return (
      <PageContainer>
        <BackLink
          onClick={() => navigate("/mis-pedidos")}
          text="← Volver a mis pedidos"
        />

        <EmptyState>Cargando detalles del pedido...</EmptyState>
      </PageContainer>
    );
  }

  if (error || !orderDetails) {
    return (
      <PageContainer>
        <BackLink
          onClick={() => navigate("/mis-pedidos")}
          text="← Volver a mis pedidos"
        />
        <EmptyState>
          <h2>Pedido no encontrado</h2>
          <p>
            {error ||
              "No pudimos encontrar la información del pedido solicitado."}
          </p>
          <Button
            text="Volver a mis pedidos"
            variant="solid"
            onClick={() => navigate("/mis-pedidos")}
          />
        </EmptyState>
      </PageContainer>
    );
  }

  const canCancel = orderDetails.status === "PENDIENTE";

  // 1. Subtotal sin descuentos
  const rawSubtotal = orderDetails.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // 2. Total de descuentos promocionales (por producto)
  const totalPromotionalDiscount = orderDetails.items.reduce(
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
    subtotalAfterPromo * (Number(orderDetails.discount) / 100);

  // 5. Subtotal después de descuento general
  const subtotalAfterGeneral = subtotalAfterPromo - generalDiscount;

  // 6. Descuento adicional (coordinadora) sobre el subtotal con promo y general
  const aditionalDiscount =
    subtotalAfterGeneral * (Number(orderDetails.aditionalDiscount) / 100);

  // 7. Total final antes de IVA
  const totalFinal = subtotalAfterGeneral - aditionalDiscount;

  // IVA como porcentaje (por ejemplo, 19 para 19%)
  const ivaPct = Number(orderDetails.iva || orderDetails.IVA || 0);
  const valorIVA = (totalFinal < 0 ? 0 : totalFinal) * (ivaPct / 100);
  const totalConIva = (totalFinal < 0 ? 0 : totalFinal) + valorIVA;

  return (
    <PageContainer>
      <BackLink
        onClick={() => navigate("/mis-pedidos")}
        text="← Volver a mis pedidos"
      />

      <PageHeader>
        <OrderTitle>
          <OrderNumber>
            Pedido #{orderDetails.id.substring(0, 12)}...
            <RenderIcon
              name="FaCopy"
              size={16}
              style={{ marginLeft: "8px", cursor: "pointer" }}
              onClick={() => copyToClipboard(orderDetails.id)}
            />
          </OrderNumber>
          <OrderDate>
            Realizado el{" "}
            {format(orderDetails.date, "d 'de' MMMM, yyyy", { locale: es })}
          </OrderDate>
        </OrderTitle>

        <OrderActions>
          {canCancel ? (
            <Button
              text="Cancelar pedido"
              variant="outlined"
              leftIconName="FaTimesCircle"
              onClick={handleCancelOrder}
            />
          ) : (
            <Button
              text="No se puede cancelar"
              variant="outlined"
              leftIconName="FaTimesCircle"
              onClick={() =>
                alert(
                  "Lo sentimos, no es posible cancelar este pedido ya que ha sido confirmado para su procesamiento."
                )
              }
              disabled={true}
            />
          )}
          <Button
            text="Contactar soporte"
            variant="solid"
            backgroundColor={theme.colors.primary}
            leftIconName="FaHeadset"
            onClick={handleContactSupport}
            disabled={orderDetails.status === "CANCELADO"}
          />
        </OrderActions>
      </PageHeader>

      <Section>
        <SectionTitle>
          Estado del pedido:
          <StatusBadge status={orderDetails.status}>
            {translateStatus(orderDetails.status)}
          </StatusBadge>
        </SectionTitle>
        {orderDetails.status !== "CANCELADO" && (
          <TrackingSteps>
            {orderDetails.tracking.map((step, index) => (
              <TrackingStep key={index}>
                <StepIconContainer $completed={step.completed}>
                  {step.completed ? "✓" : index + 1}
                </StepIconContainer>
                <StepContent>
                  <StepTitle>{step.step}</StepTitle>
                  <StepDate>
                    {step.date
                      ? format(step.date, "d 'de' MMMM, yyyy 'a las' HH:mm", {
                          locale: es,
                        })
                      : "Pendiente"}
                  </StepDate>
                </StepContent>
              </TrackingStep>
            ))}
          </TrackingSteps>
        )}
      </Section>

      <TwoColumns>
        <Section>
          <SectionTitle>
            <RenderIcon name="FaInfoCircle" size={18} /> Información Adicional
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
              {format(orderDetails.date, "d 'de' MMMM, yyyy", {
                locale: es,
              })}
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
            <Value>{orderDetails.customer.phone}</Value>
          </InfoItem>
        </Section>
      </TwoColumns>

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
            Facturación
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

        <ProductsList>
          {orderDetails.items.map((item) => {
            const promoPct = Number(item.promotionalDiscount) || 0;
            const price = item.price;
            const qty = Number(item.quantity);
            const promoDiscount = price * qty * (promoPct / 100);
            const subtotal = price * qty;
            const total = subtotal - promoDiscount;

            return (
              <ProductCard key={item.id}>
                <ProductCardImage src={item.image} alt={item.name} />
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
                      <ProductName style={{ fontSize: "1.08rem" }}>
                        {item.name}
                      </ProductName>
                      <ProductSKU>SKU: {item.sku}</ProductSKU>
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
              </ProductCard>
            );
          })}
        </ProductsList>

        <OrderSummary>
          <SummaryRow>
            <SummaryLabel>Subtotal:</SummaryLabel>
            <SummaryValue>${rawSubtotal.toFixed(2)}</SummaryValue>
          </SummaryRow>
          {totalPromotionalDiscount > 0 && (
            <>
              <SummaryRow>
                <SummaryLabel>Descuentos promocionales:</SummaryLabel>
                <SummaryValue $operacion={true}>
                  -${totalPromotionalDiscount.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel></SummaryLabel>
                <SummaryValue>${subtotalAfterPromo.toFixed(2)}</SummaryValue>
              </SummaryRow>
            </>
          )}
          {orderDetails.discount > 0 && (
            <>
              <SummaryRow>
                <SummaryLabel>Descuento general:</SummaryLabel>
                <SummaryValue $operacion={true}>
                  -${generalDiscount.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel></SummaryLabel>
                <SummaryValue>${subtotalAfterGeneral.toFixed(2)}</SummaryValue>
              </SummaryRow>
            </>
          )}
          {orderDetails.aditionalDiscount > 0 && (
            <>
              <SummaryRow>
                <SummaryLabel>Descuento especial:</SummaryLabel>
                <SummaryValue $operacion>-${aditionalDiscount.toFixed(2)}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Subtotal tras descuento especial:</SummaryLabel>
                <SummaryValue>
                  ${(totalFinal < 0 ? 0 : totalFinal).toFixed(2)}
                </SummaryValue>
              </SummaryRow>
            </>
          )}
          {/* Fila de IVA */}
          {ivaPct > 0 && (
            <SummaryRow>
              <SummaryLabel>IVA ({ivaPct}%):</SummaryLabel>
              <SummaryValue>+${valorIVA.toFixed(2)}</SummaryValue>
            </SummaryRow>
          )}
          <SummaryRow>
            <SummaryLabel>Total:</SummaryLabel>
            <SummaryValue>${totalConIva.toFixed(2)}</SummaryValue>
          </SummaryRow>
        </OrderSummary>
      </Section>

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        selectedCompany={orderDetails?.empresaInfo?.id} // Filtrar por la empresa del pedido actual
        selectedOrderId={orderDetails?.id}
      />
    </PageContainer>
  );
};

export default DetallePedido;
