import type { Pet, HealthRecord } from '@/types';
import { format } from 'date-fns';

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

function calculateAge(birthDate: string | null): string {
  if (!birthDate) return 'Unknown';
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (years > 0) {
    return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? `, ${months} mo` : ''}`;
  }
  const totalMonths = years * 12 + months;
  return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
}

export function generatePetReport(pet: Pet, records: HealthRecord[]): string {
  const vaccines = records.filter((r) => r.type === 'vaccine');
  const medications = records.filter((r) => r.type === 'medication');
  const vetVisits = records.filter((r) => r.type === 'vet_visit');

  const today = format(new Date(), 'MMMM d, yyyy');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #2A2017;
      line-height: 1.5;
      padding: 40px;
      font-size: 14px;
    }
    .header {
      background: #B5633B;
      color: white;
      padding: 32px;
      border-radius: 12px;
      margin-bottom: 32px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 4px;
    }
    .header p {
      opacity: 0.85;
      font-size: 13px;
    }
    .logo-text {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      opacity: 0.7;
      margin-bottom: 12px;
    }
    .section {
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #B5633B;
      border-bottom: 2px solid #F5E6DB;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .info-item {
      background: #F5F0EB;
      padding: 12px 16px;
      border-radius: 8px;
    }
    .info-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6B5D52;
      font-weight: 600;
    }
    .info-value {
      font-size: 15px;
      font-weight: 600;
      color: #2A2017;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    thead th {
      background: #F5E6DB;
      color: #8C4A2B;
      font-weight: 600;
      text-align: left;
      padding: 10px 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    tbody td {
      padding: 10px 12px;
      border-bottom: 1px solid #E8E0D8;
      color: #2A2017;
    }
    tbody tr:last-child td {
      border-bottom: none;
    }
    .empty-msg {
      color: #9E9189;
      font-style: italic;
      padding: 16px 0;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 11px;
      color: #9E9189;
      border-top: 1px solid #E8E0D8;
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-text">PawTrack Health Report</div>
    <h1>${escapeHtml(pet.name)}</h1>
    <p>Generated on ${today}</p>
  </div>

  <div class="section">
    <h2 class="section-title">Pet Information</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Species</div>
        <div class="info-value">${escapeHtml(pet.species.charAt(0).toUpperCase() + pet.species.slice(1))}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Breed</div>
        <div class="info-value">${escapeHtml(pet.breed) || 'Not specified'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Age</div>
        <div class="info-value">${calculateAge(pet.birth_date)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Weight</div>
        <div class="info-value">${pet.weight_lb ? `${pet.weight_lb} lb` : 'Not recorded'}</div>
      </div>
      ${pet.chip_id ? `
      <div class="info-item">
        <div class="info-label">Microchip ID</div>
        <div class="info-value">${escapeHtml(pet.chip_id)}</div>
      </div>` : ''}
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Vaccination History</h2>
    ${vaccines.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Vaccine</th>
          <th>Date</th>
          <th>Next Due</th>
          <th>Vet / Clinic</th>
        </tr>
      </thead>
      <tbody>
        ${vaccines.map((v) => `
        <tr>
          <td>${escapeHtml(v.title)}</td>
          <td>${formatDate(v.date)}</td>
          <td>${formatDate(v.next_due_date)}</td>
          <td>${escapeHtml(v.vet_name || v.vet_clinic) || '-'}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : '<p class="empty-msg">No vaccination records found.</p>'}
  </div>

  <div class="section">
    <h2 class="section-title">Medications</h2>
    ${medications.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Medication</th>
          <th>Dosage</th>
          <th>Frequency</th>
          <th>Start Date</th>
        </tr>
      </thead>
      <tbody>
        ${medications.map((m) => `
        <tr>
          <td>${escapeHtml(m.title)}</td>
          <td>${escapeHtml(m.dosage) || '-'}</td>
          <td>${escapeHtml(m.frequency) || '-'}</td>
          <td>${formatDate(m.date)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : '<p class="empty-msg">No medication records found.</p>'}
  </div>

  <div class="section">
    <h2 class="section-title">Recent Vet Visits</h2>
    ${vetVisits.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Visit</th>
          <th>Date</th>
          <th>Vet / Clinic</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${vetVisits.map((v) => `
        <tr>
          <td>${escapeHtml(v.title)}</td>
          <td>${formatDate(v.date)}</td>
          <td>${escapeHtml(v.vet_name || v.vet_clinic) || '-'}</td>
          <td>${escapeHtml(v.description) || '-'}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : '<p class="empty-msg">No vet visit records found.</p>'}
  </div>

  <div class="footer">
    <p>This report was generated by PawTrack. Always consult your veterinarian for medical advice.</p>
  </div>
</body>
</html>`;
}
