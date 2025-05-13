import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useAppTheme } from "../../context/AppThemeContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
`;

const PageTitle = styled.h1`
  margin: 0 0 24px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  width: 200px;
`;

const OrdersContainer = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`;

const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

const TableHeader = styled.thead`
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textLight};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const TableCell = styled.td`
  padding: 16px;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${({ theme, status }) => {
    switch (status) {
      case "pendiente":
        return theme.colors.warning + "33"; // 33 is for opacity
      case "en-proceso":
        return theme.colors.info + "33";
      case "enviado":
        return theme.colors.primary + "33";
      case "entregado":
        return theme.colors.success + "33";
      case "cancelado":
        return theme.colors.error + "33";
      default:
        return theme.colors.border;
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case "pendiente":
        return theme.colors.warning;
      case "en-proceso":
        return theme.colors.info;
      case "enviado":
        return theme.colors.primary;
      case "entregado":
        return theme.colors.success;
      case "cancelado":
        return theme.colors.error;
      default:
        return theme.colors.textLight;
    }
  }};
`;

const NoOrdersContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`;

const NoOrdersIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const NoOrdersText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.textLight};
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
  border: 1px solid ${({ theme }) => theme.colors.border};
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

// Datos de prueba
const mockOrders = [
  {
    id: "ORD-2025-1001",
    date: new Date(2025, 3, 15), // 15 de abril de 2025
    total: 1250.75,
    items: 8,
    status: "entregado",
    paymentMethod: "Transferencia",
    empresaId: "maxximundo",
  },
  {
    id: "ORD-2025-1002",
    date: new Date(2025, 3, 10), // 10 de abril de 2025
    total: 458.2,
    items: 3,
    status: "enviado",
    paymentMethod: "Transferencia",
    empresaId: "stox",
  },
  {
    id: "ORD-2025-1003",
    date: new Date(2025, 3, 5), // 5 de abril de 2025
    total: 876.5,
    items: 5,
    status: "en-proceso",
    paymentMethod: "Crédito",
    empresaId: "maxximundo",
  },
  {
    id: "ORD-2025-1004",
    date: new Date(2025, 2, 28), // 28 de marzo de 2025
    total: 2100.0,
    items: 12,
    status: "entregado",
    paymentMethod: "Transferencia",
    empresaId: "ikonix",
  },
  {
    id: "ORD-2025-1005",
    date: new Date(2025, 2, 20), // 20 de marzo de 2025
    total: 345.8,
    items: 2,
    status: "cancelado",
    paymentMethod: "Crédito",
    empresaId: "stox",
  },
  {
    id: "ORD-2025-1006",
    date: new Date(2025, 2, 15), // 15 de marzo de 2025
    total: 950.25,
    items: 6,
    status: "entregado",
    paymentMethod: "Transferencia",
    empresaId: "maxximundo",
  },
  {
    id: "ORD-2025-1007",
    date: new Date(2025, 2, 8), // 8 de marzo de 2025
    total: 540.0,
    items: 4,
    status: "pendiente",
    paymentMethod: "Pendiente",
    empresaId: "automax",
  },
];

const empresasMap = {
  maxximundo: "Maxximundo",
  stox: "Stox",
  ikonix: "Ikonix",
  automax: "Automax",
};

const MisPedidos = () => {
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Traducir estado a español para mostrar
  const translateStatus = (status) => {
    const statusMap = {
      pendiente: "Pendiente",
      "en-proceso": "En Proceso",
      enviado: "Enviado",
      entregado: "Entregado",
      cancelado: "Cancelado",
    };
    return statusMap[status] || status;
  };

  // Aplicar filtros a los pedidos
  const filteredOrders = mockOrders.filter((order) => {
    // Filtro de estado
    if (statusFilter !== "todos" && order.status !== statusFilter) {
      return false;
    }

    // Filtro de fecha
    if (dateFilter === "este-mes") {
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      if (order.date < firstDayOfMonth) {
        return false;
      }
    } else if (dateFilter === "ultimo-mes") {
      const today = new Date();
      const firstDayLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const firstDayThisMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      if (order.date < firstDayLastMonth || order.date >= firstDayThisMonth) {
        return false;
      }
    }

    // Filtro de búsqueda
    if (
      searchTerm &&
      !order.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !empresasMap[order.empresaId]
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Paginación
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewDetails = (orderId) => {
    // Aquí se navegaría a la página de detalles del pedido
    console.log(`Ver detalles del pedido: ${orderId}`);
    // Por ahora solo mostramos un log, pero aquí iría:
    navigate(`/mis-pedidos/${orderId}`);
    // alert(`Ver detalles del pedido: ${orderId}`);
  };

  return (
    <PageContainer>
      <PageTitle>Mis Pedidos</PageTitle>

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>Estado:</FilterLabel>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en-proceso">En Proceso</option>
            <option value="enviado">Enviado</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </FilterSelect>

          <FilterLabel>Fecha:</FilterLabel>
          <FilterSelect
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="este-mes">Este mes</option>
            <option value="ultimo-mes">Último mes</option>
          </FilterSelect>
        </FilterGroup>

        <SearchInput
          type="text"
          placeholder="Buscar por número o proveedor"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FiltersContainer>

      {filteredOrders.length > 0 ? (
        <>
          <OrdersContainer>
            <OrdersTable>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Nº de Pedido</TableHeaderCell>
                  <TableHeaderCell>Fecha</TableHeaderCell>
                  <TableHeaderCell>Proveedor</TableHeaderCell>
                  <TableHeaderCell>Total</TableHeaderCell>
                  <TableHeaderCell>Productos</TableHeaderCell>
                  <TableHeaderCell>Estado</TableHeaderCell>
                  <TableHeaderCell>Pago</TableHeaderCell>
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
                    <TableCell>{empresasMap[order.empresaId]}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>{order.items} items</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status}>
                        {translateStatus(order.status)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{order.paymentMethod}</TableCell>
                    <TableCell>
                      <Button
                        text="Ver detalle"
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetails(order.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </OrdersTable>
          </OrdersContainer>

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
                  onClick={() => paginate(number + 1)}
                  $active={currentPage === number + 1}
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
        <NoOrdersContainer>
          <NoOrdersIcon>📦</NoOrdersIcon>
          <NoOrdersText>
            No se encontraron pedidos con los filtros seleccionados
          </NoOrdersText>
          {statusFilter !== "todos" || dateFilter !== "todos" || searchTerm ? (
            <Button
              text="Limpiar filtros"
              variant="outlined"
              onClick={() => {
                setStatusFilter("todos");
                setDateFilter("todos");
                setSearchTerm("");
              }}
            />
          ) : (
            <Button
              text="Ir al catálogo"
              variant="solid"
              backgroundColor={theme.colors.primary}
              onClick={() => navigate("/")}
            />
          )}
        </NoOrdersContainer>
      )}
    </PageContainer>
  );
};

export default MisPedidos;
