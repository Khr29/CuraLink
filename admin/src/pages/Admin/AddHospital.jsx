import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";

const AddHospital = () => {
  const [image, setImage] = useState(false);

const { backendUrl, aToken } = useContext(AdminContext);

const [hospitalData, setHospitalData] = useState({
  name: "",
  description: "",
  email: "",
  phone: "",
  website: "",
  hospitalType: "Private",
  openingHours: "24 Hours",
  beds: "",
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  },
  location: {
    latitude: "",
    longitude: "",
  },
  departments: [],
  facilities: [],
  active: true,
});

const submitHandler = async (e) => {
  e.preventDefault();

  try {
    console.log(hospitalData);

    toast.success("Hospital data is ready to submit!");

  } catch (error) {
    toast.error(error.message);
  }
};

  return (
    <form
        className="w-full p-6"
        onSubmit={submitHandler}
        >

      <p className="text-2xl font-semibold mb-6">
        Add Hospital
      </p>

      {/* Hospital Image */}
      <div className="mb-6">

        <p className="mb-2 font-medium">
          Hospital Image
        </p>

        <label htmlFor="hospital-img">
          <img
            src={image ? URL.createObjectURL(image) : assets.upload_area}
            alt=""
            className="w-32 h-32 object-cover border rounded-lg cursor-pointer"
          />
        </label>

        <input
          type="file"
          id="hospital-img"
          hidden
          onChange={(e) => setImage(e.target.files[0])}
        />

      </div>

      {/* Basic Information */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <p className="mb-2">Hospital Name</p>
         <input
            type="text"
            value={hospitalData.name}
            onChange={(e) =>
                setHospitalData({
                ...hospitalData,
                name: e.target.value,
                })
            }
            placeholder="Apollo Hospital"
            className="w-full border rounded-lg p-3"
            />
        </div>

        <div>
          <p className="mb-2">Hospital Type</p>
          <select
            value={hospitalData.hospitalType}
            onChange={(e) =>
                setHospitalData({
                ...hospitalData,
                hospitalType: e.target.value,
                })
            }
            className="w-full border rounded-lg p-3"
>
            <option>Private</option>
            <option>Government</option>
            <option>Multi-Speciality</option>
            <option>Clinic</option>
            <option>Diagnostic Centre</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Opening Hours</p>
          <input
            type="text"
            value={hospitalData.openingHours}
            onChange={(e) =>
                setHospitalData({
                ...hospitalData,
                openingHours: e.target.value,
                })
            }
            placeholder="24 Hours"
            className="w-full border rounded-lg p-3"
            />
        </div>

        <div>
          <p className="mb-2">Number of Beds</p>
         <input
            type="number"
            value={hospitalData.beds}
            onChange={(e) =>
                setHospitalData({
                ...hospitalData,
                beds: e.target.value,
                })
            }
            placeholder="250"
            className="w-full border rounded-lg p-3"
            />
        </div>

      </div>

      <div className="mt-5">

  <p className="mb-2">Description</p>

 <textarea
  rows="5"
  value={hospitalData.description}
  onChange={(e) =>
    setHospitalData({
      ...hospitalData,
      description: e.target.value,
    })
  }
  placeholder="Write about the hospital..."
  className="w-full border rounded-lg p-3 resize-none"
/>

</div>

{/* Contact Information */}

<div className="mt-8">

  <h2 className="text-xl font-semibold mb-4">
    Contact Information
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

    <div>
      <p className="mb-2">Email</p>
      <input
        type="email"
        placeholder="hospital@email.com"
        className="w-full border rounded-lg p-3"
      />
    </div>

    <div>
      <p className="mb-2">Phone</p>
      <input
        type="text"
        placeholder="+91 9876543210"
        className="w-full border rounded-lg p-3"
      />
    </div>

    <div>
      <p className="mb-2">Website</p>
      <input
        type="text"
        placeholder="https://hospital.com"
        className="w-full border rounded-lg p-3"
      />
    </div>

  </div>

</div>

{/* Address */}

<div className="mt-8">

  <h2 className="text-xl font-semibold mb-4">
    Address
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

    <div>
      <p className="mb-2">Address Line 1</p>
      <input
        type="text"
        placeholder="Street, Area..."
        className="w-full border rounded-lg p-3"
      />
    </div>

    <div>
      <p className="mb-2">Address Line 2</p>
      <input
        type="text"
        placeholder="Landmark (Optional)"
        className="w-full border rounded-lg p-3"
      />
    </div>

    <div>
      <p className="mb-2">City</p>
      <input
        type="text"
        placeholder="Bangalore"
        className="w-full border rounded-lg p-3"
      />
    </div>

    <div>
      <p className="mb-2">State</p>
      <input
        type="text"
        placeholder="Karnataka"
        className="w-full border rounded-lg p-3"
      />
    </div>

    <div>
      <p className="mb-2">Country</p>
      <input
        type="text"
        placeholder="India"
        className="w-full border rounded-lg p-3"
      />
    </div>

    <div>
      <p className="mb-2">Pincode</p>
      <input
        type="text"
        placeholder="560001"
        className="w-full border rounded-lg p-3"
      />
    </div>

  </div>

</div>

{/* Google Maps */}

<div className="mt-8">

  <h2 className="text-xl font-semibold mb-4">
    Google Maps Location
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

    <div>
      <p className="mb-2">Latitude</p>
      <input
        type="number"
        step="any"
        placeholder="12.9716"
        className="w-full border rounded-lg p-3"
      />
    </div>

    <div>
      <p className="mb-2">Longitude</p>
      <input
        type="number"
        step="any"
        placeholder="77.5946"
        className="w-full border rounded-lg p-3"
      />
    </div>

    <div>
      <p className="mb-2">Google Maps URL</p>
      <input
        type="text"
        placeholder="https://maps.google.com/..."
        className="w-full border rounded-lg p-3"
      />
    </div>

  </div>

</div>

{/* Departments */}

<div className="mt-8">

  <h2 className="text-xl font-semibold mb-4">
    Departments
  </h2>

  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Cardiology
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Neurology
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Orthopedics
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Pediatrics
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Oncology
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Dermatology
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      General Medicine
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      ENT
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Urology
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Ophthalmology
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Gastroenterology
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Pulmonology
    </label>

  </div>

</div>

{/* Facilities */}

<div className="mt-8">

  <h2 className="text-xl font-semibold mb-4">
    Facilities
  </h2>

  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      ICU
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Emergency
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      MRI
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      CT Scan
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      X-Ray
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Laboratory
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Pharmacy
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Blood Bank
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Ambulance
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Parking
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Wheelchair Access
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" />
      Cafeteria
    </label>

  </div>

</div>

{/* Gallery Images */}

<div className="mt-8">

  <h2 className="text-xl font-semibold mb-4">
    Gallery Images
  </h2>

  <input
    type="file"
    multiple
    className="w-full border rounded-lg p-3"
  />

  <p className="text-sm text-gray-500 mt-2">
    Upload multiple images of the hospital.
  </p>

</div>

{/* Hospital Status */}

<div className="mt-8">

  <h2 className="text-xl font-semibold mb-4">
    Hospital Status
  </h2>

  <label className="flex items-center gap-3">
    <input type="checkbox" defaultChecked />
    Active Hospital
  </label>

</div>

 <div className="mt-10 flex justify-end">

  <button
    type="submit"
    className="bg-primary text-white px-8 py-3 rounded-lg hover:opacity-90 transition"
  >
    Save Hospital
  </button>

</div>

    </form>
  );
};

export default AddHospital;