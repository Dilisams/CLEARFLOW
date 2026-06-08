const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const mapPoints = [
  { type: "water", category: "Borehole", severity: "Medium", region: "Nsukka", name: "Nsukka Solar Borehole", lat: 6.856, lng: 7.392 },
  { type: "water", category: "Pipeline", severity: "High", region: "Enugu North", name: "Ogui Pipeline Leak", lat: 6.452, lng: 7.515 },
  { type: "water", category: "Water station", severity: "Low", region: "Udi", name: "Udi Water Station", lat: 6.315, lng: 7.421 },
  { type: "sanitation", category: "Drainage", severity: "High", region: "Enugu East", name: "Abakpa Drainage Blockage", lat: 6.472, lng: 7.548 },
  { type: "sanitation", category: "Waste hotspot", severity: "Medium", region: "Nkanu West", name: "Agbani Dumping Alert", lat: 6.306, lng: 7.548 },
  { type: "sanitation", category: "Flood-risk", severity: "Critical", region: "Enugu South", name: "Achara Layout Flood-Risk Zone", lat: 6.422, lng: 7.494 }
];

const chartPalette = ["#4169E1", "#173B9B", "#FFFFFF", "#9DB2FF", "#EF4444"];

function setTheme(mode) {
  document.documentElement.dataset.theme = mode;
  document.body.dataset.theme = mode;
  localStorage.setItem("clearflow_theme", mode);
  const label = mode === "dark" ? "Switch to light mode" : "Switch to dark mode";
  $$(".theme-toggle").forEach((button) => button.setAttribute("aria-label", label));
}

function initNavigation() {
  const current = location.pathname.split("/").pop() || "index.html";
  $$(".nav-links a").forEach((link) => {
    if (link.getAttribute("href") === current) link.setAttribute("aria-current", "page");
  });
  $(".menu-btn")?.addEventListener("click", () => document.body.classList.toggle("menu-open"));
  $$(".theme-toggle").forEach((button) => {
    button.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  });
  setTheme(localStorage.getItem("clearflow_theme") || "light");
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.12 });
  $$(".reveal, .card, .metric").forEach((el) => observer.observe(el));
}

function initCounters() {
  $$(".counter").forEach((el) => {
    const target = Number(el.dataset.target || "0");
    const suffix = el.dataset.suffix || "";
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 70));
    const tick = () => {
      current = Math.min(target, current + step);
      el.textContent = `${current.toLocaleString()}${suffix}`;
      if (current < target) requestAnimationFrame(tick);
    };
    tick();
  });
}

function createChart(id, type, labels, datasets, options = {}) {
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return null;
  return new Chart(canvas, {
    type,
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { boxWidth: 12 } } },
      scales: type === "doughnut" ? {} : { y: { beginAtZero: true } },
      ...options
    }
  });
}

function initCharts() {
  createChart("usageChart", "line", ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], [
    { label: "Water supplied (ML)", data: [24, 28, 31, 36, 40, 46], borderColor: chartPalette[0], backgroundColor: "rgba(65,105,225,.14)", tension: .42, fill: true },
    { label: "Leakage loss (ML)", data: [9, 8, 7, 6, 5, 4], borderColor: chartPalette[4], backgroundColor: "rgba(239,68,68,.10)", tension: .42, fill: true }
  ]);
  createChart("complaintChart", "doughnut", ["Water", "Sanitation", "Waste", "Sewage"], [
    { label: "Complaints", data: [36, 29, 22, 13], backgroundColor: chartPalette }
  ]);
  createChart("incidentChart", "bar", ["Enugu N.", "Enugu E.", "Enugu S.", "Nsukka", "Udi", "Nkanu"], [
    { label: "Open incidents", data: [18, 24, 14, 16, 9, 12], backgroundColor: chartPalette[0] },
    { label: "Resolved", data: [11, 19, 13, 10, 8, 9], backgroundColor: chartPalette[3] }
  ]);
  createChart("riskChart", "radar", ["pH", "Turbidity", "E. coli", "Drainage", "Waste", "Flood"], [
    { label: "Risk score", data: [38, 62, 54, 72, 48, 69], borderColor: chartPalette[4], backgroundColor: "rgba(239,68,68,.18)" }
  ], { scales: { r: { beginAtZero: true, max: 100 } } });
  createChart("problemChart", "bar", ["Water access", "Leakages", "Contamination", "Blocked drains", "Waste", "Flooding"], [
    { label: "Estimated severity index", data: [76, 58, 64, 81, 69, 73], backgroundColor: chartPalette }
  ]);
  createChart("impactChart", "line", ["Pilot", "Q2", "Q3", "Q4", "2027"], [
    { label: "Communities covered", data: [8, 24, 48, 82, 160], borderColor: chartPalette[0], backgroundColor: "rgba(65,105,225,.14)", fill: true, tension: .4 }
  ]);
}

async function initReportForm() {
  const form = $("#reportForm");
  if (!form) return;
  $("#gpsBtn")?.addEventListener("click", () => {
    if (!navigator.geolocation) return showNotice("reportNotice", "GPS is not available on this device.");
    navigator.geolocation.getCurrentPosition((pos) => {
      $("#gps").value = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      showNotice("reportNotice", "GPS location captured for this report.");
    }, () => showNotice("reportNotice", "Could not access GPS. You can enter location manually."));
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const [lat, lng] = (data.gps || "").split(",").map((item) => Number(item.trim()));
    const saved = await window.ClearFlowStore.addReport({ ...data, lat: lat || 6.45, lng: lng || 7.51 });
    form.reset();
    showNotice("reportNotice", `Report ${saved.id} submitted. It is now visible in the admin dashboard.`);
  });
}

function showNotice(id, message) {
  const notice = document.getElementById(id);
  if (!notice) return;
  notice.textContent = message;
  notice.classList.add("show");
}

async function initDashboard() {
  const table = $("#reportsTable");
  if (!table) return;
  const reports = await window.ClearFlowStore.getReports();
  table.innerHTML = reports.map((report) => `
    <tr>
      <td>${report.id}</td>
      <td>${report.location}</td>
      <td>${report.category}</td>
      <td>${report.severity}</td>
      <td><span class="status ${statusClass(report.status)}">${report.status}</span></td>
      <td>
        <select data-report-status="${report.id}" aria-label="Update ${report.id} status">
          <option ${report.status === "Open" ? "selected" : ""}>Open</option>
          <option ${report.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option ${report.status === "Resolved" ? "selected" : ""}>Resolved</option>
        </select>
      </td>
    </tr>
  `).join("");
  $$("[data-report-status]").forEach((select) => {
    select.addEventListener("change", async () => {
      await window.ClearFlowStore.updateReportStatus(select.dataset.reportStatus, select.value);
      initDashboard();
    });
  });
  $("#exportBtn")?.addEventListener("click", () => exportReports(reports));
}

function statusClass(status = "") {
  if (status === "Resolved") return "resolved";
  if (status === "In Progress") return "progress";
  return "open";
}

function exportReports(reports) {
  const headers = ["id", "name", "email", "phone", "location", "category", "severity", "status", "description", "createdAt"];
  const rows = [headers.join(","), ...reports.map((report) => headers.map((key) => `"${String(report[key] || "").replaceAll('"', '""')}"`).join(","))];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clearflow-enugu-reports.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function initAuth() {
  const form = $("#authForm");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const action = event.submitter?.value || "login";
    if (action === "signup") await window.ClearFlowStore.signUp(data.email, data.password);
    else await window.ClearFlowStore.signIn(data.email, data.password);
    showNotice("authNotice", `${action === "signup" ? "Account created" : "Login successful"} for ${data.email}.`);
  });
}

function initContactForm() {
  const form = $("#contactForm");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const cfg = window.ClearFlowConfig.emailJs;
    if (window.emailjs && cfg.publicKey && !cfg.publicKey.startsWith("YOUR_")) {
      emailjs.init(cfg.publicKey);
      await emailjs.sendForm(cfg.serviceId, cfg.templateId, form);
    }
    form.reset();
    showNotice("contactNotice", "Message received. Partnership desk will respond with next steps.");
  });
}

function initAI() {
  const button = $("#runAiBtn");
  if (!button) return;
  button.addEventListener("click", () => {
    const ph = Number($("#phInput").value || 7.1);
    const turbidity = Number($("#turbidityInput").value || 35);
    const drainage = Number($("#drainageInput").value || 55);
    const rain = Number($("#rainInput").value || 40);
    const contamination = Math.min(98, Math.round((Math.abs(7 - ph) * 14) + turbidity * .7));
    const leak = Math.min(96, Math.round((turbidity * .28) + (rain * .18) + 24));
    const flood = Math.min(99, Math.round((drainage * .62) + (rain * .5)));
    const hygiene = Math.min(99, Math.round((drainage * .35) + (contamination * .45)));
    $("#aiOutput").innerHTML = `
      <div class="grid cols-4">
        <div class="metric"><strong>${contamination}%</strong><span>Contamination prediction</span></div>
        <div class="metric"><strong>${leak}%</strong><span>Leak probability</span></div>
        <div class="metric"><strong>${flood}%</strong><span>Flood-risk detection</span></div>
        <div class="metric"><strong>${hygiene}%</strong><span>Hygiene-risk score</span></div>
      </div>`;
  });
}

function initMap() {
  const target = $("#enuguMap");
  if (!target || !window.L) return;
  const map = L.map("enuguMap").setView([6.46, 7.52], 9);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  const layer = L.layerGroup().addTo(map);
  const render = () => {
    layer.clearLayers();
    const category = $("#categoryFilter").value;
    const severity = $("#severityFilter").value;
    const region = $("#regionFilter").value;
    mapPoints
      .filter((point) => category === "All" || point.type === category)
      .filter((point) => severity === "All" || point.severity === severity)
      .filter((point) => region === "All" || point.region === region)
      .forEach((point) => {
        const color = point.type === "water" ? "#4169E1" : "#173B9B";
        L.circleMarker([point.lat, point.lng], {
          radius: point.severity === "Critical" ? 13 : 10,
          color,
          fillColor: color,
          fillOpacity: .8,
          weight: 2
        }).bindPopup(`<strong>${point.name}</strong><br>${point.category}<br>Severity: ${point.severity}<br>Region: ${point.region}`).addTo(layer);
      });
  };
  $$("#categoryFilter, #severityFilter, #regionFilter").forEach((filter) => filter.addEventListener("change", render));
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  window.ClearFlowStore?.seed();
  initNavigation();
  initReveal();
  initCounters();
  initCharts();
  initReportForm();
  initDashboard();
  initAuth();
  initContactForm();
  initAI();
  initMap();
});
