import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className=" min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-blue-800 mb-10">
        Welcome to Kantipur Infotech
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
        <div
          onClick={() => navigate("/quotation/all-quotations")}
          className="cursor-pointer bg-white rounded-lg shadow-md p-10 text-center border-2 border-blue-500 hover:bg-blue-100 transition"
        >
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            Quotation
          </h2>
          <p className="text-gray-600">Generate, view, and print quotations.</p>
        </div>

        <div
          onClick={() => navigate("/allinvoice")}
          className="cursor-pointer bg-white rounded-lg shadow-md p-10 text-center border-2 border-green-500 hover:bg-green-100 transition"
        >
          <h2 className="text-2xl font-semibold text-green-700 mb-4">
            Invoice
          </h2>
          <p className="text-gray-600">Create, manage, and print invoices.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
