import { FaBook } from "react-icons/fa";

export default function LearnView({ user, onBack }) {
  const lessons = [
    { title: "Reglas Básicas", description: "Aprende cómo se mueven las piezas", level: "Principiante" },
    { title: "Aperturas", description: "Primeros movimientos estratégicos", level: "Intermedio" },
    { title: "Finales", description: "Técnicas para finalizar partidas", level: "Avanzado" }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Aprende Ajedrez</h1>
        <button onClick={onBack} className="btn btn-outline">
          Volver al Home
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
            <p className="text-gray-600 mb-2">{lesson.description}</p>
            <span className={`badge ${lesson.level === 'Principiante' ? 'badge-success' : lesson.level === 'Intermedio' ? 'badge-warning' : 'badge-error'}`}>
              {lesson.level}
            </span>
            <div className="mt-4">
              <button className="btn btn-primary w-full">
                <FaBook className="mr-2" />
                Comenzar Lección
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
