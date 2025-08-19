import React, { useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import Button from "./Button";
import { CATEGORY_TYPE_LABELS } from "../../constants/productLineConfig";
import RenderIcon from "./RenderIcon";
import Select from "./Select";
import Input from "./Input";
import { TAXES, calculatePriceWithIVA } from "../../constants/taxes";

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
  justify-content: space-between;
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
  justify-content: ${({ $isNotCollapsible }) =>
    $isNotCollapsible ? "flex-start" : "space-between"};
  gap: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  .title-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  svg {
    color: ${({ theme }) => theme.colors.primary};
    transition: transform 0.2s ease;
    transform: ${({ $isCollapsed }) => ($isCollapsed ? "rotate(-90deg)" : "rotate(0deg)")};
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 24px;
`;

const CollapsibleContent = styled.div`
  overflow: visible;
  transition: all 0.3s ease;
  max-height: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "none")};
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "1")};
  margin-top: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "12px")};
  pointer-events: ${({ $isCollapsed }) => ($isCollapsed ? "none" : "auto")};
  visibility: ${({ $isCollapsed }) => ($isCollapsed ? "hidden" : "visible")};
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
      ? `${theme.colors.textLight}15`
      : theme.colors.surface};
  color: ${({ selected, disabled, theme }) =>
    selected
      ? theme.colors.white
      : disabled
      ? theme.colors.textLight
      : theme.colors.text};
  border: 1px solid
    ${({ selected, disabled, theme }) =>
      selected
        ? theme.colors.primary
        : disabled
        ? theme.colors.border
        : theme.colors.border};
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  &:hover {
    background-color: ${({ selected, disabled, theme }) =>
      !disabled &&
      (selected
        ? theme.colors.primaryDark
        : theme.colors.primaryLight)};
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(-1px)")};
  }

  &:active {
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(0)")};
  }
`;

const ProductsCount = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
  margin-bottom: 16px;
  text-align: center;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const BusinessLineSelector = styled.div`
  margin-bottom: 24px;
`;

const BusinessLineButton = styled.button`
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.white : theme.colors.text};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.border};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.primaryDark : theme.colors.primaryLight};
    color: ${({ $active, theme }) =>
      $active ? theme.colors.white : theme.colors.primary};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const PriceRangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PriceSelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PriceLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 4px;
`;

const SearchInput = styled.div`
  margin-bottom: 12px;
  position: relative;
`;

const SearchInputField = styled(Input)`
  width: 100%;
  font-size: 0.85rem;
  
  input {
    padding: 6px 30px 6px 8px;
    font-size: 0.85rem;
  }
`;

const ClearSearchButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }
`;

// Función para obtener filtros de neumáticos
function getNeumaticosFilters(productos, selectedRin, selectedAncho) {
  if (!productos || productos.length === 0) {
    return {
      rinOptions: [],
      anchoOptions: [],
      altoOptions: [],
    };
  }

  const llantasProducts = productos.filter(
    (product) => product.lineaNegocio === "LLANTAS"
  );

  const rinSet = new Set();
  llantasProducts.forEach((product) => {
    if (product.specs && product.specs.rin) {
      rinSet.add(String(product.specs.rin));
    }
  });

  const anchoSet = new Set();
  if (selectedRin) {
    const filteredByRin = llantasProducts.filter(
      (product) =>
        product.specs && String(product.specs.rin) === String(selectedRin)
    );
    filteredByRin.forEach((product) => {
      if (product.specs && product.specs.ancho) {
        anchoSet.add(String(product.specs.ancho));
      }
    });
  }

  const altoSet = new Set();
  if (selectedAncho) {
    const filteredByAncho = llantasProducts.filter(
      (product) =>
        product.specs &&
        String(product.specs.rin) === String(selectedRin) &&
        String(product.specs.ancho) === String(selectedAncho)
    );
    filteredByAncho.forEach((product) => {
      if (product.specs && product.specs.serie) {
        altoSet.add(String(product.specs.serie));
      }
    });
  }

  return {
    rinOptions: Array.from(rinSet).sort((a, b) => parseInt(a) - parseInt(b)),
    anchoOptions: Array.from(anchoSet).sort((a, b) => parseInt(a) - parseInt(b)),
    altoOptions: Array.from(altoSet).sort((a, b) => parseInt(a) - parseInt(b)),
  };
}

const FilterSidebar = React.memo(({
  allProducts = [],
  lineaNegocio = "DEFAULT",
  availableBusinessLines = [],
  onBusinessLineChange,
  selectedCategories = [],
  selectedBrands = [],
  selectedPriceRange = null,
  selectedRinProp = "",
  selectedAnchoProp = "",
  selectedAltoProp = "",
  onApplyFilters,
  countFilteredProducts = 0,
}) => {
  // Solo estado local para grupos colapsados
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  
  // Estados para búsquedas de características
  const [searchTerms, setSearchTerms] = useState({});

  // Calcular rango de precios disponible basado en productos filtrados
  const availablePriceRange = useMemo(() => {
    if (!allProducts || allProducts.length === 0) {
      return { min: 0, max: 100 };
    }

    const relevantProducts = allProducts.filter(
      (product) =>
        lineaNegocio === "DEFAULT" || product.lineaNegocio === lineaNegocio
    );

    // Aplicar filtros actuales para obtener productos disponibles
    const availableProducts = relevantProducts.filter((product) => {
      // Filtro de categorías
      if (selectedCategories.length > 0) {
        const hasAllCategories = selectedCategories.every((selectedCategory) => {
          if (!product.filtersByType) return false;
          return Object.values(product.filtersByType).some(
            (filterArray) =>
              Array.isArray(filterArray) &&
              filterArray.includes(selectedCategory)
          );
        });
        if (!hasAllCategories) return false;
      }

      // Filtro de marcas
      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes(product.brand)) return false;
      }

      // Filtros de medidas para LLANTAS
      if (lineaNegocio === "LLANTAS") {
        if (selectedRinProp && String(product.specs?.rin) !== String(selectedRinProp))
          return false;
        if (
          selectedAnchoProp &&
          String(product.specs?.ancho) !== String(selectedAnchoProp)
        )
          return false;
        if (
          selectedAltoProp &&
          String(product.specs?.serie) !== String(selectedAltoProp)
        )
          return false;
      }

      return true;
    });

    const pricesWithIVA = availableProducts
      .map((product) => {
        if (product.price === null || product.price === undefined)
          return null;

        const discountedPrice = product.discount
          ? product.price * (1 - product.discount / 100)
          : product.price;

        return calculatePriceWithIVA(
          discountedPrice,
          product.iva || TAXES.IVA_PERCENTAGE
        );
      })
      .filter((price) => price !== null);

    if (pricesWithIVA.length === 0) return { min: 0, max: 100 };

    // Redondear a múltiplos de 10
    const rawMin = Math.min(...pricesWithIVA);
    const rawMax = Math.max(...pricesWithIVA);
    
    return {
      min: Math.floor(rawMin / 10) * 10,
      max: Math.ceil(rawMax / 10) * 10,
    };
  }, [
    allProducts, 
    lineaNegocio, 
    selectedCategories, 
    selectedBrands, 
    selectedRinProp, 
    selectedAnchoProp, 
    selectedAltoProp
  ]);

  // Calcular categorías agrupadas
  const categoriesGroupedByType = useMemo(() => {
    if (!allProducts || allProducts.length === 0) {
      return {};
    }

    const relevantProducts = allProducts.filter(
      (product) =>
        lineaNegocio === "DEFAULT" || product.lineaNegocio === lineaNegocio
    );

    const groupedFilters = {};

    relevantProducts.forEach((product) => {
      if (!product || !product.filtersByType) return;

      Object.entries(product.filtersByType).forEach(
        ([filterType, filterValues]) => {
          if (!groupedFilters[filterType]) {
            groupedFilters[filterType] = new Set();
          }

          if (Array.isArray(filterValues)) {
            filterValues.forEach((value) => {
              groupedFilters[filterType].add(value);
            });
          }
        }
      );
    });

    const result = {};
    Object.entries(groupedFilters).forEach(([type, valuesSet]) => {
      result[type] = Array.from(valuesSet).sort();
    });

    return result;
  }, [allProducts, lineaNegocio]);

  // Calcular marcas disponibles
  const availableBrands = useMemo(() => {
    if (!allProducts || allProducts.length === 0) {
      return [];
    }

    const relevantProducts = allProducts.filter(
      (product) =>
        lineaNegocio === "DEFAULT" || product.lineaNegocio === lineaNegocio
    );

    const brandsSet = new Set();

    relevantProducts.forEach((product) => {
      if (product && product.brand) {
        brandsSet.add(String(product.brand));
      }
    });

    return Array.from(brandsSet).sort();
  }, [allProducts, lineaNegocio]);

  // Calcular filtros disponibles con estado
  const availableFiltersWithStatus = useMemo(() => {
    if (!allProducts || allProducts.length === 0) {
      return { categories: {}, brands: [] };
    }

    const relevantProducts = allProducts.filter(
      (product) =>
        lineaNegocio === "DEFAULT" || product.lineaNegocio === lineaNegocio
    );

    const availableProducts = relevantProducts.filter((product) => {
      if (selectedCategories.length > 0) {
        const hasAllCategories = selectedCategories.every((selectedCategory) => {
          if (!product.filtersByType) return false;
          return Object.values(product.filtersByType).some(
            (filterArray) =>
              Array.isArray(filterArray) &&
              filterArray.includes(selectedCategory)
          );
        });
        if (!hasAllCategories) return false;
      }

      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes(product.brand)) return false;
      }

      const shouldApplyPriceFilter =
        selectedPriceRange && (
          selectedPriceRange.min > 0 ||
          selectedPriceRange.max < availablePriceRange.max
        );

      if (shouldApplyPriceFilter) {
        if (product.price !== null && product.price !== undefined) {
          const discountedPrice = product.discount
            ? product.price * (1 - product.discount / 100)
            : product.price;
          const priceWithIVA = calculatePriceWithIVA(
            discountedPrice,
            product.iva || TAXES.IVA_PERCENTAGE
          );

          if (
            priceWithIVA < selectedPriceRange.min ||
            priceWithIVA > selectedPriceRange.max
          ) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (lineaNegocio === "LLANTAS") {
        if (selectedRinProp && String(product.specs?.rin) !== String(selectedRinProp))
          return false;
        if (
          selectedAnchoProp &&
          String(product.specs?.ancho) !== String(selectedAnchoProp)
        )
          return false;
        if (
          selectedAltoProp &&
          String(product.specs?.serie) !== String(selectedAltoProp)
        )
          return false;
      }

      return true;
    });

    const availableCategories = {};
    Object.keys(categoriesGroupedByType).forEach((filterType) => {
      availableCategories[filterType] = new Set();
    });

    const availableBrandsSet = new Set();

    availableProducts.forEach((product) => {
      if (product.filtersByType) {
        Object.entries(product.filtersByType).forEach(
          ([filterType, filterValues]) => {
            if (Array.isArray(filterValues)) {
              filterValues.forEach((value) => {
                if (availableCategories[filterType]) {
                  availableCategories[filterType].add(value);
                }
              });
            }
          }
        );
      }

      if (product.brand) {
        availableBrandsSet.add(product.brand);
      }
    });

    const categoriesWithStatus = {};
    Object.entries(categoriesGroupedByType).forEach(
      ([filterType, allValues]) => {
        categoriesWithStatus[filterType] = allValues.map((value) => ({
          value,
          disabled:
            !availableCategories[filterType].has(value) &&
            !selectedCategories.includes(value),
        }));
      }
    );

    const brandsWithStatus = availableBrands.map((brand) => ({
      value: brand,
      disabled:
        !availableBrandsSet.has(brand) && !selectedBrands.includes(brand),
    }));

    return {
      categories: categoriesWithStatus,
      brands: brandsWithStatus,
    };
  }, [
    allProducts,
    lineaNegocio,
    selectedCategories,
    selectedBrands,
    selectedPriceRange,
    availablePriceRange,
    categoriesGroupedByType,
    availableBrands,
    selectedRinProp,
    selectedAnchoProp,
    selectedAltoProp,
  ]);

  // Handlers simples que solo llaman a onApplyFilters
  const handleCategoryChange = useCallback(
    (category) => {
      const newCategories = selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category];

      onApplyFilters({
        categories: newCategories,
        brands: selectedBrands,
        price: selectedPriceRange,
        businessLine: lineaNegocio,
        rin: selectedRinProp,
        ancho: selectedAnchoProp,
        alto: selectedAltoProp,
      });
    },
    [selectedCategories, selectedBrands, selectedPriceRange, lineaNegocio, selectedRinProp, selectedAnchoProp, selectedAltoProp, onApplyFilters]
  );

  const handleBrandChange = useCallback(
    (brand) => {
      const newBrands = selectedBrands.includes(brand)
        ? selectedBrands.filter((b) => b !== brand)
        : [...selectedBrands, brand];

      onApplyFilters({
        categories: selectedCategories,
        brands: newBrands,
        price: selectedPriceRange,
        businessLine: lineaNegocio,
        rin: selectedRinProp,
        ancho: selectedAnchoProp,
        alto: selectedAltoProp,
      });
    },
    [selectedCategories, selectedBrands, selectedPriceRange, lineaNegocio, selectedRinProp, selectedAnchoProp, selectedAltoProp, onApplyFilters]
  );

  const handlePriceChange = useCallback(
    (type, value) => {
      const numValue = parseFloat(value) || 0;
      const newPriceRange = {
        ...selectedPriceRange,
        [type]: numValue,
      };

      if (type === "min" && newPriceRange.max < numValue) {
        newPriceRange.max = numValue;
      }

      onApplyFilters({
        categories: selectedCategories,
        brands: selectedBrands,
        price: newPriceRange,
        businessLine: lineaNegocio,
        rin: selectedRinProp,
        ancho: selectedAnchoProp,
        alto: selectedAltoProp,
      });
    },
    [selectedCategories, selectedBrands, selectedPriceRange, lineaNegocio, selectedRinProp, selectedAnchoProp, selectedAltoProp, onApplyFilters]
  );

  const handleRinChange = useCallback(
    (value) => {
      onApplyFilters({
        categories: selectedCategories,
        brands: selectedBrands,
        price: selectedPriceRange,
        businessLine: lineaNegocio,
        rin: value,
        ancho: "", // Reset ancho when rin changes
        alto: "", // Reset alto when rin changes
      });
    },
    [selectedCategories, selectedBrands, selectedPriceRange, lineaNegocio, onApplyFilters]
  );

  const handleAnchoChange = useCallback(
    (value) => {
      onApplyFilters({
        categories: selectedCategories,
        brands: selectedBrands,
        price: selectedPriceRange,
        businessLine: lineaNegocio,
        rin: selectedRinProp,
        ancho: value,
        alto: "", // Reset alto when ancho changes
      });
    },
    [selectedCategories, selectedBrands, selectedPriceRange, lineaNegocio, selectedRinProp, onApplyFilters]
  );

  const handleAltoChange = useCallback(
    (value) => {
      onApplyFilters({
        categories: selectedCategories,
        brands: selectedBrands,
        price: selectedPriceRange,
        businessLine: lineaNegocio,
        rin: selectedRinProp,
        ancho: selectedAnchoProp,
        alto: value,
      });
    },
    [selectedCategories, selectedBrands, selectedPriceRange, lineaNegocio, selectedRinProp, selectedAnchoProp, onApplyFilters]
  );

  const toggleGroup = useCallback((groupName) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  }, []);

  // Función para manejar cambios en los términos de búsqueda
  const handleSearchChange = useCallback((filterType, value) => {
    setSearchTerms(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Función para limpiar búsqueda de una característica específica
  const clearSearch = useCallback((filterType) => {
    setSearchTerms(prev => {
      const newTerms = { ...prev };
      delete newTerms[filterType];
      return newTerms;
    });
  }, []);

  // Función para filtrar items basado en la búsqueda
  const getFilteredItems = useCallback((items, filterType) => {
    const searchTerm = searchTerms[filterType] || "";
    if (!searchTerm.trim()) return items;
    
    return items.filter(item => 
      item.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerms]);

  const clearAllFilters = useCallback(() => {
    onApplyFilters({
      categories: [],
      brands: [],
      price: {
        min: availablePriceRange.min, // Ya está redondeado
        max: availablePriceRange.max, // Ya está redondeado
      },
      businessLine: lineaNegocio,
      rin: "",
      ancho: "",
      alto: "",
    });
  }, [lineaNegocio, availablePriceRange.min, availablePriceRange.max, onApplyFilters]);

  const neumaticosFilters = useMemo(() => {
    if (lineaNegocio !== "LLANTAS") return null;
    return getNeumaticosFilters(allProducts, selectedRinProp, selectedAnchoProp);
  }, [allProducts, lineaNegocio, selectedRinProp, selectedAnchoProp]);

  const priceOptions = useMemo(() => {
    const options = [];
    const minRounded = availablePriceRange.min; // Ya está redondeado
    const maxRounded = availablePriceRange.max; // Ya está redondeado

    for (let price = minRounded; price <= maxRounded; price += 10) {
      options.push({
        label: `$${price}`,
        value: price,
      });
    }

    return options;
  }, [availablePriceRange.min, availablePriceRange.max]);

  const maxPriceOptions = useMemo(() => {
    const options = [];
    const maxRounded = availablePriceRange.max; // Ya está redondeado
    const currentMin = selectedPriceRange?.min || availablePriceRange.min;

    // Asegurar que el mínimo sea al menos el valor mínimo seleccionado
    const startPrice = Math.max(currentMin, availablePriceRange.min);

    for (let price = startPrice; price <= maxRounded; price += 10) {
      options.push({
        label: `$${price}`,
        value: price,
      });
    }

    return options;
  }, [availablePriceRange.max, availablePriceRange.min, selectedPriceRange?.min]);

  return (
    <SidebarWrapper>
      <SidebarContainer>
        <SectionTitle>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <RenderIcon name="FaFilter" size={16} />
            Filtros
          </div>
          <Button
            text="Limpiar filtros"
            variant="outlined"
            leftIconName="FaTimes"
            size="small"
            onClick={clearAllFilters}
            fullWidth={false}
          />
        </SectionTitle>
        {countFilteredProducts > 0 && (
          <ProductsCount>
            {countFilteredProducts} productos encontrados
          </ProductsCount>
        )}

        {availableBusinessLines.length > 1 && (
          <BusinessLineSelector>
            <SectionSubTitle $isNotCollapsible>
              <RenderIcon name="FaIndustry" size={18} />
              Línea de Negocio
            </SectionSubTitle>
            {availableBusinessLines.map((line) => (
              <BusinessLineButton
                key={line}
                $active={lineaNegocio === line}
                onClick={() =>
                  onBusinessLineChange && onBusinessLineChange(line)
                }
              >
                {line}
              </BusinessLineButton>
            ))}
          </BusinessLineSelector>
        )}
        {lineaNegocio === "LLANTAS" && neumaticosFilters && (
          <FilterGroup>
            <SectionSubTitle
              $isCollapsed={collapsedGroups.has("medidas")}
              onClick={() => toggleGroup("medidas")}
            >
              <div className="title-content">
                <RenderIcon name="FaRuler" size={18} />
                Filtrar por medidas
              </div>
              <RenderIcon name="FaChevronDown" size={14} />
            </SectionSubTitle>
            <CollapsibleContent $isCollapsed={collapsedGroups.has("medidas")}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <Select
                  options={neumaticosFilters.rinOptions.map((rin) => ({
                    label: rin,
                    value: rin,
                  }))}
                  value={selectedRinProp}
                  onChange={(e) => handleRinChange(e.target.value)}
                  placeholder="Rin"
                  width="90px"
                  withSearch
                  disabled={false}
                />
                <Select
                  options={neumaticosFilters.anchoOptions.map((ancho) => ({
                    label: ancho,
                    value: ancho,
                  }))}
                  value={selectedAnchoProp}
                  onChange={(e) => handleAnchoChange(e.target.value)}
                  placeholder="Ancho"
                  width="90px"
                  disabled={!selectedRinProp}
                />
                {neumaticosFilters.altoOptions.length > 0 && (
                  <Select
                    options={neumaticosFilters.altoOptions.map((alto) => ({
                      label: alto,
                      value: alto,
                    }))}
                    value={selectedAltoProp}
                    onChange={(e) => handleAltoChange(e.target.value)}
                    placeholder="Alto"
                    width="90px"
                    disabled={!selectedAnchoProp}
                  />
                )}
              </div>
            </CollapsibleContent>
          </FilterGroup>
        )}
        {Object.keys(availableFiltersWithStatus.categories).length > 0 &&
          Object.entries(availableFiltersWithStatus.categories).map(
            ([filterType, filterItems]) => (
              <FilterGroup key={filterType}>
                <SectionSubTitle
                  $isCollapsed={collapsedGroups.has(filterType)}
                  onClick={() => toggleGroup(filterType)}
                >
                  <div className="title-content">
                    <RenderIcon name="FaTag" size={18} />
                    {CATEGORY_TYPE_LABELS[filterType] ||
                      filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </div>
                  <RenderIcon name="FaChevronDown" size={14} />
                </SectionSubTitle>
                <CollapsibleContent $isCollapsed={collapsedGroups.has(filterType)}>
                  {filterItems.length > 15 && (
                    <SearchInput>
                      <SearchInputField
                        placeholder={`Buscar en ${CATEGORY_TYPE_LABELS[filterType] || filterType}...`}
                        value={searchTerms[filterType] || ""}
                        onChange={(e) => handleSearchChange(filterType, e.target.value)}
                        leftIconName="FaSearch"
                        fullWidth
                      />
                      {searchTerms[filterType] && (
                        <ClearSearchButton
                          onClick={() => clearSearch(filterType)}
                          title="Limpiar búsqueda"
                        >
                          <RenderIcon name="FaTimes" size={12} />
                        </ClearSearchButton>
                      )}
                    </SearchInput>
                  )}
                  <ChipsContainer>
                    {getFilteredItems(filterItems, filterType).map((filterItem, index) => (
                      <Chip
                        key={`${filterType}-${filterItem.value}-${index}`}
                        selected={selectedCategories.includes(filterItem.value)}
                        disabled={filterItem.disabled}
                        onClick={() =>
                          !filterItem.disabled &&
                          handleCategoryChange(filterItem.value)
                        }
                      >
                        {filterItem.value}
                      </Chip>
                    ))}
                  </ChipsContainer>
                </CollapsibleContent>
              </FilterGroup>
            )
          )}
        {availableFiltersWithStatus.brands.length > 0 && (
          <FilterGroup>
            <SectionSubTitle
              $isCollapsed={collapsedGroups.has("marcas")}
              onClick={() => toggleGroup("marcas")}
            >
              <div className="title-content">
                <RenderIcon name="FaTrademark" size={18} />
                Marcas
              </div>
              <RenderIcon name="FaChevronDown" size={14} />
            </SectionSubTitle>
            <CollapsibleContent $isCollapsed={collapsedGroups.has("marcas")}>
              {availableFiltersWithStatus.brands.length > 15 && (
                <SearchInput>
                  <SearchInputField
                    placeholder="Buscar marcas..."
                    value={searchTerms["marcas"] || ""}
                    onChange={(e) => handleSearchChange("marcas", e.target.value)}
                    leftIconName="FaSearch"
                    fullWidth
                  />
                  {searchTerms["marcas"] && (
                    <ClearSearchButton
                      onClick={() => clearSearch("marcas")}
                      title="Limpiar búsqueda"
                    >
                      <RenderIcon name="FaTimes" size={12} />
                    </ClearSearchButton>
                  )}
                </SearchInput>
              )}
              <ChipsContainer>
                {getFilteredItems(availableFiltersWithStatus.brands, "marcas").map((brandItem, index) => (
                  <Chip
                    key={`brand-${brandItem.value}-${index}`}
                    selected={selectedBrands.includes(brandItem.value)}
                    disabled={brandItem.disabled}
                    onClick={() =>
                      !brandItem.disabled && handleBrandChange(brandItem.value)
                    }
                  >
                    {brandItem.value}
                  </Chip>
                ))}
              </ChipsContainer>
            </CollapsibleContent>
          </FilterGroup>
        )}
        <FilterGroup>
          <SectionSubTitle
            $isCollapsed={collapsedGroups.has("precio")}
            onClick={() => toggleGroup("precio")}
          >
            <div className="title-content">
              <RenderIcon name="FaDollarSign" size={16} />
              Rango de Precio
            </div>
            <RenderIcon name="FaChevronDown" size={14} />
          </SectionSubTitle>
          <CollapsibleContent $isCollapsed={collapsedGroups.has("precio")}>
            <PriceRangeContainer>
              <PriceSelectGroup>
                <div>
                  <PriceLabel>Desde:</PriceLabel>
                  <Select
                    options={priceOptions}
                    value={selectedPriceRange?.min || availablePriceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    placeholder="Precio mínimo"
                    width="100px"
                    withSearch
                  />
                </div>
                <div>
                  <PriceLabel>Hasta:</PriceLabel>
                  <Select
                    options={maxPriceOptions}
                    value={selectedPriceRange?.max || availablePriceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    placeholder="Precio máximo"
                    width="100px"
                    withSearch
                  />
                </div>
              </PriceSelectGroup>
            </PriceRangeContainer>
          </CollapsibleContent>
        </FilterGroup>
      </SidebarContainer>
    </SidebarWrapper>
  );
});

FilterSidebar.displayName = "FilterSidebar";

export default FilterSidebar; 