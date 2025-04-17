import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { empresas } from "../mock/products";
import { useAppTheme } from "../context/AppThemeContext";

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${(props) =>
    props.theme.colors.background}; // Añadir fondo explícito
`;

const PageTitle = styled.h1`
  margin-bottom: 2rem;
  text-align: center;
  color: ${(props) => props.theme.colors.text};
`;

const CompaniesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
`;

const CompanyCard = styled.div`
  border-radius: ${(props) =>
    props.theme.borders.radius.lg}; // Corregir referencia a borders.radius
  box-shadow: ${(props) =>
    props.theme.shadows.md}; // Corregir referencia a shadows
  background-color: ${(props) =>
    props.theme.colors.surface}; // Usar surface en lugar de "white" fijo
  color: ${(props) =>
    props.theme.colors.text}; // Añadir color de texto explícito
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${(props) => props.theme.shadows.lg}; // Usar sombra del tema
  }

  ${(props) =>
    !props.hasAccess &&
    `
    opacity: 0.7;
    position: relative;
    
    &:after {
      content: 'Solicitar acceso';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: ${props.theme.colors.overlay}; // Usar color de overlay del tema
      color: ${props.theme.colors.white}; // Usar white del tema
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &:hover:after {
      opacity: 1;
    }
  `}
`;

const CompanyLogo = styled.img`
  width: 100%;
  height: 180px;
  object-fit: contain;
  padding: 1rem;
  background-color: ${(props) =>
    props.theme.colors.white}; // Fondo blanco para logos
`;

const CompanyInfo = styled.div`
  padding: 1rem;
  border-top: 1px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) =>
    props.theme.colors.surface}; // Asegurar contraste
`;

const CompanyName = styled.h3`
  margin: 0;
  color: ${(props) => props.theme.colors.text};
`;

const CompanyDescription = styled.p`
  color: ${(props) => props.theme.colors.textLight};
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const Home = () => {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const navigate = useNavigate();

  // Obtener accesos del usuario
  const userAccess = user?.BUSSINES_ACCESS || [];

  const handleCardClick = (empresaId) => {
      navigate(`/catalogo/${empresaId}`);
    // if (userAccess.includes(empresaId)) {
    // } else {
    //   navigate(`/solicitar-acceso/${empresaId}`);
    // }
  };

  return (
    <PageContainer>
      <PageTitle>Nuestras Empresas</PageTitle>

      <CompaniesGrid>
        {empresas.map((empresa) => (
          <CompanyCard
            key={empresa.id}
            hasAccess={userAccess.includes(empresa.id)}
            onClick={() => handleCardClick(empresa.id)}
            theme={theme} // Asegurar que el tema se pasa a las plantillas literales
          >
            <CompanyLogo src={empresa.logo} alt={`Logo de ${empresa.nombre}`} />
            <CompanyInfo>
              <CompanyName>{empresa.nombre}</CompanyName>
              <CompanyDescription>{empresa.descripcion}</CompanyDescription>
            </CompanyInfo>
          </CompanyCard>
        ))}
      </CompaniesGrid>
    </PageContainer>
  );
};

export default Home;
