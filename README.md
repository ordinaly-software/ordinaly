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
- [Visión general](#visión-general)
- [Estructura del proyecto](#estructura-del-proyecto)
  - [Índice del proyecto](#índice-del-proyecto)
- [Características principales](#características-principales)
- [Primeros pasos](#primeros-pasos)
  - [Requisitos previos](#requisitos-previos)
  - [Configurar PostgreSQL](#configurar-postgresql)
  - [Instalación y ejecución](#instalación-y-ejecución)
- [Dependencias principales](#dependencias-principales)
  - [Backend (Django)](#backend-django)
  - [Frontend (Next.js)](#frontend-nextjs)
- [Testing](#testing)
  - [Ejecutar tests y obtener cobertura:](#ejecutar-tests-y-obtener-cobertura)
  - [Probar pagos de cursos (Stripe)](#probar-pagos-de-cursos-stripe)
- [Contribuir](#contribuir)
- [Licencia](#licencia)
- [Reconocimientos](#reconocimientos)

---

## Visión general

🚀 **AUTOMATIZA TU NEGOCIO CON IA**  
Transformamos empresas con automatizaciones inteligentes. Desde chatbots hasta flujos de trabajo avanzados, te ayudamos a modernizar tu empresa y a ser más eficiente.

🤖 **Chatbots Inteligentes**  
Automatiza la atención al cliente 24/7 con IA conversacional avanzada.

🔄 **Workflows Automatizados**  
Integración con Odoo, Slack y herramientas empresariales.

📱 **WhatsApp Business**  
Automatización de ventas y soporte vía WhatsApp Business API.

🌐 **Integración Global**  
Conectamos todos tus sistemas en una plataforma unificada.

📊 **Consultoría Personalizada**  
Análisis y estrategia de automatización adaptada a tu negocio.

⚙️ **Optimización Continua**  
Monitoreo y mejora constante de tus procesos automatizados.

---

## Estructura del proyecto

```sh
ordinaly/
├── LICENSE
├── README.md
├── backend/
│   ├── manage.py
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── config/           # Configuración Django
│   ├── api/              # API REST principal
│   ├── authentication/   # Autenticación y verificación de email
│   ├── users/            # Gestión de usuarios
│   ├── courses/          # Cursos y formación
│   ├── services/         # Servicios empresariales
│   ├── media/            # Archivos subidos (imágenes, PDFs, etc.)
│   │   ├── course_images/
│   │   ├── service_images/
│   │   └── test_media/
│   ├── staticfiles/       # Archivos estáticos del panel de Django
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


###  Índice del proyecto
<details open>
        <summary><b>backend</b></summary>
        <blockquote>
            <b>Apps principales (Django):</b>
            <ul>
                <li><b>api/</b> — API REST principal
                    <ul>
                        <li>models.py, views.py, urls.py, admin.py, tests.py</li>
                        <li>management/commands/ — Comandos personalizados (<code>populate_db</code>, <code>run_email_notification_queue</code>)</li>
                    </ul>
                </li>
                <li><b>authentication/</b> — Autenticación, verificación de email y middleware
                    <ul>
                        <li>models.py, serializers.py, views.py, urls.py, admin.py, middleware.py, utils.py, tests.py</li>
                    </ul>
                </li>
                <li><b>users/</b> — Gestión de usuarios
                    <ul>
                        <li>models.py, serializers.py, views.py, urls.py, admin.py, authentication.py, tests.py</li>
                    </ul>
                </li>
                <li><b>courses/</b> — Cursos y formación
                    <ul>
                        <li>models.py, serializers.py, views.py, urls.py, admin.py, tests.py</li>
                    </ul>
                </li>
                <li><b>services/</b> — Servicios empresariales
                    <ul>
                        <li>models.py, serializers.py, views.py, urls.py, admin.py, tests.py</li>
                    </ul>
                </li>
                <li><b>config/</b> — Configuración global del proyecto
                    <ul>
                        <li>settings.py, urls.py, wsgi.py, asgi.py, __init__.py</li>
                    </ul>
                </li>
            </ul>
            <b>Otros:</b>
            <ul>
                <li><b>manage.py</b> — Script principal de gestión Django</li>
                <li><b>pytest.ini</b> — Configuración de pytest</li>
                <li><b>requirements.txt</b> — Dependencias del backend</li>
                <li><b>media/</b> — Archivos subidos (imágenes, PDFs, etc.)</li>
                <li><b>staticfiles/</b> — Archivos estáticos recolectados</li>
            </ul>
        </blockquote>
</details>

<details open>
        <summary><b>frontend</b></summary>
        <blockquote>
            <b>Páginas principales (Next.js App Router):</b>
            <ul>
                <li><code>/[locale]/page.tsx</code> — Home</li>
                <li><code>/[locale]/servicios/page.tsx</code> — Servicios (listado; el detalle de cada servicio se abre en un modal, no en una ruta propia)</li>
                <li><code>/[locale]/formacion/page.tsx</code> — Cursos y formación (listado)</li>
                <li><code>/[locale]/formacion/[slug]/page.tsx</code> — Detalle de curso</li>
                <li><code>/[locale]/contacto/page.tsx</code> — Contacto</li>
                <li><code>/[locale]/nosotros/page.tsx</code> — Sobre nosotros</li>
                <li><code>/[locale]/blog/page.tsx</code> — Blog (el detalle de cada post se resuelve vía el catch-all <code>[slug]</code> de abajo)</li>
                <li><code>/[locale]/legal/page.tsx</code> — Documentación legal</li>
                <li><code>/[locale]/faq/page.tsx</code> — Preguntas frecuentes</li>
                <li><code>/[locale]/news/page.tsx</code> — Noticias</li>
                <li><code>/[locale]/profile/page.tsx</code> — Perfil de usuario</li>
                <li><code>/[locale]/admin/page.tsx</code> — Panel de administración</li>
                <li><code>/[locale]/auth/signin/page.tsx</code> — Iniciar sesión</li>
                <li><code>/[locale]/auth/signup/page.tsx</code> — Registro (formulario en 3 pasos)</li>
                <li><code>/[locale]/auth/callback/page.tsx</code> — Callback de OAuth (Google)</li>
                <li><code>/[locale]/verify-email/page.tsx</code> — Verificación de email</li>
                <li><code>/[locale]/change-email/page.tsx</code> — Cambio de email</li>
                <li><code>/[locale]/reset-password/page.tsx</code> — Recuperación de contraseña (+ <code>confirm/</code> y <code>email-sent/</code>)</li>
                <li><code>/[locale]/delete_account/confirm/page.tsx</code>, <code>/[locale]/delete_account/email-sent/page.tsx</code> — Eliminación de cuenta</li>
                <li><code>/[locale]/[slug]/page.tsx</code> — Catch-all de un segmento (posts de blog vía Sanity)</li>
                <li><code>/[locale]/[...slug]/page.tsx</code> — Catch-all de 404 para rutas no encontradas</li>
                <li>Landing pages SEO: agente-de-llamadas-ia, automatizacion-facturas, automatizacion-informes, automatizacion-redes-sociales, automatizaciones-personalizadas-empresas-n8n, desarrollo-de-app-webs, implantacion-odoo</li>
                <li><code>/studio/[[...tool]]/page.tsx</code> — Sanity Studio</li>
            </ul>
            <b>API routes (Next.js):</b>
            <ul>
                <li><code>/api/leads/route.ts</code> — Captación de leads</li>
                <li><code>/api/google-reviews/route.ts</code> — Reviews públicas</li>
                <li><code>/api/revalidate/route.ts</code> — Revalidación ISR</li>
                <li><code>/api/auth/signin/route.ts</code> — Autenticación (sign in)</li>
                <li><code>/api/auth/signup/route.ts</code> — Autenticación (sign up)</li>
            </ul>
            <b>Componentes principales:</b>
            <ul>
                <li><b>Admin:</b> admin-course-card, admin-course-edit-modal, admin-course-modal, admin-courses-tab, admin-external-tab, admin-tabs, admin-users-tab, enrolled-members</li>
                <li><b>About:</b> about-hero, timeline, work-with-us</li>
                <li><b>Analytics:</b> google-analytics-loader</li>
                <li><b>Formation:</b> add-to-calendar-buttons, bonification-info, checkout-button, course-card, course-details-modal, course-footer, course-sidebar, enrollment-cancellation-modal, enrollment-cancellation-success-modal, enrollment-confirmation-modal, enrollment-success-modal, faq-section, instructors-section</li>
                <li><b>Blog:</b> blog-card, blog-client, blog-post-client, highlighted-carousel, portable-text-components, share-post-buttons</li>
                <li><b>Home:</b> courses-showcase, hero-video-dialog, home-hero, interactive-image-accordion, services-highlight-carousel, testimonials-section, whatsapp-bubble, whatsapp-bubble-skeleton</li>
                <li><b>Profile:</b> profile-courses-tab, profile-info-tab</li>
                <li><b>PWA:</b> service-worker-registrar</li>
                <li><b>SEO:</b> auto-keywords, breadcrumb-schema, course-schema</li>
                <li><b>Services:</b> providers-showcase, services-showcase-grid, tools-showcase, use-cases-section</li>
                <li><b>UI:</b> alert, animated-list, apple-modal, back-to-top-button, badge, banner, blur-text, brand-icons, button, card, carousel (+ carousel-buttons, carousel-nav-buttons), contact-form.client, cookies, delete-account-modal, delete-confirmation-modal, dock, dropdown, email-verification-modal, error-card, faq-accordion, footer, input, label, locale-switcher, logo-carousel, logo-loop, logout-modal, markdown-renderer, modal (+ modal-close-button), navbar (+ navbar-menu), newsletter-banner, pagination-controls, partner-showcase, slider, strands, textarea</li>
                <li><b>Auth:</b> auth-modal</li>
            </ul>
            <b>Utilidades y hooks:</b>
            <ul>
                <li>useCourses, useCourseCheckout, useCourseRefund, useCookiePreferences, useAutoScroll, useOutsideClick</li>
            </ul>
            <b>CMS (Sanity):</b>
            <ul>
                <li>Esquemas en <code>/frontend/src/sanity/schemaTypes/</code> y utilidades en <code>/frontend/src/sanity/lib/</code></li>
            </ul>
            <b>Internacionalización:</b>
            <ul>
                <li>Archivos de mensajes en <code>/frontend/messages/</code> (es, en)</li>
                <li>Soporte para next-intl y rutas localizadas</li>
            </ul>
        </blockquote>
</details>

---


## Características principales

- **Backend Django REST:** API robusta para cursos, usuarios, servicios y autenticación.
- **Frontend Next.js:** UI moderna, responsive, con soporte para dark mode y animaciones 3D.
- **Internacionalización (i18n):** Traducciones completas (es, en) usando next-intl.
- **Autenticación completa:** Registro, verificación de email, cambio de email, recuperación de contraseña y OAuth con Google.
- **Gestión de cursos:** Horarios complejos, inscripciones, exportación a calendario (.ics, Google, Outlook) y pagos con Stripe.
- **Panel de administración:** Gestión avanzada de usuarios, cursos y servicios.
- **CMS con Sanity:** Gestión de contenido para blog, servicios y páginas.
- **Landing pages SEO:** Páginas optimizadas para búsquedas de IA y automatización en Sevilla.
- **Integración con WhatsApp y Odoo:** Automatización de ventas y flujos empresariales.
- **Accesibilidad y SEO:** Buenas prácticas, sitemap, robots.txt, imágenes optimizadas.


---

##  Primeros pasos

###  Requisitos previos

Antes de comenzar con Ordinaly, asegúrate de tener instalado:

- **Python 3.10+** y **pip** (para el backend)
- **Node.js 20.9+** y **npm** (requerido por Next.js 16; para el frontend)
- **PostgreSQL 16+** (CI y producción usan la 18 — ver [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))

### Configurar PostgreSQL

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

> **Nota:** Si `brew services list` no muestra el servicio como `started`, revisa los logs en `~/Library/Logs/Homebrew/postgresql@16/`.

### Ejecución con Docker (entorno de desarrollo)

Levanta PostgreSQL, el backend y el frontend con un solo comando, sin instalar Python, Node ni PostgreSQL en tu máquina. Solo necesitas [Docker](https://docs.docker.com/get-docker/) con Docker Compose v2.

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

- Las dependencias (`pip install -r requirements.txt` y `npm ci`) se instalan al construir las imágenes. Si cambian `requirements.txt` o `package.json`, vuelve a ejecutar `docker compose up --build`.
- **Migraciones:** el entrypoint del backend ejecuta `makemigrations` y `migrate` en cada arranque, cuando la BD ya está sana (`healthcheck`). Hace falta el `makemigrations` porque `.gitignore` excluye `**/migrations/**` (solo se versiona `__init__.py`); los ficheros generados quedan en tu carpeta `backend/*/migrations`.
- `DATABASE_URL`, `DEBUG` y `DJANGO_SECRET_KEY` se fijan en [`docker-compose.yml`](docker-compose.yml) y **tienen prioridad** sobre `backend/.env`; el resto de variables se leen de `backend/.env`.
- El frontend usa `NEXT_PUBLIC_API_URL=http://localhost:8000` y comparte la red del backend (`network_mode: service:backend`), de modo que esa URL funciona tanto desde el navegador como desde el servidor de Next.js (login, registro, sitemap). Por eso los puertos 3000 y 8000 se publican en el servicio `backend`.
- Si el puerto 3000, 8000 o 5433 ya está ocupado (p. ej. por un `npm run dev` local), páralo o cambia el puerto de la izquierda en `docker-compose.yml`.

Abre http://localhost:3000 (web) y http://localhost:8000 (API).

**Documentación de la API:** se genera en vivo desde las vistas de DRF con [drf-spectacular](https://drf-spectacular.readthedocs.io/), así que siempre está al día. Con el backend arrancado:
- http://localhost:8000/api/docs/ — Swagger UI interactiva. Botón "Authorize": pega `Token <tu_token>` para probar endpoints protegidos (el token se obtiene en `/auth/login/`).
- http://localhost:8000/api/redoc/ — la misma documentación en formato ReDoc.
- http://localhost:8000/api/schema/ — el esquema OpenAPI (YAML), para importar en Postman/Insomnia o generar clientes.

Las tres rutas son públicas (solo describen el contrato); ejecutar una petición protegida desde Swagger sigue exigiendo token. En desarrollo "Try it out" apunta al backend local, y en producción a `https://api.ordinaly.ai`. Para generarlo sin servidor: `python manage.py spectacular --file schema.yaml`.

**Correo:** todas las notificaciones se envían con el framework de correo de Django (`users/services/mail.py`, plantillas en `backend/templates/emails/`). El mismo código usa un backend u otro según lo que haya en `backend/.env` (si defines `EMAIL_BACKEND`, manda ese):
- **Desarrollo (SMTP real):** define `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` (contraseña de aplicación de Google), `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS` y `DEFAULT_FROM_EMAIL`. Sin credenciales, los correos se imprimen en la consola.
- **Producción (API de Gmail):** si existe `GMAIL_API_REFRESH_TOKEN` se usa `config.email_backends.GmailApiEmailBackend` (HTTPS + OAuth2, sin SMTP; reutiliza `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`). No pongas `EMAIL_BACKEND` en el `.env` del servidor.

Google bloquea el SMTP con contraseña desde IPs de VPS, de ahí la API en producción. Para obtener el token, una sola vez:
1. En Google Cloud Console habilita la **Gmail API** y añade `http://localhost:8090/` como URI de redirección del cliente OAuth.
2. En local: `cd backend && python manage.py setup_gmail_send_token` e inicia sesión con la cuenta remitente.
3. En el `.env` del servidor: `GMAIL_API_REFRESH_TOKEN=<token impreso>` y `DEFAULT_FROM_EMAIL=<la misma cuenta>` (Gmail solo permite otro `From` si está verificado como alias "Enviar correo como").

**Probar los correos:** hay 11 plantillas (verificación, bienvenida, restablecer contraseña, contraseña restablecida, correo actualizado, eliminación de cuenta, inscripción, cancelación, nueva formación, empieza pronto y recordatorio 24h). Para enviar todas a tu bandeja sin recorrer cada flujo (requiere al menos un curso en la BD; los enlaces de contraseña y eliminación llevan un token de ejemplo):

```sh
docker compose exec backend python manage.py shell -c "
from users.services import email_service as es
from courses.models import Course
to = 'tu-correo@ejemplo.com'
c = Course.objects.first()
es.send_verification_email(to, '123456')
es.send_welcome_email(to, 'Nombre')
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

Los avisos "empieza pronto" y "recordatorio 24h" los genera `python manage.py run_email_notification_queue` cuando faltan ~7 días / ~24 h para una sesión de un curso en el que estás inscrito.

No hace falta Celery ni otro worker: los correos inmediatos (inscripción, cancelación, bienvenida…) se envían dentro de la petición. Lo único periódico es `python manage.py run_email_notification_queue`, que envía los avisos de nueva formación, lanza las newsletters programadas, encola los de "empieza pronto" y "recordatorio 24h" y reintenta los envíos fallidos (hasta 3 intentos). Debe ejecutarse cada minuto. En Docker lo hace el servicio `notifications` del compose.

**Cron en producción (VPS):** vive en el crontab del usuario `ordinaly`, no en el repositorio, así que los despliegues no lo tocan y siempre ejecuta el código recién desplegado en `/opt/ordinaly/backend`. Solo hay que reinstalarlo si se cambia de servidor, de usuario o de ruta. Línea instalada (`crontab -e`):

```cron
* * * * * cd /opt/ordinaly/backend && flock -n /tmp/ordinaly-notifications.lock venv/bin/python manage.py run_email_notification_queue 2>&1 | logger -t ordinaly-notifications
```

`flock -n` evita ejecuciones solapadas y `logger` envía la salida al journal con la etiqueta `ordinaly-notifications`.

Comprobar que funciona (por SSH, en el servidor):

```sh
crontab -l                                                                      # ver el cron instalado
sudo journalctl -t ordinaly-notifications --since "10 minutes ago" --no-pager   # una línea por minuto
```

Cada línea tiene el formato `email_notification_queue reminders_enqueued=0 processed=0 sent=0 failed=0`. Si `failed` es mayor que 0, hay envíos que fallan (se reintentan solos). Estado de la cola:

```sh
cd /opt/ordinaly/backend && source venv/bin/activate
python manage.py shell -c "
from users.models import EmailNotificationJob as J
from django.db.models import Count
print(list(J.objects.values('notification_type','status').annotate(n=Count('id'))))"
```

Para cancelar trabajos pendientes que no deban enviarse, márcalos como fallidos (el procesador solo coge `pending`): `J.objects.filter(status='pending', notification_type='course_published').update(status='failed', last_error='Cancelled manually')`.

**Newsletter:** las newsletters se redactan y programan desde el panel de administración y las envía ese mismo worker, así que el cron de arriba es imprescindible. Cuando llega la hora de una newsletter se crea un job por cada suscriptor `active` en ese momento (quien se haya dado de baja entre medias no recibe nada). Cada correo lleva enlace de baja, cabecera `List-Unsubscribe` de un clic, un píxel de apertura y enlaces con seguimiento de clics.

* **Límite de Gmail:** el envío usa la Gmail API, con un límite diario de unos 500 correos en cuentas gratuitas y 2.000 en Google Workspace. Ese cupo se comparte con los correos transaccionales (verificación, inscripciones, avisos de cursos). Si la lista se acerca a unos 300 suscriptores, o si una newsletter más los avisos del día pueden superar el cupo, hay que pasar a un proveedor transaccional (Brevo, Amazon SES…). Es solo cambiar `EMAIL_BACKEND` y las credenciales SMTP; no hay que tocar código.
* **Ritmo de envío:** el worker procesa como máximo 100 correos por ejecución (`--limit`, 100 por defecto) y se ejecuta cada minuto, así que una newsletter tarda aproximadamente `suscriptores / 100` minutos en salir entera (unos 5 minutos para 500 suscriptores). Mientras tanto aparece como "enviándose" y pasa a "enviada" al salir el último correo.
* **Medición:** los clics se miden con una redirección propia y son fiables. Las aperturas usan un píxel y son orientativas: se pierden si el cliente bloquea las imágenes y Apple Mail las infla al precargarlas. La Política de Privacidad ya lo menciona.
* **Suscriptores:** `NewsletterSubscriber` es la única lista (cuentas y altas del banner, con doble confirmación). Tras desplegar cambios en el modelo, `python manage.py sync_newsletter_subscribers` enlaza filas antiguas con sus usuarios y lista las huérfanas (`--purge-orphans` las borra).

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

`backend/Dockerfile` es la imagen de producción (gunicorn, sin hot reload); no la usa el `docker-compose.yml`.

### Instalación y ejecución (sin Docker)

1. Clona el repositorio:
    ```sh
    git clone https://github.com/ordinaly-software/ordinaly.git
    cd ordinaly
    ```

2. Instala dependencias del backend (Django):
    ```sh
    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    # Copia y configura tu propio .env (no hay plantilla .env.example en backend/ todavía)
    # Variables mínimas: DJANGO_SECRET_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI,
    # ORDINALY_TEST_PASSWORD (protege formularios en tests), DATABASE_URL.
    # Además hay variables opcionales para email (EMAIL_*, DEFAULT_FROM_EMAIL), Stripe (STRIPE_*) y URLs (FRONTEND_BASE_URL, BACKEND_BASE_URL) — revisa config/settings.py.
    # Asegúrate de tener PostgreSQL instalado y la BD creada (ver "Configurar PostgreSQL" más arriba)
    # Migraciones iniciales
    python manage.py migrate
    # (Opcional) Crea superusuario
    python manage.py createsuperuser
    # (Opcional) Crea datos de prueba para ver cómo quedaría la web
    python manage.py populate_db --seed 42
    ```

    > [!WARNING]
    > NO usar bajo ningún concepto este último comando con la opción `--clear` en el entorno de producción ya que borraría todos los usuarios del sistema.

    ```sh
    # Ejecuta el servidor
    python manage.py runserver
    ```

3. Instala dependencias del frontend (Next.js):
    ```sh
    cd ../frontend
    # Copia .env.example a .env.local y rellena las variables (NEXT_PUBLIC_API_URL, claves de Sanity, reCAPTCHA, Stripe, etc.)
    cp .env.example .env.local
    npm install
    npm run dev
    ```

    > [!NOTE]
    > **reCAPTCHA (v3):** gestiona las claves en la consola de administración de Google: <https://www.google.com/recaptcha/admin>.

4. Opcionalmente, para ejecutar la build de producción:
    ```sh
    cd ../frontend
    npm run build
    npm run start -- -p 3000
    ```




---



##  Dependencias principales

### Backend (Django)
- Django, djangorestframework, django-cors-headers, drf-spectacular, djangorestframework-simplejwt, dj-database-url, google-auth, Pillow, psycopg, gunicorn, whitenoise, python-dotenv, markdown, reportlab, stripe

### Frontend (Next.js)
- next, react, next-intl, tailwindcss, framer-motion, motion, lucide-react, react-icons, @tabler/icons-react, @react-three/fiber, @react-three/drei, cobe, embla-carousel-react, sanity, next-sanity, stripe, @stripe/stripe-js, react-toastify, react-markdown, jspdf (reCAPTCHA v3 se carga con un provider propio, sin dependencia externa)

---


## Testing

Para asegurar la calidad del backend, es obligatorio mantener al menos un 80% de cobertura de tests.

### Ejecutar tests y obtener cobertura:

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

Para el frontend, basta con comprobar la sintaxis de TypeScript y la build:

```sh
npx tsc --noEmit
npm run build
```

Y para comprobar el rendimiento, SEO, medidas de accesibilidad y buenas prácticas de cada página, haz:

```
npx lighthouse http://localhost:3000/es --form-factor=mobile --view
# Se puede probar /es, /es/servicios o cualquier otra ruta
```

### Probar pagos de cursos (Stripe)

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

> **Nota:** El proyecto no se considerará válido si la cobertura es inferior al 80%.

---

##  Contribuir

- **💬 [Únete a las discusiones](https://github.com/ordinaly-software/ordinaly/discussions)**: Comparte tus ideas, proporciona comentarios o haz preguntas.
- **🐛 [Reportar problemas](https://github.com/ordinaly-software/ordinaly/issues)**: Envía errores encontrados o registra solicitudes de funciones para el proyecto `ordinaly`.
- **💡 Enviar solicitudes de extracción**: Revisa las PR abiertas y envía tus propias PR siguiendo la guía de contribución de abajo.


<!-- <details closed> -->
<summary>Guías de contribución</summary>

<!-- <details closed>
<summary>Gráfico de contribuidores</summary>
<br>
<p align="left">
   <a href="https://github.com/ordinaly-software/ordinaly/graphs/contributors">
      <img src="https://contrib.rocks/image?repo=ordinaly-software/ordinaly">
   </a>
</p>
</details> -->


1. **Haz un fork del repositorio**: Comienza haciendo un fork del repositorio del proyecto a tu cuenta de GitHub.
2. **Clona localmente**: Clona el repositorio forkeado en tu máquina local usando un cliente de git.
    ```sh
    git clone https://github.com/tu_usuario/ordinaly.git
    ```
3. **Crea una nueva rama**: Trabaja siempre en una nueva rama, dándole un nombre descriptivo.
    ```sh
    git checkout -b nueva-caracteristica-x
    ```
4. **Realiza tus cambios**: Desarrolla y prueba tus cambios localmente.
5. **Comprueba la build del frontend**: Antes de hacer commit, ejecuta `npm run build` en la carpeta `frontend` para asegurarte de que no hay errores de compilación.
6. **Confirma tus cambios**: Realiza el commit con un mensaje claro que describa tus actualizaciones.
    ```sh
    git commit -m 'Implementada la nueva característica x.'
    ```
7. **Envía a GitHub**: Envía los cambios a tu repositorio forkeado.
    ```sh
    git push origin nueva-caracteristica-x
    ```
8. **Envía una solicitud de extracción**: Crea una PR contra el repositorio del proyecto original. Describe claramente los cambios y sus motivaciones.
9. **Revisión**: Una vez que tu PR sea revisada y aprobada, se fusionará en la rama principal. ¡Felicidades por tu contribución!
</details>

---

##  Licencia

Este proyecto está protegido bajo la Licencia [APACHE](https://choosealicense.com/licenses/apache-2.0/). Para más detalles, consulta el archivo [LICENSE](LICENSE).

---

##  Reconocimientos

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
