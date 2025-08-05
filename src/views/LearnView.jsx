import { useState } from "react";
import { FaBook, FaCheckCircle, FaLock, FaArrowLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function LearnView({ user, onBack }) {
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const lessonsPerPage = 6;

  // Lecciones disponibles - 3 lecciones por defecto (paginación activada cuando hay más de 6)
  const allLessons = [
    {
      id: 1,
      title: "Introducción al Ajedrez",
      description: "Aprende las reglas básicas y cómo se mueven las piezas",
      order: 1
    },
    {
      id: 2,
      title: "Tácticas Fundamentales",
      description: "Descubre las tácticas básicas: clavada, horquilla y pincho",
      order: 2
    },
    {
      id: 3,
      title: "Finales Básicos",
      description: "Aprende técnicas esenciales para ganar en el final",
      order: 3
    }
  ];

  // Lecciones completadas por el usuario
  const userCompletedLessons = user?.lecciones_vistas || [];

  // Función para determinar si una lección está disponible
  const isLessonAvailable = (lesson) => {
    if (lesson.order === 1) return true; // Primera lección siempre disponible

    // Verificar si la lección anterior está completada
    const previousLessonCompleted = userCompletedLessons.some(
      completedId => completedId === lesson.id - 1
    );

    return previousLessonCompleted;
  };

  // Función para determinar si una lección está completada
  const isLessonCompleted = (lessonId) => {
    return userCompletedLessons.includes(lessonId);
  };

  // Calcular progreso
  const totalLessons = allLessons.length;
  const completedCount = userCompletedLessons.length;
  const progressPercentage = Math.round((completedCount / totalLessons) * 100);

  // Lógica de paginación
  const totalPages = Math.ceil(totalLessons / lessonsPerPage);
  const startIndex = (currentPage - 1) * lessonsPerPage;
  const endIndex = startIndex + lessonsPerPage;
  const currentLessons = allLessons.slice(startIndex, endIndex);

  // Funciones de navegación de página
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Aprende Ajedrez</h1>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <FaArrowLeft />
          <span>Volver</span>
        </button>
      </div>

      {/* Barra de progreso */}
      {user && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Tu Progreso</h2>
            <span className="text-lg font-semibold text-blue-600">
              {completedCount}/{totalLessons} lecciones
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Progreso: {progressPercentage}%</span>
            <span>
              {completedCount === totalLessons
                ? "¡Felicidades! Has completado todas las lecciones"
                : `${totalLessons - completedCount} lecciones restantes`
              }
            </span>
          </div>
        </div>
      )}

      {/* Lista de lecciones secuenciales */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Lecciones</h2>
          {totalPages > 1 && (
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages} • {totalLessons} lecciones total
            </div>
          )}
        </div>

        {currentLessons.map((lesson) => {
          const isCompleted = isLessonCompleted(lesson.id);
          const isAvailable = isLessonAvailable(lesson);

          return (
            <div
              key={lesson.id}
              className={`bg-white rounded-lg shadow-lg p-6 border-l-4 transition-all duration-200 ${isCompleted
                ? 'border-green-500 bg-green-50'
                : isAvailable
                  ? 'border-blue-500 hover:shadow-xl'
                  : 'border-gray-300 opacity-60'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-500 mr-3">
                      Lección {lesson.order}
                    </span>
                    {isCompleted && (
                      <FaCheckCircle className="text-green-500 mr-2" />
                    )}
                    {!isAvailable && (
                      <FaLock className="text-gray-400 mr-2" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {lesson.title}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {lesson.description}
                  </p>

                  {!isAvailable && lesson.order > 1 && (
                    <p className="text-sm text-gray-500 mb-4">
                      Completa la lección anterior para desbloquear
                    </p>
                  )}
                </div>

                <div className="ml-6">
                  <button
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${isCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : isAvailable
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    disabled={!isAvailable}
                  >
                    <FaBook />
                    <span>
                      {isCompleted
                        ? 'Repasar'
                        : isAvailable
                          ? 'Comenzar'
                          : 'Bloqueada'
                      }
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-8 mb-8">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <FaChevronLeft className="text-sm" />
            <span>Anterior</span>
          </button>

          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  className={`w-10 h-10 rounded-lg transition-colors ${currentPage === pageNumber
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <span>Siguiente</span>
            <FaChevronRight className="text-sm" />
          </button>
        </div>
      )}

      {/* Mensaje para usuarios no logueados */}
      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            ¡Inicia sesión para seguir tu progreso!
          </h3>
          <p className="text-blue-600">
            Registra tu cuenta para guardar tu progreso en las lecciones y acceder a contenido personalizado.
          </p>
        </div>
      )}
    </div>
  );
}