// import React from 'react'
// import { assets } from '../assets/assets'

// const Contact = () => {
//   return (
//     <div>

//       <div className='text-center text-2xl pt-10 text-gray-500'>
//         <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>
//       </div>
//       <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
//         <img className='w-full md:max-w-[360px]' src={assets.contact_image} alt=''/>

//         <div className='flex flex-col justify-center items-start gap-6'>
//           <p className='font-semibold text-lg text-gray-600 '>OUR OFFICE</p>
//           <p className='text-gray-500'>00000 Willms Station <br/>Suite 000, Washington, USA</p>
//           <p className='text-gray-500'>Tel: (000) 000-0000 <br />Email: greatstackdev@gmail.com</p>
//           <p className='font-semibold text-lg text-gray-600'>CAREERS AT PRESCRIPTO</p>
//           <p className='text-gray-500'>Learn more about our teams and job openings.</p>
//           <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Explore Jobs</button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Contact

import React from "react";
import { assets } from "../assets/assets";

const ContactInfo = ({ title, children }) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-lg text-gray-600">{title}</p>
      <div className="text-gray-500 text-sm">{children}</div>
    </div>
  );
};

const Contact = () => {
  return (
    <div className="px-4 sm:px-8 md:px-10">

      {/* Heading */}

      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          CONTACT <span className="text-gray-700 font-semibold">US</span>
        </p>
      </div>

      {/* Content */}

      <div className="my-10 flex flex-col md:flex-row items-center md:items-start gap-10 mb-20 text-sm">

        {/* Image */}

        <img
          className="w-full max-w-[320px] md:max-w-[360px] rounded-lg"
          src={assets.contact_image}
          alt="Contact Prescripto"
          loading="lazy"
        />

        {/* Info Section */}

        <div className="flex flex-col justify-center items-start gap-6 text-center md:text-left">

          <ContactInfo title="OUR OFFICE">
            <p>
              00000 Willms Station <br />
              Suite 000, Washington, USA
            </p>
          </ContactInfo>

          <ContactInfo title="CONTACT DETAILS">
            <p>
              Tel: (000) 000-0000 <br />
              Email: greatstackdev@gmail.com
            </p>
          </ContactInfo>

          <ContactInfo title="CAREERS AT PRESCRIPTO">
            <p>Learn more about our teams and job openings.</p>
          </ContactInfo>

          <button className="border border-black px-8 py-3 text-sm rounded-md hover:bg-black hover:text-white transition-all duration-300">
            Explore Jobs
          </button>

        </div>

      </div>

    </div>
  );
};

export default React.memo(Contact);