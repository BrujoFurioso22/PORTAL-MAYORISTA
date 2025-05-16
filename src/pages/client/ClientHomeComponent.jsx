import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { empresas } from "../../mock/products";

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${({ theme }) =>
    theme.colors.background}; // Añadir fondo explícito
`;

const PageTitle = styled.h1`
  margin-bottom: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

const CompaniesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
  padding: 1rem 0;
`;

const CompanyCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.12);
  }
`;

const CardBody = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CardFooter = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) =>
    theme.mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)"};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ProductCount = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ViewButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  padding: 0.4rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

// Cinta para destacar visualmente las empresas con acceso
const AccessRibbon = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  height: 200px;
  overflow: hidden;
  pointer-events: none;
`;

const RibbonContent = styled.div`
  background: ${({ $hasAccess, theme }) =>
    $hasAccess ? theme.colors.success : theme.colors.warning};
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  text-align: center;
  padding: 8px 10px;
  transform: rotate(45deg) translateX(30%) translateY(-80%);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  width: 150px;
`;

const CompanyLogo = styled.div`
  height: 140px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"
      : "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)"};

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;
const CompanyName = styled.h3`
  margin: 0;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.3rem;
`;
const CompanyDescription = styled.p`
  margin-top: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.5;
`;

const ClientHomeComponent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Obtener accesos del usuario y convertir a mayúsculas para comparación
  const userAccess = user?.EMPRESAS || [];

  const handleCardClick = (empresa) => {
    navigate(`/catalogo/${empresa.nombre}`);
  };

  return (
    <PageContainer>
      <PageTitle>Nuestras Empresas</PageTitle>

      <h2>Todas las Empresas</h2>
      <CompaniesGrid>
        {empresas.map((empresa) => {
          // Verificar si el usuario tiene acceso (comparando en mayúsculas)
          const hasAccess = userAccess.includes(empresa.nombre.toUpperCase());

          return (
            <CompanyCard
              key={empresa.id}
              onClick={() => handleCardClick(empresa)}
            >
              <AccessRibbon>
                <RibbonContent $hasAccess={hasAccess}>
                  {hasAccess ? "ACCESO" : "SIN ACCESO"}
                </RibbonContent>
              </AccessRibbon>

              <CompanyLogo>
                <img src={empresa.logo} alt={`Logo de ${empresa.nombre}`} />
              </CompanyLogo>
              <CardBody>
                <CompanyName>{empresa.nombre}</CompanyName>
                <CompanyDescription>{empresa.descripcion}</CompanyDescription>
              </CardBody>
              <CardFooter>
                <ProductCount>{empresa.products} productos</ProductCount>
                <ViewButton>
                  {hasAccess ? "Ver catálogo" : "Solicitar acceso"}
                </ViewButton>
              </CardFooter>
            </CompanyCard>
          );
        })}
      </CompaniesGrid>
    </PageContainer>
  );
};

export default ClientHomeComponent;
