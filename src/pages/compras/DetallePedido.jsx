import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { format, formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { useAppTheme } from "../../context/AppThemeContext";
import Button from "../../components/ui/Button";
import { order_getOrderById } from "../../services/order/order";
import RenderIcon from "../../components/ui/RenderIcon";
import { baseLinkImages } from "../../constants/links";
import ContactModal from "../../components/ui/ContactModal";

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
      case "PREPARANDO":
        return theme.colors.primary + "33";
      case "ENVIADO":
        return theme.colors.success + "33";
      case "ENTREGADO":
        return theme.colors.primary + "33";
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
      case "PREPARANDO":
        return theme.colors.primary;
      case "ENVIADO":
        return theme.colors.success;
      case "ENTREGADO":
        return theme.colors.primary;
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

const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: 20px 0;
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

const DetallePedido = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Traducir estado a español para mostrar
  const translateStatus = (status) => {
    const statusMap = {
      PENDIENTE: "Pendiente",
      CONFIRMADO: "Confirmado",
      PREPARANDO: "En preparación",
      ENVIADO: "Enviado",
      ENTREGADO: "Entregado",
      CANCELADO: "Cancelado",
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await order_getOrderById(orderId);

        if (response.success && response.data && response.data.length > 0) {
          // Transformar los datos de la API al formato que necesita nuestro componente
          const apiOrder = response.data[0];
          const cabecera = apiOrder.CABECERA;
          const detalle = apiOrder.DETALLE || [];

          // Calcular el subtotal
          const subtotal = detalle.reduce(
            (sum, item) => sum + item.PRICE * item.QUANTITY,
            0
          );

          // Crear un objeto con la estructura que espera nuestro componente
          const formattedOrder = {
            id: cabecera.ID_CART_HEADER,
            date: new Date(cabecera.createdAt),
            // status: cabecera.STATUS.toLowerCase(),
            status: "ENVIADO", // Para propósitos de demostración, usar un estado fijo
            customer: {
              name: cabecera.USER.NAME_USER,
              email: cabecera.USER.EMAIL,
              phone: "No disponible", // Este dato no viene en la API
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
              discount: 0, // Este dato no viene en la API
              total: item.PRICE * item.QUANTITY,
              image: item.MAESTRO?.DMA_RUTAIMAGEN
                ? `${baseLinkImages}${item.MAESTRO.DMA_RUTAIMAGEN}`
                : "https://placehold.co/50x50/png",
            })),
            subtotal: subtotal,
            discount: cabecera.DISCOUNT || 0,
            total: cabecera.TOTAL || subtotal, // Si no hay total, usar subtotal
            tracking: [
              {
                step: "Pedido recibido",
                date: new Date(cabecera.createdAt),
                completed: true,
              },
              {
                step: "Pedido confirmado",
                date: null,
                completed: false,
              },
              {
                step: "En preparación",
                date: null,
                completed: false,
              },
              {
                step: "Enviado",
                date: null,
                completed: false,
              },
              {
                step: "Entregado",
                date: null,
                completed: false,
              },
            ],
            empresaInfo: {
              id: cabecera.ENTERPRISE,
              name: cabecera.ENTERPRISE,
            },
          };

          // Actualizar el estado de tracking según el status del pedido
          if (formattedOrder.status === "PENDIENTE") {
            // Solo el primer paso está completo - fecha de creación del pedido
          } else if (formattedOrder.status === "CONFIRMADO") {
            // Calcular fechas progresivas basadas en la fecha de creación
            const creationDate = new Date(cabecera.createdAt);

            // Pedido confirmado: 1 día después de la creación
            formattedOrder.tracking[1].completed = true;
            const confirmDate = new Date(creationDate);
            confirmDate.setDate(creationDate.getDate() + 1);
            formattedOrder.tracking[1].date = confirmDate;
          } else if (formattedOrder.status === "PREPARANDO") {
            // Calcular fechas progresivas basadas en la fecha de creación
            const creationDate = new Date(cabecera.createdAt);

            // Pedido confirmado: 1 día después de la creación
            formattedOrder.tracking[1].completed = true;
            const confirmDate = new Date(creationDate);
            confirmDate.setDate(creationDate.getDate() + 1);
            formattedOrder.tracking[1].date = confirmDate;

            // En preparación: 2 días después de la creación
            formattedOrder.tracking[2].completed = true;
            const preparationDate = new Date(creationDate);
            preparationDate.setDate(creationDate.getDate() + 2);
            formattedOrder.tracking[2].date = preparationDate;
          } else if (formattedOrder.status === "ENVIADO") {
            // Calcular fechas progresivas basadas en la fecha de creación
            const creationDate = new Date(cabecera.createdAt);

            // Establecer fechas para los primeros 4 pasos
            formattedOrder.tracking[1].completed = true;
            formattedOrder.tracking[1].date = new Date(
              creationDate.getTime() + 24 * 60 * 60 * 1000
            ); // +1 día

            formattedOrder.tracking[2].completed = true;
            formattedOrder.tracking[2].date = new Date(
              creationDate.getTime() + 2 * 24 * 60 * 60 * 1000
            ); // +2 días

            formattedOrder.tracking[3].completed = true;
            formattedOrder.tracking[3].date = new Date(
              creationDate.getTime() + 3 * 24 * 60 * 60 * 1000
            ); // +3 días
          } else if (formattedOrder.status === "ENTREGADO") {
            // Todos los pasos están completos
            const creationDate = new Date(cabecera.createdAt);

            // Establecer fechas para cada paso del proceso
            const dates = [
              creationDate, // Pedido recibido: fecha de creación
              new Date(creationDate.getTime() + 24 * 60 * 60 * 1000), // Pedido confirmado: +1 día
              new Date(creationDate.getTime() + 2 * 24 * 60 * 60 * 1000), // En preparación: +2 días
              new Date(creationDate.getTime() + 3 * 24 * 60 * 60 * 1000), // Enviado: +3 días
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
    const canCancel = orderDetails.status.toUpperCase() === "PENDIENTE";
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
          Estado del pedido:{" "}
          <StatusBadge status={orderDetails.status}>
            {translateStatus(orderDetails.status.toUpperCase())}
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

        <ProductsTable>
          <ProductsHead>
            <tr>
              <ProductsHeadCell>Producto</ProductsHeadCell>
              <ProductsHeadCell>Precio unitario</ProductsHeadCell>
              <ProductsHeadCell>Cantidad</ProductsHeadCell>
              <ProductsHeadCell>Total</ProductsHeadCell>
            </tr>
          </ProductsHead>

          <ProductsBody>
            {orderDetails.items.map((item) => (
              <ProductRow key={item.id}>
                <ProductCell>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <ProductImage src={item.image} alt={item.name} />
                    <ProductInfo>
                      <ProductName>{item.name}</ProductName>
                      <ProductSKU>SKU: {item.sku}</ProductSKU>
                    </ProductInfo>
                  </div>
                </ProductCell>
                <ProductCell>${item.price.toFixed(2)}</ProductCell>
                <ProductCell>{item.quantity}</ProductCell>
                <ProductCell>${item.total.toFixed(2)}</ProductCell>
              </ProductRow>
            ))}
          </ProductsBody>
        </ProductsTable>

        <OrderSummary>
          <SummaryRow>
            <SummaryLabel>Subtotal:</SummaryLabel>
            <SummaryValue>${orderDetails.subtotal.toFixed(2)}</SummaryValue>
          </SummaryRow>

          {orderDetails.discount > 0 && (
            <SummaryRow>
              <SummaryLabel>Descuento:</SummaryLabel>
              <SummaryValue>-${orderDetails.discount.toFixed(2)}</SummaryValue>
            </SummaryRow>
          )}

          <SummaryRow>
            <SummaryLabel>Total:</SummaryLabel>
            <SummaryValue>${orderDetails.total.toFixed(2)}</SummaryValue>
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
