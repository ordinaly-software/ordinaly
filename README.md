<p align="center">
    <img src="frontend/public/logo.webp" align="center" width="30%">
</p>
<p align="center"><h1 align="center">ORDINALY</h1></p>
<p align="center">
    <em>Esta es la página principal de Ordinaly. El software de Ordinaly tiene como misión ayudar a las empresas a agilizar y mejorar sus procesos con ayuda de la IA.</em>
</p>
<p align="center">
<p align="center">Hecho con las tecnologías de:</p>
<p align="center">
    <img src="https://img.shields.io/badge/npm-CB3837.svg?style=default&logo=npm&logoColor=white" alt="npm">
    <img src="https://img.shields.io/badge/HTML5-E34F26.svg?style=default&logo=HTML5&logoColor=white" alt="HTML5">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=default&logo=JavaScript&logoColor=black" alt="JavaScript">
    <img src="https://img.shields.io/badge/GNU%20Bash-4EAA25.svg?style=default&logo=GNU-Bash&logoColor=white" alt="GNU%20Bash">
    <br>
    <img src="https://img.shields.io/badge/Python-3776AB.svg?style=default&logo=Python&logoColor=white" alt="Python">
    <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=default&logo=TypeScript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=default&logo=ESLint&logoColor=white" alt="ESLint">
</p>
<br>

## Índice

- [Índice](#índice)
- [1. Visión general](#1-visión-general)
- [2. Características principales](#2-características-principales)
- [3. Estructura del proyecto](#3-estructura-del-proyecto)
  - [3.1 Árbol de directorios](#31-árbol-de-directorios)
  - [3.2 Backend (Django)](#32-backend-django)
  - [3.3 Frontend (Next.js)](#33-frontend-nextjs)
- [4. Internacionalización: qué está traducido y qué no](#4-internacionalización-qué-está-traducido-y-qué-no)
  - [4.1 Qué está traducido](#41-qué-está-traducido)
  - [4.2 Convención para los textos del backend](#42-convención-para-los-textos-del-backend)
  - [4.3 Qué no está traducido](#43-qué-no-está-traducido)
- [5. Primeros pasos](#5-primeros-pasos)
  - [5.1 Requisitos previos](#51-requisitos-previos)
  - [5.2 Ejecución con Docker (entorno de desarrollo)](#52-ejecución-con-docker-entorno-de-desarrollo)
  - [5.3 Instalación y ejecución (sin Docker)](#53-instalación-y-ejecución-sin-docker)
    - [5.3.1 Clonar el repositorio](#531-clonar-el-repositorio)
    - [5.3.2 Configurar PostgreSQL](#532-configurar-postgresql)
    - [5.3.3 Backend (Django)](#533-backend-django)
    - [5.3.4 Frontend (Next.js)](#534-frontend-nextjs)
    - [5.3.5 Build de producción (opcional)](#535-build-de-producción-opcional)
- [6. Documentación de la API](#6-documentación-de-la-api)
- [7. Autenticación](#7-autenticación)
  - [7.1 Cómo se entra y se conectan los métodos](#71-cómo-se-entra-y-se-conectan-los-métodos)
  - [7.2 Reglas de seguridad](#72-reglas-de-seguridad)
  - [7.3 Endpoints](#73-endpoints)
  - [7.4 Configuración de Google](#74-configuración-de-google)
- [8. Correo y notificaciones](#8-correo-y-notificaciones)
  - [8.1 Envío de correo](#81-envío-de-correo)
  - [8.2 Probar los correos](#82-probar-los-correos)
  - [8.3 Worker de notificaciones](#83-worker-de-notificaciones)
  - [8.4 Cron en producción (VPS)](#84-cron-en-producción-vps)
  - [8.5 Newsletter](#85-newsletter)
- [9. Dependencias principales](#9-dependencias-principales)
  - [9.1 Backend (Django)](#91-backend-django)
  - [9.2 Frontend (Next.js)](#92-frontend-nextjs)
- [10. Testing](#10-testing)
  - [10.1 Backend: tests y cobertura](#101-backend-tests-y-cobertura)
  - [10.2 Frontend](#102-frontend)
  - [10.3 Rendimiento, SEO y accesibilidad (Lighthouse)](#103-rendimiento-seo-y-accesibilidad-lighthouse)
  - [10.4 Probar pagos de cursos (Stripe)](#104-probar-pagos-de-cursos-stripe)
- [11. Contribuir](#11-contribuir)
  - [11.1 Guía de contribución](#111-guía-de-contribución)
- [12. Licencia](#12-licencia)
- [13. Reconocimientos](#13-reconocimientos)

---

## 1. Visión general

🚀 **AUTOMATIZA TU NEGOCIO CON IA**
Transformamos empresas con automatizaciones inteligentes. Desde chatbots hasta flujos de trabajo avanzados, te ayudamos a modernizar tu empresa y a ser más eficiente.

- 🤖 **Chatbots Inteligentes:** automatiza la atención al cliente 24/7 con IA conversacional avanzada.
- 🔄 **Workflows Automatizados:** integración con Odoo, Slack y herramientas empresariales.
- 📱 **WhatsApp Business:** automatización de ventas y soporte vía WhatsApp Business API.
- 🌐 **Integración Global:** conectamos todos tus sistemas en una plataforma unificada.
- 📊 **Consultoría Personalizada:** análisis y estrategia de automatización adaptada a tu negocio.
- ⚙️ **Optimización Continua:** monitoreo y mejora constante de tus procesos automatizados.

---

## 2. Características principales

- **Backend Django REST:** API robusta para cursos, usuarios y autenticación.
- **Frontend Next.js:** UI moderna, responsive, con soporte para dark mode y animaciones 3D.
- **Internacionalización (i18n):** interfaz traducida (es, en) con next-intl. Los correos, la newsletter y el contenido de cursos y blog **no** están traducidos: ver [Internacionalización](#4-internacionalización-qué-está-traducido-y-qué-no).
- **Autenticación completa:** registro, verificación de email, cambio de email, recuperación de contraseña y acceso con Google, que convive con la contraseña en la misma cuenta ([detalles](#7-autenticación)).
- **Gestión de cursos:** horarios complejos, inscripciones, exportación a calendario (.ics, Google, Outlook) y pagos con Stripe.
- **Notificaciones por correo:** avisos de cuenta, inscripciones y cursos (nueva formación, «empieza pronto» y recordatorio de 24 h). Desde el perfil, cada usuario elige si quiere los avisos de cursos y la newsletter ([detalles](#8-correo-y-notificaciones)).
- **Newsletter:** suscripción con doble confirmación (banner web o cuenta), números redactados y programados desde el panel de administración, baja con un clic y estadísticas básicas de aperturas y clics ([detalles](#85-newsletter)).
- **Panel de administración:** gestión avanzada de usuarios, cursos y newsletter.
- **CMS con Sanity:** gestión de contenido para blog, servicios y páginas.
- **Accesibilidad y SEO:** buenas prácticas, sitemap, robots.txt, imágenes optimizadas.

---

## 3. Estructura del proyecto

### 3.1 Árbol de directorios

```sh
ordinaly/
├── LICENSE
├── README.md
├── backend/
│   ├── manage.py         # Script principal de gestión Django
│   ├── pytest.ini        # Configuración de pytest
│   ├── requirements.txt  # Dependencias del backend
│   ├── config/           # Configuración Django
│   ├── api/              # API REST principal
│   ├── authentication/   # Autenticación y verificación de email
│   ├── users/            # Gestión de usuarios
│   ├── courses/          # Cursos y formación
│   ├── templates/emails/ # Plantillas de correo (HTML y texto)
│   ├── media/            # Archivos subidos (imágenes, PDFs, etc.)
│   │   ├── course_images/
│   │   └── test_media/
│   ├── staticfiles/      # Archivos estáticos recolectados (panel de Django)
│   └── ...
└── frontend/
    ├── package.json
    ├── public/
    │   ├── icons/
    │   ├── assets/
    │   └── static/
    │       ├── about/
    │       ├── backgrounds/
    │       ├── contact/
    │       ├── logos/
    │       └── team/
    ├── src/
    │   ├── app/
    │   │   ├── api/        # Route handlers (leads, google-reviews, revalidate, auth)
    │   │   ├── studio/     # Sanity Studio
    │   │   └── [locale]/   # Rutas internacionalizadas de cada sección
    │   ├── components/
    │   ├── contexts/
    │   ├── hooks/
    │   ├── i18n/
    │   ├── lib/
    │   ├── sanity/
    │   ├── styles/
    │   ├── utils/
    │   └── ...
    ├── messages/         # Archivos de traducción (es, en)
    └── ...
```

### 3.2 Backend (Django)

**Apps principales:**

- **`api/`** — API REST principal
  - `models.py`, `views.py`, `urls.py`, `admin.py`, `tests.py`, `test_conventions.py`
  - `management/commands/` — comandos personalizados (`populate_db`)
- **`authentication/`** — autenticación, verificación de email y middleware
  - `models.py`, `serializers.py`, `views.py`, `urls.py`, `admin.py`, `middleware.py`, `utils.py`, `tests.py`
- **`users/`** — gestión de usuarios, notificaciones por correo y newsletter
  - `models.py`, `serializers.py`, `views.py`, `newsletter_views.py`, `urls.py`, `admin.py`, `authentication.py`, `signals.py`, `tests.py`, `test_newsletters.py`
  - `services/` — `email_service.py`, `mail.py`, `notification_service.py`, `otp_service.py`, `newsletter_service.py`, `newsletter_sending.py`
  - `management/commands/` — `run_email_notification_queue`, `setup_gmail_send_token`
- **`courses/`** — cursos y formación
  - `models.py`, `serializers.py`, `forms.py`, `views.py`, `urls.py`, `admin.py`, `tests.py`
- **`config/`** — configuración global del proyecto
  - `settings.py`, `urls.py`, `email_backends.py`, `wsgi.py`, `asgi.py`, `__init__.py`

**Plantillas de correo:** `backend/templates/emails/` (cada correo tiene versión `.html` y `.txt`; `base.*` y `_button.html` son piezas compartidas).

### 3.3 Frontend (Next.js)

**Páginas principales (App Router):**

- `/[locale]/page.tsx` — Home
- `/[locale]/servicios/page.tsx` — Servicios (listado; el detalle de cada servicio se abre en un modal, no en una ruta propia)
- `/[locale]/formacion/page.tsx` — Cursos y formación (listado)
- `/[locale]/formacion/[slug]/page.tsx` — Detalle de curso
- `/[locale]/contacto/page.tsx` — Contacto
- `/[locale]/nosotros/page.tsx` — Sobre nosotros
- `/[locale]/blog/page.tsx` — Blog (el detalle de cada post se resuelve vía el catch-all `[slug]`)
- `/[locale]/legal/page.tsx` — Documentación legal
- `/[locale]/faq/page.tsx` — Preguntas frecuentes
- `/[locale]/news/page.tsx` — Noticias
- `/[locale]/profile/page.tsx` — Perfil de usuario
- `/[locale]/admin/page.tsx` — Panel de administración
- `/[locale]/[slug]/page.tsx` — catch-all de un segmento (posts de blog vía Sanity)
- `/[locale]/[...slug]/page.tsx` — catch-all de 404 para rutas no encontradas
- `/studio/[[...tool]]/page.tsx` — Sanity Studio
- **Autenticación y cuenta:**
  - `/[locale]/auth/signin/page.tsx` — iniciar sesión
  - `/[locale]/auth/signup/page.tsx` — registro (formulario en 3 pasos)
  - `/[locale]/auth/callback/page.tsx` — callback de OAuth (Google)
  - `/[locale]/verify-email/page.tsx` — verificación de email
  - `/[locale]/change-email/page.tsx` — cambio de email
  - `/[locale]/reset-password/page.tsx` — recuperación de contraseña (+ `confirm/` y `email-sent/`)
  - `/[locale]/delete_account/confirm/page.tsx` y `/[locale]/delete_account/email-sent/page.tsx` — eliminación de cuenta
- **Newsletter:**
  - `/[locale]/newsletter/confirm/page.tsx` — confirmación de la suscripción (doble opt-in)
  - `/[locale]/newsletter/unsubscribe/page.tsx` — baja de la newsletter
- **Landing pages SEO:** agente-de-llamadas-ia, automatizacion-facturas, automatizacion-informes, automatizacion-redes-sociales, automatizaciones-personalizadas-empresas-n8n, desarrollo-de-app-webs, implantacion-odoo, consultora-tecnologica-sevilla

**API routes (Next.js):**

- `/api/leads/route.ts` — captación de leads
- `/api/google-reviews/route.ts` — reviews públicas
- `/api/revalidate/route.ts` — revalidación ISR
- `/api/auth/signin/route.ts` — autenticación (sign in)
- `/api/auth/signup/route.ts` — autenticación (sign up)
- `/api/signin/route.ts` y `/api/signup/route.ts` — alias de las dos rutas anteriores
- `/sitemap.xml/route.ts` — sitemap dinámico: páginas fijas, landings, cursos (desde la API) y posts (desde Sanity), cada página en español y en `/en` (salvo blog y posts, solo en español). Se regenera cada hora y al publicar un post. Es XML plano a propósito (sin hoja de estilo ni `xhtml:link`) para que el navegador lo muestre como árbol legible; los idiomas alternativos se declaran en el `<head>` de cada página
- `/api/newsletter/subscribe/route.ts` — alta en la newsletter desde el banner (valida reCAPTCHA y reenvía al backend)

**Componentes principales:**

- **Admin:** admin-course-card, admin-course-edit-modal, admin-course-modal, admin-courses-tab, admin-external-tab, admin-newsletter-editor, admin-newsletter-shared, admin-newsletter-tab, admin-tabs, admin-users-tab, enrolled-members
- **About:** about-hero, principles, work-with-us
- **Analytics:** google-analytics-loader
- **Formation:** add-to-calendar-buttons, bonification-info, checkout-button, course-card, course-details-modal, course-footer, course-sidebar, enrollment-cancellation-modal, enrollment-cancellation-success-modal, enrollment-confirmation-modal, enrollment-success-modal, faq-section, instructors-section
- **Blog:** blog-card, blog-client, blog-post-client, category-utils, highlighted-carousel, portable-text-components, share-post-buttons, types
- **Landing:** flip-card, how-it-works-video-section, info-card-carousel, n8n-flow, portfolio-list, timeline-horizontal
- **Home:** courses-showcase, hero-video-dialog, home-hero, interactive-image-accordion, services-highlight-carousel, testimonials-section, whatsapp-bubble, whatsapp-bubble-skeleton
- **Profile:** profile-courses-tab, profile-info-tab
- **PWA:** service-worker-registrar
- **SEO:** auto-keywords, breadcrumb-schema, course-schema
- **Services:** providers-showcase, services-showcase-grid, tools-showcase, use-cases-section
- **UI:** alert, animated-list, animated-theme-toggler, apple-modal, back-to-top-button, badge, banner, blur-text, brand-icons, button, card, carousel (+ carousel-buttons, carousel-nav-buttons), contact-form.client, cookies, date-time-picker, delete-account-modal, delete-confirmation-modal, dock, dropdown, email-verification-modal, error-card, faq-accordion, footer, input, label, locale-switcher, logo-carousel, logo-loop, logout-modal, markdown-renderer, modal (+ modal-close-button), navbar (+ navbar-menu), newsletter-banner, newsletter-token-action.client, pagination-controls, partner-showcase, slider, strands, textarea, theme-init-script
- **Auth:** auth-modal

**Hooks:** useCourses, useCourseCheckout, useCourseRefund, useCookiePreferences, useAutoScroll, useDialogFocus, useOutsideClick

**Librerías y utilidades:**

- `src/lib/` — api-config, api-errors, email-confirmation, events, image, legal, metadata, queries, recaptcha, remark-autolink-urls, sanity, site-data, sitemap-entries, sitemap-xml, utils
- `src/utils/` — api, cookie-manager, linkify, past-course, pdf, pdf-generator, text, whatsapp, youtube

**CMS (Sanity):** esquemas en `/frontend/src/sanity/schemaTypes/` y utilidades en `/frontend/src/sanity/lib/`

---

## 4. Internacionalización: qué está traducido y qué no

El idioma por defecto es el español (sin prefijo: `/servicios`) y el inglés vive bajo `/en` (`/en/servicios`). Las cadenas de la interfaz están en `frontend/messages/es.json` y `frontend/messages/en.json` (con next-intl y rutas localizadas); hay que mantener ambos ficheros con las mismas claves.

### 4.1 Qué está traducido

- La interfaz del frontend: páginas, navegación, formularios, panel de administración y mensajes de error de los formularios.
- Los textos legales (términos, privacidad, cookies, licencia) y los PDF que se generan con ellos, el aviso de cookies y las FAQ.
- El banner de la newsletter y las páginas de confirmación y baja de la newsletter.
- Los metadatos SEO de las páginas.

### 4.2 Convención para los textos del backend

Todo texto interno del backend (respuestas y errores de la API, validaciones, `help_text` de los modelos y el Django admin) va **siempre en inglés** y nunca se traduce.

- Cuando el frontend muestra un mensaje que viene de la API, lo traduce con `localizeApiError` (`frontend/src/lib/api-errors.ts`), que asocia cada mensaje en inglés a una clave del bloque `apiErrors` de `messages/*.json`.
- Si añades un mensaje nuevo que el usuario pueda llegar a ver, añádelo a ese diccionario y a las dos traducciones.
- El test `backend/api/test_conventions.py` falla si aparece español en el código del backend (los asuntos de los correos y los datos de ejemplo de `populate_db` están exentos).

### 4.3 Qué no está traducido

Solo en español:

| Qué | Detalle |
|---|---|
| **Correos electrónicos** | Todas las plantillas (`backend/templates/emails/`) y sus asuntos (`backend/users/services/email_service.py`) están solo en español: verificación de cuenta, bienvenida, cambio de email, restablecer contraseña, eliminación de cuenta, inscripción y cancelación, nueva formación, "empieza pronto", recordatorio de 24 h y confirmación de la newsletter. Las fechas llevan el formato fijo `dd/mm/aaaa a las HH:MM`. El usuario no tiene un campo de idioma, así que el backend no sabe en cuál escribirle. |
| **Newsletter** | El contenido lo escribe quien administra, y el pie de la plantilla (`emails/newsletter.html`, "Recibes este correo porque…", "Darme de baja") está en español. Hay una única lista: quien se suscribe desde `/en` recibe lo mismo que quien lo hace desde `/`. La etiqueta `[PRUEBA]` del envío de prueba también está fija en español. |
| **Cursos** | Título, subtítulo, descripción y lugar se guardan en la base de datos en un solo idioma (el que escribe el admin) y se muestran igual en `/en`. Lo mismo ocurre con lo que se deriva de ellos: nombre y descripción en Stripe Checkout, correos de curso y archivos de calendario (.ics, Google, Outlook). |
| **Blog** | Solo en español: `/en/blog` devuelve 404 y el enlace se oculta en la navbar en inglés. El contenido de Sanity (blog y noticias) no tiene traducción por documento. |

---

## 5. Primeros pasos

### 5.1 Requisitos previos

Antes de comenzar con Ordinaly, asegúrate de tener instalado:

- **Python 3.10+** y **pip** (para el backend)
- **Node.js 20.9+** y **npm** (requerido por Next.js 16; para el frontend)
- **PostgreSQL 16+** (CI y producción usan la 18 — ver [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). Solo hace falta si no usas Docker.

### 5.2 Ejecución con Docker (entorno de desarrollo)

Levanta PostgreSQL, el backend y el frontend con un solo comando, sin instalar Python, Node ni PostgreSQL en tu máquina. Solo necesitas [Docker](https://docs.docker.com/get-docker/) con Docker Compose v2.

**Servicios:**

| Servicio   | Imagen / Dockerfile       | Puerto | Qué hace                                            |
|------------|---------------------------|--------|-----------------------------------------------------|
| `db`       | `postgres:16`             | 5433   | Base de datos (volumen persistente `postgres_data`); 5433 en el host para no chocar con un PostgreSQL local |
| `backend`  | `backend/Dockerfile.dev`  | 8000   | Django con `runserver` y recarga en caliente        |
| `frontend` | `frontend/Dockerfile.dev` | 3000   | Next.js con `npm run dev` y recarga en caliente     |

**Primer arranque:**

```sh
# 1. Variables de entorno (opcionales: solo para integraciones como Stripe, email, Sanity o reCAPTCHA)
touch backend/.env                              # añade aquí tus claves
cp frontend/.env.example frontend/.env.local

# 2. Construir e iniciar todo
docker compose up --build
```

Abre http://localhost:3000 (web) y http://localhost:8000 (API).

**Detalles a tener en cuenta:**

- Las dependencias (`pip install -r requirements.txt` y `npm ci`) se instalan al construir las imágenes. Si cambian `requirements.txt` o `package.json`, vuelve a ejecutar `docker compose up --build`.
- **Migraciones:** el entrypoint del backend ejecuta `makemigrations` y `migrate` en cada arranque, cuando la BD ya está sana (`healthcheck`). Hace falta el `makemigrations` porque `.gitignore` excluye `**/migrations/**` (solo se versiona `__init__.py`); los ficheros generados quedan en tu carpeta `backend/*/migrations`.
- `DATABASE_URL`, `DEBUG` y `DJANGO_SECRET_KEY` se fijan en [`docker-compose.yml`](docker-compose.yml) y **tienen prioridad** sobre `backend/.env`; el resto de variables se leen de `backend/.env`.
- El frontend usa `NEXT_PUBLIC_API_URL=http://localhost:8000` y comparte la red del backend (`network_mode: service:backend`), de modo que esa URL funciona tanto desde el navegador como desde el servidor de Next.js (login, registro, sitemap). Por eso los puertos 3000 y 8000 se publican en el servicio `backend`.
- Si el puerto 3000, 8000 o 5433 ya está ocupado (p. ej. por un `npm run dev` local), páralo o cambia el puerto de la izquierda en `docker-compose.yml`.
- `backend/Dockerfile` es la imagen de producción (gunicorn, sin hot reload); no la usa el `docker-compose.yml`.

**Comandos útiles:**

```sh
docker compose up -d                                          # arrancar en segundo plano
docker compose logs -f backend                                # ver logs
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py test            # tests del backend (usan la BD de Docker)
docker compose exec frontend npm run lint
docker compose down                                           # parar (conserva la BD)
docker compose down -v                                        # parar y borrar BD y node_modules
```

### 5.3 Instalación y ejecución (sin Docker)

#### 5.3.1 Clonar el repositorio

```sh
git clone https://github.com/ordinaly-software/ordinaly.git
cd ordinaly
```

#### 5.3.2 Configurar PostgreSQL

El backend usa `dj_database_url` para leer la conexión desde la variable `DATABASE_URL` del `.env`, con el formato:

```
postgres://usuario:contraseña@host:puerto/nombre_bd
```

**En macOS (Homebrew):**

```sh
brew install postgresql@16
brew services start postgresql@16
```

Si `psql` no se encuentra tras la instalación, añade el binario al PATH (Homebrew instala esta versión como *keg-only*):

```sh
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Crea el usuario y la base de datos que espera el proyecto (usa las mismas credenciales que pongas en `DATABASE_URL` del `.env`):

```sh
psql postgres
```

```sql
CREATE USER ordinaly WITH PASSWORD 'tu_password';
CREATE DATABASE ordinaly_db OWNER ordinaly;
GRANT ALL PRIVILEGES ON DATABASE ordinaly_db TO ordinaly;

-- Los tests no necesitan una base propia: Django/pytest-django crean y borran `test_ordinaly_db`
-- con este mismo usuario, así que debe poder crear bases (`ALTER USER ordinaly CREATEDB;`).
```

Verifica la conexión antes de migrar:

```sh
psql "postgresql://ordinaly:tu_password@127.0.0.1:5432/ordinaly_db" -c '\conninfo'
```

> **Nota:** si `brew services list` no muestra el servicio como `started`, revisa los logs en `~/Library/Logs/Homebrew/postgresql@16/`.

#### 5.3.3 Backend (Django)

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Copia y configura tu propio .env (no hay plantilla .env.example en backend/ todavía)
# Variables mínimas: DJANGO_SECRET_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI,
# ORDINALY_TEST_PASSWORD (protege formularios en tests), DATABASE_URL.
# Además hay variables opcionales para email (EMAIL_*, DEFAULT_FROM_EMAIL), Stripe (STRIPE_*) y URLs (FRONTEND_BASE_URL, BACKEND_BASE_URL) — revisa config/settings.py.
# Asegúrate de tener PostgreSQL instalado y la BD creada (ver 5.3.2)
# Migraciones iniciales
python manage.py migrate
# (Opcional) Crea superusuario
python manage.py createsuperuser
# (Opcional) Crea datos de prueba para ver cómo quedaría la web
python manage.py populate_db --seed 42
```

> [!WARNING]
> NO usar bajo ningún concepto este último comando con la opción `--clear` en el entorno de producción ya que borraría todos los usuarios del sistema.

Ejecuta el servidor:

```sh
python manage.py runserver
```

#### 5.3.4 Frontend (Next.js)

```sh
cd ../frontend
# Copia .env.example a .env.local y rellena las variables (NEXT_PUBLIC_API_URL, claves de Sanity, reCAPTCHA, Stripe, etc.)
cp .env.example .env.local
npm install
npm run dev
```

> [!NOTE]
> **reCAPTCHA (v3):** gestiona las claves en la consola de administración de Google: <https://www.google.com/recaptcha/admin>.

#### 5.3.5 Build de producción (opcional)

```sh
cd ../frontend
npm run build
npm run start -- -p 3000
```

---

## 6. Documentación de la API

Se genera en vivo desde las vistas de DRF con [drf-spectacular](https://drf-spectacular.readthedocs.io/), así que siempre está al día. Con el backend arrancado:

- http://localhost:8000/api/docs/ — Swagger UI interactiva. Botón "Authorize": pega `Token <tu_token>` para probar endpoints protegidos (el token se obtiene en `/auth/login/`).
- http://localhost:8000/api/redoc/ — la misma documentación en formato ReDoc.
- http://localhost:8000/api/schema/ — el esquema OpenAPI (YAML), para importar en Postman/Insomnia o generar clientes.

Las tres rutas son públicas (solo describen el contrato); ejecutar una petición protegida desde Swagger sigue exigiendo token. En desarrollo "Try it out" apunta al backend local, y en producción a `https://api.ordinaly.ai`. Para generarlo sin servidor: `python manage.py spectacular --file schema.yaml`.

---

## 7. Autenticación

Hay dos formas de entrar, y conviven en la misma cuenta: **email y contraseña** y **Google**. Las rutas del backend están en `backend/authentication/` (y `users/` para el perfil).

### 7.1 Cómo se entra y se conectan los métodos

| Situación | Qué ocurre |
|---|---|
| Alguien nuevo entra con Google | Se crea la cuenta ya verificada (sin código por email) y recibe el correo de bienvenida. |
| Entra con Google quien ya tiene Google conectado | Inicia sesión, aunque el email de su cuenta de Google sea distinto al de la cuenta de Ordinaly. |
| Entra con Google un email que ya tiene cuenta con contraseña | **No se enlaza ni se inicia sesión.** Se le explica que debe entrar con su contraseña y conectar Google desde su perfil. |
| Quien tiene contraseña quiere usar Google | Perfil → *Cuentas conectadas* → *Conectar Google*. Vale cualquier cuenta de Google, con el mismo email o con otro. |
| Quien entró con Google quiere una contraseña | Perfil → *Seguridad* → *Crear contraseña*: se envía un enlace al email de la cuenta (el mismo flujo que «¿Olvidaste tu contraseña?», con el texto adaptado). |
| Se intenta entrar con contraseña en una cuenta que solo usa Google | El error lo explica (en vez de «credenciales inválidas») y sugiere Google o crear una contraseña. |
| Quiere quitar Google | Perfil → *Cuentas conectadas* → *Desconectar*. Solo se permite si la cuenta tiene contraseña. |

### 7.2 Reglas de seguridad

- **Nunca se enlaza una cuenta a Google solo porque el email coincida.** Quien registra primero una cuenta puede no ser el dueño del correo (por ejemplo, un registro hecho con el email de otra persona); si Google se enlazara solo, esa persona conservaría su contraseña. El dueño real entra con la contraseña y conecta Google desde dentro, o restablece la contraseña por email.
- **Solo se acepta un correo que Google marque como verificado** (`email_verified`). Con una cuenta de Google que no lo tiene, no se crea ni se conecta nada.
- **Un Google solo puede estar en una cuenta, y una cuenta solo puede tener un Google.** Para cambiar de cuenta de Google hay que desconectar primero la anterior.
- **No se puede desconectar Google si es la única forma de entrar** (cuenta sin contraseña): se pide crear una contraseña antes.
- La conexión desde el perfil usa un parámetro `state` **firmado y con caducidad de 10 minutos** que identifica a quien la inició, porque la vuelta de Google no lleva el token de sesión.

### 7.3 Endpoints

| Ruta | Para qué |
|---|---|
| `GET /auth/google/login/` | Empieza el acceso con Google (redirige a Google). |
| `GET /auth/google/callback/` | Vuelta de Google. Sin `state`: acceso. Con `state`: conectar Google a la cuenta que lo inició. |
| `POST /auth/google/link/` | (Con sesión) Devuelve la URL de Google para conectar la cuenta. |
| `POST /auth/google/unlink/` | (Con sesión) Desconecta Google, si la cuenta tiene contraseña. |
| `POST /auth/password/reset/request/` y `/confirm/` | Crear o restablecer la contraseña mediante un enlace por email (15 minutos). |

El perfil (`GET /api/users/profile/`) incluye `is_google_authenticated` y `has_usable_password`, que el frontend usa para decidir qué mostrar.

### 7.4 Configuración de Google

Las variables `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` y `FRONTEND_URL` del `backend/.env` (ver [5.3.3](#533-backend-django)). En Google Cloud Console, el cliente OAuth debe tener como URI de redirección `GOOGLE_REDIRECT_URI` (`…/auth/google/callback/`); es la misma para acceder y para conectar, no hay que registrar nada más.

---

## 8. Correo y notificaciones

### 8.1 Envío de correo

Todas las notificaciones se envían con el framework de correo de Django (`users/services/mail.py`, plantillas en `backend/templates/emails/`). El mismo código usa un backend u otro según lo que haya en `backend/.env` (si defines `EMAIL_BACKEND`, manda ese):

- **Desarrollo (SMTP real):** define `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` (contraseña de aplicación de Google), `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS` y `DEFAULT_FROM_EMAIL`. Sin credenciales, los correos se imprimen en la consola.
- **Producción (API de Gmail):** si existe `GMAIL_API_REFRESH_TOKEN` se usa `config.email_backends.GmailApiEmailBackend` (HTTPS + OAuth2, sin SMTP; reutiliza `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`). No pongas `EMAIL_BACKEND` en el `.env` del servidor.

Google bloquea el SMTP con contraseña desde IPs de VPS, de ahí la API en producción. Para obtener el token, una sola vez:

1. En Google Cloud Console habilita la **Gmail API** y añade `http://localhost:8090/` como URI de redirección del cliente OAuth.
2. En local: `cd backend && python manage.py setup_gmail_send_token` e inicia sesión con la cuenta remitente.
3. En el `.env` del servidor: `GMAIL_API_REFRESH_TOKEN=<token impreso>` y `DEFAULT_FROM_EMAIL=<la misma cuenta>` (Gmail solo permite otro `From` si está verificado como alias "Enviar correo como").

### 8.2 Probar los correos

Hay 12 plantillas (verificación, bienvenida, confirmación de la newsletter, restablecer contraseña, contraseña restablecida, correo actualizado, eliminación de cuenta, inscripción, cancelación, nueva formación, empieza pronto y recordatorio 24h). Para enviar todas a tu bandeja sin recorrer cada flujo (requiere al menos un curso en la BD; los enlaces de contraseña y eliminación llevan un token de ejemplo):

```sh
docker compose exec backend python manage.py shell -c "
from users.services import email_service as es
from courses.models import Course
to = 'tu-correo@ejemplo.com'
c = Course.objects.first()
es.send_verification_email(to, '123456')
es.send_welcome_email(to, 'Nombre')
es.send_newsletter_confirmation_email(to, 'tok123')
es.send_password_reset_email(to, 'tok123', 'Nombre')
es.send_password_reset_completed_email(to, 'Nombre')
es.send_email_updated_email(to, 'Nombre', 'viejo@ejemplo.com', to)
es.send_delete_confirmation_email(to, 'tok123', 'Nombre')
es.send_enrollment_confirmation_email(to, 'Nombre', c)
es.send_unenrollment_confirmation_email(to, 'Nombre', c)
es.send_course_published_email(to, 'Nombre', c)
es.send_course_starts_soon_email(to, 'Nombre', c, '2026-10-20T10:00:00+02:00', 7)
es.send_course_reminder_email(to, 'Nombre', c, '2026-10-20T10:00:00+02:00', 24)
"
```

El correo de cada número de la newsletter usa su propia plantilla (`newsletter.html`) y se prueba desde el panel de administración con «Enviar prueba».

### 8.3 Worker de notificaciones

No hace falta Celery ni otro worker: los correos inmediatos (inscripción, cancelación, bienvenida…) se envían dentro de la petición. Lo único periódico es `python manage.py run_email_notification_queue`, que debe ejecutarse cada minuto (en Docker lo hace el servicio `notifications` del compose). En cada ejecución:

- envía los avisos de nueva formación;
- lanza las newsletters programadas;
- encola los avisos "empieza pronto" (~7 días antes del inicio de un curso, a quienes tienen activados los avisos de cursos) y "recordatorio 24h" (~24 h antes de una sesión, a los inscritos en el curso);
- reintenta los envíos fallidos (hasta 3 intentos).

### 8.4 Cron en producción (VPS)

Vive en el crontab del usuario `ordinaly`, no en el repositorio, así que los despliegues no lo tocan y siempre ejecuta el código recién desplegado en `/opt/ordinaly/backend`. Solo hay que reinstalarlo si se cambia de servidor, de usuario o de ruta. Línea instalada (`crontab -e`):

```cron
* * * * * cd /opt/ordinaly/backend && flock -n /tmp/ordinaly-notifications.lock venv/bin/python manage.py run_email_notification_queue 2>&1 | logger -t ordinaly-notifications
```

`flock -n` evita ejecuciones solapadas y `logger` envía la salida al journal con la etiqueta `ordinaly-notifications`.

**Comprobar que funciona** (por SSH, en el servidor):

```sh
crontab -l                                                                      # ver el cron instalado
sudo journalctl -t ordinaly-notifications --since "10 minutes ago" --no-pager   # una línea por minuto
```

Cada línea tiene el formato `email_notification_queue reminders_enqueued=0 processed=0 sent=0 failed=0`. Si `failed` es mayor que 0, hay envíos que fallan (se reintentan solos).

**Estado de la cola:**

```sh
cd /opt/ordinaly/backend && source venv/bin/activate
python manage.py shell -c "
from users.models import EmailNotificationJob as J
from django.db.models import Count
print(list(J.objects.values('notification_type','status').annotate(n=Count('id'))))"
```

**Cancelar trabajos pendientes:** para los que no deban enviarse, márcalos como fallidos (el procesador solo coge `pending`): `J.objects.filter(status='pending', notification_type='course_published').update(status='failed', last_error='Cancelled manually')`.

### 8.5 Newsletter

Las newsletters se redactan y programan desde el panel de administración y las envía el mismo worker, así que el cron de producción ([8.4](#84-cron-en-producción-vps)) es imprescindible. Cuando llega la hora de una newsletter se crea un job por cada suscriptor `active` en ese momento (quien se haya dado de baja entre medias no recibe nada). Cada correo lleva enlace de baja, cabecera `List-Unsubscribe` de un clic, un píxel de apertura y enlaces con seguimiento de clics.

- **Límite de Gmail:** el envío usa la Gmail API, con un límite diario de unos 500 correos en cuentas gratuitas y 2.000 en Google Workspace. Ese cupo se comparte con los correos transaccionales (verificación, inscripciones, avisos de cursos). Si la lista se acerca a unos 300 suscriptores, o si una newsletter más los avisos del día pueden superar el cupo, hay que pasar a un proveedor transaccional (Brevo, Amazon SES…). Es solo cambiar `EMAIL_BACKEND` y las credenciales SMTP; no hay que tocar código.
- **Ritmo de envío:** el worker procesa como máximo 100 correos por ejecución (`--limit`, 100 por defecto) y se ejecuta cada minuto, así que una newsletter tarda aproximadamente `suscriptores / 100` minutos en salir entera (unos 5 minutos para 500 suscriptores). Mientras tanto aparece como "enviándose" y pasa a "enviada" al salir el último correo.
- **Medición:** los clics se miden con una redirección propia y son fiables. Las aperturas usan un píxel y son orientativas: se pierden si el cliente bloquea las imágenes y Apple Mail las infla al precargarlas. La Política de Privacidad ya lo menciona.
- **Suscriptores:** `NewsletterSubscriber` es la única lista (cuentas y altas del banner, con doble confirmación).

---

## 9. Dependencias principales

### 9.1 Backend (Django)

Django, djangorestframework, django-cors-headers, drf-spectacular, djangorestframework-simplejwt, dj-database-url, google-auth, Pillow, psycopg, gunicorn, whitenoise, python-dotenv, markdown, reportlab, stripe

### 9.2 Frontend (Next.js)

next, react, next-intl, tailwindcss, framer-motion, motion, lucide-react, react-icons, @tabler/icons-react, @react-three/fiber, @react-three/drei, cobe, embla-carousel-react, sanity, next-sanity, stripe, @stripe/stripe-js, react-toastify, react-markdown, jspdf (reCAPTCHA v3 se carga con un provider propio, sin dependencia externa)

---

## 10. Testing

### 10.1 Backend: tests y cobertura

Para asegurar la calidad del backend, es obligatorio mantener al menos un 80% de cobertura de tests: el proyecto no se considerará válido si la cobertura es inferior.

Así es como lo hace el workflow de despliegue ([`deploy.yml`](.github/workflows/deploy.yml)), con el test runner de Django:

```sh
coverage run --source='.' --omit='*/migrations/*,*/tests.py,api/*,config/*,manage.py,*__init__.py,*conftest.py' manage.py test
coverage report -m
```

El workflow de SonarQube ([`sonarqube.yml`](.github/workflows/sonarqube.yml)) usa en cambio `pytest` (por eso existe `pytest.ini`):

```sh
pip install -r requirements-dev.txt  # requirements.txt + pytest, pytest-django y pytest-cov
coverage run -m pytest -q --reuse-db
coverage report
```

> [!NOTE]
> `pytest`, `pytest-django` y `pytest-cov` viven en `backend/requirements-dev.txt`, no en `requirements.txt`, para que no se instalen en producción. La imagen de Docker de desarrollo ya los incluye: `docker compose exec backend python -m pytest`.

### 10.2 Frontend

Basta con comprobar la sintaxis de TypeScript y la build:

```sh
npx tsc --noEmit
npm run build
```

### 10.3 Rendimiento, SEO y accesibilidad (Lighthouse)

Para comprobar el rendimiento, SEO, medidas de accesibilidad y buenas prácticas de cada página:

```sh
npx lighthouse http://localhost:3000/es --form-factor=mobile --view
# Se puede probar /es, /es/servicios o cualquier otra ruta
```

### 10.4 Probar pagos de cursos (Stripe)

Para testear el flujo de pagos con Stripe en local:

1. Levanta un túnel:
   ```sh
   ngrok http 8000
   ```
2. Actualiza `ALLOWED_HOSTS` en `backend/config/settings.py` con el dominio del túnel (`https://<tu-subdominio>.ngrok.io`).
3. Asegúrate de que `FRONTEND_BASE_URL` apunte a tu frontend local y `STRIPE_SECRET_KEY` esté configurada en el backend.
4. En el dashboard de Stripe, crea/actualiza el webhook a:
   `https://<tu-subdominio>.ngrok.io/api/courses/stripe/webhook/`
5. Ejecuta el backend (`python manage.py runserver`) y el frontend, y prueba una inscripción de curso de pago.

---

## 11. Contribuir

- **💬 [Únete a las discusiones](https://github.com/ordinaly-software/ordinaly/discussions):** comparte tus ideas, proporciona comentarios o haz preguntas.
- **🐛 [Reportar problemas](https://github.com/ordinaly-software/ordinaly/issues):** envía errores encontrados o registra solicitudes de funciones para el proyecto `ordinaly`.
- **💡 Enviar solicitudes de extracción:** revisa las PR abiertas y envía tus propias PR siguiendo la guía de contribución de abajo.

### 11.1 Guía de contribución

1. **Haz un fork del repositorio**: comienza haciendo un fork del repositorio del proyecto a tu cuenta de GitHub.
2. **Clona localmente**: clona el repositorio forkeado en tu máquina local usando un cliente de git.
    ```sh
    git clone https://github.com/tu_usuario/ordinaly.git
    ```
3. **Crea una nueva rama**: trabaja siempre en una nueva rama, dándole un nombre descriptivo.
    ```sh
    git checkout -b nueva-caracteristica-x
    ```
4. **Realiza tus cambios**: desarrolla y prueba tus cambios localmente.
5. **Comprueba la build del frontend**: antes de hacer commit, ejecuta `npm run build` en la carpeta `frontend` para asegurarte de que no hay errores de compilación.
6. **Confirma tus cambios**: realiza el commit con un mensaje claro que describa tus actualizaciones.
    ```sh
    git commit -m 'Implementada la nueva característica x.'
    ```
7. **Envía a GitHub**: envía los cambios a tu repositorio forkeado.
    ```sh
    git push origin nueva-caracteristica-x
    ```
8. **Envía una solicitud de extracción**: crea una PR contra el repositorio del proyecto original. Describe claramente los cambios y sus motivaciones.
9. **Revisión**: una vez que tu PR sea revisada y aprobada, se fusionará en la rama principal. ¡Felicidades por tu contribución!

---

## 12. Licencia

Este proyecto está protegido bajo la Licencia [APACHE](https://choosealicense.com/licenses/apache-2.0/). Para más detalles, consulta el archivo [LICENSE](LICENSE).

---

## 13. Reconocimientos

Este proyecto fue realizado por <a href="https://github.com/antoniommff">Antonio Macías</a>.
  <br>
  Para contacto directo, puedes comunicarte conmigo a través de:
  <a href="https://www.linkedin.com/in/antoniommff/">
    <img height="20" src="https://skillicons.dev/icons?i=linkedin"/>
  </a>
  o
  <a href="mailto:antonio.macias@ordinaly.ai">
    <img height="20" src="https://skillicons.dev/icons?i=gmail"/>
  </a>.
  <br>
  Tómate un momento para visitar mi
  <a href="http://bento.me/antoniommff">Página Personal</a> y explorar mis redes sociales.
