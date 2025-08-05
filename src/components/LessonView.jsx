import { useState } from "react";
import { FaArrowLeft, FaPlay, FaCheckCircle, FaTimes, FaBookOpen, FaQuestionCircle } from "react-icons/fa";

export default function LessonView({ lesson, onBack, onComplete }) {
    const [currentSection, setCurrentSection] = useState("theory"); // "theory" o "quiz"
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [quizResults, setQuizResults] = useState(null);

    // Función para manejar respuestas del quiz
    const handleQuizAnswer = (questionId, selectedOption) => {
        setQuizAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    // Función para enviar el quiz
    const submitQuiz = () => {
        if (!lesson.quiz || lesson.quiz.length === 0) return;

        let correctAnswers = 0;
        const results = {};

        lesson.quiz.forEach(question => {
            const userAnswer = quizAnswers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;

            results[question.id] = {
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect
            };

            if (isCorrect) correctAnswers++;
        });

        const score = (correctAnswers / lesson.quiz.length) * 100;
        const passed = score >= 70; // 70% mínimo para aprobar

        setQuizResults({
            score,
            passed,
            correctAnswers,
            totalQuestions: lesson.quiz.length,
            details: results
        });

        setQuizCompleted(true);

        // Si aprueba, marcar lección como completada
        if (passed && onComplete) {
            onComplete(lesson.id);
        }
    };

    // Verificar si todas las preguntas están respondidas
    const allQuestionsAnswered = lesson.quiz && lesson.quiz.every(
        question => quizAnswers[question.id] !== undefined
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={onBack}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <FaArrowLeft />
                            <span>Volver a Lecciones</span>
                        </button>

                        <div className="text-sm text-gray-600">
                            Lección {lesson.order}
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {lesson.title}
                    </h1>

                    <p className="text-gray-600">
                        {lesson.description}
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
                            disabled={currentSection === "theory"} // Solo accesible después de leer teoría
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
                                    <div
                                        className="text-gray-800 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: lesson.content }}
                                    />
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
                                        {lesson.quiz && lesson.quiz.map((question, index) => (
                                            <div key={question.id} className="bg-gray-50 rounded-lg p-6">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                                    {index + 1}. {question.question}
                                                </h4>

                                                <div className="space-y-3">
                                                    {question.options.map((option, optionIndex) => (
                                                        <label
                                                            key={optionIndex}
                                                            className="flex items-center space-x-3 cursor-pointer"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question-${question.id}`}
                                                                value={optionIndex}
                                                                onChange={() => handleQuizAnswer(question.id, optionIndex)}
                                                                className="w-4 h-4 text-blue-600"
                                                            />
                                                            <span className="text-gray-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="text-center">
                                            <button
                                                onClick={submitQuiz}
                                                disabled={!allQuestionsAnswered}
                                                className={`px-8 py-3 rounded-lg font-medium transition-colors ${allQuestionsAnswered
                                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    }`}
                                            >
                                                Enviar Respuestas
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${quizResults.passed ? "bg-green-100" : "bg-red-100"
                                            }`}>
                                            {quizResults.passed ? (
                                                <FaCheckCircle className="text-4xl text-green-600" />
                                            ) : (
                                                <FaTimes className="text-4xl text-red-600" />
                                            )}
                                        </div>

                                        <h3 className={`text-2xl font-bold mb-4 ${quizResults.passed ? "text-green-800" : "text-red-800"
                                            }`}>
                                            {quizResults.passed ? "¡Felicidades!" : "Intenta de nuevo"}
                                        </h3>

                                        <p className="text-gray-600 mb-6">
                                            Obtuviste {quizResults.correctAnswers} de {quizResults.totalQuestions} respuestas correctas
                                            ({Math.round(quizResults.score)}%)
                                        </p>

                                        {quizResults.passed ? (
                                            <div>
                                                <p className="text-green-600 font-medium mb-6">
                                                    Has completado exitosamente esta lección
                                                </p>
                                                <button
                                                    onClick={onBack}
                                                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    Continuar a la Siguiente Lección
                                                </button>
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
