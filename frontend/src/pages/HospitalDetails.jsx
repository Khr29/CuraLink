import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const HospitalDetails = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();

  const { backendUrl } = useContext(AppContext);

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const getHospital = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/hospital/${hospitalId}`
      );

      if (data.success) {
        setHospital(data.hospital);
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getHospital();
  }, [hospitalId]);

  if (!hospital) {
    return (
      <div className="flex justify-center items-center h-96">
        <h2 className="text-2xl font-semibold">Loading Hospital...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10">

      {/* Hospital Header */}

      <div className="grid md:grid-cols-2 gap-8">

        <img
          src={hospital.image}
          alt={hospital.name}
          className="w-full h-[380px] object-cover rounded-xl shadow"
        />

        <div>

          <h1 className="text-4xl font-bold">
            {hospital.name}
          </h1>

          <p className="text-gray-500 mt-3">
            {hospital.description}
          </p>

          <div className="mt-6 space-y-3">

            <p>
              <strong>⭐ Rating:</strong> {hospital.rating}
            </p>

            <p>
              <strong>🏥 Type:</strong> {hospital.hospitalType}
            </p>

            <p>
              <strong>🛏 Beds:</strong> {hospital.beds}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {hospital.active ? "🟢 Open" : "🔴 Closed"}
            </p>

            <p>
              <strong>Email:</strong> {hospital.email}
            </p>

            <p>
              <strong>Phone:</strong> {hospital.phone}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {hospital.address?.city},{" "}
              {hospital.address?.state}
            </p>

          </div>

        </div>

      </div>

      {/* Departments */}

      <div className="mt-12">

        <h2 className="text-2xl font-bold mb-4">
          Departments
        </h2>

        <div className="flex flex-wrap gap-3">

          {hospital.departments?.map((dept, index) => (

            <span
              key={index}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full"
            >
              {dept}
            </span>

          ))}

        </div>

      </div>

      {/* Facilities */}

      <div className="mt-12">

        <h2 className="text-2xl font-bold mb-4">
          Facilities
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          {hospital.facilities?.map((facility, index) => (

            <div
              key={index}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              {facility}
            </div>

          ))}

        </div>

      </div>

      {/* Doctors */}

      <div className="mt-12">

        <h2 className="text-2xl font-bold mb-6">
          Doctors
        </h2>

        {doctors.length === 0 ? (

          <p>No doctors found.</p>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {doctors.map((doctor) => (

              <div
                key={doctor._id}
                className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition"
              >

                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-56 object-cover"
                />

                <div className="p-4">

                  <h3 className="font-bold text-lg">
                    {doctor.name}
                  </h3>

                  <p className="text-gray-500">
                    {doctor.speciality}
                  </p>

                  <p className="mt-2">
                    {doctor.experience}
                  </p>

                  <p className="font-semibold mt-2">
                    ₹{doctor.fees}
                  </p>

                  <button
                    onClick={() =>
                      navigate(`/appointment/${doctor._id}`)
                    }
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Book Appointment
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

            {/* Gallery */}

      <div className="mt-12">

        <h2 className="text-2xl font-bold mb-6">
          Hospital Gallery
        </h2>

        {hospital.gallery?.length > 0 ? (

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {hospital.gallery.map((img, index) => (

              <img
                key={index}
                src={img}
                alt={`Hospital ${index}`}
                className="w-full h-44 object-cover rounded-lg shadow"
              />

            ))}

          </div>

        ) : (

          <p className="text-gray-500">
            No gallery images available.
          </p>

        )}

      </div>

      {/* Contact */}

      <div className="mt-12 border rounded-xl p-6 bg-white shadow">

        <h2 className="text-2xl font-bold mb-5">
          Contact Information
        </h2>

        <div className="space-y-3">

          <p>
            <strong>📧 Email:</strong> {hospital.email}
          </p>

          <p>
            <strong>📞 Phone:</strong> {hospital.phone}
          </p>

          <p>
            <strong>🌐 Website:</strong>{" "}
            {hospital.website || "Not Available"}
          </p>

          <p>
            <strong>📍 Address:</strong>{" "}
            {hospital.address?.street},{" "}
            {hospital.address?.city},{" "}
            {hospital.address?.state}
          </p>

        </div>

      </div>

      {/* Google Maps */}

      <div className="mt-12 border rounded-xl p-6 bg-white shadow">

        <h2 className="text-2xl font-bold mb-5">
          Location
        </h2>

        {hospital.location ? (

          <a
            href={`https://www.google.com/maps?q=${hospital.location.latitude},${hospital.location.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            📍 Open in Google Maps
          </a>

        ) : (

          <p>No location available.</p>

        )}

      </div>

      {/* Reviews */}

      <div className="mt-12 border rounded-xl p-6 bg-white shadow">

        <h2 className="text-2xl font-bold mb-5">
          Reviews
        </h2>

        <div className="text-center py-10">

          <h3 className="text-xl font-semibold">
            No Reviews Yet
          </h3>

          <p className="text-gray-500 mt-2">
            Users will be able to rate and review this hospital soon.
          </p>

        </div>

      </div>

    </div>
  );
};

export default HospitalDetails;