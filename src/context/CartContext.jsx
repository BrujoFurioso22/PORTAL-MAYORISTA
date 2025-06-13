import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { ROLES } from "../constants/roles";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // Intentar obtener el carrito del localStorage al iniciar
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [cartTotal, setCartTotal] = useState(0);
  const { user } = useAuth(); // Obtener el usuario actual

  // Verificar si el usuario es admin o coordinadora
  const isAdminOrCoord = () => {
    if (!user || !user.ROLE) return false;
    return user.ROLE === ROLES.ADMIN || user.ROLE === ROLES.COORDINADOR;
  };

  useEffect(() => {
    // Guardar carrito en localStorage cada vez que cambia
    localStorage.setItem("cart", JSON.stringify(cart));

    // Actualizar el total del carrito
    const total = cart.reduce((sum, item) => {
      const itemPrice = item.price * (1 - (item.discount || 0) / 100);
      return sum + itemPrice * item.quantity;
    }, 0);

    setCartTotal(total);
  }, [cart]);

  // Agregar producto al carrito con verificación de rol
  const addToCart = (product, quantity = 1) => {
    // Si el usuario es admin o coordinadora, no permitir añadir al carrito
    if (isAdminOrCoord()) {
      console.warn(
        "Administradores y coordinadores no pueden realizar compras"
      );
      return {
        success: false,
        message: "Tu rol no permite realizar compras en el sistema",
      };
    }

    console.log("CartContext - Añadiendo:", product.id, "cantidad:", quantity);

    setCart((prevCart) => {
      // Buscar si el producto ya está en el carrito
      const existingProductIndex = prevCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingProductIndex >= 0) {
        // Si el producto ya existe, crear una nueva copia del carrito
        const updatedCart = [...prevCart];
        // Actualizar solo la cantidad del producto existente
        updatedCart[existingProductIndex] = {
          ...updatedCart[existingProductIndex],
          quantity: updatedCart[existingProductIndex].quantity + quantity,
        };
        return updatedCart;
      } else {
        // Si es un producto nuevo, añadirlo al carrito
        return [...prevCart, { ...product, quantity }];
      }
    });

    return {
      success: true,
      message: "Producto añadido al carrito",
    };
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Limpiar todo el carrito
  const clearCart = () => {
    setCart([]);
  };

  const removeItemsByCompany = (companyId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.empresaId !== companyId)
    );
  };

  const value = {
    cart,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    removeItemsByCompany,
    itemCount: cart.reduce((count, item) => count + item.quantity, 0),
    isAdminOrCoord: isAdminOrCoord(), // Exportar esta función para usar en componentes
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
