"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  Search,
  SortAsc,
  SortDesc,
  Scissors,
  Plus,
  Filter
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onDataUpdate?: (updatedData: TData[]) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onDataUpdate,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [tableData, setTableData] = useState<TData[]>(data)

  // Update table data when prop changes
  useEffect(() => {
    setTableData(data)
  }, [data])

  // Function to remove item from table (for optimistic updates)
  const removeItem = (id: string) => {
    const updatedData = tableData.filter((item: any) => item.id !== id)
    setTableData(updatedData)
    if (onDataUpdate) {
      onDataUpdate(updatedData)
    }
  }

  // Pass removeItem function to columns context
  const columnsWithContext = columns.map(column => ({
    ...column,
    meta: {
      ...column.meta,
      removeItem,
    }
  }))

  const table = useReactTable({
    data: tableData,
    columns: columnsWithContext,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(
    tableData.map((item: any) => item.category).filter(Boolean)
  ))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl shadow-lg">
                <Scissors className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Your Barber Services</h1>
                <p className="text-slate-600 text-lg">Manage, update and organize your services 💈</p>
              </div>
            </div>
          </div>
          
          <Link href="/dashboard/add-service">
            <Button 
              className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Service
            </Button>
          </Link>
        </div>

        {/* Filters Section */}
        <Card className="border-2 border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Filter className="h-5 w-5 text-amber-600" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search services by name..."
                  value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    table.getColumn("name")?.setFilterValue(event.target.value)
                  }
                  className="pl-10 h-12 border-2 border-slate-200 focus:border-amber-500 focus:ring-amber-200 rounded-xl"
                />
              </div>
              
              <Select
                value={(table.getColumn("category")?.getFilterValue() as string) ?? "all"}
                onValueChange={(value) =>
                  table.getColumn("category")?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full md:w-48 h-12 border-2 border-slate-200 rounded-xl">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Services</p>
                  <p className="text-2xl font-bold">{tableData.length}</p>
                </div>
                <Scissors className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Active Services</p>
                  <p className="text-2xl font-bold">
                    {tableData.filter((item: any) => item.isActive).length}
                  </p>
                </div>
                <Badge className="bg-green-400">Active</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <Filter className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Avg. Rating</p>
                  <p className="text-2xl font-bold">
                    {tableData.length > 0 
                      ? ((tableData as any[]).reduce((acc, item) => acc + (item.averageRating || 0), 0) / tableData.length).toFixed(1)
                      : "0.0"}
                  </p>
                </div>
                <div className="text-yellow-200">⭐</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card className="border-2 border-slate-200 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-b-2 border-slate-300">
                      {headerGroup.headers.map((header) => {
                        const canSort = header.column.getCanSort()
                        const sortDirection = header.column.getIsSorted()
                        
                        return (
                          <TableHead 
                            key={header.id} 
                            className="font-bold text-slate-800 py-4 px-6"
                          >
                            {header.isPlaceholder ? null : (
                              <div className="flex items-center gap-2">
                                {canSort ? (
                                  <Button
                                    variant="ghost"
                                    onClick={() => header.column.toggleSorting()}
                                    className="h-auto p-0 font-bold text-slate-800 hover:text-amber-700"
                                  >
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                                    {sortDirection === "asc" && <SortAsc className="h-4 w-4 ml-1" />}
                                    {sortDirection === "desc" && <SortDesc className="h-4 w-4 ml-1" />}
                                  </Button>
                                ) : (
                                  flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )
                                )}
                              </div>
                            )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={`
                          hover:bg-slate-50 transition-colors border-b border-slate-100
                          ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                        `}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell 
                            key={cell.id} 
                            className="py-4 px-6 text-slate-700"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-32 text-center"
                      >
                        <div className="flex flex-col items-center gap-4 text-slate-500">
                          <Scissors className="h-12 w-12 text-slate-300" />
                          <div className="space-y-2">
                            <p className="text-lg font-medium">No services found</p>
                            <p className="text-sm">Create your first barber service to get started</p>
                          </div>
                          <Link href="/dashboard/add-service">
                            <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Service
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {table.getRowModel().rows?.length > 0 && (
              <div className="flex items-center justify-between gap-4 p-6 border-t bg-slate-50/50">
                <div className="text-sm text-slate-600">
                  Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{" "}
                  of {table.getFilteredRowModel().rows.length} services
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    disabled={!table.getCanPreviousPage()}
                    onClick={() => table.previousPage()}
                    variant="outline"
                    size="sm"
                    className="border-slate-300 hover:bg-slate-100"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1 text-sm text-slate-600 px-2">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </div>
                  
                  <Button
                    disabled={!table.getCanNextPage()}
                    onClick={() => table.nextPage()}
                    variant="outline"
                    size="sm"
                    className="border-slate-300 hover:bg-slate-100"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}