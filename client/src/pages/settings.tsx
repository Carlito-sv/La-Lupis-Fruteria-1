import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFunction: ({ queryKey }) => 
      fetch(queryKey[0])
        .then(res => res.json()),
  });

  const handleSaveSettings = () => {
    toast({
      title: "Configuración guardada",
      description: "Los cambios han sido guardados exitosamente.",
    });
  };

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-500">Administra la configuración del sistema</p>
      </div>

      <Tabs defaultValue="general" onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="pos">Punto de Venta</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "general" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Negocio</CardTitle>
              <CardDescription>Configura la información básica de tu negocio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Nombre del Negocio</Label>
                  <Input 
                    id="business-name" 
                    placeholder="Ej. La Lupis" 
                    defaultValue={settings?.businessName || "La Lupis"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-id">RFC</Label>
                  <Input 
                    id="tax-id" 
                    placeholder="Ej. XAXX010101000" 
                    defaultValue={settings?.taxId || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    placeholder="Ej. (123) 456-7890" 
                    defaultValue={settings?.phone || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Ej. contacto@lalupis.com" 
                    defaultValue={settings?.email || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input 
                  id="address" 
                  placeholder="Dirección completa" 
                  defaultValue={settings?.address || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo del Negocio</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <i className="ri-leaf-line text-primary-500 text-2xl"></i>
                  </div>
                  <Button variant="outline">Cambiar Logo</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferencias Generales</CardTitle>
              <CardDescription>Configura las preferencias generales del sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode" className="block">Modo Oscuro</Label>
                  <p className="text-sm text-gray-500">Activa el modo oscuro para la interfaz.</p>
                </div>
                <Switch id="dark-mode" defaultChecked={settings?.darkMode || false} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lang" className="block">Idioma</Label>
                  <p className="text-sm text-gray-500">Selecciona el idioma de la aplicación.</p>
                </div>
                <select 
                  id="lang" 
                  className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={settings?.language || "es"}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="timezone" className="block">Zona Horaria</Label>
                  <p className="text-sm text-gray-500">Configura la zona horaria para los reportes.</p>
                </div>
                <select 
                  id="timezone" 
                  className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={settings?.timezone || "America/Mexico_City"}
                >
                  <option value="America/Mexico_City">Ciudad de México</option>
                  <option value="America/Monterrey">Monterrey</option>
                  <option value="America/Cancun">Cancún</option>
                </select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="block">Notificaciones</Label>
                  <p className="text-sm text-gray-500">Recibe notificaciones del sistema.</p>
                </div>
                <Switch id="notifications" defaultChecked={settings?.notifications || true} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Inventario</CardTitle>
              <CardDescription>Configura las opciones de gestión de inventario.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="low-stock-threshold">Umbral de Alerta de Stock Bajo (%)</Label>
                  <Input 
                    id="low-stock-threshold" 
                    type="number" 
                    min="1" 
                    max="100" 
                    defaultValue={settings?.inventory?.lowStockThreshold || "20"} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry-alert-days">Alerta de Vencimiento (días)</Label>
                  <Input 
                    id="expiry-alert-days" 
                    type="number" 
                    min="1" 
                    defaultValue={settings?.inventory?.expiryAlertDays || "7"} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-order" className="block">Pedido Automático</Label>
                  <p className="text-sm text-gray-500">Generar pedidos automáticamente para productos con stock bajo.</p>
                </div>
                <Switch id="auto-order" defaultChecked={settings?.inventory?.autoOrder || false} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="track-batches" className="block">Seguimiento de Lotes</Label>
                  <p className="text-sm text-gray-500">Habilita el seguimiento de lotes para productos.</p>
                </div>
                <Switch id="track-batches" defaultChecked={settings?.inventory?.trackBatches || true} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="barcode-scanner" className="block">Escáner de Códigos de Barras</Label>
                  <p className="text-sm text-gray-500">Habilita la integración con escáner de códigos de barras.</p>
                </div>
                <Switch id="barcode-scanner" defaultChecked={settings?.inventory?.barcodeScanner || true} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categorías de Productos</CardTitle>
              <CardDescription>Administra las categorías de productos.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Categorías Actuales</h4>
                  <Button variant="outline" size="sm">
                    <i className="ri-add-line mr-2"></i>
                    Añadir Categoría
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {(settings?.inventory?.categories || [
                    "Frutas", "Verduras", "Abarrotes", "Lácteos", "Carnes", "Bebidas"
                  ]).map((category: string, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <span>{category}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
                          <i className="ri-pencil-line"></i>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-danger">
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "pos" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Punto de Venta</CardTitle>
              <CardDescription>Configura las opciones del sistema de punto de venta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tasa de Impuesto (%)</Label>
                  <Input 
                    id="tax-rate" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    max="100" 
                    defaultValue={settings?.pos?.taxRate || "16"} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt-footer">Pie de Página en Recibos</Label>
                  <Input 
                    id="receipt-footer" 
                    placeholder="Texto que aparecerá al final de los recibos" 
                    defaultValue={settings?.pos?.receiptFooter || "¡Gracias por su compra!"} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-tax" className="block">Mostrar Impuestos Desglosados</Label>
                  <p className="text-sm text-gray-500">Muestra los impuestos desglosados en los recibos.</p>
                </div>
                <Switch id="show-tax" defaultChecked={settings?.pos?.showTaxDetails || true} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-discounts" className="block">Permitir Descuentos</Label>
                  <p className="text-sm text-gray-500">Habilita la aplicación de descuentos en ventas.</p>
                </div>
                <Switch id="allow-discounts" defaultChecked={settings?.pos?.allowDiscounts || true} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-employee-id" className="block">Requerir ID de Empleado</Label>
                  <p className="text-sm text-gray-500">Requiere identificación de empleado para cada venta.</p>
                </div>
                <Switch id="require-employee-id" defaultChecked={settings?.pos?.requireEmployeeId || false} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="scale-integration" className="block">Integración con Báscula</Label>
                  <p className="text-sm text-gray-500">Habilita la integración con báscula electrónica.</p>
                </div>
                <Switch id="scale-integration" defaultChecked={settings?.pos?.scaleIntegration || true} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>Configura los métodos de pago aceptados.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="ri-cash-line text-xl text-gray-600"></i>
                    <div>
                      <Label className="block">Efectivo</Label>
                      <p className="text-sm text-gray-500">Pagos en efectivo</p>
                    </div>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="ri-bank-card-line text-xl text-gray-600"></i>
                    <div>
                      <Label className="block">Tarjeta de Crédito/Débito</Label>
                      <p className="text-sm text-gray-500">Pagos con tarjeta</p>
                    </div>
                  </div>
                  <Switch defaultChecked={settings?.pos?.paymentMethods?.card || true} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="ri-smartphone-line text-xl text-gray-600"></i>
                    <div>
                      <Label className="block">Transferencia Electrónica</Label>
                      <p className="text-sm text-gray-500">Pagos mediante transferencia</p>
                    </div>
                  </div>
                  <Switch defaultChecked={settings?.pos?.paymentMethods?.transfer || true} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="ri-coin-line text-xl text-gray-600"></i>
                    <div>
                      <Label className="block">Crédito en Tienda</Label>
                      <p className="text-sm text-gray-500">Permitir ventas a crédito</p>
                    </div>
                  </div>
                  <Switch defaultChecked={settings?.pos?.paymentMethods?.storeCredit || false} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>Administra los usuarios que pueden acceder al sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium">Usuarios Activos</h4>
                <Button variant="outline" size="sm">
                  <i className="ri-user-add-line mr-2"></i>
                  Añadir Usuario
                </Button>
              </div>
              
              <div className="space-y-2">
                {(settings?.users || [
                  { id: 1, name: "María Rodríguez", email: "maria@lalupis.com", role: "Administrador" },
                  { id: 2, name: "Juan Pérez", email: "juan@lalupis.com", role: "Cajero" },
                  { id: 3, name: "Ana Gómez", email: "ana@lalupis.com", role: "Inventario" },
                ]).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-sm">
                        {user.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email} - {user.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
                        <i className="ri-pencil-line"></i>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-danger">
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Roles y Permisos</CardTitle>
              <CardDescription>Configura los roles y permisos para los usuarios.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Roles Disponibles</h4>
                  <Button variant="outline" size="sm">
                    <i className="ri-add-line mr-2"></i>
                    Nuevo Rol
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {(settings?.roles || [
                    { id: 1, name: "Administrador", description: "Acceso completo a todas las funcionalidades" },
                    { id: 2, name: "Gerente", description: "Acceso a todas las funcionalidades excepto configuración de usuarios" },
                    { id: 3, name: "Cajero", description: "Acceso solo al punto de venta y consultas básicas" },
                    { id: 4, name: "Inventario", description: "Acceso a la gestión de inventario" },
                  ]).map((role: any) => (
                    <div key={role.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div>
                        <p className="font-medium">{role.name}</p>
                        <p className="text-sm text-gray-500">{role.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
                          <i className="ri-pencil-line"></i>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-danger">
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integraciones</CardTitle>
              <CardDescription>Configura integraciones con servicios externos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                      <i className="ri-printer-line text-xl text-gray-700"></i>
                    </div>
                    <div>
                      <h4 className="font-medium">Impresoras</h4>
                      <p className="text-sm text-gray-500">Conectar con impresoras de recibos</p>
                    </div>
                  </div>
                  <Switch defaultChecked={settings?.integrations?.printers?.enabled || true} />
                </div>
                {settings?.integrations?.printers?.enabled !== false && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="printer-ip">Dirección IP</Label>
                        <Input 
                          id="printer-ip" 
                          placeholder="Ej. 192.168.1.100" 
                          defaultValue={settings?.integrations?.printers?.ip || ""} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="printer-port">Puerto</Label>
                        <Input 
                          id="printer-port" 
                          placeholder="Ej. 9100" 
                          defaultValue={settings?.integrations?.printers?.port || "9100"} 
                        />
                      </div>
                    </div>
                    <Button className="mt-3" size="sm">Probar Conexión</Button>
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                      <i className="ri-scales-3-line text-xl text-gray-700"></i>
                    </div>
                    <div>
                      <h4 className="font-medium">Báscula Electrónica</h4>
                      <p className="text-sm text-gray-500">Conectar con básculas para productos por peso</p>
                    </div>
                  </div>
                  <Switch defaultChecked={settings?.integrations?.scale?.enabled || true} />
                </div>
                {settings?.integrations?.scale?.enabled !== false && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scale-port">Puerto COM</Label>
                        <Input 
                          id="scale-port" 
                          placeholder="Ej. COM3" 
                          defaultValue={settings?.integrations?.scale?.port || "COM1"} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scale-baud">Velocidad (baudios)</Label>
                        <Input 
                          id="scale-baud" 
                          placeholder="Ej. 9600" 
                          defaultValue={settings?.integrations?.scale?.baudRate || "9600"} 
                        />
                      </div>
                    </div>
                    <Button className="mt-3" size="sm">Probar Conexión</Button>
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                      <i className="ri-cloud-line text-xl text-gray-700"></i>
                    </div>
                    <div>
                      <h4 className="font-medium">Respaldo en la Nube</h4>
                      <p className="text-sm text-gray-500">Configurar respaldo automático de datos</p>
                    </div>
                  </div>
                  <Switch defaultChecked={settings?.integrations?.backup?.enabled || false} />
                </div>
                {settings?.integrations?.backup?.enabled !== false && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="space-y-2">
                      <Label htmlFor="backup-frequency">Frecuencia de Respaldo</Label>
                      <select 
                        id="backup-frequency" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue={settings?.integrations?.backup?.frequency || "daily"}
                      >
                        <option value="hourly">Cada hora</option>
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>
                    <div className="space-y-2 mt-3">
                      <Label htmlFor="backup-location">Ubicación de Respaldo</Label>
                      <Input 
                        id="backup-location" 
                        placeholder="Ruta de respaldo" 
                        defaultValue={settings?.integrations?.backup?.location || "/backups"} 
                      />
                    </div>
                    <Button className="mt-3" size="sm">Realizar Respaldo Ahora</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button variant="outline" className="mr-2">Cancelar</Button>
        <Button onClick={handleSaveSettings}>Guardar Cambios</Button>
      </div>
    </div>
  );
}
