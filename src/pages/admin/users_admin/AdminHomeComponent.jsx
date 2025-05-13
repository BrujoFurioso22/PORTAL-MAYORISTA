import { useState, useEffect } from "react";
import styled from "styled-components";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useAppTheme } from "../../../context/AppThemeContext";
import { useAuth } from "../../../context/AuthContext";
import RenderIcon from "../../../components/ui/RenderIcon";
import {
  users_create,
  users_getAll,
  users_update,
} from "../../../services/users/users";
import { roles_getAll } from "../../../services/users/roles";

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

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
`;

const SearchContainer = styled.div`
  display: flex;
  flex: 1;
  max-width: 500px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px;
  padding-left: 40px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textLight};
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 500;
`;

const TableBody = styled.tbody`
  background-color: ${({ theme }) => theme.colors.surface};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const TableCell = styled.td`
  padding: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${({ status, theme }) =>
    status === "active"
      ? theme.colors.success + "33"
      : status === "pending"
      ? theme.colors.warning + "33"
      : status === "inactive"
      ? theme.colors.error + "33"
      : theme.colors.border};
  color: ${({ status, theme }) =>
    status === "active"
      ? theme.colors.success
      : status === "pending"
      ? theme.colors.warning
      : status === "inactive"
      ? theme.colors.error
      : theme.colors.textLight};
`;

const ActionsGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary + "22"};
  }

  &.delete {
    color: ${({ theme }) => theme.colors.error};

    &:hover {
      background-color: ${({ theme }) => theme.colors.error + "22"};
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 1.5rem;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  width: 100%;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const AdminHomeComponent = () => {
  const { theme } = useAppTheme();
  const { user } = useAuth();

  // Estados
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [roles, setRoles] = useState([]);

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Estado para formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  // Cargar datos iniciales
  useEffect(() => {
    // Aquí se cargarían los usuarios desde la API
    const fetchData = async () => {
      const response = await users_getAll();

      if (response.success) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        toast.error(response.message || "Error al cargar usuarios");
      }

      // Cargar roles
      const rolesResponse = await roles_getAll();
      if (rolesResponse.success) {
        setRoles(rolesResponse.data);
      } else {
        toast.error(rolesResponse.message || "Error al cargar roles");
      }
    };
    fetchData();
  }, []);

  // Filtrar usuarios
  useEffect(() => {
    let result = users;

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.NAME_USER.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.EMAIL.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de rol
    if (roleFilter !== "todos") {
      result = result.filter(
        (user) => user.ROLE_USER.toString() === roleFilter.toString()
      );
    }

    setFilteredUsers(result);
    setCurrentPage(1); // Resetear a primera página al filtrar
  }, [users, searchTerm, roleFilter]);

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Manejadores para modales
  const handleOpenCreateModal = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.NAME_USER,
      email: user.EMAIL,
      role: user.ROLE_USER, // Guardar el ID del rol
      password: "",
      confirmPassword: "",
    });
    setIsEditModalOpen(true);
  };
  const handleOpenDeleteModal = (user) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentUser(null);
  };

  // Manejadores para formularios
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Actualizar el manejador de roles para un solo rol
  const handleRoleChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      role: value,
    });
  };

  // Funciones CRUD
  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (!formData.role) {
      toast.error("Debes seleccionar un rol");
      return;
    }

    // Aquí se enviaría la petición a la API
    // Por ahora simulamos la creación
    const newUser = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: parseInt(formData.role),
    };

    const response = await users_create(newUser);
    if (!response.success) {
      toast.error(response.message || "Error al crear usuario");
      return;
    }

    // Recargar la lista de usuarios para obtener los datos actualizados
    const fetchUsers = async () => {
      const response = await users_getAll();
      if (response.success) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    };
    await fetchUsers();

    toast.success("Usuario creado correctamente");
    handleCloseModals();
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    // Validaciones
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (!formData.role) {
      toast.error("Debes seleccionar un rol");
      return;
    }

    // Preparar datos para la API
    const userData = {
      id: currentUser.ID_USER,
      name: formData.name,
      email: formData.email,
      role: parseInt(formData.role),
    };

    // Solo incluir contraseña si se ha ingresado una nueva
    if (formData.password) {
      userData.password = formData.password;
    }
    try {
      // Llamar al servicio de actualización
      const response = await users_update(userData);

      if (!response.success) {
        toast.error(response.message || "Error al actualizar usuario");
        return;
      }

      // Recargar lista de usuarios para obtener datos actualizados
      const fetchUsers = async () => {
        const response = await users_getAll();
        if (response.success) {
          setUsers(response.data);
          setFilteredUsers(response.data);
        }
      };
      await fetchUsers();

      toast.success("Usuario actualizado correctamente");
      handleCloseModals();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      toast.error("Ocurrió un error al actualizar el usuario");
    }
  };

  const handleDeleteUser = () => {
    // Aquí se enviaría la petición a la API
    // Por ahora simulamos la eliminación
    const updatedUsers = users.filter(
      (user) => user.ID_USER !== currentUser.ID_USER
    );
    setUsers(updatedUsers);
    toast.success("Usuario eliminado correctamente");
    handleCloseModals();
  };

  return (
    <PageContainer>
      <PageTitle>Administración de Usuarios</PageTitle>

      <ActionsContainer>
        <div style={{ display: "flex", gap: "16px" }}>
          <SearchContainer>
            <SearchIcon>
              <RenderIcon name={"Search"} library={4} size={14} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>

          <FiltersContainer>
            <FilterSelect
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="todos">Todos los roles</option>
              {roles.map((role) => (
                <option key={role.ID_ROLE} value={role.ID_ROLE.toString()}>
                  {role.NAME_ROLE}
                </option>
              ))}
            </FilterSelect>
          </FiltersContainer>
        </div>

        <Button
          text="Nuevo Usuario"
          leftIconName="UserPlus"
          leftIconLibrary={4}
          onClick={handleOpenCreateModal}
          backgroundColor={theme.colors.primary}
        />
      </ActionsContainer>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Nombre</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Rol</TableHeaderCell>
            <TableHeaderCell>Acciones</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {currentUsers.length > 0 ? (
            currentUsers.map((user) => (
              <TableRow key={user.ID_USER}>
                <TableCell>{user.NAME_USER}</TableCell>
                <TableCell>{user.EMAIL}</TableCell>
                <TableCell>{user.ROLE_NAME || user.ROLE}</TableCell>
                {/* <TableCell>
                  <StatusBadge status={user.status}>
                    {user.status === "active"
                      ? "Activo"
                      : user.status === "pending"
                      ? "Pendiente"
                      : "Inactivo"}
                  </StatusBadge>
                </TableCell> */}
                <TableCell>
                  <ActionsGroup>
                    <ActionButton
                      title="Editar usuario"
                      onClick={() => handleOpenEditModal(user)}
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton
                      className="delete"
                      title="Eliminar usuario"
                      onClick={() => handleOpenDeleteModal(user)}
                    >
                      <FaTrash />
                    </ActionButton>
                  </ActionsGroup>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} style={{ textAlign: "center" }}>
                No se encontraron usuarios con los filtros seleccionados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {filteredUsers.length > usersPerPage && (
        <Pagination>
          <PageButton
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            Primera
          </PageButton>
          <PageButton
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </PageButton>

          {/* Botones de página */}
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            // Lógica para mostrar páginas alrededor de la actual
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <PageButton
                key={pageNum}
                $active={currentPage === pageNum}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </PageButton>
            );
          })}

          <PageButton
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Siguiente
          </PageButton>
          <PageButton
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Última
          </PageButton>
        </Pagination>
      )}

      {/* Modal para crear usuario */}
      {isCreateModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Crear Nuevo Usuario</ModalTitle>
              <CloseButton onClick={handleCloseModals}>&times;</CloseButton>
            </ModalHeader>

            <form onSubmit={handleCreateUser}>
              <FormRow>
                <FormGroup>
                  <Input
                    label="Nombre completo"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    label="Correo electrónico"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <label>Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    marginTop: "8px",
                  }}
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map((role) => (
                    <option key={role.ID_ROLE} value={role.ID_ROLE.toString()}>
                      {role.NAME_ROLE}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Input
                    label="Contraseña"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    label="Confirmar contraseña"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </FormGroup>
              </FormRow>

              <ButtonGroup>
                <Button
                  text="Cancelar"
                  variant="outlined"
                  onClick={handleCloseModals}
                />
                <Button
                  text="Crear Usuario"
                  type="submit"
                  backgroundColor={theme.colors.primary}
                />
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal para editar usuario */}
      {isEditModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Editar Usuario</ModalTitle>
              <CloseButton onClick={handleCloseModals}>&times;</CloseButton>
            </ModalHeader>

            <form onSubmit={handleUpdateUser}>
              <FormRow>
                <FormGroup>
                  <Input
                    label="Nombre completo"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    label="Correo electrónico"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <label>Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    marginTop: "8px",
                  }}
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map((role) => (
                    <option key={role.ID_ROLE} value={role.ID_ROLE.toString()}>
                      {role.NAME_ROLE}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Input
                    label="Nueva contraseña (opcional)"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    label="Confirmar contraseña"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </FormGroup>
              </FormRow>

              <ButtonGroup>
                <Button
                  text="Cancelar"
                  variant="outlined"
                  onClick={handleCloseModals}
                />
                <Button
                  text="Guardar Cambios"
                  type="submit"
                  backgroundColor={theme.colors.primary}
                />
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal para eliminar usuario */}
      {isDeleteModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Eliminar Usuario</ModalTitle>
              <CloseButton onClick={handleCloseModals}>&times;</CloseButton>
            </ModalHeader>

            <p>
              ¿Estás seguro de que deseas eliminar al usuario{" "}
              <strong>{currentUser?.NAME_USER}</strong>?
            </p>
            <p>Esta acción no se puede deshacer.</p>

            <ButtonGroup>
              <Button
                text="Cancelar"
                variant="outlined"
                onClick={handleCloseModals}
              />
              <Button
                text="Eliminar Usuario"
                backgroundColor={theme.colors.error}
                onClick={handleDeleteUser}
              />
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

export default AdminHomeComponent;
