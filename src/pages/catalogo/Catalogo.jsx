import React, { useState, useEffect, use, useCallback, useRef } from "react";
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
import RenderLoader from "../../components/ui/RenderLoader"; // Importar RenderLoader
import { FaSearch } from "react-icons/fa"; // Importar ícono de búsqueda
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

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

// Luego, agregamos estos estilos para el campo de búsqueda
const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;

  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textLight};
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
      PRODUCT_LINE_CONFIG[item.DMA_LINEANEGOCIO] || PRODUCT_LINE_CONFIG.DEFAULT;

    // Construir categorías con prefijos para identificar el tipo
    const categories = [];
    const categoriesByType = {}; // Nuevo objeto para separar por tipo

    lineConfig.categories.forEach((cat) => {
      if (item[cat.field]) {
        // Obtener el nombre del campo sin el prefijo DMA_
        const fieldType = cat.field.replace("DMA_", "").toLowerCase();

        // Crear la categoría con prefijo para poder filtrarla después
        const categoryValue = `${fieldType}_${item[cat.field]
          .toLowerCase()
          .replace(/ /g, "_")}`;

        if (categoryValue) {
          // Añadir al array plano para compatibilidad
          categories.push(categoryValue);

          // Añadir al objeto separado por tipo
          if (!categoriesByType[fieldType]) {
            categoriesByType[fieldType] = [];
          }
          categoriesByType[fieldType].push(categoryValue);
        }
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

    // Crear objeto de producto adaptado al formato esperado usando la plantilla correspondiente
    return {
      id: item.DMA_CODIGO,
      name: name,
      description: description,
      price: price,
      discount: 0,
      image: imageUrl,
      categories: categories, // Mantenemos el array plano para compatibilidad
      categoriesByType: categoriesByType, // Nuevo objeto organizado por tipo
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

  // Hook del caché
  const { isCacheValid, getCachedProducts, cacheProducts } = useProductCache();

  // Inicializar filteredProducts como null para indicar que los datos están en carga
  const [filteredProducts, setFilteredProducts] = useState(null);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [hasAccess, setHasAccess] = useState(false);
  const [lineaNegocio, setLineaNegocio] = useState("DEFAULT");
  const [allProducts, setAllProducts] = useState(null);

  // Nuevo estado para controlar si está cargando
  const [isLoading, setIsLoading] = useState(true);

  // Primero agregamos un nuevo estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPriceRange, setCurrentPriceRange] = useState({
    min: 0,
    max: 100,
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [availableBusinessLines, setAvailableBusinessLines] = useState([
    "DEFAULT",
  ]);

  const searchTimeoutRef = useRef(null);

  // Obtener información de la empresa
  const empresaInfo = empresas.find(
    (empresa) => empresa.nombre === empresaName
  );

  const handleNavigate = () => {
    navigateToHomeByRole();
  };

  const handleSearch = (value) => {
    setSearchTerm(value);

    // Cancelar el timeout anterior si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Crear un nuevo timeout para aplicar la búsqueda después de un breve retraso
    searchTimeoutRef.current = setTimeout(() => {
      if (!allProducts) return;

      // Si el campo de búsqueda está vacío, aplicar solo los filtros actuales
      if (!value.trim()) {
        // Llamar directamente a applyFilters con los filtros actuales
        const currentFilters = {
          categories: selectedCategories || [], // Necesitarás añadir estos estados
          brands: selectedBrands || [], // si no los tienes ya
          price: currentPriceRange,
        };
        applyFilters(allProducts, currentFilters);
        return;
      }

      // Filtrar productos por término de búsqueda directamente desde allProducts
      const searchValue = value.toLowerCase().trim();
      const searchResults = allProducts.filter((product) => {
        // Solo incluir productos válidos
        if (!product || !product.id) return false;

        return (
          (product.name && product.name.toLowerCase().includes(searchValue)) ||
          (product.description &&
            product.description.toLowerCase().includes(searchValue)) ||
          (product.id && product.id.toString().includes(searchValue)) ||
          (product.codigoBarras &&
            product.codigoBarras.toLowerCase().includes(searchValue))
        );
      });

      // Aplicar otros filtros sobre los resultados de búsqueda
      const currentFilters = {
        categories: selectedCategories || [],
        brands: selectedBrands || [],
        price: currentPriceRange,
      };

      applyFilters(searchResults, currentFilters);
    }, 300); // 300ms de debounce
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

  useEffect(() => {
    setCurrentPriceRange(priceRange);
  }, [priceRange]);

  // Función para obtener productos desde la API
  const fetchProductsFromAPI = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simular retardo de 1 segundo

      const respProductos = await products_getProductByField({
        field: "empresa",
        value: empresaName,
      });
      console.log(respProductos);

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
        cacheProducts(empresaName, mappedProducts);

        // Guardar todos los productos originales
        setAllProducts(mappedProducts);

        // Actualizar estados locales
        setFilteredProducts(mappedProducts);
        extractCategoriesAndBrands(mappedProducts);
      } else {
        console.error("Error al cargar productos:", respProductos.message);
        toast.error("No se pudieron cargar los productos");
        // En caso de error, establecer una lista vacía para evitar loader infinito
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Error en fetchProducts:", error);
      toast.error("Error al obtener los productos");
      // En caso de error, establecer una lista vacía para evitar loader infinito
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para extraer categorías y marcas de los productos
  const extractCategoriesAndBrands = (products) => {
    // Crear categorías por tipo
    const categoriesByType = {};
    // Crear objeto para almacenar marcas por línea de negocio
    const brandsByBusinessLine = {};

    // Recorrer todos los productos
    products.forEach((product) => {
      // Procesar categorías
      if (product.categoriesByType) {
        Object.entries(product.categoriesByType).forEach(
          ([type, typeCategories]) => {
            if (!categoriesByType[type]) {
              categoriesByType[type] = new Set();
            }

            typeCategories.forEach((cat) => categoriesByType[type].add(cat));
          }
        );
      }

      // Procesar marcas y asociarlas con líneas de negocio
      if (product.brand) {
        const line = product.lineaNegocio || "DEFAULT";

        if (!brandsByBusinessLine[line]) {
          brandsByBusinessLine[line] = new Set();
        }

        brandsByBusinessLine[line].add(product.brand);
      }
    });

    // Preparar categorías formateadas como antes
    const formattedCategories = [];
    Object.entries(categoriesByType).forEach(([type, categorySet]) => {
      Array.from(categorySet).forEach((categoryName) => {
        const displayName = categoryName
          .replace(`${type}_`, "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        formattedCategories.push({
          id: categoryName,
          name: categoryName,
          type: type,
          displayName: displayName,
        });
      });
    });

    setAvailableCategories(formattedCategories);

    // Extraer todas las marcas únicas
    const allBrandNames = [];
    Object.values(brandsByBusinessLine).forEach((brandSet) => {
      brandSet.forEach((brand) => {
        if (!allBrandNames.includes(brand)) {
          allBrandNames.push(brand);
        }
      });
    });

    // Crear objetos de marca con metadatos de línea de negocio
    const empresaBrands = allBrandNames.map((brandName) => {
      // Determinar a qué líneas de negocio pertenece esta marca
      const lines = Object.entries(brandsByBusinessLine)
        .filter(([_, brands]) => brands.has(brandName))
        .map(([line]) => line);

      return {
        id: brandName,
        name: brandName,
        businessLines: lines,
        // Si la marca pertenece a una sola línea, la asignamos directamente
        primaryBusinessLine: lines.length === 1 ? lines[0] : null,
      };
    });

    setAvailableBrands(empresaBrands);

    // Calcular rango de precios - esto se mantiene igual
    if (products.length > 0) {
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
    // Limpiar cualquier búsqueda pendiente al cambiar de empresa
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Si venimos del detalle de un producto, no reiniciar el término de búsqueda ni los filtros
    // Solo identificamos esto si hay filtros guardados para esta empresa
    const hasSavedFilters =
      sessionStorage.getItem(`filters_${empresaName}`) !== null;

    if (!hasSavedFilters) {
      // Solo reiniciar filtros si no venimos del detalle de un producto
      setSearchTerm("");
      setSelectedCategories([]);
      setSelectedBrands([]);
      setCurrentPriceRange({ min: 0, max: priceRange.max });
    }

    setFilteredProducts(null);
    setIsLoading(true);

    // Determinar si el usuario tiene acceso
    const userHasAccess = user?.EMPRESAS?.includes(empresaName) || false;
    setHasAccess(userHasAccess);

    if (userHasAccess) {
      // Verificar si hay datos en caché y si son válidos
      if (isCacheValid(empresaName)) {
        // console.log("Usando productos en caché para:", empresaName);
        const cachedProducts = getCachedProducts(empresaName);

        // IMPORTANTE: Primero actualizar allProducts para que esté disponible
        setAllProducts(cachedProducts);

        // Luego extraer categorías y marcas
        extractCategoriesAndBrands(cachedProducts);

        // Si no venimos del detalle, actualizar productos filtrados
        if (!hasSavedFilters) {
          setFilteredProducts(cachedProducts);
        }

        setIsLoading(false); // Finalizar carga cuando usamos caché
      } else {
        fetchProductsFromAPI();
      }
    } else {
      setIsLoading(false);
    }
  }, [empresaName, user]);

  // Dentro del handleFilters, reemplaza el filtro comentado por la implementación real:
  const handleFilters = useCallback(
    (filters) => {
      if (!hasAccess || !allProducts) return;

      // Actualizar estados locales de filtros seleccionados
      setSelectedCategories(filters.categories || []);
      setSelectedBrands(filters.brands || []);
      setCurrentPriceRange(filters.price || currentPriceRange);

      // Actualizar línea de negocio si viene en los filtros
      if (filters.businessLine && filters.businessLine !== lineaNegocio) {
        setLineaNegocio(filters.businessLine);
        // console.log("[DEBUG] Cambiando línea de negocio a:", filters.businessLine);
      }

      // Usar siempre allProducts como base para aplicar filtros
      let productsToFilter = [...allProducts];

      // Si hay término de búsqueda, filtrar primero por búsqueda
      if (searchTerm.trim()) {
        const searchValue = searchTerm.toLowerCase().trim();
        productsToFilter = productsToFilter.filter((product) => {
          if (!product || !product.id) return false;

          return (
            (product.name &&
              product.name.toLowerCase().includes(searchValue)) ||
            (product.description &&
              product.description.toLowerCase().includes(searchValue)) ||
            (product.id && product.id.toString().includes(searchValue)) ||
            (product.codigoBarras &&
              product.codigoBarras.toLowerCase().includes(searchValue))
          );
        });
      }

      // Si tenemos productos, aplicar los filtros directamente
      applyFilters(productsToFilter, filters);
    },
    [hasAccess, allProducts, searchTerm, lineaNegocio, currentPriceRange]
  );

  // Función para aplicar filtros (extraída para reutilizar)
  const applyFilters = (products, filters) => {
    let result = [...products];

    // Filtrar por línea de negocio explícitamente
    if (filters.businessLine && filters.businessLine !== "DEFAULT") {
      result = result.filter(
        (product) => product.lineaNegocio === filters.businessLine
      );
    }

    // Filtrar por categorías usando AND
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter((product) => {
        // Un producto debe tener TODAS las categorías seleccionadas (AND)
        return filters.categories.every((category) =>
          product.categories?.includes(category)
        );
      });
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
          product.price === 0 || // Considerar productos con precio cero como válidos siempre
          (product.price >= filters.price.min &&
            product.price <= filters.price.max)
      );
    }

    // NO filtrar por término de búsqueda aquí para evitar el filtrado doble
    // Esto ya se hace en handleSearch

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
    if (filteredProducts === null) return; // Evitar cálculos si aún no hay productos
    setTotalPages(Math.ceil(filteredProducts.length / productsPerPage));
    // Reset a la primera página cuando cambian los filtros
    setCurrentPage(1);
  }, [filteredProducts, productsPerPage]);

  // Calcular productos actuales para paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts
    ? filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
    : [];

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

  // 1. Añade esta función para guardar los filtros en sessionStorage
  const saveFiltersToSession = useCallback(() => {
    const currentFilters = {
      categories: selectedCategories,
      brands: selectedBrands,
      priceRange: currentPriceRange,
      businessLine: lineaNegocio,
      searchTerm: searchTerm,
      sortOption: sortOption,
      productsPerPage: productsPerPage,
      currentPage: currentPage,
    };

    try {
      sessionStorage.setItem(
        `filters_${empresaName}`,
        JSON.stringify(currentFilters)
      );
    } catch (error) {
      console.error("[FILTROS] Error al guardar filtros:", error);
    }
  }, [
    selectedCategories,
    selectedBrands,
    currentPriceRange,
    lineaNegocio,
    searchTerm,
    sortOption,
    productsPerPage,
    currentPage,
    empresaName,
  ]);

  // 2. Añade un efecto para guardar filtros cuando estos cambien
  useEffect(() => {
    // Solo guardar si ya tenemos productos cargados (no en la carga inicial)
    if (filteredProducts !== null) {
      saveFiltersToSession();
    }
  }, [
    selectedCategories,
    selectedBrands,
    currentPriceRange,
    lineaNegocio,
    searchTerm,
    sortOption,
    productsPerPage,
    currentPage,
    saveFiltersToSession,
  ]);

  // 3. Añade este efecto para restaurar filtros cuando se carguen los productos
  useEffect(() => {
    // Solo intentar restaurar después de cargar productos y si hay productos disponibles
    if (!isLoading && allProducts && allProducts.length > 0) {
      try {
        const savedFilters = sessionStorage.getItem(`filters_${empresaName}`);

        if (savedFilters) {
          const filters = JSON.parse(savedFilters);

          // Restaurar todos los filtros
          setSelectedCategories(filters.categories || []);
          setSelectedBrands(filters.brands || []);
          setCurrentPriceRange(filters.priceRange || priceRange);

          if (filters.businessLine) {
            setLineaNegocio(filters.businessLine);
          }

          if (filters.searchTerm) {
            setSearchTerm(filters.searchTerm);
          }

          if (filters.sortOption) {
            setSortOption(filters.sortOption);
          }

          if (filters.productsPerPage) {
            setProductsPerPage(filters.productsPerPage);
          }

          if (filters.currentPage) {
            setCurrentPage(filters.currentPage);
          }

          // Aplicar los filtros a los productos
          const currentFilters = {
            categories: filters.categories || [],
            brands: filters.brands || [],
            price: filters.priceRange || priceRange,
            businessLine: filters.businessLine,
          };

          // Aplicar filtros después de que los estados se hayan actualizado
          setTimeout(() => {
            // Primero aplicar la búsqueda si hay término
            if (filters.searchTerm) {
              const searchValue = filters.searchTerm.toLowerCase().trim();
              const searchResults = allProducts.filter((product) => {
                if (!product || !product.id) return false;

                return (
                  (product.name &&
                    product.name.toLowerCase().includes(searchValue)) ||
                  (product.description &&
                    product.description.toLowerCase().includes(searchValue)) ||
                  (product.id && product.id.toString().includes(searchValue)) ||
                  (product.codigoBarras &&
                    product.codigoBarras.toLowerCase().includes(searchValue))
                );
              });

              applyFilters(searchResults, currentFilters);
            } else {
              // Si no hay búsqueda, aplicar solo los filtros
              applyFilters(allProducts, currentFilters);
            }

            // Aplicar ordenamiento después de filtrar
            if (filters.sortOption && filters.sortOption !== "default") {
              setTimeout(() => {
                let sorted = [...filteredProducts];

                switch (filters.sortOption) {
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
                }

                setFilteredProducts(sorted);
              }, 100);
            }
          }, 100);
        }
      } catch (error) {
        console.error("[FILTROS] Error al restaurar filtros:", error);
      }
    }
  }, [allProducts, isLoading, empresaName]);

  // Si la empresa no existe, mostrar mensaje
  if (!empresaInfo) {
    return (
      <NoAccessContainer>
        <h2>Empresa no encontrada</h2>
        <p>La empresa que estás buscando no existe en nuestro sistema.</p>
        <Button onClick={handleNavigate} text={"Volver al inicio"} />
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
  }

  // Corregir la visualización del número de productos
  // En vez de mostrar allProducts.length, mostremos el número real de productos válidos
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
        {filteredProducts && (
          <ProductsCount>
            {validProductCount} productos encontrados
          </ProductsCount>
        )}
      </PageHeader>

      <ContentLayout>
        <FilterSidebar
          availableCategories={availableCategories}
          availableBrands={availableBrands}
          priceRange={priceRange}
          onApplyFilters={handleFilters}
          lineaNegocio={lineaNegocio}
          allProducts={allProducts}
          selectedCategories={selectedCategories}
          selectedBrands={selectedBrands}
          currentPriceRange={currentPriceRange}
          availableBusinessLines={availableBusinessLines}
          countFilteredProducts={filteredProducts ? filteredProducts.length : 0}
        />

        <div style={{ flex: 1 }}>
          <SortContainer>
            <SearchInputWrapper>
              <FaSearch />
              <SearchInput
                type="text"
                placeholder="Buscar productos por nombre, descripción o código..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
            </SearchInputWrapper>
            {/* Solo mostrar el selector de ordenación si hay productos */}
            {filteredProducts && filteredProducts.length > 0 && (
              <>
                <Select
                  options={[
                    { value: "default", label: "Destacados" },
                    { value: "price_asc", label: "Menor precio" },
                    { value: "price_desc", label: "Mayor precio" },
                    { value: "name_asc", label: "Alfabético (A-Z)" },
                    { value: "rating", label: "Mejor valorados" },
                  ]}
                  value={sortOption}
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
                  value={productsPerPage}
                  onChange={(e) => setProductsPerPage(Number(e.target.value))}
                  preValue="Mostrar: "
                  postValue=" items por página"
                  placeholder="Mostrar items"
                />
              </>
            )}
          </SortContainer>

          <ProductsGrid id="productos-grid">
            {/* Condición de carga */}
            {isLoading || filteredProducts === null ? (
              <div style={{ gridColumn: "1 / -1" }}>
                <RenderLoader
                  size="large"
                  text="Cargando productos..."
                  showText={true}
                  showDots={true}
                  showSpinner={false}
                />
              </div>
            ) : filteredProducts.length > 0 ? (
              currentProducts.map((product) => {
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
                {searchTerm ? (
                  <>
                    <p>
                      No se encontraron productos que coincidan con "
                      <strong>{searchTerm}</strong>".
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
          {filteredProducts && filteredProducts.length > 0 && !isLoading && (
            <Pagination>
              <PageButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                leftIconName={"FaChevronLeft"}
                text={"Anterior"}
                size="small"
              />

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
                disabled={currentPage === totalPages}
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

export default Catalogo;
