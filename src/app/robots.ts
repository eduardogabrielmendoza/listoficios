import type { MetadataRoute } from "next";
export default function robots():MetadataRoute.Robots{const base=process.env.APP_URL??"http://localhost:3000";return{rules:[{userAgent:"*",allow:["/","/profesionales","/servicios","/zonas","/ayuda","/nosotros","/seguridad","/como-funciona"],disallow:["/panel","/admin","/api/"]}],sitemap:`${base}/sitemap.xml`,host:base}}
