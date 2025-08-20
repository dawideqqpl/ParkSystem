// Plik: frontend/src/App.jsx

import axios from 'axios'; // DODAJ TĘ LINIĘ

import { useState, useMemo, useEffect } from 'react';

import { useAuth } from './AuthContext';

import toast from 'react-hot-toast';

import * as api from './apiService';

import ReservationForm from './ReservationForm';

import ReservationList from './ReservationList';

import ConfirmModal from './ConfirmModal';

import ReservationPreview from './ReservationPreview';

import Dashboard from './Dashboard';

import FlightStatusModal from './FlightStatusModal';

import Spinner from './Spinner';

import NextPickup from './NextPickup';

import LastPickup from './LastPickup';

import DailyTimeline from './DailyTimeline';

import Navbar from './Navbar';

const PAGE_SIZE = 5;

function App() {

const { logoutUser, userProfile, fetchUserProfile, authTokens, isLoading: authLoading } = useAuth();

const [reservations, setReservations] = useState([]);

const [isLoading, setIsLoading] = useState(true);

const [activeTab, setActiveTab] = useState('today');

const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

const [isFormVisible, setIsFormVisible] = useState(false);

const [searchQuery, setSearchQuery] = useState('');

const [isModalOpen, setIsModalOpen] = useState(false);

const [reservationToDelete, setReservationToDelete] = useState(null);

const [editingReservation, setEditingReservation] = useState(null);

const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);

const [flightData, setFlightData] = useState(null);

const [isFlightLoading, setIsFlightLoading] = useState(false);

const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

const [reservationToComplete, setReservationToComplete] = useState(null);

useEffect(() => {

if (!authTokens?.access_token) {

setIsLoading(false);

return;

}

// FORCE SET HEADERS - natychmiastowa naprawa

axios.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access_token}`;

console.log('🔑 FORCED Authorization header set');

api.getReservations()

.then(response => {

console.log('✅ SUCCESS:', response.data.length, 'reservations');

setReservations(response.data);

})

.catch((error) => {

console.error('❌ Error:', error);

})

.finally(() => {

setIsLoading(false);

});

}, [authTokens]);

useEffect(() => {

setVisibleCount(PAGE_SIZE);

}, [activeTab]);

const activeReservations = useMemo(() => reservations.filter(r => !r.is_completed), [reservations]);

const completedReservations = useMemo(() => reservations.filter(r => r.is_completed), [reservations]);

const todaysPickups = useMemo(() => {

const today = new Date();

return activeReservations.filter(res => {

const returnDate = new Date(res.returnDate);

return returnDate.getFullYear() === today.getFullYear() &&

returnDate.getMonth() === today.getMonth() &&

returnDate.getDate() === today.getDate();

});

}, [activeReservations]);

const filteredReservations = useMemo(() => {

let listToProcess;

if (activeTab === 'today') listToProcess = todaysPickups;

else if (activeTab === 'all') listToProcess = activeReservations;

else listToProcess = completedReservations;

const query = searchQuery.toLowerCase().trim();

if (!query) return listToProcess;

return listToProcess.filter(res =>

res.licensePlate.toLowerCase().includes(query) ||

res.customerName.toLowerCase().includes(query)

);

}, [activeTab, searchQuery, todaysPickups, activeReservations, completedReservations]);

// POPRAWIONA funkcja grupowania wspólnych podróży
const processedReservations = useMemo(() => {

const sortedList = [...filteredReservations]

.sort((a, b) => new Date(a.returnDate) - new Date(b.returnDate));

const groupedList = [];

const processedIds = new Set();

sortedList.forEach(res => {

if (processedIds.has(res.id)) return;

// POPRAWKA: Jeśli brak numeru lotu, dodaj jako pojedynczą rezerwację
if (!res.flightNumber || res.flightNumber.trim() === '') {

groupedList.push({ ...res, isGroup: false });

processedIds.add(res.id);

return;

}

const resDate = new Date(res.returnDate);

// POPRAWKA: Znajdź grupę tylko dla rezerwacji z niepustym numerem lotu
const group = sortedList.filter(otherRes => {

if (processedIds.has(otherRes.id)) return false;

// POPRAWKA: Sprawdź czy druga rezerwacja też ma numer lotu
if (!otherRes.flightNumber || otherRes.flightNumber.trim() === '') {
    return false;
}

const otherDate = new Date(otherRes.returnDate);

const isSameDay = resDate.getFullYear() === otherDate.getFullYear() &&

resDate.getMonth() === otherDate.getMonth() &&

resDate.getDate() === otherDate.getDate();

// POPRAWKA: Porównaj numery lotów tylko jeśli oba są niepuste
return otherRes.flightNumber.trim() === res.flightNumber.trim() && isSameDay;

});

if (group.length > 1) {

groupedList.push({

isGroup: true,

flightNumber: res.flightNumber,

reservations: group,

id: `group-${res.flightNumber}-${resDate.toISOString().split('T')[0]}`

});

group.forEach(g => processedIds.add(g.id));

} else {

if (!processedIds.has(res.id)) {

groupedList.push({ ...res, isGroup: false });

processedIds.add(res.id);

}

}

});

const finalList = groupedList.sort((a, b) => {

const timeA = a.isGroup ? new Date(a.reservations[0].returnDate) : new Date(a.returnDate);

const timeB = b.isGroup ? new Date(b.reservations.returnDate) : new Date(b.returnDate);

return timeA - timeB;

});

if (activeTab === 'all' || activeTab === 'completed') {

return finalList.slice(0, visibleCount);

}

return finalList;

}, [filteredReservations, visibleCount, activeTab]);

const handleToggleCompleteRequest = (reservationId) => {

const reservation = reservations.find(r => r.id === reservationId);

if (reservation) {

setReservationToComplete(reservation);

setIsCompleteModalOpen(true);

}

};

// POPRAWKA: Zaktualizuj logikę grupowego oznaczania jako zakończone
const confirmToggleComplete = () => {

if (!reservationToComplete) return;

api.toggleReservationStatus(reservationToComplete.id)

.then(response => {

const updatedReservation = response.data;

const newStatus = updatedReservation.is_completed;

// POPRAWKA: Grupuj tylko rezerwacje z niepustym numerem lotu
if (updatedReservation.flightNumber && updatedReservation.flightNumber.trim() !== '') {
    const resDate = new Date(updatedReservation.returnDate);

    const groupToUpdate = reservations.filter(res => {

    const otherDate = new Date(res.returnDate);

    const isSameDay = resDate.getFullYear() === otherDate.getFullYear() &&

    resDate.getMonth() === otherDate.getMonth() &&

    resDate.getDate() === otherDate.getDate();

    return res.flightNumber && res.flightNumber.trim() === updatedReservation.flightNumber.trim() && isSameDay;

    });

    setReservations(current =>

    current.map(res => {

    if (groupToUpdate.some(groupRes => groupRes.id === res.id)) {

    return { ...res, is_completed: newStatus };

    }

    return res;

    })

    );
} else {
    // Jeśli brak numeru lotu, zaktualizuj tylko tę jedną rezerwację
    setReservations(current =>
        current.map(res => 
            res.id === updatedReservation.id ? { ...res, is_completed: newStatus } : res
        )
    );
}

toast.success('Zmieniono status rezerwacji!');

})

.catch(() => toast.error('Nie udało się zmienić statusu.'))

.finally(() => {

setIsCompleteModalOpen(false);

setReservationToComplete(null);

});

};

const handleLoadMore = () => {

setVisibleCount(prevCount => prevCount + PAGE_SIZE);

};

const hasMore = (activeTab === 'all' || activeTab === 'completed') &&

processedReservations.length < filteredReservations.length;

const handleShowFlightStatus = (reservationId) => {

setIsFlightModalOpen(true);

setIsFlightLoading(true);

setFlightData(null);

api.getFlightStatus(reservationId)

.then(response => setFlightData(response.data))

.catch(error => {

toast.error(error.response?.data?.message || 'Nie udało się pobrać statusu lotu.');

setIsFlightModalOpen(false);

})

.finally(() => setIsFlightLoading(false));

};

const handleAddReservation = (newReservationData) => {

toast.promise(

api.addReservation(newReservationData).then(response => {

setReservations(current => [response.data, ...current]);

setIsFormVisible(false);

fetchUserProfile();

}),

{

loading: 'Dodawanie...',

success: 'Dodano!',

error: (err) => err.response?.data?.detail || 'Błąd.'

}

);

};

const handleUpdateReservation = (updatedReservation) => {

toast.promise(

api.updateReservation(updatedReservation.id, updatedReservation).then(response => {

setReservations(current =>

current.map(res => res.id === updatedReservation.id ? response.data : res)

);

setIsFormVisible(false);

setEditingReservation(null);

}),

{

loading: 'Aktualizowanie...',

success: 'Zaktualizowano!',

error: 'Błąd.'

}

);

};

const confirmDelete = () => {

toast.promise(

api.deleteReservation(reservationToDelete).then(() => {

setReservations(current =>

current.filter(res => res.id !== reservationToDelete)

);

setIsModalOpen(false);

setReservationToDelete(null);

fetchUserProfile();

}),

{

loading: 'Usuwanie...',

success: 'Usunięto!',

error: 'Błąd.'

}

);

};

const handleEditRequest = (reservation) => {

setEditingReservation(reservation);

setIsFormVisible(true);

};

const handleAddRequest = () => {

if (userProfile && userProfile.usage >= userProfile.limit) {

toast.error(`Osiągnięto limit ${userProfile.limit} rezerwacji dla Twojego planu.`);

return;

}

setEditingReservation(null);

setIsFormVisible(true);

};

const handleCancelForm = () => {

setIsFormVisible(false);

setEditingReservation(null);

};

const handleDeleteRequest = (id) => {

setReservationToDelete(id);

setIsModalOpen(true);

};

const handleTogglePayment = (reservationId) => {

api.togglePaymentStatus(reservationId)

.then(response => {

const updatedReservation = response.data;

setReservations(current =>

current.map(res =>

res.id === reservationId ? updatedReservation : res

)

);

toast.success(`Status płatności ${updatedReservation.is_paid ? 'zapłacone' : 'niezapłacone'}!`);

})

.catch(() => toast.error('Nie udało się zmienić statusu płatności.'));

};

const isLimitReached = userProfile ? userProfile.usage >= userProfile.limit : false;

return (

<>

{/* NAVBAR NA GÓRZE */}

<Navbar

userProfile={userProfile}

logoutUser={logoutUser}

/>

<div className="bg-gray-100 min-h-screen">

{/* LOADING STATE */}

{(isLoading || authLoading) && (

<div className="flex justify-center items-center h-64">

<Spinner />

<span className="ml-2">Ładowanie...</span>

</div>

)}

{/* MAIN CONTENT - gdy dane załadowane */}

{!isLoading && !authLoading && userProfile && (

<div className="max-w-7xl mx-auto p-4">

{/* DASHBOARD */}

<Dashboard

activeReservations={activeReservations}

completedReservations={completedReservations}

todaysPickups={todaysPickups}

/>



{/* ADD BUTTON */}

<div className="text-center mb-6">
    <button
        onClick={handleAddRequest}
        disabled={isLimitReached}
        className={`
            px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200
            ${isLimitReached
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }
        `}
    >
        {isLimitReached ? 'Limit osiągnięty' : '+ Dodaj rezerwację'}
    </button>
    {isLimitReached && (
        <p className="text-red-600 text-sm mt-2">
            Osiągnięto limit {userProfile.limit} rezerwacji. Zaktualizuj plan aby dodać więcej.
        </p>
    )}
</div>

{/* SEARCH & TABS */}

<div className="mb-6">

<div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">

<input

type="text"

placeholder="Szukaj po numerze rejestracyjnym lub nazwisku..."

value={searchQuery}

onChange={(e) => setSearchQuery(e.target.value)}

className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

/>

</div>

<div className="flex flex-wrap justify-center gap-2">

{[

{ key: 'today', label: `Dzisiejsze (${todaysPickups.length})`, color: 'bg-green-600' },

{ key: 'all', label: `Wszystkie aktywne (${activeReservations.length})`, color: 'bg-blue-600' },

{ key: 'completed', label: `Zakończone (${completedReservations.length})`, color: 'bg-gray-600' }

].map(tab => (

<button

key={tab.key}

onClick={() => setActiveTab(tab.key)}

className={`

px-6 py-2 rounded-lg font-medium transition-all duration-200

${activeTab === tab.key

? `${tab.color} text-white shadow-lg`

: 'bg-gray-200 text-gray-700 hover:bg-gray-300'

}

`}

>

{tab.label}

</button>

))}

</div>

</div>

{/* RESERVATIONS LIST */}

<ReservationList

reservations={processedReservations}

onToggleComplete={handleToggleCompleteRequest}

onEdit={handleEditRequest}

onDelete={handleDeleteRequest}

onCheckFlight={handleShowFlightStatus}

onTogglePayment={handleTogglePayment}

/>

{/* LOAD MORE BUTTON */}

{hasMore && (

<div className="text-center mt-6">

<button

onClick={handleLoadMore}

className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"

>

Pokaż więcej

</button>

</div>

)}

</div>

)}

{/* MODALS */}

{isFormVisible && (

<ReservationForm

reservation={editingReservation}

onSubmit={editingReservation ? handleUpdateReservation : handleAddReservation}

onCancel={handleCancelForm}

userProfile={userProfile}

/>

)}

<ConfirmModal

isOpen={isModalOpen}

onClose={() => setIsModalOpen(false)}

onConfirm={confirmDelete}

title="Potwierdź usunięcie"

message="Czy na pewno chcesz usunąć tę rezerwację? Tej operacji nie można cofnąć."

/>

<ConfirmModal

isOpen={isCompleteModalOpen}

onClose={() => setIsCompleteModalOpen(false)}

onConfirm={confirmToggleComplete}

title="Potwierdź zmianę statusu"

message={

<div>

Czy na pewno chcesz oznaczyć poniższą rezerwację jako{' '}

<strong>

{reservationToComplete?.is_completed ? 'aktywną' : 'zakończoną'}

</strong>?

{reservationToComplete && (

<div className="mt-4 p-4 bg-gray-50 rounded-lg">

<ReservationPreview reservation={reservationToComplete} />

</div>

)}

</div>

}

/>

<FlightStatusModal

isOpen={isFlightModalOpen}

onClose={() => setIsFlightModalOpen(false)}

flightData={flightData}

isLoading={isFlightLoading}

/>

</div>

</>

);

}

export default App;
