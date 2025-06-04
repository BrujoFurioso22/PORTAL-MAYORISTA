import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { FaTimes, FaFilter, FaTag, FaTrademark } from "react-icons/fa"; // Importar iconos

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
  background-color: ${({ selected, theme }) =>
    selected ? theme.colors.primary : theme.colors.background};
  color: ${({ selected, theme }) =>
    selected ? theme.colors.white : theme.colors.text};
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${({ selected, theme }) =>
    selected ? theme.colors.primary : theme.colors.border};

  &:hover {
    background-color: ${({ selected, theme }) =>
      selected ? theme.colors.accent : theme.colors.backgroundHover};
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

const ClearFiltersButton = styled.button`
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
  margin-top: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

// Añadir estas constantes para agrupar las categorías
const CATEGORY_GROUPS = {
  llantas: [
    { key: 'categoria', label: 'Categoría' },
    { key: 'segmento', label: 'Segmento' },
    { key: 'aplicacion', label: 'Aplicación' }
  ],
  lubricantes: [
    { key: 'categoria', label: 'Categoría' },
    { key: 'tipo', label: 'Tipo' }
  ],
  luces: [
    { key: 'categoria', label: 'Categoría' },
    { key: 'tipo', label: 'Tipo' }
  ],
  DEFAULT: [
    { key: 'categoria', label: 'Categoría' }
  ]
};

const FilterSidebar = ({
  availableCategories = [],
  availableBrands = [],
  priceRange: defaultPriceRange = { min: 0, max: 100 },
  onApplyFilters,
  // Nuevo prop para conocer la línea de negocio
  lineaNegocio = "DEFAULT"
}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [currentPriceRange, setCurrentPriceRange] = useState({
    min: defaultPriceRange.min,
    max: defaultPriceRange.max,
  });

  // Refs para mantener referencias a los inputs
  const minInputRef = useRef(null);
  const maxInputRef = useRef(null);

  // Almacenar la función onApplyFilters en una referencia para mantener estabilidad
  const onApplyFiltersRef = useRef(onApplyFilters);

  // Actualizar la referencia cuando cambie la función
  useEffect(() => {
    onApplyFiltersRef.current = onApplyFilters;
  }, [onApplyFilters]);

  // Resetear los filtros cuando cambian las opciones disponibles (cambio de empresa)
  useEffect(() => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setCurrentPriceRange({
      min: Math.max(0, defaultPriceRange.min),
      max: defaultPriceRange.max,
    });
  }, [availableCategories, availableBrands, defaultPriceRange]);

  // Aplicar filtros con debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      const filters = {
        categories: selectedCategories,
        brands: selectedBrands,
        price: currentPriceRange,
      };

      // Usar la referencia estable
      onApplyFiltersRef.current(filters);
    }, 300); // 300ms de debounce

    return () => clearTimeout(handler);
  }, [selectedCategories, selectedBrands, currentPriceRange]);

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
      value = Math.min(value, currentPriceRange.max);
    } else {
      // El máximo no puede exceder el máximo permitido
      value = Math.min(value, defaultPriceRange.max);
      // El máximo no puede ser menor que el mínimo
      value = Math.max(value, currentPriceRange.min);
    }

    // Actualizar el estado inmediatamente para mejor respuesta del UI
    setCurrentPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setCurrentPriceRange({
      min: Math.max(0, defaultPriceRange.min),
      max: defaultPriceRange.max,
    });
  };

  // Función para agrupar las categorías
  const groupCategories = () => {
    // Obtener los grupos para esta línea de negocio
    const groups = CATEGORY_GROUPS[lineaNegocio.toLowerCase()] || CATEGORY_GROUPS.DEFAULT;
    
    // Inicializar el objeto de grupos
    const result = {};
    groups.forEach(group => {
      result[group.key] = {
        label: group.label,
        items: []
      };
    });
    
    // Distribuir las categorías en sus grupos correspondientes
    availableCategories.forEach(category => {
      // Intentar identificar el grupo basado en el nombre o propiedad
      let groupKey = 'categoria'; // default
      
      // Extraer el grupo del nombre (p.ej. si el nombre es "categoria_valor")
      const nameParts = category.name.split('_');
      if (nameParts.length > 1) {
        // Verificar si el prefijo coincide con alguno de nuestros grupos
        const possibleGroup = nameParts[0].toLowerCase();
        if (groups.some(g => g.key === possibleGroup)) {
          groupKey = possibleGroup;
        }
      }
      
      // Si esta categoría tiene un grupo identificado, agregarla
      if (result[groupKey]) {
        result[groupKey].items.push(category);
      } else {
        // Si no encontramos un grupo específico, usar el primero
        const firstGroupKey = Object.keys(result)[0];
        if (firstGroupKey) {
          result[firstGroupKey].items.push(category);
        }
      }
    });
    
    // Filtrar los grupos que no tienen elementos
    return Object.entries(result)
      .filter(([_, group]) => group.items.length > 0);
  };
  
  // Grupos de categorías calculados
  const categoryGroups = groupCategories();
  
  return (
    <SidebarWrapper>
      <SidebarContainer>
        {/* Mostrar categorías agrupadas */}
        {categoryGroups.length > 0 && categoryGroups.map(([groupKey, group]) => (
          <FilterGroup key={groupKey}>
            <SectionSubTitle>
              <FaTag /> {group.label}
            </SectionSubTitle>
            <ChipsContainer>
              {group.items.map((category) => (
                <Chip
                  key={category.id}
                  selected={selectedCategories.includes(category.name)}
                  onClick={() => handleCategoryChange(category.name)}
                >
                  {category.displayName}
                </Chip>
              ))}
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
              {availableBrands.map((brand) => (
                <Chip
                  key={brand.id}
                  selected={selectedBrands.includes(brand.name)}
                  onClick={() => handleBrandChange(brand.name)}
                >
                  {brand.name}
                </Chip>
              ))}
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
                value={currentPriceRange.min}
                onChange={(e) => handlePriceChange("min", e.target.value)}
                onBlur={() => {
                  if (currentPriceRange.min > currentPriceRange.max) {
                    setCurrentPriceRange((prev) => ({
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
                value={currentPriceRange.max}
                onChange={(e) => handlePriceChange("max", e.target.value)}
                onBlur={() => {
                  if (currentPriceRange.max < currentPriceRange.min) {
                    setCurrentPriceRange((prev) => ({
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

        {/* Botón para limpiar filtros sin cambios */}
        {(selectedCategories.length > 0 ||
          selectedBrands.length > 0 ||
          currentPriceRange.min !== Math.max(0, defaultPriceRange.min) ||
          currentPriceRange.max !== defaultPriceRange.max) && (
          <ClearFiltersButton onClick={clearFilters}>
            <FaTimes /> Limpiar filtros
          </ClearFiltersButton>
        )}
      </SidebarContainer>
    </SidebarWrapper>
  );
};

export default React.memo(FilterSidebar);
