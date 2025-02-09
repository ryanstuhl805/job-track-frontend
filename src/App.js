import React, { useEffect, useState } from 'react';
import logo from './IMG_1975sq.jpg';
import './App.css';

function App() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
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

  const resetJobTrackerForm = () => {
    setFormData({
      status: '',
      websiteLinks: '',
      importantDate: ''
    });
    setNewCompanyName('');
    setSelectedCompanyId('');
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
              status: document.getElementById('status').value,
              links: document.getElementById('websiteLinks').value,
              callout: document.getElementById('importantDate').value
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
                {companies.length > 0 && (
                  <>
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
                  </>
                )}
              </div>
              <div className="clearfix"></div>
              <div className="form-group">
                <label>Or Enter New Company:</label>
                <input
                  type="text"
                  id="companyName"
                  value={newCompanyName}
                  disabled={selectedCompanyId !== ''}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Enter new company name"
                />
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
                <th colSpan="2">Company Name</th>
                <th colSpan="2">Status</th>
                <th colSpan="2">Website / Links</th>
                <th colSpan="2">Important Date</th>
                <th colSpan="2"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="companyName">Company Name</td>
                <td className="status">Status</td>
                <td className="websiteLinks">Website / Links</td>
                <td className="importantDate">Important Date</td>
                <td></td>
              </tr>
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
