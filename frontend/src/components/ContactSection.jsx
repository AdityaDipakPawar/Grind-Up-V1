import '../styles/index.css';

const ContactSection = () => {

   const contactSocials = [
      {id:1, iconUrl: "/linkedin.svg", label: "LinkedIn", link:"https://www.linkedin.com/company/grindupco"},
      {id:2, iconUrl: "/twitter.svg", label: "Twitter", link:""},
      {id:3, iconUrl: "/instagram.svg", label: "Instagram", link:""},
   ]

   return (
      <section id="contact" className="px-8 md:px-20 py-16">
         <h2 className="text-3xl font-bold text-center mb-10">Get in Touch</h2>

         <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Form */}
            <form className="bg-white p-8 border border-gray-200 rounded-xl shadow-md space-y-6">
               <div>
               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
               </label>
               <input
                  id="name"
                  type="text"
                  className="w-full border border-orange-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="John Doe"
                  required
               />
               </div>
               <div>
               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
               </label>
               <input
                  id="email"
                  type="email"
                  className="w-full border border-orange-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="you@example.com"
                  required
               />
               </div>
               <div>
               <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
               </label>
               <textarea
                  id="message"
                  rows={4}
                  className="w-full border border-orange-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Write your query here..."
                  required
               ></textarea>
               </div>
               <button
               type="submit"
               className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-semibold transition"
               >
               Send Message
               </button>
            </form>

            {/* Contact Info / Socials */}
            <div className="flex flex-col justify-center space-y-6">
               <p className="text-gray-700 text-lg leading-relaxed">
               Have a question, feedback, or partnership idea?  
               Reach out to us — we’d love to hear from you!
               </p>
               <div>
               <h3 className="font-semibold text-gray-900 mb-2">Connect with us:</h3>
               <ul className="mt-5 w-full flex-col md:flex space-y-2 text-orange-700">
                  {
                     contactSocials.map((contactSocial) => (
                        <a 
                           href={contactSocial.link} 
                           key={contactSocial.id}
                           className="flex items-center w-35 gap-5 px-3 py-2 rounded 
                           bg-orange-100 hover:bg-orange-300 hover:ring-1 hover:ring-orange-600"
                        >
                           <img src={contactSocial.iconUrl} alt={contactSocial.label} width={20} height={20}/>
                           <p>{contactSocial.label}</p>
                        </a>
                     )) 
                  }
               </ul>
               </div>
            </div>
         </div>
      </section>
   );
}

export default ContactSection;