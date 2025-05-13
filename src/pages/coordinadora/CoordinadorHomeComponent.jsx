import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaCheck,
  FaTimes,
  FaQuestionCircle,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

// Estilos
const PageContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
`;

const PageTitle = styled.h1`
  margin: 0 0 24px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const FiltersRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

const SearchInputContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  padding-right: 40px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
`;

const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.thead`
  background-color: ${({ theme }) => theme.colors.surface};
`;

const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 600;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  background-color: ${({ theme }) => theme.colors.surface};

  &:nth-child(odd) {
    background-color: ${({ theme }) =>
      theme.mode === "dark"
        ? theme.colors.backgroundAlt
        : theme.colors.backgroundLight};
  }

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.border + "40"}; // 40 = 25% opacity
  }
`;

const TableCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  background-color: ${({ theme, status }) => {
    switch (status) {
      case "pendiente":
        return theme.colors.warning + "33";
      case "en_proceso":
        return theme.colors.info + "33";
      case "en_proceso_observacion":
        return theme.colors.info + "66";
      case "rechazado":
        return theme.colors.error + "33";
      case "cancelado_cliente":
        return theme.colors.error + "66";
      case "completado":
        return theme.colors.success + "33";
      case "despachado":
        return theme.colors.success + "66";
      default:
        return theme.colors.border;
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case "pendiente":
        return theme.colors.warning;
      case "en_proceso":
      case "en_proceso_observacion":
        return theme.colors.info;
      case "rechazado":
      case "cancelado_cliente":
        return theme.colors.error;
      case "completado":
      case "despachado":
        return theme.colors.success;
      default:
        return theme.colors.textLight;
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  font-size: 0.85rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

const AddressAlert = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.warning + "20"};
  border-left: 3px solid ${({ theme }) => theme.colors.warning};
  padding: 8px 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AlertText = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
`;

const AlertActions = styled.div`
  display: flex;
  gap: 8px;
`;

const NewAddressCount = styled.span`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.warning};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.8rem;
  line-height: 20px;
  text-align: center;
  margin-left: 8px;
`;

const NoDataContainer = styled.div`
  padding: 40px;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  margin-top: 20px;
`;

const NoDataMessage = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 0 16px 0;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  gap: 8px;
`;

const PageButton = styled.button`
  padding: 6px 12px;
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.white : theme.colors.text};
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Agregar un nuevo componente styled para el indicador
const AddressIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b; /* Color amarillo/naranja */
  margin-left: 6px;
  cursor: help; /* Muestra cursor de ayuda al pasar sobre él */
  position: relative;

  &:hover::after {
    content: "Revisar dirección";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
  }
`;

// Componente principal
const CoordinadorHomeComponent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [empresaFilter, setEmpresaFilter] = useState("todas");
  const [dateFilter, setDateFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [newAddressesCount, setNewAddressesCount] = useState(0);

  // Empresas a las que tiene acceso la coordinadora
  const empresasAcceso = user?.BUSSINES_ACCESS || [];

  // Mapa de nombres de empresas
  const empresasMap = {
    autollanta: "Autollanta",
    maxximundo: "Maxximundo",
    stox: "Stox",
    ikonix: "Ikonix",
    automax: "Automax",
  };

  // Mapa de estados
  const estadosMap = {
    pendiente: "Pendiente",
    en_proceso: "En proceso",
    en_proceso_observacion: "En proceso (con observación)",
    rechazado: "Rechazado",
    cancelado_cliente: "Cancelado por cliente",
    completado: "Completado",
    despachado: "Despachado",
  };

  // Datos de ejemplo (en un caso real, esto vendría de una API)
  const mockOrders = [
    {
      id: "ORD-2025-1001",
      date: new Date(2025, 3, 15),
      clientName: "Juan Pérez",
      email: "juan@example.com",
      phone: "555-123-4567",
      total: 1250.75,
      items: 8,
      status: "pendiente",
      empresaId: "maxximundo",
      newAddress: true,
    },
    {
      id: "ORD-2025-1002",
      date: new Date(2025, 3, 10),
      clientName: "María López",
      email: "maria@example.com",
      phone: "555-987-6543",
      total: 458.2,
      items: 3,
      status: "en_proceso",
      empresaId: "stox",
      newAddress: false,
    },
    {
      id: "ORD-2025-1003",
      date: new Date(2025, 3, 5),
      clientName: "Carlos Ramírez",
      email: "carlos@example.com",
      phone: "555-456-7890",
      total: 876.5,
      items: 5,
      status: "completado",
      empresaId: "maxximundo",
      newAddress: false,
    },
    {
      id: "ORD-2025-1004",
      date: new Date(2025, 2, 28),
      clientName: "Ana Gómez",
      email: "ana@example.com",
      phone: "555-234-5678",
      total: 2100.0,
      items: 12,
      status: "despachado",
      empresaId: "autollanta",
      newAddress: false,
    },
    {
      id: "ORD-2025-1005",
      date: new Date(2025, 2, 20),
      clientName: "Roberto Silva",
      email: "roberto@example.com",
      phone: "555-876-5432",
      total: 345.8,
      items: 2,
      status: "rechazado",
      empresaId: "stox",
      newAddress: false,
    },
    {
      id: "ORD-2025-1006",
      date: new Date(2025, 2, 15),
      clientName: "Lucía Martínez",
      email: "lucia@example.com",
      phone: "555-765-4321",
      total: 950.25,
      items: 6,
      status: "cancelado_cliente",
      empresaId: "maxximundo",
      newAddress: true,
    },
    {
      id: "ORD-2025-1007",
      date: new Date(2025, 2, 8),
      clientName: "Eduardo Torres",
      email: "eduardo@example.com",
      phone: "555-345-6789",
      total: 540.0,
      items: 4,
      status: "en_proceso_observacion",
      empresaId: "autollanta",
      newAddress: false,
    },
  ];

  // Cargar pedidos
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        // Simulación de carga de datos
        setTimeout(() => {
          // Filtrar pedidos por empresas a las que tiene acceso
          const accessibleOrders = mockOrders.filter((order) =>
            empresasAcceso.includes(order.empresaId)
          );

          setOrders(accessibleOrders);
          setFilteredOrders(accessibleOrders);

          // Contar direcciones nuevas
          const newAddresses = accessibleOrders.filter(
            (order) => order.newAddress
          ).length;
          setNewAddressesCount(newAddresses);

          setLoading(false);
        }, 700);
      } catch (error) {
        console.error("Error al cargar los pedidos:", error);
        setLoading(false);
      }
    };
    console.log("Empresas de acceso:", empresasAcceso);

    loadOrders();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    if (!orders.length) return;

    let result = [...orders];

    // Filtro por empresa
    if (empresaFilter !== "todas") {
      result = result.filter((order) => order.empresaId === empresaFilter);
    }

    // Filtro por estado
    if (statusFilter !== "todos") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Filtro por fecha
    if (dateFilter === "hoy") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter((order) => order.date >= today);
    } else if (dateFilter === "esta_semana") {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      result = result.filter((order) => order.date >= weekStart);
    } else if (dateFilter === "este_mes") {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      result = result.filter((order) => order.date >= monthStart);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(termLower) ||
          order.clientName.toLowerCase().includes(termLower) ||
          order.email.toLowerCase().includes(termLower)
      );
    }

    setFilteredOrders(result);
    setCurrentPage(1); // Resetear página al filtrar
  }, [orders, statusFilter, empresaFilter, dateFilter, searchTerm]);

  // Paginación
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Manejar clic en ver detalle
  const handleViewDetail = (orderId) => {
    navigate(`/coordinador/pedidos/${orderId}`);
  };

  // Confirmar dirección nueva
  const handleConfirmAddress = (orderId) => {
    // Aquí iría la lógica para confirmar la dirección
    alert(`Dirección confirmada para el pedido ${orderId}`);

    // Actualizar el contador de direcciones nuevas
    setNewAddressesCount((prev) => prev - 1);

    // Actualizar el estado de newAddress del pedido
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, newAddress: false } : order
      )
    );
  };

  return (
    <PageContainer>
      <PageTitle>Gestión de Pedidos</PageTitle>

      {newAddressesCount > 0 && (
        <AddressAlert>
          <AlertText>
            Hay {newAddressesCount} pedido{newAddressesCount > 1 ? "s" : ""} con
            direcciones nuevas que requieren confirmación
            <NewAddressCount>{newAddressesCount}</NewAddressCount>
          </AlertText>
        </AddressAlert>
      )}

      <FiltersRow>
        <FilterGroup>
          <FilterLabel>
            <FaFilter /> Empresa:
          </FilterLabel>
          <FilterSelect
            value={empresaFilter}
            onChange={(e) => setEmpresaFilter(e.target.value)}
          >
            <option value="todas">Todas</option>
            {empresasAcceso.map((empresaId) => (
              <option key={empresaId} value={empresaId}>
                {empresasMap[empresaId] || empresaId}
              </option>
            ))}
          </FilterSelect>

          <FilterLabel>Estado:</FilterLabel>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            {Object.entries(estadosMap).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FilterSelect>

          <FilterLabel>Fecha:</FilterLabel>
          <FilterSelect
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="todos">Todas las fechas</option>
            <option value="hoy">Hoy</option>
            <option value="esta_semana">Esta semana</option>
            <option value="este_mes">Este mes</option>
          </FilterSelect>
        </FilterGroup>

        <SearchInputContainer>
          <SearchInput
            type="text"
            placeholder="Buscar por ID, cliente o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
        </SearchInputContainer>
      </FiltersRow>

      {loading ? (
        <NoDataContainer>
          <NoDataMessage>Cargando pedidos...</NoDataMessage>
        </NoDataContainer>
      ) : filteredOrders.length > 0 ? (
        <>
          <OrdersTable>
            <TableHeader>
              <tr>
                <TableHeaderCell>ID Pedido</TableHeaderCell>
                <TableHeaderCell>Fecha</TableHeaderCell>
                <TableHeaderCell>Cliente</TableHeaderCell>
                <TableHeaderCell>Empresa</TableHeaderCell>
                <TableHeaderCell>Total</TableHeaderCell>
                <TableHeaderCell>Items</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
                <TableHeaderCell>Acciones</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {currentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    {format(order.date, "d 'de' MMMM, yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    {order.clientName}
                    <br />
                    <small style={{ color: "#666" }}>{order.email}</small>
                  </TableCell>
                  <TableCell>{empresasMap[order.empresaId]}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status}>
                      {estadosMap[order.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <ActionButtons>
                      <ActionButton
                        title="Ver detalle"
                        onClick={() => handleViewDetail(order.id)}
                      >
                        <FaEye />
                      </ActionButton>
                      {order.newAddress && (
                        <AddressIndicator title="Revisar dirección">
                          <FaQuestionCircle size={16} />
                        </AddressIndicator>
                      )}
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </OrdersTable>

          {totalPages > 1 && (
            <Pagination>
              <PageButton
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </PageButton>

              {[...Array(totalPages).keys()].map((number) => (
                <PageButton
                  key={number + 1}
                  $active={currentPage === number + 1}
                  onClick={() => paginate(number + 1)}
                >
                  {number + 1}
                </PageButton>
              ))}

              <PageButton
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </PageButton>
            </Pagination>
          )}
        </>
      ) : (
        <NoDataContainer>
          <NoDataMessage>
            No se encontraron pedidos que coincidan con los criterios de
            búsqueda.
          </NoDataMessage>
          <Button
            text="Limpiar filtros"
            variant="outlined"
            onClick={() => {
              setStatusFilter("todos");
              setEmpresaFilter("todas");
              setDateFilter("todos");
              setSearchTerm("");
            }}
          />
        </NoDataContainer>
      )}
    </PageContainer>
  );
};

export default CoordinadorHomeComponent;
