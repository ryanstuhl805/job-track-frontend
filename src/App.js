import React, { useEffect, useState } from 'react';
import logo from './IMG_1975sq.jpg';
import './App.css';

function App() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyStatus, setNewCompanyStatus] = useState('');
  const [newCompanyWebsiteLinks, setNewCompanyWebsiteLinks] = useState('');
  const [newCompanyImportantDate, setNewCompanyImportantDate] = useState('');
  const [formData, setFormData] = useState({
    status: '',
    websiteLinks: '',
    importantDate: ''
  });

  const buttonText = selectedCompanyId ? 'Add note' : 'Add company';

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/companies', {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        const sortedCompanies = data.sort((a, b) => a.name - b.name);
        setCompanies(sortedCompanies);
      } catch (error) {
        console.error('Error: ', error);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchJobTrackerData()
  }, []);

  const resetJobTrackerForm = () => {
    setFormData({
      status: '',
      websiteLinks: '',
      importantDate: ''
    });
    setNewCompanyName('');
    setSelectedCompanyId('');
    setNewCompanyStatus('');
    setNewCompanyWebsiteLinks('');
  }

  const postJobInfo = async (e) => {
    e.preventDefault();

    const payload = selectedCompanyId 
      ? { id: selectedCompanyId }
      : { name: newCompanyName };

      const isExistingCompany = !!selectedCompanyId;

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    const endpoint = isExistingCompany ? `/companies/${selectedCompanyId}` : '/companies';
    const method = isExistingCompany ? 'PATCH' : 'POST';

    try {
  
      const response = await fetch(endpoint, {
        method: method,
        headers: headers,
        body: JSON.stringify({
          ...payload,
          notes_attributes: [
            {
              status: newCompanyStatus,
              links: newCompanyWebsiteLinks,
              callout: newCompanyImportantDate
            }
          ]
        })
      }).then(response => {
        console.log(response);
        if (response.ok) {
          fetchJobTrackerData();
          resetJobTrackerForm();
        }
      });
    } catch(error) {
      console.error('Error: ', error);
    }
  }

  function logoComponent() {
    return <img src={logo} className="App-logo" alt="logo" />
  }

  function introductionComponent() {
    return (
      <p>
        This is my <code>Job-Tracker</code> font end.
      </p>
    )
  }

  function heading1Component(text) {
    return (
      <h1>{text}</h1>
    )
  }

  function heading2Component(text) {
    return (
      <h2>{text}</h2>
    )
  }

  function formInputLabel(text, htmlFor = String("")) {
    return (<label htmlFor={htmlFor}>{text}:</label>)
  }

  function formSelectOption(key, value) {
    return (
      <option key={key} value={key}>
        {value}
      </option>
    )
  }

  function textInputComponent(type, id, name, value, disabled = false, onChangeHandler, placeholder, required = false) {
    return (
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        {...(disabled ? {disabled: true} : {})}
        onChange={onChangeHandler}
        placeholder={placeholder}
        {...(required ? {required: true} : {})} 
      />
    )
  }

  function formElementComponent(type, id, name, value, disabled = false, onChangeHandler, placeholder, required = false) {
    return (
      <div className="form-group">
        {formInputLabel(placeholder, name)}
        {textInputComponent(type, id, name, value, disabled, onChangeHandler, placeholder, required)}
      </div>
    )
  }

  function companySelectComponent(companyData, id, placeholder, useSeparatorText = false) {
    return (
      <div className="form-group">
        {companyData.length > 0 && (
          <>
          {formInputLabel(placeholder, id)}
          <select 
            id={id}
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
          >
            {formSelectOption("", placeholder)}
            {companyData.map(company => (
              formSelectOption(company.id, company.name)
            ))}
          </select>
          {useSeparatorText && <p> - OR - </p>}
          </>
        )}
      </div>
    )
  }

  function buttonComponent(type, buttonActionText) {
    return (
      <div className="form-group">
        <button type={type}>{buttonActionText}</button>
      </div>
    )
  }

  function tableHeaderComponent(headerLabel, colSpan = 2) {
    return (
      <th colSpan={colSpan}>{headerLabel}</th>
    )
  }
  
  return (
    <div className="App">
      <header className="App-header">
        {logoComponent()}
        {introductionComponent()}
        <div>
          {heading1Component("Job Tracker")}
          <div className="addCompanyContainer">
            <form onSubmit={postJobInfo} id="addCompanyForm">
              {heading2Component("Add Company")}
              {companySelectComponent(companies, "companySelect", "Select Existing Company", true)}
              {formElementComponent("text", "companyName", "companyName", newCompanyName, selectedCompanyId !== '', (e) => setNewCompanyName(e.target.value), "Enter new company name", true)}
              {formElementComponent("text", "status", "status", newCompanyStatus, false, (e) => setNewCompanyStatus(e.target.value), "Status", true)}
              {formElementComponent("textarea", "websiteLinks", "websiteLinks", newCompanyWebsiteLinks, false, (e) => setNewCompanyWebsiteLinks(e.target.value), "Website / Links", false)}
              {formElementComponent("date", "importantDate", "importantDate", newCompanyImportantDate, false, (e) => setNewCompanyImportantDate(e.target.value), "Important Date", false)}
              {buttonComponent("submit", buttonText)}
            </form>
          </div>
          {/* <div className="jobTrackerContainer">
            <button type="button" onClick={fetchJobTrackerData}>Refresh</button>
          </div> */}
          <table id="jobTable">
            <thead>
              <tr>
                {tableHeaderComponent("Company Name", 2)}
                {tableHeaderComponent("Status", 2)}
                {tableHeaderComponent("Website / Links", 2)}
                {tableHeaderComponent("Important Date", 2)}
                {tableHeaderComponent("", 2)}
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
        </div>
      </header>
    </div>
  );
}

window.handleDelete = async function(companyId) {
  try {
    const response = await fetch(`/companies/${companyId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: companyId,
        notes_attributes: [
          {
            _destroy: true
          }
        ]
      })
    });

    if (response.ok) {
      fetchJobTrackerData();
    }
  } catch (error) {
    console.error('Error: ', error);
  }
}

export async function fetchJobTrackerData() {
  try {
    const response = await fetch('/companies', {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jobData = await response.json();
    console.dir(jobData);
    const table = document.getElementById('jobTable');
    if (!table) {
      throw new Error('Table element not found');
    }
    const tbody = table.getElementsByTagName('tbody')[0];
    if (!tbody) {
      throw new Error('Table body element not found');
    }
    console.log("Clearing table...");
    tbody.innerHTML = '';

    console.log("Adding new rows...");
    jobData.forEach(job => {
      if (!job.notes) {
        console.warn(`Missing notes for job: ${job.name}`);
        return;
      }

      job.notes.forEach(jobWithNotes => {
        try {
          const row = tbody.insertRow(); // Changed from table.insertRow()
          const nameCell = row.insertCell(0);
          nameCell.setAttribute('colspan', '2');
          nameCell.textContent = job.name;

          const statusCell = row.insertCell(1);
          statusCell.setAttribute('colspan', '2');
          statusCell.textContent = jobWithNotes?.status ?? '';

          const linksCell = row.insertCell(2);
          linksCell.setAttribute('colspan', '2');
          linksCell.textContent = jobWithNotes?.links ?? '';

          const calloutCell = row.insertCell(3);
          calloutCell.setAttribute('colspan', '2');
          calloutCell.textContent = jobWithNotes?.callout ?? '';

          const deleteCell = row.insertCell(4);
          deleteCell.setAttribute('colspan', '2');
          deleteCell.innerHTML = `<button onClick="handleDelete(${job.id})">Delete</button>`;
        } catch (rowError) {
          console.error(`Error inserting row for ${job.name}:`, rowError);
        }
      });
    });

    console.log("Parsed data: ", jobData);
  } catch (error) {
    console.error('Error: ', error);
  }
}

export default App;
