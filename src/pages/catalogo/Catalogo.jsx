import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { productosPorEmpresa, empresas } from "../../mock/products";
import ProductCard from "../../components/ui/ProductCard";
import FilterSidebar from "../../components/ui/FilterSidebar";
import { toast } from "react-toastify";

import { products_getProductByField } from "../../services/products/products";
import { PRODUCT_LINE_CONFIG } from "../../constants/productLineConfig";
import { useProductCache } from "../../context/ProductCacheContext";
import RenderLoader from "../../components/ui/RenderLoader"; // Importar RenderLoader
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import SearchBar from "../../components/ui/SearchBar";

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
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 1px 3px ${({ theme }) => theme.colors.shadow};
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

// Añadir este estilo para contener los botones
const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
  gap: 8px;
  padding: 16px 0;
`;

const PageButton = styled(Button)`
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
  try {
    // Verificar que item no sea null o undefined
    if (!item) {
      console.warn("[MAPEO] Item nulo o undefined");
      return null;
    }

    // Verificar que tengamos un ID válido
    if (!item.DMA_CODIGO) {
      console.warn("[MAPEO] Item sin código:", item);
      return null;
    }

    // Determinar qué configuración usar según la línea de negocio
    const lineConfig =
      PRODUCT_LINE_CONFIG[item.DMA_LINEANEGOCIO] || PRODUCT_LINE_CONFIG.DEFAULT; // Construir filtros manteniendo valores originales
    const categoriesByType = {}; // Nuevo objeto para separar por tipo

    lineConfig.categories.forEach((cat) => {
      if (item[cat.field]) {
        const originalValue = item[cat.field]; // Valor original sin transformar

        // Obtener el nombre del campo sin el prefijo DMA_
        const fieldType = cat.field.replace("DMA_", "").toLowerCase();

        // Añadir al objeto separado por tipo con valor original
        if (!categoriesByType[fieldType]) {
          categoriesByType[fieldType] = [];
        }
        categoriesByType[fieldType].push(originalValue);
      }
    });

    // Construir especificaciones según la línea de negocio
    const specs = {};
    lineConfig.specs.forEach((spec) => {
      try {
        const transformedValue = spec.transform(item);
        specs[spec.field] =
          transformedValue == null ? spec.defaultValue : transformedValue;
      } catch (e) {
        console.warn(
          `[MAPEO] Error transformando spec ${spec.field}:`,
          e.message
        );
        specs[spec.field] = spec.defaultValue;
      }
    });

    // Construir URL de imagen completa (con manejo de error)
    let imageUrl = "https://via.placeholder.com/300x300?text=Sin+Imagen";
    if (item.DMA_RUTAIMAGEN) {
      try {
        imageUrl = `${import.meta.env.VITE_API_IMAGES_URL}${
          item.DMA_RUTAIMAGEN
        }`;
      } catch (e) {
        console.warn("[MAPEO] Error creando URL de imagen:", e.message);
      }
    }

    // Validar los templates antes de usarlos
    let name = "Producto sin nombre";
    let description = "Sin descripción";

    try {
      name = lineConfig.nameTemplate(item);
    } catch (e) {
      console.warn("[MAPEO] Error generando nombre:", e.message);
    }

    try {
      description = lineConfig.descriptionTemplate(item);
    } catch (e) {
      console.warn("[MAPEO] Error generando descripción:", e.message);
    }

    // Validar precio - usar 0 si es inválido
    const price = !isNaN(parseFloat(item.DMA_COSTO))
      ? parseFloat(item.DMA_COSTO)
      : 0;

    // Validar stock - usar 0 si es inválido
    const stock = !isNaN(parseInt(item.DMA_STOCK))
      ? parseInt(item.DMA_STOCK)
      : 0;

    if (item.DMA_DESCUENTO_PROMOCIONAL) {
      console.log(
        "[MAPEO] Producto con descuento promocional:",
        item.DMA_DESCUENTO_PROMOCIONAL,
        name
      );
    }

    // Crear objeto de producto adaptado al formato esperado usando la plantilla correspondiente
    return {
      id: item.DMA_CODIGO,
      name: name,
      description: description,
      price: price,
      discount: item.DMA_DESCUENTO_PROMOCIONAL,
      image: imageUrl,
      filtersByType: categoriesByType, // Objeto organizado por tipo
      brand: item.DMA_MARCA || "Sin marca",
      rating: 0,
      stock: stock,
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
  } catch (error) {
    console.error("[MAPEO] Error general mapeando producto:", error);
    console.error("[MAPEO] Item problemático:", item);
    return null; // Retornar null en caso de error general
  }
};

const Catalogo = () => {
  // Hooks existentes
  const { empresaName } = useParams();
  const { user, navigateToHomeByRole } = useAuth();
  const [allProducts, setAllProducts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableBusinessLines, setAvailableBusinessLines] = useState([
    "DEFAULT",
  ]);
  const [hasAccess, setHasAccess] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // Nueva bandera
  const [initMessage, setInitMessage] = useState("Validando permisos..."); // Mensaje de inicialización

  /**
   * Revisar esto para ver si es necesario ------------------------------------------------------------------------
   */
  // Hook del caché
  const { isCacheValid, getCachedProducts, cacheProducts } = useProductCache();
  // Inicializar filteredProducts como null para indicar que los datos están en carga
  const [searchParams, setSearchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    nombre: user?.NAME_USER || "",
    email: user?.EMAIL || "",
    mensaje: "",
  });

  const searchTimeoutRef = useRef(null);

  /**
   * fin de bloque ------------------------------------------------------------------------
   */ const searchParamsValues = useMemo(
    () => ({
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "12"),
      sort: searchParams.get("sort") || "default",
      search: searchParams.get("search") || "",
      categories: searchParams.get("cat")?.split(",") || [],
      brands: searchParams.get("brands")?.split(",") || [],
      line: searchParams.get("line") || "DEFAULT",
      price: searchParams.get("price")
        ? (() => {
            const [min, max] = searchParams.get("price").split("-").map(Number);
            return { min, max };
          })()
        : null, // No establecer valores por defecto aquí
    }),
    [searchParams]
  );

  // Reemplazar el procesamiento de productos actual con esta versión optimizada
  const processedProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0)
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        itemsPerPage: 12,
      };

    // Extraer todos los parámetros de la URL
    const params = searchParamsValues;

    // Preparar valores usados en comparaciones para evitar recalcularlos en cada iteración
    const searchValue = params.search
      ? params.search.toLowerCase().trim()
      : null;
    const lineToMatch =
      params.line !== "DEFAULT" ? params.line.toLowerCase() : null;
    const hasCategories = params.categories.length > 0;
    const hasBrands = params.brands.length > 0;
    const hasPrice =
      params.price && (params.price.min > 0 || params.price.max < Infinity);

    // Aplicar todos los filtros en una sola pasada
    let result = allProducts.filter((product) => {
      // Si el producto no tiene datos básicos, excluirlo
      if (!product || !product.id) return false;

      // 1. Filtro de búsqueda
      if (searchValue) {
        const nameMatch =
          product.name && product.name.toLowerCase().includes(searchValue);
        const descMatch =
          product.description &&
          product.description.toLowerCase().includes(searchValue);
        const idMatch =
          product.id && product.id.toString().includes(searchValue);
        const barcodeMatch =
          product.codigoBarras &&
          product.codigoBarras.toLowerCase().includes(searchValue);

        if (!(nameMatch || descMatch || idMatch || barcodeMatch)) {
          return false;
        }
      }

      // 2. Filtro de línea de negocio
      if (
        lineToMatch &&
        (!product.lineaNegocio ||
          product.lineaNegocio.toLowerCase() !== lineToMatch)
      ) {
        return false;
      } // 3. Filtro de categorías usando filtersByType con lógica AND
      if (hasCategories) {
        // Verificar que el producto tiene TODAS las categorías seleccionadas
        const hasAllCategories = params.categories.every((selectedCategory) => {
          if (
            !product.filtersByType ||
            typeof product.filtersByType !== "object"
          ) {
            return false;
          }

          // Buscar la categoría en cualquier tipo de filtro del producto
          return Object.values(product.filtersByType).some(
            (filterArray) =>
              Array.isArray(filterArray) &&
              filterArray.includes(selectedCategory)
          );
        });

        if (!hasAllCategories) {
          return false;
        }
      }

      // 4. Filtro de marcas
      if (hasBrands && !params.brands.includes(product.brand)) {
        return false;
      }

      // 5. Filtro de precio
      if (
        hasPrice &&
        product.price !== 0 &&
        (product.price < params.price.min || product.price > params.price.max)
      ) {
        return false;
      }

      // Si pasó todos los filtros, incluir el producto
      return true;
    });

    // Aplicar ordenamiento
    if (params.sort && params.sort !== "default") {
      switch (params.sort) {
        case "price_asc":
          result.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          result.sort((a, b) => b.price - a.price);
          break;
        case "name_asc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "rating":
          result.sort((a, b) => b.rating - a.rating);
          break;
      }
    }

    // Calcular paginación
    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / params.limit);

    // Obtener productos para la página actual
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedResults = result.slice(startIndex, endIndex);

    return {
      items: paginatedResults,
      totalItems,
      totalPages,
      currentPage: params.page,
      itemsPerPage: params.limit,
    };
  }, [allProducts, searchParamsValues]);

  // Modificar la función que actualiza los parámetros de URL
  const updateUrlParams = useCallback(
    (updates) => {
      // Crear una copia de los parámetros actuales para comparar después
      const prevParams = new URLSearchParams(searchParams);
      const params = new URLSearchParams(searchParams);

      // Variable para detectar si sólo cambió la página
      let onlyPageChanged = true;
      let oldPage = prevParams.get("page") || "1";

      // Procesar cada actualización
      Object.entries(updates).forEach(([key, value]) => {
        switch (key) {
          case "page":
            if (value > 1) params.set("page", value.toString());
            else params.delete("page");
            break;
          case "limit":
            if (value !== 12) params.set("limit", value.toString());
            else params.delete("limit");
            break;
          case "sort":
            if (value !== "default") params.set("sort", value);
            else params.delete("sort");
            break;
          case "search":
            if (value) params.set("search", value);
            else params.delete("search");
            break;
          case "categories":
            if (value.length > 0) params.set("cat", value.join(","));
            else params.delete("cat");
            break;
          case "brands":
            if (value.length > 0) params.set("brands", value.join(","));
            else params.delete("brands");
            break;
          case "line":
            if (value !== "DEFAULT") params.set("line", value);
            else params.delete("line");
            break;
          case "price":
            if (value && (value.min > 0 || value.max < Infinity)) {
              params.set("price", `${value.min}-${value.max}`);
            } else {
              params.delete("price");
            }
            break;
          default:
            onlyPageChanged = false; // Si hay alguna otra actualización, no es sólo cambio de página
        }
      });

      if (onlyPageChanged && updates.page) {
        // Usar history.replaceState para no activar efectos
        const url = new URL(window.location);
        if (updates.page > 1) {
          url.searchParams.set("page", updates.page.toString());
        } else {
          url.searchParams.delete("page");
        }

        // Esto evita ciclos al cambiar sólo la página
        window.history.replaceState({}, "", url);

        // También actualizar el estado local para el componente
        setTimeout(() => {
          setSearchParams(params);
        }, 0);
      } else {
        // Para otros cambios, actualizar normalmente
        setSearchParams(params);
      }
    },
    [searchParams, setSearchParams]
  );

  // Obtener información de la empresa
  const empresaInfo = empresas.find(
    (empresa) => empresa.nombre === empresaName
  );

  const handleNavigate = () => {
    navigateToHomeByRole();
  };

  const handleSearch = (value) => {
    updateUrlParams({ search: value, page: 1 });
  };

  const handleSort = (e) => {
    updateUrlParams({ sort: e.target.value, page: 1 });
  };
  const handleFilters = (filters) => {
    // Calcular el rango de precios real de los productos actuales
    const currentPriceRange =
      allProducts && allProducts.length > 0
        ? (() => {
            const prices = allProducts.map((p) => p.price).filter((p) => p > 0);
            return prices.length > 0
              ? { min: Math.min(...prices), max: Math.max(...prices) }
              : { min: 0, max: 100000 };
          })()
        : { min: 0, max: 100000 };

    updateUrlParams({
      categories: filters.categories || [],
      brands: filters.brands || [],
      price:
        filters.price &&
        (filters.price.min > currentPriceRange.min ||
          filters.price.max < currentPriceRange.max)
          ? filters.price
          : null, // No incluir precio si es el rango completo
      line: filters.businessLine || "DEFAULT",
      page: 1,
    });
  };

  const handlePageChange = (pageNumber) => {
    updateUrlParams({ page: pageNumber });
    window.scrollTo(
      0,
      document.getElementById("productos-grid").offsetTop - 80
    );
  };

  const handleItemsPerPageChange = (e) => {
    updateUrlParams({ limit: Number(e.target.value), page: 1 });
  };

  // Luego, añade este useEffect para detectar las líneas de negocio disponibles
  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      // Extraer todas las líneas de negocio únicas de los productos
      const lines = [
        ...new Set(
          allProducts.map((product) => product.lineaNegocio).filter(Boolean) // Eliminar valores undefined/null
        ),
      ];

      // Si hay líneas detectadas, actualizarlas
      if (lines.length > 0) {
        setAvailableBusinessLines(lines);
      } else {
        // Si no hay líneas específicas, usar DEFAULT
        setAvailableBusinessLines(["DEFAULT"]);
      }

      // Log para diagnóstico
      // console.log("[DEBUG] Líneas de negocio detectadas:", lines);
    }
  }, [allProducts]);

  // Función para obtener productos desde la API
  const fetchProductsFromAPI = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simular retardo de 1 segundo

      const respProductos = await products_getProductByField({
        field: "empresa",
        value: empresaName,
      });

      if (respProductos.success) {
        const productos = respProductos.data || [];

        // Mapear los productos con seguimiento de errores
        const mappedProducts = [];
        const failedProducts = [];

        productos.forEach((item) => {
          try {
            const mappedItem = mapApiProductToAppFormat(item);
            if (mappedItem && mappedItem.id) {
              mappedProducts.push(mappedItem);
            } else {
              failedProducts.push({
                original: item,
                reason: "Producto mapeado pero sin ID válido",
              });
            }
          } catch (error) {
            failedProducts.push({
              original: item,
              reason: `Error en mapeo: ${error.message}`,
            });
          }
        });

        if (failedProducts.length > 0) {
          console.warn(
            `[DIAGNÓSTICO] ${failedProducts.length} productos fallaron en el mapeo:`,
            failedProducts.slice(0, 3)
          ); // Mostrar solo los primeros 3 para no saturar la consola
        }

        // Verificar duplicados por ID
        const uniqueIds = new Set();
        const duplicateIds = [];

        mappedProducts.forEach((product) => {
          if (uniqueIds.has(product.id)) {
            duplicateIds.push(product.id);
          } else {
            uniqueIds.add(product.id);
          }
        });

        if (duplicateIds.length > 0) {
          console.warn(
            `[DIAGNÓSTICO] Se encontraron ${duplicateIds.length} IDs duplicados:`,
            [...new Set(duplicateIds)].slice(0, 5)
          );
        }

        // Guardar productos en caché
        cacheProducts(empresaName, mappedProducts); // Guardar todos los productos originales

        setAllProducts(mappedProducts);
      } else {
        console.error("Error al cargar productos:", respProductos.message);
        toast.error("No se pudieron cargar los productos");
        // En caso de error, establecer una lista vacía para evitar loader infinito
      }
    } catch (error) {
      console.error("Error en fetchProducts:", error);
      toast.error("Error al obtener los productos");
      // En caso de error, establecer una lista vacía para evitar loader infinito
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar productos cuando cambia la empresa o el usuario
  useEffect(() => {
    // Limpiar cualquier búsqueda pendiente al cambiar de empresa
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsInitializing(true);
    setInitMessage("Validando permisos...");
    setIsLoading(true);

    const userHasAccess = user?.EMPRESAS?.includes(empresaName) || false;
    setHasAccess(userHasAccess);

    if (userHasAccess) {
      setInitMessage("Cargando productos...");
      if (isCacheValid(empresaName)) {
        const cachedProducts = getCachedProducts(empresaName);
        setAllProducts(cachedProducts);
        setIsLoading(false);
        setInitMessage(
          empresaInfo
            ? `Cargando información de ${empresaInfo.nombre}...`
            : empresaName
            ? `Cargando información de ${empresaName}...`
            : "Cargando información..."
        );
        setIsInitializing(false);
      } else {
        setInitMessage("Cargando productos desde el servidor...");
        fetchProductsFromAPI().finally(() => {
          setInitMessage(
            empresaInfo
              ? `Cargando información de ${empresaInfo.nombre}...`
              : empresaName
              ? `Cargando información de ${empresaName}...`
              : "Cargando información..."
          );
          setIsInitializing(false);
        });
      }
    } else {
      setIsLoading(false);
      setInitMessage(
        empresaInfo
          ? `Cargando información de ${empresaInfo.nombre}...`
          : empresaName
          ? `Cargando información de ${empresaName}...`
          : "Cargando información..."
      );
      setIsInitializing(false);
    }
  }, [empresaName, user]);

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

  const currentSort = searchParams.get("sort") || "default";
  const currentLimit = parseInt(searchParams.get("limit") || "12");
  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentSearch = searchParams.get("search") || "";
  const currentCategories = searchParams.get("cat")?.split(",") || [];
  const currentBrands = searchParams.get("brands")?.split(",") || [];
  const currentLine = searchParams.get("line") || "DEFAULT";
  const currentPriceRange = searchParams.get("price")
    ? (() => {
        const [min, max] = searchParams.get("price").split("-").map(Number);
        return { min, max };
      })()
    : null; // No establecer valores por defecto

  useEffect(() => {
    // Extraer el número de página de searchParams
    const pageParam = searchParams.get("page");
    const currentPageNumber = parseInt(pageParam || "1");

    // Actualizar processedProducts para mostrar la página correcta
    if (
      processedProducts &&
      processedProducts.currentPage !== currentPageNumber &&
      currentPageNumber <= processedProducts.totalPages
    ) {
      // No hacer nada más, solo asegurarse de que processedProducts use el valor correcto      console.log("Ajustando a página:", currentPageNumber);
    }
  }, [searchParams, processedProducts]);

  // Handler para cambiar línea de negocio
  const handleBusinessLineChange = useCallback(
    (newLine) => {
      const newSearchParams = new URLSearchParams(searchParams);

      // Cambiar la línea de negocio
      if (newLine === "DEFAULT") {
        newSearchParams.delete("line");
      } else {
        newSearchParams.set("line", newLine);
      }

      // Limpiar filtros cuando se cambia de línea
      newSearchParams.delete("cat");
      newSearchParams.delete("brands");
      newSearchParams.delete("price");
      newSearchParams.delete("page");

      setSearchParams(newSearchParams);
    },
    [searchParams, setSearchParams]
  );

  // --- Renderizado modularizado ---

  // Renderiza el catálogo de productos
  const renderCatalog = () => {
    // Corregir la visualización del número de productos
    const validProductCount = allProducts
      ? allProducts.filter((product) => product && product.id).length
      : 0;

    return (
      <PageContainer>
        <BreadCrumb>
          <BreadCrumbLink onClick={handleNavigate}>Inicio</BreadCrumbLink>
          {">"}
          <span>{empresaInfo.nombre}</span>
        </BreadCrumb>

        <PageHeader>
          <PageTitle>Catálogo de {empresaInfo.nombre}</PageTitle>
          {processedProducts && (
            <ProductsCount>
              {validProductCount} productos encontrados
            </ProductsCount>
          )}
        </PageHeader>

        <ContentLayout>
          <FilterSidebar
            allProducts={allProducts}
            lineaNegocio={currentLine}
            availableBusinessLines={availableBusinessLines}
            onBusinessLineChange={handleBusinessLineChange}
            selectedCategories={currentCategories}
            selectedBrands={currentBrands}
            selectedPriceRange={currentPriceRange}
            onApplyFilters={handleFilters}
            countFilteredProducts={processedProducts.totalItems}
          />
          <div style={{ flex: 1 }}>
            <SortContainer>
              <SearchBar
                value={currentSearch}
                onChange={handleSearch}
                placeholder="Buscar productos por nombre, descripción o código..."
                debounceTime={300}
                width="100%"
              />
              {/* Solo mostrar el selector de ordenación si hay productos */}
              {processedProducts && processedProducts.items.length > 0 && (
                <>
                  <Select
                    options={[
                      { value: "default", label: "Destacados" },
                      { value: "price_asc", label: "Menor precio" },
                      { value: "price_desc", label: "Mayor precio" },
                      { value: "name_asc", label: "Alfabético (A-Z)" },
                      { value: "rating", label: "Mejor valorados" },
                    ]}
                    value={currentSort}
                    onChange={handleSort}
                    preValue="Ordenar por:"
                    placeholder="Ordenar por..."
                  />

                  <Select
                    options={[
                      { value: 12, label: "12" },
                      { value: 36, label: "36" },
                      { value: 72, label: "72" },
                      { value: 144, label: "144" },
                    ]}
                    value={currentLimit}
                    onChange={handleItemsPerPageChange}
                    preValue="Mostrar: "
                    postValue=" items por página"
                    placeholder="Mostrar items"
                  />
                </>
              )}
            </SortContainer>

            <ProductsGrid id="productos-grid">
              {/* Condición de carga */}
              {isLoading || !processedProducts ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <RenderLoader
                    size="large"
                    text="Cargando productos..."
                    showText={true}
                    showDots={true}
                    showSpinner={false}
                  />
                </div>
              ) : processedProducts.items.length > 0 ? (
                processedProducts.items.map((product) => {
                  // Verificar que el producto es válido antes de renderizarlo
                  if (!product || !product.id) {
                    console.warn(
                      "[RENDERIZADO] Producto inválido encontrado:",
                      product
                    );
                    return null;
                  }

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      lineConfig={
                        PRODUCT_LINE_CONFIG[product.lineaNegocio] ||
                        PRODUCT_LINE_CONFIG.DEFAULT
                      }
                    />
                  );
                })
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    gridColumn: "1 / -1",
                  }}
                >
                  {currentSearch ? (
                    <>
                      <p>
                        No se encontraron productos que coincidan con "
                        <strong>{currentSearch}</strong>".
                      </p>
                      <p>Intenta con otros términos o elimina algunos filtros.</p>
                    </>
                  ) : (
                    <p>
                      No se encontraron productos que coincidan con los criterios
                      seleccionados.
                    </p>
                  )}
                </div>
              )}
            </ProductsGrid>

            {/* Paginación - solo mostrar si hay productos y no está cargando */}
            {processedProducts &&
              processedProducts.totalItems > 0 &&
              !isLoading && (
                <Pagination>
                  <PageButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    leftIconName={"FaChevronLeft"}
                    text={"Anterior"}
                    size="small"
                  />

                  {/* Mostrar números de página */}
                  {Array.from(
                    { length: processedProducts.totalPages },
                    (_, i) => i + 1
                  )
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === processedProducts.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <PageButton disabled text="..." />
                        )}
                        <PageButton
                          $active={currentPage === page}
                          onClick={() => handlePageChange(page)}
                          text={page}
                          size="small"
                        />
                      </React.Fragment>
                    ))}

                  <PageButton
                    size="small"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === processedProducts.totalPages}
                    rightIconName={"FaChevronRight"}
                    text={"Siguiente"}
                  />
                </Pagination>
              )}
          </div>
        </ContentLayout>
      </PageContainer>
    );
  };

  // Renderiza el formulario de solicitud de acceso
  const renderAccessRequestForm = () => (
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
            <Button
              type="button"
              variant="outlined"
              onClick={handleNavigate}
              text={"Regresar"}
            />
            <Button type="submit" text={"Enviar Solicitud"} />
          </ButtonGroup>
        </form>
      </FormContainer>
    </NoAccessContainer>
  );

  // Renderiza el mensaje de empresa no encontrada
  const renderCompanyNotFound = () => (
    <NoAccessContainer>
      <h2>Empresa no encontrada</h2>
      <p>La empresa que estás buscando no existe en nuestro sistema.</p>
      <Button onClick={handleNavigate} text={"Volver al inicio"} />
    </NoAccessContainer>
  );

  // Decide qué renderizar según el estado
  const renderMainContent = () => {
    if (isInitializing) {
      // Loader centralizado mientras se determina todo
      return (
        <NoAccessContainer>
          <RenderLoader
            size="large"
            text={initMessage}
            showText={true}
            showDots={true}
            showSpinner={false}
          />
        </NoAccessContainer>
      );
    }
    if (!empresaInfo) return renderCompanyNotFound();
    if (!hasAccess) return renderAccessRequestForm();
    return renderCatalog();
  };
  
  return renderMainContent();
};

export default Catalogo;
