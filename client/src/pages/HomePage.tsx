import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { serviceFormSchema, type InsertService } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function HomePage() {
  const { toast } = useToast();
  const [precioEstimado, setPrecioEstimado] = useState<number | null>(null);

  const form = useForm<InsertService>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      tipoServicio: "moto_cadete",
      nombreCliente: "",
      apellidoCliente: "",
      telefono: "",
      direccionCarga: "",
      direccionEntrega: "",
      recomendaciones: "",
      latitudCarga: "0",
      longitudCarga: "0",
      latitudEntrega: "0",
      longitudEntrega: "0",
      precioEstimado: "0",
    },
  });

  const calcularPrecio = (tipoServicio: string): number => {
    const precios = {
      moto_cadete: 5000,
      utilitario_paqueteria: 10000,
      pickup_flete: 20000,
    };
    return precios[tipoServicio as keyof typeof precios] || 0;
  };

  const onSubmit = async (data: InsertService) => {
    try {
      // Convertir el precio estimado a string antes de enviar
      const formData = {
        ...data,
        precioEstimado: precioEstimado?.toString() || "0",
      };

      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Error al enviar la solicitud");

      toast({
        title: "¡Solicitud enviada!",
        description: "Pronto nos pondremos en contacto contigo.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 bg-card">
        <h1 className="text-3xl font-bold mb-6 text-center">Solicitud de Servicio de Transporte</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Servicio</label>
                <Select
                  onValueChange={(value) => {
                    form.setValue("tipoServicio", value);
                    const precio = calcularPrecio(value);
                    setPrecioEstimado(precio);
                    form.setValue("precioEstimado", precio.toString());
                  }}
                  defaultValue="moto_cadete"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo de servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moto_cadete">Moto Cadete ($5,000)</SelectItem>
                    <SelectItem value="utilitario_paqueteria">Utilitario Paquetería ($10,000)</SelectItem>
                    <SelectItem value="pickup_flete">Pick Up Flete ($20,000)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input {...form.register("nombreCliente")} placeholder="Tu nombre" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Apellido</label>
                <Input {...form.register("apellidoCliente")} placeholder="Tu apellido" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input {...form.register("telefono")} placeholder="Tu número de teléfono" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dirección de Carga</label>
                <Input {...form.register("direccionCarga")} placeholder="¿Dónde recogemos?" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dirección de Entrega</label>
                <Input {...form.register("direccionEntrega")} placeholder="¿Dónde entregamos?" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recomendaciones</label>
              <Textarea
                {...form.register("recomendaciones")}
                placeholder="Instrucciones especiales o detalles adicionales"
              />
            </div>

            {precioEstimado && (
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <p className="text-lg font-semibold">Precio Estimado: ${precioEstimado.toLocaleString()}</p>
              </div>
            )}

            <Button type="submit" className="w-full">
              Solicitar Servicio
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}