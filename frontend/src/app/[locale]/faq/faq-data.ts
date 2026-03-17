export type LocalizedText = {
  es: string;
  en: string;
};

export type FaqCategoryKey =
  | "chatbots"
  | "agents"
  | "n8n"
  | "whatsapp"
  | "integrations"
  | "training"
  | "delivery";

export type FaqTagKey =
  | "architecture"
  | "deployment"
  | "security"
  | "support"
  | "sales"
  | "operations"
  | "roi"
  | "automation"
  | "integrations"
  | "whatsapp"
  | "training"
  | "governance"
  | "sevilla"
  | "spain";

export type FaqEntry = {
  id: string;
  category: FaqCategoryKey;
  tags: FaqTagKey[];
  question: LocalizedText;
  answer: LocalizedText;
  relatedPath?: string;
};

export const localizeFaq = (locale: string, value: LocalizedText) =>
  locale.startsWith("en") ? value.en : value.es;

export const faqCategories: Record<FaqCategoryKey, LocalizedText> = {
  chatbots: { es: "Chatbots", en: "Chatbots" },
  agents: { es: "Agentes IA", en: "AI agents" },
  n8n: { es: "n8n", en: "n8n" },
  whatsapp: { es: "WhatsApp", en: "WhatsApp" },
  integrations: { es: "Integraciones", en: "Integrations" },
  training: { es: "Formación", en: "Training" },
  delivery: { es: "Despliegue", en: "Delivery" },
};

export const faqTagLabels: Record<FaqTagKey, LocalizedText> = {
  architecture: { es: "Arquitectura", en: "Architecture" },
  deployment: { es: "Despliegue", en: "Deployment" },
  security: { es: "Seguridad", en: "Security" },
  support: { es: "Soporte", en: "Support" },
  sales: { es: "Ventas", en: "Sales" },
  operations: { es: "Operaciones", en: "Operations" },
  roi: { es: "ROI", en: "ROI" },
  automation: { es: "Automatización", en: "Automation" },
  integrations: { es: "Integraciones", en: "Integrations" },
  whatsapp: { es: "WhatsApp", en: "WhatsApp" },
  training: { es: "Formación", en: "Training" },
  governance: { es: "Gobernanza", en: "Governance" },
  sevilla: { es: "Sevilla", en: "Seville" },
  spain: { es: "España", en: "Spain" },
};

export const faqEntries: FaqEntry[] = [
  {
    id: "chatbot-rag-docs",
    category: "chatbots",
    tags: ["architecture", "support", "automation"],
    question: {
      es: "¿Un chatbot empresarial puede responder desde PDFs, FAQs y documentación interna a la vez?",
      en: "Can a business chatbot answer from PDFs, FAQs and internal documentation at the same time?",
    },
    answer: {
      es: "Sí. La arquitectura correcta unifica fuentes, normaliza formatos, trocea por tipo documental y aplica ranking antes de responder. Lo importante no es solo indexar, sino decidir qué fuente pesa más según el caso.",
      en: "Yes. The right architecture unifies sources, normalizes formats, chunks by document type and applies ranking before answering. The key is not only indexing, but deciding which source should carry more weight in each case.",
    },
    relatedPath: "/chatbots-empresas-sevilla",
  },
  {
    id: "chatbot-quality",
    category: "chatbots",
    tags: ["architecture", "roi", "support"],
    question: {
      es: "¿Cómo se mide si un chatbot está funcionando bien más allá de que responda rápido?",
      en: "How do you measure whether a chatbot is working well beyond simply answering fast?",
    },
    answer: {
      es: "Miramos deflexión por intención, precisión de escalado, exactitud sobre un set de preguntas reales y calidad de cita. La velocidad sola puede ocultar respuestas incorrectas o handoffs innecesarios.",
      en: "We look at deflection by intent, escalation precision, accuracy on a real question set and citation quality. Speed alone can hide wrong answers or unnecessary handoffs.",
    },
    relatedPath: "/chatbots-empresas-sevilla",
  },
  {
    id: "chatbot-website-whatsapp",
    category: "chatbots",
    tags: ["whatsapp", "integrations", "support"],
    question: {
      es: "¿Tiene sentido usar el mismo conocimiento en el chatbot web y en WhatsApp?",
      en: "Does it make sense to use the same knowledge base in the website chatbot and WhatsApp?",
    },
    answer: {
      es: "Sí, si separas bien capa de conocimiento y capa de canal. La lógica, los documentos y las métricas pueden compartirse; lo que cambia es el tono, el ritmo conversacional y las restricciones del canal.",
      en: "Yes, if you separate the knowledge layer from the channel layer. Logic, documents and metrics can be shared; what changes is tone, pacing and the channel constraints.",
    },
    relatedPath: "/automatizacion-whatsapp-business-sevilla",
  },
  {
    id: "agent-vs-chatbot",
    category: "agents",
    tags: ["architecture", "operations", "automation"],
    question: {
      es: "¿Qué diferencia hay entre un chatbot y un agente IA de atención al cliente?",
      en: "What is the difference between a chatbot and an AI customer-support agent?",
    },
    answer: {
      es: "Un chatbot responde; un agente además consulta herramientas, ejecuta acciones y toma decisiones dentro de una política. La diferencia real está en el nivel de acceso, validación y responsabilidad operativa.",
      en: "A chatbot answers; an agent also queries tools, executes actions and makes decisions within a policy. The real difference is the level of access, validation and operational responsibility.",
    },
    relatedPath: "/agentes-ia-atencion-cliente-sevilla",
  },
  {
    id: "agent-human-approval",
    category: "agents",
    tags: ["security", "operations", "governance"],
    question: {
      es: "¿Cuándo debería exigirse aprobación humana antes de que un agente ejecute algo?",
      en: "When should human approval be required before an agent executes something?",
    },
    answer: {
      es: "Cuando la acción modifica dinero, inventario, condiciones contractuales o datos sensibles. Las tareas de lectura pueden automatizarse antes; las de escritura deben entrar con límites y aprobaciones explícitas.",
      en: "Whenever the action affects money, inventory, contract conditions or sensitive data. Read operations can be automated earlier; write operations should enter with explicit limits and approvals.",
    },
    relatedPath: "/agentes-ia-atencion-cliente-sevilla",
  },
  {
    id: "agent-tools",
    category: "agents",
    tags: ["integrations", "operations", "support"],
    question: {
      es: "¿Un agente puede consultar ERP, CRM y ticketing en la misma conversación?",
      en: "Can an agent query ERP, CRM and ticketing inside the same conversation?",
    },
    answer: {
      es: "Sí, siempre que definas bien permisos, orden de consulta y trazabilidad. La parte compleja no es la conexión técnica, sino la política de qué consultar y qué hacer cuando los sistemas discrepan.",
      en: "Yes, as long as permissions, query order and traceability are well defined. The hard part is not the connection itself, but the policy for what to query and what happens when systems disagree.",
    },
    relatedPath: "/integraciones-crm-erp-sevilla",
  },
  {
    id: "n8n-custom-code",
    category: "n8n",
    tags: ["architecture", "automation", "operations"],
    question: {
      es: "¿Cuándo conviene usar n8n y cuándo conviene desarrollar algo a medida?",
      en: "When should you use n8n and when should you build custom code?",
    },
    answer: {
      es: "n8n encaja bien cuando necesitas orquestación rápida, conectores y visibilidad sobre tareas operativas. El código a medida aparece cuando hay mucha lógica propietaria, requisitos extremos de latencia o necesidad de producto reusable.",
      en: "n8n fits well when you need fast orchestration, connectors and visibility over operational tasks. Custom code enters when there is heavy proprietary logic, extreme latency requirements or a reusable product need.",
    },
    relatedPath: "/automatizacion-n8n-sevilla",
  },
  {
    id: "n8n-onprem",
    category: "n8n",
    tags: ["deployment", "security", "integrations"],
    question: {
      es: "¿n8n puede desplegarse on-prem o en red privada?",
      en: "Can n8n be deployed on-prem or in a private network?",
    },
    answer: {
      es: "Sí. De hecho suele ser lo más sensato cuando hay sistemas internos, bases privadas o políticas estrictas de acceso. El reto está en observabilidad, backups y gestión de cambios, no solo en levantar el contenedor.",
      en: "Yes. It is often the sensible choice when there are internal systems, private databases or strict access policies. The challenge is observability, backups and change management, not just spinning up a container.",
    },
    relatedPath: "/automatizacion-n8n-sevilla",
  },
  {
    id: "n8n-monitoring",
    category: "n8n",
    tags: ["operations", "roi", "deployment"],
    question: {
      es: "¿Cómo se controla que un workflow en n8n no falle en silencio?",
      en: "How do you prevent an n8n workflow from failing silently?",
    },
    answer: {
      es: "Con alertas, retries diseñados para ser idempotentes, dashboards por workflow y una política clara de quién responde cada incidencia. Si nadie es dueño del flujo, la automatización no está realmente operativa.",
      en: "With alerts, idempotent retries, per-workflow dashboards and a clear policy for who owns each incident. If nobody owns the flow, the automation is not truly operational.",
    },
    relatedPath: "/automatizacion-n8n-sevilla",
  },
  {
    id: "whatsapp-official-api",
    category: "whatsapp",
    tags: ["whatsapp", "deployment", "sales"],
    question: {
      es: "¿Trabajar con la API oficial de WhatsApp Business es imprescindible?",
      en: "Is working with the official WhatsApp Business API essential?",
    },
    answer: {
      es: "Si el canal es serio y debe escalar, sí. La API oficial permite gobernar plantillas, proveedores, números y métricas con estabilidad; lo contrario suele terminar en deuda técnica o bloqueos del canal.",
      en: "If the channel matters and needs to scale, yes. The official API lets you govern templates, providers, numbers and metrics with stability; the alternative usually ends in technical debt or channel blocking.",
    },
    relatedPath: "/automatizacion-whatsapp-business-sevilla",
  },
  {
    id: "whatsapp-attribution",
    category: "whatsapp",
    tags: ["whatsapp", "roi", "sales"],
    question: {
      es: "¿Cómo se atribuyen ventas o oportunidades reales a WhatsApp?",
      en: "How do you attribute actual sales or opportunities to WhatsApp?",
    },
    answer: {
      es: "Necesitas registrar conversación, origen, intención, paso comercial y resultado en CRM. Sin esa cadena de datos, el canal parece activo pero no sabes qué parte vende y qué parte solo consume tiempo.",
      en: "You need to record conversation, source, intent, commercial stage and outcome inside the CRM. Without that data chain, the channel looks active but you do not know what actually sells and what only consumes time.",
    },
    relatedPath: "/automatizacion-whatsapp-business-sevilla",
  },
  {
    id: "whatsapp-sales-support",
    category: "whatsapp",
    tags: ["whatsapp", "support", "sales"],
    question: {
      es: "¿Tiene sentido mezclar soporte y ventas en el mismo número de WhatsApp?",
      en: "Does it make sense to mix support and sales in the same WhatsApp number?",
    },
    answer: {
      es: "Depende del volumen y de cómo se diseñe el routing. Puede funcionar si hay clasificación temprana y SLAs distintos; si no, el canal se vuelve confuso y ambos equipos acaban compitiendo por el mismo hilo.",
      en: "It depends on volume and routing design. It can work if there is early classification and separate SLAs; otherwise the channel becomes confusing and both teams start competing for the same thread.",
    },
    relatedPath: "/automatizacion-whatsapp-business-sevilla",
  },
  {
    id: "integration-duplicates",
    category: "integrations",
    tags: ["integrations", "operations", "security"],
    question: {
      es: "¿Cómo se evitan duplicados al conectar CRM y ERP?",
      en: "How do you avoid duplicates when connecting CRM and ERP?",
    },
    answer: {
      es: "Con identificadores estables, ownership por campo, reglas de deduplicación y reconciliación. Sin ese trabajo previo, cualquier conector termina amplificando el problema en lugar de resolverlo.",
      en: "With stable identifiers, field ownership, deduplication rules and reconciliation. Without that groundwork, any connector amplifies the problem instead of solving it.",
    },
    relatedPath: "/integraciones-crm-erp-sevilla",
  },
  {
    id: "integration-source-of-truth",
    category: "integrations",
    tags: ["integrations", "governance", "operations"],
    question: {
      es: "¿Qué significa definir un source of truth en una integración?",
      en: "What does defining a source of truth mean in an integration?",
    },
    answer: {
      es: "Significa decidir qué sistema manda cada dato y bajo qué condiciones puede sobrescribirse. Sin esa definición, el dato se sincroniza, sí, pero nadie sabe cuál es el correcto cuando aparece un conflicto.",
      en: "It means deciding which system owns each piece of data and under which conditions it can be overwritten. Without that definition, data may sync, but nobody knows which version is correct when conflict appears.",
    },
    relatedPath: "/integraciones-crm-erp-sevilla",
  },
  {
    id: "integration-first-scope",
    category: "integrations",
    tags: ["deployment", "integrations", "roi"],
    question: {
      es: "¿Cuánto debería abarcar la primera fase de una integración CRM/ERP?",
      en: "How much should the first phase of a CRM/ERP integration cover?",
    },
    answer: {
      es: "Lo justo para resolver un proceso crítico de extremo a extremo: por ejemplo alta de cliente, oportunidad, pedido y factura. Empezar por todo a la vez suele ocultar errores de modelo y bloquear el avance.",
      en: "Just enough to solve one critical process end to end: for example customer creation, opportunity, order and invoice. Starting with everything at once usually hides model errors and blocks progress.",
    },
    relatedPath: "/integraciones-crm-erp-sevilla",
  },
  {
    id: "training-who-should-attend",
    category: "training",
    tags: ["training", "operations", "sales"],
    question: {
      es: "¿Quién debería asistir a una formación IA para que tenga impacto real?",
      en: "Who should attend an AI training program for it to have real impact?",
    },
    answer: {
      es: "Quien ejecuta el trabajo diario y quien define criterios o aprueba cambios. Si asisten solo perfiles estratégicos o solo perfiles ejecutores, la adopción queda coja.",
      en: "The people doing the work every day and the ones defining criteria or approving changes. If only strategic profiles or only executors attend, adoption stays incomplete.",
    },
    relatedPath: "/formacion-ia-pymes-sevilla",
  },
  {
    id: "training-governance",
    category: "training",
    tags: ["training", "governance", "security"],
    question: {
      es: "¿Una formación en IA debería incluir gobernanza y privacidad o solo productividad?",
      en: "Should AI training include governance and privacy or only productivity?",
    },
    answer: {
      es: "Debe incluir ambas. Enseñar productividad sin límites de uso, herramientas aprobadas y manejo del dato genera más riesgo que mejora real.",
      en: "It should include both. Teaching productivity without usage limits, approved tools and data handling creates more risk than real improvement.",
    },
    relatedPath: "/formacion-ia-pymes-sevilla",
  },
  {
    id: "training-roi",
    category: "training",
    tags: ["training", "roi", "operations"],
    question: {
      es: "¿Cómo se mide el ROI de una formación IA en equipos pequeños?",
      en: "How do you measure ROI from AI training in small teams?",
    },
    answer: {
      es: "El retorno se mide sobre tareas concretas: tiempo de preparación, calidad de documentación, velocidad de respuesta o reducción de errores. Si no aterrizas en tareas, el ROI se vuelve una opinión.",
      en: "Return is measured on concrete tasks: preparation time, documentation quality, response speed or error reduction. If you do not anchor it to tasks, ROI becomes an opinion.",
    },
    relatedPath: "/formacion-ia-pymes-sevilla",
  },
  {
    id: "delivery-seville-spain",
    category: "delivery",
    tags: ["sevilla", "spain", "deployment"],
    question: {
      es: "¿Trabajáis solo en Sevilla o también fuera de Andalucía?",
      en: "Do you only work in Seville or also outside Andalusia?",
    },
    answer: {
      es: "El equipo opera desde Sevilla, pero los proyectos se despliegan en toda España y en entornos remotos europeos. La geografía importa menos que el acceso a sistemas, la claridad del proceso y el modelo de soporte.",
      en: "The team operates from Seville, but projects are deployed across Spain and remote European environments. Geography matters less than system access, process clarity and the support model.",
    },
    relatedPath: "/contact",
  },
  {
    id: "delivery-pilot-first",
    category: "delivery",
    tags: ["deployment", "roi", "spain"],
    question: {
      es: "¿Por qué casi siempre proponéis empezar con un piloto en vez de un despliegue total?",
      en: "Why do you almost always propose starting with a pilot instead of a full rollout?",
    },
    answer: {
      es: "Porque el piloto permite medir calidad, riesgo y adopción sobre un proceso real antes de ampliar alcance. Saltarse esa fase suele encarecer el proyecto y retrasar el aprendizaje que de verdad importa.",
      en: "Because the pilot lets you measure quality, risk and adoption on a real process before widening scope. Skipping that phase usually makes the project more expensive and delays the learning that actually matters.",
    },
    relatedPath: "/contact",
  },
  {
    id: "what-is-ai-agent",
    category: "agents",
    tags: ["automation", "operations"],
    question: {
      es: "¿Qué es un agente de IA para negocios y cómo puede ayudar a mi empresa?",
      en: "What is an AI agent for business and how can it help my company?",
    },
    answer: {
      es: "Un agente de IA es un sistema inteligente que puede realizar tareas específicas de forma autónoma: responder consultas de clientes, procesar documentos, gestionar citas o automatizar flujos de trabajo. Esto significa ahorro de tiempo, reducción de errores humanos y disponibilidad 24/7. Por ejemplo, una empresa puede tener un agente que gestione incidencias automáticamente por WhatsApp.",
      en: "An AI agent is an intelligent system that can perform specific tasks autonomously: answering customer queries, processing documents, managing appointments or automating workflows. This means time savings, reduced human error and 24/7 availability. For example, a business can have an agent that automatically handles incidents over WhatsApp.",
    },
    relatedPath: "/agentes-ia-atencion-cliente-sevilla",
  },
  {
    id: "automation-cost",
    category: "delivery",
    tags: ["roi", "sales"],
    question: {
      es: "¿Cuánto cuesta implementar automatización con IA en mi empresa?",
      en: "How much does it cost to implement AI automation in my company?",
    },
    answer: {
      es: "El coste varía según la complejidad del proyecto. Los proyectos simples como chatbots de WhatsApp o automatizaciones básicas pueden arrancar desde presupuestos accesibles para PYMEs. Ofrecemos consultas gratuitas donde analizamos tu caso específico y damos un presupuesto personalizado. La mayoría de nuestros clientes recuperan la inversión en menos de 6 meses.",
      en: "Cost varies depending on project complexity. Simple projects like WhatsApp chatbots or basic automations can start at budgets accessible to SMEs. We offer free consultations where we analyze your specific case and provide a tailored quote. Most of our clients recover their investment in under 6 months.",
    },
    relatedPath: "/contact",
  },
  {
    id: "no-technical-knowledge-needed",
    category: "training",
    tags: ["training", "operations"],
    question: {
      es: "¿Necesito conocimientos técnicos para usar sistemas de automatización?",
      en: "Do I need technical knowledge to use automation systems?",
    },
    answer: {
      es: "No, en absoluto. Diseñamos todas nuestras soluciones para que sean intuitivas y fáciles de usar, e incluimos formación práctica para tu equipo. También ofrecemos cursos de IA donde aprenderás a usar herramientas como ChatGPT y automatizaciones sin necesidad de conocimientos previos de programación.",
      en: "Not at all. We design all our solutions to be intuitive and easy to use, and we include hands-on training for your team. We also offer AI courses where you will learn to use tools like ChatGPT and automations without any prior programming knowledge.",
    },
    relatedPath: "/formacion-ia-pymes-sevilla",
  },
  {
    id: "ordinaly-differentiators",
    category: "delivery",
    tags: ["sevilla", "spain", "operations"],
    question: {
      es: "¿Qué diferencia a Ordinaly de otras empresas de automatización?",
      en: "What sets Ordinaly apart from other automation companies?",
    },
    answer: {
      es: "Somos un equipo local en Sevilla que entiende las necesidades específicas de las empresas andaluzas. No somos una consultora internacional que aplica soluciones genéricas. Nos especializamos en PYMEs y sectores concretos (inmobiliarias, administradores de fincas, marketing, retail) y combinamos automatización con formación práctica para que tu equipo sea autónomo.",
      en: "We are a local team in Seville that understands the specific needs of Andalusian businesses. We are not an international consultancy applying generic solutions. We specialize in SMEs and specific sectors (real estate, property management, marketing, retail) and combine automation with hands-on training so your team becomes self-sufficient.",
    },
    relatedPath: "/contact",
  },
  {
    id: "implementation-timeline",
    category: "delivery",
    tags: ["deployment", "roi"],
    question: {
      es: "¿Cuánto tiempo tarda en implementarse un proyecto de automatización?",
      en: "How long does it take to implement an automation project?",
    },
    answer: {
      es: "Los proyectos simples como chatbots o automatizaciones básicas pueden estar funcionando en 2–4 semanas. Proyectos más complejos como workflows avanzados o integraciones con CRM/ERP pueden tomar entre 1–3 meses según el alcance. Siempre trabajamos por fases para que veas resultados rápidos.",
      en: "Simple projects like chatbots or basic automations can be up and running in 2–4 weeks. More complex projects such as advanced workflows or CRM/ERP integrations can take 1–3 months depending on scope. We always work in phases so you see results quickly.",
    },
    relatedPath: "/contact",
  },
  {
    id: "post-implementation-support",
    category: "delivery",
    tags: ["support", "deployment"],
    question: {
      es: "¿Ofrecen soporte después de la implementación?",
      en: "Do you offer support after implementation?",
    },
    answer: {
      es: "Sí. Incluimos soporte técnico y mantenimiento. Al estar basados en Sevilla, podemos hacer reuniones presenciales cuando sea necesario. Además, nuestros sistemas son escalables: a medida que tu negocio crece, podemos ampliar y mejorar las automatizaciones sin empezar desde cero.",
      en: "Yes. We include technical support and maintenance. Being based in Seville, we can hold in-person meetings when needed. Our systems are also scalable: as your business grows, we can extend and improve the automations without starting over.",
    },
    relatedPath: "/contact",
  },
];
