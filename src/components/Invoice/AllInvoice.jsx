import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AllInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const URL = `${process.env.REACT_APP_API_URL}/invoices/`;
    axios
      .get(URL)
      .then((res) => {
        console.log("Full API response for invoices:", res.data);

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data.invoices)
          ? res.data.invoices
          : [];

        console.log("Final invoice list being set:", data);
        setInvoices(data);
      })
      .catch((err) => {
        console.error("Failed to fetch invoices", err);
        setInvoices([]);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">All Invoices</h1>
        <button
          onClick={() => navigate("/invoice")}
          className="bg-[#034cc6] text-white hover:bg-blue-600 px-4 py-2 rounded shadow-sm text-sm font-medium"
        >
          Create Invoice Form
        </button>
      </div>

      <div className="overflow-x-auto">
        {Array.isArray(invoices) && invoices.length === 0 ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <table className="min-w-full border text-sm">
            <thead className="bg-blue-100 text-left">
              <tr>
                <th className="p-2 border">S.N.</th>
                <th className="p-2 border">Invoice Number</th>
                <th className="p-2 border">Client Name</th>
                <th className="p-2 border">Total (Rs)</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(invoices) &&
                invoices.map((invoice, index) => (
                  <tr key={invoice.id} className="border-t hover:bg-gray-50">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">{invoice.invoice_number}</td>
                    <td className="p-2 border">{invoice.client_name}</td>
                    <td className="p-2 border">
                      Rs{" "}
                      {parseFloat(invoice.total_amount || 0).toLocaleString()}
                    </td>
                    <td className="p-2 border">
                      {invoice.created_at
                        ? new Date(invoice.created_at).toLocaleDateString(
                            "en-GB"
                          )
                        : "--"}
                    </td>
                    <td className="p-2 border text-center">
                      <Link
                        to={`/invoices/${invoice.id}`}
                        className="text-blue-600 hover:bg-blue-500 hover:text-white bg-blue-50 px-2 py-1 rounded"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllInvoice;
