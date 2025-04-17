import React, { useEffect, useState } from "react";
import FlexBoxComponent from "../../components/common/FlexBox";
import CustomTable from "../../components/ui/Table";
import RowDetailsModal from "../../components/ui/RowDetailsModal";
import {
  spancop_get_data_dropdowns,
  spancop_get_data_observaciones,
  spancop_get_data_observaciones_by_id_spancop,
  spancop_get_data_spancop,
  spancop_insert_data_observaciones,
  spancop_insert_data_spancop,
  spancop_update_data_observaciones,
  spancop_update_data_spancop,
} from "../../services/spancop/spancop";
import {
  columnsSPANCOPdef,
  columsCallReportdef,
  columsObservacionesdef,
  columsPopsadef,
} from "./columsSPANCOP";
import {
  popsa_get_data_popsa_by_id_spancop,
  popsa_insert_data_popsa,
  popsa_update_data_popsa,
} from "../../services/spancop/popsa";
import ItemListModal from "../../components/ui/ItemListModal";
import {
  callReport_get_data_callReport_by_id_popsa,
  callReport_insert_data_callReport,
  callReport_update_data_callReport,
} from "../../services/spancop/callReport";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { RESOURCES } from "../../constants/resourcesAndActions";

const SPANCOP = () => {
  const { user } = useAuth();
  const [spancopData, setSpancopData] = useState(null);
  const [selectedSpancopData, setSelectedSpancopData] = useState(null);
  const [spancopColumns, setSpancopColumns] = useState([]);

  const [mostratPopsaList, setMostrarPopsaList] = useState(false);
  const [popsaData, setPopsaData] = useState(null);
  const [selectedPopsaData, setSelectedPopsaData] = useState(null);
  const [popsaOpen, setPopsaOpen] = useState(false);

  const [callReportOpen, setCallReportOpen] = useState(false);
  const [selectedCallReportData, setSelectedCallReportData] = useState(false);

  const [observacionesData, setObservacionesData] = useState(null);
  const [observacionesOpen, setObservacionesOpen] = useState(false);

  const [selectedObservacionData, setSelectedObservacionData] = useState(null);
  const [mostrarObservacionItem, setMostrarObservacionItem] = useState(false);

  const applyDefaultValues = (columns, data) => {
    const updatedData = { ...data };
    columns.forEach((col) => {
      if (
        (updatedData[col.field] === null ||
          updatedData[col.field] === undefined) &&
        col.defaultValue !== undefined
      ) {
        updatedData[col.field] = col.defaultValue; // Asigna el valor por defecto
      }
    });
    return updatedData;
  };

  const mapCatalogosToColumns = (valoresCatalogos) => {
    const mapping = {
      ceduladeventa: "CEDULA_VENTA",
      estadofinal: "ESTADO_FINAL",
      tiponegocio: "TIPO_NEGOCIO",
      sector: "SECTOR",
      empresa: "EMPRESA",
      segmento: "SEGMENTO",
      grupoproducto: "GRUPO_PRODUCTO",
      tipooportunidad: "TIPO_OPORTUNIDAD",
      probabilidaddeexito: "PROBABILIDAD_EXITO",
    };


    const updatedColumns = columnsSPANCOPdef.map((col) => {
      const key = Object.keys(mapping).find((k) => mapping[k] === col.field);
      if (key && valoresCatalogos[key]) {
        return {
          ...col,
          options: valoresCatalogos[key],
        };
      }
      return col;
    });
    console.log(updatedColumns);

    setSpancopColumns(updatedColumns);
  };

  const obtenerDataSPANCOP = async () => {
    const res_data_principal = await spancop_get_data_spancop();
    const data = res_data_principal.data.datosSpancop || [];

    if (data.length > 0) {
      data.forEach((item) => {
        item.DISTRIBUIDOR = "MAXXIMUNDO";
      });
    }

    setSpancopData(data);
  };

  const obtenerDataSPANCOPDropdowns = async () => {
    const res_data_dropdowns = await spancop_get_data_dropdowns();
    mapCatalogosToColumns(res_data_dropdowns.data.valoresCatalogos || []);
  };

  const obtenerDataPopsaList = async (id) => {
    const res_list_popsa = await popsa_get_data_popsa_by_id_spancop(id);
    setPopsaData(res_list_popsa.data.datosPopsa || []);
  };

  const obtenerDataCallReport = async (id, cliente, fecha, objetivo) => {
    const res_data_callreport =
      await callReport_get_data_callReport_by_id_popsa(id);
    console.log(res_data_callreport);

    if (res_data_callreport.success) {
      const data_call_report = res_data_callreport.data.callReport;

      // Obtener el label de la empresa a partir del valor
      const empresaColumn = spancopColumns.find(
        (col) => col.field === "EMPRESA"
      );
      let empresaLabel = cliente;
      console.log(empresaColumn);

      if (empresaColumn && empresaColumn.options) {
        const option = empresaColumn.options.find(
          (opt) => opt.value === cliente
        );
        if (option) {
          empresaLabel = option.label;
        }
      }
      const new_data_call_report = {
        ...data_call_report,
        FECHA: fecha || null,
        CLIENTE: empresaLabel || null,
        OBJETIVO_PREVIO: objetivo || null,
      };
      setSelectedCallReportData(new_data_call_report || []);
    } else {
      setSelectedCallReportData([]);
    }
  };

  const obtenerDataSPANCOPObervacionesByID = async (id) => {
    const res_data_observaciones =
      await spancop_get_data_observaciones_by_id_spancop(id);
    console.log(res_data_observaciones);

    setObservacionesData(res_data_observaciones.data.observaciones || []);
  };

  const handleSaveSpancop = async (row) => {
    // Aplica valores por defecto
    const rowWithDefaults = applyDefaultValues(spancopColumns, row);
    console.log(rowWithDefaults);

    const res = rowWithDefaults.CODIGO_DATOS_SPANCOP
      ? await spancop_update_data_spancop(rowWithDefaults)
      : await spancop_insert_data_spancop(rowWithDefaults);

    console.log(res);

    if (res && !res.error) {
      return rowWithDefaults.CODIGO_DATOS_SPANCOP
        ? res.data.updatedDatosSpancop
        : res.data.datosSpancop;
    }

    return null;
  };

  const handleSaveSpancop_Observacion = async (row) => {
    // Aplica valores por defecto
    const rowWithDefaults = applyDefaultValues(columsObservacionesdef, row);

    const res = rowWithDefaults.CODIGO_OBSERVACIONES
      ? await spancop_update_data_observaciones(rowWithDefaults)
      : await spancop_insert_data_observaciones(rowWithDefaults);

    if (res && !res.error) {
      return rowWithDefaults.CODIGO_OBSERVACIONES
        ? rowWithDefaults
        : res.data.observaciones;
    }

    return null;
  };

  const handleSavePopsa = async (row) => {
    // Aplica valores por defecto
    const rowWithDefaults = applyDefaultValues(columsPopsadef, row);

    const res = rowWithDefaults.CODIGO_DATOS_POPSA
      ? await popsa_update_data_popsa(rowWithDefaults)
      : await popsa_insert_data_popsa(rowWithDefaults);

    if (res && !res.error) {
      return rowWithDefaults.CODIGO_DATOS_POPSA
        ? rowWithDefaults
        : res.data.datosPopsa;
    }

    return null;
  };

  const handleSaveCallReport = async (row) => {
    // Aplica valores por defecto
    const rowWithDefaults = applyDefaultValues(columsCallReportdef, row);

    const res = rowWithDefaults.CODIGO_CALL_REPORT
      ? await callReport_update_data_callReport(rowWithDefaults)
      : await callReport_insert_data_callReport(rowWithDefaults);

    if (res && !res.error) {
      return rowWithDefaults.CODIGO_CALL_REPORT
        ? rowWithDefaults
        : res.data.callReport;
    }

    return null;
  };

  useEffect(() => {
    obtenerDataSPANCOP();
    obtenerDataSPANCOPDropdowns();
  }, []);

  return (
    <FlexBoxComponent
      flexDirection="column"
      alignItems="center"
      style={{ fontSize: 20 }}
    >
      <span>SPANCOP</span>
      <CustomTable
        resource={RESOURCES.SPANCOP}
        columns={spancopColumns}
        data={spancopData}
        setSelectedData={setSelectedSpancopData}
        setData={setSpancopData}
        onSave={handleSaveSpancop}
        defaultSort={{ field: "CODIGO_DATOS_SPANCOP", order: "asc" }}
        rowsPerPageOptions={[7, 15, 25, 50]}
        initialRowsPerPage={7}
        height="100%"
        idName={"CODIGO_DATOS_SPANCOP"}
        emptyMessage="No se encontraron registros"
        defaultNewValues={{
          DISTRIBUIDOR: "MAXXIMUNDO",
          VENDEDOR: user.NOMBRE_USUARIO,
          ID_VENDEDOR: user.CODIGO_USUARIO,
        }}
        additionalModalButton={selectedSpancopData?.CODIGO_DATOS_SPANCOP}
        additionalModalButtonLabel="POPSA"
        additionalModalButtonAction={async () => {
          await obtenerDataPopsaList(selectedSpancopData?.CODIGO_DATOS_SPANCOP);
          setMostrarPopsaList(true);
        }}
        additionalModalButton2={selectedSpancopData?.CODIGO_DATOS_SPANCOP}
        additionalModalButtonLabel2={"Observaciones"}
        additionalModalButtonAction2={async () => {
          await obtenerDataSPANCOPObervacionesByID(
            selectedSpancopData?.CODIGO_DATOS_SPANCOP
          );
          setObservacionesOpen(true);
        }}
        filterableFields={[
          { field: "ESTADO_FINAL", multiple: false },
          { field: "VENDEDOR", multiple: false },
        ]}
        excel
        fileNameExcel="SPANCOP_REPORT"
      />
      {observacionesOpen && (
        <ItemListModal
          open={observacionesOpen}
          onClose={() => setObservacionesOpen(false)}
          title="Lista Observaciones"
          items={observacionesData}
          idField="TITULO"
          displayFields={["CODIGO_OBSERVACIONES", "FECHA"]}
          onItemClick={(item) => {
            const newData = {
              ...item,
            };
            setSelectedObservacionData(newData);
            setMostrarObservacionItem(true);
          }}
          showAddButton
          onAddNew={() => {
            const newData = {
              CODIGO_DATOS_SPANCOP: selectedSpancopData?.CODIGO_DATOS_SPANCOP,
            };
            setSelectedObservacionData(newData);
            setMostrarObservacionItem(true);
          }}
          sortField="FECHA"
          sortOrder="desc"
          // validacionItemDerecha="CODIGO_CALL_REPORT"
          // textoFalso="SIN CALL REPORT"
          // textoVerdadero="CONCALL REPORT"
        />
      )}
      {mostrarObservacionItem && (
        <RowDetailsModal
          modalTitle="Observación"
          id={selectedObservacionData?.CODIGO_OBSERVACIONES}
          onClose={() => setMostrarObservacionItem(false)}
          open={mostrarObservacionItem}
          columnsConfig={columsObservacionesdef}
          rowData={selectedObservacionData}
          onSave={async (rowData) => {
            const newRowData = {
              ...rowData,
              CODIGO_DATOS_SPANCOP: selectedSpancopData.CODIGO_DATOS_SPANCOP,
            };
            const res = await handleSaveSpancop_Observacion(newRowData);
            console.log(res);

            if (res) {
              toast.success("Observación guardada exitosamente");
            } else {
              toast.error("Error al guardar la observación");
            }
            await obtenerDataSPANCOPObervacionesByID(
              selectedSpancopData?.CODIGO_DATOS_SPANCOP
            );
          }}
          columnCount={1}
        />
      )}
      {mostratPopsaList && (
        <ItemListModal
          open={mostratPopsaList}
          onClose={() => setMostrarPopsaList(false)}
          title="Lista POPSA"
          items={popsaData}
          idField="FECHA_PROPUESTA"
          displayFields={["CODIGO_DATOS_POPSA", "PROPOSITO", "OBJETIVO"]}
          onItemClick={(item) => {
            // Obtener el label de la empresa a partir del valor
            const empresaColumn = spancopColumns.find(
              (col) => col.field === "EMPRESA"
            );
            let empresaLabel = selectedSpancopData?.EMPRESA;
            console.log(empresaColumn);

            if (empresaColumn && empresaColumn.options) {
              const option = empresaColumn.options.find(
                (opt) => opt.value === selectedSpancopData?.EMPRESA
              );
              if (option) {
                empresaLabel = option.label;
              }
            }
            const newData = {
              ...item,
              EMPRESA: empresaLabel,
              USUARIO: selectedSpancopData?.VENDEDOR,
            };
            setSelectedPopsaData(newData);
            setPopsaOpen(true);
          }}
          showAddButton
          onAddNew={() => {
            // Obtener el label de la empresa a partir del valor
            const empresaColumn = spancopColumns.find(
              (col) => col.field === "EMPRESA"
            );
            let empresaLabel = selectedSpancopData?.EMPRESA;
            console.log(empresaColumn);

            if (empresaColumn && empresaColumn.options) {
              const option = empresaColumn.options.find(
                (opt) => opt.value === selectedSpancopData?.EMPRESA
              );
              if (option) {
                empresaLabel = option.label;
              }
            }
            const newData = {
              EMPRESA: empresaLabel || "",
              USUARIO: user.NOMBRE_USUARIO,
            };
            setSelectedPopsaData(newData);
            setPopsaOpen(true);
          }}
          sortField="FECHA_PROPUESTA"
          validacionItemDerecha="CODIGO_CALL_REPORT"
          textoFalso="SIN CALL REPORT"
          textoVerdadero="CON CALL REPORT"
        />
      )}
      {popsaOpen && (
        <RowDetailsModal
          modalTitle="POPSA"
          id={selectedPopsaData?.CODIGO_DATOS_POPSA}
          onClose={() => setPopsaOpen(false)}
          open={popsaOpen}
          columnsConfig={columsPopsadef}
          rowData={selectedPopsaData}
          onSave={async (rowData) => {
            const newRowData = {
              ...rowData,
              CODIGO_DATOS_SPANCOP: selectedSpancopData.CODIGO_DATOS_SPANCOP,
            };
            const res = await handleSavePopsa(newRowData);
            if (res) {
              toast.success("POPSA guardada exitosamente");
            } else {
              toast.error("Error al guardar el POPSA");
            }
            await obtenerDataPopsaList(
              selectedSpancopData?.CODIGO_DATOS_SPANCOP
            );
          }}
          additionalButton={selectedPopsaData?.CODIGO_DATOS_POPSA}
          additionalButtonLabel="Call Report"
          additionalButtonAction={async () => {
            await obtenerDataCallReport(
              selectedPopsaData?.CODIGO_DATOS_POPSA,
              selectedSpancopData?.EMPRESA,
              selectedPopsaData?.FECHA_PROPUESTA,
              selectedPopsaData?.OBJETIVO
            );
            setCallReportOpen(true);
          }}
          columnCount={1}
          pdf
          pdfFileName={`POPSA_${selectedPopsaData?.CODIGO_DATOS_POPSA}`}
          pdfTitle={`Reporte | POPSA ${selectedPopsaData?.CODIGO_DATOS_POPSA}`}
        />
      )}
      {callReportOpen && (
        <RowDetailsModal
          modalTitle="CALL REPORT"
          id={selectedCallReportData?.CODIGO_CALL_REPORT}
          onClose={() => setCallReportOpen(false)}
          open={callReportOpen}
          columnsConfig={columsCallReportdef}
          rowData={selectedCallReportData}
          onSave={async (rowData) => {
            console.log(rowData);
            // return;

            const newRowData = {
              ...rowData,
              CODIGO_DATOS_POPSA: selectedPopsaData.CODIGO_DATOS_POPSA,
            };
            console.log(newRowData);
            const res = await handleSaveCallReport(newRowData);
            if (res) {
              toast.success("CALL REPORT guardada exitosamente");
            } else {
              toast.error("Error al guardar el CALL REPORT");
            }
          }}
          columnCount={1}
          pdf
          pdfFileName={`CALL_REPORT_${selectedCallReportData?.CODIGO_CALL_REPORT}`}
          pdfTitle={`Reporte | CALL REPORT ${selectedCallReportData?.CODIGO_CALL_REPORT}`}
        />
      )}
    </FlexBoxComponent>
  );
};

export default SPANCOP;
