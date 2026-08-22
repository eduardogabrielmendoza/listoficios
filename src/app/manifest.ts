import type { MetadataRoute } from "next";
export default function manifest():MetadataRoute.Manifest{return{name:"Listoficios",short_name:"Listoficios",description:"Servicios y profesionales de Bella Vista, Tucumán.",start_url:"/",display:"standalone",background_color:"#f7f9f6",theme_color:"#0d3a32",lang:"es-AR",icons:[{src:"/icon.svg",sizes:"any",type:"image/svg+xml"}]}}
