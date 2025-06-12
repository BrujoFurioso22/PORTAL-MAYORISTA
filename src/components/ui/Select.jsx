import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FaSearch, FaChevronDown } from "react-icons/fa";

const SelectContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: ${({ width }) => width || "250px"};
`;

const Label = styled.label`
  text-align: left;
  font-size: 14px;
  color: ${({ $color, theme }) => $color || theme.colors.text};
`;

const SelectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;
  text-align: left;
  appearance: none;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }

  svg {
    transition: transform 0.2s ease;
    transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0)")};
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
`;

const SearchInputWrapper = styled.div`
  position: relative;
  padding: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px;
  padding-left: 32px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const OptionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: ${({ $hasSearch }) => ($hasSearch ? "242px" : "300px")};
  overflow-y: auto;
`;

const OptionItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  color: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.primary : theme.colors.text};
  background-color: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.primaryLight + "33" : theme.colors.surface};
  font-weight: ${({ $isSelected }) => ($isSelected ? "500" : "normal")};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const NoResults = styled.div`
  padding: 12px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  font-style: italic;
`;

const Select = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Seleccionar...",
  withSearch = false,
  searchPlaceholder = "Buscar...",
  width = "250px",
  labelKey = "label",
  valueKey = "value",
  preValue = "",
  postValue = "",
  label,
  name = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filtrar opciones basadas en el término de búsqueda
  const filteredOptions = options.filter((option) =>
    option[labelKey].toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Encontrar la opción seleccionada
  const selectedOption = options.find((option) => option[valueKey] === value);

  // Manejar clic fuera para cerrar dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus en el input de búsqueda cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && withSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, withSearch]);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm("");
    }
  };

  const handleOptionSelect = (option) => {
    // Crear un objeto similar a un evento nativo para mantener compatibilidad
    // con código que espera e.target.value
    const syntheticEvent = {
      target: {
        name: name,
        value: option[valueKey],
      },
    };

    onChange(syntheticEvent);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <SelectContainer ref={containerRef} width={width}>
      {label && <Label>{label}</Label>}
      <SelectButton
        type="button"
        onClick={toggleDropdown}
        $isOpen={isOpen}
        disabled={disabled}
      >
        <span>
          {selectedOption
            ? `${preValue} ${selectedOption[labelKey]} ${postValue}`
            : placeholder}
        </span>
        <FaChevronDown size={12} />
      </SelectButton>

      <DropdownMenu $isOpen={isOpen}>
        {withSearch && (
          <SearchInputWrapper>
            <FaSearch size={14} />
            <SearchInput
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </SearchInputWrapper>
        )}

        <OptionsList $hasSearch={withSearch}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <OptionItem
                key={index}
                $isSelected={option[valueKey] === value}
                onClick={() => handleOptionSelect(option)}
              >
                {option[labelKey]}
              </OptionItem>
            ))
          ) : (
            <NoResults>No se encontraron resultados</NoResults>
          )}
        </OptionsList>
      </DropdownMenu>
    </SelectContainer>
  );
};

export default Select;
