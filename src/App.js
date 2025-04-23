import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Quotation from "./components/Quotation/index";
import QuotationDetail from "./components/Quotation/QuotationDetail";
import AllQuotations from "./components/Quotation/AllQuotations";

import Invoice from "./components/Invoice/Invoice";
import AllInvoice from "./components/Invoice/AllInvoice";
import InvoiceDetail from "./components/Invoice/InvoiceDetail";

import LandingPage from "./components/LandingPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 py-2 rounded-lg">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Quotation Routes */}
          <Route path="/quotation" element={<Quotation />} />
          <Route path="/quotation/all-quotations" element={<AllQuotations />} />
          <Route path="/quotation/:id" element={<QuotationDetail />} />

          {/* Invoice Routes */}
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/allinvoice" element={<AllInvoice />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />

          <Route
            path="*"
            element={
              <div className="text-center mt-20 text-red-600 text-xl font-semibold">
                404 - Page not found
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
