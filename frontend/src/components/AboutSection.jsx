import '../styles/index.css';

const AboutSection = () => {
   return (
      <section id="about" className="px-8 md:px-20 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-10">
          About GrindUp
        </h2>
        <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-12">
          GrindUp exists to bridge the gap between colleges and companies — transforming placement processes
          from reactive to proactive. We help colleges showcase their talent, and companies access it
          quickly and efficiently. Our platform automates job postings, student applications, and analytics —
          so you spend less time coordinating and more time rewarding outcomes.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border border-orange-600 rounded-xl shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">Seamless Collaboration</h3>
            <p className="text-gray-600">Connect with verified colleges and companies in one unified ecosystem — no delays, no miscommunications.</p>
          </div>
          <div className="p-6 border border-orange-600 rounded-xl shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">Smart Placement Intelligence</h3>
            <p className="text-gray-600">Use data-driven insights to understand trends, performance and opportunities — turning placement into a strategic advantage.</p>
          </div>
          <div className="p-6 border border-orange-600 rounded-xl shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">Effortless Process</h3>
            <p className="text-gray-600">Post jobs, manage applications, track results — all through a single platform built for scaling placements.</p>
          </div>
        </div>
      </section>
   );
}

export default AboutSection;