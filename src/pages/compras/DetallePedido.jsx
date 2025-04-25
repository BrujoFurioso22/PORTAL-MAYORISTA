import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAppTheme } from "../../context/AppThemeContext";
import Button from "../../components/ui/Button";

// Estilos para el componente
const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${props => props.theme.colors.background};
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
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
  color: ${props => props.theme.colors.text};
`;

const OrderDate = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textLight};
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
  background-color: ${props => {
    switch (props.status) {
      case 'pendiente': return props.theme.colors.warning + '33';
      case 'en-proceso': return props.theme.colors.info + '33';
      case 'enviado': return props.theme.colors.primary + '33';
      case 'entregado': return props.theme.colors.success + '33';
      case 'cancelado': return props.theme.colors.error + '33';
      default: return props.theme.colors.border;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pendiente': return props.theme.colors.warning;
      case 'en-proceso': return props.theme.colors.info;
      case 'enviado': return props.theme.colors.primary;
      case 'entregado': return props.theme.colors.success;
      case 'cancelado': return props.theme.colors.error;
      default: return props.theme.colors.textLight;
    }
  }};
`;

const Section = styled.section`
  background-color: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px ${props => props.theme.colors.shadow};
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 16px;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: ${props => props.theme.colors.border};
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
  color: ${props => props.theme.colors.textLight};
`;

const Value = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

const ProductsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const ProductsHead = styled.thead`
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ProductsHeadCell = styled.th`
  text-align: left;
  padding: 12px 16px;
  color: ${props => props.theme.colors.textLight};
  font-weight: 500;
  font-size: 0.9rem;
`;

const ProductsBody = styled.tbody``;

const ProductRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
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
  color: ${props => props.theme.colors.text};
`;

const ProductSKU = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textLight};
`;

const OrderSummary = styled.div`
  margin-top: 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
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
  color: ${props => props.theme.colors.textLight};
`;

const SummaryValue = styled.span`
  color: ${props => props.theme.colors.text};
`;

const TrackingSteps = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

const TrackingStep = styled.div`
  display: flex;
  margin-bottom: 20px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 35px;
    bottom: -15px;
    width: 2px;
    background-color: ${props => props.theme.colors.border};
  }
  
  &:last-child::before {
    display: none;
  }
`;

const StepIconContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.completed ? props.theme.colors.primary : props.theme.colors.surface};
  border: 2px solid ${props => props.completed ? props.theme.colors.primary : props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.completed ? props.theme.colors.white : props.theme.colors.textLight};
  margin-right: 16px;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  margin: 0 0 4px 0;
  color: ${props => props.theme.colors.text};
`;

const StepDate = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textLight};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
`;

// Datos de prueba para un pedido específico
const mockOrderDetails = {
  id: 'ORD-2025-1002',
  date: new Date(2025, 3, 10), // 10 de abril de 2025
  status: 'enviado',
  customer: {
    name: 'Carlos Rodriguez',
    email: 'carlos@example.com',
    phone: '555-123-4567'
  },
  shipping: {
    address: 'Av. Principal 123',
    city: 'Ciudad de México',
    state: 'CDMX',
    postalCode: '01234',
    method: 'Envío estándar',
    cost: 120.00
  },
  payment: {
    method: 'Transferencia bancaria',
    status: 'Pagado',
    reference: 'REF-123456',
    date: new Date(2025, 3, 10)
  },
  items: [
    {
      id: 1,
      name: 'Monitor LED 24"',
      sku: 'MON-24-LED',
      price: 2500,
      quantity: 1,
      discount: 10,
      total: 2250,
      image: 'https://placehold.co/50x50/png'
    },
    {
      id: 2,
      name: 'Teclado Mecánico RGB',
      sku: 'TEC-MEC-RGB',
      price: 1200,
      quantity: 2,
      discount: 0,
      total: 2400,
      image: 'https://placehold.co/50x50/png'
    },
    {
      id: 3,
      name: 'Mousepad XL Gamer',
      sku: 'MOU-PAD-XL',
      price: 350,
      quantity: 1,
      discount: 0,
      total: 350,
      image: 'https://placehold.co/50x50/png'
    }
  ],
  subtotal: 5000,
  discount: 250,
  tax: 760,
  total: 5630,
  tracking: [
    {
      step: 'Pedido recibido',
      date: new Date(2025, 3, 10, 9, 30),
      completed: true
    },
    {
      step: 'Pago confirmado',
      date: new Date(2025, 3, 10, 11, 15),
      completed: true
    },
    {
      step: 'En preparación',
      date: new Date(2025, 3, 11, 8, 45),
      completed: true
    },
    {
      step: 'Enviado',
      date: new Date(2025, 3, 12, 14, 20),
      completed: true
    },
    {
      step: 'Entregado',
      date: null,
      completed: false
    }
  ],
  empresaInfo: {
    id: 'stox',
    name: 'Stox',
    logo: 'https://placehold.co/100x50/png'
  }
};

const DetallePedido = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Traducir estado a español para mostrar
  const translateStatus = (status) => {
    const statusMap = {
      'pendiente': 'Pendiente',
      'en-proceso': 'En Proceso',
      'enviado': 'Enviado',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    // Simular carga de datos desde una API
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // En un caso real, aquí harías una llamada a la API
        // const response = await api.getOrderDetails(orderId);
        // setOrderDetails(response.data);
        
        // Para este ejemplo, usamos datos mock
        setTimeout(() => {
          // Verificamos que el ID coincida con nuestros datos mock
          if (mockOrderDetails.id === orderId) {
            setOrderDetails(mockOrderDetails);
          } else {
            // Si no coincide, podemos mostrar un error o redirigir
            console.error(`Pedido ${orderId} no encontrado`);
            // Por ahora usamos el mock de todas formas
            setOrderDetails(mockOrderDetails);
          }
          setLoading(false);
        }, 800); // Simulamos un pequeño delay de carga
      } catch (error) {
        console.error("Error al cargar detalles del pedido:", error);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleCancelOrder = () => {
    // Aquí iría la lógica para cancelar el pedido
    alert("Función para cancelar pedido - No implementada");
  };

  const handleContactSupport = () => {
    // Aquí iría la lógica para contactar a soporte
    alert("Función para contactar soporte - No implementada");
  };

  if (loading) {
    return (
      <PageContainer>
        <BackLink onClick={() => navigate('/mis-pedidos')}>
          ← Volver a mis pedidos
        </BackLink>
        <EmptyState>Cargando detalles del pedido...</EmptyState>
      </PageContainer>
    );
  }

  if (!orderDetails) {
    return (
      <PageContainer>
        <BackLink onClick={() => navigate('/mis-pedidos')}>
          ← Volver a mis pedidos
        </BackLink>
        <EmptyState>
          <h2>Pedido no encontrado</h2>
          <p>No pudimos encontrar la información del pedido solicitado.</p>
          <Button
            text="Volver a mis pedidos"
            variant="solid"
            onClick={() => navigate('/mis-pedidos')}
          />
        </EmptyState>
      </PageContainer>
    );
  }

  const canCancel = orderDetails.status === 'pendiente' || orderDetails.status === 'en-proceso';

  return (
    <PageContainer>
      <BackLink onClick={() => navigate('/mis-pedidos')}>
        ← Volver a mis pedidos
      </BackLink>
      
      <PageHeader>
        <OrderTitle>
          <OrderNumber>{orderDetails.id}</OrderNumber>
          <OrderDate>
            Realizado el {format(orderDetails.date, "d 'de' MMMM, yyyy", { locale: es })}
          </OrderDate>
        </OrderTitle>
        
        <OrderActions>
          {canCancel && (
            <Button
              text="Cancelar pedido"
              variant="outlined"
              onClick={handleCancelOrder}
            />
          )}
          <Button
            text="Contactar soporte"
            variant="solid"
            backgroundColor={theme.colors.primary}
            onClick={handleContactSupport}
          />
        </OrderActions>
      </PageHeader>
      
      <Section>
        <SectionTitle>
          Estado del pedido: <StatusBadge status={orderDetails.status}>
            {translateStatus(orderDetails.status)}
          </StatusBadge>
        </SectionTitle>
        
        <TrackingSteps>
          {orderDetails.tracking.map((step, index) => (
            <TrackingStep key={index}>
              <StepIconContainer completed={step.completed}>
                {step.completed ? "✓" : index + 1}
              </StepIconContainer>
              <StepContent>
                <StepTitle>{step.step}</StepTitle>
                <StepDate>
                  {step.date
                    ? format(step.date, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
                    : "Pendiente"}
                </StepDate>
              </StepContent>
            </TrackingStep>
          ))}
        </TrackingSteps>
      </Section>
      
      <TwoColumns>
        <Section>
          <SectionTitle>Datos del cliente</SectionTitle>
          
          <InfoItem>
            <Label>Nombre:</Label>
            <Value>{orderDetails.customer.name}</Value>
          </InfoItem>
          
          <InfoItem>
            <Label>Email:</Label>
            <Value>{orderDetails.customer.email}</Value>
          </InfoItem>
          
          <InfoItem>
            <Label>Teléfono:</Label>
            <Value>{orderDetails.customer.phone}</Value>
          </InfoItem>
        </Section>
        
        <Section>
          <SectionTitle>Información de pago</SectionTitle>
          
          <InfoItem>
            <Label>Método de pago:</Label>
            <Value>{orderDetails.payment.method}</Value>
          </InfoItem>
          
          <InfoItem>
            <Label>Estado:</Label>
            <Value>{orderDetails.payment.status}</Value>
          </InfoItem>
          
          <InfoItem>
            <Label>Referencia:</Label>
            <Value>{orderDetails.payment.reference}</Value>
          </InfoItem>
          
          <InfoItem>
            <Label>Fecha de pago:</Label>
            <Value>
              {format(orderDetails.payment.date, "d 'de' MMMM, yyyy", { locale: es })}
            </Value>
          </InfoItem>
        </Section>
      </TwoColumns>
      
      <Section>
        <SectionTitle>Información de envío</SectionTitle>
        
        <InfoItem>
          <Label>Dirección:</Label>
          <Value>{orderDetails.shipping.address}</Value>
        </InfoItem>
        
        <InfoItem>
          <Label>Ciudad:</Label>
          <Value>{orderDetails.shipping.city}</Value>
        </InfoItem>
        
        <InfoItem>
          <Label>Estado:</Label>
          <Value>{orderDetails.shipping.state}</Value>
        </InfoItem>
        
        <InfoItem>
          <Label>Código postal:</Label>
          <Value>{orderDetails.shipping.postalCode}</Value>
        </InfoItem>
        
        <InfoItem>
          <Label>Método de envío:</Label>
          <Value>{orderDetails.shipping.method}</Value>
        </InfoItem>
      </Section>
      
      <Section>
        <SectionTitle>Productos</SectionTitle>
        
        <ProductsTable>
          <ProductsHead>
            <tr>
              <ProductsHeadCell>Producto</ProductsHeadCell>
              <ProductsHeadCell>Precio unitario</ProductsHeadCell>
              <ProductsHeadCell>Cantidad</ProductsHeadCell>
              <ProductsHeadCell>Descuento</ProductsHeadCell>
              <ProductsHeadCell>Total</ProductsHeadCell>
            </tr>
          </ProductsHead>
          
          <ProductsBody>
            {orderDetails.items.map(item => (
              <ProductRow key={item.id}>
                <ProductCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ProductImage src={item.image} alt={item.name} />
                    <ProductInfo>
                      <ProductName>{item.name}</ProductName>
                      <ProductSKU>SKU: {item.sku}</ProductSKU>
                    </ProductInfo>
                  </div>
                </ProductCell>
                <ProductCell>${item.price.toFixed(2)}</ProductCell>
                <ProductCell>{item.quantity}</ProductCell>
                <ProductCell>{item.discount > 0 ? `${item.discount}%` : '-'}</ProductCell>
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
          
          <SummaryRow>
            <SummaryLabel>Descuento:</SummaryLabel>
            <SummaryValue>-${orderDetails.discount.toFixed(2)}</SummaryValue>
          </SummaryRow>
          
          <SummaryRow>
            <SummaryLabel>IVA (16%):</SummaryLabel>
            <SummaryValue>${orderDetails.tax.toFixed(2)}</SummaryValue>
          </SummaryRow>
          
          <SummaryRow>
            <SummaryLabel>Envío:</SummaryLabel>
            <SummaryValue>${orderDetails.shipping.cost.toFixed(2)}</SummaryValue>
          </SummaryRow>
          
          <SummaryRow>
            <SummaryLabel>Total:</SummaryLabel>
            <SummaryValue>${orderDetails.total.toFixed(2)}</SummaryValue>
          </SummaryRow>
        </OrderSummary>
      </Section>
    </PageContainer>
  );
};

export default DetallePedido;