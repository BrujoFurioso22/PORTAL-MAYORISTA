import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
  Pagination,
  PageButton,
} from "../../styles/TableStyles";

/**
 * Componente de tabla de datos reutilizable
 * @param {Object} props - Props del componente
 * @param {Array} props.columns - Definición de columnas
 * @param {Array} props.data - Datos a mostrar
 * @param {string} props.emptyMessage - Mensaje cuando no hay datos
 * @param {Object} props.pagination - Configuración de paginación (opcional)
 * @param {Function} props.rowActions - Función para renderizar acciones por fila (opcional)
 * @param {boolean} props.bordered - Si la tabla debe tener bordes completos (opcional)
 * @param {boolean} props.striped - Si las filas deben tener colores alternados (opcional)
 * @param {Function} props.onRowClick - Función que se ejecuta al hacer clic en una fila (opcional)
 */
const DataTable = ({
  columns,
  data = [],
  emptyMessage = "No hay datos disponibles",
  pagination,
  rowActions,
  bordered = false,
  striped = true,
  onRowClick,
}) => {
  if (!data || data.length === 0) {
    return (
      <EmptyState>
        <h3>No se encontraron registros</h3>
        <p>{emptyMessage}</p>
      </EmptyState>
    );
  }

  return (
    <>
      <Table $bordered={bordered}>
        <TableHeader>
          <tr>
            {columns.map((column, index) => (
              <TableHeaderCell
                key={index}
                width={column.width}
                $align={column.align}
              >
                {column.header}
              </TableHeaderCell>
            ))}
            {rowActions && (
              <TableHeaderCell width="120px">Acciones</TableHeaderCell>
            )}
          </tr>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              $striped={striped}
              $clickable={!!onRowClick}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} $align={column.align}>
                  {column.render ? column.render(row) : row[column.field]}
                </TableCell>
              ))}
              {rowActions && (
                <TableCell $align="center">{rowActions(row)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <Pagination>
          <PageButton
            onClick={() => pagination.onPageChange(1)}
            disabled={pagination.currentPage === 1}
            text={"Primera"}
          />
          <PageButton
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            text={"Anterior"}
          />

          {Array.from({ length: Math.min(pagination.totalPages, 5) }).map(
            (_, i) => {
              // Lógica para mostrar páginas alrededor de la actual
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 3) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.currentPage - 2 + i;
              }

              return (
                <PageButton
                  key={pageNum}
                  $active={pagination.currentPage === pageNum}
                  onClick={() => pagination.onPageChange(pageNum)}
                  text={pageNum}
                />
              );
            }
          )}

          <PageButton
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            text={"Siguiente"}
          />
          <PageButton
            onClick={() => pagination.onPageChange(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
            text={"Última"}
          />
        </Pagination>
      )}
    </>
  );
};

export default DataTable;
