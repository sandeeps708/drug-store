// src/components/DrugTable.jsx
import React, { useEffect, useState } from "react";
import { fetchConfig, fetchDrugs, fetchCompanies } from "../api";

export default function DrugTable() {
  const [config, setConfig] = useState(null);
  const [drugs, setDrugs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyFilter, setCompanyFilter] = useState("");

  useEffect(() => {
    fetchConfig().then(setConfig);
    fetchCompanies().then(setCompanies);
    loadDrugs();
  }, []);

  const loadDrugs = (company) => {
    fetchDrugs(company).then(setDrugs);
  };

  const handleCompanyChange = (e) => {
    const company = e.target.value;
    setCompanyFilter(company);
    loadDrugs(company || undefined);
  };

  const handleCompanyClick = (e, company) => {
    e.preventDefault(); // prevent navigation
    setCompanyFilter(company);
    loadDrugs(company);
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString();
  };

  if (!config) return <p>Loading...</p>;

  return (
    <div className="table-container">
      <label>
        <strong>Company Filter:</strong>
        <br />
        <select
          value={companyFilter}
          onChange={handleCompanyChange}
          data-testid="company-select"
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      <table width="100%" border="1" cellPadding="8" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            {config.columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {drugs.map((d, idx) => (
            <tr key={d._id || d.code}>
              <td>{idx + 1}</td>
              <td>{d.code}</td>
              <td>
                {d.genericName}
                {d.brandName ? ` (${d.brandName})` : ""}
              </td>
              <td>
                {/* Render company as an anchor so tests (and accessibility) can find it by role="link" */}
                <a
                  href="#"
                  className="company-link"
                  onClick={(e) => handleCompanyClick(e, d.company)}
                  data-testid={`company-${idx}`}
                >
                  {d.company}
                </a>
              </td>
              <td>{formatDate(d.launchDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
