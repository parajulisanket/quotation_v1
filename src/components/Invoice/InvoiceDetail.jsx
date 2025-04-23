import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import logo from "../../assets/logo.png";
import axios from "axios";

const getLabelFromValue = (value) => {
  const unitOptions = [
    { label: "", value: "" },
    { label: "/m", value: "Monthly" },
    { label: "/q", value: "Quarterly" },
    { label: "/y", value: "Yearly" },
    { label: "/ot", value: "Onetime" },
    { label: "/item", value: "Peritem" },
    { label: "/post", value: "Perpost" },
    { label: "/design", value: "Perdesign" },
  ];
  const found = unitOptions.find((opt) => opt.value === value);
  return found ? found.label : value;
};

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const URL = `${process.env.REACT_APP_API_URL}/invoices/${id}`;
    axios
      .get(URL)
      .then((res) => setInvoice(res.data))
      .catch((err) => console.error("Failed to fetch invoice", err));
  }, [id]);

  const handleDownloadPDF = () => {
    const element = printRef.current;
    html2pdf()
      .from(element)
      .set({
        margin: 0.3,
        filename: `Invoice_${invoice?.invoice_number || "Preview"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .save();
  };

  if (!invoice) return <p className="text-center mt-20">Loading...</p>;

  const formattedDate = invoice.date
    ? new Date(invoice.date).toLocaleDateString("en-GB")
    : "DD/MM/YYYY";

  const unitLabel =
    invoice.items?.length > 0
      ? getLabelFromValue(invoice.items[0].duration)
      : "";

  return (
    <div className="max-w-7xl mx-auto p-4 text-[12px] leading-[1.4]">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate("/allinvoice")}
          className="bg-[#034cc6] text-white hover:bg-blue-600 px-4 py-1 text-sm rounded shadow-sm"
        >
          ← Back to All Invoice
        </button>
        <button
          onClick={handleDownloadPDF}
          className="bg-[#034cc6] text-white px-4 py-1 text-sm rounded hover:bg-blue-800"
        >
          Save as PDF
        </button>
      </div>

      <div
        className="w-full bg-white p-10 rounded shadow-md"
        ref={printRef}
        // style={{ width: "794px", minHeight: "1123px" }}
        style={{ width: "794px", margin: "0 auto" }}
      >
        <div className="flex justify-between items-center mb-6">
          <img src={logo} alt="Kantipur Infotech" className="w-[200px]" />
          <h1 className="text-[55px] font-serif text-gray-600 pr-5">invoice</h1>
        </div>

        <div className="flex justify-between mb-4">
          <div>
            <p className="text-gray-500">Invoice to</p>
            <p className="text-lg font-bold text-gray-800">
              {invoice.client_name}
            </p>
          </div>
          <div className="text-sm text-right mr-5">
            <p>
              <strong>Invoice</strong> {invoice.invoice_number}
            </p>
            <p>
              <strong>Date</strong> {formattedDate}
            </p>
          </div>
        </div>

        <table className="w-full mt-10 text-left border-b border-gray-400">
          <thead>
            <tr className="text-gray-400 border-b border-gray-400">
              <th className="pb-2 font-medium">S.No</th>
              <th className="pb-2 font-medium">ITEM</th>
              <th className="pb-2 text-center font-medium">Quantity</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, index) => (
              <tr key={index}>
                <td className="py-2 text-[#545454]">
                  {String(index + 1).padStart(2, "0")}
                </td>
                <td className="py-2 text-[#545454]">{item.service_name}</td>
                <td className="py-2 text-center text-[#545454]">
                  {item.quantity}
                </td>
                <td className="py-2 text-right text-[#545454]">
                  Rs {parseFloat(item.cost || 0).toLocaleString()}{" "}
                  {getLabelFromValue(item.duration)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 text-right">
          <p className="text-sm text-gray-700 font-medium px-8">
            Subtotal
            <span className="ml-6">
              Rs.{" "}
              {invoice.items
                ?.reduce((acc, i) => acc + parseFloat(i.cost || 0), 0)
                .toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
              {unitLabel}
            </span>
          </p>
          <p className="text-lg font-bold text-center bg-gray-100 inline-block px-6 py-2 mt-4 w-[200px]">
            Total Rs. {parseFloat(invoice.total_amount || 0).toLocaleString()}{" "}
            {unitLabel}
          </p>
        </div>

        <div className="text-xs text-gray-500 mt-6 pt-4">
          <p className="text-[8px] text-center">
            This is not a TAX invoice. You can request the TAX invoice by
            sending the invoice number at billing@kantipurinfotech.com
          </p>
          <div className="grid grid-cols-4 items-start gap-4 mt-4 py-2 border-t border-b text-[10px]">
            <div>
              <p className="font-semibold text-gray-700 ">Contact Details</p>
              <p>
                <span className="font-semibold text-gray-700">P:</span>{" "}
                +015244366
              </p>
            </div>

            <div>
              <p>44600, New Baneshwor</p>
              <p>Kathmandu, Nepal</p>
            </div>

            <div>
              <p className="text-[9px]">
                <span className=" text-black font-semibold ">E:</span>{" "}
                billing@kantipurinfotech.com
              </p>
              <p className="text-[9px]">
                <span className=" text-black font-semibold">W:</span>{" "}
                www.kantipurinfotech.com
              </p>
            </div>

            <div className="flex items-center justify-center h-full w-full">
              <p className="text-[#EF4444] font-medium text-[18px] pl-8">
                THANK YOU!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
