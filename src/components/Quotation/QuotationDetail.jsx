import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import html2pdf from "html2pdf.js";
import axios from "axios";

const getLabelFromValue = (value) => {
  const unitOptions = [
    { label: "", value: "" },
    { label: "/m", value: "Monthly" },
    { label: "/q", value: "Quarterly" },
    { label: "/y", value: "Yearly" },
    { label: "/ot", value: "Onetime" },
    { label: "/lt", value: "Lifetime" },
    { label: "/item", value: "Peritem" },
    { label: "/post", value: "Perpost" },
    { label: "/design", value: "Perdesign" },
  ];

  const found = unitOptions.find((opt) => opt.value === value);
  return found ? found.label : value;
};

const QuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [error, setError] = useState(null);
  const targetRef = useRef(null);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/quotations/${id}/`
        );
        setQuotation(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load quotation.");
      }
    };

    fetchQuotation();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const calculateTotal = () => {
    return quotation?.items?.reduce(
      (sum, item) => sum + (parseInt(item.cost) || 0),
      0
    );
  };

  const getUnitLabel = () => {
    const validUnits = quotation?.items
      ?.map((item) => item.duration)
      .filter(Boolean);
    if (!validUnits?.length) return "";
    const frequency = {};
    validUnits.forEach((unit) => {
      frequency[unit] = (frequency[unit] || 0) + 1;
    });
    return Object.entries(frequency).sort((a, b) => b[1] - a[1])[0][0];
  };

  const handleDownloadPDF = () => {
    const element = targetRef.current;
    if (!element) return alert("PDF element not ready.");

    const clone = element.cloneNode(true);
    clone.style.background = "white";
    clone.style.position = "relative";

    const style = document.createElement("style");
    style.innerHTML = `
      * {
        box-shadow: none !important;
        border: none !important;
        outline: none !important;
      }
      .page-break {
        page-break-before: always;
      }
      .pdf-page {
        padding-top: 60px !important;
        padding-bottom: 80px !important;
        page-break-after: always;
      }
      .only-view {
        display: none !important;
      }
      .service-item, .pdf-header, .pdf-footer-section {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    `;
    clone.insertBefore(style, clone.firstChild);
    document.body.appendChild(clone);

    const serviceItemNodes = Array.from(
      clone.querySelectorAll(".service-item")
    );
    const container = clone.querySelector("#service-items-container");
    const footer = clone.querySelector("#totals-and-footer");
    footer.classList.add("pdf-footer-section");

    const createPage = (items) => {
      const page = document.createElement("div");
      page.className = "pdf-page";
      const header = document.createElement("div");
      header.className =
        "grid grid-cols-2 bg-[#034cc6] text-white p-4 font-bold mb-2 pdf-header";
      header.innerHTML = `
        <div class="pl-4">DESCRIPTION</div>
        <div class="text-right pr-4">SUBTOTAL</div>
      `;
      page.appendChild(header);
      items.forEach((item) => page.appendChild(item));
      return page;
    };

    if (serviceItemNodes.length <= 3) {
      const header = document.createElement("div");
      header.className =
        "grid grid-cols-2 bg-[#034cc6] text-white p-4 font-bold mb-2 pdf-header";
      header.innerHTML = `
        <div class="pl-4">DESCRIPTION</div>
        <div class="text-right pr-4">SUBTOTAL</div>
      `;
      container.before(header);

      serviceItemNodes.forEach((item) => container.appendChild(item));

      // Check if footer fits — if not, push to next page
      const fullHeight = container.offsetHeight + footer.offsetHeight;
      if (fullHeight > 1000) {
        const breakDiv = document.createElement("div");
        breakDiv.className = "page-break";
        container.appendChild(breakDiv);
      }

      container.appendChild(footer);
    } else {
      container.innerHTML = "";

      const firstChunk = serviceItemNodes.splice(0, 3);
      container.appendChild(createPage(firstChunk));

      while (serviceItemNodes.length > 0) {
        const pageBreak = document.createElement("div");
        pageBreak.className = "page-break";
        container.appendChild(pageBreak);
        const chunk = serviceItemNodes.splice(0, 6);
        container.appendChild(createPage(chunk));
      }

      const pageBreak = document.createElement("div");
      pageBreak.className = "page-break";
      container.appendChild(pageBreak);

      const totalPage = document.createElement("div");
      totalPage.className = "pdf-page";
      totalPage.appendChild(footer);
      container.appendChild(totalPage);
    }

    const opt = {
      margin: 0,
      filename: `Quotation_${id}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
      pagebreak: { mode: ["avoid-all"] },
    };

    html2pdf()
      .set(opt)
      .from(clone)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(18);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            770,
            1110,
            null,
            null,
            "right"
          );
        }
      })
      .save()
      .finally(() => {
        document.body.removeChild(clone);
      });
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!quotation) return <p className="text-center">Loading...</p>;

  const unitLabel = getLabelFromValue(getUnitLabel());

  return (
    <div className="max-w-7xl mx-auto p-4 text-[12px] leading-[1.4]">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate("/quotation/all-quotations")}
          className="bg-[#034cc6] text-white hover:bg-blue-600 px-4 py-1 text-sm rounded shadow-sm"
        >
          ← Back to All Quotations
        </button>
        <button
          onClick={handleDownloadPDF}
          className="bg-[#034cc6] text-white px-4 py-1 text-sm rounded hover:bg-blue-800"
        >
          Save as PDF
        </button>
      </div>

      <div
        ref={targetRef}
        className="bg-white border shadow p-8"
        style={{ width: "794px", margin: "0 auto" }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#034cc6] mb-4">
              Quotation
            </h1>
            <p className="text-lg font-bold text-[#969696]">
              Quotation
              <span className="text-black px-6">
                #{quotation.quotation_number}
              </span>
            </p>
            <p className="text-lg font-bold text-[#969696]">
              Quotation Date
              <span className="text-black px-2">
                {formatDate(quotation.date)}
              </span>
            </p>
          </div>
          <img src={logo} alt="Logo" className="w-40 h-auto" />
        </div>

        <div className="bg-[#f4f6fd] p-4 rounded mb-6 w-[350px]">
          <h2 className="text-xl font-bold mb-1 text-[#2c2c2c]">
            QUOTATION TO
          </h2>
          <p className="text-xl text-[#545454] font-semibold ">
            {quotation.client_name || ""}
          </p>
        </div>

        <div className="only-view grid grid-cols-2 bg-[#034cc6] text-white p-4 font-bold mb-2">
          <div className="pl-4">DESCRIPTION</div>
          <div className="text-right pr-4">SUBTOTAL</div>
        </div>

        <div id="service-items-container" className="avoid-page-number">
          {quotation.items?.map((item, index) => (
            <div
              key={index}
              className="p-4 grid grid-cols-2 bg-[#f6f8fc] service-item"
              style={{ breakInside: "avoid" }}
            >
              <div>
                <div className="font-semibold text-[14px] text-[#545454] mb-2">
                  {item.service_name}
                </div>
                <p className="text-sm text-[#545454] max-w-[350px] break-words">
                  {item.description || "No description"}
                </p>
              </div>
              <div className="text-right text-[14px] text-[#2c2c2c] font-medium">
                Rs {parseInt(item.cost || 0).toLocaleString()}{" "}
                {getLabelFromValue(item.duration)}
              </div>
            </div>
          ))}
        </div>

        <div id="totals-and-footer">
          <div className="flex justify-end mt-10">
            <div className="w-64">
              <div className="flex justify-between mb-6">
                <div className="text-[#2c2c2c]  text-[14px]">Subtotal</div>
                <div className="font-medium">
                  NRs. {calculateTotal().toLocaleString()} {unitLabel}
                </div>
              </div>
              <div className="bg-[#034cc6] text-white p-3 font-bold flex justify-between">
                <span>TOTAL</span>
                <span>
                  NRs. {calculateTotal().toLocaleString()}{" "}
                  {unitLabel.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-[#545454] leading-relaxed">
            <div className="mb-2">
              <p>www.kantipurinfotech.com</p>
              <p>Email: hello@kantipurinfotech.com</p>
              <p>Phone: +977 15244366, 9802348565</p>
              <p>New Baneshwor, Kathmandu, NP</p>
            </div>
            <div>
              <h3 className="font-semibold mt-6 text-[#2c2c2c] uppercase text-[13px] tracking-wide">
                Terms and Conditions
              </h3>
              <p className="text-[#545454] text-sm">
                This quotation is valid for 7 days only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetail;
