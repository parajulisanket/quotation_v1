import React, { useState, useEffect, useRef } from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
// import html2pdf from "html2pdf.js";
import axios from "axios";

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

const getLabelFromValue = (value) => {
  const found = unitOptions.find((opt) => opt.value === value);
  return found ? found.label : value;
};

const Invoice = () => {
  const navigate = useNavigate();
  const printRef = useRef();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [clientId, setClientId] = useState(null);
  const [clients, setClients] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [customClient, setCustomClient] = useState("");
  const [items, setItems] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [titleOptions, setTitleOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const URL = `${process.env.REACT_APP_API_URL}/invoices/`;
    axios
      .get(URL)
      .then((res) => setInvoiceNumber(res.data.invoice_number))
      .catch((err) => console.error("Failed to fetch invoice number", err));

    fetchClients();
    fetchTitles();
  }, []);

  const fetchClients = () => {
    const URL = `${process.env.REACT_APP_API_URL}/clients/`;
    axios
      .get(URL)
      .then((res) => {
        const options = [
          { value: "__custom__", label: "--Enter Manually--" },
          ...res.data.map((client) => ({
            value: client.id,
            label: client.name,
          })),
        ];
        setClients(res.data);
        setClientOptions(options);
      })
      .catch((err) => console.error("Failed to fetch clients", err));
  };

  const fetchTitles = () => {
    const URL = `${process.env.REACT_APP_API_URL}/invoices/`;
    axios
      .get(URL)
      .then((res) => {
        const allTitles = res.data
          .flatMap((q) => q.items?.map((item) => item.service_name) || [])
          .filter((v, i, a) => v && a.indexOf(v) === i);

        const formatted = [
          { value: "__custom__", label: "--Enter Manually--" },
          ...allTitles.map((title) => ({ value: title, label: title })),
        ];
        setTitleOptions(formatted);
      })
      .catch((err) => console.error("Failed to fetch service titles", err));
  };

  const handleCompanySelect = (selectedOption) => {
    if (!selectedOption) return;
    if (selectedOption.value === "__custom__") {
      setClientId(null);
      setCompanyName("__custom__");
    } else {
      const selectedClient = clients.find(
        (c) => c.id.toString() === selectedOption.value.toString()
      );
      if (selectedClient) {
        setClientId(Number(selectedClient.id));
        setCompanyName(selectedClient.name);
        setCustomClient("");
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleTitleSelect = (index, selectedOption) => {
    const updatedItems = [...items];
    if (selectedOption.value === "__custom__") {
      updatedItems[index].title = "";
      updatedItems[index].isCustom = true;
    } else {
      updatedItems[index].title = selectedOption.value;
      updatedItems[index].isCustom = false;
    }
    setItems(updatedItems);
  };

  const addNewItem = () => {
    setItems([
      ...items,
      {
        title: "",
        description: "",
        quantity: "",
        price: "",
        unit: "",
        isCustom: false,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
  };

  const generateInvoice = async () => {
    try {
      const payload = {
        invoice_number: invoiceNumber,
        client: companyName === "__custom__" ? null : clientId,
        client_name: companyName === "__custom__" ? customClient : companyName,
        items: items.map((item) => ({
          service_name: item.title,
          cost: item.price,
          quantity: item.quantity,
          duration: item.unit,
        })),
        date: invoiceDate,
      };

      const URL = `${process.env.REACT_APP_API_URL}/invoices/`;
      const res = await axios.post(URL, payload);

      alert("Invoice created successfully");
      setInvoiceNumber(res.data.invoice_number);
    } catch (err) {
      console.error(err);
      alert("No invoice is added.");
    }
  };

  // const handleDownloadPDF = () => {
  //   const element = printRef.current;
  //   const opt = {
  //     margin: 0.3,
  //     filename: `Invoice_${invoiceNumber || "Preview"}.pdf`,
  //     image: { type: "jpeg", quality: 0.98 },
  //     html2canvas: { scale: 2 },
  //     jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  //   };
  //   html2pdf().from(element).set(opt).save();
  // };

  const unitLabel = items.length > 0 ? getLabelFromValue(items[0].unit) : "";

  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex gap-4 justify-between items-start">
        {/* LEFT FORM */}
        <div className="w-[64%] bg-gray-50 -ml-20 p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#034cc6]">Service Items</h2>
            <button
              onClick={() => navigate("/allinvoice")}
              className="text-sm bg-[#034cc6] text-white hover:bg-blue-600 px-4 py-1 rounded"
            >
              View All Invoice
            </button>
          </div>

          {/* Client and Date */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[#2c2c2c] font-medium mb-1 px-1">
                Invoice To
              </label>
              <Select
                options={clientOptions}
                onChange={handleCompanySelect}
                className="w-full"
                placeholder="Search or select client"
              />
              {companyName === "__custom__" && (
                <input
                  type="text"
                  value={customClient}
                  onChange={(e) => setCustomClient(e.target.value)}
                  placeholder="Enter client name"
                  className="mt-2 border px-3 py-2 rounded w-full"
                />
              )}
            </div>

            <div className="text-right">
              <label className="text-gray-800 font-medium mb-1 px-2 block">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="border px-8 py-2 rounded w-44"
              />
            </div>
          </div>

          <table className="w-full table-auto text-sm border mt-6">
            <thead>
              <tr className="bg-blue-100 text-left">
                <th className="p-2">Title</th>
                <th className="p-2 text-center">Qty</th>
                <th className="p-2 text-center">Unit</th>
                <th className="p-2 text-right">Price</th>
                <th className="p-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">
                    <Select
                      options={titleOptions}
                      placeholder="Select Service"
                      value={
                        item.title
                          ? item.isCustom
                            ? {
                                value: "__custom__",
                                label: "--Enter Manually--",
                              }
                            : { value: item.title, label: item.title }
                          : null
                      }
                      onChange={(selected) =>
                        handleTitleSelect(index, selected)
                      }
                      className="w-60"
                    />

                    {item.isCustom && (
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          handleItemChange(index, "title", e.target.value)
                        }
                        className="w-60 border px-2 py-1 mt-2 rounded"
                        placeholder="Enter Service Name"
                      />
                    )}
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      className="w-20 border px-2 py-1 rounded text-center"
                      placeholder="Qty"
                    />
                  </td>

                  <td className="p-2 text-center">
                    <select
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(index, "unit", e.target.value)
                      }
                      className="border px-2 py-1 rounded  appearance-none"
                    >
                      {unitOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(index, "price", e.target.value)
                      }
                      className="w-full border px-2 py-1 rounded text-right"
                      placeholder="Amount"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600  text-lg"
                    >
                      x
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between mt-4">
            <button
              onClick={generateInvoice}
              className="bg-blue-700 text-white px-4 py-2 rounded"
            >
              Generate Invoice
            </button>
            <button
              onClick={addNewItem}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              + Add Item
            </button>
          </div>
        </div>

        {/* RIGHT SIDE FORMATTED VIEW */}
        <div
          className="w-[65%] bg-white p-10 rounded shadow-md -mr-20"
          ref={printRef}
        >
          <div className="flex justify-between items-center mb-6">
            <img src={logo} alt="Kantipur Infotech" className="w-[200px]" />
            <h1 className="text-[55px] font-serif text-gray-600 pr-5">
              invoice
            </h1>
          </div>

          <div className="flex justify-between mb-4 ">
            <div>
              <p className="text-gray-500">Invoice to</p>
              <p className="text-lg font-bold text-gray-800">
                {companyName === "__custom__"
                  ? customClient
                  : companyName || ""}
              </p>
            </div>
            <div className="text-sm text-right mr-5">
              <p>
                <strong>Invoice</strong> {invoiceNumber || "KITINXXXX"}
              </p>
              <p>
                <strong>Date</strong>{" "}
                {invoiceDate
                  ? new Date(invoiceDate).toLocaleDateString("en-GB")
                  : "DD/MM/YYYY"}
              </p>
            </div>
          </div>

          <table className="w-full mt-10 text-left border-b border-gray-400 ">
            <thead>
              <tr className="text-gray-400 border-b border-gray-400 ">
                <th className="pb-2 font-medium">S.No</th>
                <th className="pb-2 font-medium">ITEM</th>
                <th className="pb-2 text-center font-medium">Quantity</th>
                <th className="pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item, index) => (
                <tr key={index}>
                  <td className="py-2 text-[#545454]">
                    {String(
                      (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                    ).padStart(2, "0")}
                  </td>
                  <td className="py-2 text-[#545454]">{item.title}</td>
                  <td className="py-2 text-center text-[#545454]">
                    {item.quantity}
                  </td>

                  <td className="py-2 text-right text-[#545454]">
                    Rs {parseFloat(item.price || 0).toLocaleString()}{" "}
                    {item.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 text-right">
            <p className="text-sm text-gray-700 font-medium px-8">
              Subtotal{" "}
              <span className="ml-6">
                Rs.{" "}
                {calculateTotal().toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
                {unitLabel}
              </span>
            </p>

            <p className="text-lg font-bold text-center bg-gray-100 inline-block px-6 py-2 mt-4 w-[200px]">
              Total Rs. {calculateTotal().toLocaleString()}{" "}
              {unitLabel.toUpperCase()}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded border text-sm ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white text-blue-600"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Invoice;
