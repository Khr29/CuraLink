import React from "react";
import { useParams } from "react-router-dom";

const HospitalDetails = () => {

    const { hospitalId } = useParams();

    return (
        <div className="py-10">

            <h1 className="text-4xl font-bold">
                Hospital Details
            </h1>

            <p className="mt-3 text-gray-500">
                Hospital ID:
            </p>

            <p className="font-semibold">
                {hospitalId}
            </p>

        </div>
    );
};

export default HospitalDetails;