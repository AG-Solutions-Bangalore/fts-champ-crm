import { PANEL_UPDATE_FILE_FOLDER } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useApiMutation } from "@/hooks/use-mutation";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const FileView = () => {
  const { state } = useLocation();
  const fileUrl = state?.fileUrl ?? "";
  const fileName = state?.fileName ?? "";
  const folderUnique = state?.id ?? "";
  const navigate = useNavigate();
  const [sheets, setSheets] = useState([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [modifiedCells, setModifiedCells] = useState({});
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    row: null,
    col: null,
    type: null,
  });

  const { trigger: updateFileTrigger, loading: isLoading } = useApiMutation();
  const trimmedName = fileName?.replace(/\.[^/.]+$/, "");

  useEffect(() => {
    const fetchExcel = async () => {
      if (!folderUnique || !fileName) {
        alert("Missing file or folder ID");
        return;
      }
      try {
        const res = await fetch(fileUrl);
        const buffer = await res.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });

        const parsedSheets = workbook.SheetNames.map((name) => ({
          name,
          data: XLSX.utils.sheet_to_json(workbook.Sheets[name], {
            header: 1,
            defval: "",
          }),
        }));

        setSheets(parsedSheets);
        setCurrentSheetIndex(0);
        setModifiedCells({});
      } catch (err) {
        console.error("Error reading Excel file:", err);
        toast.error("Failed to load file.");
      }
    };

    fetchExcel();
  }, [fileUrl]);

  const updateSheetData = (newData) => {
    const updated = [...sheets];
    updated[currentSheetIndex].data = newData;
    setSheets(updated);
  };

  /** ✏️ Handle cell edit */
  const handleCellChange = (ri, ci, value) => {
    const updatedData = [...sheets[currentSheetIndex].data];
    if (!updatedData[ri]) updatedData[ri] = [];
    updatedData[ri][ci] = value;

    updateSheetData(updatedData);
    setModifiedCells((prev) => ({
      ...prev,
      [currentSheetIndex]: {
        ...(prev[currentSheetIndex] || {}),
        [`${ri}-${ci}`]: true,
      },
    }));
  };

  /** ➕➖ Row & Column Modification */
  const modifyRow = (index, type) => {
    const data = [...sheets[currentSheetIndex].data];
    const cols = data[0]?.length || 0;

    if (type === "addAbove") data.splice(index, 0, new Array(cols).fill(""));
    if (type === "addBelow")
      data.splice(index + 1, 0, new Array(cols).fill(""));
    if (type === "delete" && index !== 0) data.splice(index, 1);

    updateSheetData(data);
  };

  const modifyColumn = (index, type) => {
    const data = [...sheets[currentSheetIndex].data];
    data.forEach((row) => {
      if (type === "addLeft") row.splice(index, 0, "");
      if (type === "addRight") row.splice(index + 1, 0, "");
      if (type === "delete") row.splice(index, 1);
    });
    updateSheetData(data);
  };

  /** 💾 Save file changes */
  const handleSave = async () => {
    if (!folderUnique || !fileName) {
      toast.error("Missing file or folder ID");
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();
      sheets.forEach((sheet) => {
        const worksheet = XLSX.utils.aoa_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
      });

      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const formData = new FormData();
      formData.append("file_folder_unique", folderUnique);
      formData.append("file_name", blob, fileName);
      formData.append("folder_file_name", trimmedName);

      const res = await updateFileTrigger({
        url: PANEL_UPDATE_FILE_FOLDER,
        method: "post",
        data: formData,
      });

      const { code, message } = res || {};
      if (code === 201) {
        toast.success(message || "File updated successfully");
        navigate(-1, { state: { shouldRefetch: true } });
      } else {
        toast.error(message || "Failed to update file");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Error saving the file");
    }
  };

  /** 🧱 Current sheet data */
  const currentSheet = sheets[currentSheetIndex];
  const rows = currentSheet?.data || [];
  const headers = rows[0] || [];

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          File Viewer
        </h2>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>

      {/* Sheet Tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {sheets.map((sheet, idx) => (
          <button
            key={sheet.name}
            onClick={() => setCurrentSheetIndex(idx)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              currentSheetIndex === idx
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {sheet.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[calc(100vh-180px)] border rounded-md shadow bg-white">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="w-12 text-center bg-gray-50"></th>
              {headers.map((header, i) => {
                const key = `0-${i}`;
                const isModified = modifiedCells[currentSheetIndex]?.[key];
                return (
                  <th
                    key={i}
                    className={`border px-2 py-1 text-left ${
                      isModified ? "bg-red-200" : ""
                    }`}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({
                        visible: true,
                        x: e.clientX,
                        y: e.clientY,
                        row: null,
                        col: i,
                        type: "header",
                      });
                    }}
                  >
                    <input
                      value={header}
                      onChange={(e) => handleCellChange(0, i, e.target.value)}
                      className="w-full bg-transparent font-medium text-gray-600 focus:outline-none"
                    />
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.slice(1).map((row, ri) => {
              const actualRow = ri + 1;
              return (
                <tr key={ri} className="even:bg-gray-50">
                  <td className="text-center text-gray-500 bg-gray-100">
                    {actualRow}
                  </td>
                  {headers.map((_, ci) => {
                    const key = `${actualRow}-${ci}`;
                    const isModified = modifiedCells[currentSheetIndex]?.[key];
                    return (
                      <td
                        key={ci}
                        className={`border px-2 py-1 ${
                          isModified ? "bg-red-200" : ""
                        }`}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({
                            visible: true,
                            x: e.clientX,
                            y: e.clientY,
                            row: actualRow,
                            col: ci,
                            type: "body",
                          });
                        }}
                      >
                        <input
                          value={row[ci] ?? ""}
                          onChange={(e) =>
                            handleCellChange(actualRow, ci, e.target.value)
                          }
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Context Menu */}
        {contextMenu.visible && (
          <Popover
            open={contextMenu.visible}
            onOpenChange={() =>
              setContextMenu({ ...contextMenu, visible: false })
            }
          >
            <PopoverTrigger asChild>
              <div
                style={{
                  position: "fixed",
                  top: contextMenu.y,
                  left: contextMenu.x,
                  width: 1,
                  height: 1,
                }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-52 p-2 space-y-1 text-sm">
              {contextMenu.type === "body" && (
                <>
                  <button
                    onClick={() => modifyRow(contextMenu.row, "addAbove")}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100"
                  >
                    ➕ Add Row Above
                  </button>
                  <button
                    onClick={() => modifyRow(contextMenu.row, "addBelow")}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100"
                  >
                    ➕ Add Row Below
                  </button>
                  <button
                    onClick={() => modifyRow(contextMenu.row, "delete")}
                    className="w-full text-left px-2 py-1 text-red-500 hover:bg-gray-100"
                  >
                    🗑️ Delete Row
                  </button>
                  <hr />
                </>
              )}
              {(contextMenu.type === "body" ||
                contextMenu.type === "header") && (
                <>
                  <button
                    onClick={() => modifyColumn(contextMenu.col, "addLeft")}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100"
                  >
                    ➕ Add Column Left
                  </button>
                  <button
                    onClick={() => modifyColumn(contextMenu.col, "addRight")}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100"
                  >
                    ➕ Add Column Right
                  </button>
                  <button
                    onClick={() => modifyColumn(contextMenu.col, "delete")}
                    className="w-full text-left px-2 py-1 text-red-500 hover:bg-gray-100"
                  >
                    🗑️ Delete Column
                  </button>
                </>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </>
  );
};

export default FileView;
