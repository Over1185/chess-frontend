import { useState, useEffect } from "react";
import { FaPuzzlePiece, FaArrowLeft, FaCalendarAlt, FaStar, FaCrown, FaFire } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function PuzzlesView() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch("http://localhost:8000/puzzles/categories");
            const data = await response.json();
            setCategories(data.categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (categoryId) => {
        switch (categoryId) {
            case "daily":
                return <FaCalendarAlt className="text-4xl text-blue-500" />;
            case "easiest":
                return <FaStar className="text-4xl text-green-500" />;
            case "normal":
                return <FaFire className="text-4xl text-orange-500" />;
            case "hardest":
                return <FaCrown className="text-4xl text-red-500" />;
            default:
                return <FaPuzzlePiece className="text-4xl text-purple-500" />;
        }
    };

    const getCategoryColor = (categoryId) => {
        switch (categoryId) {
            case "daily":
                return "from-blue-400 to-blue-600";
            case "easiest":
                return "from-green-400 to-green-600";
            case "normal":
                return "from-orange-400 to-orange-600";
            case "hardest":
                return "from-red-400 to-red-600";
            default:
                return "from-purple-400 to-purple-600";
        }
    };

    const handleCategorySelect = (category) => {
        // Por ahora solo mostramos un mensaje, luego implementaremos la navegación
        alert(`Seleccionaste: ${category.name}\n\nPróximamente disponible con interfaz completa de puzzles.`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <FaPuzzlePiece className="text-6xl text-purple-600 animate-pulse mx-auto mb-4" />
                    <p className="text-xl text-gray-600">Cargando puzzles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
                    >
                        <FaArrowLeft className="text-lg" />
                        <span className="font-medium">Volver al inicio</span>
                    </button>

                    <h1 className="text-4xl font-bold text-gray-800 flex items-center space-x-3">
                        <FaPuzzlePiece className="text-purple-600" />
                        <span>Puzzles de Ajedrez</span>
                    </h1>

                    <div></div> {/* Spacer */}
                </div>

                {/* Categorías de puzzles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            onClick={() => handleCategorySelect(category)}
                            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                        >
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                {/* Header con gradiente */}
                                <div className={`bg-gradient-to-r ${getCategoryColor(category.id)} p-6 text-center`}>
                                    <div className="bg-white rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 shadow-lg">
                                        {getCategoryIcon(category.id)}
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{category.name}</h3>
                                </div>

                                {/* Contenido */}
                                <div className="p-6">
                                    <p className="text-gray-600 text-center mb-4">
                                        {category.description}
                                    </p>

                                    <div className="text-center">
                                        <button className={`bg-gradient-to-r ${getCategoryColor(category.id)} text-white px-6 py-3 rounded-full font-semibold transform transition-all duration-200 group-hover:scale-105 shadow-lg`}>
                                            Empezar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Información adicional */}
                <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        ¿Cómo funcionan los puzzles?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                                <FaCalendarAlt className="text-2xl text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">Puzzle Diario</h3>
                            <p className="text-sm text-gray-600">Un nuevo puzzle cada día para mantener tu mente activa</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-green-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                                <FaStar className="text-2xl text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">Principiante</h3>
                            <p className="text-sm text-gray-600">Puzzles fáciles para empezar y ganar confianza</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-orange-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                                <FaFire className="text-2xl text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">Intermedio</h3>
                            <p className="text-sm text-gray-600">Desafíos moderados para mejorar tu táctica</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-red-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                                <FaCrown className="text-2xl text-red-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">Avanzado</h3>
                            <p className="text-sm text-gray-600">Puzzles complejos para jugadores expertos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
