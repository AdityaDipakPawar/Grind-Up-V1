import '../styles/index.css';

const PlacementSection = () => {
   return (
      <section
        id="placements"
        className="px-8 md:px-20 py-16 bg-orange-50 text-center"
      >
        <h2 className="text-3xl font-bold mb-6">Placements That Speak</h2>
        <p className="max-w-2xl mx-auto text-gray-700 mb-10">
          Trusted by top recruiters and colleges — hundreds of students placed
          in leading organizations through GrindUp.
        </p>
        <div className="flex flex-wrap justify-center gap-10">
          {["Google", "TCS", "Infosys", "Amazon", "Accenture"].map((logo) => (
            <div
              key={logo}
              className="px-6 py-4 bg-white rounded-xl shadow-sm border border-orange-600 text-lg 
              font-semibold text-gray-700 hover:shadow-md hover:bg-orange-200 transition"
            >
              {logo}
            </div>
          ))}
        </div>
      </section>
   );
}

export default PlacementSection;