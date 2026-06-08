/* ClearFlow Enugu Firebase bridge.
   Replace firebaseConfig with real project credentials to enable live Auth and Firestore.
   Until then, the app runs in localStorage demo mode for judges and offline review. */
window.ClearFlowConfig = {
  firebaseConfig: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  emailJs: {
    publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
    serviceId: "YOUR_EMAILJS_SERVICE_ID",
    templateId: "YOUR_EMAILJS_TEMPLATE_ID"
  }
};

window.ClearFlowStore = (() => {
  const configured = () => {
    const cfg = window.ClearFlowConfig.firebaseConfig;
    return cfg && cfg.apiKey && !cfg.apiKey.startsWith("YOUR_") && window.firebase;
  };

  const demoReports = [
    { id: "CF-2601", name: "Community Monitor", email: "monitor@enugu.gov.ng", phone: "+234 800 000 1010", location: "Abakpa Nike", category: "Blocked drainage", severity: "High", status: "Open", description: "Primary drainage channel blocked after market waste buildup.", createdAt: "2026-03-22T09:30:00.000Z", lat: 6.472, lng: 7.548 },
    { id: "CF-2602", name: "Ada Okeke", email: "ada@example.com", phone: "+234 800 000 1111", location: "Nsukka", category: "Broken borehole", severity: "Medium", status: "In Progress", description: "Solar pump is not drawing water for three streets.", createdAt: "2026-03-23T11:12:00.000Z", lat: 6.856, lng: 7.392 },
    { id: "CF-2603", name: "Health Desk", email: "health@enugu.gov.ng", phone: "+234 800 000 1212", location: "Ogui Road", category: "Dirty water", severity: "Critical", status: "Open", description: "Brown water and diarrhoea symptoms reported around a public tap.", createdAt: "2026-03-24T08:05:00.000Z", lat: 6.452, lng: 7.515 },
    { id: "CF-2604", name: "Udi WASH Lead", email: "wash@udi.ng", phone: "+234 800 000 1313", location: "Udi", category: "Illegal dumping", severity: "Medium", status: "Resolved", description: "Waste hotspot cleared near roadside drainage.", createdAt: "2026-03-25T14:40:00.000Z", lat: 6.315, lng: 7.421 }
  ];

  const seed = () => {
    if (!localStorage.getItem("clearflow_reports")) {
      localStorage.setItem("clearflow_reports", JSON.stringify(demoReports));
    }
    if (!localStorage.getItem("clearflow_users")) {
      localStorage.setItem("clearflow_users", JSON.stringify([
        { id: "USR-001", name: "Admin Demo", email: "admin@clearflow.enugu", role: "Admin" },
        { id: "USR-002", name: "Field Officer", email: "field@clearflow.enugu", role: "Responder" }
      ]));
    }
  };

  const initFirebase = () => {
    if (!configured()) return false;
    if (!firebase.apps.length) firebase.initializeApp(window.ClearFlowConfig.firebaseConfig);
    return true;
  };

  const getReports = async () => {
    seed();
    if (initFirebase()) {
      const snap = await firebase.firestore().collection("reports").orderBy("createdAt", "desc").get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    return JSON.parse(localStorage.getItem("clearflow_reports") || "[]");
  };

  const addReport = async (report) => {
    seed();
    const payload = {
      ...report,
      status: "Open",
      createdAt: new Date().toISOString()
    };
    if (initFirebase()) {
      const doc = await firebase.firestore().collection("reports").add(payload);
      return { id: doc.id, ...payload };
    }
    const reports = await getReports();
    const saved = { id: `CF-${Date.now().toString().slice(-6)}`, ...payload };
    reports.unshift(saved);
    localStorage.setItem("clearflow_reports", JSON.stringify(reports));
    return saved;
  };

  const updateReportStatus = async (id, status) => {
    if (initFirebase()) {
      await firebase.firestore().collection("reports").doc(id).update({ status });
      return;
    }
    const reports = await getReports();
    const next = reports.map((report) => report.id === id ? { ...report, status } : report);
    localStorage.setItem("clearflow_reports", JSON.stringify(next));
  };

  const signIn = async (email, password) => {
    if (initFirebase()) return firebase.auth().signInWithEmailAndPassword(email, password);
    localStorage.setItem("clearflow_session", JSON.stringify({ email, role: email.includes("admin") ? "Admin" : "Reporter" }));
    return { user: { email } };
  };

  const signUp = async (email, password) => {
    if (initFirebase()) return firebase.auth().createUserWithEmailAndPassword(email, password);
    localStorage.setItem("clearflow_session", JSON.stringify({ email, role: "Reporter" }));
    return { user: { email } };
  };

  return { configured, seed, getReports, addReport, updateReportStatus, signIn, signUp };
})();
