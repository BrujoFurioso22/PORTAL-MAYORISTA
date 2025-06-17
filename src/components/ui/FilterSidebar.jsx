import React, { useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import {
  FaTimes,
  FaFilter,
  FaTag,
  FaTrademark,
  FaIndustry,
} from "react-icons/fa";
import Button from "./Button";
import { CATEGORY_TYPE_LABELS } from "../../constants/productLineConfig";

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

const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

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
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
`;

const ProductsCount = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  text-align: left;
  font-weight: 500;
  margin-bottom: 10px;
`;

const BusinessLineSelector = styled.div`
  margin-bottom: 20px;
`;

const BusinessLineButton = styled.button`
  background: ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.background};
  color: ${({ active, theme }) => 
    active ? theme.colors.white : theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 16px;
  margin: 0 4px 8px 0;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active, theme }) => 
      active ? theme.colors.accent : theme.colors.backgroundHover};
  }
`;

// Componente simplificado
const FilterSidebar = React.memo(({
  // Props esenciales
  allProducts = [],
  lineaNegocio = "DEFAULT",
  availableBusinessLines = [],
  onBusinessLineChange,
  // Filtros seleccionados actuales
  selectedCategories = [],
  selectedBrands = [],
  selectedPriceRange = null,
  // Callbacks
  onApplyFilters,
  countFilteredProducts = 0,
}) => {
  // Calcular rango de precios disponible desde los productos
  const availablePriceRange = useMemo(() => {
    if (!allProducts || allProducts.length === 0) {
      return { min: 0, max: 100 };
    }
    
    const relevantProducts = allProducts.filter(product => 
      lineaNegocio === "DEFAULT" || product.lineaNegocio === lineaNegocio
    );
    
    const prices = relevantProducts
      .map(p => p.price)
      .filter(p => p > 0);
    
    if (prices.length === 0) return { min: 0, max: 100 };
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [allProducts, lineaNegocio]);

  // Estados locales simplificados
  const [localCategories, setLocalCategories] = useState(selectedCategories);
  const [localBrands, setLocalBrands] = useState(selectedBrands);
  const [localPriceRange, setLocalPriceRange] = useState(
    selectedPriceRange || { min: 0, max: availablePriceRange.max }
  );  // Extraer categorías agrupadas por tipo desde filtersByType
  const categoriesGroupedByType = useMemo(() => {
    if (!allProducts || allProducts.length === 0) {
      return {};
    }
    
    // Filtrar productos por línea de negocio
    const relevantProducts = allProducts.filter(product => 
      lineaNegocio === "DEFAULT" || product.lineaNegocio === lineaNegocio
    );

    const groupedFilters = {};
    
    relevantProducts.forEach(product => {
      if (!product || !product.filtersByType) return;
      
      // Iterar por cada tipo de filtro en filtersByType
      Object.entries(product.filtersByType).forEach(([filterType, filterValues]) => {
        if (!groupedFilters[filterType]) {
          groupedFilters[filterType] = new Set();
        }
        
        // Agregar todos los valores de este tipo
        if (Array.isArray(filterValues)) {
          filterValues.forEach(value => {
            groupedFilters[filterType].add(value);
          });
        }
      });
    });
    
    // Convertir Sets a arrays ordenados
    const result = {};
    Object.entries(groupedFilters).forEach(([type, valuesSet]) => {
      result[type] = Array.from(valuesSet).sort();
    });
    
    return result;
  }, [allProducts, lineaNegocio]);

  // Extraer marcas (definir antes de availableFiltersWithStatus)
  const availableBrands = useMemo(() => {
    if (!allProducts || allProducts.length === 0) {
      return [];
    }
    
    // Filtrar productos por línea de negocio
    const relevantProducts = allProducts.filter(product => 
      lineaNegocio === "DEFAULT" || product.lineaNegocio === lineaNegocio
    );

    const brandsSet = new Set();
    
    relevantProducts.forEach(product => {
      if (product && product.brand) {
        brandsSet.add(String(product.brand));
      }
    });
    
    return Array.from(brandsSet).sort();
  }, [allProducts, lineaNegocio]);

  // Calcular qué filtros están disponibles basado en los filtros actuales (lógica AND)
  const availableFiltersWithStatus = useMemo(() => {
    if (!allProducts || allProducts.length === 0) {
      return { categories: {}, brands: [] };
    }

    // Filtrar productos por línea de negocio
    const relevantProducts = allProducts.filter(product => 
      lineaNegocio === "DEFAULT" || product.lineaNegocio === lineaNegocio
    );

    // Aplicar filtros actuales para ver qué productos quedan disponibles
    const availableProducts = relevantProducts.filter(product => {
      // Filtro de categorías: verificar que el producto tenga TODAS las categorías seleccionadas
      if (localCategories.length > 0) {
        const hasAllCategories = localCategories.every(selectedCategory => {
          if (!product.filtersByType) return false;
          
          // Buscar la categoría en cualquier tipo de filtro
          return Object.values(product.filtersByType).some(filterArray => 
            Array.isArray(filterArray) && filterArray.includes(selectedCategory)
          );
        });
        
        if (!hasAllCategories) return false;
      }

      // Filtro de marcas: verificar que el producto tenga alguna de las marcas seleccionadas
      if (localBrands.length > 0) {
        if (!localBrands.includes(product.brand)) return false;
      }

      // Filtro de precio
      if (localPriceRange.min > 0 || localPriceRange.max < availablePriceRange.max) {
        if (product.price < localPriceRange.min || product.price > localPriceRange.max) {
          return false;
        }
      }

      return true;
    });

    // Extraer categorías disponibles con productos que pasan los filtros actuales
    const availableCategories = {};
    Object.keys(categoriesGroupedByType).forEach(filterType => {
      availableCategories[filterType] = new Set();
    });

    const availableBrandsSet = new Set();

    availableProducts.forEach(product => {
      // Agregar categorías disponibles
      if (product.filtersByType) {
        Object.entries(product.filtersByType).forEach(([filterType, filterValues]) => {
          if (Array.isArray(filterValues)) {
            filterValues.forEach(value => {
              if (availableCategories[filterType]) {
                availableCategories[filterType].add(value);
              }
            });
          }
        });
      }

      // Agregar marcas disponibles
      if (product.brand) {
        availableBrandsSet.add(product.brand);
      }
    });

    // Convertir a formato final
    const categoriesWithStatus = {};
    Object.entries(categoriesGroupedByType).forEach(([filterType, allValues]) => {
      categoriesWithStatus[filterType] = allValues.map(value => ({
        value,
        disabled: !availableCategories[filterType].has(value) && !localCategories.includes(value)
      }));
    });

    const brandsWithStatus = availableBrands.map(brand => ({
      value: brand,
      disabled: !availableBrandsSet.has(brand) && !localBrands.includes(brand)
    }));

    return {
      categories: categoriesWithStatus,
      brands: brandsWithStatus
    };
  }, [allProducts, lineaNegocio, localCategories, localBrands, localPriceRange, availablePriceRange, categoriesGroupedByType, availableBrands]);

  // Función debounced para aplicar filtros
  const debouncedApplyFilters = useMemo(() => {
    let timeoutId;
    return (filters) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onApplyFilters(filters);
      }, 300);
    };
  }, [onApplyFilters]);

  // Handlers con toggle
  const handleCategoryChange = useCallback((category) => {
    setLocalCategories(prev => {
      // Toggle: si ya está seleccionado, quitarlo; si no, agregarlo
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      // Aplicar filtros después del cambio
      setTimeout(() => {
        const filters = {
          categories: newCategories,
          brands: localBrands,
          price: localPriceRange,
          businessLine: lineaNegocio,
        };
        debouncedApplyFilters(filters);
      }, 0);
      
      return newCategories;
    });
  }, [localBrands, localPriceRange, lineaNegocio, debouncedApplyFilters]);

  const handleBrandChange = useCallback((brand) => {
    setLocalBrands(prev => {
      // Toggle: si ya está seleccionado, quitarlo; si no, agregarlo
      const newBrands = prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand];
      
      // Aplicar filtros después del cambio
      setTimeout(() => {
        const filters = {
          categories: localCategories,
          brands: newBrands,
          price: localPriceRange,
          businessLine: lineaNegocio,
        };
        debouncedApplyFilters(filters);
      }, 0);
      
      return newBrands;
    });
  }, [localCategories, localPriceRange, lineaNegocio, debouncedApplyFilters]);

  const handlePriceChange = useCallback((type, value) => {
    const numValue = parseInt(value) || 0;
    setLocalPriceRange(prev => {
      const newRange = {
        ...prev,
        [type]: Math.max(0, Math.min(numValue, availablePriceRange.max))
      };
      
      // Aplicar filtros después del cambio
      setTimeout(() => {
        const filters = {
          categories: localCategories,
          brands: localBrands,
          price: newRange,
          businessLine: lineaNegocio,
        };
        debouncedApplyFilters(filters);
      }, 0);
      
      return newRange;
    });
  }, [localCategories, localBrands, lineaNegocio, availablePriceRange.max, debouncedApplyFilters]);

  const clearAllFilters = useCallback(() => {
    setLocalCategories([]);
    setLocalBrands([]);
    setLocalPriceRange({ min: 0, max: availablePriceRange.max });
    
    const filters = {
      categories: [],
      brands: [],
      price: { min: 0, max: availablePriceRange.max },
      businessLine: lineaNegocio,
    };
    debouncedApplyFilters(filters);
  }, [lineaNegocio, availablePriceRange.max, debouncedApplyFilters]);

  return (
    <SidebarWrapper>
      <SidebarContainer>
        <SectionTitle>
          <FaFilter />
          Filtros
        </SectionTitle>

        {countFilteredProducts > 0 && (
          <ProductsCount>
            {countFilteredProducts} productos encontrados
          </ProductsCount>
        )}

        {/* Selector de líneas de negocio si hay más de una */}
        {availableBusinessLines.length > 1 && (
          <BusinessLineSelector>
            <SectionSubTitle>
              <FaIndustry />
              Línea de Negocio
            </SectionSubTitle>
            {availableBusinessLines.map((line) => (
              <BusinessLineButton
                key={line}
                active={lineaNegocio === line}
                onClick={() => onBusinessLineChange && onBusinessLineChange(line)}
              >
                {line}
              </BusinessLineButton>
            ))}
          </BusinessLineSelector>
        )}        {/* Filtros agrupados por tipo con estado dinámico */}
        {Object.keys(availableFiltersWithStatus.categories).length > 0 && 
          Object.entries(availableFiltersWithStatus.categories).map(([filterType, filterItems]) => (
            <FilterGroup key={filterType}>
              <SectionSubTitle>
                <FaTag />
                {CATEGORY_TYPE_LABELS[filterType] || filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </SectionSubTitle>
              <ChipsContainer>
                {filterItems.map((filterItem, index) => (
                  <Chip
                    key={`${filterType}-${filterItem.value}-${index}`}
                    selected={localCategories.includes(filterItem.value)}
                    disabled={filterItem.disabled}
                    onClick={() => !filterItem.disabled && handleCategoryChange(filterItem.value)}
                  >
                    {filterItem.value}
                  </Chip>
                ))}
              </ChipsContainer>
            </FilterGroup>
          ))
        }        {/* Filtro de Marcas con estado dinámico */}
        {availableFiltersWithStatus.brands.length > 0 && (
          <FilterGroup>
            <SectionSubTitle>
              <FaTrademark />
              Marcas
            </SectionSubTitle>
            <ChipsContainer>
              {availableFiltersWithStatus.brands.map((brandItem, index) => (
                <Chip
                  key={`brand-${brandItem.value}-${index}`}
                  selected={localBrands.includes(brandItem.value)}
                  disabled={brandItem.disabled}
                  onClick={() => !brandItem.disabled && handleBrandChange(brandItem.value)}
                >
                  {brandItem.value}
                </Chip>
              ))}
            </ChipsContainer>
          </FilterGroup>
        )}

        {/* Filtro de Precio */}
        <FilterGroup>
          <SectionSubTitle>
            Rango de Precio
          </SectionSubTitle>
          <PriceRangeContainer>
            <PriceInputGroup>
              <PriceInput
                type="number"
                placeholder="Mín"
                value={localPriceRange.min}
                onChange={(e) => handlePriceChange("min", e.target.value)}
                min="0"
                max={availablePriceRange.max}
              />
              <span>-</span>
              <PriceInput
                type="number"
                placeholder="Máx"
                value={localPriceRange.max}
                onChange={(e) => handlePriceChange("max", e.target.value)}
                min="0"
                max={availablePriceRange.max}
              />
            </PriceInputGroup>
          </PriceRangeContainer>
        </FilterGroup>

        {/* Botón para limpiar filtros */}
        <Button
          text="Limpiar filtros"
          variant="outlined"
          leftIconName="FaTimes"
          size="small"
          onClick={clearAllFilters}
          fullWidth={true}
        />
      </SidebarContainer>
    </SidebarWrapper>
  );
});

FilterSidebar.displayName = "FilterSidebar";

export default FilterSidebar;
