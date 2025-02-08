import React, { useEffect, useState } from 'react';
import logo from './IMG_1975sq.jpg';
import './App.css';

function App() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');

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
        const sortedCompanies = data.sort((a, b) => a.id - b.id);
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

  const postJobInfo = async (e) => {
    e.preventDefault();

    const companyData = selectedCompanyId 
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
          companyData,
          contact_date: document.getElementById('contactDate').value,
          notes_attributes: [
            {
              status_date: document.getElementById('statusDate').value,
              status: document.getElementById('status').value,
              website_links: document.getElementById('websiteLinks').value,
              important_date: document.getElementById('importantDate').value
            }
          ]
        })
      }).then(response => {
        console.log(response);
      });
    } catch(error) {
      console.error('Error: ', error);
    }
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          This is my <code>Job-Tracker</code> font end.
        </p>
        <div>
          <h1>Job Tracker</h1>
          <div className="addCompanyContainer">
            <form onSubmit={postJobInfo} id="addCompanyForm">
              <h2>Add Company</h2>
              <div className="form-group">
                <label>Select Existing Company:</label>
                <select 
                  id="companySelect"
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                >
                  <option value="">Choose a company...</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="clearfix"></div>
              <div className="form-group">
                <label>Or Enter New Company:</label>
                <input
                  type="text"
                  id="companyName"
                  disabled={selectedCompanyId !== ''}
                  placeholder="Enter new company name"
                />
              </div>
              <div className="clearfix"></div>
              <div className="form-group">
                <label htmlFor="contactDate">Date Contacted:</label>
                <input type="date" id="contactDate" name="contactDate" required />
              </div>
              <div className="clearfix"></div>
              <div className="form-group">
                <label htmlFor="statusDate">Status Date:</label>
                <input type="date" id="statusDate" name="statusDate" required />
              </div>
              <div className="clearfix"></div>
              <div className="form-group">
                <label htmlFor="status">Status:</label>
                <input type="text" id="status" name="status" required />
              </div>
              <div className="form-group">
                <label htmlFor="websiteLinks">Website / Links:</label>
                <input type="textarea" id="websiteLinks" name="websiteLinks" />
              </div>
              <div className="form-group">
                <label htmlFor="importantDate">Important Date:</label>
                <input type="date" id="importantDate" name="importantDate" />
              </div>
              <div className="form-group">
                <button type="submit">{buttonText}</button>
              </div>
            </form>
          </div>
          {/* <div className="jobTrackerContainer">
            <button type="button" onClick={fetchJobTrackerData}>Refresh</button>
          </div> */}
          <table id="jobTable">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Date Contacted</th>
                <th>Status Date</th>
                <th>Status</th>
                <th>Website / Links</th>
                <th>Important Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="companyName">Company Name</td>
                <td className="contactDate">Date Contacted</td>
                <td className="statusDate">Status Date</td>
                <td className="status">Status</td>
                <td className="websiteLinks">Website / Links</td>
                <td className="importantDate">Important Date</td>
              </tr>
            </tbody>
          </table>
        </div>
      </header>
    </div>
  );
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
          row.insertCell(0).textContent = job.name;
          row.insertCell(1).textContent = job.created_at;
          row.insertCell(2).textContent = jobWithNotes?.created_at ?? '';
          row.insertCell(3).textContent = jobWithNotes?.status ?? '';
          row.insertCell(4).textContent = jobWithNotes?.links ?? '';
          row.insertCell(5).textContent = jobWithNotes?.callout ?? '';
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
