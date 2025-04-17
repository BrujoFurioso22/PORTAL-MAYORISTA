import React, { useEffect, useState } from "react";
import { columsTablePopsa } from "./columsPOPSA";
import {
  popsa_get_data_popsa,
  popsa_update_data_popsa,
} from "../../services/spancop/popsa";
import {
  spancop_get_data_dropdowns,
  spancop_get_data_spancop,
} from "../../services/spancop/spancop";
import {
  callReport_get_data_callReport_by_id_popsa,
  callReport_insert_data_callReport,
  callReport_update_data_callReport,
} from "../../services/spancop/callReport";
import { columnsSPANCOPdef, columsCallReportdef } from "./columsSPANCOP";
import FlexBoxComponent from "../../components/common/FlexBox";
import CustomTable from "../../components/ui/Table";
import RowDetailsModal from "../../components/ui/RowDetailsModal";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { RESOURCES } from "../../constants/resourcesAndActions";

const POPSA = () => {
  const { user } = useAuth();

  const [spancopColumns, setSpancopColumns] = useState([]);

  const [popsaData, setPopsaData] = useState([]);
  const [selectedPopsaData, setSelectedPopsaData] = useState(null);

  const [callReportOpen, setCallReportOpen] = useState(false);
  const [selectedCallReportData, setSelectedCallReportData] = useState(null);
  const [spancopData, setSpancopData] = useState([]);

  const [combinedData, setCombinedData] = useState([]);

  const combinarDataPopsaYSpancop = (popsaData, spancopData) => {
    return popsaData.map((popsaItem) => {
      // Busca el objeto correspondiente en spancopData usando CODIGO_DATOS_SPANCOP
      const spancopItem = spancopData.find(
        (spancop) =>
          spancop.CODIGO_DATOS_SPANCOP === popsaItem.CODIGO_DATOS_SPANCOP
      );

      // Obtener el label de la empresa a partir del valor
      const empresaColumn = spancopColumns.find(
        (col) => col.field === "EMPRESA"
      );
      let empresaLabel = spancopItem?.EMPRESA || ""; // Valor por defecto si no se encuentra
      console.log(empresaColumn);

      if (empresaColumn && empresaColumn.options) {
        const option = empresaColumn.options.find(
          (opt) => opt.value === spancopItem?.EMPRESA
        );
        if (option) {
          empresaLabel = option.label;
        }
      }

      // Devuelve un nuevo objeto combinando los datos de popsaItem y spancopItem
      return {
        ...popsaItem,
        EMPRESA: empresaLabel || "", // Agrega EMPRESA si existe
        USUARIO: user.NOMBRE_USUARIO || "",
      };
    });
  };

  const obtenerDataSPANCOPDropdowns = async () => {
    const res_data_dropdowns = await spancop_get_data_dropdowns();
    mapCatalogosToColumns(res_data_dropdowns.data.valoresCatalogos || []);
  };

  const mapCatalogosToColumns = (valoresCatalogos) => {
    const mapping = {
      empresa: "EMPRESA",
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

  const obtenerDataPopsa = async () => {
    const res_data_popsa = await popsa_get_data_popsa();
    console.log(res_data_popsa.data.datosPopsa);

    setPopsaData(res_data_popsa.data.datosPopsa || []);
  };

  const obtenerDataSPANCOP = async () => {
    const res_data_principal = await spancop_get_data_spancop();
    setSpancopData(res_data_principal.data.datosSpancop || []);
  };

  const obtenerDataCallReport = async (id, cliente, fecha) => {
    const res_data_callreport =
      await callReport_get_data_callReport_by_id_popsa(id);

    if (res_data_callreport.success) {
      const data_call_report = res_data_callreport.data.callReport;
      const new_data_call_report = {
        ...data_call_report,
        FECHA: fecha || null,
        CLIENTE: cliente || null,
      };
      setSelectedCallReportData(new_data_call_report || []);
    } else {
      setSelectedCallReportData([]);
    }
  };

  const handleSavePopsa = async (row) => {
    const res = await popsa_update_data_popsa(row);
    await obtenerDataPopsa();

    if (res && !res.error) {
      return row;
    }
    return null;
  };

  const handleSaveCallReport = async (row) => {
    const res = row.CODIGO_CALL_REPORT
      ? await callReport_update_data_callReport(row)
      : await callReport_insert_data_callReport(row);

    if (res && !res.error) {
      toast.success("Call Report guardado correctamente");
      return row.CODIGO_CALL_REPORT ? row : res.data.callReport;
    }
    toast.error("Error al guardar el Call Report");
    return null;
  };

  useEffect(() => {
    obtenerDataSPANCOP();
    obtenerDataPopsa();
    obtenerDataSPANCOPDropdowns();
  }, []);

  useEffect(() => {
    // Combina los datos cuando popsaData o spancopData cambien
    if (popsaData.length > 0 && spancopData.length > 0) {
      const combined = combinarDataPopsaYSpancop(popsaData, spancopData);
      setCombinedData(combined);
    }
  }, [popsaData, spancopData]);

  return (
    <FlexBoxComponent
      flexDirection="column"
      alignItems="center"
      style={{ fontSize: 20 }}
    >
      <span>POPSA</span>
      <FlexBoxComponent>
        <CustomTable
          resource={RESOURCES.POPSA}
          columns={columsTablePopsa}
          data={combinedData}
          setSelectedData={setSelectedPopsaData}
          setData={setPopsaData}
          onSave={handleSavePopsa}
          onCloseModal={obtenerDataPopsa}
          showAddButton={false}
          defaultSort={{ field: "CODIGO_DATOS_POPSA", order: "asc" }}
          rowsPerPageOptions={[7, 15, 25, 50]}
          initialRowsPerPage={7}
          height="100%"
          idName={"CODIGO_DATOS_POPSA"}
          emptyMessage="No se encontraron registros"
          additionalModalButton={selectedPopsaData?.CODIGO_DATOS_POPSA}
          additionalModalButtonLabel="CALL REPORT"
          additionalModalButtonAction={async () => {
            await obtenerDataCallReport(
              selectedPopsaData?.CODIGO_DATOS_POPSA,
              selectedPopsaData?.EMPRESA,
              selectedPopsaData?.FECHA_PROPUESTA
            );
            setCallReportOpen(true);
          }}
          columsModal={1}
          excel
          fileNameExcel={`POSPA REPORT`}
          pdf
          pdfFileName={`POSPA REPORT`}
          pdfTitle={`POSPA REPORT`}
        />
        {callReportOpen && (
          <RowDetailsModal
            modalTitle="CALL REPORT"
            id={selectedCallReportData?.CODIGO_CALL_REPORT}
            onClose={() => setCallReportOpen(false)}
            open={callReportOpen}
            columnsConfig={columsCallReportdef}
            rowData={selectedCallReportData}
            onSave={async (rowData) => {
              const newRowData = {
                ...rowData,
                CODIGO_DATOS_POPSA: selectedPopsaData.CODIGO_DATOS_POPSA,
              };
              console.log(newRowData);
              await handleSaveCallReport(newRowData);
            }}
            columnCount={1}
          />
        )}
      </FlexBoxComponent>
    </FlexBoxComponent>
  );
};

export default POPSA;
