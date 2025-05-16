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
  FaSearch,
  FaSignOutAlt,
  FaHistory,
} from "react-icons/fa";
import { ROLES } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";

const HeaderContainer = styled.header`
  width: 100%;
  padding: 0.5rem 1rem;
  padding-right: 2rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  justify-content: space-between;
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
  position: relative;
  flex-grow: 1;
  max-width: 400px;
  margin: 0 2rem;
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  background-color: rgba(255, 255, 255, 0.2);
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.9rem;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.white};
`;

const IconButton = styled.button`
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

export default function Header({ onToggleSidebar, showSidebarToggle = true }) {
  const { user, logout } = useAuth();
  const { itemCount, isAdminOrCoord } = useCart();
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Agrega esta función para manejar la búsqueda
  const handleSearch = (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Opcionalmente, limpiar el campo después de la búsqueda
    }
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
        {/* Mostrar el botón de sidebar solo cuando sea necesario */}
        {/* {showSidebarToggle && (
          <Button
            leftIconName={"Menu"}
            onClick={onToggleSidebar}
            variant="outlined"
            size="small"
            color={theme.colors.white}
            style={{ border: `solid 1px ${theme.colors.white}` }}
          />
        )} */}
        <Logo onClick={handleGoToHome}>PORTAL MAYORISTA</Logo>
      </FlexBoxComponent>

      <SearchBar>
        <form onSubmit={handleSearch} style={{ width: "100%" }}>
          <SearchInput
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon onClick={handleSearch} style={{ cursor: "pointer" }}>
            <FaSearch />
          </SearchIcon>
        </form>
      </SearchBar>

      <FlexBoxComponent width="auto" alignItems="center">
        <UserGreeting>Hola, {user?.NAME_USER}</UserGreeting>

        {!isAdminOrCoord && (
          <IconButton onClick={handleGoToCart}>
            <FaShoppingCart />
            {itemCount > 0 && <CartCount>{itemCount}</CartCount>}
          </IconButton>
        )}

        <UserMenu>
          <IconButton onClick={toggleUserMenu}>
            <FaUser />
          </IconButton>

          <UserMenuDropdown $isOpen={isUserMenuOpen}>
            <UserMenuItem onClick={handleProfile}>
              <FaUser />
              Perfil
            </UserMenuItem>

            {!isAdminOrCoord && (
              <UserMenuItem onClick={handleOrderHistory}>
                <FaHistory />
                Mis Pedidos
              </UserMenuItem>
            )}

            <UserMenuItem onClick={toggleTheme}>
              {isDarkMode ? "☀️" : "🌙"}
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
              <FaSignOutAlt />
              Cerrar Sesión
            </UserMenuItem>
          </UserMenuDropdown>
        </UserMenu>
      </FlexBoxComponent>
    </HeaderContainer>
  );
}
