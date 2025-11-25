import "../styles/index.css";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 text-center">
      <p>© {new Date().getFullYear()} GrindUp. All rights reserved.</p>
    </footer>
  );
}

export default Footer;