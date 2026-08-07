import React from "react";
import { assets } from "../assets/assets";
import { Button } from "@/components/ui/button";

const ContactInfo = ({ title, children }) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-lg text-text-primary">{title}</p>
      <div className="text-text-muted text-sm">{children}</div>
    </div>
  );
};

const Contact = () => {
  return (
    <div className="py-8 animate-fade-in">

      {/* Heading */}
      <div className="text-center mb-10">
        <span className="section-tag">Get In Touch</span>
        <h1 className="section-title">Contact Us</h1>
      </div>

      {/* Content */}
      <div className="profile-section flex flex-col md:flex-row items-center md:items-start gap-10 p-8 text-sm">

        {/* Image */}
        <img
          className="w-full max-w-[320px] md:max-w-[360px] rounded-2xl"
          src={assets.contact_image}
          alt="Contact CuraLink"
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

          <ContactInfo title="CAREERS AT CuraLink">
            <p>Learn more about our teams and job openings.</p>
          </ContactInfo>

          <Button variant="brand-outline">
            Explore Jobs
          </Button>

        </div>

      </div>

    </div>
  );
};

export default React.memo(Contact);
