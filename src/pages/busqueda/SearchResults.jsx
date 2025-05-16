import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { empresas, productosPorEmpresa } from "../../mock/products"; // Ajusta la ruta según tu estructura
import FlexBoxComponent from "../../components/common/FlexBox";
import Button from "../../components/ui/Button";
import ProductCard from "../../components/ui/ProductCard";
import {
  FaFilter,
  FaSort,
  FaSearch,
  FaArrowLeft,
  FaLock,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

const PageTitle = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.8rem;
`;

const SearchInfo = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLight};
`;

const FiltersBar = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  padding-right: 32px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  appearance: none;
  cursor: pointer;
`;

const SelectIcon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

const NoResultsContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
`;

const NoResultsIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const NoResultsTitle = styled.h2`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const NoResultsText = styled.p`
  margin: 0 0 24px 0;
  color: ${({ theme }) => theme.colors.textLight};
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

// Nuevos estilos para productos sin acceso
const RestrictedProductCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  opacity: 0.75;
  filter: grayscale(40%);
`;

const RestrictedOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6); // Fondo más oscuro para mejor contraste
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  z-index: 2;
  padding: 16px;
  padding-top: 8%;
  text-align: center;
`;

const RestrictedMessageContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  width: 85%;
  max-width: 250px;
  border: 2px solid ${({ theme }) => theme.colors.primary}; // Borde destacado
`;

const RestrictedIcon = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  color: ${({ theme }) => theme.colors.white}; // Texto blanco para contraste
  font-size: 1.5rem;
`;
const RestrictedText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600; // Más negrita
  font-size: 1.1rem; // Más grande
  margin: 0 0 16px 0;
`;

const RestrictedImageContainer = styled.div`
  position: relative;
  padding-top: 75%; /* 4:3 Aspect Ratio */
`;

const RestrictedImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RestrictedContent = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const RestrictedName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const RestrictedBrand = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const { user, navigateToHomeByRole } = useAuth();

  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [sortOption, setSortOption] = useState("relevance");
  const [priceRange, setPriceRange] = useState("all");

  const userAccess = user?.EMPRESAS || [];

  const handleNavigate = () => {
    navigateToHomeByRole();
  };

  // Buscar productos cuando cambia la query
  useEffect(() => {
    if (!query) {
      handleNavigate();
      return;
    }

    const searchResults = [];
    const queryLower = query.toLowerCase();

    // Buscar en todos los productos de todas las empresas
    Object.entries(productosPorEmpresa).forEach(([empresaId, productos]) => {
      productos.forEach((product) => {
        const nameMatch = product.name.toLowerCase().includes(queryLower);
        const brandMatch = product.brand.toLowerCase().includes(queryLower);
        const descMatch =
          product.description &&
          product.description.toLowerCase().includes(queryLower);
        const catMatch =
          product.categories &&
          product.categories.some(
            (cat) =>
              typeof cat === "string" && cat.toLowerCase().includes(queryLower)
          );

        if (nameMatch || brandMatch || descMatch || catMatch) {
          // Calcular puntuación de relevancia
          let relevanceScore = 0;
          if (nameMatch) relevanceScore += 10;
          if (product.name.toLowerCase().startsWith(queryLower))
            relevanceScore += 5;
          if (brandMatch) relevanceScore += 3;
          if (descMatch) relevanceScore += 1;

          // Verificar si el usuario tiene acceso a esta empresa
          const hasAccess = userAccess.includes(empresaId);

          // Buscar información adicional de la empresa
          const empresaInfo = empresas.find((e) => e.id === empresaId);

          searchResults.push({
            ...product,
            empresaId,
            empresaNombre: empresaInfo?.nombre || empresaId,
            relevanceScore,
            hasAccess, // Agregar flag de acceso
          });
        }
      });
    });

    setResults(searchResults);
    setFilteredResults(searchResults);
  }, [query, navigate]);

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    let filtered = [...results];

    // Filtrar por rango de precio
    if (priceRange !== "all") {
      switch (priceRange) {
        case "under-500":
          filtered = filtered.filter((item) => item.price < 500);
          break;
        case "500-1000":
          filtered = filtered.filter(
            (item) => item.price >= 500 && item.price <= 1000
          );
          break;
        case "1000-2000":
          filtered = filtered.filter(
            (item) => item.price > 1000 && item.price <= 2000
          );
          break;
        case "over-2000":
          filtered = filtered.filter((item) => item.price > 2000);
          break;
        default:
          break;
      }
    }

    // Ordenar los resultados
    switch (sortOption) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "discount":
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case "relevance":
      default:
        filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
    }

    setFilteredResults(filtered);
  }, [results, sortOption, priceRange]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handlePriceRangeChange = (e) => {
    setPriceRange(e.target.value);
  };

  // Función para solicitar acceso a una empresa
  const handleRequestAccess = (empresaId) => {
    navigate(`/catalogo/${empresaId}`);
  };

  return (
    <PageContainer>
      <PageHeader>
        <BackButton onClick={handleNavigate}>
          <FaArrowLeft /> Volver al inicio
        </BackButton>

        <PageTitle>Resultados de búsqueda</PageTitle>
        <SearchInfo>
          Se encontraron {filteredResults.length} resultados para "{query}"
        </SearchInfo>
      </PageHeader>

      {results.length > 0 ? (
        <>
          <FiltersBar>
            <FilterGroup>
              <FilterLabel>
                <FaFilter /> Filtrar por:
              </FilterLabel>
              <SelectWrapper>
                <FilterSelect
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                >
                  <option value="all">Todos los precios</option>
                  <option value="under-500">Menos de $500</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-2000">$1,000 - $2,000</option>
                  <option value="over-2000">Más de $2,000</option>
                </FilterSelect>
                <SelectIcon>▼</SelectIcon>
              </SelectWrapper>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>
                <FaSort /> Ordenar por:
              </FilterLabel>
              <SelectWrapper>
                <FilterSelect value={sortOption} onChange={handleSortChange}>
                  <option value="relevance">Relevancia</option>
                  <option value="price-low">Precio: Menor a Mayor</option>
                  <option value="price-high">Precio: Mayor a Menor</option>
                  <option value="name">Nombre</option>
                  <option value="discount">Mayor descuento</option>
                </FilterSelect>
                <SelectIcon>▼</SelectIcon>
              </SelectWrapper>
            </FilterGroup>
          </FiltersBar>

          <ProductsGrid>
            {filteredResults.map((product) =>
              product.hasAccess ? (
                <ProductCard
                  key={`${product.empresaId}-${product.id}`}
                  product={product}
                />
              ) : (
                // Producto restringido sin acceso
                <RestrictedProductCard
                  key={`${product.empresaId}-${product.id}`}
                >
                  <RestrictedImageContainer>
                    <RestrictedImage src={product.image} alt={product.name} />
                  </RestrictedImageContainer>
                  <RestrictedContent>
                    <RestrictedName>{product.name}</RestrictedName>
                    <RestrictedBrand>{product.brand}</RestrictedBrand>
                  </RestrictedContent>
                  <RestrictedOverlay>
                    <RestrictedMessageContainer>
                      <RestrictedIcon>
                        <FaLock />
                      </RestrictedIcon>
                      <RestrictedText>Acceso restringido</RestrictedText>
                      <Button
                        text={`Solicitar acceso a ${product.empresaNombre}`}
                        variant="solid" // Cambiado de outline a solid para mayor visibilidad
                        size="small"
                        onClick={() => handleRequestAccess(product.empresaId)}
                        backgroundColor={({ theme }) => theme.colors.primary}
                      />
                    </RestrictedMessageContainer>
                  </RestrictedOverlay>
                </RestrictedProductCard>
              )
            )}
          </ProductsGrid>

          {filteredResults.length === 0 && (
            <NoResultsContainer>
              <NoResultsIcon>🔍</NoResultsIcon>
              <NoResultsTitle>
                No se encontraron productos con los filtros seleccionados
              </NoResultsTitle>
              <NoResultsText>
                Prueba con otros filtros o busca con términos más generales.
              </NoResultsText>
              <Button
                text="Limpiar filtros"
                variant="outlined"
                onClick={() => {
                  setSortOption("relevance");
                  setPriceRange("all");
                }}
              />
            </NoResultsContainer>
          )}
        </>
      ) : (
        <NoResultsContainer>
          <NoResultsIcon>🔍</NoResultsIcon>
          <NoResultsTitle>No se encontraron resultados</NoResultsTitle>
          <NoResultsText>
            No pudimos encontrar productos que coincidan con "{query}". Intenta
            con otras palabras o revisa la ortografía.
          </NoResultsText>
          <Button
            text="Volver al inicio"
            variant="solid"
            backgroundColor={({theme}) => theme.colors.primary}
            onClick={handleNavigate}
          />
        </NoResultsContainer>
      )}
    </PageContainer>
  );
};

export default SearchResults;
