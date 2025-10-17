import { DELETE_FILE, DOWNLOAD_FILE, FETCH_FILE_FOLDER } from "@/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGetMutation } from "@/hooks/use-get-mutation";
import { useApiMutation } from "@/hooks/use-mutation";
import {
  Download,
  File,
  FileMinus,
  FileSpreadsheet,
  Loader,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import LoadingFolderCard from "../folder/loading";
const FileList = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemdata, setDeleteItemdata] = useState(null);
  const { trigger: Downloadtrigger, loading: excelloading } = useApiMutation();

  const {
    data: fetchfile,
    isError,
    isFetching,
    refetch,
  } = useGetMutation("fetchfilefolder", FETCH_FILE_FOLDER);
  useEffect(() => {
    if (location.state?.shouldRefetch) {
      refetch();
    }
  }, [location.state]);

  const handleDownloadExcel = async (fileName, e) => {
    e.stopPropagation();
    try {
      const payload = {
        file_folder_unique: id,
        file_name: fileName,
      };

      const response = await Downloadtrigger({
        url: DOWNLOAD_FILE,
        method: "post",
        data: payload,
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error, "error");
      toast.error("Unable to download the file. Please try again later.");
    }
  };

  const handleDeleteFile = (name, e) => {
    e.stopPropagation();
    setDeleteItemdata(name);
    console.log(name);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!id || !deleteItemdata) {
      toast.error("File Name is required");
      return;
    }

    const formData = new FormData();
    formData.append("file_folder_unique", id);
    formData.append("file_name", deleteItemdata);
    try {
      const response = await trigger({
        url: DELETE_FILE,
        method: "post",
        data: formData,
      });

      if (response?.data.code === 200) {
        toast.success(response.msg || "File deleted successfully");
        refetch();
      } else {
        toast.error(response.msg || "Failed to delete file");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete file");
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteItemdata(null);
    }
  };

  if (isError) {
    return (
      <div className="w-full p-4  ">
        <div className="flex items-center justify-center h-64 ">
          <div className="text-center ">
            <div className="text-destructive font-medium mb-2">
              Error Fetching File Data
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-left text-2xl text-gray-800 font-[500]">File</h1>
        {/* <CreateFile id={id} refetch={refetch} /> */}
      </div>
      {isFetching ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingFolderCard index={index} />
          ))}
        </div>
      ) : (
        <>
          {fetchfile.length === 0 ? (
            <h1 className="text-center text-xl text-gray-800 font-[500]">
              No File Available
            </h1>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {fetchfile.map((file) => {
                const fileUrl = file.path;
                const fileName = file.name;
                const ext = file.name.split(".").pop().toLowerCase();

                const isExcel = ext === "xlsx" || ext === "xls";
                const isPdf = ext === "pdf";
                let IconComponent = File;
                let iconColor = "text-gray-500";
                if (isExcel) {
                  IconComponent = FileSpreadsheet;
                  iconColor = "text-green-500";
                } else if (isPdf) {
                  IconComponent = FileMinus;
                  iconColor = "text-red-500";
                }

                return isExcel ? (
                  <div
                    key={file.path}
                    className="flex justify-between items-center border rounded-lg cursor-pointer p-3 shadow-sm hover:shadow-md transition"
                    onClick={() => {
                      navigate(`/file-preview?=${Date.now()}`, {
                        state: {
                          fileUrl: `${fileUrl}?t=${Date.now()}`,
                          fileName,
                          id,
                        },
                      });
                    }}
                  >
                    <div className="flex items-center gap-2 ">
                      <IconComponent className={iconColor} size={24} />
                      <span className="text-gray-700 truncate max-w-[120px]">
                        {file.name.split(".")[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {excelloading ? (
                        <Loader
                          size={18}
                          className="text-blue-500 animate-spin"
                        />
                      ) : (
                        <Download
                          size={18}
                          className="text-gray-400 hover:text-blue-500 cursor-pointer"
                          onClick={(e) => handleDownloadExcel(file.name, e)}
                        />
                      )}

                      <Trash2
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                        size={18}
                        onClick={(e) => handleDeleteFile(file.name, e)}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    key={file.path}
                    className="flex justify-between items-center cursor-pointer border rounded-lg p-3 shadow-sm hover:shadow-md transition"
                  >
                    <a
                      href={fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <IconComponent className={iconColor} size={24} />
                      <span className="text-gray-700 truncate max-w-[120px]">
                        {file.name.split(".")[0]}
                      </span>
                    </a>

                    <Trash2
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                      size={18}
                      onClick={(e) => handleDeleteFile(file.name, e)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FileList;
