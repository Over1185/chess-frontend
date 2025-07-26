import { FaBook, FaCheckCircle, FaLock } from "react-icons/fa";

export default function LearnView({ user, onBack }) {
  // Lecciones disponibles - en una app real vendrían de la API
  const allLessons = [
    { id: 1, title: "Reglas Básicas", description: "Aprende cómo se mueven las piezas", level: "Principiante", order: 1 },
    { id: 2, title: "Valor de las Piezas", description: "Comprende el valor relativo de cada pieza", level: "Principiante", order: 2 },
    { id: 3, title: "Jaque y Jaque Mate", description: "Aprende a dar jaque y mate", level: "Principiante", order: 3 },
    { id: 4, title: "Aperturas Básicas", description: "Primeros movimientos estratégicos", level: "Intermedio", order: 4 },
    { id: 5, title: "Tácticas Básicas", description: "Clavada, horquilla y descubierta", level: "Intermedio", order: 5 },
    { id: 6, title: "Finales de Peones", description: "Técnicas básicas de finales", level: "Intermedio", order: 6 },
    { id: 7, title: "Finales de Torres", description: "Técnicas avanzadas de finales", level: "Avanzado", order: 7 },
    { id: 8, title: "Estrategia Posicional", description: "Conceptos estratégicos avanzados", level: "Avanzado", order: 8 },
    { id: 9, title: "Tácticas Avanzadas", description: "Combinaciones complejas", level: "Avanzado", order: 9 }
  ];

  // Lecciones vistas por el usuario
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Aprende Ajedrez</h1>
        <button onClick={onBack} className="btn btn-outline">
          Volver al Home
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

      {/* Lecciones por nivel */}
      {["Principiante", "Intermedio", "Avanzado"].map(level => {
        const levelLessons = allLessons.filter(lesson => lesson.level === level);
        const levelCompleted = levelLessons.filter(lesson => 
          isLessonCompleted(lesson.id)
        ).length;

        return (
          <div key={level} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{level}</h2>
              <span className="text-sm text-gray-600">
                {levelCompleted}/{levelLessons.length} completadas
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levelLessons.map((lesson) => {
                const isCompleted = isLessonCompleted(lesson.id);
                const isAvailable = isLessonAvailable(lesson);
                
                return (
                  <div 
                    key={lesson.id} 
                    className={`bg-white rounded-lg shadow-lg p-6 relative ${
                      !isAvailable ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Indicador de estado */}
                    <div className="absolute top-4 right-4">
                      {isCompleted ? (
                        <FaCheckCircle className="text-2xl text-green-500" />
                      ) : !isAvailable ? (
                        <FaLock className="text-2xl text-gray-400" />
                      ) : null}
                    </div>

                    <h3 className="text-xl font-bold mb-2 pr-8">{lesson.title}</h3>
                    <p className="text-gray-600 mb-4">{lesson.description}</p>
                    
                    <span 
                      className={`badge mb-4 ${
                        level === 'Principiante' ? 'badge-success' : 
                        level === 'Intermedio' ? 'badge-warning' : 'badge-error'
                      }`}
                    >
                      {lesson.level}
                    </span>
                    
                    <div className="mt-4">
                      <button 
                        className={`btn w-full ${
                          isCompleted 
                            ? 'btn-success' 
                            : isAvailable 
                              ? 'btn-primary' 
                              : 'btn-disabled'
                        }`}
                        disabled={!isAvailable}
                      >
                        <FaBook className="mr-2" />
                        {isCompleted 
                          ? 'Repasar Lección' 
                          : isAvailable 
                            ? 'Comenzar Lección'
                            : 'Bloqueada'
                        }
                      </button>
                    </div>
                    
                    {!isAvailable && lesson.order > 1 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Completa la lección anterior para desbloquear
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

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