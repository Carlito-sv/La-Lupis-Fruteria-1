import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";

interface Employee {
  id: number;
  name: string;
  position: string;
  status: "active" | "inactive" | "vacation";
  email: string;
  phone: string;
  joinDate: string;
}

interface Attendance {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: "present" | "absent" | "late" | "halfday";
}

export default function Staff() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("employees");
  const [employeeStatus, setEmployeeStatus] = useState("all");

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/staff/employees'],
    queryFunction: ({ queryKey }) => 
      fetch(queryKey[0])
        .then(res => res.json()),
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ['/api/staff/attendance'],
    queryFunction: ({ queryKey }) => 
      fetch(queryKey[0])
        .then(res => res.json()),
  });

  const filteredEmployees = employees?.filter((employee: Employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          employee.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = employeeStatus === "all" || employee.status === employeeStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success bg-opacity-10 text-success";
      case "inactive":
        return "bg-danger bg-opacity-10 text-danger";
      case "vacation":
        return "bg-accent bg-opacity-10 text-accent";
      case "present":
        return "bg-success bg-opacity-10 text-success";
      case "absent":
        return "bg-danger bg-opacity-10 text-danger";
      case "late":
        return "bg-warning bg-opacity-10 text-warning";
      case "halfday":
        return "bg-accent bg-opacity-10 text-accent";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "inactive":
        return "Inactivo";
      case "vacation":
        return "Vacaciones";
      case "present":
        return "Presente";
      case "absent":
        return "Ausente";
      case "late":
        return "Tarde";
      case "halfday":
        return "Medio día";
      default:
        return status;
    }
  };

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personal</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona tu equipo de trabajo</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-primary-500 text-white hover:bg-primary-600">
            <i className="ri-user-add-line mr-2"></i>
            Nuevo Empleado
          </Button>
        </div>
      </div>

      <Tabs defaultValue="employees" onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia</TabsTrigger>
          <TabsTrigger value="schedules">Horarios</TabsTrigger>
          <TabsTrigger value="payroll">Nómina</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "employees" && (
        <>
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label htmlFor="search-employee" className="text-sm font-medium block mb-1">Buscar</label>
                  <Input
                    id="search-employee"
                    type="search"
                    placeholder="Nombre o cargo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="status" className="text-sm font-medium block mb-1">Estado</label>
                  <select 
                    id="status" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={employeeStatus}
                    onChange={(e) => setEmployeeStatus(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                    <option value="vacation">Vacaciones</option>
                  </select>
                </div>
                <div>
                  <Button variant="outline" className="w-full">
                    <i className="ri-filter-3-line mr-2"></i>
                    Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Fecha de Ingreso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeesLoading ? (
                    // Skeleton loader
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center">
                            <Skeleton className="w-8 h-8 rounded-full mr-2" />
                            <Skeleton className="h-5 w-36" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredEmployees.length > 0 ? (
                    // Actual employees list
                    filteredEmployees.map((employee: Employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <UserAvatar name={employee.name} size="sm" />
                            <span className="font-medium ml-2">{employee.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(employee.status)}`}>
                            {getStatusText(employee.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div><i className="ri-mail-line mr-1"></i> {employee.email}</div>
                            <div><i className="ri-phone-line mr-1"></i> {employee.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{employee.joinDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-gray-500"
                              title="Editar"
                            >
                              <i className="ri-pencil-line"></i>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-gray-500"
                              title="Ver detalles"
                            >
                              <i className="ri-eye-line"></i>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-danger"
                              title="Eliminar"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // No results message
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center py-4">
                          <i className="ri-user-search-line text-3xl text-gray-300 mb-2"></i>
                          <p className="text-gray-500">No se encontraron empleados</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "attendance" && (
        <>
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label htmlFor="date" className="text-sm font-medium block mb-1">Fecha</label>
                  <Input
                    id="date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Button className="w-full">Registrar Entrada/Salida</Button>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button variant="outline" className="mr-2">
                    <i className="ri-printer-line mr-2"></i>
                    Imprimir
                  </Button>
                  <Button variant="outline">
                    <i className="ri-download-line mr-2"></i>
                    Exportar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Salida</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceLoading ? (
                    // Skeleton loader
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center">
                            <Skeleton className="w-8 h-8 rounded-full mr-2" />
                            <Skeleton className="h-5 w-36" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : attendance?.length > 0 ? (
                    // Actual attendance list
                    attendance.map((record: Attendance) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <UserAvatar name={record.employeeName} size="sm" />
                            <span className="ml-2">{record.employeeName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.checkIn || "-"}</TableCell>
                        <TableCell>{record.checkOut || "-"}</TableCell>
                        <TableCell>{record.hoursWorked || "-"}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(record.status)}`}>
                            {getStatusText(record.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-gray-500"
                              title="Editar"
                            >
                              <i className="ri-pencil-line"></i>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-gray-500"
                              title="Ver detalles"
                            >
                              <i className="ri-eye-line"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // No records message
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center py-4">
                          <i className="ri-calendar-line text-3xl text-gray-300 mb-2"></i>
                          <p className="text-gray-500">No hay registros de asistencia para la fecha seleccionada</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "schedules" && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="ri-calendar-schedule-line text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium mb-2">Próximamente</h3>
            <p className="text-gray-500">La funcionalidad de horarios estará disponible pronto.</p>
          </div>
        </div>
      )}

      {activeTab === "payroll" && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="ri-money-dollar-box-line text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium mb-2">Próximamente</h3>
            <p className="text-gray-500">La funcionalidad de nómina estará disponible pronto.</p>
          </div>
        </div>
      )}
    </div>
  );
}
