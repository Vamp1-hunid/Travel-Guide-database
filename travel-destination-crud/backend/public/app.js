const API_URL = "/api/destinations";

const form = document.getElementById("destinationForm");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const tableBody = document.getElementById("destinationTableBody");
const editingIdInput = document.getElementById("editingId");

const fields = {
  destination: document.getElementById("destination"),
  country: document.getElementById("country"),
  region: document.getElementById("region"),
  continent: document.getElementById("continent"),
  description: document.getElementById("description"),
  best_season: document.getElementById("best_season"),
  average_budget_usd: document.getElementById("average_budget_usd"),
  visa_required: document.getElementById("visa_required"),
  safety_rating: document.getElementById("safety_rating"),
  top_attraction: document.getElementById("top_attraction"),
  language: document.getElementById("language"),
  currency: document.getElementById("currency"),
  status: document.getElementById("status")
};

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function resetForm() {
  form.reset();
  editingIdInput.value = "";
  formTitle.textContent = "Add Destination";
  submitBtn.textContent = "Save Destination";
  fields.safety_rating.value = "3";
  fields.status.value = "active";
  fields.visa_required.checked = false;
}

function getPayload() {
  return {
    destination: fields.destination.value.trim(),
    country: fields.country.value.trim(),
    region: fields.region.value.trim(),
    continent: fields.continent.value.trim(),
    description: fields.description.value.trim(),
    best_season: fields.best_season.value.trim(),
    average_budget_usd:
      fields.average_budget_usd.value === ""
        ? 0
        : Number(fields.average_budget_usd.value),
    visa_required: fields.visa_required.checked,
    safety_rating: Number(fields.safety_rating.value),
    top_attraction: fields.top_attraction.value.trim(),
    language: fields.language.value.trim(),
    currency: fields.currency.value.trim(),
    status: fields.status.value
  };
}

async function loadDestinations() {
  try {
    const res = await fetch(API_URL);
    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "Failed to load destinations");
    }

    renderDestinations(json.data);
  } catch (err) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="16" style="color:red;">Error: ${escapeHtml(err.message)}</td>
      </tr>
    `;
  }
}

function renderDestinations(destinations) {
  if (!Array.isArray(destinations) || destinations.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="16">No destinations found.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = destinations
    .map((d) => {
      return `
        <tr>
          <td>${escapeHtml(d.id)}</td>
          <td>${escapeHtml(d.destination)}</td>
          <td>${escapeHtml(d.country)}</td>
          <td>${escapeHtml(d.region)}</td>
          <td>${escapeHtml(d.continent)}</td>
          <td class="truncate" title="${escapeHtml(d.description)}">
            ${escapeHtml(d.description)}
          </td>
          <td>${escapeHtml(d.best_season)}</td>
          <td>${escapeHtml(d.average_budget_usd)}</td>
          <td>${d.visa_required ? "Yes" : "No"}</td>
          <td>${escapeHtml(d.safety_rating)}</td>
          <td>${escapeHtml(d.top_attraction)}</td>
          <td>${escapeHtml(d.language)}</td>
          <td>${escapeHtml(d.currency)}</td>
          <td>${escapeHtml(d.status)}</td>
          <td>${escapeHtml(formatDate(d.created_at))}</td>
          <td>
            <button class="small" onclick="editDestination(${d.id})">Edit</button>
            <button class="small danger" onclick="deleteDestination(${d.id})">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function editDestination(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "Destination not found");
    }

    const d = json.data;

    editingIdInput.value = d.id;

    fields.destination.value = d.destination || "";
    fields.country.value = d.country || "";
    fields.region.value = d.region || "";
    fields.continent.value = d.continent || "";
    fields.description.value = d.description || "";
    fields.best_season.value = d.best_season || "";
    fields.average_budget_usd.value =
      d.average_budget_usd === null || d.average_budget_usd === undefined
        ? ""
        : d.average_budget_usd;
    fields.visa_required.checked = Boolean(d.visa_required);
    fields.safety_rating.value = d.safety_rating || 3;
    fields.top_attraction.value = d.top_attraction || "";
    fields.language.value = d.language || "";
    fields.currency.value = d.currency || "";
    fields.status.value = d.status || "active";

    formTitle.textContent = "Edit Destination";
    submitBtn.textContent = "Update Destination";

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    alert(err.message);
  }
}

async function deleteDestination(id) {
  const confirmed = confirm("Are you sure you want to delete this destination?");
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "Delete failed");
    }

    await loadDestinations();
  } catch (err) {
    alert(err.message);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = editingIdInput.value;
  const payload = getPayload();

  try {
    let res;

    if (id) {
      res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    }

    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "Operation failed");
    }

    resetForm();
    await loadDestinations();
  } catch (err) {
    alert(err.message);
  }
});

cancelBtn.addEventListener("click", resetForm);

window.editDestination = editDestination;
window.deleteDestination = deleteDestination;

loadDestinations();
