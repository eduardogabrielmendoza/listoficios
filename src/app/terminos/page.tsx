import type { Metadata } from "next"; import { LegalDocument,type LegalSection } from "@/components/legal-document";
export const metadata:Metadata={title:"Términos | Listoficios",description:"Borrador de términos de Listoficios."};
const sections:LegalSection[]=[
{id:"plataforma",title:"Rol de Listoficios",content:<p>Listoficios es un directorio que facilita el encuentro entre personas y profesionales independientes. No presta los oficios publicados, no emplea a quienes aparecen y no participa del acuerdo.</p>},
{id:"usuarios",title:"Cuenta y responsabilidades",content:<p>Cada persona debe proporcionar información verdadera, cuidar su acceso y usar el servicio de forma lícita. Los profesionales son responsables de habilitaciones o matrículas aplicables.</p>},
{id:"perfiles",title:"Publicaciones",content:<p>No se permite contenido engañoso, discriminatorio, peligroso o ajeno. La demo no verifica identidades ni garantiza la calidad de un servicio.</p>},
{id:"contacto",title:"Presupuestos y contratación",content:<p>Alcance, precio, materiales, tiempos y condiciones se acuerdan directamente. Listoficios no procesa pagos, reservas, contratos ni mensajes internos.</p>},
{id:"opiniones",title:"Opiniones y reportes",content:<p>Las opiniones visibles son datos demo. Los mecanismos reales de reseña, reporte y moderación se definirán antes del lanzamiento operativo.</p>},
{id:"propiedad",title:"Propiedad intelectual",content:<p>La marca e interfaz están protegidas. Quien publique textos o imágenes deberá contar con autorización para utilizarlos.</p>},
{id:"limites",title:"Disponibilidad y límites",content:<p>No puede garantizarse disponibilidad permanente ni ausencia de riesgos. Nada limita derechos irrenunciables reconocidos por la ley argentina.</p>},
{id:"ley",title:"Ley aplicable",content:<p>Este borrador considera la <a href="https://www.argentina.gob.ar/normativa/nacional/ley-24240-638/actualizacion">Ley 24.240 de Defensa del Consumidor</a> y la normativa argentina aplicable.</p>}
]; export default function TermsPage(){return <LegalDocument kind="Términos de uso" title="Reglas claras para conectar con confianza." copy="Estas condiciones preliminares explican el alcance del directorio y las responsabilidades de quienes lo usan." sections={sections}/>;}
