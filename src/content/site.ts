export const LANGS = ["en", "es"] as const;
export type Lang = (typeof LANGS)[number];
export const isLang = (v: string): v is Lang => (LANGS as readonly string[]).includes(v);
export const CONTACT_EMAIL = "sebastian.campos.dev@gmail.com";
export const FORMSPREE_ID = "";
export const SOCIAL = { github: "https://github.com/sebas-cam", linkedin: "https://www.linkedin.com/in/sebastian-campos-marcenal", x: "https://x.com/sebitas_code" };
type L = Record<Lang, string>;
const t = (en: string, es: string): L => ({ en, es });
export type Slug = "groomie" | "kompry" | "menucraft";
// Retain previously published case URLs; only Groomie is promoted as a complete case study.
export const SLUGS: Slug[] = ["groomie", "kompry", "menucraft"];
export const selectedProjects = [
  { name: "Groomie", year: "2025", status: t("In production", "En producción"), tagline: t("AI WhatsApp assistant that quotes, books and reschedules appointments for dog groomers.", "Asistente con IA en WhatsApp que cotiza, agenda y reprograma citas para peluquerías caninas."), stack: ["Next.js", "React 19", "MongoDB", "n8n", "OpenAI", "Evolution API", "Redis", "Ably", "Clerk"], url: "https://groomie.lat", caseSlug: "groomie" as Slug },
  { name: "Kompry", year: "2025", status: t("In production", "En producción"), tagline: t("AI sales agent on WhatsApp. Connects to Shopify or WooCommerce stores, answers from the live catalog (text, voice notes, photos) and sends a checkout link with the cart preloaded.", "Agente de ventas con IA en WhatsApp. Se conecta a tiendas Shopify o WooCommerce, responde desde el catálogo real (texto, audios, fotos) y envía el link de checkout con el carrito cargado."), stack: ["Next.js 16", "React 19", "TypeScript", "Convex", "Clerk", "Evolution API", "n8n", "OpenAI", "Redis", "Shopify", "WooCommerce"], url: "https://kompry.com" },
  { name: "Sonríe", status: t("In production", "En producción"), tagline: t("WhatsApp appointment scheduling SaaS for dental clinics. Single plan at S/99/month.", "SaaS de agendamiento de citas por WhatsApp para clínicas dentales. Plan único de S/99 al mes."), stack: ["Next.js 16", "React 19", "MongoDB", "Clerk + Stripe", "Evolution API", "n8n", "Redis", "Ably", "Google Calendar API", "Playwright"], url: "https://www.sonrie.lat/dental", monthlyPricePEN: 99 },
  { name: "NotScrolling", status: t("Side project", "Proyecto personal"), tagline: t("WhatsApp and Telegram bot that downloads and sends back videos from a link.", "Bot de WhatsApp y Telegram que descarga y devuelve videos a partir de un enlace."), stack: ["Evolution API", "n8n", "yt-dlp", "ffmpeg", "Postgres", "Coolify"], url: "https://t.me/not_scrolling_bot", detail: t("Self-hosted on a 4 GB VPS · concurrency capped at 2 · Postgres-backed rate limiting · ffmpeg fallback to stay under WhatsApp’s 16 MB limit.", "Autoalojado en un VPS de 4 GB · concurrencia limitada a 2 · límites de uso en Postgres · ffmpeg como alternativa para no superar el límite de 16 MB de WhatsApp."), limits: { vpsGB: 4, concurrency: 2, whatsappMB: 16 } },
];
export const groomie = {
  problem: t("Small dog groomers in Peru take every booking on WhatsApp and write it down by hand. They miss messages after hours, double-book appointments, and quoting is slow because price depends on the service, the dog's weight and its coat type.", "Las pequeñas peluquerías caninas en Perú reciben todas sus reservas por WhatsApp y las anotan a mano. Pierden mensajes fuera de horario, duplican citas y cotizar toma tiempo porque el precio depende del servicio, el peso del perro y su tipo de pelaje."),
  solution: t("A multi-tenant SaaS where each grooming business connects its own WhatsApp by scanning a QR code. An AI assistant then serves its customers, and the owner manages everything from a web dashboard. Businesses run either in-store or as Pet-Movil (a van that grooms at the customer's home).", "Un SaaS multi-tenant donde cada peluquería conecta su propio WhatsApp escaneando un QR. Un asistente con IA atiende a sus clientes y el dueño gestiona todo desde un panel web. Los negocios operan en local o como Pet-Movil (una van que realiza el grooming en casa del cliente)."),
  features: [
    t("Recognizes returning customers by phone number and greets them by name", "Reconoce a clientes recurrentes por su número y los saluda por su nombre"),
    t("Quotes by service, weight and coat type", "Cotiza según servicio, peso y tipo de pelaje"),
    t("Shows only truly available time slots and books the appointment", "Muestra solo horarios realmente disponibles y reserva la cita"),
    t("Reschedules appointments and logs complaints", "Reprograma citas y registra reclamos"),
    t("For mobile grooming: checks the location the customer shares on WhatsApp against coverage zones drawn on a map", "Para grooming móvil: valida la ubicación compartida por WhatsApp contra zonas de cobertura dibujadas en un mapa"),
    t("Optionally analyzes a photo of the pet to verify coat and size (never blocks a booking)", "Opcionalmente analiza una foto de la mascota para verificar pelaje y tamaño (nunca bloquea una reserva)"),
    t("Human handoff: staff pause the bot and reply from the same WhatsApp", "Atención humana: el equipo pausa el bot y responde desde el mismo WhatsApp"),
  ],
  decisions: [
    { title: t("The server never trusts the LLM", "El servidor nunca confía en el LLM"), body: t("Every business rule (mode, coverage, availability, price) is validated in the backend, because a prompt can be ignored.", "Cada regla de negocio (modalidad, cobertura, disponibilidad, precio) se valida en el backend, porque un prompt puede ignorarse.") },
    { title: t("State lives in Redis, not in the prompt", "El estado vive en Redis, no en el prompt"), body: t("Data the bot needs many turns later (location, quoted services) is stored server-side, so the model can't lose or miscopy it.", "Los datos que el bot necesita varios turnos después (ubicación, servicios cotizados) se guardan en el servidor para que el modelo no los pierda ni copie mal.") },
    { title: t("Re-validate on write", "Revalidar al guardar"), body: t("Every appointment is validated again when saved, preventing double bookings between the bot, the dashboard and the web.", "Cada cita se valida otra vez al guardarse, evitando reservas duplicadas entre el bot, el panel y la web.") },
    { title: t("Frozen prices", "Precios congelados"), body: t("The travel fee is stored on the appointment at creation, so changing rates never alters booked appointments.", "La tarifa de desplazamiento se guarda al crear la cita; cambiar las tarifas nunca altera las citas ya reservadas.") },
    { title: t("Graceful degradation", "Degradación controlada"), body: t("If Redis, Ably or OpenAI is down, the app keeps working without that feature instead of failing.", "Si Redis, Ably u OpenAI fallan, la app sigue funcionando sin esa función en vez de dejar de funcionar.") },
    { title: t("External source of truth", "Fuente de verdad externa"), body: t("Subscription state is read from Clerk, never duplicated in the database.", "El estado de la suscripción se lee desde Clerk y nunca se duplica en la base de datos.") },
  ],
  availability: t("Custom scheduling engine: multiple groomers, multiple pets per appointment, per-groomer shifts and a daily capacity per van. Coverage zones are polygons and circles drawn on a Leaflet map and checked with Turf.", "Motor de agendamiento propio: múltiples groomers, varias mascotas por cita, turnos por groomer y capacidad diaria por van. Las zonas de cobertura son polígonos y círculos dibujados en un mapa Leaflet y validados con Turf."),
  architecture: t("WhatsApp customer", "Cliente en WhatsApp"),
  stack: ["Next.js (App Router, Server Actions)", "React 19", "Tailwind CSS", "shadcn/ui", "MongoDB", "Clerk + Clerk Billing", "Evolution API", "n8n", "OpenAI", "Redis", "Ably", "Leaflet + OpenStreetMap", "Turf"],
  role: t("Designed and built the whole product solo: product, frontend, backend, the bot flow in n8n, infrastructure and brand.", "Diseñé y construí todo el producto solo: producto, frontend, backend, flujo del bot en n8n, infraestructura y marca."),
  media: [t("WhatsApp conversation with the bot", "Conversación con el bot en WhatsApp"), t("Dashboard calendar", "Calendario del panel"), t("Coverage map editor", "Editor del mapa de cobertura")],
  results: t("2 businesses · ~20 bookings/day · ~600 bookings/month", "2 negocios · ~20 reservas al día · ~600 reservas al mes"),
};
export const projects = {
  groomie: { name: "Groomie", url: "https://groomie.lat", year: "2025", tagline: t("AI WhatsApp assistant that quotes, books and reschedules appointments for dog groomers.", "Asistente con IA en WhatsApp que cotiza, agenda y reprograma citas para peluquerías caninas."), summary: groomie.solution, problem: groomie.problem, solution: groomie.solution, features: groomie.features, stack: groomie.stack, role: groomie.role },
  kompry: { name: "Kompry", url: "https://kompry.com", year: "2025", tagline: t("AI sales agent on WhatsApp. Connects to Shopify or WooCommerce stores, answers from the live catalog (text, voice notes, photos) and sends a checkout link with the cart preloaded.", "Agente de ventas con IA en WhatsApp. Se conecta a tiendas Shopify o WooCommerce, responde desde el catálogo real (texto, audios, fotos) y envía el link de checkout con el carrito cargado."), summary: t("AI sales agent on WhatsApp. Connects to Shopify or WooCommerce stores, answers from the live catalog (text, voice notes, photos) and sends a checkout link with the cart preloaded.", "Agente de ventas con IA en WhatsApp. Se conecta a tiendas Shopify o WooCommerce, responde desde el catálogo real (texto, audios, fotos) y envía el link de checkout con el carrito cargado."), problem: t("", ""), solution: t("", ""), features: [], stack: [], role: t("", "") },
  menucraft: { name: "MenuCraft", url: "https://menucraft.xyz/", year: "2024", tagline: t("Digital menus that take orders via WhatsApp", "Menús digitales que reciben pedidos por WhatsApp"), summary: t("Digital menus that take orders via WhatsApp.", "Menús digitales que reciben pedidos por WhatsApp."), problem: t("", ""), solution: t("", ""), features: [], stack: [], role: t("", "") },
};
export const numbers = [
  { value: "5+", label: t("Years shipping web products", "Años lanzando productos web") },
  { value: "3", label: t("SaaS in production", "SaaS en producción"), detail: "Groomie · Sonríe · Kompry" },
  { value: "~20", label: t("Bookings a day handled by the bot", "Reservas al día gestionadas por el bot"), detail: "Groomie" },
  { value: "C1", label: t("English", "Inglés") },
];
export const howIBuild = [
  { title: t("AI-first workflow", "Flujo de trabajo con IA"), body: t("Claude Code for daily development, MCP integrations, LLM agents with tool calling, n8n AI workflows.", "Claude Code para el desarrollo diario, integraciones MCP, agentes LLM con llamadas a herramientas y flujos de IA en n8n.") },
  { title: t("Ship and operate", "Lanzar y operar"), body: t("I deploy and run my own products: Docker, Coolify, Cloudflare, AWS, CI/CD. I fix what breaks, even outside my original task.", "Despliego y opero mis propios productos: Docker, Coolify, Cloudflare, AWS y CI/CD. Arreglo lo que falla, incluso fuera de mi tarea original.") },
  { title: t("Product over code", "Producto antes que código"), body: t("I talk to users, make the early product decisions and iterate on real usage.", "Hablo con los usuarios, tomo las primeras decisiones de producto e itero según el uso real.") },
];
export const experience = [
  { period: t("Jan 2026 – Now", "Ene 2026 – Actualidad"), role: t("Full Stack Developer", "Desarrollador Full Stack"), org: t("Scient One · Miami, USA (remote)", "Scient One · Miami, EE.UU. (remoto)"), body: t("Leads the front end of an AI bot management SaaS where clients create, edit and train AI bots (Next.js, Tailwind). Node.js/Express REST APIs on MySQL with a multi-tenant schema. Production on AWS (EC2, S3, Route 53) with CI/CD. Initial load under 2 seconds via code splitting, lazy loading and tree shaking.", "Lidero el front end de un SaaS de gestión de bots con IA donde los clientes crean, editan y entrenan bots (Next.js, Tailwind). APIs REST en Node.js/Express sobre MySQL con esquema multi-tenant. Producción en AWS (EC2, S3, Route 53) con CI/CD. Carga inicial en menos de 2 segundos mediante code splitting, lazy loading y tree shaking.") },
  { period: t("Jan 2024 – Jan 2026", "Ene 2024 – Ene 2026"), role: t("React Frontend Developer", "Desarrollador Frontend React"), org: t("Whiz, a 10Pearls company · Lima", "Whiz, una empresa de 10Pearls · Lima"), body: t("Built and maintained React + TypeScript interfaces for international clients in an agile team.\nCreated reusable UI components that reduced duplicated code across features.\nIntegrated REST APIs and wrote unit tests with Jest and React Testing Library.", "Construí y mantuve interfaces en React + TypeScript para clientes internacionales en un equipo ágil.\nCreé componentes de UI reutilizables que redujeron el código duplicado entre funcionalidades.\nIntegré APIs REST y escribí pruebas unitarias con Jest y React Testing Library.") },
  { period: t("2022 – Now", "2022 – Actualidad"), role: t("Founder, freelance product engineering", "Fundador, ingeniería de producto freelance"), org: t("PixelPage LLC · Remote", "PixelPage LLC · Remoto"), body: t("Product engineering for clients in Peru, Spain and Argentina (see Client work).", "Ingeniería de producto para clientes en Perú, España y Argentina (ver Trabajo para clientes).") },
  { period: t("Apr 2022 – Nov 2023", "Abr 2022 – Nov 2023"), role: t("Front End Developer", "Desarrollador Front End"), org: t("Samishop · Lima", "Samishop · Lima"), body: t("E-commerce platforms; improved page load performance by 20%.", "Plataformas de e-commerce; mejoré el rendimiento de carga de páginas en un 20%.") },
  { period: t("Sep 2021 – Apr 2022", "Sep 2021 – Abr 2022"), role: t("Full Stack Developer", "Desarrollador Full Stack"), org: t("Comunicados Digitales · Buenos Aires (remote)", "Comunicados Digitales · Buenos Aires (remoto)"), body: t("Built a platform from scratch with Next.js, Node.js, Express and MySQL.", "Construí una plataforma desde cero con Next.js, Node.js, Express y MySQL.") },
  { period: t("Nov 2020 – Aug 2021", "Nov 2020 – Ago 2021"), role: t("Front End Developer", "Desarrollador Front End"), org: t("Vicios Burger · Lima", "Vicios Burger · Lima"), body: t("Online ordering and in-table delivery web app in React and Tailwind.", "App web de pedidos online y entrega en mesa con React y Tailwind.") },
];
export const clientWork = [
  { name: "Runta Perú", body: t("Delivery platform for Lima (Rappi-style): customer and driver apps (Capacitor), restaurant PWA, admin panel, local payments, push notifications and real-time tracking.", "Plataforma de delivery para Lima (estilo Rappi): apps de clientes y repartidores (Capacitor), PWA de restaurantes, panel de administración, pagos locales, notificaciones push y seguimiento en tiempo real.") },
  { name: "Casadelux (Madrid)", body: t("Real estate platform: listings, contract signing, buyer management. Next.js, MySQL.", "Plataforma inmobiliaria: propiedades, firma de contratos y gestión de compradores. Next.js, MySQL.") },
  { name: "Nexus Store", body: t("B2B e-commerce with restricted access, admin panel and inventory. Next.js, MySQL.", "E-commerce B2B con acceso restringido, panel de administración e inventario. Next.js, MySQL.") },
  { name: "Monissos", body: t("WooCommerce store for a kitchenware retailer with Culqi payments.", "Tienda WooCommerce para un comercio de artículos de cocina con pagos Culqi.") },
  { name: "MenuCraft", body: t("Digital menus that take orders via WhatsApp. (2024)", "Menús digitales que reciben pedidos por WhatsApp. (2024)") },
];
export const stackGroups = [
  { title: t("AI & automation", "IA y automatización"), items: ["Claude Code", "MCP", "OpenAI", "LLM agents / tool calling", "n8n"] },
  { title: t("WhatsApp", "WhatsApp"), items: ["Evolution API", "Baileys"] },
  { title: t("Languages & frameworks", "Lenguajes y frameworks"), items: ["TypeScript", "JavaScript", "Python", "Node.js", "Express", "Next.js", "React", "Vite", "Tailwind CSS", "shadcn/ui"] },
  { title: t("Data & real-time", "Datos y tiempo real"), items: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Ably", "REST", "GraphQL"] },
  { title: t("Infrastructure", "Infraestructura"), items: ["AWS (EC2, S3, Route 53)", "Docker", "Coolify", "Cloudflare", "Vercel", "CI/CD"] },
  { title: t("Auth & payments", "Autenticación y pagos"), items: ["Clerk", "Clerk Billing", "Culqi"] },
  { title: t("Testing", "Pruebas"), items: ["Jest", "React Testing Library"] },
];
export const stack = stackGroups.flatMap((g) => g.items);
export const education = [
  { title: t("Software Development", "Desarrollo de Software"), detail: t("ISIL, Lima · 2020–2023", "ISIL, Lima · 2020–2023") },
  { title: t("Computing and Informatics", "Computación e Informática"), detail: t("Cibertec · In progress", "Cibertec · En curso") },
  { title: t("AWS Associate certification", "Certificación AWS Associate"), detail: t("In preparation", "En preparación") },
  { title: t("Languages", "Idiomas"), detail: t("Spanish (native), English (C1, ICPNA)", "Español (nativo), inglés (C1, ICPNA)") },
];
export const services = [
  { title: t("Full stack web apps", "Web apps full stack"), body: t("Product-grade apps from database to pixel — Next.js, React, Node and TypeScript.", "Apps de nivel producto, de la base de datos al píxel — Next.js, React, Node y TypeScript.") },
  { title: t("WhatsApp & AI automation", "Automatización con WhatsApp e IA"), body: t("Conversational bots that sell, book and answer — wired to your real data.", "Bots conversacionales que venden, agendan y responden — conectados a tus datos reales.") },
  { title: t("SaaS MVPs", "MVPs SaaS"), body: t("From idea to launch: auth, billing, dashboards and infrastructure.", "De la idea al lanzamiento: autenticación, cobros, paneles e infraestructura.") },
  { title: t("Performance & SEO", "Performance y SEO"), body: t("Fast, accessible and indexable web products.", "Productos web rápidos, accesibles e indexables.") },
];
export const ui = {
  nav: { home: t("Index", "Inicio"), projects: t("Projects", "Proyectos"), about: t("About", "Sobre mí"), services: t("Services", "Servicios"), contact: t("Contact", "Contacto") },
  name: t("Sebastian Campos", "Sebastian Campos"), role: t("Full stack engineer", "Ingeniero full stack"),
  heroLine: t("Full stack engineer building products with AI.", "Ingeniero full stack creando productos centrados en WhatsApp con IA."),
  heroSub: t("I design, ship and run my own SaaS on WhatsApp — from the AI agent to the infrastructure. Based in Lima, Peru · Remote.", "Diseño, lanzo y opero mis propios SaaS en WhatsApp — desde el agente de IA hasta la infraestructura. Desde Lima, Perú · Remoto."),
  markets: t("Working with teams and clients in the US, Latin America and Spain.", "Trabajo con equipos y clientes en EE.UU., Latinoamérica y España."),
  ctaWork: t("View work", "Ver trabajo"), ctaContact: t("Get in touch", "Contáctame"), cv: t("Download CV", "Descargar CV"),
  aboutIntro: t("I design, ship and run my own SaaS on WhatsApp — from the AI agent to the infrastructure. Based in Lima, Peru · Remote.", "Diseño, lanzo y opero mis propios SaaS en WhatsApp — desde el agente de IA hasta la infraestructura. Desde Lima, Perú · Remoto."),
  whatIDo: t("Services", "Servicios"), featured: t("Selected work", "Trabajo seleccionado"), how: t("How I build", "Cómo construyo"),
  howIntro: t("AI is part of how I work every day. I use it to ship faster, and I keep the fundamentals to understand, debug and own what goes to production.", "La IA es parte de mi trabajo diario. La uso para lanzar más rápido y mantengo los fundamentos para entender, depurar y hacerme responsable de lo que llega a producción."),
  experience: t("Experience", "Experiencia"), clients: t("Client work", "Trabajo para clientes"), stack: t("Stack", "Stack"), education: t("Education", "Educación"),
  contactTitle: t("Let's build something.", "Construyamos algo."), contactSub: t("Open to full-time roles and freelance projects.", "Disponible para roles full-time y proyectos freelance."),
  viewCase: t("Case study", "Caso de estudio"), visit: t("Live site", "Sitio web"), back: t("Back to work", "Volver a proyectos"), results: t("Results", "Resultados"),
  problem: t("The problem", "El problema"), solution: t("What I built", "Lo que construí"), features: t("What the bot does", "Qué hace el bot"), decisions: t("Engineering decisions", "Decisiones de ingeniería"), availability: t("Availability engine", "Motor de disponibilidad"), architecture: t("Architecture", "Arquitectura"), role2: t("My role", "Mi rol"), media: t("Media", "Imágenes y demo"), pendingImage: t("Image pending", "Imagen pendiente"), video: t("Booking demo from WhatsApp", "Demo de reserva desde WhatsApp"), pendingVideo: t("Optional video · pending", "Video opcional · pendiente"), next: t("Next project", "Siguiente proyecto"),
  process: t("Process", "Proceso"), steps: [t("Discovery", "Descubrimiento"), t("Design", "Diseño"), t("Build", "Construcción"), t("Launch", "Lanzamiento")],
  menu: t("Menu", "Menú"), email: t("Email", "Correo"), location: t("Location", "Ubicación"), locationValue: t("Lima, Peru · Remote", "Lima, Perú · Remoto"), sideLabel: t("Sebastian Campos — Full stack — Lima", "Sebastian Campos — Full stack — Lima"),
  metaTitle: t("Sebastian Campos — Full stack engineer", "Sebastian Campos — Ingeniero full stack · Productos WhatsApp + IA"),
  metaDescription: t("Full stack engineer in Lima building SaaS with AI. Next.js, Node.js, AWS.", "Ingeniero full stack en Lima creando SaaS. Next.js, Node.js, AWS."),
  form: { name: t("Name", "Nombre"), email: t("Email", "Correo"), message: t("Message", "Mensaje"), send: t("Send message", "Enviar mensaje"), sent: t("Thanks — I'll reply within 48h.", "Gracias — respondo en menos de 48h."), error: t("Something failed. Email me directly.", "Algo falló. Escríbeme directamente."), invalid: t("Please check the highlighted fields.", "Revisa los campos marcados.") },
};
