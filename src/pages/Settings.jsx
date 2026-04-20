import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Settings() {
  const clearData = () => {
    if (confirm("¿Estás seguro de que quieres borrar todos los datos del sistema? Esta acción no se puede deshacer.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <p className="text-mutedForeground">Ajustes generales del sistema solno.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Preferencias de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <p className="font-medium text-foreground">Nombre de Empresa</p>
              <p className="text-mutedForeground mt-1">Solno Sistema Administrativo</p>
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">Esquema de Colores</p>
              <p className="text-mutedForeground mt-1">Blanco y Negro (Por Defecto)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-danger/20">
          <CardHeader>
            <CardTitle className="text-danger">Zona de Peligro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-mutedForeground">
              Borrar todos los datos restaurará el sistema a su estado inicial. Esto eliminará todos los clientes, cotizaciones, gastos, empleados y proveedores registrados localmente.
            </p>
            <Button variant="danger" onClick={clearData}>Borrar todos los datos</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
