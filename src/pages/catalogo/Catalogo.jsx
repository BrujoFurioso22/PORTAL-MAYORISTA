import React, { useState, useEffect, use, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { productosPorEmpresa, empresas } from "../../mock/products";
import ProductCard from "../../components/ui/ProductCard";
import FilterSidebar from "../../components/ui/FilterSidebar";
import { toast } from "react-toastify";
import {
  categories as allCategories,
  brands as allBrands,
} from "../../mock/products";
import { products_getProductByField } from "../../services/products/products";
import { PRODUCT_LINE_CONFIG } from "../../constants/productLineConfig";
import { useProductCache } from "../../context/ProductCacheContext";

const PageContainer = styled.div`
  padding: 20px;
  background-color: ${({ theme }) =>
    theme.colors.background}; // Asegurar fondo correcto
`;

const PageHeader = styled.div`
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PageTitle = styled.h1`
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const BreadCrumb = styled.div`
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const BreadCrumbLink = styled.span`
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  &:hover {
    text-decoration: underline;
  }
`;

const ProductsCount = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0;
`;

const ContentLayout = styled.div`
  display: flex;
`;

const ProductsGrid = styled.div`
  display: grid;
  gap: 16px;
  flex: 1;

  grid-template-columns: repeat(auto-fill, minmax(225px, 1fr));
`;

const NoAccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background-color: ${({ theme }) =>
    theme.colors.surface}; // Usar surface en lugar de "white" fijo
  color: ${({ theme }) => theme.colors.text}; // Añadir color de texto explícito
  border-radius: 8px;
  box-shadow: ${({ theme }) =>
    theme.shadows.md}; // Corregir referencia a shadows
  margin: 2rem auto;
  max-width: 600px;
`;

// Reemplazar el SortContainer actual con este estilo mejorado
const SortContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 1px 3px ${({ theme }) => theme.colors.shadow};
`;

// Estilo mejorado para el selector de ordenación
const SortSelect = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 10px;
  padding-right: 28px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

// Nuevo estilo para el contenedor de "Mostrar X por página"
const PerPageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
`;

// Estilo para el selector de elementos por página
const PerPageSelect = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;
  width: 60px;
  text-align: center;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 8px;
  padding-right: 24px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;
const FormContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin-top: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  color: ${({ theme }) =>
    theme.colors.text}; // Asegurar buen contraste del texto
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${({ theme }) =>
    theme.colors.text}; // Asegurar buen contraste para etiquetas
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  background-color: ${({ theme }) =>
    theme.colors.surface}; // Añadir color de fondo
  color: ${({ theme }) => theme.colors.text}; // Añadir color de texto
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  min-height: 120px;
  background-color: ${({ theme }) =>
    theme.colors.surface}; // Añadir color de fondo
  color: ${({ theme }) => theme.colors.text}; // Añadir color de texto
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) =>
    theme.colors.white}; // Usar theme.colors.white en lugar de "white" fijo
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.accent}; // Cambiar a accent para mejor contraste
  }
`;

// Añadir este estilo para contener los botones
const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

// Añadir un estilo para el botón secundario
const SecondaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
  gap: 8px;
  padding: 16px 0;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.white : theme.colors.text};
  border-radius: 4px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};

  &:hover {
    background-color: ${({ theme, $active, disabled }) =>
      disabled
        ? "inherit"
        : $active
        ? theme.colors.primary
        : theme.colors.background};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const mapApiProductToAppFormat = (item) => {
  // Determinar qué configuración usar según la línea de negocio
  const lineConfig =
    PRODUCT_LINE_CONFIG[item.DMA_LINEANEGOCIO] || PRODUCT_LINE_CONFIG.DEFAULT;

  // Construir categorías
  const categories = [];
  lineConfig.categories.forEach((cat) => {
    if (item[cat.field]) {
      const categoryValue = cat.transform(item[cat.field]);
      if (categoryValue) categories.push(categoryValue);
    }
  });

  // Construir especificaciones según la línea de negocio
  const specs = {};
  lineConfig.specs.forEach((spec) => {
    const transformedValue = spec.transform(item);

    specs[spec.field] =
      transformedValue == null ? spec.defaultValue : transformedValue;
  });

  // Construir URL de imagen completa
  const imageUrl = item.DMA_RUTAIMAGEN
    ? `${import.meta.env.VITE_API_IMAGES_URL}${item.DMA_RUTAIMAGEN}`
    : "https://via.placeholder.com/300x300?text=Sin+Imagen";

  // Crear objeto de producto adaptado al formato esperado usando la plantilla correspondiente
  return {
    id: item.DMA_CODIGO,
    name: lineConfig.nameTemplate(item),
    description: lineConfig.descriptionTemplate(item),
    price: item.DMA_COSTO, // Si no tienes precio en la API, deberás añadirlo o usar un valor por defecto
    discount: 0, // Si no tienes descuento en la API, usa 0 por defecto
    image: imageUrl,
    categories: categories,
    brand: item.DMA_MARCA || "Sin marca",
    rating: 0,
    stock: item.DMA_STOCK,
    destacado: item.DMA_ACTIVO === "SI",
    empresaId: item.DMA_EMPRESA,
    specs: specs,
    // Datos adicionales específicos
    rutaImagen: item.DMA_RUTAIMAGEN,
    codigoBarras: item.DMA_CODIGOBARRAS,
    lineaNegocio: item.DMA_LINEANEGOCIO,
    // Guardar el objeto original para acceso a todos los campos
    originalData: item,
  };
};

const Catalogo = () => {
  // Hooks existentes
  const { empresaName } = useParams();
  const { user, navigateToHomeByRole } = useAuth();
  // const navigate = useNavigate();
  // const { theme } = useAppTheme();

  // Hook del caché
  const { isCacheValid, getCachedProducts, cacheProducts } = useProductCache();

  // Estados existentes...
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [formData, setFormData] = useState({
    nombre: user?.NAME_USER || "",
    email: user?.EMAIL || "",
    mensaje: "",
  });
  // Nuevos estados para información específica de la empresa
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  // Añadir estos nuevos estados al componente Catalogo
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [hasAccess, setHasAccess] = useState(false);
  // Estado para detectar la línea de negocio
  const [lineaNegocio, setLineaNegocio] = useState("DEFAULT");
  // console.log(empresaName);

  // Obtener información de la empresa - usar find insensible a mayúsculas/minúsculas
  const empresaInfo = empresas.find(
    (empresa) => empresa.nombre === empresaName
  );

  const handleNavigate = () => {
    navigateToHomeByRole();
  };

  // Función para obtener productos desde la API
  const fetchProductsFromAPI = async () => {
    try {
      console.log("Obteniendo productos de la API para:", empresaName);

      const respProductos = await products_getProductByField({
        field: "empresa",
        value: empresaName,
      });

      if (respProductos.success) {
        const productos = respProductos.data || [];
        const mappedProducts = productos.map(mapApiProductToAppFormat);

        // Guardar productos en caché
        cacheProducts(empresaName, mappedProducts);

        // Actualizar estados locales
        setFilteredProducts(mappedProducts);
        extractCategoriesAndBrands(mappedProducts);
      } else {
        console.error("Error al cargar productos:", respProductos.message);
        toast.error("No se pudieron cargar los productos");
      }
    } catch (error) {
      console.error("Error en fetchProducts:", error);
      toast.error("Error al obtener los productos");
    }
  };

  // Función para extraer categorías y marcas de los productos
  const extractCategoriesAndBrands = (products) => {
    // Extraer categorías únicas
    const allCats = [...new Set(products.flatMap((p) => p.categories))];
    const empresaCategories = allCats.map((catName) => {
      const existingCat = allCategories.find((c) => c.name === catName);
      if (existingCat) return existingCat;

      return {
        id: catName,
        name: catName,
        displayName: catName
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
      };
    });
    setAvailableCategories(empresaCategories);

    // Extraer marcas únicas
    const allBrandNames = [...new Set(products.map((p) => p.brand))];
    const empresaBrands = allBrandNames.map((brandName) => {
      const existingBrand = allBrands.find((b) => b.name === brandName);
      if (existingBrand) return existingBrand;

      return {
        id: brandName,
        name: brandName,
      };
    });
    setAvailableBrands(empresaBrands);

    // Calcular rango de precios
    if (products.length > 0 && products[0].price) {
      const prices = products.map((p) => p.price).filter((p) => p > 0);
      if (prices.length > 0) {
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        setPriceRange({ min: minPrice, max: maxPrice });
      }
    }
  };

  // Efecto para cargar productos cuando cambia la empresa o el usuario
  useEffect(() => {
    // Determinar si el usuario tiene acceso
    const userHasAccess = user?.EMPRESAS?.includes(empresaName) || false;
    setHasAccess(userHasAccess);

    if (userHasAccess) {
      // Verificar si hay datos en caché y si son válidos
      if (isCacheValid(empresaName)) {
        console.log("Usando productos en caché para:", empresaName);
        const cachedProducts = getCachedProducts(empresaName);
        setFilteredProducts(cachedProducts);
        extractCategoriesAndBrands(cachedProducts);
      } else {
        // Si no hay caché o expiró, hacer la petición
        fetchProductsFromAPI();
      }
    }
  }, [empresaName, user]);

  // Modificar el manejador de filtros para usar los datos en caché cuando sea posible
  const handleFilters = useCallback(
    (filters) => {
      if (!hasAccess) return;

      // Obtener los productos, preferentemente del caché
      let productsToFilter;
      if (isCacheValid(empresaName)) {
        productsToFilter = getCachedProducts(empresaName);
      } else {
        // Si el caché no es válido, hacer la petición
        products_getProductByField({
          field: "empresa",
          value: empresaName,
        })
          .then((respProductos) => {
            if (respProductos.success) {
              // Mapear y guardar en caché
              const mappedProducts = respProductos.data.map(
                mapApiProductToAppFormat
              );
              cacheProducts(empresaName, mappedProducts);

              // Continuar con el filtrado
              applyFilters(mappedProducts, filters);
            }
          })
          .catch((error) => {
            console.error("Error al aplicar filtros:", error);
            toast.error("Error al filtrar productos");
          });
        return;
      }

      // Si tenemos productos en caché, aplicar los filtros directamente
      applyFilters(productsToFilter, filters);
    },
    [hasAccess, empresaName, isCacheValid, getCachedProducts, cacheProducts]
  );

  // Función para aplicar filtros (extraída para reutilizar)
  const applyFilters = (products, filters) => {
    let result = [...products];

    // Filtrar por categorías
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter((product) =>
        product.categories.some((cat) => filters.categories.includes(cat))
      );
    }

    // Filtrar por marcas
    if (filters.brands && filters.brands.length > 0) {
      result = result.filter((product) =>
        filters.brands.includes(product.brand)
      );
    }

    // Filtrar por precio
    if (filters.price) {
      result = result.filter(
        (product) =>
          product.price >= filters.price.min &&
          product.price <= filters.price.max
      );
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  };

  const handleSort = (e) => {
    const option = e.target.value;
    setSortOption(option);

    let sorted = [...filteredProducts];

    switch (option) {
      case "price_asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // No sorting needed
        break;
    }

    setFilteredProducts(sorted);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    // Aquí iría el código para enviar la solicitud de acceso
    // Por ahora solo mostraremos un toast
    toast.success("Solicitud enviada correctamente");
    handleNavigate();
  };

  // Calcular total de páginas cada vez que cambian los productos filtrados
  useEffect(() => {
    setTotalPages(Math.ceil(filteredProducts.length / productsPerPage));
    // Reset a la primera página cuando cambian los filtros
    setCurrentPage(1);
  }, [filteredProducts, productsPerPage]);

  // Calcular productos actuales para paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Crear función para cambiar de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll al principio de la lista de productos
    window.scrollTo(
      0,
      document.getElementById("productos-grid").offsetTop - 80
    );
  };

  // Efecto para detectar la línea de negocio predominante
  useEffect(() => {
    if (filteredProducts && filteredProducts.length > 0) {
      // Contar las líneas de negocio presentes
      const lineCount = {};
      filteredProducts.forEach((product) => {
        const line = (product.lineaNegocio || "DEFAULT").toUpperCase();
        lineCount[line] = (lineCount[line] || 0) + 1;
      });

      // Encontrar la línea más común
      let maxCount = 0;
      let dominantLine = "DEFAULT";

      Object.entries(lineCount).forEach(([line, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantLine = line;
        }
      });

      setLineaNegocio(dominantLine);
    }
  }, [filteredProducts]);

  if (!empresaInfo) {
    return (
      <NoAccessContainer>
        <h2>Empresa no encontrada</h2>
        <p>La empresa que estás buscando no existe en nuestro sistema.</p>
        <Button onClick={handleNavigate}>Volver al inicio</Button>
      </NoAccessContainer>
    );
  }

  // Si no tiene acceso, mostrar formulario de solicitud
  if (!hasAccess) {
    return (
      <NoAccessContainer>
        <h2>Solicitar acceso a {empresaInfo.nombre}</h2>
        <p>
          Actualmente no tienes acceso a los productos de esta empresa. Por
          favor, completa el formulario para solicitar acceso.
        </p>

        <FormContainer>
          <form onSubmit={handleSubmitRequest}>
            <FormGroup>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="mensaje">Mensaje</Label>
              <TextArea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleInputChange}
                placeholder="Por favor, indique por qué necesita acceso a los productos de esta empresa"
                required
              />
            </FormGroup>

            <ButtonGroup>
              <SecondaryButton type="button" onClick={handleNavigate}>
                Regresar
              </SecondaryButton>
              <Button type="submit">Enviar solicitud</Button>
            </ButtonGroup>
          </form>
        </FormContainer>
      </NoAccessContainer>
    );
  }

  return (
    <PageContainer>
      <BreadCrumb>
        <BreadCrumbLink onClick={handleNavigate}>Inicio</BreadCrumbLink>
        {">"}
        <span>{empresaInfo.nombre}</span>
      </BreadCrumb>

      <PageHeader>
        <PageTitle>Catálogo de {empresaInfo.nombre}</PageTitle>
        <ProductsCount>
          {filteredProducts.length} productos encontrados
        </ProductsCount>
      </PageHeader>

      <ContentLayout>
        <FilterSidebar
          availableCategories={availableCategories}
          availableBrands={availableBrands}
          priceRange={priceRange}
          onApplyFilters={handleFilters}
          lineaNegocio={lineaNegocio} // Añadir esta prop
        />

        <div style={{ flex: 1 }}>
          <SortContainer>
            <SortSelect value={sortOption} onChange={handleSort}>
              <option value="default">Ordenar por: Destacados</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
              <option value="name_asc">Alfabético (A-Z)</option>
              <option value="rating">Mejor valorados</option>
            </SortSelect>

            <PerPageContainer>
              <span>Mostrar:</span>
              <PerPageSelect
                value={productsPerPage}
                onChange={(e) => setProductsPerPage(Number(e.target.value))}
              >
                <option value={12}>12</option>
                <option value={36}>36</option>
                <option value={72}>72</option>
                <option value={144}>144</option>
              </PerPageSelect>
              <span>por página</span>
            </PerPageContainer>
          </SortContainer>

          <ProductsGrid id="productos-grid">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) =>
                product && product.id ? (
                  <ProductCard
                    key={product.id}
                    product={product}
                    lineConfig={
                      PRODUCT_LINE_CONFIG[product.lineaNegocio] ||
                      PRODUCT_LINE_CONFIG.DEFAULT
                    }
                  />
                ) : null
              )
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  gridColumn: "1 / -1",
                }}
              >
                No se encontraron productos que coincidan con los criterios
                seleccionados.
              </div>
            )}
          </ProductsGrid>

          {/* Paginación */}
          {filteredProducts.length > 0 && (
            <Pagination>
              <PageButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt; Anterior
              </PageButton>

              {/* Mostrar números de página */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <PageButton disabled>...</PageButton>
                    )}
                    <PageButton
                      $active={currentPage === page}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </PageButton>
                  </React.Fragment>
                ))}

              <PageButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente &gt;
              </PageButton>
            </Pagination>
          )}
        </div>
      </ContentLayout>
    </PageContainer>
  );
};

export default Catalogo;
