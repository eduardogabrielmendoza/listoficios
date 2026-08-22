import type { Metadata } from "next";
import { LegalDocument, type LegalSection } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Privacidad | Listoficios",
  description: "Borrador de privacidad de Listoficios.",
};

const sections: LegalSection[] = [
  {
    id: "alcance",
    title: "Alcance y responsable",
    content: <p>Esta política explica el tratamiento previsto para visitantes, personas con cuenta y profesionales. La identidad y los canales formales del responsable se completarán antes del lanzamiento público.</p>,
  },
  {
    id: "datos",
    title: "Datos que tratamos",
    content: <><p>Podemos tratar nombre, correo, credenciales procesadas por Supabase Auth, datos profesionales, zonas, imágenes, favoritos, contactos iniciados, opiniones, reportes y soporte.</p><p>No solicitamos DNI, documentos ni coordenadas exactas. Las contraseñas no son accesibles en texto plano y el WhatsApp se cifra antes de guardarse.</p></>,
  },
  {
    id: "finalidades",
    title: "Finalidad y consentimiento",
    content: <p>Usamos los datos para administrar cuentas, publicar servicios, facilitar contactos, moderar contenido, mostrar métricas agregadas y responder consultas. Bella Vista y sus zonas son catálogos; no usamos GPS.</p>,
  },
  {
    id: "infraestructura",
    title: "Almacenamiento y proveedores",
    content: <p>La aplicación se aloja en Railway, los datos y las cuentas en Supabase, y las imágenes en Cloudinary. Las cargas pasan por una ruta controlada de Listoficios. Podrán incorporarse proveedores adicionales solo después de documentarlos.</p>,
  },
  {
    id: "seguridad",
    title: "Seguridad y conservación",
    content: <p>Se aplican sesiones seguras, control de acceso, cifrado en tránsito, cifrado de teléfonos, límites de frecuencia y registros de moderación. Los plazos de conservación y borrado definitivo deberán aprobarse antes del lanzamiento.</p>,
  },
  {
    id: "derechos",
    title: "Derechos",
    content: <p>Se habilitarán canales para solicitar acceso, rectificación, actualización y supresión. Las consultas pueden registrarse desde el Centro de ayuda mientras se define el canal legal definitivo.</p>,
  },
  {
    id: "normativa",
    title: "Marco normativo",
    content: <p>El borrador toma como referencia la <a href="https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/actualizacion">Ley 25.326</a> y el <a href="https://www.argentina.gob.ar/normativa/nacional/70368/actualizacion">Decreto 1558/2001</a>.</p>,
  },
];

export default function PrivacyPage() {
  return <LegalDocument kind="Privacidad" title="Tus datos deben tener un propósito claro." copy="Explicamos qué trata Listoficios, para qué y qué controles aplicamos en esta primera versión." sections={sections} />;
}
