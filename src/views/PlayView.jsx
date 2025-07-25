import { FaUser } from "react-icons/fa";

export default function PlayView({ user, onBack }) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Jugar</h1>
        <button onClick={onBack} className="btn btn-outline">
          Volver al Home
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <FaUser className="text-6xl text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Partida Rápida</h2>
          <p className="text-gray-600 mb-6">Juega contra un oponente aleatorio</p>
          <button className="btn btn-primary btn-lg">Buscar Partida</button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <FaUser className="text-6xl text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Jugar con Amigo</h2>
          <p className="text-gray-600 mb-6">Crea una sala privada para jugar</p>
          <button className="btn btn-success btn-lg">Crear Sala</button>
        </div>
      </div>
    </div>
  );
}
