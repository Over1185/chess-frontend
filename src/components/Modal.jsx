// src/components/Modal.jsx
import { FaTimes, FaCheck, FaExclamationTriangle, FaInfo } from 'react-icons/fa';

export default function Modal({
    isOpen,
    onClose,
    title,
    message,
    type = 'info', // 'info', 'warning', 'error', 'success', 'confirm'
    onConfirm,
    onCancel,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
}) {
    if (!isOpen) return null;

    const typeStyles = {
        info: {
            bg: 'bg-blue-500',
            icon: FaInfo,
            borderColor: 'border-blue-200'
        },
        warning: {
            bg: 'bg-yellow-500',
            icon: FaExclamationTriangle,
            borderColor: 'border-yellow-200'
        },
        error: {
            bg: 'bg-red-500',
            icon: FaExclamationTriangle,
            borderColor: 'border-red-200'
        },
        success: {
            bg: 'bg-green-500',
            icon: FaCheck,
            borderColor: 'border-green-200'
        },
        confirm: {
            bg: 'bg-indigo-500',
            icon: FaExclamationTriangle,
            borderColor: 'border-indigo-200'
        }
    };

    const currentStyle = typeStyles[type];
    const IconComponent = currentStyle.icon;

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        if (onClose) {
            onClose();
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else if (onClose) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border-2 ${currentStyle.borderColor} overflow-hidden`}>
                {/* Header */}
                <div className={`${currentStyle.bg} text-white p-6 flex items-center justify-between`}>
                    <div className="flex items-center space-x-3">
                        <IconComponent className="text-2xl" />
                        <h2 className="text-xl font-bold">{title}</h2>
                    </div>
                    {!onConfirm && (
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-700 text-lg leading-relaxed">{message}</p>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex justify-end space-x-3">
                    {onConfirm ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`px-6 py-2 ${currentStyle.bg} hover:opacity-90 text-white rounded-lg font-semibold transition-colors`}
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className={`px-6 py-2 ${currentStyle.bg} hover:opacity-90 text-white rounded-lg font-semibold transition-colors`}
                        >
                            Cerrar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
