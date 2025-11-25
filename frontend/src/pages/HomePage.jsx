import "../styles/index.css";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import AboutSection from "../components/AboutSection.jsx";
import PlacementSection from "../components/PlacementSection.jsx";
import ContactSection from "../components/ContactSection.jsx";
import Footer from "../components/Footer.jsx";

const HomePage = () => {
  return (
    <main className="flex flex-col w-full min-h-screen overflow-x-hidden scroll-smooth">
      <Navbar />

      {/* 🏠 Hero Section */}
      <section
        id="/"
        className="flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-20 bg-linear-to-r from-orange-50 to-orange-100"
      >
        <div className="flex flex-col gap-5 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Connecting <span className="text-orange-600">Colleges & Companies</span> for Smarter Placements
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">
            GrindUp helps colleges and companies collaborate effortlessly - streamlining the hiring process and unlocking better opportunities.
          </p>
          <div className="flex gap-4">
            <Link
              to="/register"
              className="primary-btn"
            >
              Get Started
            </Link>
            <Link
              to="/#about"
              className="secondary-btn"
            >
              Learn More
            </Link>
          </div>
        </div>

        <img
          src="/landing_hero.png"
          alt="Students and recruiters connecting"
          width={200} height={200}
          className="w-full md:w-[600px] mt-10 md:mt-0"
        />
      </section>

      <AboutSection/>

      <PlacementSection/>

      <ContactSection/>

      <Footer/>

    </main>
  );
};

export default HomePage;
