import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useAppTheme } from "../../context/AppThemeContext";
import FlexBoxComponent from "../common/FlexBox";
import { useState } from "react";
import {
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
  FaHistory,
} from "react-icons/fa";
import { ROLES } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import RenderIcon from "../ui/RenderIcon";

const HeaderContainer = styled.header`
  width: 100%;
  padding: 0.5rem 1rem;
  padding-right: 2rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  z-index: 10;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
`;

const Logo = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white};
`;

const SearchBar = styled.div`
  flex-grow: 1;
`;

const IconButton = styled(Button)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 1rem;
  position: relative;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const CartCount = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.7rem;
  font-weight: bold;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserMenuDropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 4px;
  box-shadow: 0 2px 10px ${({ theme }) => theme.colors.shadow};
  width: 200px;
  z-index: 100;
  overflow: hidden;
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
`;

const UserMenuItem = styled.div`
  padding: 0.8rem 1rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;

  svg {
    margin-right: 10px;
    font-size: 1rem;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const UserGreeting = styled.div`
  font-size: 0.9rem;
  margin-right: 0.5rem;
  display: none;

  @media (min-width: 576px) {
    display: block;
  }
`;

export default function Header() {
  const { user, isClient, isVisualizacion, logout } = useAuth();
  const { itemCount } = useCart();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  // Función para manejar la búsqueda en todas las empresas
  const handleSearchAllCompanies = () => {
    navigate("/search");
  };

  const handleGoToCart = () => {
    navigate("/carrito");
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const handleOrderHistory = () => {
    navigate("/mis-pedidos");
    setIsUserMenuOpen(false);
  };
  const handleProfile = () => {
    navigate("/perfil");
    setIsUserMenuOpen(false);
  };

  return (
    <HeaderContainer>
      <FlexBoxComponent
        width="auto"
        alignItems="center"
        style={{ gap: "1rem" }}
      >
        <Logo onClick={handleGoToHome}>PORTAL MAYORISTA</Logo>
      </FlexBoxComponent>

      <SearchBar>
        <Button
          text="Buscar en todas las empresas"
          variant="outlined"
          leftIconName="FaSearch"
          onClick={handleSearchAllCompanies}
          fullWidth={true}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "20px",
            padding: "0.5rem 1rem",
            fontSize: "0.9rem",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
            },
          }}
        />
      </SearchBar>

      <FlexBoxComponent
        width="auto"
        alignItems="center"
        justifyContent="flex-end"
      >
        <UserGreeting>Hola, {user?.NAME_USER}</UserGreeting>

        {isClient && !isVisualizacion && (
          <IconButton
            text={itemCount > 0 && <CartCount>{itemCount}</CartCount>}
            leftIconName={"FaShoppingCart"}
            iconSize={18}
            onClick={handleGoToCart}
          />
        )}

        <UserMenu>
          <IconButton
            onClick={toggleUserMenu}
            iconSize={16}
            leftIconName={"FaUser"}
          />

          <UserMenuDropdown $isOpen={isUserMenuOpen}>
            <UserMenuItem onClick={handleProfile}>
              <RenderIcon name="FaUser" size={16} />
              Perfil
            </UserMenuItem>

            {isClient && !isVisualizacion && (
              <UserMenuItem onClick={handleOrderHistory}>
                <RenderIcon name="FaHistory" size={16} />
                Mis Pedidos
              </UserMenuItem>
            )}

            <UserMenuItem onClick={toggleTheme}>
              <RenderIcon name={isDarkMode ? "FaSun" : "FaMoon"} size={16} />
              Cambiar a tema {isDarkMode ? "claro" : "oscuro"}
              <div style={{ marginLeft: "auto", display: "none" }}>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={(e) => {
                    // Detener la propagación para evitar que se active dos veces el toggleTheme
                    e.stopPropagation();
                    toggleTheme();
                  }}
                />
              </div>
            </UserMenuItem>
            <UserMenuItem onClick={handleLogout}>
              <RenderIcon name="FaSignOutAlt" size={16} />
              Cerrar Sesión
            </UserMenuItem>
          </UserMenuDropdown>
        </UserMenu>
      </FlexBoxComponent>
    </HeaderContainer>
  );
}
