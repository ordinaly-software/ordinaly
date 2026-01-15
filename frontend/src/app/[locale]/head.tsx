const PRELOAD_IMAGES = [
  "/static/main_home_ilustration.webp",
  "/static/main_home_ilustration_1200.webp",
  "/logo_80.webp",
  "/static/logos/logo_grupo_addu_small.webp",
  "/static/logos/logo_aviva_publicidad_small.webp",
  "/static/logos/logo_proinca_consultores_small.webp",
  "/static/logos/logo_guadalquivir_fincas_small.webp",
];

export default function Head() {
  return (
    <>
      {PRELOAD_IMAGES.map((href) => (
        <link key={href} rel="preload" as="image" href={href} />
      ))}
    </>
  );
}
