import React, { useEffect, useState } from "react";
import styled from "styled-components";
// import { brands, categories } from '../../mock/products';

const SidebarContainer = styled.div`
  background: ${(props) => props.theme.colors.surface}; // Usar surface en lugar de "white"
  color: ${(props) => props.theme.colors.text}; // Añadir color de texto
  border-radius: 8px;
  box-shadow: 0 2px 6px ${(props) => props.theme.colors.shadow};
  padding: 20px;
  margin-right: 20px;
  min-width: 250px;
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  padding-bottom: 8px;
`;

const FilterGroup = styled.div`
  margin-bottom: 24px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.text}; // Añadir color de texto
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const PriceRangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PriceInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PriceInput = styled.input`
  width: 80px;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.surface}; // Añadir color de fondo
  color: ${(props) => props.theme.colors.text}; // Añadir color de texto
`;

const RangeSlider = styled.input`
  width: 100%;
  margin: 10px 0;
`;

const ApplyButton = styled.button`
  padding: 8px 16px;
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white}; // Usar theme.colors.white
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: ${(props) => props.theme.colors.accent};
  }
`;

const FilterSidebar = ({
  availableCategories = [],
  availableBrands = [],
  priceRange: defaultPriceRange = { min: 0, max: 100 },
  onApplyFilters,
}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState(defaultPriceRange);

  // Resetear los filtros cuando cambian las opciones disponibles (cambio de empresa)
  useEffect(() => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange(defaultPriceRange);
  }, [availableCategories, availableBrands, defaultPriceRange]);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      categories: selectedCategories,
      brands: selectedBrands,
      price: priceRange,
    });
  };

  return (
    <SidebarContainer>
      <SectionTitle>Filtros</SectionTitle>

      {/* Solo mostrar el filtro de categorías si hay categorías disponibles */}
      {availableCategories.length > 0 && (
        <FilterGroup>
          <SectionTitle>Categorías</SectionTitle>
          <CheckboxGroup>
            {availableCategories.map((category) => (
              <CheckboxItem key={category.id}>
                <Checkbox
                  type="checkbox"
                  checked={selectedCategories.includes(category.name)}
                  onChange={() => handleCategoryChange(category.name)}
                />
                {category.displayName}
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </FilterGroup>
      )}

      {/* Solo mostrar el filtro de marcas si hay marcas disponibles */}
      {availableBrands.length > 0 && (
        <FilterGroup>
          <SectionTitle>Marcas</SectionTitle>
          <CheckboxGroup>
            {availableBrands.map((brand) => (
              <CheckboxItem key={brand.id}>
                <Checkbox
                  type="checkbox"
                  checked={selectedBrands.includes(brand.name)}
                  onChange={() => handleBrandChange(brand.name)}
                />
                {brand.name}
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </FilterGroup>
      )}

      <FilterGroup>
        <SectionTitle>Rango de precio</SectionTitle>
        <PriceRangeContainer>
          <PriceInputGroup>
            <span>$</span>
            <PriceInput
              type="number"
              min={defaultPriceRange.min}
              max={defaultPriceRange.max}
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange({
                  ...priceRange,
                  min: parseInt(e.target.value) || defaultPriceRange.min,
                })
              }
            />
            <span>a</span>
            <PriceInput
              type="number"
              min={defaultPriceRange.min}
              max={defaultPriceRange.max}
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange({
                  ...priceRange,
                  max: parseInt(e.target.value) || defaultPriceRange.max,
                })
              }
            />
          </PriceInputGroup>
          <RangeSlider
            type="range"
            min={defaultPriceRange.min}
            max={defaultPriceRange.max}
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange({ ...priceRange, max: parseInt(e.target.value) })
            }
          />
        </PriceRangeContainer>
      </FilterGroup>

      <ApplyButton onClick={handleApply}>Aplicar filtros</ApplyButton>
    </SidebarContainer>
  );
};

export default FilterSidebar;
