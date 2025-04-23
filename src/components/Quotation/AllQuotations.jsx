import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AllQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/quotations/`
        );
        console.log("API response for quotations:", response.data);

        // Flexible response parsing
        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data.quotations)
          ? response.data.quotations
          : [];

        console.log("Final quotations used:", data);
        setQuotations(data);
      } catch (err) {
        console.error("Failed to load quotations", err);
        setQuotations([]);
      }
    };

    fetchQuotations();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">All Quotations</h1>
        <button
          onClick={() => navigate("/quotation")}
          className="bg-[#034cc6] text-white hover:bg-blue-600 px-4 py-2 rounded shadow-sm text-sm font-medium"
        >
          Create Quotation Form
        </button>
      </div>

      <div className="overflow-x-auto">
        {!Array.isArray(quotations) ? (
          <p className="text-red-600">
            Error: Quotations data is not in array format.
          </p>
        ) : quotations.length === 0 ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <table className="min-w-full table-auto text-sm border shadow rounded bg-white">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-2 border">S.N.</th>
                <th className="p-2 border">Quotation ID</th>
                <th className="p-2 border">Quotation #</th>
                <th className="p-2 border">Client Name</th>
                <th className="p-2 border">Client ID</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border text-right">Total (Rs)</th>
                <th className="p-2 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q, index) => {
                const total = q.items?.reduce((sum, item) => {
                  const price = parseFloat(item.price || item.cost || "0");
                  return sum + (isNaN(price) ? 0 : price);
                }, 0);

                return (
                  <tr key={q.id} className="border-t hover:bg-gray-50">
                    <td className="p-2 border text-center">{index + 1}</td>
                    <td className="p-2 border text-center">{q.id}</td>
                    <td className="p-2 border text-center">
                      {q.quotation_number || "-"}
                    </td>
                    <td className="p-2 border">{q.client_name || "N/A"}</td>
                    <td className="p-2 border text-center">
                      {q.client ?? "-"}
                    </td>
                    <td className="p-2 border text-center">
                      {q.date
                        ? new Date(q.date).toLocaleDateString()
                        : new Date(q.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2 border text-right">
                      Rs{" "}
                      {parseFloat(
                        q.total_amount || total || 0
                      ).toLocaleString()}
                    </td>
                    <td className="p-2 border text-center">
                      <Link
                        to={`/quotation/${q.id}`}
                        className="text-blue-600 hover:bg-blue-500 hover:text-white bg-blue-50 px-2 py-1 rounded"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllQuotations;
