import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/DataTable";
import MultiSelect from "@/components/common/MultiSelect";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Plus,
  Upload,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  X,
  Columns,
  RefreshCw,
} from "lucide-react";
import { Lead, LeadFilters, FilterOptions } from "@/types/lead";
import { useToast } from "@/hooks/use-toast";
import LeadModal from "@/components/leads/LeadModal";
import DeleteConfirmModal from "@/components/leads/DeleteConfirmModal";
import { leadService } from "@/services/leadService";
import LeadDetailsPanel from "@/components/leads/LeadDetailsPanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { debounce } from "lodash";

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create" | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [selectedLeadForPanel, setSelectedLeadForPanel] = useState<Lead | null>(
    null
  );
  const [filters, setFilters] = useState<LeadFilters>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    designations: [],
    occupations: [],
    states: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        console.log("Searching for:", value);
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page on new search
      }, 500),
    [] // No dependencies - we want to create this only once
  );

  // Cleanup debounce on unmount and when dependencies change
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Update search input when searchTerm changes from outside (e.g., clear filters)
  useEffect(() => {
    if (searchTerm === "") {
      setSearchInput("");
    }
  }, [searchTerm]);
  const { toast } = useToast();
  const [totalLeads, setTotalLeads] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch filter options on component mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        console.log("Fetching filter options...");
        const options = await leadService.getFilterOptions();
        console.log("Filter options received:", options);
        setFilterOptions(options);
      } catch (error) {
        console.error("Failed to load filter options:", error);
        toast({
          title: "Error",
          description:
            "Failed to load filter options. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    loadFilterOptions();
  }, [toast]);

  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({
    name: true,
    email: true,
    phone: true,
    company: true,
    status: true,
    lastContact: true,
    actions: true,
  });

  const leadsPerPage = 10; // Show 7 rows by default, with 1 more on scroll

  const fetchLeads = async (
    page: number = 0,
    filters: LeadFilters = {},
    searchTerm: string = ""
  ) => {
    try {
      console.log("Fetching leads...", { page, filters, searchTerm });
      setLeadsLoading(true);

      const data = await leadService.searchLeads({
        name: filters.name,
        designation: filters.designation,
        occupation: filters.occupation,
        state: filters.state,
        sentDate: filters.sentDate,
        searchTerm,
        page,
        size: leadsPerPage,
      });

      console.log("Lead data received:", data);
      console.log("data to e sndsj0", data.content);

      setLeads(data.content);
      setFilteredLeads(data.content);
      setTotalPages(data.totalPages || 1);
      setTotalLeads(data.totalElements || 0);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast({
        title: "Error loading leads",
        description: "Failed to load leads from server.",
        variant: "destructive",
      });
    } finally {
      setLeadsLoading(false);
      console.log("Leads loading state set to false");
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const options = await leadService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error("Error loading filter options:", error);
    }
  };

  // Memoize fetchLeads to prevent infinite re-renders
  const fetchLeadsMemoized = useCallback(
    async (page: number, filters: LeadFilters, search: string) => {
      try {
        console.log("Fetching leads with params:", {
          page,
          filters: {
            ...filters,
            // Convert arrays to strings for better logging
            name: filters.name?.join(","),

            occupation: filters.occupation?.join(","),
            state: filters.state?.join(","),
            designation: filters.designation?.join(","),
          },
          search,
          size: leadsPerPage,
        });

        setLeadsLoading(true);

        const data = await leadService.searchLeads({
          name: filters.name,
          occupation: filters.occupation,
          state: filters.state,
          designation: filters.designation,
          sentDate: filters.sentDate,
          searchTerm: search,
          page,
          size: leadsPerPage,
        });

        console.log("Lead data received:", {
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          pageSize: leadsPerPage,
          currentPage: page,
          itemsCount: data.content?.length || 0,
        });

        setLeads(data.content);
        setFilteredLeads(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalLeads(data.totalElements || 0);
      } catch (error) {
        console.error("Error loading leads:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        toast({
          title: "Error loading leads",
          description: `Failed to load leads: ${errorMessage}`,
          variant: "destructive",
        });
        // Reset to first page on error
        setCurrentPage(1);
      } finally {
        setLeadsLoading(false);
      }
    },
    [leadsPerPage, toast]
  );

  useEffect(() => {
    fetchLeadsMemoized(currentPage - 1, filters, searchTerm);
    fetchFilterOptions();
  }, [filters, searchTerm, currentPage, fetchLeadsMemoized]);

  const handleCreateLead = () => {
    setSelectedLead(null);
    setModalMode("create");
  };

  const handleRowClick = useCallback((lead: Lead) => {
    setSelectedLeadForPanel(lead);
  }, []);

  const handleSaveLead = useCallback(
    async (leadData: Partial<Lead>) => {
      try {
        if (modalMode === "create") {
          // Ensure required fields are present for creation
          const newLead: Omit<Lead, "leadId"> = {
            name: leadData.name || "",
            email: leadData.email || "",
            mobileNumber: leadData.mobileNumber || "",
            designation: leadData.designation || "",
            occupation: leadData.occupation || "",
            state: leadData.state || "",
            companyHeadcount: leadData.companyHeadcount || "",
            website: leadData.website || "",
            leadLink: leadData.leadLink || "",
            sentBy: leadData.sentBy || "",
            sentDate: leadData.sentDate || new Date().toISOString(),
            comments: leadData.comments || "",
            linkedinAccountName: leadData.linkedinAccountName || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await leadService.createLead(newLead);
          toast({ title: "Success", description: "Lead created successfully" });
        } else {
          if (!leadData.leadId) {
            throw new Error("Lead ID is required for update");
          }
          // For updates, only include the fields that were actually changed
          const updatedLead: Partial<Lead> = {
            ...leadData,
            updatedAt: new Date().toISOString(),
          };
          await leadService.updateLead(leadData.leadId, updatedLead);
          toast({ title: "Success", description: "Lead updated successfully" });
        }
        fetchLeadsMemoized(currentPage - 1, filters, searchTerm);
      } catch (error) {
        console.error("Error saving lead:", error);
        toast({
          title: "Error",
          description: "Failed to save lead. Please try again.",
          variant: "destructive",
        });
      } finally {
        setModalMode(null);
        setSelectedLead(null);
      }
    },
    [modalMode, currentPage, filters, searchTerm, fetchLeadsMemoized, toast]
  );

  const confirmDelete = useCallback(async () => {
    if (!leadToDelete) return;
    try {
      await leadService.deleteLead(leadToDelete.leadId);
      toast({ title: "Success", description: "Lead deleted successfully" });
      await fetchLeadsMemoized(currentPage - 1, filters, searchTerm);
      setShowDeleteModal(false);
      setLeadToDelete(null);
      setSelectedLeadForPanel(null);
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({
        title: "Error",
        description: "Failed to delete lead. Please try again.",
        variant: "destructive",
      });
    }
  }, [
    leadToDelete,
    currentPage,
    filters,
    searchTerm,
    fetchLeadsMemoized,
    toast,
  ]);

  const handleImportExcel = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.className = "hidden";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await leadService.uploadExcel(file);
          await fetchLeads(currentPage - 1, filters, searchTerm);
          toast({
            title: "Import successful",
            description: "Leads imported from Excel.",
          });
        } catch {
          toast({
            title: "Import failed",
            description: "Failed to import.",
            variant: "destructive",
          });
        }
      }
    };
    // Add a class to style the file input's label/button
    input.style.display = 'none';
    input.id = 'file-upload';
    document.body.appendChild(input);
    input.click();
    // Clean up after selection
    input.onchange = null;
    setTimeout(() => {
      document.body.removeChild(input);
    }, 1000);
  };

  const handleExportExcel = () => {
    toast({
      title: "Export initiated",
      description: "Excel will download shortly.",
    });
  };

  const clearAllFilters = useCallback(() => {
    console.log("Clearing all filters and resetting to page 1");
    // Reset to first page
    setCurrentPage(1);

    // Clear all filters
    const emptyFilters: LeadFilters = {
      name: undefined,
      designation: undefined,
      occupation: undefined,
      state: undefined,
      sentDate: undefined,
    };

    setFilters(emptyFilters);
    setSearchTerm("");
    setSearchInput("");

    // Refetch with empty filters
    fetchLeadsMemoized(0, emptyFilters, "");
  }, [fetchLeadsMemoized]);

  // Define columns for the DataTable
  const columns = useMemo(
    () => [
      {
        key: "name" as const,
        header: "Name",
        width: 200,
        minWidth: 150,
        render: (value: string) => <div className="font-medium">{value}</div>,
      },
      {
        key: "occupation" as const,
        header: "Occupation",
        width: 180,
        minWidth: 150,
        render: (value: string) => <div className="text-indigo-600">{value}</div>,
      },
      {
        key: "state" as const,
        header: "State",
        width: 120,
        minWidth: 100,
      },
      {
        key: "email" as const,
        header: "Email",
        width: 200,
        minWidth: 150,
      },
      {
        key: "designation" as const,
        header: "Designation",
        width: 180,
        minWidth: 150,
        render: (value: string) => <div className="text-blue-600">{value}</div>,
      },
      {
        key: "companyHeadcount" as const,
        header: "Company Size",
        width: 150,
        minWidth: 120,
        render: (value: string) => <div className="text-green-600">{value}</div>,
      },
      // Actions column has been removed as per requirements
    ],
    []
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    console.log("Refreshing leads data...");
    setIsRefreshing(true);
    try {
      await fetchLeadsMemoized(currentPage - 1, filters, searchTerm);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentPage, filters, searchTerm, fetchLeadsMemoized]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filterName: keyof LeadFilters) => (selected: string[]) => {
      console.group("Filter Change");
      console.log("Filter Name:", filterName);
      console.log("Selected Values:", selected);
      console.log("Current Filters:", filters);
      console.groupEnd();

      // Reset to first page when filters change
      setCurrentPage(1);
      setFilters((prev) => {
        const newFilters = {
          ...prev,
          [filterName]: selected.length > 0 ? selected : undefined,
        };
        console.log("New Filters:", newFilters);
        return newFilters;
      });
    },
    [filters]
  );

  // Handle date filter change
  const handleDateFilterChange = useCallback((date: string) => {
    console.log("Date filter changed:", date);
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      sentDate: date || undefined,
    }));
  }, []);

  console.log("flerksldk;sld", filteredLeads);

  return (
    <div className="flex flex-col">
      {/* Filter Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 p-5">
        <div className="space-y-4 m-2">
          <h2 className="text-lg font-semibold">Filters</h2>

          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <Input
              placeholder="Search by name, email, company..."
              value={searchInput}
              onChange={(e) => {
                const value = e.target.value;
                setSearchInput(value);
                debouncedSearch(value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  debouncedSearch.flush();
                }
              }}
            />
          </div>

          {/* Occupation Filter */}
          <div className="space-y-2">
            <MultiSelect
              label="Occupation"
              options={filterOptions.occupations}
              selected={filters.occupation || []}
              onChange={handleFilterChange("occupation")}
              placeholder="Select occupation..."
            />
          </div>

          {/* State Filter */}
          <div className="space-y-2">
            <MultiSelect
              label="State"
              options={filterOptions.states}
              selected={filters.state || []}
              onChange={handleFilterChange("state")}
              placeholder="Select state..."
            />
          </div>

          {/* Designation Filter */}
          <div className="space-y-2">
            <MultiSelect
              label="Designation"
              options={filterOptions.designations}
              selected={filters.designation || []}
              onChange={handleFilterChange("designation")}
              placeholder="Select designation..."
            />
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sent Date</label>
            <Input
              type="date"
              value={filters.sentDate || ""}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={clearAllFilters}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 overflow-y-hidden ${
          selectedLeadForPanel ? "pr-96" : ""
        }`}
      >
        <div className="space-y-4">
          {/* Header with actions */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Leads</h1>
              <p className="text-xs text-gray-500">
                Manage and track all your leads in one place
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex space-x-2">
                <div className="relative">
                  <Button
                    asChild
                    size="sm"
                    className="h-10 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white cursor-pointer"
                  >
                    <label htmlFor="file-upload" className="flex items-center px-4 py-2 cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Import
                    </label>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          await leadService.uploadExcel(file);
                          await fetchLeads(currentPage - 1, filters, searchTerm);
                          toast({
                            title: "Import successful",
                            description: "Leads imported from Excel.",
                          });
                        } catch {
                          toast({
                            title: "Import failed",
                            description: "Failed to import.",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  className="h-10 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                  onClick={handleExportExcel}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button
                  className="h-10 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                  onClick={handleCreateLead}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lead
                </Button>
              </div>
            </div>
          </div>

          {/* DataTable */}
          <Card className="overflow-hidden">
            <CardHeader className="py-2 px-4 border-b">
              <CardTitle className="text-sm font-semibold">
                Leads ({totalLeads})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[calc(7*56px+56px+2px)] flex flex-col border rounded-md overflow-y-scroll">
                <div className="flex-1 overflow-y-auto">
                  <DataTable
                    columns={columns}
                    data={filteredLeads}
                    onRowClick={handleRowClick}
                    stickyHeader
                    stickyFooter
                    rowHeight={56}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    loading={leadsLoading}
                    className="[&_table]:border-0 overflow-y-scroll"
                    footerContent={
                      <div className="px-6 py-3 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Showing {Math.min(leadsPerPage, filteredLeads.length)}{" "}
                          of {totalLeads} leads
                        </div>
                        <Pagination className="m-0">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.max(1, prev - 1)
                                  )
                                }
                                className={
                                  currentPage === 1
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>
                            {Array.from(
                              { length: Math.min(5, totalPages) },
                              (_, i) => {
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
                                  <PaginationItem key={pageNum}>
                                    <PaginationLink
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage(pageNum);
                                      }}
                                      isActive={currentPage === pageNum}
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }
                            )}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.min(totalPages, prev + 1)
                                  )
                                }
                                className={
                                  currentPage === totalPages
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Side Panel */}
      {selectedLeadForPanel && (
        <LeadDetailsPanel
          lead={selectedLeadForPanel}
          onClose={() => setSelectedLeadForPanel(null)}
        />
      )}

      {/* Modals */}
      {modalMode && (
        <LeadModal
          lead={selectedLead}
          mode={modalMode}
          onSave={handleSaveLead}
          onClose={() => {
            setModalMode(null);
            setSelectedLead(null);
          }}
        />
      )}

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        leadName={leadToDelete?.name || ""}
      />
    </div>
  );
};

export default Leads;
