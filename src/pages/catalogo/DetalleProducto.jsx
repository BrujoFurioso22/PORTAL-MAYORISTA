import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../../context/CartContext";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { PRODUCT_LINE_CONFIG } from "../../constants/productLineConfig";
import { toast } from "react-toastify";
import { useProductCatalog } from "../../context/ProductCatalogContext";
import { TAXES, calculatePriceWithIVA } from "../../constants/taxes";

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
  margin-bottom: 4px;
`;

const Enterprise = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 8px;
  opacity: 0.8;
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

const IVAIndicator = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-style: italic;
  display: block;
  margin-top: 4px;
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

const QuantityButton = styled(Button)`
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

const BackLink = styled(Button)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  margin-bottom: 24px;
  font-size: 0.9rem;
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

// Estilos adicionales para el zoom de la imagen
const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MainImageContainer = styled.div`
  position: relative;
  width: 100%;
  cursor: crosshair;
  overflow: visible;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 4px 10px ${({ theme }) => theme.colors.shadow};
`;

const MainImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
`;

const ZoomWindow = styled.div`
  position: fixed;
  /* Eliminar right: -100% para que no esté fijo */
  width: 300px;
  height: 300px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  box-shadow: 0 4px 10px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 5000;
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 992px) {
    display: none; // Ocultar en dispositivos móviles/tablets
  }
`;

const ZoomedImage = styled.div`
  position: absolute;
  background-image: url(${({ src }) => src});
  background-repeat: no-repeat;
  width: 400%; // Imagen ampliada a 3x
  height: 400%;
  background-size: cover;
  transform-origin: 0 0;
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
  const { loadProductByCodigo } = useProductCatalog();
  const { navigateToHomeByRole, isClient } = useAuth();
  const { addToCart, cart } = useCart();
  const [quantity, setQuantity] = useState(1);
  // Intentar obtener el producto del estado de navegación primero
  const [product, setProduct] = useState(location.state?.product || null);

  const empresaId = location.state?.empresaId || null;

  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const prevUrl = location.state?.prevUrl;

  // Funciones para manejar el zoom
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleMouseMove = (e) => {
    if (imageContainerRef.current) {
      const { left, top, width, height } =
        imageContainerRef.current.getBoundingClientRect();

      // Calcular la posición relativa del cursor dentro de la imagen (0-1)
      const x = Math.min(Math.max((e.clientX - left) / width, 0), 1);
      const y = Math.min(Math.max((e.clientY - top) / height, 0), 1);

      setMousePosition({ x, y });

      // Posicionar la ventana de zoom cerca del cursor, pero no exactamente encima
      // para que no tape lo que estamos viendo
      const zoomSize = 300;

      // Determinar si colocamos la ventana a la derecha o izquierda del cursor
      // basado en la posición del cursor en la pantalla
      let zoomX;
      if (e.clientX < window.innerWidth / 2) {
        // Si el cursor está en la mitad izquierda, mostrar a la derecha
        zoomX = e.clientX + 50; // 50px de offset
      } else {
        // Si el cursor está en la mitad derecha, mostrar a la izquierda
        zoomX = e.clientX - zoomSize - 50; // 50px de offset
      }

      // Para Y, simplemente alinear con el cursor verticalmente
      const zoomY = e.clientY - zoomSize / 2;

      // Asegurar que la ventana no se salga de la pantalla
      const adjustedZoomX = Math.min(
        Math.max(zoomX, 10),
        window.innerWidth - zoomSize - 10
      );
      const adjustedZoomY = Math.min(
        Math.max(zoomY, 10),
        window.innerHeight - zoomSize - 10
      );

      setZoomPosition({ x: adjustedZoomX, y: adjustedZoomY });
    }
  };

  const handleNavigate = () => {
    navigateToHomeByRole();
  };

  // Calcular cantidad actual en el carrito
  const currentInCart = React.useMemo(() => {
    if (!cart || !product) return 0;

    const cartItem = cart.find((item) => item?.id === product.id);

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
    const cargarProducto = async () => {
      const productoApi = await loadProductByCodigo(id, empresaId);

      if (productoApi) {
        setProduct(productoApi);
      } else {
        handleNavigate();
      }
    };

    // Solo buscar si no hay producto en el state
    if (!product) {
      cargarProducto();
    }
  }, [id, empresaId]);

  if (!product) {
    return <div>Cargando...</div>;
  }

  const navigateBack = () => {
    if (prevUrl) {
      // Si tenemos una URL anterior guardada, navegar a ella
      navigate(prevUrl);
    } else if (product?.empresaId) {
      // Fallback: navegar al catálogo de la empresa
      navigate(`/catalogo/${product.empresaId}`);
    } else {
      // Si no hay información suficiente, ir al inicio
      navigateToHomeByRole();
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    const max = availableStock > 100 ? 5000 : availableStock;
    if (!isNaN(value) && value > 0 && value <= max) {
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

  // Calcular precio con descuento aplicado
  const discountedPrice =
    product.discount && product.price !== null
      ? product.price * (1 - product.discount / 100)
      : product.price || 0;

  // Calcular precio con IVA incluido (aplicado al precio con descuento)
  const priceWithIVA = calculatePriceWithIVA(
    discountedPrice, 
    product.iva || TAXES.IVA_PERCENTAGE
  );

  return (
    <PageContainer>
      <BackLink
        onClick={navigateBack}
        text={"Regresar al catálogo"}
        leftIconName={"FaChevronLeft"}
      />

      <ProductLayout>
        <ImageSection>
          {/* Contenedor principal de la imagen con eventos de mouse */}
          <MainImageContainer
            ref={imageContainerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            <MainImage src={product.image} alt={product.name} />

            {/* Ventana de zoom */}
            <ZoomWindow
              $visible={isHovering}
              style={{
                left: `${zoomPosition.x}px`,
                top: `${zoomPosition.y}px`,
                transform: "none", // Eliminar cualquier transformación predeterminada
              }}
            >
              <ZoomedImage
                src={product.image}
                style={{
                  transform: `translate(-${mousePosition.x * 80}%, -${
                    mousePosition.y * 75
                  }%)`,
                }}
              />
            </ZoomWindow>
          </MainImageContainer>
        </ImageSection>

        <InfoSection>
          {" "}
          {/* Mostrar categorías desde filtersByType de forma amigable */}
          <Category>
            {product.filtersByType &&
            Object.keys(product.filtersByType).length > 0
              ? Object.values(product.filtersByType)
                  .flat() // Aplanar el array de arrays
                  .join(", ")
              : "Producto sin categoría"}
          </Category>
          <ProductTitle>{product.name}</ProductTitle>
          <Brand>Marca: {product.brand}</Brand>
          <Enterprise>Empresa: {product.empresa || product.empresaId}</Enterprise>
          {/* Nuevo indicador de stock posicionado debajo del nombre y marca */}
          <StockIndicator $inStock={availableStock > 0}>
            <StockBadge $inStock={availableStock > 0}>
              {availableStock > 0 ? "DISPONIBLE" : "AGOTADO"}
            </StockBadge>
            <StockMessage $inStock={availableStock > 0}>
              {availableStock > 0 ? (
                <>
                  {availableStock < 100 && `${availableStock}`}{" "}
                  {availableStock === 1
                    ? "unidad disponible"
                    : availableStock < 100
                    ? "unidades disponibles"
                    : ""}
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
                "Producto temporalmente sin stock. Si desea comprobar el stock, por favor, contacte con nosotros."
              )}
            </StockMessage>
          </StockIndicator>
          <Description>{product.description}</Description>
          {renderSpecifications(product)}
          <PriceContainer>
            <div>
              <CurrentPrice>${(priceWithIVA || 0).toFixed(2)}</CurrentPrice>
              <IVAIndicator>IVA incluido</IVAIndicator>
            </div>
            {product.discount > 0 && (
              <>
                {product.discount > 0 && product.price != null && (
                  <OriginalPrice>${product.price.toFixed(2)}</OriginalPrice>
                )}
                <Discount>-{product.discount}%</Discount>
              </>
            )}
          </PriceContainer>
          {isClient && (
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
                  text={"-"}
                />
                <QuantityInput
                  type="number"
                  min="1"
                  max={availableStock > 100 ? 5000 : availableStock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={availableStock <= 0}
                />
                <QuantityButton
                  onClick={increaseQuantity}
                  disabled={quantity >= availableStock}
                  text={"+"}
                />
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
          {isClient && (
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
