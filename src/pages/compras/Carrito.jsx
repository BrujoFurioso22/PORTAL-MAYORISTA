import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import { useAppTheme } from '../../context/AppThemeContext';

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
  background-color: ${props => props.theme.colors.background};
`;

const PageTitle = styled.h1`
  margin: 0 0 24px 0;
  color: ${props => props.theme.colors.text};
`;

const CartEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  background-color: ${props => props.theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${props => props.theme.colors.shadow};
`;

const EmptyCartIcon = styled.div`
  font-size: 4rem;
  color: ${props => props.theme.colors.textLight};
  margin-bottom: 16px;
`;

const EmptyCartText = styled.p`
  font-size: 1.2rem;
  color: ${props => props.theme.colors.textLight};
  margin-bottom: 24px;
`;

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CartItemsList = styled.div`
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${props => props.theme.colors.shadow};
  overflow: hidden;
`;

const CartItem = styled.div`
  display: flex;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  background-color: ${props => props.theme.colors.white};
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
  color: ${props => props.theme.colors.text};
`;

const ItemBrand = styled.span`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textLight};
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
  color: ${props => props.theme.colors.text};
`;

const ItemQuantityControl = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  
  &:first-child {
    border-radius: 4px 0 0 4px;
  }
  
  &:last-child {
    border-radius: 0 4px 4px 0;
  }
  
  &:hover {
    background-color: ${props => props.theme.colors.background};
  }
`;

const QuantityInput = styled.input`
  width: 40px;
  height: 28px;
  border: 1px solid ${props => props.theme.colors.border};
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 0.9rem;
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.error};
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
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${props => props.theme.colors.shadow};
  padding: 20px;
  height: fit-content;
`;

const SummaryTitle = styled.h2`
  font-size: 1.2rem;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SummaryLabel = styled.span`
  color: ${props => props.theme.colors.textLight};
`;

const SummaryValue = styled.span`
  font-weight: ${props => props.bold ? 'bold' : 'normal'};
  color: ${props => props.theme.colors.text};
`;

const TotalRow = styled(SummaryRow)`
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid ${props => props.theme.colors.border};
  font-size: 1.1rem;
`;

const Carrito = () => {
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  
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
            onClick={() => navigate('/')}
            backgroundColor={theme.colors.primary}
          />
        </CartEmptyState>
      </PageContainer>
    );
  }
  
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };
  
  const handleCheckout = () => {
    alert('Procesando pedido...\n\nEsta sería la redirección al checkout.');
    clearCart();
    navigate('/');
  };
  
  return (
    <PageContainer>
      <PageTitle>Carrito de compras</PageTitle>
      
      <CartLayout>
        <CartItemsList>
          {cart.map(item => {
            const discountedPrice = item.discount 
              ? item.price * (1 - item.discount / 100) 
              : item.price;
              
            const itemTotal = discountedPrice * item.quantity;
            
            return (
              <CartItem key={item.id}>
                <ItemImage src={item.image} alt={item.name} />
                
                <ItemDetails>
                  <ItemName>{item.name}</ItemName>
                  <ItemBrand>{item.brand}</ItemBrand>
                  
                  <ItemQuantityControl>
                    <QuantityButton 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      -
                    </QuantityButton>
                    <QuantityInput 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                    />
                    <QuantityButton 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </QuantityButton>
                  </ItemQuantityControl>
                </ItemDetails>
                
                <ItemPricing>
                  <ItemPrice>${itemTotal.toFixed(2)}</ItemPrice>
                  <RemoveButton onClick={() => removeFromCart(item.id)}>
                    Eliminar
                  </RemoveButton>
                </ItemPricing>
              </CartItem>
            );
          })}
        </CartItemsList>
        
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
          
          <Button 
            text="Proceder al pago" 
            variant="solid" 
            backgroundColor={theme.colors.success}
            style={{ width: '100%', marginTop: '20px' }}
            onClick={handleCheckout}
          />
          
          <Button 
            text="Seguir comprando" 
            variant="outline" 
            style={{ width: '100%', marginTop: '12px' }}
            onClick={() => navigate('/')}
          />
        </OrderSummary>
      </CartLayout>
    </PageContainer>
  );
};

export default Carrito;