import React, { useState, useEffect } from "react";
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

const PageContainer = styled.div`
  padding: 20px;
  background-color: ${({ theme }) =>
    theme.colors.background}; // Asegurar fondo correcto
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
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

const SortContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const SortSelect = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) =>
    theme.colors.surface}; // Añadir color de fondo
  color: ${({ theme }) => theme.colors.text}; // Añadir color de texto
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

const Catalogo = () => {
  const { empresaName } = useParams();
  const { user, navigateToHomeByRole } = useAuth();
  const navigate = useNavigate();

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
  console.log(empresaName);

  // Verificar si el usuario tiene acceso a esta empresa
  const userAccess = user?.EMPRESAS || [];

  // Convertir empresaName a mayúsculas para comparar con userAccess
  const hasAccess = userAccess.includes(empresaName);

  // Obtener información de la empresa - usar find insensible a mayúsculas/minúsculas
  const empresaInfo = empresas.find(
    (empresa) => empresa.nombre === empresaName
  );

  const handleNavigate = () => {
    navigateToHomeByRole();
  };

  // Verificar primero si la empresa existe antes de hacer cualquier otra lógica
  if (!empresaInfo) {
    return (
      <NoAccessContainer>
        <h2>Empresa no encontrada</h2>
        <p>La empresa que estás buscando no existe en nuestro sistema.</p>
        <Button onClick={handleNavigate}>Volver al inicio</Button>
      </NoAccessContainer>
    );
  }

  useEffect(() => {
    if (hasAccess) {
      // Si tiene acceso, cargar productos de esa empresa
      const productos = productosPorEmpresa[empresaName] || [];
      setFilteredProducts(productos);

      // Extraer categorías únicas de los productos de esta empresa
      const uniqueCategoryNames = [
        ...new Set(productos.flatMap((p) => p.categories)),
      ];
      const empresaCategories = allCategories.filter((cat) =>
        uniqueCategoryNames.includes(cat.name)
      );
      setAvailableCategories(empresaCategories);

      // Extraer marcas únicas de los productos de esta empresa
      const uniqueBrandNames = [...new Set(productos.map((p) => p.brand))];
      const empresaBrands = allBrands.filter((b) =>
        uniqueBrandNames.includes(b.name)
      );
      setAvailableBrands(empresaBrands);

      // Calcular rango de precios para esta empresa
      if (productos.length > 0) {
        const prices = productos.map((p) => p.price);
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        setPriceRange({ min: minPrice, max: maxPrice });
      }
    }
  }, [empresaName, hasAccess]);

  const handleFilters = (filters) => {
    if (!hasAccess) return;

    let result = [...productosPorEmpresa[empresaName]];

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
    result = result.filter(
      (product) =>
        product.price >= filters.price.min && product.price <= filters.price.max
    );

    // Nuevo: Filtrar por especificaciones si existen
    if (filters.specs) {
      // Por ejemplo, filtrar neumáticos por medida
      if (filters.specs.medida) {
        result = result.filter(
          (product) =>
            product.specs &&
            product.specs.medida &&
            product.specs.medida.includes(filters.specs.medida)
        );
      }
      // Otros filtros específicos por tipo de producto...
    }

    setFilteredProducts(result);
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
        />

        <div style={{ flex: 1 }}>
          <SortContainer>
            <SortSelect value={sortOption} onChange={handleSort}>
              <option value="default">Ordenar por: Destacados</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
              <option value="name_asc">Alfabético</option>
              <option value="rating">Mejor valorados</option>
            </SortSelect>
          </SortContainer>

          <ProductsGrid>
            {filteredProducts.map((product) =>
              // Añade esta verificación
              product && product.id ? (
                <ProductCard key={product.id} product={product} />
              ) : (
                console.error("Producto sin ID:", product)
              )
            )}
          </ProductsGrid>
        </div>
      </ContentLayout>
    </PageContainer>
  );
};

export default Catalogo;
