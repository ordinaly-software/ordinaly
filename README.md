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
│   ├── conftest.py
│   ├── manage.py
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── config/           # Configuración Django
│   ├── api/              # API REST principal
│   ├── users/            # Gestión de usuarios
│   ├── courses/          # Cursos y formación
│   ├── services/         # Servicios empresariales
│   ├── terms/            # Términos legales
│   ├── media/            # Archivos subidos (imágenes, PDFs, etc.)
│   │   ├── course_images/
│   │   ├── service_images/
│   │   ├── terms/
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
    │   │   ├── api/        # Route handlers (leads, google-reviews, revalidate)
    │   │   ├── studio/     # Sanity Studio
    │   │   └── [locale]/   # Rutas intternacionalizadas de cada sección
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
                        <li>models.py, serializers.py, views.py, urls.py, admin.py, tests.py</li>
                        <li>management/commands/ — Comandos personalizados</li>
                    </ul>
                </li>
                <li><b>users/</b> — Gestión de usuarios y autenticación
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
                <li><b>terms/</b> — Términos legales y documentos
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
                <li><b>conftest.py</b> — Configuración de fixtures para pytest</li>
                <li><b>manage.py</b> — Script principal de gestión Django</li>
                <li><b>pytest.ini</b> — Configuración de pytest</li>
                <li><b>requirements.txt</b> — Dependencias del backend</li>
                <li><b>media/</b> — Archivos subidos (imágenes, PDFs, etc.)</li>
                <li><b>staticfiles/</b> — Archivos estáticos recolectados</li>
            </ul>
        </blockquote>
    <summary><b><code>ORDINALY/</code></b></summary>
        <summary><b>frontend</b></summary>
        <blockquote>
            <b>Páginas principales (Next.js App Router):</b>
            <ul>
                <li><code>/[locale]/page.tsx</code> — Home</li>
                <li><code>/[locale]/services/page.tsx</code> — Servicios</li>
                <li><code>/[locale]/formation/page.tsx</code> — Cursos y formación</li>
                <li><code>/[locale]/contact/page.tsx</code> — Contacto</li>
                <li><code>/[locale]/about/page.tsx</code> — Sobre nosotros</li>
                <li><code>/[locale]/blog/page.tsx</code> — Blog</li>
                <li><code>/[locale]/legal/page.tsx</code> — Documentación legal</li>
                <li><code>/[locale]/profile/page.tsx</code> — Perfil de usuario</li>
                <li><code>/[locale]/admin/page.tsx</code> — Panel de administración</li>
                <li><code>/[locale]/auth/signin/page.tsx</code> — Iniciar sesión</li>
                <li><code>/[locale]/auth/signup/page.tsx</code> — Registro</li>
                <li><code>/studio/[[...tool]]/page.tsx</code> — Sanity Studio</li>
            </ul>
            <b>API routes (Next.js):</b>
            <ul>
                <li><code>/api/leads/route.ts</code> — Captación de leads</li>
                <li><code>/api/google-reviews/route.ts</code> — Reviews públicas</li>
                <li><code>/api/revalidate/route.ts</code> — Revalidación ISR</li>
            </ul>
            <b>Componentes principales:</b>
            <ul>
                <li><b>Admin:</b> admin-course-card, admin-course-modal, admin-courses-tab, admin-service-card, admin-service-edit-modal, admin-services-tab, admin-terms-tab, admin-users-tab</li>
                <li><b>About:</b> animated-testimonials, timeline</li>
                <li><b>Analytics:</b> AnalyticsBootstrap, GoogleAnalyticsPageViews, GoogleAnalyticsScript</li>
                <li><b>Formation:</b> course-card, course-details-modal, add-to-calendar-buttons, bonification-info, enrollment-confirmation-modal, enrollment-cancellation-modal</li>
                <li><b>Blog:</b> blog-card, blog-client, blog-post-client, portable-text-components, share-post-buttons</li>
                <li><b>Home:</b> courses-showcase, demo-modal, pricing-plans, service-showcase, whatsapp-bubble</li>
                <li><b>Profile:</b> profile-courses-tab, profile-info-tab</li>
                <li><b>PWA:</b> service-worker-registrar</li>
                <li><b>Services:</b> service-details-modal</li>
                <li><b>UI:</b> admin-tabs, alert, back-to-top-button, badge, button, card, colourful-text, cookies, delete-account-modal, delete-confirmation-modal, dropdown, footer, icon-select, input, label, lazy-image, locale-switcher, logout-modal, markdown-renderer, modal-close-button, modal, navbar, slider, styled-button, textarea</li>
                <li><b>Auth:</b> auth-modal, google-signin-button</li>
            </ul>
            <b>Utilidades y hooks:</b>
            <ul>
                <li>useCourses, useServices, useIntersectionObserver</li>
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
</details>

---


## Características principales

- **Backend Django REST:** API robusta para cursos, usuarios, servicios y términos legales.
- **Frontend Next.js:** UI moderna, responsive, con soporte para dark mode y animaciones.
- **Internacionalización (i18n):** Traducciones completas (es, en) usando next-intl.
- **Gestión de cursos:** Horarios complejos, inscripciones, exportación a calendario (.ics, Google, Outlook).
- **Panel de administración:** Gestión avanzada de usuarios, cursos, servicios y términos.
- **Integración con WhatsApp y Odoo:** Automatización de ventas y flujos empresariales.
- **Accesibilidad y SEO:** Buenas prácticas, sitemap, robots.txt, imágenes optimizadas.


---

##  Primeros pasos

###  Requisitos previos

Antes de comenzar con Ordinaly, asegúrate de tener instalado:

- **Python 3.10+** y **pip** (para el backend)
- **Node.js 18+** y **npm** (para el frontend)



### Instalación y ejecución

1. Clona el repositorio:
    ```sh
    git clone https://github.com/ordinaly-software/ordinaly.git
    cd ordinaly
    ```

2. Instala dependencias del backend (Django):
    ```sh
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    # Copia y configura .env proporcionada (DJANGO_SECRET_KEY, GOOGLE_OAUTH2_CLIENT_ID, GOOGLE_OAUTH2_CLIENT_SECRET, ORDINALY_TEST_PASSWORD para proteger formularios)
    # Migraciones iniciales
    python manage.py migrate
    # (Opcional) Crea superusuario
    python manage.py createsuperuser
    # (Opcional) Crea datos de prueba para ver cómo quedaría la web
    python manage.py populate_db
    ````

    [!WARNING]
    NO usar bajo ningún concepto este último comando con la opción `--clear` en el entorno de producción ya que borraría todos los usuarios del sistema.

    ```sh
    # Ejecuta el servidor
    python manage.py runserver
    ```

3. Instala dependencias del frontend (Next.js):
    ```sh
    cd ../frontend
    Copia y configura .env.local proporcionada (se puede encontrar la plantilla en .env.example)
    npm install
    npm run dev
    ```

4. Opcionalmente, para ejecurtar la build de producción:
    ```sh
    cd ../frontend
    npm run build
    npm run start -- -p 3000
    ```




---



##  Dependencias principales

### Backend (Django)
- Django, djangorestframework, django-cors-headers, Pillow, gunicorn, whitenoise, dotenv, markdown, reportlab

### Frontend (Next.js)
- next, react, next-intl, tailwindcss, lucide-react, styled-components, react-markdown, framer-motion, jspdf

---


## Testing

Para asegurar la calidad del backend, es obligatorio mantener al menos un 80% de cobertura de tests.

### Ejecutar tests y obtener cobertura:

```sh
coverage run --source='.' --omit='*/migrations/*,*/tests.py,api/*,config/*,manage.py,*__init__.py,*conftest.py' manage.py test
coverage report -m
```

Para el frontend, basta con probar el *linting* y la sintaxis de Typescript y JS con los siguientes comando:

```
npx eslint --ext .ts,.tsx src public --no-error-on-unmatched-pattern || true
npm run build
```

Y para comprobar el rendimiento, SEO, medidas de accesibilidad y buenas prácticas de cada página, haz:

```
npx lighthouse http://localhost:3000/es --form-factor=mobile --view
# Se puede probar /es, /es/services o cualquier otra ruta
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

- **💬 [Únete a las discusiones](https://LOCAL/Developer/ordinaly/discussions)**: Comparte tus ideas, proporciona comentarios o haz preguntas.
- **🐛 [Reportar problemas](https://LOCAL/Developer/ordinaly/issues)**: Envía errores encontrados o registra solicitudes de funciones para el proyecto `ordinaly`.
- **💡 [Enviar solicitudes de extracción](https://LOCAL/Developer/ordinaly/blob/main/CONTRIBUTING.md)**: Revisa las PR abiertas y envía tus propias PR.


<details closed>
<summary>Guías de contribución</summary>


1. **Haz un fork del repositorio**: Comienza haciendo un fork del repositorio del proyecto a tu cuenta de LOCAL.
2. **Clona localmente**: Clona el repositorio forkeado en tu máquina local usando un cliente de git.
    ```sh
    git clone /home/tu_usuario/Developer/ordinaly
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
7. **Envía a LOCAL**: Envía los cambios a tu repositorio forkeado.
    ```sh
    git push origin nueva-caracteristica-x
    ```
8. **Envía una solicitud de extracción**: Crea una PR contra el repositorio del proyecto original. Describe claramente los cambios y sus motivaciones.
9. **Revisión**: Una vez que tu PR sea revisada y aprobada, se fusionará en la rama principal. ¡Felicidades por tu contribución!
</details>

<!-- <details closed>
<summary>Gráfico de contribuidores</summary>
<br>
<p align="left">
   <a href="https://LOCAL{/Developer/ordinaly/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=Developer/ordinaly">
   </a>
</p>
</details> -->

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
