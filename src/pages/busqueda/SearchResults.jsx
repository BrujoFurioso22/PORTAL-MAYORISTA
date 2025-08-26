import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import ProductCard from "../../components/ui/ProductCard";
import RenderIcon from "../../components/ui/RenderIcon";
import { PRODUCT_LINE_CONFIG } from "../../constants/productLineConfig";
import { useAuth } from "../../context/AuthContext";
import { useProductCatalog } from "../../context/ProductCatalogContext";
import PageContainer from "../../components/layout/PageContainer";

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

const SearchBarContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
`;

const SearchForm = styled.form`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInputContainer = styled.div`
  flex: 1;
  min-width: 300px;
`;

const SearchButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const FiltersBar = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const FiltersContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-direction: row;
  gap: 35px;
`;

const FiltersTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 8px;
`;

const FiltersControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  
  flex-grow: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const RestrictedProductsNotice = styled.div`
  background-color: ${({ theme }) => `${theme.colors.primary}08`};
  border: 1px solid ${({ theme }) => `${theme.colors.primary}25`};
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1.4;
  width: 100%;

  svg {
    margin-top: 2px;
    flex-shrink: 0;
  }

  span {
    flex: 1;
  }
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
  const { isClient } = useAuth(); // Obtener el estado de cliente

  // Cambiar el estado inicial a null para diferenciar entre "sin búsqueda" y "búsqueda sin resultados"
  const [results, setResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const [sortOption, setSortOption] = useState(initialSortOption);
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchInput, setSearchInput] = useState(query); // Estado para el input de búsqueda
  const [productsPerPage, setProductsPerPage] = useState(12); // Estado para productos por página
  const [currentLimit, setCurrentLimit] = useState(12); // Estado para el límite actual

  // userAccess con useMemo para evitar advertencia de dependencias
  const userAccess = React.useMemo(() => user?.EMPRESAS || [], [user]);

  // Actualizar la URL cuando cambian los filtros o la página
  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (priceRange && priceRange !== "all") params.priceRange = priceRange;
    if (sortOption && sortOption !== "relevance")
      params.sortOption = sortOption;
    if (currentPage && currentPage !== 1) params.page = currentPage;
    if (productsPerPage && productsPerPage !== 12)
      params.limit = productsPerPage;
    setSearchParams(params, { replace: true });
  }, [
    query,
    priceRange,
    sortOption,
    currentPage,
    productsPerPage,
    setSearchParams,
  ]);

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
            let hasAccess = false;
            if (isClient) {
              hasAccess = userAccess.includes(product.empresaId);
            } else {
              hasAccess = true; // Administradores y coordinadoras tienen acceso a todos los productos
            }
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

    // Separar productos con acceso y sin acceso
    const accessibleProducts = filtered.filter((product) => product.hasAccess);
    const restrictedProducts = filtered.filter((product) => !product.hasAccess);

    // Aplicar filtro de precio solo a productos con acceso
    if (priceRange !== "all") {
      const filteredAccessible = accessibleProducts.filter((item) => {
        switch (priceRange) {
          case "under-100":
            return item.price < 100;
          case "100-200":
            return item.price >= 100 && item.price <= 200;
          case "200-300":
            return item.price > 200 && item.price <= 300;
          case "over-300":
            return item.price > 300;
          default:
            return true;
        }
      });
      accessibleProducts.length = 0; // Limpiar el array
      accessibleProducts.push(...filteredAccessible); // Agregar los filtrados
    }

    // Ordenar productos con acceso según la opción seleccionada
    switch (sortOption) {
      case "price-low":
        accessibleProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        accessibleProducts.sort((a, b) => b.price - a.price);
        break;
      case "name":
        accessibleProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "discount":
        accessibleProducts.sort(
          (a, b) => (b.discount || 0) - (a.discount || 0)
        );
        break;
      case "relevance":
      default:
        accessibleProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
    }

    // Ordenar productos restringidos por relevancia
    restrictedProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Combinar productos con acceso primero, luego los restringidos
    const finalResults = [...accessibleProducts, ...restrictedProducts];
    setFilteredResults(finalResults);
  }, [results, sortOption, priceRange]);

  // Cuando cambian los filtros o la página desde la URL, actualiza el estado local
  useEffect(() => {
    setSortOption(initialSortOption);
    setPriceRange(initialPriceRange);
    setCurrentPage(initialPage);
  }, [initialSortOption, initialPriceRange, initialPage]);

  // Sincronizar searchInput con la query de la URL
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Sincronizar estados con parámetros de URL al cargar la página
  useEffect(() => {
    const limitFromUrl = parseInt(searchParams.get("limit") || "12", 10);
    setProductsPerPage(limitFromUrl);
    setCurrentLimit(limitFromUrl);
  }, [searchParams]);

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

  const handleItemsPerPageChange = (e) => {
    const newLimit = Number(e.target.value);
    setProductsPerPage(newLimit);
    setCurrentLimit(newLimit);
    setCurrentPage(1); // Reiniciar a la primera página al cambiar el límite
  };

  // Función para manejar el envío del formulario de búsqueda
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const params = new URLSearchParams();
      params.set("q", searchInput.trim());
      setSearchParams(params);
    }
  };

  // Función para limpiar la búsqueda
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchParams({});
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

  // Función para obtener las opciones de ordenamiento
  const getSortOptions = () => {
    return [
      { value: "relevance", label: "Relevancia" },
      { value: "price-low", label: "Precio: Menor a Mayor" },
      { value: "price-high", label: "Precio: Mayor a Menor" },
      { value: "name", label: "Nombre" },
      { value: "discount", label: "Mayor descuento" },
    ];
  };

  // Función para obtener las opciones de filtro de precio
  const getPriceFilterOptions = () => {
    return [
      { value: "all", label: "Todos los precios" },
      { value: "under-100", label: "Menos de $100" },
      { value: "100-200", label: "$100 - $200" },
      { value: "200-300", label: "$200 - $300" },
      { value: "over-300", label: "Más de $300" },
    ];
  };

  return (
    <PageContainer
      backButtonText="Inicio"
      backButtonOnClick={handleNavigate}
    >
      <PageHeader>

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

      {/* Barra de búsqueda */}
      <SearchBarContainer>
        <SearchForm onSubmit={handleSearchSubmit}>
          <SearchInputContainer>
            <Input
              type="text"
              placeholder="Buscar productos en todas las empresas..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIconName="FaSearch"
              fullWidth={true}
            />
          </SearchInputContainer>
          <SearchButtonContainer>
            <Button
              text="Buscar"
              variant="solid"
              type="submit"
              leftIconName="FaSearch"
              disabled={!searchInput.trim()}
            />
            {query && (
              <Button
                text="Limpiar"
                variant="outlined"
                onClick={handleClearSearch}
                leftIconName="FaTimes"
              />
            )}
          </SearchButtonContainer>
        </SearchForm>
      </SearchBarContainer>

      {/* Estado: No hay consulta de búsqueda */}
      {!loading && results === null && (
        <NoResultsContainer>
          <RenderIcon name="FaSearch" size={30} />
          <NoResultsTitle>Busca en todas las empresas</NoResultsTitle>
          <NoResultsText>
            Escribe el nombre del producto, marca o características que buscas
            para encontrar los mejores resultados en todas las empresas
            disponibles.
          </NoResultsText>
        </NoResultsContainer>
      )}

      {/* Estado: Hay resultados de búsqueda */}
      {!loading && results && results.length > 0 && (
        <>
          <FiltersBar>
            <FiltersContent>
              <FiltersHeader>
                <FiltersTitle>
                  <div>
                    <RenderIcon name="FaFilter" size={18} />
                    Filtros y Ordenamiento
                  </div>
                  <div>
                    {/* Mostrar aviso si hay productos restringidos */}
                    {results &&
                      results.some((product) => !product.hasAccess) && (
                        <RestrictedProductsNotice>
                          <RenderIcon name="FaInfoCircle" size={16} />
                          <span>
                            Algunos productos requieren autorización especial.
                            Los filtros se aplican solo a productos accesibles,
                            mientras que los productos restringidos aparecen al
                            final de la lista.
                          </span>
                        </RestrictedProductsNotice>
                      )}
                  </div>
                </FiltersTitle>

                <FiltersControls>
                  <FilterGroup>
                    <Select
                      options={getPriceFilterOptions()}
                      value={priceRange}
                      onChange={handlePriceRangeChange}
                      placeholder="Seleccionar precio"
                      width="180px"
                      label="Rango de Precio"
                      name="priceRange"
                    />
                  </FilterGroup>

                  <FilterGroup>
                    <Select
                      options={getSortOptions()}
                      value={sortOption}
                      onChange={handleSortChange}
                      placeholder="Ordenar por..."
                      width="180px"
                      label="Ordenar por"
                      name="sortOption"
                    />
                  </FilterGroup>

                  <FilterGroup>
                    <Select
                      options={[
                        { value: 12, label: "12 productos" },
                        { value: 24, label: "24 productos" },
                        { value: 36, label: "36 productos" },
                        { value: 72, label: "72 productos" },
                        { value: 144, label: "144 productos" },
                      ]}
                      value={currentLimit}
                      onChange={handleItemsPerPageChange}
                      label="Productos por página"
                      placeholder="Seleccionar cantidad"
                      width="180px"
                      name="itemsPerPage"
                    />
                  </FilterGroup>
                </FiltersControls>
              </FiltersHeader>
            </FiltersContent>
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
            {currentProducts.map((product) => (
              <ProductCard
                key={`${product.empresaId}-${product.id}`}
                product={product}
                lineConfig={
                  PRODUCT_LINE_CONFIG[product.lineaNegocio] ||
                  PRODUCT_LINE_CONFIG.DEFAULT
                }
                restricted={!product.hasAccess}
                onRequestAccess={handleRequestAccess}
                // Pasar información de búsqueda para preservar contexto
                currentFilters={{
                  searchTerm: query,
                  sortBy: sortOption,
                  priceRange: priceRange
                }}
                currentSearch={query}
                currentSort={sortOption}
              />
            ))}
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
                const pageNumber = index + 1;
                
                // Mostrar máximo 5 botones de página
                if (
                  pageNumber === 1 || // Primera página
                  pageNumber === totalPages || // Última página
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1) // Páginas cercanas a la actual
                ) {
                  return (
                    <PageButton
                      key={`page-${pageNumber}`}
                      $active={currentPage === pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      text={pageNumber}
                      size="small"
                    />
                  );
                } else if (
                  (pageNumber === 2 && currentPage > 3) || // Mostrar puntos suspensivos después de la primera página
                  (pageNumber === totalPages - 1 && currentPage < totalPages - 2) // Mostrar puntos suspensivos antes de la última página
                ) {
                  return <span key={`dots-${pageNumber}`}>...</span>;
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
