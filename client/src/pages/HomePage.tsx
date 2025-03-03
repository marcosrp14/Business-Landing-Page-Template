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
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { nanoid } from 'nanoid';

const libraries: ("places" | "geometry" | "drawing")[] = ["places"];

export default function HomePage() {
  const { toast } = useToast();
  const [precioEstimado, setPrecioEstimado] = useState<number | null>(null);
  const [distancia, setDistancia] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<InsertService | null>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setMapsError("No se ha configurado la API key de Google Maps");
    }
  }, [apiKey]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || "",
    libraries: libraries,
  });

  // Log error details for debugging
  useEffect(() => {
    if (loadError) {
      console.error("Error al cargar Google Maps:", loadError);
      const errorMessage = loadError.toString();
      if (errorMessage.includes("InvalidKeyMapError")) {
        setMapsError("La API key de Google Maps no es válida o tiene restricciones");
      } else if (errorMessage.includes("RefererNotAllowedMapError")) {
        setMapsError("El dominio actual no está autorizado para usar la API key");
      } else if (errorMessage.toLowerCase().includes("google is not defined")) {
        setMapsError("No se pudo inicializar Google Maps. Por favor, recargue la página");
      } else {
        setMapsError(`Error al cargar Google Maps: ${errorMessage}`);
      }
    }
  }, [loadError]);

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

  const calcularPrecioBase = (tipoServicio: string): number => {
    const precios = {
      moto_cadete: 5000, // Precio base cada 2km
      utilitario_paqueteria: 10000, // Precio base hasta 10km
      pickup_flete: 20000, // Precio base cada 10km
    };
    return precios[tipoServicio as keyof typeof precios] || 0;
  };

  const calcularPrecioFinal = async (direccionCarga: string, direccionEntrega: string, tipoServicio: string) => {
    if (!isLoaded || !window.google) {
      toast({
        title: "Error",
        description: "El servicio de mapas no está disponible en este momento.",
        variant: "destructive",
      });
      return;
    }

    try {
      const service = new google.maps.DistanceMatrixService();
      const result = await service.getDistanceMatrix({
        origins: [direccionCarga],
        destinations: [direccionEntrega],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      });

      if (result.rows[0]?.elements[0]?.distance) {
        const distanciaKm = result.rows[0].elements[0].distance.value / 1000;
        setDistancia(distanciaKm);

        const precioBase = calcularPrecioBase(tipoServicio);
        let precioFinal = precioBase;

        switch (tipoServicio) {
          case "moto_cadete":
            precioFinal = precioBase * Math.ceil(distanciaKm / 2);
            break;
          case "utilitario_paqueteria":
            precioFinal = distanciaKm <= 10 ? precioBase : precioBase * Math.ceil(distanciaKm / 10);
            break;
          case "pickup_flete":
            precioFinal = precioBase * Math.ceil(distanciaKm / 10);
            break;
        }

        setPrecioEstimado(precioFinal);
        form.setValue("precioEstimado", precioFinal.toString());
      }
    } catch (error) {
      console.error("Error calculando distancia:", error);
      toast({
        title: "Error",
        description: "No se pudo calcular la distancia entre las direcciones.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: InsertService) => {
    setFormData(data);
    setShowConfirmDialog(true);
  };

  const confirmarEnvio = async () => {
    if (!formData) return;

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (!response.ok) throw new Error("Error al enviar la solicitud");

      const data = await response.json();
      const trackingUrl = `${window.location.origin}/tracking?code=${data.codigoSeguimiento}`;

      // Generar mensaje para WhatsApp
      const mensaje = `¡Hola! He solicitado un servicio de transporte con el código de seguimiento: ${data.codigoSeguimiento}. Tipo de servicio: ${formData.tipoServicio}. Dirección de recogida: ${formData.direccionCarga}. Dirección de entrega: ${formData.direccionEntrega}`;
      const whatsappUrl = `https://wa.me/5493413820991?text=${encodeURIComponent(mensaje)}`;

      toast({
        title: "¡Solicitud enviada!",
        description: (
          <div className="mt-2">
            <p>Pronto nos pondremos en contacto contigo.</p>
            <p className="mt-2">Puedes seguir tu servicio en:</p>
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {trackingUrl}
            </a>
          </div>
        ),
      });

      setShowConfirmDialog(false);
      form.reset();
      setPrecioEstimado(null);
      setDistancia(null);

      // Redirigir a WhatsApp
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  if (loadError || mapsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 bg-card">
          <div className="text-center text-destructive">
            <h2 className="text-xl font-bold mb-4">Error de Configuración</h2>
            <p className="mb-4">Lo sentimos, hay un problema con el servicio de mapas.</p>
            <div className="bg-muted p-4 rounded-lg text-left">
              <p className="font-medium mb-2">Para solucionar este error:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Verifique que la API key sea correcta</li>
                <li>Asegúrese de habilitar los siguientes servicios en Google Cloud Console:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Maps JavaScript API</li>
                    <li>Places API</li>
                    <li>Distance Matrix API</li>
                    <li>Geocoding API</li>
                  </ul>
                </li>
                <li>Verifique que no haya restricciones de dominio que bloqueen .replit.dev</li>
              </ul>
              {mapsError && (
                <div className="mt-4 p-2 bg-destructive/10 rounded">
                  <p className="text-sm font-mono">{mapsError}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 bg-card">
          <div className="text-center">
            <p className="text-lg">Cargando servicios de mapas...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 bg-card">
        <h1 className="text-3xl font-bold mb-6 text-center">Solicitud de Servicio de Transporte</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Servicio</label>
                <Select
                  onValueChange={(value) => {
                    form.setValue("tipoServicio", value);
                    if (form.getValues("direccionCarga") && form.getValues("direccionEntrega")) {
                      calcularPrecioFinal(
                        form.getValues("direccionCarga"),
                        form.getValues("direccionEntrega"),
                        value
                      );
                    }
                  }}
                  defaultValue="moto_cadete"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo de servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moto_cadete">Moto Cadete (desde $5,000 cada 2km)</SelectItem>
                    <SelectItem value="utilitario_paqueteria">Utilitario Paquetería (desde $10,000 hasta 10km)</SelectItem>
                    <SelectItem value="pickup_flete">Pick Up Flete (desde $20,000 cada 10km)</SelectItem>
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
                <div className="relative">
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      autocomplete.addListener("place_changed", () => {
                        const place = autocomplete.getPlace();
                        if (place.geometry?.location) {
                          form.setValue("latitudCarga", place.geometry.location.lat().toString());
                          form.setValue("longitudCarga", place.geometry.location.lng().toString());
                          form.setValue("direccionCarga", place.formatted_address || "");

                          if (form.getValues("direccionEntrega")) {
                            calcularPrecioFinal(
                              place.formatted_address || "",
                              form.getValues("direccionEntrega"),
                              form.getValues("tipoServicio")
                            );
                          }
                        }
                      });
                    }}
                    options={{ fields: ["formatted_address", "geometry"] }}
                  >
                    <Input
                      {...form.register("direccionCarga")}
                      placeholder="¿Dónde recogemos?"
                    />
                  </Autocomplete>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dirección de Entrega</label>
                <div className="relative">
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      autocomplete.addListener("place_changed", () => {
                        const place = autocomplete.getPlace();
                        if (place.geometry?.location) {
                          form.setValue("latitudEntrega", place.geometry.location.lat().toString());
                          form.setValue("longitudEntrega", place.geometry.location.lng().toString());
                          form.setValue("direccionEntrega", place.formatted_address || "");

                          if (form.getValues("direccionCarga")) {
                            calcularPrecioFinal(
                              form.getValues("direccionCarga"),
                              place.formatted_address || "",
                              form.getValues("tipoServicio")
                            );
                          }
                        }
                      });
                    }}
                    options={{ fields: ["formatted_address", "geometry"] }}
                  >
                    <Input
                      {...form.register("direccionEntrega")}
                      placeholder="¿Dónde entregamos?"
                    />
                  </Autocomplete>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recomendaciones</label>
              <Textarea
                {...form.register("recomendaciones")}
                placeholder="Instrucciones especiales o detalles adicionales"
              />
            </div>

            {distancia && precioEstimado && (
              <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                <p className="text-center">Distancia aproximada: {distancia.toFixed(1)} km</p>
                <p className="text-lg font-semibold text-center">
                  Precio Estimado: ${precioEstimado.toLocaleString()}
                </p>
              </div>
            )}

            <Button type="submit" className="w-full">
              Solicitar Servicio
            </Button>
          </form>
        </Form>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Solicitud de Servicio</DialogTitle>
            <DialogDescription>
              ¿Deseas proceder con la solicitud del servicio?
              {distancia && precioEstimado && (
                <div className="mt-4">
                  <p>Distancia: {distancia.toFixed(1)} km</p>
                  <p className="font-semibold">Precio Estimado: ${precioEstimado.toLocaleString()}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarEnvio}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}