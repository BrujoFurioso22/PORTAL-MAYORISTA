import { useState, useEffect } from "react";
import styled from "styled-components";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAppTheme } from "../../context/AppThemeContext";
import { useAuth } from "../../context/AuthContext";
import RenderIcon from "../../components/ui/RenderIcon";
import DataTable from "../../components/ui/Table";
import {
  users_create,
  users_getAll,
  users_updateRole,
  users_updatePassword,
} from "../../services/users/users";
import { roles_getAll } from "../../services/users/roles";
import RenderLoader from "../../components/ui/RenderLoader";
import { ROLES } from "../../constants/roles";

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

const ActionsGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const ActionButton = styled(Button)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

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
  max-width: 800px;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const UsersAdministration = () => {
  const { theme } = useAppTheme();

  // Estados
  const [users, setUsers] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [roles, setRoles] = useState([]);

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
      try {
        // Cargar roles primero para obtener los IDs de los roles necesarios
        const rolesResponse = await roles_getAll();
        if (rolesResponse.success) {
          setRoles(rolesResponse.data);

          // Encontrar los IDs de los roles cliente y admin
          const clienteRole = rolesResponse.data.find(
            (role) => role.NAME_ROLE === ROLES.CLIENTE
          );

          const adminRole = rolesResponse.data.find(
            (role) => role.NAME_ROLE === ROLES.ADMIN
          );

          if (clienteRole || adminRole) {
            // Ahora cargar los usuarios con rol cliente o admin
            const usersResponse = await users_getAll();
            if (usersResponse.success) {
              const userList = usersResponse.data.filter(
                (user) =>
                  (clienteRole && user.ROLE_USER === clienteRole.ID_ROLE) ||
                  (adminRole && user.ROLE_USER === adminRole.ID_ROLE)
              );

              setUsers(userList);
              setFilteredUsers(userList);
            } else {
              toast.error(usersResponse.message || "Error al cargar usuarios");
            }
          } else {
            toast.error("No se encontraron los roles necesarios en el sistema");
          }
        } else {
          toast.error(rolesResponse.message || "Error al cargar roles");
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Ocurrió un error al cargar los datos");
      }
    };
    fetchData();
  }, []);

  // Filtrar usuarios
  useEffect(() => {
    if (!users) return;
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
  }, [users, searchTerm, roleFilter]);


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

    try {
      let roleUpdated = false;
      let passwordUpdated = false;

      // Verificar si ha cambiado el rol
      if (currentUser.ROLE_USER.toString() !== formData.role.toString()) {
        // Actualizar el rol
        const roleResponse = await users_updateRole(
          currentUser.ID_USER,
          formData.role
        );

        if (!roleResponse.success) {
          toast.error(roleResponse.message || "Error al actualizar el rol");
          return;
        }

        roleUpdated = true;
      }

      // Verificar si hay nueva contraseña
      if (formData.password) {
        // Actualizar la contraseña
        const passwordResponse = await users_updatePassword(
          currentUser.ID_USER,
          formData.password
        );

        if (!passwordResponse.success) {
          toast.error(
            passwordResponse.message || "Error al actualizar la contraseña"
          );
          return;
        }

        passwordUpdated = true;
      }

      // Si no se actualizó nada, mostrar mensaje
      if (!roleUpdated && !passwordUpdated) {
        toast.info("No se realizaron cambios");
        handleCloseModals();
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

  // Definición de columnas para la tabla
  const columns = [
    {
      field: "NAME_USER",
      header: "Nombre",
      render: (row) => row.NAME_USER,
    },
    {
      field: "EMAIL",
      header: "Email",
    },
    {
      field: "ROLE_NAME",
      header: "Rol",
      render: (row) => row.ROLE_NAME || row.ROLE,
    },
    {
      field: "EMPRESAS",
      header: "Empresas asignadas",
      width: "250px",
      render: (row) => {
        let empresas = [];

        if (row.EMPRESAS) {
          if (typeof row.EMPRESAS === "string") {
            empresas = row.EMPRESAS.split(",").map((e) => e.trim());
          } else if (Array.isArray(row.EMPRESAS)) {
            empresas = row.EMPRESAS;
          }
        }

        return empresas.length > 0
          ? empresas.join(", ")
          : "Sin empresas asignadas";
      },
    },
    {
      field: "STATUS_USER",
      header: "Estado",
      render: (row) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: row.STATUS_USER ? theme.colors.success : theme.colors.error,
          }}
        >
          <RenderIcon
            name={row.STATUS_USER ? "FaCheckCircle" : "FaMinusCircle"}
            size={18}
          />
        </div>
      ),
    },
  ];

  // Renderizar acciones por fila
  const renderRowActions = (coordinador) => (
    <ActionsGroup>
      <ActionButton
        title="Editar coordinador"
        onClick={() => handleOpenEditModal(coordinador)}
        leftIconName={"FaEdit"}
      />
      <ActionButton
        title="Eliminar coordinador"
        onClick={() => handleOpenDeleteModal(coordinador)}
        leftIconName={"FaTrash"}
      />
    </ActionsGroup>
  );

  return (
    <PageContainer>
      <PageTitle>Administración de Usuarios</PageTitle>

      <ActionsContainer>
        <div style={{ display: "flex", gap: "16px" }}>
          <SearchContainer>
            <SearchIcon>
              <RenderIcon name={"FaSearch"} size={14} />
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
      </ActionsContainer>

      {users === null ? (
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <RenderLoader
            color={theme.colors.primary}
            showDots={true}
            showSpinner={false}
            text="Cargando usuarios"
            size="20px"
            card={true}
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          emptyMessage="No hay usuarios que coincidan con los criterios de búsqueda."
          rowActions={renderRowActions}
          striped={true}
         
        />
      )}

      {/* Modal para editar usuario */}
      {isEditModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Editar Usuario</ModalTitle>
              <RenderIcon
                name={"FaTimes"}
                size={20}
                onClick={handleCloseModals}
              />
            </ModalHeader>

            <form onSubmit={handleUpdateUser}>
              <FormRow>
                <FormGroup>
                  <Input
                    label="Nombre completo"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={true} // Campo de solo lectura
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
                    disabled={true} // Campo de solo lectura
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

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "0.9rem",
                  color: theme.colors.textLight,
                }}
              >
                Nota: Solo puedes modificar el rol y/o la contraseña del
                usuario.
              </div>

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
              <RenderIcon
                name={"FaTimes"}
                size={20}
                onClick={handleCloseModals}
              />
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

export default UsersAdministration;
