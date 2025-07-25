import { FaChalkboardTeacher } from "react-icons/fa";

export default function ClassroomsView({ user, onBack }) {
  const classrooms = [
    { id: 1, name: "Ajedrez Básico A1", teacher: "Prof. García", students: 24, level: "Principiante" },
    { id: 2, name: "Tácticas Intermedias", teacher: "Prof. Rodríguez", students: 18, level: "Intermedio" },
    { id: 3, name: "Finales de Partida", teacher: "Prof. López", students: 12, level: "Avanzado" }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Aulas Virtuales</h1>
        <button onClick={onBack} className="btn btn-outline">
          Volver al Home
        </button>
      </div>

      {user?.type === "teacher" && (
        <div className="mb-6">
          <button className="btn btn-success flex items-center space-x-2">
            <FaChalkboardTeacher />
            <span>Crear Nueva Aula</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((classroom) => (
          <div key={classroom.id} className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-2">{classroom.name}</h3>
            <p className="text-gray-600 mb-2">Profesor: {classroom.teacher}</p>
            <p className="text-gray-600 mb-2">Estudiantes: {classroom.students}</p>
            <span
              className={`badge mb-4 ${
                classroom.level === "Principiante"
                  ? "badge-success"
                  : classroom.level === "Intermedio"
                  ? "badge-warning"
                  : "badge-error"
              }`}
            >
              {classroom.level}
            </span>
            <div className="mt-4">
              <button className="btn btn-primary w-full">
                {user?.type === "teacher" ? "Administrar" : "Unirse"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
