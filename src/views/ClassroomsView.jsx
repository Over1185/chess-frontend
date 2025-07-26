import { FaChalkboardTeacher, FaUsers, FaClock } from "react-icons/fa";

export default function ClassroomsView({ user, onBack }) {
  // Simulamos algunas aulas de ejemplo basadas en los datos del usuario
  // En una implementación real, estas vendrían de una API
  const userClassrooms = user?.aulas || [];
  const pendingRequests = user?.solicitudes_aula || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Aulas Virtuales</h1>
        <button onClick={onBack} className="btn btn-outline">
          Volver al Home
        </button>
      </div>

      {/* Botón para crear aula (solo profesores) */}
      {user?.type === "profesor" && (
        <div className="mb-6">
          <button className="btn btn-success flex items-center space-x-2">
            <FaChalkboardTeacher />
            <span>Crear Nueva Aula</span>
          </button>
        </div>
      )}

      {/* Solicitudes pendientes */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaClock className="mr-2 text-yellow-500" />
            Solicitudes Pendientes ({pendingRequests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((request, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-800">Solicitud de Aula</h3>
                <p className="text-yellow-700 text-sm">Estado: Pendiente</p>
                <div className="mt-2 flex space-x-2">
                  <button className="btn btn-sm btn-success">Aceptar</button>
                  <button className="btn btn-sm btn-error">Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mis Aulas */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <FaUsers className="mr-2 text-blue-500" />
          Mis Aulas ({userClassrooms.length})
        </h2>
        
        {userClassrooms.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <FaChalkboardTeacher className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-600 mb-2">No tienes aulas asignadas</h3>
            <p className="text-gray-500">
              {user?.type === "profesor" 
                ? "Crea tu primera aula para comenzar a enseñar"
                : "Solicita unirte a un aula o espera una invitación"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userClassrooms.map((classroom, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-2">
                  {classroom.name || `Aula ${index + 1}`}
                </h3>
                <p className="text-gray-600 mb-2">
                  Profesor: {classroom.teacher || "Sin asignar"}
                </p>
                <p className="text-gray-600 mb-2">
                  Estudiantes: {classroom.students || 0}
                </p>
                <span className="badge badge-primary mb-4">
                  {classroom.level || "General"}
                </span>
                <div className="mt-4">
                  <button className="btn btn-primary w-full">
                    {user?.type === "profesor" ? "Administrar" : "Acceder"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aulas Disponibles (solo para estudiantes) */}
      {user?.type !== "profesor" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Aulas Disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ejemplo de aulas disponibles - en una app real vendrían de la API */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">Ajedrez Básico A1</h3>
              <p className="text-gray-600 mb-2">Profesor: Prof. García</p>
              <p className="text-gray-600 mb-2">Estudiantes: 24</p>
              <span className="badge badge-success mb-4">Principiante</span>
              <div className="mt-4">
                <button className="btn btn-outline btn-primary w-full">
                  Solicitar Unirse
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">Tácticas Intermedias</h3>
              <p className="text-gray-600 mb-2">Profesor: Prof. Rodríguez</p>
              <p className="text-gray-600 mb-2">Estudiantes: 18</p>
              <span className="badge badge-warning mb-4">Intermedio</span>
              <div className="mt-4">
                <button className="btn btn-outline btn-primary w-full">
                  Solicitar Unirse
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">Finales de Partida</h3>
              <p className="text-gray-600 mb-2">Profesor: Prof. López</p>
              <p className="text-gray-600 mb-2">Estudiantes: 12</p>
              <span className="badge badge-error mb-4">Avanzado</span>
              <div className="mt-4">
                <button className="btn btn-outline btn-primary w-full">
                  Solicitar Unirse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}