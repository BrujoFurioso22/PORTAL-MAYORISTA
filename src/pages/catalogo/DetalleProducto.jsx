import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../../context/CartContext";
import Button from "../../components/ui/Button";
import { productosPorEmpresa } from "../../mock/products";
import { useAuth } from "../../context/AuthContext";
import { PRODUCT_LINE_CONFIG } from "../../constants/productLineConfig";
import { toast } from "react-toastify";

const PageContainer = styled.div`
  /* padding: 24px; */
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
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textLight};
`;

const PriceContainer = styled.div`
  margin-top: 16px;
  margin-bottom: 10px;
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
  /* margin-bottom: 24px; */
`;
const StockIndicator = styled.div`
  margin: 16px 0;
  padding: 12px 16px;
  border-radius: 6px;
  background-color: ${
    ({ theme, $inStock }) =>
      $inStock
        ? `${theme.colors.success}10` // Color verde con 10% de opacidad
        : `${theme.colors.error}10` // Color rojo con 10% de opacidad
  };
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StockBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${({ theme, $inStock }) =>
    $inStock ? theme.colors.success : theme.colors.error};
  color: ${({ theme }) => theme.colors.white};
`;

const StockMessage = styled.span`
  font-size: 0.9rem;
  color: ${({ theme, $inStock }) =>
    $inStock ? theme.colors.success : theme.colors.error};
  font-weight: 500;
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  /* margin: 20px 0; */
`;

const QuantityButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, disabled }) =>
    disabled ? `${theme.colors.border}` : theme.colors.surface};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textLight : theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
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
  width: 60px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 1rem;
  background-color: ${({ theme, disabled }) =>
    disabled ? `${theme.colors.border}30` : theme.colors.surface};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textLight : theme.colors.text};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "text")};
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

  // Obtener la configuración correspondiente a la línea de negocio
  const lineConfig =
    PRODUCT_LINE_CONFIG[product.lineaNegocio] || PRODUCT_LINE_CONFIG.DEFAULT;

  return (
    <SpecificationsSection>
      <SpecificationsTitle>Especificaciones técnicas</SpecificationsTitle>
      <SpecificationsTable>
        <tbody>
          {lineConfig.specs.map((specConfig) => {
            const value = product.specs[specConfig.field];

            // Solo mostrar si hay un valor
            if (value === null) return null;

            return (
              <SpecRow key={specConfig.field}>
                <SpecLabel>{specConfig.label}</SpecLabel>
                <SpecValue>{value}</SpecValue>
              </SpecRow>
            );
          })}
        </tbody>
      </SpecificationsTable>
    </SpecificationsSection>
  );
};

const DetalleProducto = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { navigateToHomeByRole } = useAuth();
  const { addToCart, isAdminOrCoord, cart } = useCart();
  const [quantity, setQuantity] = useState(1);
  // Intentar obtener el producto del estado de navegación primero
  const [product, setProduct] = useState(location.state?.product || null);
  const [empresaId, setEmpresaId] = useState(
    location.state?.product?.empresaId || null
  );

  const handleNavigate = () => {
    navigateToHomeByRole();
  };

  // Calcular cantidad actual en el carrito
  const currentInCart = React.useMemo(() => {
    if (!cart || !product) return 0;

    console.log(cart);
    

    const cartItem = cart.find((item) => item?.id === product.id);
    console.log(cartItem);
    
    console.log("Cantidad actual en el carrito:", cartItem ? cartItem.quantity : 0);
    

    return cartItem ? cartItem.quantity : 0;
  }, [cart, product]);

  // Calcular stock disponible restante
  const availableStock = React.useMemo(() => {
    if (!product) return 0;
    return Math.max(0, product.stock - currentInCart);
  }, [product, currentInCart]);

  // Ajustar la cantidad si excede el stock disponible
  useEffect(() => {
    if (quantity > availableStock) {
      setQuantity(Math.max(1, availableStock));
    }
  }, [availableStock]);

  useEffect(() => {
    // Si ya tenemos el producto del state, no necesitamos buscarlo
    if (product) {
      console.log("Producto obtenido del state de navegación:", product);

      return;
    }

    console.log("Buscando producto con ID:", id); // Para depuración

    // Implementación de búsqueda existente como fallback
    let foundProduct = null;
    let foundEmpresaId = null;

    // Recorrer todas las empresas y buscar el producto
    Object.entries(productosPorEmpresa).forEach(([empresaId, productos]) => {
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
  }, [id, navigate, product]);

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
    if (!isNaN(value) && value > 0 && value <= availableStock) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < availableStock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (quantity <= availableStock) {
      addToCart(product, quantity);
      // Opcionalmente, mostrar confirmación
      toast.success(`${quantity} ${product.name} agregado al carrito`);
    } else {
      toast.error(`Solo hay ${availableStock} unidades disponibles`);
    }
  };

  const discountedPrice =
    product.discount && product.price !== null
      ? product.price * (1 - product.discount / 100)
      : product.price || 0;

  return (
    <PageContainer>
      <BackLink onClick={navigateBack}>← Regresar al catálogo</BackLink>

      <ProductLayout>
        <ImageSection>
          <MainImage src={product.image} alt={product.name} />
        </ImageSection>

        <InfoSection>
          {/* Mostrar categoría formateada más amigable */}
          <Category>
            {product.categories
              .map((cat) =>
                cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
              )
              .join(", ")}
          </Category>
          <ProductTitle>{product.name}</ProductTitle>
          <Brand>Marca: {product.brand}</Brand>
          {/* Nuevo indicador de stock posicionado debajo del nombre y marca */}
          <StockIndicator $inStock={availableStock > 0}>
            <StockBadge $inStock={availableStock > 0}>
              {availableStock > 0 ? "DISPONIBLE" : "AGOTADO"}
            </StockBadge>
            <StockMessage $inStock={availableStock > 0}>
              {availableStock > 0 ? (
                <>
                  {availableStock}{" "}
                  {availableStock === 1
                    ? "unidad disponible"
                    : "unidades disponibles"}
                  {currentInCart > 0 && (
                    <span
                      style={{
                        marginLeft: "5px",
                        fontSize: "0.85em",
                        opacity: 0.9,
                      }}
                    >
                      (Ya tienes {currentInCart} en el carrito)
                    </span>
                  )}
                </>
              ) : currentInCart > 0 ? (
                "Producto ya en tu carrito (sin stock adicional)"
              ) : (
                "Producto temporalmente sin stock"
              )}
            </StockMessage>
          </StockIndicator>

          <Description>{product.description}</Description>

          {renderSpecifications(product)}

          <PriceContainer>
            <CurrentPrice>${(discountedPrice || 0).toFixed(2)}</CurrentPrice>
            {product.discount > 0 && (
              <>
                {product.discount > 0 && product.price != null && (
                  <OriginalPrice>${product.price.toFixed(2)}</OriginalPrice>
                )}
                <Discount>-{product.discount}%</Discount>
              </>
            )}
          </PriceContainer>

          {!isAdminOrCoord && (
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div style={{ marginBottom: "0px", fontWeight: "500" }}>
                Cantidad:
              </div>
              <QuantitySelector>
                <QuantityButton
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  -
                </QuantityButton>
                <QuantityInput
                  type="number"
                  min="1"
                  max={availableStock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={availableStock <= 0}
                />
                <QuantityButton
                  onClick={increaseQuantity}
                  disabled={quantity >= availableStock}
                >
                  +
                </QuantityButton>
              </QuantitySelector>
              {currentInCart > 0 && (
                <span
                  style={{
                    fontSize: "0.85em",
                    color: "#666",
                    marginLeft: "8px",
                  }}
                >
                  {currentInCart} en carrito
                </span>
              )}
            </div>
          )}

          {!isAdminOrCoord && (
            <ButtonsContainer>
              <Button
                text={
                  availableStock > 0
                    ? `Agregar ${quantity} al carrito`
                    : currentInCart > 0
                    ? "Producto ya en carrito"
                    : "Sin stock disponible"
                }
                variant="solid"
                onClick={handleAddToCart}
                disabled={availableStock <= 0}
                backgroundColor={({ theme }) => theme.colors.primary}
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
