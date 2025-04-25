import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../../context/CartContext";
import Button from "../ui/Button";
import { toast } from "react-toastify";

const StyledCard = styled.div`
  background-color: ${(props) =>
    props.theme.colors.surface}; // En lugar de "white" fijo
  color: ${(props) => props.theme.colors.text}; // Añadir color de texto
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  box-shadow: 0 2px 8px ${(props) => props.theme.colors.shadow};

  /* Asegurar que la tarjeta tenga un alto consistente */
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    cursor: pointer;
    box-shadow: 0 4px 12px ${(props) => props.theme.colors.shadow};
  }
`;

const ImageContainer = styled.div`
  position: relative;
  padding-top: 75%; /* 4:3 Aspect Ratio */
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
  background-color: ${(props) => props.theme.colors.tertiary};
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
  color: ${(props) => props.theme.colors.text};
`;

const Brand = styled.span`
  display: block;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textLight};
  margin-bottom: 8px;
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
  color: ${(props) => props.theme.colors.primary};
`;

const OriginalPrice = styled.span`
  font-size: 0.9rem;
  text-decoration: line-through;
  color: ${(props) => props.theme.colors.textLight};
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
  color: ${(props) => props.theme.colors.textLight};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// En el componente ProductCard, agregar esta parte para mostrar especificaciones
const renderSpecs = (product) => {
  if (!product.specs) return null;

  // Determinar qué tipo de producto es y mostrar las specs relevantes
  if (
    product.categories.some((cat) =>
      ["sedan", "suv", "camion", "moto", "todoterreno"].includes(cat)
    )
  ) {
    // Es un neumático
    return (
      <SpecsList>
        {product.specs.medida && (
          <SpecItem>Medida: {product.specs.medida}</SpecItem>
        )}
        {product.specs.indiceVelocidad && (
          <SpecItem>Índice vel.: {product.specs.indiceVelocidad}</SpecItem>
        )}
        {product.specs.perfil && (
          <SpecItem>Perfil: {product.specs.perfil}</SpecItem>
        )}
      </SpecsList>
    );
  } else if (
    product.categories.some((cat) =>
      [
        "aceite_motor",
        "aceite_transmision",
        "liquido_frenos",
        "refrigerante",
        "aditivos",
      ].includes(cat)
    )
  ) {
    // Es un lubricante
    return (
      <SpecsList>
        {product.specs.viscosidad && (
          <SpecItem>Viscosidad: {product.specs.viscosidad}</SpecItem>
        )}
        {product.specs.tipo && <SpecItem>Tipo: {product.specs.tipo}</SpecItem>}
        {product.specs.capacidad && (
          <SpecItem>Capacidad: {product.specs.capacidad}</SpecItem>
        )}
      </SpecsList>
    );
  } else if (
    product.categories.some((cat) =>
      ["manuales", "electricas", "neumaticas", "especialidad"].includes(cat)
    )
  ) {
    // Es una herramienta
    return (
      <SpecsList>
        {product.specs.potencia && (
          <SpecItem>Potencia: {product.specs.potencia}</SpecItem>
        )}
        {product.specs.material && (
          <SpecItem>Material: {product.specs.material}</SpecItem>
        )}
        {product.specs.piezas && (
          <SpecItem>Piezas: {product.specs.piezas}</SpecItem>
        )}
      </SpecsList>
    );
  } else if (
    product.categories.some((cat) =>
      ["interior", "exterior", "led", "accesorios"].includes(cat)
    )
  ) {
    // Es iluminación
    return (
      <SpecsList>
        {product.specs.potencia && (
          <SpecItem>Potencia: {product.specs.potencia}</SpecItem>
        )}
        {product.specs.lumen && (
          <SpecItem>Lumen: {product.specs.lumen}</SpecItem>
        )}
        {product.specs.colorTemp && (
          <SpecItem>Temp. color: {product.specs.colorTemp}</SpecItem>
        )}
      </SpecsList>
    );
  }

  // Caso genérico para otros tipos de productos
  return (
    <SpecsList>
      {Object.entries(product.specs)
        .slice(0, 3)
        .map(([key, value]) => (
          <SpecItem key={key}>
            {key}: {value}
          </SpecItem>
        ))}
    </SpecsList>
  );
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, isAdminOrCoord } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  // Añade verificación para asegurar que product.id exista
  const handleViewDetails = () => {
    // Verificar que el ID existe
    if (!product || product.id === undefined) {
      console.error("Error: ID de producto indefinido", product);
      toast.error("No se pudo cargar el detalle del producto");
      return;
    }

    console.log("Navegando al detalle del producto:", product.id);
    navigate(`/productos/${product.id}`);
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
        <ProductName>{product.name}</ProductName>
        {renderSpecs(product)}
        <Price>
          <CurrentPrice>${discountedPrice.toFixed(2)}</CurrentPrice>
          {product.discount > 0 && (
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
