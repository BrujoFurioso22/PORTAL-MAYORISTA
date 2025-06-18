import { useState } from "react";
import styled from "styled-components";
import { useAppTheme } from "../../../context/AppThemeContext";
import Button from "../../../components/ui/Button";
import { toast } from "react-toastify";

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`;

const CardTitle = styled.h2`
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.text};
`;

const PhoneItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-bottom: 12px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const PhoneInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PhoneNumber = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PhoneType = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const PhoneActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const PriorityBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  fontSize: 0.75rem;
  font-weight: 500;
  white-space: nowrap;

  ${({ $priority, theme }) => {
    if ($priority === "principal") {
      return `
        background-color: ${theme.colors.success + "20"};
        color: ${theme.colors.success};
        border: 1px solid ${theme.colors.success + "40"};
      `;
    } else if ($priority === "alternativo") {
      return `
        background-color: ${theme.colors.info + "20"};
        color: ${theme.colors.info};
        border: 1px solid ${theme.colors.info + "40"};
      `;
    }
    return "";
  }}
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
`;

const InfoMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.info + "15"};
  border: 1px solid ${({ theme }) => theme.colors.info + "33"};
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.info};
  font-size: 0.9rem;
`;

const Telefonos = () => {
  const { theme } = useAppTheme();

  const [telefonos, setTelefonos] = useState([
    { id: 1, numero: "+593 99 123 4567", tipo: "Móvil", prioridad: "principal" },
    { id: 2, numero: "+593 2 234 5678", tipo: "Oficina", prioridad: "alternativo" },
    { id: 3, numero: "+593 99 876 5432", tipo: "Casa", prioridad: null },
  ]);

  const handleSetPrioridad = (phoneId, nuevaPrioridad) => {
    setTelefonos((prevTelefonos) => {
      return prevTelefonos.map((tel) => {
        // Si estamos asignando una prioridad que ya existe, primero la quitamos del teléfono actual
        if (tel.prioridad === nuevaPrioridad) {
          return { ...tel, prioridad: null };
        }
        // Asignamos la nueva prioridad al teléfono seleccionado
        if (tel.id === phoneId) {
          return { ...tel, prioridad: nuevaPrioridad };
        }
        return tel;
      });
    });

    const mensaje =
      nuevaPrioridad === "principal"
        ? "Teléfono principal actualizado"
        : "Teléfono alternativo actualizado";

    toast.success(mensaje);
  };

  const handleRemovePrioridad = (phoneId) => {
    setTelefonos((prevTelefonos) =>
      prevTelefonos.map((tel) => (tel.id === phoneId ? { ...tel, prioridad: null } : tel))
    );
    toast.info("Prioridad removida del teléfono");
  };

  const telefonoPrincipal = telefonos.find((tel) => tel.prioridad === "principal");
  const telefonoAlternativo = telefonos.find((tel) => tel.prioridad === "alternativo");

  return (
    <Card>
      <CardTitle>Mis Teléfonos</CardTitle>

      <InfoMessage>
        <strong>Gestión de prioridades:</strong> Puedes establecer un teléfono como
        <strong> Principal</strong> y otro como <strong> Alternativo</strong>.
        Estos serán utilizados para contactarte en caso de ser necesario.
      </InfoMessage>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <span style={{ color: theme.colors.textLight, fontSize: "0.9rem" }}>
          {telefonos.length} teléfono{telefonos.length !== 1 ? "s" : ""} registrado{telefonos.length !== 1 ? "s" : ""}
        </span>
      </div>

      {telefonos.length > 0 ? (
        telefonos.map((telefono) => (
          <PhoneItem key={telefono.id}>
            <PhoneInfo>
              <PhoneNumber>
                {telefono.numero}
                {telefono.prioridad && (
                  <PriorityBadge $priority={telefono.prioridad}>
                    {telefono.prioridad === "principal" ? "Principal" : "Alternativo"}
                  </PriorityBadge>
                )}
              </PhoneNumber>
            </PhoneInfo>

            <PhoneActions>
              {/* Botón para hacer Principal */}
              {telefono.prioridad !== "principal" && (
                <Button
                  text={telefonoPrincipal ? "Hacer principal" : "Hacer principal"}
                  size="small"
                  variant="outlined"
                  onClick={() => handleSetPrioridad(telefono.id, "principal")}
                  disabled={false}
                />
              )}

              {/* Botón para hacer Alternativo */}
              {telefono.prioridad !== "alternativo" && (
                <Button
                  text={telefonoAlternativo ? "Hacer alternativo" : "Hacer alternativo"}
                  size="small"
                  variant="outlined"
                  onClick={() => handleSetPrioridad(telefono.id, "alternativo")}
                  disabled={false}
                />
              )}

              {/* Botón para remover prioridad */}
              {telefono.prioridad && (
                <Button
                  text="Quitar prioridad"
                  size="small"
                  variant="text"
                  onClick={() => handleRemovePrioridad(telefono.id)}
                  style={{
                    color: theme.colors.textLight,
                    fontSize: "0.8rem",
                  }}
                />
              )}
            </PhoneActions>
          </PhoneItem>
        ))
      ) : (
        <EmptyState>No tienes teléfonos registrados.</EmptyState>
      )}

     
    </Card>
  );
};

export default Telefonos;
