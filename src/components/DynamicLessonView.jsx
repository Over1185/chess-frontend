import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlay, FaCheckCircle, FaTimes, FaBookOpen, FaQuestionCircle, FaSpinner } from "react-icons/fa";
import { authFetch } from "../utils/auth";

export default function DynamicLessonView({ user }) {
    const { lessonId } = useParams();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSection, setCurrentSection] = useState("theory");
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [quizResults, setQuizResults] = useState(null);
    const [completingLesson, setCompletingLesson] = useState(false);

    // Cargar datos de la lección desde el backend
    useEffect(() => {
        const loadLesson = async () => {
            try {
                setLoading(true);

                // Primero intentar cargar la lección directamente por ID
                let lessonData = null;
                try {
                    const leccionResponse = await authFetch(`/lecciones/${lessonId}`);
                    if (leccionResponse.ok) {
                        lessonData = await leccionResponse.json();
                    }
                } catch (error) {
                    console.log("Lección no encontrada por ID, buscando en lista completa");
                }

                // Si no se encontró por ID, buscar en la lista completa (lecciones antiguas)
                if (!lessonData) {
                    const leccionesResponse = await authFetch(`/lecciones`);
                    if (leccionesResponse.ok) {
                        const leccionesData = await leccionesResponse.json();
                        const lecciones = leccionesData.lecciones || [];

                        // Buscar la lección específica por ID o por número de orden
                        lessonData = lecciones.find(l =>
                            l.id === parseInt(lessonId) ||
                            l._id === lessonId ||
                            l.orden === parseInt(lessonId)
                        );
                    }
                }

                if (lessonData) {
                    setLesson(lessonData);

                    // Cargar progreso del usuario
                    const progresoResponse = await authFetch(`/progreso-lecciones`);
                    if (progresoResponse.ok) {
                        const progresoData = await progresoResponse.json();
                        const progreso = progresoData.progreso_lecciones || [];

                        // Verificar si esta lección ya está completada
                        const leccionCompletada = progreso.find(p =>
                            p.leccion_id === lessonId ||
                            p.leccion_id === lessonData.id?.toString() ||
                            p.leccion_id === lessonData._id
                        );

                        if (leccionCompletada && leccionCompletada.completada) {
                            setQuizCompleted(true);
                            setQuizResults({
                                score: leccionCompletada.puntuacion || 100,
                                passed: true,
                                correctAnswers: lessonData.quiz?.length || 0,
                                totalQuestions: lessonData.quiz?.length || 0
                            });
                        }
                    }
                } else {
                    setError("Lección no encontrada");
                }
            } catch (err) {
                console.error("Error loading lesson:", err);
                setError("Error de conexión");
            } finally {
                setLoading(false);
            }
        };

        if (lessonId) {
            loadLesson();
        }
    }, [lessonId]);

    // Función para manejar respuestas del quiz
    const handleQuizAnswer = (questionId, selectedOption) => {
        setQuizAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    // Función para enviar el quiz
    const submitQuiz = async () => {
        if (!lesson.quiz || lesson.quiz.length === 0) return;

        let correctAnswers = 0;
        const results = {};

        lesson.quiz.forEach((question, index) => {
            const questionId = question.id || index;
            const userAnswer = quizAnswers[questionId];
            const correctAnswer = question.respuesta_correcta || question.correctAnswer;
            const isCorrect = userAnswer === correctAnswer;

            results[questionId] = {
                userAnswer,
                correctAnswer,
                isCorrect
            };

            if (isCorrect) correctAnswers++;
        });

        const score = (correctAnswers / lesson.quiz.length) * 100;
        const passed = score >= 70;

        setQuizResults({
            score,
            passed,
            correctAnswers,
            totalQuestions: lesson.quiz.length,
            details: results
        });

        setQuizCompleted(true);

        // Si aprueba, marcar lección como completada en el backend
        if (passed) {
            await completeLesson(score);
        }
    };

    // Función para completar la lección
    const completeLesson = async (score = 100) => {
        if (!user) return;

        try {
            setCompletingLesson(true);
            const response = await authFetch("/lecciones/completar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    leccion_id: lesson.id || lesson._id,
                    puntuacion: Math.round(score)
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Lección completada exitosamente:", result);

                // Recargar la página para refrescar el progreso
                window.location.reload();
            } else {
                const errorData = await response.json();
                console.error("Error al completar lección:", errorData);
            }
        } catch (error) {
            console.error("Error completing lesson:", error);


        } finally {
            setCompletingLesson(false);
        }
    };    // Verificar si todas las preguntas están respondidas
    const allQuestionsAnswered = lesson?.quiz && lesson.quiz.every(
        (question, index) => {
            const questionId = question.id || index;
            return quizAnswers[questionId] !== undefined;
        }
    );

    // Estados de carga y error
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando lección...</p>
                </div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaTimes className="text-4xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error || "Lección no encontrada"}</p>
                    <button
                        onClick={() => navigate("/learn")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Volver a Lecciones
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate("/learn")}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <FaArrowLeft />
                            <span>Volver a Lecciones</span>
                        </button>

                        <div className="text-sm text-gray-600">
                            Lección {lesson.orden || lesson.order || lesson.id}
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {lesson.titulo || lesson.title}
                    </h1>

                    <p className="text-gray-600">
                        {lesson.descripcion || lesson.description}
                    </p>
                </div>

                {/* Navegación de secciones */}
                <div className="bg-white rounded-lg shadow-lg mb-6">
                    <div className="flex border-b">
                        <button
                            onClick={() => setCurrentSection("theory")}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${currentSection === "theory"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <FaBookOpen className="inline mr-2" />
                            Teoría
                        </button>

                        <button
                            onClick={() => setCurrentSection("quiz")}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${currentSection === "quiz"
                                ? "bg-blue-600 text-white"
                                : quizCompleted
                                    ? "text-green-600 hover:bg-green-50"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <FaQuestionCircle className="inline mr-2" />
                            Quiz
                            {quizCompleted && <FaCheckCircle className="inline ml-2 text-green-500" />}
                        </button>
                    </div>

                    {/* Contenido de la sección actual */}
                    <div className="p-6">
                        {currentSection === "theory" && (
                            <div className="space-y-6">
                                {/* Video (si existe) */}
                                {lesson.videoUrl && (
                                    <div className="bg-gray-100 rounded-lg p-6 text-center">
                                        <FaPlay className="text-4xl text-blue-600 mx-auto mb-4" />
                                        <p className="text-gray-600 mb-4">Video de la lección</p>
                                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            Reproducir Video
                                        </button>
                                    </div>
                                )}

                                {/* Contenido de teoría */}
                                <div className="prose prose-lg max-w-none">
                                    <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                                        {lesson.contenido || lesson.content || "Contenido de la lección no disponible."}
                                    </div>
                                </div>

                                {/* Botón para ir al quiz */}
                                <div className="text-center pt-6">
                                    <button
                                        onClick={() => setCurrentSection("quiz")}
                                        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        Ir al Quiz
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentSection === "quiz" && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        Quiz de la Lección
                                    </h3>
                                    <p className="text-gray-600">
                                        Responde correctamente al menos el 70% para completar la lección
                                    </p>
                                </div>

                                {!quizCompleted ? (
                                    <div className="space-y-6">
                                        {lesson.quiz && lesson.quiz.map((question, index) => {
                                            const questionId = question.id || index;
                                            const questionText = question.question || question.pregunta;
                                            const questionOptions = question.options || question.opciones;

                                            return (
                                                <div key={questionId} className="bg-gray-50 rounded-lg p-6">
                                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                                        {index + 1}. {questionText}
                                                    </h4>

                                                    <div className="space-y-3">
                                                        {questionOptions && questionOptions.map((option, optionIndex) => (
                                                            <label
                                                                key={optionIndex}
                                                                className="flex items-center space-x-3 cursor-pointer"
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`question-${questionId}`}
                                                                    value={optionIndex}
                                                                    onChange={() => handleQuizAnswer(questionId, optionIndex)}
                                                                    className="w-4 h-4 text-blue-600"
                                                                />
                                                                <span className="text-gray-700">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <div className="text-center">
                                            <button
                                                onClick={submitQuiz}
                                                disabled={!allQuestionsAnswered || completingLesson}
                                                className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto ${allQuestionsAnswered && !completingLesson
                                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    }`}
                                            >
                                                {completingLesson && <FaSpinner className="animate-spin" />}
                                                <span>{completingLesson ? "Procesando..." : "Enviar Respuestas"}</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${quizResults?.passed ? "bg-green-100" : "bg-red-100"
                                            }`}>
                                            {quizResults?.passed ? (
                                                <FaCheckCircle className="text-4xl text-green-600" />
                                            ) : (
                                                <FaTimes className="text-4xl text-red-600" />
                                            )}
                                        </div>

                                        <h3 className={`text-2xl font-bold mb-4 ${quizResults?.passed ? "text-green-800" : "text-red-800"
                                            }`}>
                                            {quizResults?.passed ? "¡Felicidades!" : "Intenta de nuevo"}
                                        </h3>

                                        {quizResults && (
                                            <p className="text-gray-600 mb-6">
                                                Obtuviste {quizResults.correctAnswers} de {quizResults.totalQuestions} respuestas correctas
                                                ({Math.round(quizResults.score)}%)
                                            </p>
                                        )}

                                        {quizResults?.passed ? (
                                            <div>
                                                <p className="text-green-600 font-medium mb-6">
                                                    Has completado exitosamente esta lección
                                                </p>
                                                <div className="space-x-4">
                                                    <button
                                                        onClick={() => {
                                                            const nextLessonId = parseInt(lessonId) + 1;
                                                            navigate(`/learn/${nextLessonId}`);
                                                        }}
                                                        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        Continuar a la Siguiente Lección
                                                    </button>
                                                    <button
                                                        onClick={() => navigate("/learn")}
                                                        className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                                    >
                                                        Volver a Lecciones
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setQuizCompleted(false);
                                                    setQuizAnswers({});
                                                    setQuizResults(null);
                                                }}
                                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Intentar de Nuevo
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
