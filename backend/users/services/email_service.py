import os

import requests
import urllib3
from django.conf import settings

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class EmailServiceError(Exception):
    pass


def _send_email(recipient: str, html: str, subject: str = ""):
    """Send an email through BillionMail.

    The BillionMail template uses {{.API.html}} to inject content.
    Custom properties are passed via the 'attribs' field.
    """
    headers = {
        "X-API-Key": settings.BILLIONMAIL_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "recipient": recipient,
        "attribs": {
            "html": html,
        },
    }
    if subject:
        payload["subject"] = subject
    base_url = settings.BILLIONMAIL_BASE_URL.rstrip("/")
    url = f"{base_url}/send"
    # print(f"[BillionMail] POST {url} -> recipient={recipient}, subject={subject!r}")
    response = requests.post(
        url,
        json=payload,
        headers=headers,
        timeout=10,
        verify=False,
    )
    # print(f"[BillionMail] Response {response.status_code}: {response.text}")
    if response.status_code >= 400:
        raise EmailServiceError(
            f"BillionMail error {response.status_code}: {response.text}"
        )
    return response


def send_verification_email(email: str, code: str):
    try:
        html = f"""\
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Verificaci&oacute;n de cuenta - Ordinaly</title>
    <!--[if mso]>
      <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
    <![endif]-->
    <style>
      :root{{--bg:#f6f7f8;--card:#ffffff;--text:#0f172a;--muted:#475569;--line:#e5e7eb;--cta:#316C20;--radius:14px;--footer_bg:#ffffff;--footer_text:#0f172a;--footer_link:#0f172a;--footer_line:#e5e7eb;}}
      html,body{{margin:0;padding:0;background:var(--bg);}}
      img{{border:0;outline:none;text-decoration:none;display:block;max-width:100%;}}
      a{{color:inherit;text-decoration:none;}}
      .preheader{{display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;}}
      .container{{width:100%;background:var(--bg);padding:24px 12px;}}
      .card{{max-width:640px;margin:0 auto;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;}}
      .p{{padding:28px 24px;}}
      .h1{{font:800 24px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--text);margin:0;}}
      .h2{{font:800 16px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--text);margin:0;}}
      .text{{font:400 15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--muted);margin:0;}}
      .divider{{height:1px;background:var(--line);line-height:1px;font-size:1px;}}
      .badge{{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:6px 10px;font:700 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--muted);}}
      .code-box{{font:800 36px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;letter-spacing:10px;text-align:center;padding:20px 16px;background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;color:#166534;}}
      .footer{{background:var(--footer_bg);color:var(--footer_text);padding:30px 24px;text-align:center;font:400 14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;border-top:1px solid var(--footer_line);}}
      .footer a{{color:var(--footer_link);text-decoration:underline;margin:0 5px;}}
      @media (max-width:520px){{.p{{padding:22px 16px;}}.h1{{font-size:22px;}}.code-box{{font-size:28px;letter-spacing:6px;}}}}
    </style>
  </head>
  <body>
    <div class="preheader">Tu c&oacute;digo de verificaci&oacute;n de Ordinaly es {code}. Expira en 15 minutos.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="container">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="card">
          <!-- HEADER -->
          <tr><td class="p" style="padding-bottom:18px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td align="left" style="vertical-align:middle;">
                  <a href="https://ordinaly.ai" target="_blank" rel="noopener noreferrer">
                    <img src="https://ordinaly.ai/logo.webp" alt="Ordinaly" height="34" style="height:34px;width:auto;" />
                  </a>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span class="badge">Verificaci&oacute;n de cuenta</span>
                </td>
              </tr>
            </table>
            <div style="height:16px;"></div>
            <h1 class="h1">Verifica tu cuenta</h1>
            <p class="text" style="margin-top:8px;">
              Introduce el siguiente c&oacute;digo en la p&aacute;gina de verificaci&oacute;n para activar tu cuenta de Ordinaly.
            </p>
          </td></tr>
          <tr><td class="divider"></td></tr>
          <!-- BODY -->
          <tr><td class="p">
            <h2 class="h2">Tu c&oacute;digo de verificaci&oacute;n</h2>
            <div style="height:16px;"></div>
            <div class="code-box">{code}</div>
            <div style="height:16px;"></div>
            <p class="text" style="font-size:13px;">
              Este c&oacute;digo expira en <strong style="color:#0f172a;">15 minutos</strong>. Si no solicitaste esta verificaci&oacute;n, puedes ignorar este correo de forma segura.
            </p>
            <div style="height:18px;"></div>
            <p class="text" style="font-size:13px;">
              Si necesitas ayuda, escribe a <a href="mailto:info@ordinaly.ai" style="text-decoration:underline;">info@ordinaly.ai</a>.
            </p>
          </td></tr>
          <!-- FOOTER -->
          <tr><td class="footer">
            <p style="margin:0;font-weight:700;">ORDINALY SOFTWARE</p>
            <p style="margin:8px 0 0;">Automatizaci&oacute;n empresarial e IA desde Sevilla para el mundo</p>
            <p style="margin:14px 0 0;">
              <a href="https://ordinaly.ai" target="_blank" rel="noopener noreferrer">Sitio web</a> |
              <a href="https://ordinaly.ai/contact" target="_blank" rel="noopener noreferrer">Contacto</a> |
              <a href="https://ordinaly.ai/blog" target="_blank" rel="noopener noreferrer">Blog</a>
            </p>
            <p style="margin:14px 0 0;">&copy; 2026 Ordinaly Software. Todos los derechos reservados.</p>
            <p style="margin:10px 0 0;">
              <a href="mailto:info@ordinaly.ai">info@ordinaly.ai</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>"""
        _send_email(email, html, subject="Código de verificación - Ordinaly")
    except Exception as e:
        raise EmailServiceError("No se pudo enviar el correo de verificación") from e


def send_welcome_email(email: str, user_name: str):
    try:
        html = f"""\
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Bienvenido a Ordinaly</title>

  <style>
    html,body{{margin:0;padding:0;}}
    img{{border:0;outline:none;text-decoration:none;display:block;max-width:100%;}}
    a{{text-decoration:none;}}
    .preheader{{display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;}}

    .container{{padding:28px 12px;}}
    .p{{padding:30px 26px;}}

    .h1{{font:900 28px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial;margin:0;}}
    .h2{{font:900 20px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial;margin:0;}}
    .h3{{font:800 15px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial;margin:0;}}
    .text{{font:400 16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial;margin:0;}}

    .badge{{
      display:inline-block;
      padding:6px 12px;
      border-radius:999px;
      border:1px solid #e5e7eb;
      font:700 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial;
      color:#475569;
      background:#ffffff;
      background-image:linear-gradient(#ffffff,#ffffff);
      -webkit-text-fill-color:#475569;
    }}

    .divider{{height:1px;line-height:1px;font-size:1px;background:#e5e7eb;}}

    .pill{{
      border:1px solid #e5e7eb;
      border-radius:14px;
      padding:14px;
      text-align:center;
      background:#ffffff;
      background-image:linear-gradient(#ffffff,#ffffff);
    }}

    .grid-card{{
      border:1px solid #e5e7eb;
      border-radius:14px;
      overflow:hidden;
      background:#ffffff;
      background-image:linear-gradient(#ffffff,#ffffff);
    }}
    .grid-body{{padding:12px;}}
    .grid-sub{{font-size:14px;line-height:1.45;margin:8px 0 0;}}

    .mini-img{{
      width:150px;
      height:auto;
      border-radius:12px;
      border:1px solid #e5e7eb;
      overflow:hidden;
      display:block;
    }}

    .footer{{
      padding:28px 22px;
      text-align:center;
      font:400 14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial;
      background:#ffffff;
      background-image:linear-gradient(#ffffff,#ffffff);
    }}
    .footer a{{text-decoration:underline;margin:0 6px;color:#0f172a;}}

    @media (max-width:520px){{
      .p{{padding:22px 16px;}}
      .h1{{font-size:24px;}}
      .mini-img{{width:100%;}}
    }}
  </style>
</head>

<body style="margin:0;padding:0;background:#f6f7f8;background-image:linear-gradient(#f6f7f8,#f6f7f8);">
  <div class="preheader">Bienvenido a Ordinaly. Automatizaci&oacute;n e IA con criterio y paso a paso.</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
         style="background:#f6f7f8;background-image:linear-gradient(#f6f7f8,#f6f7f8);">
    <tr>
      <td align="center" class="container">

        <!-- CARD -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
               style="max-width:700px;background:#ffffff;background-image:linear-gradient(#ffffff,#ffffff);
                      border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td class="p" style="background:#ffffff;background-image:linear-gradient(#ffffff,#ffffff);">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <img src="https://ordinaly.ai/logo.webp" alt="Ordinaly" height="34" style="height:34px;width:auto;" />
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span class="badge">Cuenta creada</span>
                  </td>
                </tr>
              </table>

              <div style="height:14px;"></div>

              <h1 class="h1" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">Hola {user_name}, bienvenido a Ordinaly</h1>
              <p class="text" style="margin-top:10px;color:#475569;-webkit-text-fill-color:#475569;">
                Gracias por crear tu cuenta. Ordinaly est&aacute; pensado para automatizar procesos y aplicar IA
                con control, paso a paso, y con resultados reales.
              </p>

              <div style="height:10px;"></div>
              <p class="text" style="font-size:14px;color:#475569;-webkit-text-fill-color:#475569;">
                Si no has sido t&uacute;, puedes ignorar este correo.
              </p>
            </td>
          </tr>

          <tr><td class="divider"></td></tr>

          <!-- VALUE -->
          <tr>
            <td class="p" style="background:#ffffff;background-image:linear-gradient(#ffffff,#ffffff);">
              <h2 class="h2" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">Qu&eacute; vas a encontrar aqu&iacute;</h2>
              <p class="text" style="margin-top:10px;color:#475569;-webkit-text-fill-color:#475569;">
                Tres ideas simples, que usamos a diario:
              </p>

              <div style="height:14px;"></div>

              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="33%" style="padding-right:8px;vertical-align:top;">
                    <div class="pill">
                      <h3 class="h3" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">Automatizaci&oacute;n pr&aacute;ctica</h3>
                      <p class="text" style="font-size:14px;margin-top:6px;color:#475569;-webkit-text-fill-color:#475569;">
                        Menos tareas repetidas, m&aacute;s tiempo para decidir.
                      </p>
                    </div>
                  </td>

                  <td width="33%" style="padding:0 4px;vertical-align:top;">
                    <div class="pill">
                      <h3 class="h3" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">IA con sentido</h3>
                      <p class="text" style="font-size:14px;margin-top:6px;color:#475569;-webkit-text-fill-color:#475569;">
                        Donde ayuda, sin complicar lo que ya funciona.
                      </p>
                    </div>
                  </td>

                  <td width="33%" style="padding-left:8px;vertical-align:top;">
                    <div class="pill">
                      <h3 class="h3" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">Criterio t&eacute;cnico</h3>
                      <p class="text" style="font-size:14px;margin-top:6px;color:#475569;-webkit-text-fill-color:#475569;">
                        Sin humo, con arquitectura y pasos claros.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td class="divider"></td></tr>

          <!-- SERVICES GRID -->
          <tr>
            <td class="p" style="background:#ffffff;background-image:linear-gradient(#ffffff,#ffffff);">
              <h2 class="h2" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">Algunas soluciones listas</h2>
              <p class="text" style="margin-top:8px;color:#475569;-webkit-text-fill-color:#475569;">
                Ejemplos de lo que solemos implantar. Si te encaja algo, lo ves con detalle en la web.
              </p>

              <div style="height:14px;"></div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="50%" style="padding-right:8px;vertical-align:top;">
                    <a href="https://ordinaly.ai/services/sonia-asistente-de-voz-con-ia-ordinaly" target="_blank" rel="noopener noreferrer" style="color:#0f172a;">
                      <div class="grid-card">
                        <img src="https://api.ordinaly.ai/media/service_images/ChatGPT_Image_2_feb_2026_12_20_11_en_tamano_grande.jpeg" alt="SonIA" style="width:100%;height:auto;" />
                        <div class="grid-body">
                          <h3 class="h3" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">SonIA, asistente de voz con IA</h3>
                          <p class="grid-sub" style="color:#475569;-webkit-text-fill-color:#475569;">Recepci&oacute;n 24/7 para atender, filtrar y escalar conversaciones.</p>
                        </div>
                      </div>
                    </a>
                  </td>

                  <td width="50%" style="padding-left:8px;vertical-align:top;">
                    <a href="https://ordinaly.ai/services/recopilacion-automatica-de-facturas-para-empresas-y-asesorias" target="_blank" rel="noopener noreferrer" style="color:#0f172a;">
                      <div class="grid-card">
                        <img src="https://api.ordinaly.ai/media/service_images/Diseno_sin_titulo_en_tamano_mediano.webp" alt="Facturas" style="width:100%;height:auto;" />
                        <div class="grid-body">
                          <h3 class="h3" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">Recopilaci&oacute;n autom&aacute;tica de facturas</h3>
                          <p class="grid-sub" style="color:#475569;-webkit-text-fill-color:#475569;">Centraliza y clasifica facturas para empresa o asesor&iacute;a.</p>
                        </div>
                      </div>
                    </a>
                  </td>
                </tr>

                <tr><td style="height:14px;"></td><td></td></tr>

                <tr>
                  <td width="50%" style="padding-right:8px;vertical-align:top;">
                    <a href="https://ordinaly.ai/services/automatizacion-facebook-instagram-meta" target="_blank" rel="noopener noreferrer" style="color:#0f172a;">
                      <div class="grid-card">
                        <img src="https://api.ordinaly.ai/media/service_images/3_en_tamano_mediano.webp" alt="Meta" style="width:100%;height:auto;" />
                        <div class="grid-body">
                          <h3 class="h3" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">Automatizaci&oacute;n Facebook e Instagram</h3>
                          <p class="grid-sub" style="color:#475569;-webkit-text-fill-color:#475569;">Publicaci&oacute;n constante sin estar pendiente cada d&iacute;a.</p>
                        </div>
                      </div>
                    </a>
                  </td>

                  <td width="50%" style="padding-left:8px;vertical-align:top;">
                    <a href="https://ordinaly.ai/services/automatizacion-de-publicaciones-en-linkedin-para-empresas-y-autonomos" target="_blank" rel="noopener noreferrer" style="color:#0f172a;">
                      <div class="grid-card">
                        <img src="https://api.ordinaly.ai/media/service_images/people_ordinaly_07.jpg" alt="LinkedIn" style="width:100%;height:auto;" />
                        <div class="grid-body">
                          <h3 class="h3" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">Automatizaci&oacute;n de LinkedIn</h3>
                          <p class="grid-sub" style="color:#475569;-webkit-text-fill-color:#475569;">Workflow para preparar, programar y publicar con consistencia.</p>
                        </div>
                      </div>
                    </a>
                  </td>
                </tr>

                <tr><td style="height:14px;"></td><td></td></tr>

                <tr>
                  <td width="50%" style="padding-right:8px;vertical-align:top;">
                    <a href="https://ordinaly.ai/services" target="_blank" rel="noopener noreferrer" style="color:#0f172a;">
                      <div class="grid-card">
                        <img src="https://api.ordinaly.ai/media/service_images/2_en_tamano_mediano.webp" alt="Pymes" style="width:100%;height:auto;" />
                        <div class="grid-body">
                          <h3 class="h3" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">Automatizaci&oacute;n para pymes</h3>
                          <p class="grid-sub" style="color:#475569;-webkit-text-fill-color:#475569;">Integraciones y procesos medibles para ahorrar tiempo.</p>
                        </div>
                      </div>
                    </a>
                  </td>

                  <td width="50%" style="padding-left:8px;vertical-align:top;">
                    <a href="https://ordinaly.ai/services" target="_blank" rel="noopener noreferrer" style="color:#0f172a;">
                      <div class="grid-card">
                        <img src="https://api.ordinaly.ai/media/service_images/people_ordinaly_08.jpeg" alt="Odoo" style="width:100%;height:auto;" />
                        <div class="grid-body">
                          <h3 class="h3" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">Implantaci&oacute;n de Odoo</h3>
                          <p class="grid-sub" style="color:#475569;-webkit-text-fill-color:#475569;">ERP con foco en procesos, datos y adopci&oacute;n real del equipo.</p>
                        </div>
                      </div>
                    </a>
                  </td>
                </tr>
              </table>

              <div style="height:16px;"></div>

              <!-- Single CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td bgcolor="#316C20" style="border-radius:12px;background:#316C20;background-image:linear-gradient(#316C20,#316C20);">
                    <a href="https://ordinaly.ai/services"
                       target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;padding:12px 18px;font:800 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;
                              color:#ffffff;text-decoration:none;border-radius:12px;border:1px solid rgba(255,255,255,0.18);
                              -webkit-text-fill-color:#ffffff;">
                      Ver todos los servicios
                    </a>
                  </td>
                </tr>
              </table>

              <div style="height:10px;"></div>
              <p class="text" style="font-size:13px;color:#475569;-webkit-text-fill-color:#475569;">
                Si me dices tu sector y tus herramientas, te orientamos mejor.
              </p>
            </td>
          </tr>

          <tr><td class="divider"></td></tr>

          <!-- FORMATION -->
          <tr>
            <td class="p" style="background:#ffffff;background-image:linear-gradient(#ffffff,#ffffff);">
              <h2 class="h2" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">Formaci&oacute;n, sin rodeos</h2>
              <p class="text" style="margin-top:8px;color:#475569;-webkit-text-fill-color:#475569;">
                Si prefieres aprender antes de implantar, tenemos formaciones pr&aacute;cticas pensadas para construir y desplegar.
              </p>

              <div style="height:14px;"></div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="150" style="vertical-align:top;padding-right:14px;">
                    <a href="https://ordinaly.ai/formation" target="_blank" rel="noopener noreferrer">
                      <img class="mini-img" src="https://ordinaly.ai/static/backgrounds/formation_background.webp" alt="Formaci&oacute;n Ordinaly" width="150" />
                    </a>
                  </td>
                  <td style="vertical-align:top;">
                    <h3 class="h3" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">Aprende a construir, no solo a usar herramientas</h3>
                    <p class="text" style="margin-top:6px;color:#475569;-webkit-text-fill-color:#475569;">
                      Automatizaci&oacute;n con n8n, IA aplicada y criterios de arquitectura. Material orientado a casos reales.
                    </p>
                    <div style="height:10px;"></div>
                    <a href="https://ordinaly.ai/formation" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;color:#0f172a;-webkit-text-fill-color:#0f172a;">
                      Ver formaci&oacute;n
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td class="divider"></td></tr>

          <!-- NEXT STEP -->
          <tr>
            <td class="p" style="background:#ffffff;background-image:linear-gradient(#ffffff,#ffffff);">
              <h2 class="h2" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">Tu siguiente paso</h2>
              <p class="text" style="margin-top:8px;color:#475569;-webkit-text-fill-color:#475569;">
                Cuando quieras, entra en tu cuenta y explora con calma.
              </p>
              <div style="height:10px;"></div>
              <p class="text" style="font-size:14px;color:#475569;-webkit-text-fill-color:#475569;">
                Acceso: <a href="https://ordinaly.ai/dashboard" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;color:#0f172a;-webkit-text-fill-color:#0f172a;">https://ordinaly.ai</a>
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="footer" style="color:#0f172a;-webkit-text-fill-color:#0f172a;">
              <p style="margin:0;font-weight:700;">ORDINALY SOFTWARE</p>
              <p style="margin:8px 0 0;color:#475569;-webkit-text-fill-color:#475569;">Automatizaci&oacute;n empresarial e IA desde Sevilla para el mundo</p>

              <p style="margin:14px 0 0;">
                <a href="https://ordinaly.ai">Web</a> |
                <a href="https://ordinaly.ai/services">Servicios</a> |
                <a href="https://ordinaly.ai/formation">Formaci&oacute;n</a>
              </p>

              <p style="margin:12px 0 0;font-size:12px;color:#475569;-webkit-text-fill-color:#475569;">
                Has recibido este correo porque has creado una cuenta en Ordinaly.
              </p>

              <p style="margin:10px 0 0;">
                <a href="mailto:info@ordinaly.ai">info@ordinaly.ai</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""
        _send_email(email, html, subject="Bienvenido a Ordinaly")
    except Exception as e:
        raise EmailServiceError("No se pudo enviar el correo de bienvenida") from e


def send_password_reset_email(email: str, token: str, user_name: str):
    try:
        frontend_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")
        reset_url = f"{frontend_url}/reset-password/confirm?token={token}"

        html = f"""\
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Restablecer contrase&ntilde;a - Ordinaly</title>
    <!--[if mso]>
      <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
    <![endif]-->
    <style>
      :root{{--bg:#f6f7f8;--card:#ffffff;--text:#0f172a;--muted:#475569;--line:#e5e7eb;--cta:#316C20;--radius:14px;--footer_bg:#ffffff;--footer_text:#0f172a;--footer_link:#0f172a;--footer_line:#e5e7eb;}}
      html,body{{margin:0;padding:0;background:var(--bg);}}
      img{{border:0;outline:none;text-decoration:none;display:block;max-width:100%;}}
      a{{color:inherit;text-decoration:none;}}
      .preheader{{display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;}}
      .container{{width:100%;background:var(--bg);padding:24px 12px;}}
      .card{{max-width:640px;margin:0 auto;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;}}
      .p{{padding:28px 24px;}}
      .h1{{font:800 24px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--text);margin:0;}}
      .h2{{font:800 16px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--text);margin:0;}}
      .text{{font:400 15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--muted);margin:0;}}
      .divider{{height:1px;background:var(--line);line-height:1px;font-size:1px;}}
      .badge{{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:6px 10px;font:700 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--muted);}}
      .footer{{background:var(--footer_bg);color:var(--footer_text);padding:30px 24px;text-align:center;font:400 14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;border-top:1px solid var(--footer_line);}}
      .footer a{{color:var(--footer_link);text-decoration:underline;margin:0 5px;}}
      @media (max-width:520px){{.p{{padding:22px 16px;}}.h1{{font-size:22px;}}}}
    </style>
  </head>
  <body>
    <div class="preheader">Restablece tu contrase&ntilde;a de Ordinaly. Este enlace expira en 15 minutos.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="container">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="card">
          <!-- HEADER -->
          <tr><td class="p" style="padding-bottom:18px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td align="left" style="vertical-align:middle;">
                  <a href="https://ordinaly.ai" target="_blank" rel="noopener noreferrer">
                    <img src="https://ordinaly.ai/logo.webp" alt="Ordinaly" height="34" style="height:34px;width:auto;" />
                  </a>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span class="badge">Restablecer contrase&ntilde;a</span>
                </td>
              </tr>
            </table>
            <div style="height:16px;"></div>
            <h1 class="h1">Restablece tu contrase&ntilde;a</h1>
            <p class="text" style="margin-top:8px;">
              Hola {user_name}, hemos recibido una solicitud para restablecer la contrase&ntilde;a de tu cuenta de Ordinaly.
            </p>
          </td></tr>
          <tr><td class="divider"></td></tr>
          <!-- BODY -->
          <tr><td class="p">
            <p class="text">
              Haz clic en el bot&oacute;n de abajo para elegir una nueva contrase&ntilde;a. Este enlace expira en <strong style="color:#0f172a;">15 minutos</strong>.
            </p>
            <div style="height:20px;"></div>
            <!-- CTA BUTTON -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr><td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr><td align="center" bgcolor="#316C20" style="border-radius:10px;">
                    <a href="{reset_url}" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;padding:14px 28px;font:800 15px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;border-radius:10px;">
                      Restablecer contrase&ntilde;a
                    </a>
                  </td></tr>
                </table>
              </td></tr>
            </table>
            <div style="height:20px;"></div>
            <p class="text" style="font-size:13px;">
              Si t&uacute; no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contrase&ntilde;a no cambiar&aacute;.
            </p>
            <div style="height:18px;"></div>
            <p class="text" style="font-size:13px;">
              Si necesitas ayuda, escribe a <a href="mailto:info@ordinaly.ai" style="text-decoration:underline;">info@ordinaly.ai</a>.
            </p>
          </td></tr>
          <!-- FOOTER -->
          <tr><td class="footer">
            <p style="margin:0;font-weight:700;">ORDINALY SOFTWARE</p>
            <p style="margin:8px 0 0;">Automatizaci&oacute;n empresarial e IA desde Sevilla para el mundo</p>
            <p style="margin:14px 0 0;">
              <a href="https://ordinaly.ai" target="_blank" rel="noopener noreferrer">Sitio web</a> |
              <a href="https://ordinaly.ai/contact" target="_blank" rel="noopener noreferrer">Contacto</a> |
              <a href="https://ordinaly.ai/blog" target="_blank" rel="noopener noreferrer">Blog</a>
            </p>
            <p style="margin:14px 0 0;">&copy; 2026 Ordinaly Software. Todos los derechos reservados.</p>
            <p style="margin:10px 0 0;">
              <a href="mailto:info@ordinaly.ai">info@ordinaly.ai</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>"""
        _send_email(email, html, subject="Restablecer contraseña - Ordinaly")
    except Exception as e:
        raise EmailServiceError("No se pudo enviar el correo de restablecimiento de contraseña") from e


def send_enrollment_confirmation_email(email: str, user_name: str, course):
    """Send a confirmation email when a user successfully enrolls in a course."""
    try:
        frontend_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")
        backend_url = os.getenv("BACKEND_BASE_URL", os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")).rstrip("/")

        course_url = f"{frontend_url}/formation/{course.slug}"

        # Build cover image tag if the course has an image
        hero_html = ""
        if course.image:
            image_url = f"{backend_url}{course.image.url}"
            hero_html = f'<tr><td><img src="{image_url}" alt="{course.title}" width="640" style="width:100%;height:auto;" /></td></tr>'

        # Format dates and times
        date_str = ""
        if course.start_date:
            date_str = course.start_date.strftime("%d/%m/%Y")
            if course.end_date and course.end_date != course.start_date:
                date_str += f" - {course.end_date.strftime('%d/%m/%Y')}"

        time_str = ""
        if course.start_time:
            time_str = course.start_time.strftime("%H:%M")
            if course.end_time:
                time_str += f" - {course.end_time.strftime('%H:%M')}"

        max_seats = course.max_attendants or "—"

        # Build subtitle
        subtitle = course.subtitle or ""

        html = f"""\
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Inscripci&oacute;n confirmada - {course.title}</title>
    <!--[if mso]>
      <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
    <![endif]-->
    <style>
      :root{{--bg:#f6f7f8;--card:#ffffff;--text:#0f172a;--muted:#475569;--line:#e5e7eb;--cta:#316C20;--radius:14px;--footer_bg:#ffffff;--footer_text:#0f172a;--footer_link:#0f172a;--footer_line:#e5e7eb;}}
      html,body{{margin:0;padding:0;background:var(--bg);}}
      img{{border:0;outline:none;text-decoration:none;display:block;max-width:100%;}}
      a{{color:inherit;text-decoration:none;}}
      .preheader{{display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;}}
      .container{{width:100%;background:var(--bg);padding:24px 12px;}}
      .card{{max-width:640px;margin:0 auto;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;}}
      .p{{padding:28px 24px;}}
      .h1{{font:700 28px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--text);margin:0;}}
      .h2{{font:700 16px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--text);margin:0;}}
      .text{{font:400 15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--muted);margin:0;}}
      .divider{{height:1px;background:var(--line);line-height:1px;font-size:1px;}}
      .badge{{display:inline-block;border:1px solid #bbf7d0;border-radius:999px;padding:6px 10px;font:600 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:#166534;background:#f0fdf4;}}
      .kpi{{width:100%;border:1px solid var(--line);border-radius:12px;padding:14px 14px;}}
      .kpi .label{{font:600 12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--muted);}}
      .kpi .value{{font:700 14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--text);}}
      .footer{{background:var(--footer_bg);color:var(--footer_text);padding:30px 24px;text-align:center;font:400 14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;border-top:1px solid var(--footer_line);}}
      .footer a{{color:var(--footer_link);text-decoration:underline;margin:0 5px;}}
      .social-row{{margin-top:14px;}}
      .social-cell{{width:44px;height:44px;border-radius:999px;background:var(--cta);}}
      .social-link{{display:block;width:44px;height:44px;line-height:44px;text-align:center;}}
      .social-svg{{width:20px;height:20px;vertical-align:middle;margin-top:12px;}}
      @media (max-width:520px){{.p{{padding:22px 16px;}}.h1{{font-size:24px;}}}}
    </style>
  </head>
  <body>
    <div class="preheader">&#161;Inscripci&oacute;n confirmada! {course.title}, {date_str}, {time_str}.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="container">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="card">

          {hero_html}

          <!-- HEADER -->
          <tr><td class="p" style="padding-bottom:18px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td align="left" style="vertical-align:middle;">
                  <a href="https://ordinaly.ai" target="_blank" rel="noopener noreferrer">
                    <img src="https://ordinaly.ai/logo.webp" alt="Ordinaly" height="34" style="height:34px;width:auto;" />
                  </a>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span class="badge">Inscripci&oacute;n confirmada</span>
                </td>
              </tr>
            </table>
            <div style="height:16px;"></div>
            <h1 class="h1">&#161;Hola {user_name}, tu plaza est&aacute; reservada!</h1>
            <p class="text" style="margin-top:8px;">
              Te has inscrito correctamente en <strong style="color:#0f172a;">{course.title}</strong>.
              {(' ' + subtitle) if subtitle else ''}
            </p>
          </td></tr>

          <tr><td class="divider"></td></tr>

          <!-- INFO -->
          <tr><td class="p">
            <h2 class="h2">Informaci&oacute;n del curso</h2>
            <div style="height:10px;"></div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="kpi">
              <tr>
                <td style="width:33%;vertical-align:top;padding:6px 0;">
                  <div class="label">Fecha</div>
                  <div class="value">{date_str or '&mdash;'}</div>
                </td>
                <td style="width:33%;vertical-align:top;padding:6px 0;">
                  <div class="label">Horario</div>
                  <div class="value">{time_str or '&mdash;'}</div>
                </td>
                <td style="width:34%;vertical-align:top;padding:6px 0;">
                  <div class="label">Plazas</div>
                  <div class="value">M&aacute;x. {max_seats}</div>
                </td>
              </tr>
            </table>

            <div style="height:18px;"></div>

            <p class="text">
              Recuerda que puedes consultar todos los detalles del curso en cualquier momento desde tu &aacute;rea de formaci&oacute;n.
            </p>

            <div style="height:18px;"></div>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
              <tr>
                <td align="center" bgcolor="#316C20" style="border-radius:10px;">
                  <a href="{course_url}" target="_blank" rel="noopener noreferrer"
                     style="display:inline-block;padding:12px 18px;font:700 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;border-radius:10px;">
                    Ver mi formaci&oacute;n
                  </a>
                </td>
              </tr>
            </table>

            <div style="height:12px;"></div>

            <p class="text" style="font-size:13px;">
              Si necesitas ayuda, escribe a <a href="mailto:info@ordinaly.ai" style="text-decoration:underline;">info@ordinaly.ai</a>.
            </p>
          </td></tr>

          <!-- FOOTER -->
          <tr><td class="footer">
            <p style="margin:0;font-weight:700;">ORDINALY SOFTWARE</p>
            <p style="margin:8px 0 0;">Automatizaci&oacute;n empresarial e IA desde Sevilla para el mundo</p>
            <p style="margin:14px 0 0;">
              <a href="https://ordinaly.ai" target="_blank" rel="noopener noreferrer">Sitio web</a> |
              <a href="https://ordinaly.ai/contact" target="_blank" rel="noopener noreferrer">Contacto</a> |
              <a href="https://ordinaly.ai/blog" target="_blank" rel="noopener noreferrer">Blog</a>
            </p>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="social-row">
              <tr>
                <td class="social-cell" style="border-radius:999px;" align="center" valign="middle">
                  <a class="social-link" href="https://www.linkedin.com/company/ordinalysoftware" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
                    <!--[if mso]><span style="color:#fff;font-family:Arial;font-size:12px;">in</span><![endif]-->
                    <!--[if !mso]><!-- -->
                    <svg class="social-svg" fill="white" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    <!--<![endif]-->
                  </a>
                </td>
                <td style="width:12px;"></td>
                <td class="social-cell" style="border-radius:999px;" align="center" valign="middle">
                  <a class="social-link" href="https://www.instagram.com/ordinaly.ai/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
                    <!--[if mso]><span style="color:#fff;font-family:Arial;font-size:12px;">ig</span><![endif]-->
                    <!--[if !mso]><!-- -->
                    <svg class="social-svg" fill="white" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>
                    <!--<![endif]-->
                  </a>
                </td>
                <td style="width:12px;"></td>
                <td class="social-cell" style="border-radius:999px;" align="center" valign="middle">
                  <a class="social-link" href="https://www.youtube.com/@ordinaly" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube">
                    <!--[if mso]><span style="color:#fff;font-family:Arial;font-size:12px;">yt</span><![endif]-->
                    <!--[if !mso]><!-- -->
                    <svg class="social-svg" fill="white" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.016 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.121 2.136C4.495 20.455 12 20.455 12 20.455s7.505 0 9.377-.505a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    <!--<![endif]-->
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:14px 0 0;">&copy; 2026 Ordinaly Software. Todos los derechos reservados.</p>
            <p style="margin:10px 0 0;">
              <a href="mailto:info@ordinaly.ai">info@ordinaly.ai</a>
            </p>
          </td></tr>

        </table>
      </td></tr>
    </table>
  </body>
</html>"""
        _send_email(email, html, subject=f"Inscripción confirmada - {course.title}")
    except Exception as e:
        raise EmailServiceError("No se pudo enviar el correo de confirmación de inscripción") from e


def send_unenrollment_confirmation_email(email: str, user_name: str, course):
    """Send a confirmation email when a user unenrolls from a course."""
    try:
        frontend_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")
        formation_url = f"{frontend_url}/formation"

        # Format dates
        date_str = ""
        if course.start_date:
            date_str = course.start_date.strftime("%d/%m/%Y")
            if course.end_date and course.end_date != course.start_date:
                date_str += f" - {course.end_date.strftime('%d/%m/%Y')}"

        time_str = ""
        if course.start_time:
            time_str = course.start_time.strftime("%H:%M")
            if course.end_time:
                time_str += f" - {course.end_time.strftime('%H:%M')}"

        html = f"""\
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Inscripci&oacute;n cancelada - {course.title}</title>
    <!--[if mso]>
      <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
    <![endif]-->
    <style>
      :root{{--bg:#f6f7f8;--card:#ffffff;--text:#0f172a;--muted:#475569;--line:#e5e7eb;--cta:#316C20;--radius:14px;--footer_bg:#ffffff;--footer_text:#0f172a;--footer_link:#0f172a;--footer_line:#e5e7eb;}}
      html,body{{margin:0;padding:0;background:var(--bg);}}
      img{{border:0;outline:none;text-decoration:none;display:block;max-width:100%;}}
      a{{color:inherit;text-decoration:none;}}
      .preheader{{display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;}}
      .container{{width:100%;background:var(--bg);padding:24px 12px;}}
      .card{{max-width:640px;margin:0 auto;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;}}
      .p{{padding:28px 24px;}}
      .h1{{font:700 28px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--text);margin:0;}}
      .h2{{font:700 16px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--text);margin:0;}}
      .text{{font:400 15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--muted);margin:0;}}
      .divider{{height:1px;background:var(--line);line-height:1px;font-size:1px;}}
      .badge{{display:inline-block;border:1px solid #fecaca;border-radius:999px;padding:6px 10px;font:600 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:#991b1b;background:#fef2f2;}}
      .kpi{{width:100%;border:1px solid var(--line);border-radius:12px;padding:14px 14px;}}
      .kpi .label{{font:600 12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--muted);}}
      .kpi .value{{font:700 14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;color:var(--text);}}
      .footer{{background:var(--footer_bg);color:var(--footer_text);padding:30px 24px;text-align:center;font:400 14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;border-top:1px solid var(--footer_line);}}
      .footer a{{color:var(--footer_link);text-decoration:underline;margin:0 5px;}}
      .social-row{{margin-top:14px;}}
      .social-cell{{width:44px;height:44px;border-radius:999px;background:var(--cta);}}
      .social-link{{display:block;width:44px;height:44px;line-height:44px;text-align:center;}}
      .social-svg{{width:20px;height:20px;vertical-align:middle;margin-top:12px;}}
      @media (max-width:520px){{.p{{padding:22px 16px;}}.h1{{font-size:24px;}}}}
    </style>
  </head>
  <body>
    <div class="preheader">Tu inscripci&oacute;n en {course.title} ha sido cancelada.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="container">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="card">

          <!-- HEADER -->
          <tr><td class="p" style="padding-bottom:18px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td align="left" style="vertical-align:middle;">
                  <a href="https://ordinaly.ai" target="_blank" rel="noopener noreferrer">
                    <img src="https://ordinaly.ai/logo.webp" alt="Ordinaly" height="34" style="height:34px;width:auto;" />
                  </a>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span class="badge">Inscripci&oacute;n cancelada</span>
                </td>
              </tr>
            </table>
            <div style="height:16px;"></div>
            <h1 class="h1">{user_name}, tu inscripci&oacute;n ha sido cancelada</h1>
            <p class="text" style="margin-top:8px;">
              Hemos cancelado tu inscripci&oacute;n en el curso <strong style="color:#0f172a;">{course.title}</strong>.
              Si esto fue un error, puedes volver a inscribirte en cualquier momento.
            </p>
          </td></tr>

          <tr><td class="divider"></td></tr>

          <!-- COURSE INFO -->
          <tr><td class="p">
            <h2 class="h2">Detalles del curso cancelado</h2>
            <div style="height:10px;"></div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="kpi">
              <tr>
                <td style="width:50%;vertical-align:top;padding:6px 0;">
                  <div class="label">Curso</div>
                  <div class="value">{course.title}</div>
                </td>
                <td style="width:50%;vertical-align:top;padding:6px 0;">
                  <div class="label">Fecha</div>
                  <div class="value">{date_str or '&mdash;'}</div>
                </td>
              </tr>
            </table>

            <div style="height:18px;"></div>

            <p class="text">
              Si tienes alguna duda sobre la cancelaci&oacute;n o necesitas m&aacute;s informaci&oacute;n, no dudes en escribirnos.
            </p>

            <div style="height:18px;"></div>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
              <tr>
                <td align="center" bgcolor="#316C20" style="border-radius:10px;">
                  <a href="{formation_url}" target="_blank" rel="noopener noreferrer"
                     style="display:inline-block;padding:12px 18px;font:700 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;border-radius:10px;">
                    Explorar otras formaciones
                  </a>
                </td>
              </tr>
            </table>

            <div style="height:12px;"></div>

            <p class="text" style="font-size:13px;">
              Si necesitas ayuda, escribe a <a href="mailto:info@ordinaly.ai" style="text-decoration:underline;">info@ordinaly.ai</a>.
            </p>
          </td></tr>

          <!-- FOOTER -->
          <tr><td class="footer">
            <p style="margin:0;font-weight:700;">ORDINALY SOFTWARE</p>
            <p style="margin:8px 0 0;">Automatizaci&oacute;n empresarial e IA desde Sevilla para el mundo</p>
            <p style="margin:14px 0 0;">
              <a href="https://ordinaly.ai" target="_blank" rel="noopener noreferrer">Sitio web</a> |
              <a href="https://ordinaly.ai/contact" target="_blank" rel="noopener noreferrer">Contacto</a> |
              <a href="https://ordinaly.ai/blog" target="_blank" rel="noopener noreferrer">Blog</a>
            </p>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="social-row">
              <tr>
                <td class="social-cell" style="border-radius:999px;" align="center" valign="middle">
                  <a class="social-link" href="https://www.linkedin.com/company/ordinalysoftware" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
                    <!--[if mso]><span style="color:#fff;font-family:Arial;font-size:12px;">in</span><![endif]-->
                    <!--[if !mso]><!-- -->
                    <svg class="social-svg" fill="white" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    <!--<![endif]-->
                  </a>
                </td>
                <td style="width:12px;"></td>
                <td class="social-cell" style="border-radius:999px;" align="center" valign="middle">
                  <a class="social-link" href="https://www.instagram.com/ordinaly.ai/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
                    <!--[if mso]><span style="color:#fff;font-family:Arial;font-size:12px;">ig</span><![endif]-->
                    <!--[if !mso]><!-- -->
                    <svg class="social-svg" fill="white" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>
                    <!--<![endif]-->
                  </a>
                </td>
                <td style="width:12px;"></td>
                <td class="social-cell" style="border-radius:999px;" align="center" valign="middle">
                  <a class="social-link" href="https://www.youtube.com/@ordinaly" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube">
                    <!--[if mso]><span style="color:#fff;font-family:Arial;font-size:12px;">yt</span><![endif]-->
                    <!--[if !mso]><!-- -->
                    <svg class="social-svg" fill="white" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.016 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.121 2.136C4.495 20.455 12 20.455 12 20.455s7.505 0 9.377-.505a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    <!--<![endif]-->
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:14px 0 0;">&copy; 2026 Ordinaly Software. Todos los derechos reservados.</p>
            <p style="margin:10px 0 0;">
              <a href="mailto:info@ordinaly.ai">info@ordinaly.ai</a>
            </p>
          </td></tr>

        </table>
      </td></tr>
    </table>
  </body>
</html>"""
        _send_email(email, html, subject=f"Inscripción cancelada - {course.title}")
    except Exception as e:
        raise EmailServiceError("No se pudo enviar el correo de cancelación de inscripción") from e
