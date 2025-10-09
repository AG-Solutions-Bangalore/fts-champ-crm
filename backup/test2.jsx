import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building, ChevronDown, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import BASE_URL from "@/config/base-url";

const ChapterSelection = () => {
  const userType = Cookies.get("user_type_id");

  const [selectedChapterName, setSelectedChapterName] = useState("All Chapter");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  const {
    data: chapters = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["chapters"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/api/fetch-profile-chapter`, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      return res.data.chapter || [];
    },
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000, 
    refetchOnMount: false, 
    refetchOnWindowFocus: false, 
    refetchOnReconnect: false, 
  });

  //  Restore from cookies or fetch once if needed
  useEffect(() => {
    const storedName = Cookies.get("selected_chapter_name");
    const viewerChapterIds = Cookies.get("viewer_chapter_ids");

    if (storedName) {
      setSelectedChapterName(storedName);
    } else if (viewerChapterIds && chapters.length === 0) {

      refetch();
    }
  }, [refetch, chapters.length]);

  // Filter chapters based on search
  const filteredChapters = (chapters || []).filter((c) =>
    c.chapter_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Select chapter mutation
  const selectChapterMutation = useMutation({
    mutationFn: async (id) =>
      axios.post(
        `${BASE_URL}/api/update-profile-chapter`,
        { viewer_chapter_ids: id },
        { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
      ),
    onSuccess: (res, id) => {
      const selected = (chapters || []).find((it) => it.id === id);
      if (res.data?.code === 200) {
        if (selected) {
          Cookies.set("selected_chapter_name", selected.chapter_name, {
            expires: 7,
          });
          setSelectedChapterName(selected.chapter_name);
        }
        toast.success(res.data.msg || "Updated", { position: "bottom-right" });
        setIsDropdownOpen(false);
        setSearchTerm("");
        setTimeout(() => {
            window.location.reload();
          }, 0);
      } else {
        toast.error(res.data?.msg || "Unexpected Error", {
          position: "bottom-right",
        });
      }
    },
    onError: () =>
      toast.error("Something went wrong. Please try again.", {
        position: "bottom-right",
      }),
  });

  // ✅ Clear chapter mutation
  const clearChapterMutation = useMutation({
    mutationFn: async () =>
      axios.post(
        `${BASE_URL}/api/update-profile-chapter-clear`,
        { viewer_chapter_ids: "1" },
        { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
      ),
    onSuccess: (res) => {
      if (res.data?.code === 200) {
        Cookies.remove("selected_chapter_name");
        setSelectedChapterName("All Chapter");
        toast.success(res.data.msg || "Cleared", { position: "bottom-right" });
        setIsDropdownOpen(false);
        setSearchTerm("");
        setTimeout(() => {
            window.location.reload();
          }, 0);
      } else {
        toast.error(res.data?.msg || "Unexpected Error", {
          position: "bottom-right",
        });
      }
    },
    onError: () =>
      toast.error("Something went wrong. Please try again.", {
        position: "bottom-right",
      }),
  });


  const handleOpenChange = (open) => {
    setIsDropdownOpen(open);
    if (open) {
  
      if (chapters.length === 0) {
        refetch();
      }
      setSearchTerm("");
    } else {
      setSearchTerm("");
    }
  };


  if (userType !== "4" && userType !== "5") return null;

  return (
    <header className="mr-2">
      <div className="flex items-center justify-between w-full">
        <div className="relative">
          <DropdownMenu open={isDropdownOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button
                className="flex items-center space-x-2 px-3 py-1.5  font-medium rounded-lg border  text-sm transition-colors"
              >
                <Building className="h-4 w-4 " />
                <span className="truncate max-w-[120px]">
                  {selectedChapterName}
                </span>
                <ChevronDown
                  className={`h-4 w-4  transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56  rounded-lg shadow-lg border  z-50 overflow-hidden p-2"
            >
          

              {selectedChapterName !== "All Chapter" && (
                <Button
                  onClick={() => clearChapterMutation.mutate()}
                  disabled={clearChapterMutation.isLoading}
                  className="w-full px-3 py-1.5 text-sm font-medium  rounded mt-2"
                >
                  {clearChapterMutation.isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    "Clear Selection"
                  )}
                </Button>
              )}

              {selectedChapterName === "All Chapter" && (
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-2 h-4 w-4 " />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search chapters..."
                    className="pl-8 pr-2 py-1.5 text-sm border  rounded focus:outline-none focus:ring-1 "
                  />
                </div>
              )}

              <div className="max-h-60 overflow-y-auto mt-2">
                {isFetching && chapters.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-center">
                    Loading chapters...
                  </p>
                ) : filteredChapters.length > 0 ? (
                  <ul className="space-y-1">
                    {filteredChapters.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() =>
                            selectChapterMutation.mutate(item.id)
                          }
                          disabled={
                            selectChapterMutation.isLoading || selectedChapterName === item.chapter_name
                          }
                          className={`w-full text-left px-3 py-1.5 text-sm rounded ${
                            selectedChapterName === item.chapter_name
                              ? "bg-[var(--color-light)] text-[var(--color)] font-medium"
                              : "text-[var(--color)] hover:bg-[var(--color-light)]"
                          }`}
                        >
                          {item.chapter_name}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-2 text-sm text-gray-500 text-center">
                    {searchTerm ? "No chapters found" : "No chapters available"}
                  </p>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default ChapterSelection;

//sajid