import { useState } from "react";

export default function RegisterView({ onRegister, onBack }) {
  const [userType, setUserType] = useState("student");

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Registrarse</h2>
        
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Tipo de Usuario</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="student">Estudiante</option>
              <option value="teacher">Profesor</option>
            </select>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button 
              onClick={() => onRegister(userType)}
              className={`btn flex-1 ${userType === 'teacher' ? 'btn-success' : 'btn-primary'}`}
            >
              Registrarse
            </button>
            <button 
              onClick={onBack}
              className="btn btn-outline flex-1"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
