export type Lang = "en" | "es";

export const languages: Lang[] = ["en", "es"];
export const isLang = (value: string): value is Lang => languages.includes(value as Lang);
export const tr = (lang: Lang, en: string, es: string) => (lang === "es" ? es : en);

export const profile = {
  name: "Sebastian Campos",
  role: { en: "Full stack engineer", es: "Ingeniero full stack" },
  email: "sebastian.campos.dev@gmail.com",
  location: { en: "Lima, Peru · Remote (UTC-5)", es: "Lima, Perú · Remoto (UTC-5)" },
  social: {
    github: "https://github.com/sebas-cam",
    linkedin: "https://www.linkedin.com/in/sebastian-campos-marcenal",
    x: "https://x.com/sebitas_code",
  },
};

export const navigation = [
  { href: "", en: "Index", es: "Inicio" },
  { href: "/projects", en: "Projects", es: "Proyectos" },
  { href: "/about", en: "About", es: "Sobre mí" },
  { href: "/services", en: "Services", es: "Servicios" },
  { href: "/contact", en: "Contact", es: "Contacto" },
];

export const projects = [
  {
    slug: "groomie",
    name: "Groomie",
    year: "2025",
    status: { en: "In production", es: "En producción" },
    url: "https://groomie.lat",
    tagline: {
      en: "AI WhatsApp assistant that quotes, books and reschedules appointments for dog groomers.",
      es: "Asistente con IA en WhatsApp que cotiza, agenda y reprograma citas para peluquerías caninas.",
    },
    stack: ["Next.js", "React 19", "MongoDB", "n8n", "OpenAI", "Evolution API", "Redis", "Ably", "Clerk"],
  },
  {
    slug: "kompry",
    name: "Kompry",
    year: "2025",
    status: { en: "In production", es: "En producción" },
    url: "https://kompry.app",
    tagline: {
      en: "AI sales agent on WhatsApp. Connects to Shopify or WooCommerce stores, answers from the live catalog and sends a checkout link with the cart preloaded.",
      es: "Agente de ventas con IA en WhatsApp. Se conecta a tiendas Shopify o WooCommerce, responde desde el catálogo real y envía el link de checkout con el carrito cargado.",
    },
    stack: ["Next.js 16", "React 19", "TypeScript", "Convex", "Clerk", "OpenAI", "Shopify", "WooCommerce"],
  },
  {
    slug: "menucraft",
    name: "MenuCraft",
    year: "2024",
    status: { en: "Client work", es: "Trabajo para cliente" },
    url: "https://menucraft.xyz/",
    tagline: { en: "Digital menus that take orders via WhatsApp.", es: "Menús digitales que reciben pedidos por WhatsApp." },
    stack: ["Next.js", "WhatsApp", "Product design"],
  },
  {
    slug: "sonrie",
    name: "Sonríe",
    year: "2025",
    status: { en: "In production", es: "En producción" },
    url: "https://www.sonrie.lat/dental",
    tagline: { en: "WhatsApp appointment scheduling SaaS for dental clinics. Single plan at S/99/month.", es: "SaaS de agendamiento de citas por WhatsApp para clínicas dentales. Plan único de S/99 al mes." },
    stack: ["Next.js 16", "MongoDB", "Clerk", "Stripe", "Google Calendar API"],
  },
  {
    slug: "notscrolling",
    name: "NotScrolling",
    year: "2025",
    status: { en: "Side project", es: "Proyecto personal" },
    tagline: { en: "WhatsApp bot that downloads and sends back videos from a link.", es: "Bot de WhatsApp que descarga y devuelve videos a partir de un enlace." },
    stack: ["Evolution API", "n8n", "yt-dlp", "ffmpeg", "Postgres", "Coolify"],
  },
];

export const numbers = [
  { value: "5+", en: "Years shipping web products", es: "Años lanzando productos web" },
  { value: "3", en: "SaaS in production", es: "SaaS en producción", detail: "Groomie · Sonríe · Kompry" },
  { value: "~20", en: "Bookings a day handled by the bot", es: "Reservas al día gestionadas por el bot", detail: "Groomie" },
  { value: "C1", en: "English", es: "Inglés" },
];

export const buildPrinciples = [
  { en: "AI-first workflow", es: "Flujo de trabajo con IA", bodyEn: "Claude Code for daily development, MCP integrations, LLM agents with tool calling, and n8n AI workflows.", bodyEs: "Claude Code para el desarrollo diario, integraciones MCP, agentes LLM con llamadas a herramientas y flujos de IA en n8n." },
  { en: "Ship and operate", es: "Lanzar y operar", bodyEn: "I deploy and run my own products: Docker, Coolify, Cloudflare, AWS and CI/CD. I fix what breaks, even outside my original task.", bodyEs: "Despliego y opero mis propios productos: Docker, Coolify, Cloudflare, AWS y CI/CD. Arreglo lo que falla, incluso fuera de mi tarea original." },
  { en: "Product over code", es: "Producto antes que código", bodyEn: "I talk to users, make the early product decisions and iterate on real usage.", bodyEs: "Hablo con los usuarios, tomo las primeras decisiones de producto e itero según el uso real." },
];

export const experience = [
  { periodEn: "Jan 2026 – Now", periodEs: "Ene 2026 – Actualidad", roleEn: "Full Stack Developer (Lead Front End)", roleEs: "Desarrollador Full Stack (Líder Front End)", orgEn: "Scient One · Miami, USA (remote)", orgEs: "Scient One · Miami, EE.UU. (remoto)", bodyEn: "Leads the front end of an AI bot management SaaS where clients create, edit and train AI bots. Node.js/Express REST APIs on MySQL with a multi-tenant schema. Production on AWS with CI/CD. Initial load under 2 seconds via code splitting, lazy loading and tree shaking.", bodyEs: "Lidero el front end de un SaaS de gestión de bots con IA donde los clientes crean, editan y entrenan bots. APIs REST en Node.js/Express sobre MySQL con esquema multi-tenant. Producción en AWS con CI/CD. Carga inicial en menos de 2 segundos mediante code splitting, lazy loading y tree shaking." },
  { periodEn: "Jan 2024 – Jan 2026", periodEs: "Ene 2024 – Ene 2026", roleEn: "React Frontend Developer", roleEs: "Desarrollador Frontend React", orgEn: "Whiz, a 10Pearls company · Lima", orgEs: "Whiz, una empresa de 10Pearls · Lima", bodyEn: "Built and maintained React + TypeScript interfaces for international clients in an agile team. Created reusable UI components, integrated REST APIs and wrote unit tests.", bodyEs: "Construí y mantuve interfaces en React + TypeScript para clientes internacionales en un equipo ágil. Creé componentes de UI reutilizables, integré APIs REST y escribí pruebas unitarias." },
  { periodEn: "2022 – Now", periodEs: "2022 – Actualidad", roleEn: "Founder, freelance product engineering", roleEs: "Fundador, ingeniería de producto freelance", orgEn: "PixelPage LLC · Remote", orgEs: "PixelPage LLC · Remoto", bodyEn: "Product engineering for clients in Peru, Spain and Argentina.", bodyEs: "Ingeniería de producto para clientes en Perú, España y Argentina." },
  { periodEn: "Apr 2022 – Nov 2023", periodEs: "Abr 2022 – Nov 2023", roleEn: "Front End Developer", roleEs: "Desarrollador Front End", orgEn: "Samishop · Lima", orgEs: "Samishop · Lima", bodyEn: "E-commerce platforms; improved page load performance by 20%.", bodyEs: "Plataformas de e-commerce; mejoré el rendimiento de carga de páginas en un 20%." },
  { periodEn: "Sep 2021 – Apr 2022", periodEs: "Sep 2021 – Abr 2022", roleEn: "Full Stack Developer", roleEs: "Desarrollador Full Stack", orgEn: "Comunicados Digitales · Buenos Aires (remote)", orgEs: "Comunicados Digitales · Buenos Aires (remoto)", bodyEn: "Built a platform from scratch with Next.js, Node.js, Express and MySQL.", bodyEs: "Construí una plataforma desde cero con Next.js, Node.js, Express y MySQL." },
  { periodEn: "Nov 2020 – Aug 2021", periodEs: "Nov 2020 – Ago 2021", roleEn: "Front End Developer", roleEs: "Desarrollador Front End", orgEn: "Vicios Burger · Lima", orgEs: "Vicios Burger · Lima", bodyEn: "Online ordering and in-table delivery web app in React and Tailwind.", bodyEs: "App web de pedidos online y entrega en mesa con React y Tailwind." },
];

export const stackGroups = [
  { en: "AI & automation", es: "IA y automatización", items: ["Claude Code", "MCP", "OpenAI", "LLM agents / tool calling", "n8n"] },
  { en: "WhatsApp", es: "WhatsApp", items: ["Evolution API", "Baileys"] },
  { en: "Languages & frameworks", es: "Lenguajes y frameworks", items: ["TypeScript", "JavaScript", "Python", "Node.js", "Express", "Next.js", "React", "Astro", "Tailwind CSS", "shadcn/ui"] },
  { en: "Data & real-time", es: "Datos y tiempo real", items: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Ably", "REST", "GraphQL"] },
  { en: "Infrastructure", es: "Infraestructura", items: ["AWS (EC2, S3, Route 53)", "Docker", "Coolify", "Cloudflare", "Vercel", "CI/CD"] },
  { en: "Auth & payments", es: "Autenticación y pagos", items: ["Clerk", "Clerk Billing", "Culqi"] },
  { en: "Testing", es: "Pruebas", items: ["Jest", "React Testing Library"] },
];

export const services = [
  { en: "Full stack web apps", es: "Web apps full stack", bodyEn: "Product-grade apps from database to pixel — Next.js, React, Node and TypeScript.", bodyEs: "Apps de nivel producto, de la base de datos al píxel — Next.js, React, Node y TypeScript." },
  { en: "WhatsApp & AI automation", es: "Automatización con WhatsApp e IA", bodyEn: "Conversational bots that sell, book and answer — wired to your real data.", bodyEs: "Bots conversacionales que venden, agendan y responden — conectados a tus datos reales." },
  { en: "SaaS MVPs", es: "MVPs SaaS", bodyEn: "From idea to launch: auth, billing, dashboards and infrastructure.", bodyEs: "De la idea al lanzamiento: autenticación, cobros, paneles e infraestructura." },
  { en: "Performance & SEO", es: "Performance y SEO", bodyEn: "Fast, accessible and indexable web products.", bodyEs: "Productos web rápidos, accesibles e indexables." },
];

export const groomie = {
  problem: { en: "Small dog groomers in Peru take every booking on WhatsApp and write it down by hand. They miss messages after hours, double-book appointments, and quoting is slow because price depends on the service, the dog's weight and its coat type.", es: "Las pequeñas peluquerías caninas en Perú reciben todas sus reservas por WhatsApp y las anotan a mano. Pierden mensajes fuera de horario, duplican citas y cotizar toma tiempo porque el precio depende del servicio, el peso del perro y su tipo de pelaje." },
  solution: { en: "A multi-tenant SaaS where each grooming business connects its own WhatsApp by scanning a QR code. An AI assistant then serves its customers, and the owner manages everything from a web dashboard.", es: "Un SaaS multi-tenant donde cada peluquería conecta su propio WhatsApp escaneando un QR. Un asistente con IA atiende a sus clientes y el dueño gestiona todo desde un panel web." },
  features: [
    { en: "Recognizes returning customers by phone number and greets them by name", es: "Reconoce a clientes recurrentes por su número y los saluda por su nombre" },
    { en: "Quotes by service, weight and coat type", es: "Cotiza según servicio, peso y tipo de pelaje" },
    { en: "Shows only truly available time slots and books the appointment", es: "Muestra solo horarios realmente disponibles y reserva la cita" },
    { en: "Reschedules appointments and logs complaints", es: "Reprograma citas y registra reclamos" },
    { en: "For mobile grooming, checks shared locations against coverage zones drawn on a map", es: "Para grooming móvil, valida la ubicación compartida contra zonas de cobertura dibujadas en un mapa" },
    { en: "Human handoff: staff pause the bot and reply from the same WhatsApp", es: "Atención humana: el equipo pausa el bot y responde desde el mismo WhatsApp" },
  ],
  decisions: [
    { titleEn: "The server never trusts the LLM", titleEs: "El servidor nunca confía en el LLM", bodyEn: "Every business rule is validated in the backend, because a prompt can be ignored.", bodyEs: "Cada regla de negocio se valida en el backend, porque un prompt puede ignorarse." },
    { titleEn: "State lives in Redis, not in the prompt", titleEs: "El estado vive en Redis, no en el prompt", bodyEn: "Data needed many turns later is stored server-side, so the model cannot lose or miscopy it.", bodyEs: "Los datos necesarios varios turnos después se guardan en el servidor para que el modelo no los pierda ni copie mal." },
    { titleEn: "Re-validate on write", titleEs: "Revalidar al guardar", bodyEn: "Every appointment is validated again when saved, preventing double bookings.", bodyEs: "Cada cita se valida otra vez al guardarse, evitando reservas duplicadas." },
    { titleEn: "Graceful degradation", titleEs: "Degradación controlada", bodyEn: "If Redis, Ably or OpenAI is down, the app continues without that feature instead of failing.", bodyEs: "Si Redis, Ably u OpenAI fallan, la app sigue funcionando sin esa función en vez de dejar de funcionar." },
  ],
  stack: ["Next.js (App Router, Server Actions)", "React 19", "Tailwind CSS", "MongoDB", "Clerk + Clerk Billing", "Evolution API", "n8n", "OpenAI", "Redis", "Ably", "Leaflet + OpenStreetMap", "Turf"],
};
