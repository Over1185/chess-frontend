import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaCheckCircle, FaLock, FaArrowLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { authFetch } from "../utils/auth";

export default function LearnView({ user, onBack }) {
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const lessonsPerPage = 6;
  const navigate = useNavigate();

  // Estado para lecciones cargadas desde el backend
  const [allLessons, setAllLessons] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar lecciones y progreso desde el backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Cargar lecciones con fallback
        let lecciones = [];

        // Primero intentar desde el endpoint principal
        const leccionesResponse = await authFetch("/lecciones");
        if (leccionesResponse.ok) {
          const leccionesData = await leccionesResponse.json();
          lecciones = leccionesData.lecciones || [];
        }

        // Si no hay lecciones, intentar desde el endpoint de admin
        if (lecciones.length === 0) {
          console.log("No se encontraron lecciones en /lecciones, intentando /admin/lecciones");
          try {
            const adminResponse = await authFetch("/admin/lecciones");
            if (adminResponse.ok) {
              const adminData = await adminResponse.json();
              lecciones = adminData.lecciones || [];
              console.log("Lecciones cargadas desde admin:", lecciones.length);
            }
          } catch (adminError) {
            console.log("Error cargando desde admin:", adminError);
          }
        }

        // Si aún no hay lecciones, usar las por defecto
        if (lecciones.length === 0) {
          console.log("Usando lecciones por defecto");
          lecciones = getDefaultLessons();
        }

        setAllLessons(lecciones);

        // Cargar progreso del usuario
        if (user) {
          const progresoResponse = await authFetch("/progreso-lecciones");
          if (progresoResponse.ok) {
            const progresoData = await progresoResponse.json();
            setUserProgress(progresoData.progreso_lecciones || []);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        // Usar lecciones por defecto en caso de error
        setAllLessons(getDefaultLessons());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Función para obtener lecciones por defecto (fallback)
  const getDefaultLessons = () => [
    {
      id: 1,
      _id: "default_1",
      titulo: "Fundamentos del Ajedrez",
      descripcion: "Aprende las reglas básicas, el tablero y el movimiento de las piezas",
      orden: 1,
      dificultad: "Principiante"
    },
    {
      id: 2,
      _id: "default_2",
      titulo: "Tácticas Básicas de Ajedrez",
      descripcion: "Aprende las tácticas fundamentales: clavada, horquilla, ataque doble y descubierta",
      orden: 2,
      dificultad: "Principiante"
    }
  ];

  // Función para determinar si una lección está disponible
  const isLessonAvailable = (lesson) => {
    console.log("=== VERIFICANDO DISPONIBILIDAD ===");
    console.log("Lección:", lesson.titulo || lesson.title);
    console.log("ID de lección:", lesson._id || lesson.id);

    // Encontrar la lección anterior basándose en la lista ordenada
    const currentLessonIndex = allLessons.findIndex(l =>
      (l._id === lesson._id) || (l.id === lesson.id)
    );

    console.log("Índice de lección actual:", currentLessonIndex);

    if (currentLessonIndex === 0) {
      console.log("Primera lección en la lista - siempre disponible");
      return true;
    }

    if (currentLessonIndex === -1) {
      console.log("Lección no encontrada en la lista");
      return false;
    }

    // Obtener la lección anterior basándose en el índice
    const previousLesson = allLessons[currentLessonIndex - 1];
    const previousLessonId = previousLesson._id || previousLesson.id;

    console.log("Lección anterior:", previousLesson.titulo || previousLesson.title);
    console.log("ID de lección anterior:", previousLessonId);

    // Verificar si la lección anterior está completada
    const isPreviousCompleted = userProgress.some(progress => {
      // Comparar tanto por ObjectId como por ID numérico
      const match = (progress.leccion_id === previousLessonId ||
        progress.leccion_id === previousLesson.id?.toString() ||
        parseInt(progress.leccion_id) === previousLesson.id) &&
        progress.completada;

      console.log(`Comparando progreso: ${progress.leccion_id} vs ${previousLessonId} (${previousLesson.id}) && ${progress.completada} = ${match}`);
      return match;
    });

    console.log("Lección anterior completada:", isPreviousCompleted);
    return isPreviousCompleted;
  };  // Función para determinar si una lección está completada
  const isLessonCompleted = (lessonId) => {
    return userProgress.some(
      progress => {
        // Convertir tanto el lessonId como el progress.leccion_id a string para comparar
        const progressLessonId = progress.leccion_id?.toString();
        const currentLessonId = lessonId?.toString();

        // También intentar comparación numérica si es posible
        const progressLessonNum = parseInt(progress.leccion_id);
        const currentLessonNum = parseInt(lessonId);

        return (progressLessonId === currentLessonId ||
          (!isNaN(progressLessonNum) && !isNaN(currentLessonNum) && progressLessonNum === currentLessonNum))
          && progress.completada;
      }
    );
  };

  // Calcular progreso
  const totalLessons = allLessons.length;
  const completedCount = userProgress.filter(p => p.completada).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

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

  // Función para abrir lección usando React Router
  const openLesson = (lesson) => {
    // Priorizar el campo 'id' que ahora debería estar presente en todas las lecciones
    const lessonId = lesson.id || lesson._id;
    console.log("=== ABRIENDO LECCIÓN ===");
    console.log("Datos completos de la lección:", lesson);
    console.log("ID seleccionado:", lessonId, "Tipo:", typeof lessonId);
    console.log("lesson.id:", lesson.id, "lesson._id:", lesson._id);

    if (!lessonId) {
      console.error("No se pudo determinar el ID de la lección");
      alert("Error: No se pudo abrir la lección. ID no válido.");
      return;
    }

    navigate(`/learn/${lessonId}`);
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando lecciones...</p>
        </div>
      </div>
    );
  }

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
          // Priorizar el campo 'id' que ahora debería estar presente en todas las lecciones
          const lessonId = lesson.id || lesson._id;
          const isCompleted = isLessonCompleted(lessonId);
          const isAvailable = isLessonAvailable(lesson);
          const lessonTitle = lesson.titulo || lesson.title;
          const lessonDescription = lesson.descripcion || lesson.description;
          const lessonOrder = lesson.orden || lesson.order || lesson.id;

          return (
            <div
              key={lessonId}
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
                      Lección {lessonOrder}
                    </span>
                    {isCompleted && (
                      <FaCheckCircle className="text-green-500 mr-2" />
                    )}
                    {!isAvailable && (
                      <FaLock className="text-gray-400 mr-2" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {lessonTitle}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {lessonDescription}
                  </p>

                  {!isAvailable && lessonOrder > 1 && (
                    <p className="text-sm text-gray-500 mb-4">
                      Completa la lección anterior para desbloquear
                    </p>
                  )}
                </div>

                <div className="ml-6">
                  <button
                    onClick={() => isAvailable && openLesson(lesson)}
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