
// ============================================
// FACILITY RESERVATION SYSTEM
// LABORATORY 4 - SECTION B
// ============================================

// 1. SUPABASE CONNECTION

const SUPABASE_URL = "https://wtfiswuxljpvmufukusx.supabase.co";
const SUPABASE_KEY = "sb_publishable_k6lyZHj_MZblGC8rW_o0mQ_znTrSyKu";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let currentUser = null;
let currentProfile = null;


// 2. HELPER FUNCTIONS

function showMessage(message, element = "loginMessage") {
    const el = document.getElementById(element);
    if (el) el.textContent = message;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function formatDate(value) {
    return new Date(value).toLocaleString();
}

function setVisible(id, visible) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", !visible);
}


// 3. SIGN UP

async function signup() {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!fullName || !email || !password) {
        showMessage("Please complete all registration fields.");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must contain at least 6 characters.");
        return;
    }

    const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName }
        }
    });

    if (error) {
        showMessage(error.message);
        return;
    }

    showMessage(
        "Registration successful. Verify your email if confirmation is enabled, then log in."
    );
}


// 4. LOGIN

async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showMessage("Enter your email and password.");
        return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        showMessage(error.message);
        return;
    }

    await loadApplication();
}


// 5. LOAD USER AND ROLE

async function loadApplication() {
    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {
        showMessage("Please log in.");
        return;
    }

    currentUser = user;

    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

    if (profileError || !profile) {
        alert("User profile not found. Please contact the administrator.");
        await supabaseClient.auth.signOut();
        return;
    }

    currentProfile = profile;

    setVisible("loginSection", false);
    setVisible("mainSection", true);

    document.getElementById("userName").textContent =
        profile.full_name || user.email;

    document.getElementById("userRole").textContent =
        "Role: " + profile.role;

    applyRolePermissions();

    await loadDashboard();
    await loadFacilities();
    await loadReservations();

    setupDateRestrictions();
}


// 6. ROLE-BASED INTERFACE

function applyRolePermissions() {
    const role = currentProfile.role;

    const isAdmin = role === "Administrator";
    const isStaff = role === "Facility Staff";
    const isRequester = role === "Requester";

    setVisible("approvalNav", isAdmin);
    setVisible("auditNav", isAdmin);
    setVisible("usersNav", isAdmin);

    setVisible("facilityFormArea", isAdmin);
    setVisible("reservationFormArea", isRequester);

    if (isAdmin) {
        loadApprovals();
        loadAuditLogs();
        loadUsers();
    }

    if (isStaff) {
        setVisible("reservationFormArea", false);
    }
}


// 7. PAGE NAVIGATION

function showPage(pageId) {
    const role = currentProfile?.role;

    const adminPages = ["approvals", "audit", "users"];

    if (adminPages.includes(pageId) && role !== "Administrator") {
        alert("Access denied. Administrator only.");
        return;
    }

    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("hidden");
    });

    const selectedPage = document.getElementById(pageId);

    if (!selectedPage) return;

    selectedPage.classList.remove("hidden");

    if (pageId === "approvals") loadApprovals();
    if (pageId === "audit") loadAuditLogs();
    if (pageId === "users") loadUsers();
    if (pageId === "facilities") loadFacilities();
    if (pageId === "reservations") loadReservations();
}


// 8. DASHBOARD

async function loadDashboard() {
    const { data: facilities, error: facilityError } =
        await supabaseClient
            .from("facilities")
            .select("id");

    if (facilityError) {
        alert(facilityError.message);
        return;
    }

    let reservationQuery = supabaseClient
        .from("reservations")
        .select("id,status");

    if (currentProfile.role === "Requester") {
        reservationQuery = reservationQuery.eq(
            "user_id",
            currentUser.id
        );
    }

    const { data: reservations, error } = await reservationQuery;

    if (error) {
        alert(error.message);
        return;
    }

    document.getElementById("totalFacilities").textContent =
        facilities?.length || 0;

    document.getElementById("totalReservations").textContent =
        reservations.length;

    document.getElementById("pendingReservations").textContent =
        reservations.filter(r => r.status === "Pending").length;

    document.getElementById("approvedReservations").textContent =
        reservations.filter(r =>
            ["Approved", "Scheduled", "In Use"].includes(r.status)
        ).length;
}


// 9. ADD FACILITY - ADMINISTRATOR

async function addFacility() {
    if (currentProfile?.role !== "Administrator") {
        alert("Administrator permission required.");
        return;
    }

    const name = document.getElementById("facilityName").value.trim();
    const location = document.getElementById("facilityLocation").value.trim();
    const capacity = Number(
        document.getElementById("facilityCapacity").value
    );

    const description =
        document.getElementById("facilityDescription").value.trim();

    const status = document.getElementById("facilityStatus").value;

    if (!name || !location ||
        !Number.isInteger(capacity) || capacity < 1) {
        alert("Enter a valid facility name, location, and capacity.");
        return;
    }

    const { error } = await supabaseClient
        .from("facilities")
        .insert([{
            name,
            location,
            capacity,
            description,
            status
        }]);

    if (error) {
        alert(error.message);
        return;
    }

    alert("Facility added successfully.");

    document.getElementById("facilityName").value = "";
    document.getElementById("facilityLocation").value = "";
    document.getElementById("facilityCapacity").value = "";
    document.getElementById("facilityDescription").value = "";

    await loadFacilities();
    await loadDashboard();
}


// 10. DISPLAY FACILITIES

async function loadFacilities() {
    const { data, error } = await supabaseClient
        .from("facilities")
        .select("*")
        .order("id");

    if (error) {
        alert(error.message);
        return;
    }

    const table = document.getElementById("facilityTable");
    const select = document.getElementById("reservationFacility");

    table.innerHTML = "";
    select.innerHTML = '<option value="">Select Facility</option>';

    data.forEach(facility => {
        table.innerHTML += `
            <tr>
                <td>${facility.id}</td>
                <td>${escapeHTML(facility.name)}</td>
                <td>${escapeHTML(facility.location)}</td>
                <td>${facility.capacity}</td>
                <td>${escapeHTML(facility.status)}</td>
            </tr>
        `;

        if (facility.status === "Active") {
            select.innerHTML += `
                <option value="${facility.id}">
                    ${escapeHTML(facility.name)}
                </option>
            `;
        }
    });
}

// 11. SUBMIT RESERVATION - REQUESTER

async function submitReservation() {
    if (currentProfile?.role !== "Requester") {
        alert("Only Requesters can submit reservations.");
        return;
    }

    const facilityId =
        document.getElementById("reservationFacility").value;

    const purpose =
        document.getElementById("reservationPurpose").value.trim();

    const startInput =
        document.getElementById("startTime").value;

    const endInput =
        document.getElementById("endTime").value;

    if (!facilityId || !purpose || !startInput || !endInput) {
        alert("Please complete all reservation fields.");
        return;
    }

    // Convert selected date and time
    const start = new Date(startInput);
    const end = new Date(endInput);
    const now = new Date();

    // Check valid dates
    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        alert("Please select valid dates and times.");
        return;
    }

    // Start must be in the future
    if (start.getTime() <= now.getTime()) {
        alert("Please choose a future reservation start time.");
        return;
    }

    // End must be later than start
    if (end.getTime() <= start.getTime()) {
        alert("End time must be later than start time.");
        return;
    }

    // Save reservation
    const { error } = await supabaseClient
        .from("reservations")
        .insert([{
            user_id: currentUser.id,
            facility_id: Number(facilityId),
            purpose: purpose,
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            status: "Pending"
        }]);

    if (error) {
        alert("Reservation failed: " + error.message);
        return;
    }

    alert("Reservation submitted successfully as Pending.");

    // Clear form
    document.getElementById("reservationFacility").value = "";
    document.getElementById("reservationPurpose").value = "";
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";

    setupDateRestrictions();

    await loadReservations();
    await loadDashboard();
}


// 12. DISPLAY RESERVATIONS

async function getProfileNames(reservations) {
    const userIds = [
        ...new Set(reservations.map(r => r.user_id).filter(Boolean))
    ];

    if (userIds.length === 0) return {};

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

    if (error) {
        console.error("Profile error:", error.message);
        return {};
    }

    const names = {};

    data.forEach(profile => {
        names[profile.id] = profile.full_name;
    });

    return names;
}
async function loadReservations() {
    let query = supabaseClient
        .from("reservations")
        .select(`
            *,
            facilities(name)
        `)
        .order("created_at", { ascending: false });

    if (currentProfile.role === "Requester") {
        query = query.eq("user_id", currentUser.id);
    }

    const { data, error } = await query;

    if (error) {
        alert(error.message);
        return;
    }

    const profileNames = await getProfileNames(data);

    const table = document.getElementById("reservationTable");
    table.innerHTML = "";

    data.forEach(r => {
        let actions = "";

        if (
            currentProfile.role === "Requester" &&
            r.status === "Pending"
        ) {
            actions = `
                <button onclick="cancelReservation(${r.id})">
                    Cancel
                </button>
            `;
        }

        if (
            currentProfile.role === "Administrator" &&
            r.status === "Approved"
        ) {
            actions = `
                <button onclick="scheduleReservation(${r.id})">
                    Schedule
                </button>
            `;
        }

        if (
            currentProfile.role === "Facility Staff" &&
            r.status === "Scheduled"
        ) {
            actions = `
                <button onclick="changeStatus(${r.id}, 'In Use')">
                    Start Usage
                </button>
            `;
        }

        if (
            currentProfile.role === "Facility Staff" &&
            r.status === "In Use"
        ) {
            actions = `
                <button onclick="changeStatus(${r.id}, 'Completed')">
                    Complete
                </button>
            `;
        }

        table.innerHTML += `
            <tr>
                <td>${r.id}</td>
                <td>${escapeHTML(r.facilities?.name || "Unknown")}</td>
                <td>${escapeHTML(profileNames[r.user_id] || "Requester")}</td>
                <td>${escapeHTML(r.purpose)}</td>
                <td>${formatDate(r.start_time)}</td>
                <td>${formatDate(r.end_time)}</td>
                <td>${escapeHTML(r.status)}</td>
                <td>${actions}</td>
            </tr>
        `;
    });
}


// 13. ADMIN APPROVALS

async function loadApprovals() {
    if (currentProfile.role !== "Administrator") return;

    const { data, error } = await supabaseClient
        .from("reservations")
        .select(`
            *,
            facilities(name)
        `)
        .eq("status", "Pending")
        .order("created_at");

    if (error) {
        alert(error.message);
        return;
    }

    const profileNames = await getProfileNames(data);

    const table = document.getElementById("approvalTable");
    table.innerHTML = "";

    data.forEach(r => {
        table.innerHTML += `
            <tr>
                <td>${r.id}</td>
                <td>${escapeHTML(profileNames[r.user_id] || "Requester")}</td>
                <td>${escapeHTML(r.facilities?.name || "Unknown")}</td>
                <td>${escapeHTML(r.purpose)}</td>
                <td>${formatDate(r.start_time)}</td>
                <td>
                    <button onclick="approveReservation(${r.id})">
                        Approve
                    </button>

                    <button class="logout"
                        onclick="rejectReservation(${r.id})">
                        Reject
                    </button>
                </td>
            </tr>
        `;
    });
}

// 14. APPROVE RESERVATION

async function approveReservation(id) {
    if (currentProfile.role !== "Administrator") {
        alert("Only Administrator can approve reservations.");
        return;
    }

    const { error } = await supabaseClient
        .from("reservations")
        .update({ status: "Approved" })
        .eq("id", id)
        .eq("status", "Pending");

    if (error) {
        alert("Approval failed: " + error.message);
        return;
    }

    alert("Reservation approved successfully.");

    await refreshData();
}


// 15. REJECT RESERVATION

async function rejectReservation(id) {
    if (currentProfile.role !== "Administrator") {
        alert("Only Administrator can reject reservations.");
        return;
    }

    const remarks = prompt("Enter rejection reason:");

    if (remarks === null || !remarks.trim()) {
        alert("Please enter a rejection reason.");
        return;
    }

    const { error } = await supabaseClient
        .from("reservations")
        .update({
            status: "Rejected",
            remarks: remarks.trim()
        })
        .eq("id", id)
        .eq("status", "Pending");

    if (error) {
        alert("Rejection failed: " + error.message);
        return;
    }

    alert("Reservation rejected.");

    await refreshData();
}


// 16. ADMIN SCHEDULES APPROVED RESERVATION

async function scheduleReservation(id) {
    if (currentProfile.role !== "Administrator") {
        alert("Administrator permission required.");
        return;
    }

    const { error } = await supabaseClient
        .from("reservations")
        .update({ status: "Scheduled" })
        .eq("id", id)
        .eq("status", "Approved");

    if (error) {
        alert("Scheduling failed: " + error.message);
        return;
    }

    alert("Reservation successfully scheduled.");

    await refreshData();
}


// 17. CANCEL OWN RESERVATION

async function cancelReservation(id) {
    if (currentProfile.role !== "Requester") {
        alert("Requester permission required.");
        return;
    }

    if (!confirm("Are you sure you want to cancel this reservation?")) {
        return;
    }

    const { error } = await supabaseClient
        .from("reservations")
        .update({ status: "Cancelled" })
        .eq("id", id)
        .eq("user_id", currentUser.id)
        .eq("status", "Pending");

    if (error) {
        alert("Cancellation failed: " + error.message);
        return;
    }

    alert("Reservation cancelled successfully.");

    await refreshData();
}


// 18. FACILITY STAFF STATUS UPDATE

async function changeStatus(id, status) {
    if (currentProfile.role !== "Facility Staff") {
        alert("Facility Staff permission required.");
        return;
    }

    if (!["In Use", "Completed"].includes(status)) {
        alert("Invalid status.");
        return;
    }

    const { error } = await supabaseClient
        .from("reservations")
        .update({ status })
        .eq("id", id);

    if (error) {
        alert("Status update failed: " + error.message);
        return;
    }

    alert("Reservation status updated successfully.");

    await refreshData();
}


// 19. DATE AND TIME PICKER RESTRICTIONS

function toLocalDateTimeValue(date) {
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60000)
        .toISOString()
        .slice(0, 16);
}

function setupDateRestrictions() {
    const startInput = document.getElementById("startTime");
    const endInput = document.getElementById("endTime");

    if (!startInput || !endInput) return;

    // Start must be at least one minute from now
    const minimumStart = new Date();
    minimumStart.setMinutes(minimumStart.getMinutes() + 1);

    startInput.min = toLocalDateTimeValue(minimumStart);

    // End must be later than selected start
    if (startInput.value) {
        const minimumEnd = new Date(startInput.value);

        minimumEnd.setMinutes(minimumEnd.getMinutes() + 1);

        endInput.min = toLocalDateTimeValue(minimumEnd);
    } else {
        endInput.min = startInput.min;
    }
}
