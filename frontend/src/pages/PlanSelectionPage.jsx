// Plik: frontend/src/pages/PlanSelectionPage.jsx
import { useState } from 'react';
import { useAuth } from '../AuthContext';
import * as api from '../apiService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PlanCard = ({ name, limit, onSelect, code, isLoading, isPopular = false }) => {
    const cardClasses = isPopular 
        ? 'bg-blue-600 text-white border-blue-700 transform scale-105' 
        : 'bg-white text-slate-800 border-slate-200';
    
    const buttonClasses = isPopular
        ? 'bg-white text-blue-600 hover:bg-slate-100'
        : 'bg-blue-600 text-white hover:bg-blue-700';

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            variants={cardVariants}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
            className={`relative border-2 rounded-lg p-8 text-center flex flex-col shadow-lg transition-transform duration-300 ${cardClasses}`}
        >
            {isPopular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Najpopularniejszy
                </div>
            )}
            <h2 className="text-xl font-bold uppercase tracking-wide">{name}</h2>
            <div className="my-6">
                <span className={`text-5xl font-bold ${isPopular ? 'text-white' : 'text-slate-900'}`}>{limit}</span>
                <p className={`text-sm mt-1 ${isPopular ? 'text-blue-200' : 'text-slate-500'}`}>
                    aktywnych rezerwacji
                </p>
            </div>
            <p className={`flex-grow mb-8 text-sm ${isPopular ? 'text-blue-100' : 'text-slate-600'}`}>
                Idealny dla parkingów o {name.split(' ')[0].toLowerCase()}m natężeniu ruchu.
            </p>
            <button 
                onClick={() => onSelect(code)}
                disabled={isLoading}
                className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 ${buttonClasses}`}
            >
                Wybierz plan
            </button>
        </motion.div>
    );
};


function PlanSelectionPage() {
    const { fetchUserProfile } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectPlan = async (planCode) => {
        setIsLoading(true);
        try {
            await api.setUserPlan(planCode);
            await fetchUserProfile();
            toast.success('Plan został wybrany!');
            navigate('/');
        } catch (error) {
            toast.error('Nie udało się wybrać planu.');
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-5xl p-8 md:p-12 space-y-4 bg-white rounded-xl shadow-2xl"
            >
                <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800">Wybierz swój plan</h1>
                <p className="text-center text-slate-600 max-w-2xl mx-auto">
                    Aby rozpocząć, wybierz pakiet, który najlepiej pasuje do wielkości Twojego parkingu. W każdej chwili możesz go zmienić.
                </p>
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8"
                >
                    <PlanCard name="MAŁY PARKING" limit="do 50" onSelect={handleSelectPlan} code="small" isLoading={isLoading} />
                    <PlanCard name="ŚREDNI PARKING" limit="do 100" onSelect={handleSelectPlan} code="medium" isLoading={isLoading} />
                    <PlanCard name="DUŻY PARKING" limit="do 500" onSelect={handleSelectPlan} code="large" isLoading={isLoading} isPopular={true} />
                </motion.div>
            </motion.div>
        </div>
    );
}

export default PlanSelectionPage;
