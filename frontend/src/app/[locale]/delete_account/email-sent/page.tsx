export default function EmailSent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl">
            ✉️
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Revisa tu correo electrónico
        </h1>
        <p className="text-gray-600 mb-6">
          Te hemos enviado un enlace para confirmar la eliminación de tu cuenta.
          Si no lo encuentras, revisa la carpeta de spam o promociones.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          ¿No te ha llegado? Podrás solicitar un nuevo enlace pasados unos minutos.
        </p>
        <a
          href="/"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
