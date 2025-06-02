const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center mb-4">
              <div className="text-2xl font-bold text-[#32E875]">ORDINALY</div>
              <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">.ai</div>
            </div>
            <div className="flex items-center mb-4">
              <img
                src="/logo.webp"
                alt="Ordinaly.ai Logo"
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Transformando empresas andaluzas con inteligencia artificial y automatización.
            </p>
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>Chatbots IA</li>
              <li>Automatización</li>
              <li>Integración Odoo</li>
              <li>WhatsApp Business</li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>info@ordinaly.ai</li>
              <li>+34 XXX XXX XXX</li>
              <li>Andalucía, España</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 Ordinaly.ai. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;