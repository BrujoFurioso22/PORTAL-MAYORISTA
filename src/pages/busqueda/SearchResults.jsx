import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import ProductCard from "../../components/ui/ProductCard";
import RenderIcon from "../../components/ui/RenderIcon";
import { PRODUCT_LINE_CONFIG } from "../../constants/productLineConfig";
import { useAuth } from "../../context/AuthContext";
import { useProductCatalog } from "../../context/ProductCatalogContext";

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

const BackButton = styled(Button)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 0;
  cursor: pointer;
  font-size: 0.9rem;

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
  margin-bottom: 12px;
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 32px;
  margin-bottom: 16px;
  gap: 8px;
`;

const PageButton = styled(Button)`
  width: 35px;
  height: 35px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.white : theme.colors.text};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.border};

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.primaryLight};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      background-color: ${({ $active, theme }) =>
        $active ? theme.colors.primary : theme.colors.surface};
      border-color: ${({ $active, theme }) =>
        $active ? theme.colors.primary : theme.colors.border};
    }
  }
`;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const initialPriceRange = searchParams.get("priceRange") || "all";
  const initialSortOption = searchParams.get("sortOption") || "relevance";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const { user, navigateToHomeByRole } = useAuth();
  const { loadProductsBySearchTerm } = useProductCatalog();

  // Cambiar el estado inicial a null para diferenciar entre "sin búsqueda" y "búsqueda sin resultados"
  const [results, setResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const [sortOption, setSortOption] = useState(initialSortOption);
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const productsPerPage = 12; // Mostrar 12 productos por página

  // userAccess con useMemo para evitar advertencia de dependencias
  const userAccess = React.useMemo(() => user?.EMPRESAS || [], [user]);

  // Actualizar la URL cuando cambian los filtros o la página
  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (priceRange && priceRange !== "all") params.priceRange = priceRange;
    if (sortOption && sortOption !== "relevance") params.sortOption = sortOption;
    if (currentPage && currentPage !== 1) params.page = currentPage;
    setSearchParams(params, { replace: true });
  }, [query, priceRange, sortOption, currentPage, setSearchParams]);

  // Buscar productos cuando cambia la query
  useEffect(() => {
    const fetchSearchResults = async () => {
      // Si no hay consulta, no hacemos nada
      if (!query) {
        setResults(null);
        setFilteredResults([]);
        return;
      }

      // Indicar que estamos cargando
      setLoading(true);

      try {
        // Usar la función del contexto para buscar productos
        const response = await loadProductsBySearchTerm(query);

        if (response.success && response.data) {
          // Agregar hasAccess y relevanceScore aquí si es necesario
          const queryLower = query.toLowerCase();
          const apiResults = response.data.map((product) => {
            let relevanceScore = 0;
            if (product.name && product.name.toLowerCase().includes(queryLower))
              relevanceScore += 10;
            if (
              product.name &&
              product.name.toLowerCase().startsWith(queryLower)
            )
              relevanceScore += 5;
            if (
              product.brand &&
              product.brand.toLowerCase().includes(queryLower)
            )
              relevanceScore += 3;
            if (
              product.specs &&
              product.specs.disenio &&
              product.specs.disenio.toLowerCase().includes(queryLower)
            )
              relevanceScore += 2;
            const hasAccess = userAccess.includes(product.empresaId);
            return {
              ...product,
              relevanceScore,
              hasAccess,
            };
          });
          setResults(apiResults);
          setFilteredResults(apiResults);
        } else {
          console.error("Error en la búsqueda:", response.message);
          setResults([]);
          setFilteredResults([]);
        }
      } catch (error) {
        console.error("Error al buscar productos:", error);
        setResults([]);
        setFilteredResults([]);
      } finally {
        // Finalizar carga independientemente del resultado
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, navigate, userAccess, loadProductsBySearchTerm]);

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    if (results === null) return; // No hacer nada si no hay resultados
    let filtered = [...results];

    // Filtrar por rango de precio
    if (priceRange !== "all") {
      switch (priceRange) {
        case "under-100":
          filtered = filtered.filter((item) => item.price < 100);
          break;
        case "100-200":
          filtered = filtered.filter(
            (item) => item.price >= 100 && item.price <= 200
          );
          break;
        case "200-300":
          filtered = filtered.filter(
            (item) => item.price > 200 && item.price <= 300
          );
          break;
        case "over-300":
          filtered = filtered.filter((item) => item.price > 300);
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

  // Cuando cambian los filtros o la página desde la URL, actualiza el estado local
  useEffect(() => {
    setSortOption(initialSortOption);
    setPriceRange(initialPriceRange);
    setCurrentPage(initialPage);
  }, [initialSortOption, initialPriceRange, initialPage]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al cambiar filtro
  };

  const handlePriceRangeChange = (e) => {
    setPriceRange(e.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al cambiar filtro
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Variables de paginación y acceso
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredResults.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredResults.length / productsPerPage);

  const handleNavigate = () => {
    navigateToHomeByRole();
  };

  // Función para solicitar acceso a una empresa
  const handleRequestAccess = (empresaId) => {
    navigate(`/catalogo/${empresaId}`);
  };

  return (
    <PageContainer>
      <PageHeader>
        <BackButton
          onClick={handleNavigate}
          leftIconName={"FaChevronLeft"}
          text={"Volver al inicio"}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <PageTitle>Resultados de búsqueda</PageTitle>
          {results && (
            <SearchInfo>
              - Se encontraron {filteredResults.length} resultados para "{query}
              "
            </SearchInfo>
          )}
        </div>
      </PageHeader>

      {/* Estado: Cargando resultados */}
      {loading && (
        <NoResultsContainer>
          <RenderIcon
            name="FaSpinner"
            size={30}
            style={{ animation: "spin 1s linear infinite" }}
          />
          <NoResultsTitle>Buscando productos...</NoResultsTitle>
          <NoResultsText>
            Estamos buscando los mejores resultados para "{query}".
          </NoResultsText>
        </NoResultsContainer>
      )}

      {/* Estado: No hay consulta de búsqueda */}
      {!loading && results === null && (
        <NoResultsContainer>
          <RenderIcon name="FaSearch" size={30} />
          <NoResultsTitle>Ingresa una búsqueda</NoResultsTitle>
          <NoResultsText>
            Escribe en el buscador para encontrar los productos que necesitas.
          </NoResultsText>
          <Button
            text="Ir al catálogo"
            variant="solid"
            backgroundColor={({ theme }) => theme.colors.primary}
            onClick={handleNavigate}
          />
        </NoResultsContainer>
      )}

      {/* Estado: Hay resultados de búsqueda */}
      {!loading && results && results.length > 0 && (
        <>
          <FiltersBar>
            <FilterGroup>
              <FilterLabel>
                <RenderIcon name="FaFilter" size={18} />
                Filtrar por:
              </FilterLabel>
              <Select
                options={[
                  { value: "all", label: "Todos los precios" },
                  { value: "under-100", label: "Menos de $100" },
                  { value: "100-200", label: "$100 - $200" },
                  { value: "200-300", label: "$200 - $300" },
                  { value: "over-300", label: "Más de $300" },
                ]}
                value={priceRange}
                onChange={handlePriceRangeChange}
                placeholder="Seleccionar precio"
                width="200px"
                name="priceRange"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>
                <RenderIcon name="FaSort" size={18} />
                Ordenar por:
              </FilterLabel>
              <Select
                options={[
                  { value: "relevance", label: "Relevancia" },
                  { value: "price-low", label: "Precio: Menor a Mayor" },
                  { value: "price-high", label: "Precio: Mayor a Menor" },
                  { value: "name", label: "Nombre" },
                  { value: "discount", label: "Mayor descuento" },
                ]}
                value={sortOption}
                onChange={handleSortChange}
                placeholder="Ordenar por..."
                width="200px"
                name="sortOption"
              />
            </FilterGroup>
          </FiltersBar>

          {filteredResults.length > 0 && (
            <div
              style={{
                textAlign: "right",
                color: ({ theme }) => theme.colors.textLight,
                marginBottom: "10px",
                fontSize: "0.9rem",
              }}
            >
              Mostrando {indexOfFirstProduct + 1}-
              {Math.min(indexOfLastProduct, filteredResults.length)} de{" "}
              {filteredResults.length} productos
            </div>
          )}

          <ProductsGrid>
            {currentProducts.map((product) =>
              product.hasAccess ? (
                <ProductCard
                  key={`${product.empresaId}-${product.id}`}
                  product={product}
                  lineConfig={
                    PRODUCT_LINE_CONFIG[product.lineaNegocio] ||
                    PRODUCT_LINE_CONFIG.DEFAULT
                  }
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
                        <RenderIcon name="FaLock" size={18} />
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

          {/* Agregar el componente de paginación */}
          {filteredResults.length > productsPerPage && (
            <PaginationContainer>
              <PageButton
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                leftIconName={"FaAngleDoubleLeft"}
                size="small"
              />

              <PageButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                leftIconName={"FaAngleLeft"}
                size="small"
              />

              {/* Generar botones de página */}
              {[...Array(totalPages)].map((_, index) => {
                // Mostrar máximo 5 botones de página
                if (
                  index === 0 || // Primera página
                  index === totalPages - 1 || // Última página
                  (index >= currentPage - 2 && index <= currentPage + 0) // Páginas cercanas a la actual
                ) {
                  return (
                    <PageButton
                      key={index + 1}
                      $active={currentPage === index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      text={index + 1}
                      size="small"
                    />
                  );
                } else if (
                  (index === 1 && currentPage > 3) || // Mostrar puntos suspensivos después de la primera página
                  (index === totalPages - 2 && currentPage < totalPages - 2) // Mostrar puntos suspensivos antes de la última página
                ) {
                  return <span key={index}>...</span>;
                }
                return null;
              })}

              <PageButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                leftIconName={"FaAngleRight"}
                size="small"
              />

              <PageButton
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                leftIconName={"FaAngleDoubleRight"}
                size="small"
              />
            </PaginationContainer>
          )}

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
      )}

      {/* Estado: No hay resultados para la búsqueda */}
      {!loading && results && results.length === 0 && (
        <NoResultsContainer>
          <RenderIcon name="FaSearch" size={30} />
          <NoResultsTitle>No se encontraron resultados</NoResultsTitle>
          <NoResultsText>
            No pudimos encontrar productos que coincidan con "{query}". Intenta
            con otras palabras o revisa la ortografía.
          </NoResultsText>
          <Button
            text="Volver al inicio"
            variant="solid"
            backgroundColor={({ theme }) => theme.colors.primary}
            onClick={handleNavigate}
          />
        </NoResultsContainer>
      )}
    </PageContainer>
  );
};

export default SearchResults;
