let sessions = [];

// On page load, attempt to load existing sessions from localStorage
const saved = localStorage.getItem("sessions");
if (saved) {
    sessions = JSON.parse(saved);
}