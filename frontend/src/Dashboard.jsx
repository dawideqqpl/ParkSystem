// Plik: frontend/src/Dashboard.jsx

// Komponent pojedynczej karty ze statystyką
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
        {/* Prosty sposób na dodanie ikony SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function Dashboard({ reservations }) {
  const totalCars = reservations.length;

  const carsReturningToday = reservations.filter(res => {
    const returnDate = new Date(res.returnDate);
    const today = new Date();
    // Porównujemy tylko daty (rok, miesiąc, dzień), ignorując czas
    return returnDate.getFullYear() === today.getFullYear() &&
           returnDate.getMonth() === today.getMonth() &&
           returnDate.getDate() === today.getDate();
  }).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      <StatCard 
        title="Aut na parkingu" 
        value={totalCars} 
        icon="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" // Ikona parkingu
      />
      <StatCard 
        title="Powroty dzisiaj" 
        value={carsReturningToday} 
        icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" // Ikona zegara
      />
    </div>
  );
}

export default Dashboard;