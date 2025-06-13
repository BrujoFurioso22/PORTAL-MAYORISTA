import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/Table";
import { useAppTheme } from "../../context/AppThemeContext";
import { differenceInHours, format, formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { order_getOrdersByAccount } from "../../services/order/order";
import { useAuth } from "../../context/AuthContext";
import { FaSearch } from "react-icons/fa";
import Select from "../../components/ui/Select";

// Mantener los estilos existentes para la página
const PageContainer = styled.div`
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

const MisPedidos = () => {
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 8;

  // Estado para los pedidos
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Traducir estado a español para mostrar
  const translateStatus = (status) => {
    const statusMap = {
      PENDIENTE: "Pendiente",
      EN_PROCESO: "En Proceso",
      ENVIADO: "Enviado",
      ENTREGADO: "Entregado",
      CANCELADO: "Cancelado",
      pendiente: "Pendiente",
      "en-proceso": "En Proceso",
      enviado: "Enviado",
      entregado: "Entregado",
      cancelado: "Cancelado",
    };
    return statusMap[status] || status;
  };

  // Función para mapear el estado de API a los valores que espera el componente
  const mapApiStatus = (apiStatus) => {
    const statusMap = {
      PENDIENTE: "pendiente",
      EN_PROCESO: "en-proceso",
      ENVIADO: "enviado",
      ENTREGADO: "entregado",
      CANCELADO: "cancelado",
    };
    return statusMap[apiStatus] || "pendiente";
  };

  // Función para obtener los pedidos del usuario
  const handleObtainOrders = async () => {
    try {
      setLoading(true);
      const response = await order_getOrdersByAccount(user.ACCOUNT_USER);
      console.log(response);

      if (response.success && response.data) {
        // Transformar los datos de la API al formato que espera nuestro componente
        const formattedOrders = response.data.map((order) => {
          // Calcular el total si está vacío
          const total = order.CABECERA.TOTAL || order.CABECERA.SUBTOTAL;

          // Calcular la cantidad total de items
          const itemsCount = order.DETALLE.reduce(
            (sum, item) => sum + item.QUANTITY,
            0
          );

          return {
            id: order.CABECERA.ID_CART_HEADER,
            date: order.CABECERA.createdAt, // Como no tenemos fecha en el API, usamos la actual
            total: total,
            items: itemsCount,
            status: mapApiStatus(order.CABECERA.STATUS),
            paymentMethod: "Pendiente", // Este dato no viene en la API
            empresaId: order.CABECERA.ENTERPRISE,
            // Guardamos la información original para mostrarla en detalles
            originalData: order,
          };
        });

        setOrders(formattedOrders);
        setError(null);
      } else {
        setError("No se pudieron cargar los pedidos");
      }
    } catch (err) {
      console.error("Error al obtener pedidos:", err);
      setError("Error al obtener los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.ACCOUNT_USER) {
      handleObtainOrders();
    }
  }, [user]);

  // Aplicar filtros a los pedidos
  const filteredOrders = orders.filter((order) => {
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
      !order.empresaId.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Definición de columnas para el DataTable
  const columns = [
    {
      header: "Nº de Pedido",
      field: "id",
      render: (row) => row.id.substring(0, 8) + "...",
    },
    {
      header: "Fecha",
      field: "date",
      dataType: "date",
      render: (row) => {
        const date = new Date(row.date);
        const now = new Date();
        const hoursAgo = differenceInHours(now, date);

        if (hoursAgo >= 1) {
          // Si pasó más de una hora, mostrar fecha y hora completas
          return format(date, "d 'de' MMMM, yyyy HH:mm", { locale: es });
        } else {
          // Si pasó menos de una hora, mostrar tiempo relativo
          return formatDistance(date, now, {
            addSuffix: true, // Añade "hace" al principio
            locale: es,
          });
        }
      },
      sortValue: (row) => new Date(row.date).getTime()
    },
    {
      header: "Proveedor",
      field: "empresaId",
    },
    {
      header: "Total",
      field: "total",
      dataType: "number",
      render: (row) => `$${row.total.toFixed(2)}`,
      align: "right",
    },
    {
      header: "Productos",
      field: "items",
      dataType: "number",
      render: (row) => `${row.items} items`,
      align: "center",
    },
    {
      header: "Estado",
      field: "status",
      render: (row) => (
        <StatusBadge status={row.status}>
          {translateStatus(row.status)}
        </StatusBadge>
      ),
      align: "center",
    },
    {
      header: "Pago",
      field: "paymentMethod",
      sortable: false
    },
  ];

  // Configuración de paginación para el DataTable
  const paginationConfig = {
    currentPage,
    totalPages,
    onPageChange: setCurrentPage,
  };

  // Función para renderizar acciones por fila
  const rowActions = (row) => (
    <Button
      text="Ver detalle"
      variant="outlined"
      size="small"
      onClick={() => navigate(`/mis-pedidos/${row.id}`)}
    />
  );

  const handleViewDetails = (row) => {
    navigate(`/mis-pedidos/${row.id}`);
  };

  const statusOptions = [
    { value: "todos", label: "Todos" },
    { value: "pendiente", label: "Pendiente" },
    { value: "en-proceso", label: "En Proceso" },
    { value: "enviado", label: "Enviado" },
    { value: "entregado", label: "Entregado" },
    { value: "cancelado", label: "Cancelado" },
  ];

  const dateOptions = [
    { value: "todos", label: "Todos" },
    { value: "este-mes", label: "Este mes" },
    { value: "ultimo-mes", label: "Último mes" },
  ];

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Resetear a primera página al cambiar filtro
  };

  // Handler para cambio en select de fecha
  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1); // Resetear a primera página al cambiar filtro
  };

  return (
    <PageContainer>
      <PageTitle>Mis Pedidos</PageTitle>

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>Estado:</FilterLabel>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={handleStatusChange}
            placeholder="Seleccionar estado"
            width="180px"
            name="statusFilter"
          />

          <FilterLabel>Fecha:</FilterLabel>
          <Select
            options={dateOptions}
            value={dateFilter}
            onChange={handleDateChange}
            placeholder="Seleccionar período"
            width="180px"
            name="dateFilter"
          />
        </FilterGroup>

        <div style={{ position: "relative" }}>
          <FaSearch
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: theme.colors.textLight,
            }}
          />
          <SearchInput
            type="text"
            placeholder="Buscar por número o proveedor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "32px" }}
          />
        </div>
      </FiltersContainer>

      {loading ? (
        <NoOrdersContainer>
          <NoOrdersIcon>⏳</NoOrdersIcon>
          <NoOrdersText>Cargando pedidos...</NoOrdersText>
        </NoOrdersContainer>
      ) : error ? (
        <NoOrdersContainer>
          <NoOrdersIcon>⚠️</NoOrdersIcon>
          <NoOrdersText>{error}</NoOrdersText>
          <Button
            text="Intentar nuevamente"
            variant="outlined"
            onClick={handleObtainOrders}
          />
        </NoOrdersContainer>
      ) : filteredOrders.length > 0 ? (
        <DataTable
          columns={columns}
          data={currentOrders}
          emptyMessage="No se encontraron pedidos con los filtros seleccionados"
          pagination={paginationConfig}
          rowActions={rowActions}
          bordered={false}
          striped={true}
          onRowClick={handleViewDetails}
          initialSortField="date"
          initialSortDirection="desc"
        />
      ) : (
        <NoOrdersContainer>
          <NoOrdersIcon>📦</NoOrdersIcon>
          <NoOrdersText>
            {searchTerm || statusFilter !== "todos" || dateFilter !== "todos"
              ? "No se encontraron pedidos con los filtros seleccionados"
              : "No tienes pedidos registrados aún"}
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
