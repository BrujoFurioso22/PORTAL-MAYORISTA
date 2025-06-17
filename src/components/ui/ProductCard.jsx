import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../../context/CartContext";
import Button from "../ui/Button";
import { toast } from "react-toastify";
import { useAppTheme } from "../../context/AppThemeContext";

const StyledCard = styled.div`
  background-color: ${({ theme }) =>
    theme.colors.surface}; // En lugar de "white" fijo
  color: ${({ theme }) => theme.colors.text}; // Añadir color de texto
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};

  /* Asegurar que la tarjeta tenga un alto consistente */
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    cursor: pointer;
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
  }
`;

const ImageContainer = styled.div`
  position: relative;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  overflow: hidden;
`;

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: ${({ theme }) => theme.colors.tertiary};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
`;

const ContentContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  /* Importante: esto hace que ocupe el espacio disponible */
  flex: 1;
  /* Establecer un mínimo de altura para contenido */
  min-height: 160px;
`;

const ProductName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Brand = styled.span`
  display: block;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 8px;
  /* padding: 4px 8px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  width: fit-content;
  background-color: ${({ theme }) => `${theme.colors.primary}20`}; */
`;

const Price = styled.div`
  margin-top: auto;
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const CurrentPrice = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const OriginalPrice = styled.span`
  font-size: 0.9rem;
  text-decoration: line-through;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ButtonContainer = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
`;

const SpecsList = styled.ul`
  margin: 8px 0;
  padding-left: 0;
  list-style: none;
  font-size: 0.8rem;
`;

const SpecItem = styled.li`
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.textLight};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SpecLabel = styled.span`
  font-weight: bold;
`;

const SpecValue = styled.span`
  margin-left: 4px;
`;

const StockIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  margin-bottom: 8px;
  font-size: 0.8rem;
`;

const StockDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $inStock, theme }) =>
    $inStock ? theme.colors.success : theme.colors.error};
`;

const StockText = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.75rem;
`;

// Configuración de líneas de negocio para especificaciones de productos
const PRODUCT_LINE_CONFIG = {
  neumáticos: {
    specs: [
      { label: "Medida", field: "medida" },
      { label: "Índice de Velocidad", field: "indiceVelocidad" },
      { label: "Perfil", field: "perfil" },
    ],
  },
  lubricantes: {
    specs: [
      { label: "Viscosidad", field: "viscosidad" },
      { label: "Tipo", field: "tipo" },
      { label: "Capacidad", field: "capacidad" },
    ],
  },
  herramientas: {
    specs: [
      { label: "Potencia", field: "potencia" },
      { label: "Material", field: "material" },
      { label: "Piezas", field: "piezas" },
    ],
  },
  iluminación: {
    specs: [
      { label: "Potencia", field: "potencia" },
      { label: "Lumen", field: "lumen" },
      { label: "Temp. de Color", field: "colorTemp" },
    ],
  },
  DEFAULT: {
    specs: [
      { label: "Especificación 1", field: "especificacion1" },
      { label: "Especificación 2", field: "especificacion2" },
      { label: "Especificación 3", field: "especificacion3" },
    ],
  },
};

const ProductCard = ({ product, lineConfig }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, isAdminOrCoord } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const discountedPrice =
    product.discount && product.price !== null
      ? product.price * (1 - product.discount / 100)
      : product.price || 0;

  // Añade verificación para asegurar que product.id exista
  const handleViewDetails = () => {
    // Verificar que el ID existe
    if (!product || product.id === undefined) {
      console.error("Error: ID de producto indefinido", product);
      toast.error("No se pudo cargar el detalle del producto");
      return;
    }

    const currentUrl = `${location.pathname}${location.search}`;

    console.log("Navegando al detalle del producto:", product.id);
    // Navegar al detalle del producto pasando la URL anterior
    navigate(`/productos/${product.id}`, {
      state: {
        product,
        prevUrl: currentUrl, // Guardar la URL anterior para poder volver
      },
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isAddingToCart) return; // Evitar múltiples clics

    setIsAddingToCart(true);
    addToCart(product, 1);

    // Habilitar nuevamente después de un breve momento
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 500);
  };

  // Lógica para renderizar especificaciones basadas en lineaNegocio
  const renderSpecs = (config) => {
    if (!product.specs) return null;

    return (
      <SpecsList>
        {config.specs.slice(0, 3).map((spec, index) => (
          <SpecItem key={index}>
            <SpecLabel>{spec.label}:</SpecLabel>
            <SpecValue>{product.specs[spec.field]}</SpecValue>
          </SpecItem>
        ))}
      </SpecsList>
    );
  };

  // Obtener la configuración correspondiente si no se proporciona
  const config =
    lineConfig ||
    PRODUCT_LINE_CONFIG[product.lineaNegocio] ||
    PRODUCT_LINE_CONFIG.DEFAULT;

  return (
    <StyledCard onClick={handleViewDetails}>
      <ImageContainer>
        <ProductImage src={product.image} alt={product.name} />
        {product.discount > 0 && (
          <DiscountBadge>-{product.discount}%</DiscountBadge>
        )}
      </ImageContainer>
      <ContentContainer>
        <Brand>{product.brand}</Brand>
        {/* Indicador de stock */}
        <StockIndicator>
          <StockDot $inStock={product.stock > 0} />
          <StockText>
            {product.stock > 0
              ? `${
                  product.stock > 100
                    ? "En stock"
                    : `${product.stock} disponibles`
                }`
              : "Agotado"}
          </StockText>
        </StockIndicator>
        <ProductName>{product.name}</ProductName>
        {renderSpecs(config)}
        <Price>
          <CurrentPrice>${(discountedPrice || 0).toFixed(2)}</CurrentPrice>
          {product.discount > 0 && product.price != null && (
            <OriginalPrice>${product.price.toFixed(2)}</OriginalPrice>
          )}
        </Price>
        <ButtonContainer>
          <Button
            text="Ver detalle"
            variant="outlined"
            size="small"
            onClick={handleViewDetails}
          />
          {!isAdminOrCoord && (
            <Button
              text={isAddingToCart ? "Agregando..." : "Agregar al carrito"}
              variant="solid"
              size="small"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            />
          )}
        </ButtonContainer>
      </ContentContainer>
    </StyledCard>
  );
};

export default ProductCard;
