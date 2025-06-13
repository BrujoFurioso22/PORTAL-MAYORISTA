import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import {
  FaTimes,
  FaFilter,
  FaTag,
  FaTrademark,
  FaIndustry,
} from "react-icons/fa"; // Añadir FaIndustry
import {
  PRODUCT_LINE_CONFIG,
  CATEGORY_TYPE_LABELS,
} from "../../constants/productLineConfig";
import Button from "./Button";

const SidebarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 300px;
`;

const SidebarContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  box-shadow: 0 2px 6px ${({ theme }) => theme.colors.shadow};
  padding: 20px;
  height: fit-content;
  margin-right: 20px;
  min-width: 250px;
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

const SectionSubTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1rem;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 24px;
`;

// Nuevo componente para la colección de chips
const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

// Nuevo componente para cada chip individual
const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${({ selected, disabled, theme }) =>
    selected
      ? theme.colors.primary
      : disabled
      ? theme.colors.backgroundDisabled
      : theme.colors.background};
  color: ${({ selected, disabled, theme }) =>
    selected
      ? theme.colors.white
      : disabled
      ? theme.colors.textDisabled
      : theme.colors.text};
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  border: 1px solid
    ${({ selected, disabled, theme }) =>
      selected
        ? theme.colors.primary
        : disabled
        ? theme.colors.backgroundDisabled
        : theme.colors.border};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:hover {
    background-color: ${({ selected, disabled, theme }) =>
      disabled
        ? theme.colors.backgroundDisabled
        : selected
        ? theme.colors.accent
        : theme.colors.backgroundHover};
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(-2px)")};
    box-shadow: ${({ disabled }) =>
      disabled ? "none" : "0 2px 4px rgba(0, 0, 0, 0.1)"};
  }
`;

const PriceRangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* gap: 12px; */
`;

const PriceInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PriceInput = styled.input`
  width: 80px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  text-align: center;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  // Eliminar las flechas del input type number
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const ClearFiltersButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 20px 0;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProductsCount = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  text-align: left;
  font-weight: 500;
  margin-bottom: 10px;
  /* padding: 8px; */
`;

const FilterSidebar = ({
  availableCategories = [],
  availableBrands = [],
  priceRange: defaultPriceRange = { min: 0, max: 100 },
  onApplyFilters,
  lineaNegocio = "DEFAULT",
  allProducts = [],
  // Nuevas props para recibir los filtros seleccionados desde el padre
  selectedCategories: initialSelectedCategories = [],
  selectedBrands: initialSelectedBrands = [],
  currentPriceRange: initialCurrentPriceRange = null,
  // Nueva prop para recibir las líneas disponibles en el catálogo
  availableBusinessLines = [],
  countFilteredProducts,
}) => {
  // console.log(availableCategories, availableBrands, defaultPriceRange);
  // Estado para la línea de negocio activa (si hay más de una disponible)
  const [activeBusinessLine, setActiveBusinessLine] = useState(lineaNegocio);

  // Estados para filtros, inicializados con los valores del padre
  const [selectedCategoriesLocal, setSelectedCategoriesLocal] = useState(
    initialSelectedCategories
  );
  const [selectedBrandsLocal, setSelectedBrandsLocal] = useState(
    initialSelectedBrands
  );
  const [currentPriceRangeLocal, setCurrentPriceRangeLocal] = useState(
    initialCurrentPriceRange || {
      min: 0,
      max: defaultPriceRange.max,
    }
  );

  // Estados para filtros disponibles
  const [availableCategoryFilters, setAvailableCategoryFilters] = useState([]);
  const [availableBrandFilters, setAvailableBrandFilters] = useState([]);

  // Refs para mantener referencias a los inputs
  const minInputRef = useRef(null);
  const maxInputRef = useRef(null);

  // AÑADIR: Ref para la función onApplyFilters
  const onApplyFiltersRef = useRef(onApplyFilters);

  // AÑADIR: Actualizar la ref cuando cambia la función
  useEffect(() => {
    onApplyFiltersRef.current = onApplyFilters;
  }, [onApplyFilters]);

  // Actualizar estado local cuando cambien los props
  useEffect(() => {
    setSelectedCategoriesLocal(initialSelectedCategories);
  }, [initialSelectedCategories]);

  useEffect(() => {
    setSelectedBrandsLocal(initialSelectedBrands);
  }, [initialSelectedBrands]);

  useEffect(() => {
    if (initialCurrentPriceRange) {
      setCurrentPriceRangeLocal(initialCurrentPriceRange);
    }
  }, [initialCurrentPriceRange]);

  // Este efecto calcula qué filtros estarían disponibles con los filtros actuales
  useEffect(() => {
    // Si no hay productos, no hay nada que hacer
    if (!allProducts || allProducts.length === 0) {
      return;
    }

    // Crear conjuntos para cada tipo de filtro disponible
    const availableCats = new Set();
    const availableBrands = new Set();

    // Para cada producto, verificar si cumple con los filtros actuales y la línea de negocio
    allProducts
      // Primero filtrar por línea de negocio si está activa
      .filter(
        (product) =>
          activeBusinessLine === "DEFAULT" ||
          (product && product.lineaNegocio === activeBusinessLine)
      )
      .forEach((product) => {
        if (!product) return;

        // Extraer información del producto
        const productCategories = product.categories || [];
        const productBrand = product.brand;
        const productPrice = product.price;

        // Verificar si el producto pasa el filtro de precio
        const passesPriceFilter =
          productPrice === 0 ||
          (productPrice >= currentPriceRangeLocal.min &&
            productPrice <= currentPriceRangeLocal.max);

        if (!passesPriceFilter) return; // Si no pasa el filtro de precio, ignorar el producto

        // 1. Si no hay categorías ni marcas seleccionadas, todos los filtros están disponibles
        if (
          selectedCategoriesLocal.length === 0 &&
          selectedBrandsLocal.length === 0
        ) {
          // Añadir todas las categorías y marcas del producto
          productCategories.forEach((cat) => availableCats.add(cat));
          if (productBrand) availableBrands.add(String(productBrand));
          return;
        }

        // 2. Si hay categorías seleccionadas pero no marcas
        if (
          selectedCategoriesLocal.length > 0 &&
          selectedBrandsLocal.length === 0
        ) {
          // Verificar si el producto cumple con las categorías seleccionadas
          const matchesAllSelectedCategories = selectedCategoriesLocal.every(
            (cat) => productCategories.includes(cat)
          );

          if (matchesAllSelectedCategories) {
            // Este producto pasa el filtro de categorías, añadir todas sus categorías y su marca
            productCategories.forEach((cat) => availableCats.add(cat));
            if (productBrand) availableBrands.add(String(productBrand));
          }
          return;
        }

        // 3. Si hay marcas seleccionadas pero no categorías
        if (
          selectedCategoriesLocal.length === 0 &&
          selectedBrandsLocal.length > 0
        ) {
          // Verificar si la marca del producto está entre las seleccionadas
          const brandMatches =
            productBrand && selectedBrandsLocal.includes(String(productBrand));

          if (brandMatches) {
            // Este producto pasa el filtro de marcas, añadir todas sus categorías y su marca
            productCategories.forEach((cat) => availableCats.add(cat));
            if (productBrand) availableBrands.add(String(productBrand));
          }
          return;
        }

        // 4. Si hay tanto categorías como marcas seleccionadas
        if (
          selectedCategoriesLocal.length > 0 &&
          selectedBrandsLocal.length > 0
        ) {
          // El producto debe cumplir con ambos filtros
          const matchesAllSelectedCategories = selectedCategoriesLocal.every(
            (cat) => productCategories.includes(cat)
          );
          const brandMatches =
            productBrand && selectedBrandsLocal.includes(String(productBrand));

          if (matchesAllSelectedCategories && brandMatches) {
            // Este producto pasa ambos filtros, añadir todas sus categorías y su marca
            productCategories.forEach((cat) => availableCats.add(cat));
            if (productBrand) availableBrands.add(String(productBrand));
          }
          return;
        }
      });

    // Actualizar estados con los filtros disponibles
    setAvailableCategoryFilters(Array.from(availableCats));
    setAvailableBrandFilters(Array.from(availableBrands));
  }, [
    allProducts,
    selectedCategoriesLocal,
    selectedBrandsLocal,
    currentPriceRangeLocal,
    activeBusinessLine,
  ]);

  // Aplicar filtros con debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      const filters = {
        categories: selectedCategoriesLocal,
        brands: selectedBrandsLocal,
        price: currentPriceRangeLocal,
        businessLine: activeBusinessLine,
      };

      // Usar la referencia estable
      onApplyFiltersRef.current(filters);
    }, 300); // 300ms de debounce

    return () => clearTimeout(handler);
  }, [
    selectedCategoriesLocal,
    selectedBrandsLocal,
    currentPriceRangeLocal,
    activeBusinessLine,
  ]);

  const handleCategoryChange = (category) => {
    setSelectedCategoriesLocal((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrandsLocal((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Nueva función mejorada para manejar cambios de precio
  const handlePriceChange = (type, rawValue) => {
    // Convertir a número y validar
    let value = parseInt(rawValue);

    // Si no es un número válido, usar 0 para min o max para max
    if (isNaN(value)) {
      value = type === "min" ? 0 : defaultPriceRange.max;
    }

    // Restricciones adicionales
    if (type === "min") {
      // El mínimo no puede ser negativo
      value = Math.max(0, value);
      // El mínimo no puede ser mayor que el máximo
      value = Math.min(value, currentPriceRangeLocal.max);
    } else {
      // El máximo no puede exceder el máximo permitido
      value = Math.min(value, defaultPriceRange.max);
      // El máximo no puede ser menor que el mínimo
      value = Math.max(value, currentPriceRangeLocal.min);
    }

    // Actualizar el estado inmediatamente para mejor respuesta del UI
    setCurrentPriceRangeLocal((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const clearFilters = () => {
    setSelectedCategoriesLocal([]);
    setSelectedBrandsLocal([]);
    setCurrentPriceRangeLocal({
      min: Math.max(0, defaultPriceRange.min),
      max: defaultPriceRange.max,
    });
  };

  // Reemplazar la función groupCategories por esta versión corregida
  const groupCategories = () => {
    // Si no hay categorías disponibles, regresamos un array vacío
    if (!availableCategories || availableCategories.length === 0) {
      return [];
    }

    // Obtener la configuración para la línea de negocio actual
    const lineConfig =
      PRODUCT_LINE_CONFIG[activeBusinessLine] || PRODUCT_LINE_CONFIG.DEFAULT;

    // Agrupar las categorías por su tipo
    const groupedCategories = {};

    availableCategories
      // Filtrar primero para mostrar solo las categorías relacionadas con la línea de negocio activa
      .filter((category) => {
        if (activeBusinessLine === "DEFAULT") return true;

        // Si la categoría tiene línea asignada, verificar que coincida
        if (category.businessLine) {
          return category.businessLine === activeBusinessLine;
        }

        // Comprobar si hay productos antes de usar .some()
        if (!allProducts || !Array.isArray(allProducts)) {
          return false; // Si no hay productos, no podemos verificar
        }

        // Si no tiene línea asignada, comprobar si pertenece a algún producto de esta línea
        return allProducts.some(
          (product) =>
            product && // Asegurar que product existe
            product.lineaNegocio === activeBusinessLine &&
            product.categories && // Asegurar que product.categories existe
            Array.isArray(product.categories) && // Asegurar que product.categories es un array
            product.categories.includes(category.name)
        );
      })
      .forEach((category) => {
        const type = category.type || "categoria";

        if (!groupedCategories[type]) {
          // Usar las etiquetas de la configuración o capitalizar la primera letra
          const label =
            lineConfig.categoryLabels[type] ||
            CATEGORY_TYPE_LABELS[type] ||
            type.charAt(0).toUpperCase() + type.slice(1);

          groupedCategories[type] = {
            label: label,
            items: [],
          };
        }

        // Verificar si la categoría está disponible según los filtros actuales
        const isAvailable =
          !availableCategoryFilters.length ||
          availableCategoryFilters.includes(category.name);

        // SIEMPRE agregar la categoría, pero marcarla como disponible o no
        groupedCategories[type].items.push({
          ...category,
          isAvailable: isAvailable,
        });
      });

    // Convertir objeto a array para el renderizado y usar el orden específico
    return Object.entries(groupedCategories)
      .filter(([_, group]) => group.items.length > 0)
      .sort(([typeA], [typeB]) => {
        // Usar el orden definido en la configuración
        const orderArray = lineConfig.categoryOrder || ["categoria"];
        const indexA = orderArray.indexOf(typeA);
        const indexB = orderArray.indexOf(typeB);

        // Si un tipo no está en la lista, ponerlo al final
        const orderA = indexA >= 0 ? indexA : 99;
        const orderB = indexB >= 0 ? indexB : 99;

        return orderA - orderB;
      });
  };

  // Grupos de categorías calculados
  const categoryGroups = groupCategories();

  // Efecto para actualizar la línea activa cuando cambia lineaNegocio prop
  useEffect(() => {
    setActiveBusinessLine(lineaNegocio);
  }, [lineaNegocio]);

  // Determinar automáticamente la línea de negocio según las marcas seleccionadas
  useEffect(() => {
    if (selectedBrandsLocal.length > 0 && allProducts) {
      // Buscar productos que tengan las marcas seleccionadas
      const matchingProducts = allProducts.filter(
        (product) => product && selectedBrandsLocal.includes(product.brand)
      );

      if (matchingProducts.length > 0) {
        // Contar las líneas de negocio de los productos con las marcas seleccionadas
        const lineCount = {};
        matchingProducts.forEach((product) => {
          if (product.lineaNegocio) {
            lineCount[product.lineaNegocio] =
              (lineCount[product.lineaNegocio] || 0) + 1;
          }
        });

        // Encontrar la línea predominante
        let maxCount = 0;
        let dominantLine = activeBusinessLine;

        Object.entries(lineCount).forEach(([line, count]) => {
          if (count > maxCount) {
            maxCount = count;
            dominantLine = line;
          }
        });

        // Actualizar la línea activa si cambia
        if (dominantLine !== activeBusinessLine) {
          setActiveBusinessLine(dominantLine);
        }
      }
    }
  }, [selectedBrandsLocal, allProducts, activeBusinessLine]);

  // Efecto para limpiar filtros cuando cambia la línea de negocio
  useEffect(() => {
    // Limpiar categorías seleccionadas al cambiar de línea
    if (activeBusinessLine !== lineaNegocio) {
      setSelectedCategoriesLocal([]);

      // Si hay marcas seleccionadas, mantener solo las que pertenecen a la nueva línea
      if (
        selectedBrandsLocal.length > 0 &&
        allProducts &&
        Array.isArray(allProducts) &&
        allProducts.length > 0
      ) {
        const brandsInNewLine = availableBrands
          .filter(
            (brand) =>
              // Si tiene línea específica
              (brand.businessLines &&
                brand.businessLines.includes(activeBusinessLine)) ||
              // O si hay productos de esta marca en esta línea
              allProducts.some(
                (product) =>
                  product.brand === brand.name &&
                  product.lineaNegocio === activeBusinessLine
              )
          )
          .map((brand) => brand.name);

        // Mantener solo marcas que pertenecen a la nueva línea
        const newSelectedBrands = selectedBrandsLocal.filter((brand) =>
          brandsInNewLine.includes(brand)
        );

        setSelectedBrandsLocal(newSelectedBrands);
      }

      // Aplicar los nuevos filtros
      setTimeout(() => {
        onApplyFiltersRef.current({
          categories: [],
          brands: selectedBrandsLocal,
          price: currentPriceRangeLocal,
          businessLine: activeBusinessLine,
        });
      }, 0);
    }
  }, [activeBusinessLine]);

  return (
    <SidebarWrapper>
      <SidebarContainer>
        {/* Mostrar el conteo de productos filtrados (nuevo) */}
        {allProducts && (
          <ProductsCount>
            {countFilteredProducts} productos disponibles
          </ProductsCount>
        )}
        {/* Botón para limpiar filtros sin cambios */}
        {(selectedCategoriesLocal.length > 0 ||
          selectedBrandsLocal.length > 0 ||
          currentPriceRangeLocal.min !== Math.max(0, defaultPriceRange.min) ||
          currentPriceRangeLocal.max !== defaultPriceRange.max) && (
          <ClearFiltersButton
            onClick={clearFilters}
            leftIconName={"FaTimes"}
            text={"Limpiar filtros"}
          />
        )}

        {/* Mostrar selector de línea de negocio si hay más de una disponible */}
        {availableBusinessLines.length > 1 && (
          <FilterGroup>
            <SectionSubTitle>
              <FaIndustry /> Línea de Negocio
            </SectionSubTitle>
            <ChipsContainer>
              {availableBusinessLines.map((line) => (
                <Chip
                  key={line}
                  selected={activeBusinessLine === line}
                  onClick={() => {
                    setActiveBusinessLine(line);
                    // Limpiar filtros de categoría al cambiar de línea
                    if (activeBusinessLine !== line) {
                      setSelectedCategoriesLocal([]);
                      // Aplicar filtros con la nueva línea
                      setTimeout(() => {
                        onApplyFiltersRef.current({
                          categories: [],
                          brands: selectedBrandsLocal,
                          price: currentPriceRangeLocal,
                          businessLine: line,
                        });
                      }, 0);
                    }
                  }}
                >
                  {line}
                </Chip>
              ))}
            </ChipsContainer>
          </FilterGroup>
        )}

        {/* Mostrar categorías agrupadas */}
        {categoryGroups.length > 0 &&
          categoryGroups.map(([groupKey, group]) => (
            <FilterGroup key={groupKey}>
              <SectionSubTitle>
                <FaTag /> {group.label}
              </SectionSubTitle>
              <ChipsContainer>
                {group.items.map((category) => {
                  // Comprobar si la categoría está disponible con los filtros actuales
                  const isAvailable =
                    !availableCategoryFilters.length ||
                    availableCategoryFilters.includes(category.name);

                  // La categoría estará deshabilitada si no está disponible Y no está seleccionada
                  const isDisabled =
                    !isAvailable &&
                    !selectedCategoriesLocal.includes(category.name);

                  return (
                    <Chip
                      key={category.id}
                      selected={selectedCategoriesLocal.includes(category.name)}
                      disabled={isDisabled}
                      onClick={() =>
                        !isDisabled && handleCategoryChange(category.name)
                      }
                    >
                      {category.displayName}
                    </Chip>
                  );
                })}
              </ChipsContainer>
            </FilterGroup>
          ))}

        {/* Mostrar marcas y precio sin cambios */}
        {availableBrands.length > 0 && (
          <FilterGroup>
            <SectionSubTitle>
              <FaTrademark /> Marcas
            </SectionSubTitle>
            <ChipsContainer>
              {availableBrands
                // Filtrar marcas por línea de negocio activa si está definida
                .filter((brand) => {
                  if (activeBusinessLine === "DEFAULT") return true;

                  // Si la marca tiene líneas de negocio específicas
                  if (brand.businessLines && brand.businessLines.length > 0) {
                    return brand.businessLines.includes(activeBusinessLine);
                  }

                  // Si no tiene línea específica, ver si hay productos de esta marca en esta línea
                  return allProducts.some(
                    (product) =>
                      product.brand === brand.name &&
                      product.lineaNegocio === activeBusinessLine
                  );
                })
                .map((brand) => {
                  // Asegurarse de que brand.name es un string
                  const brandName = String(brand.name);

                  // Verificar disponibilidad
                  const isAvailable =
                    !availableBrandFilters.length ||
                    availableBrandFilters.includes(brandName);

                  const isDisabled =
                    !isAvailable && !selectedBrandsLocal.includes(brandName);

                  return (
                    <Chip
                      key={brand.id || brandName}
                      selected={selectedBrandsLocal.includes(brandName)}
                      disabled={isDisabled}
                      onClick={() =>
                        !isDisabled && handleBrandChange(brandName)
                      }
                    >
                      {brandName}
                    </Chip>
                  );
                })}
            </ChipsContainer>
          </FilterGroup>
        )}

        {/* Sección de precio sin cambios */}
        <FilterGroup>
          <SectionSubTitle>
            <span>$</span> Rango de precio
          </SectionSubTitle>
          <PriceRangeContainer>
            <PriceInputGroup>
              <span>$</span>
              <PriceInput
                ref={minInputRef}
                type="number"
                min={0}
                max={defaultPriceRange.max}
                value={currentPriceRangeLocal.min}
                onChange={(e) => handlePriceChange("min", e.target.value)}
                onBlur={() => {
                  if (currentPriceRangeLocal.min > currentPriceRangeLocal.max) {
                    setCurrentPriceRangeLocal((prev) => ({
                      ...prev,
                      min: prev.max,
                    }));
                  }
                }}
                placeholder="Min"
              />
              <span style={{ margin: "0 8px" }}>hasta</span>
              <PriceInput
                ref={maxInputRef}
                type="number"
                min={0}
                max={defaultPriceRange.max}
                value={currentPriceRangeLocal.max}
                onChange={(e) => handlePriceChange("max", e.target.value)}
                onBlur={() => {
                  if (currentPriceRangeLocal.max < currentPriceRangeLocal.min) {
                    setCurrentPriceRangeLocal((prev) => ({
                      ...prev,
                      max: prev.min,
                    }));
                  }
                }}
                placeholder="Max"
              />
            </PriceInputGroup>
          </PriceRangeContainer>
        </FilterGroup>
      </SidebarContainer>
    </SidebarWrapper>
  );
};

export default React.memo(FilterSidebar);
