import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { products } from "../../mock/products";
import { useCart } from "../../context/CartContext";
import Button from "../../components/ui/Button";
import { productosPorEmpresa } from "../../mock/products";
import { useAppTheme } from "../../context/AppThemeContext";
import { useAuth } from "../../context/AuthContext";

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${({ theme }) =>
    theme.colors.background}; // Añadir color de fondo
  color: ${({ theme }) => theme.colors.text}; // Añadir color de texto
`;

const ProductLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background-color: ${({ theme }) =>
    theme.colors.background}; // Añadir color de fondo

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const MainImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  background-color: ${({ theme }) =>
    theme.colors.white}; // Fondo blanco para imágenes
  box-shadow: 0 4px 10px ${({ theme }) => theme.colors.shadow}; // Usar shadow del tema
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Category = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
  margin-bottom: 8px;
`;

const ProductTitle = styled.h1`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.8rem;
`;

const Brand = styled.div`
  margin-bottom: 20px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textLight};
`;

const PriceContainer = styled.div`
  margin: 24px 0;
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

const CurrentPrice = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const OriginalPrice = styled.span`
  font-size: 1.2rem;
  text-decoration: line-through;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Discount = styled.span`
  background-color: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.white}; // Solo una definición de color
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9rem;
`;

const Description = styled.p`
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 24px;
`;

const Stock = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
`;

const StockDot = styled.span`
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background-color: ${({ theme, $inStock }) =>
    $inStock ? theme.colors.success : theme.colors.error};
`;

const StockText = styled.span`
  color: ${({ theme, $inStock }) =>
    $inStock ? theme.colors.success : theme.colors.error};
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
`;

const QuantityButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) =>
    theme.colors.surface}; // Usar surface en lugar de "white"
  color: ${({ theme }) => theme.colors.text}; // Añadir color de texto explícito
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;

  &:first-child {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const QuantityInput = styled.input`
  width: 50px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 1rem;
  background-color: ${({ theme }) =>
    theme.colors.surface}; // Añadir color de fondo
  color: ${({ theme }) => theme.colors.text}; // Añadir color de texto
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  margin-bottom: 24px;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;

// Agregar este nuevo componente para las especificaciones
const SpecificationsSection = styled.div`
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const SpecificationsTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const SpecificationsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const SpecRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const SpecLabel = styled.td`
  padding: 8px 0;
  font-weight: 500;
  width: 40%;
  color: ${({ theme }) => theme.colors.textLight};
`;

const SpecValue = styled.td`
  padding: 8px 0;
  color: ${({ theme }) => theme.colors.text};
`;

// En el componente DetalleProducto, agregar esta función para renderizar especificaciones
const renderSpecifications = (product) => {
  if (!product.specs || Object.keys(product.specs).length === 0) {
    return null;
  }

  return (
    <SpecificationsSection>
      <SpecificationsTitle>Especificaciones técnicas</SpecificationsTitle>
      <SpecificationsTable>
        <tbody>
          {Object.entries(product.specs).map(([key, value]) => (
            <SpecRow key={key}>
              <SpecLabel>
                {key.charAt(0).toUpperCase() +
                  key.slice(1).replace(/([A-Z])/g, " $1")}
              </SpecLabel>
              <SpecValue>{value.toString()}</SpecValue>
            </SpecRow>
          ))}
        </tbody>
      </SpecificationsTable>
    </SpecificationsSection>
  );
};

const DetalleProducto = () => {
  const { id } = useParams();
  const { theme } = useAppTheme();
  const navigate = useNavigate();
  const { navigateToHomeByRole } = useAuth();
  const { addToCart, isAdminOrCoord } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);

  const handleNavigate = () => {
    navigateToHomeByRole();
  };

  useEffect(() => {
    // Buscar el producto en todas las empresas
    let foundProduct = null;
    let foundEmpresaId = null;

    console.log("Buscando producto con ID:", id); // Para depuración

    // Recorrer todas las empresas y buscar el producto - probar diferentes comparaciones
    Object.entries(productosPorEmpresa).forEach(([empresaId, productos]) => {
      // Intentar encontrar con ID como string y como número
      const found = productos.find(
        (p) => p.id.toString() === id.toString() || p.id === parseInt(id)
      );

      if (found) {
        console.log("Producto encontrado:", found);
        foundProduct = found;
        foundEmpresaId = empresaId;
      }
    });

    if (foundProduct) {
      setProduct(foundProduct);
      setEmpresaId(foundEmpresaId);
    } else {
      console.log("Producto no encontrado, redirigiendo al home");
      handleNavigate();
    }
  }, [id, navigate]);

  if (!product) {
    return <div>Cargando...</div>;
  }
  // El resto del código permanece igual, pero actualiza el navegateBack
  const navigateBack = () => {
    if (empresaId) {
      navigate(`/catalogo/${empresaId}`);
    } else {
      handleNavigate();
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <PageContainer>
      <BackLink onClick={navigateBack}>← Regresar al catálogo</BackLink>

      <ProductLayout>
        <ImageSection>
          <MainImage src={product.image} alt={product.name} />
        </ImageSection>

        <InfoSection>
          <Category>{product.categories.map((cat) => cat).join(", ")}</Category>
          <ProductTitle>{product.name}</ProductTitle>
          <Brand>Marca: {product.brand}</Brand>

          <Description>{product.description}</Description>

          {renderSpecifications(product)}

          <PriceContainer>
            <CurrentPrice>${discountedPrice.toFixed(2)}</CurrentPrice>
            {product.discount > 0 && (
              <>
                <OriginalPrice>${product.price.toFixed(2)}</OriginalPrice>
                <Discount>-{product.discount}%</Discount>
              </>
            )}
          </PriceContainer>

          <Stock>
            <StockDot $inStock={product.stock > 0} />
            <StockText $inStock={product.stock > 0}>
              {product.stock > 0
                ? `En stock (${product.stock} unidades disponibles)`
                : "Agotado"}
            </StockText>
          </Stock>

          {!isAdminOrCoord && (
            <QuantitySelector>
              <QuantityButton onClick={decreaseQuantity}>-</QuantityButton>
              <QuantityInput
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
              />
              <QuantityButton onClick={increaseQuantity}>+</QuantityButton>
            </QuantitySelector>
          )}

          {!isAdminOrCoord && (
            <ButtonsContainer>
              <Button
                text="Agregar al carrito"
                variant="solid"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                backgroundColor={theme.colors.primary} // O cualquier otro color del tema que prefieras
                size="large"
                style={{ flex: 1 }}
              />
            </ButtonsContainer>
          )}
        </InfoSection>
      </ProductLayout>
    </PageContainer>
  );
};

export default DetalleProducto;
