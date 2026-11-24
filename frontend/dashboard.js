
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem('admin_logged_in') !== 'true') {
        window.location.href = 'login.html';
    } else {
        applyRoleRestrictions(); 
        loadAllData();
    }
});

function applyRoleRestrictions() {
    const role = localStorage.getItem('user_role');
    
    if (role === 'Member') {
        document.querySelector('.welcome-text').innerText = "Welcome to Member Dashboard";
        const addAccountCard = document.querySelector('#accounts .card');
        if (addAccountCard) addAccountCard.style.display = 'none';
        const addInstrumentCard = document.querySelector('#instruments .card');
        if (addInstrumentCard) addInstrumentCard.style.display = 'none';
    } else {
        document.querySelector('.welcome-text').innerText = "Welcome to Admin Dashboard";
    }
}

function logout() {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_id');
    localStorage.removeItem('user_role');
    window.location.href = 'login.html';
}

function switchTab(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById('sidebar').classList.remove('active');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function toggleDashDesignation() {
    const role = document.getElementById('dashboard_role').value;
    const designationInput = document.getElementById('dashboard_designation');
    if (role === 'Admin') {
        designationInput.style.display = 'block'; 
        designationInput.required = true; 
    } else {
        designationInput.style.display = 'none'; 
        designationInput.required = false;
        designationInput.value = ''; 
    }
}

function loadAllData() {
    getMembers(); getTeams(); getTeamMembers(); getEvents(); 
    getEventRegistrations(); getAccounts(); getInstruments();
    updateOverviewStats();
}

function updateOverviewStats() {
    fetch('https://miu-club-backend.onrender.com/members').then(r=>r.json()).then(d => document.getElementById('stat-members').innerText = d.length).catch(e=>console.log(e));
    fetch('https://miu-club-backend.onrender.com/teams').then(r=>r.json()).then(d => document.getElementById('stat-teams').innerText = d.length).catch(e=>console.log(e));
    fetch('https://miu-club-backend.onrender.com/events').then(r=>r.json()).then(d => document.getElementById('stat-events').innerText = d.length).catch(e=>console.log(e));
    fetch('https://miu-club-backend.onrender.com/accounts').then(r=>r.json()).then(data => {
        let inc = 0, exp = 0;
        data.forEach(acc => {
            if(acc.transaction_type === 'Income') inc += parseFloat(acc.amount);
            else exp += parseFloat(acc.amount);
        });
        document.getElementById('stat-income').innerText = '৳ ' + inc;
        document.getElementById('stat-expense').innerText = '৳ ' + exp;
        document.getElementById('stat-balance').innerText = '৳ ' + (inc - exp);
    }).catch(e=>console.log(e));
}

function getMembers() {
    fetch('https://miu-club-backend.onrender.com/members')
        .then(res => res.json())
        .then(data => {
            const isAdmin = localStorage.getItem('user_role') === 'Admin';
            let html = `<table><tr><th>ID</th><th>Name</th><th>Role</th><th>Designation</th><th>CF Handle</th><th>Mentor</th>${isAdmin ? '<th>Action</th>' : ''}</tr>`;
            data.forEach(m => {
                let actionBtn = isAdmin ? `<td><button onclick="deleteMember('${m.student_id}')" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px; margin:0;"><i class="fa fa-trash"></i></button></td>` : '';
                let mentorDisplay = m.mentor_name ? `${m.mentor_name}<br><small>(${m.mentor_id})</small>` : 'None';
                html += `<tr><td>${m.student_id}</td><td>${m.first_name} ${m.last_name}</td><td>${m.role}</td><td>${m.designation}</td><td>${m.cf_handle || '-'}</td><td>${mentorDisplay}</td>${actionBtn}</tr>`;
            });
            html += `</table>`;
            document.getElementById('members-container').innerHTML = html;
        });
}

function getTeams() {
    fetch('https://miu-club-backend.onrender.com/teams')
        .then(res => res.json())
        .then(data => {
            const isAdmin = localStorage.getItem('user_role') === 'Admin';
            let html = `<table><tr><th>Team ID</th><th>Team Name</th>${isAdmin ? '<th>Action</th>' : ''}</tr>`;
            data.forEach(t => {
                let actionBtn = isAdmin ? `<td><button onclick="deleteTeam(${t.team_id})" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px; margin:0;"><i class="fa fa-trash"></i></button></td>` : '';
                html += `<tr><td>${t.team_id}</td><td><strong>${t.team_name}</strong></td>${actionBtn}</tr>`;
            });
            html += `</table>`;
            document.getElementById('teams-container').innerHTML = html;
        });
}

function getTeamMembers() {
    fetch('https://miu-club-backend.onrender.com/team-members')
        .then(res => res.json())
        .then(data => {
            let html = `<table><tr><th>Team ID</th><th>Team Name</th><th>Members (Name & ID)</th></tr>`;
            data.forEach(t => html += `<tr><td>${t.team_id}</td><td><strong>${t.team_name}</strong></td><td style="line-height:1.6;">${t.all_members || 'No members'}</td></tr>`);
            html += `</table>`;
            document.getElementById('team-members-container').innerHTML = html;
        });
}

function getEvents() {
    fetch('https://miu-club-backend.onrender.com/events')
        .then(res => res.json())
        .then(data => {
            const isAdmin = localStorage.getItem('user_role') === 'Admin';
            let html = `<table><tr><th>ID</th><th>Title</th><th>Date</th><th>Location</th>${isAdmin ? '<th>Action</th>' : ''}</tr>`;
            data.forEach(e => {
                let d = e.event_date ? e.event_date.substring(0,10) : '-';
                let actionBtn = isAdmin ? `<td><button onclick="deleteEvent(${e.event_id})" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px; margin:0;"><i class="fa fa-trash"></i></button></td>` : '';
                html += `<tr><td>${e.event_id}</td><td><strong>${e.title}</strong></td><td>${d}</td><td>${e.location}</td>${actionBtn}</tr>`;
            });
            html += `</table>`;
            document.getElementById('events-container').innerHTML = html;
        });
}

function getEventRegistrations() {
    fetch('https://miu-club-backend.onrender.com/event-registrations')
        .then(res => res.json())
        .then(data => {
            const isAdmin = localStorage.getItem('user_role') === 'Admin';
            let html = `<table><tr><th>Event</th><th>Registered Team</th><th>Date</th>${isAdmin ? '<th>Action</th>' : ''}</tr>`;
            data.forEach(r => {
                let d = r.participate_date ? r.participate_date.substring(0,10) : '-';
                let actionBtn = isAdmin ? `<td><button onclick="deleteEventRegistration(${r.team_id}, ${r.event_id})" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px; margin:0;"><i class="fa fa-trash"></i></button></td>` : '';
                html += `<tr><td><strong>${r.event_title}</strong></td><td>${r.team_name}</td><td>${d}</td>${actionBtn}</tr>`;
            });
            html += `</table>`;
            document.getElementById('registrations-container').innerHTML = html;
        });
}

function getAccounts() {
    fetch('https://miu-club-backend.onrender.com/accounts')
        .then(res => res.json())
        .then(data => {
            const isAdmin = localStorage.getItem('user_role') === 'Admin';
            let html = `<table><tr><th>ID</th><th>Type</th><th>Amount</th><th>Purpose</th><th>Date</th><th>Handled By</th>${isAdmin ? '<th>Action</th>' : ''}</tr>`;
            data.forEach(a => {
                let color = a.transaction_type === 'Income' ? 'text-success' : 'text-danger';
                let d = a.transaction_date ? a.transaction_date.substring(0,10) : '-';
                let handler = a.first_name ? `${a.first_name} ${a.last_name}` : a.handled_by;
                let actionBtn = isAdmin ? `<td><button onclick="deleteAccount(${a.transaction_id})" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px; margin:0;"><i class="fa fa-trash"></i></button></td>` : '';
                html += `<tr><td>${a.transaction_id}</td><td class="${color}">${a.transaction_type}</td><td>৳ ${a.amount}</td><td>${a.purpose}</td><td>${d}</td><td>${handler}</td>${actionBtn}</tr>`;
            });
            html += `</table>`;
            document.getElementById('accounts-container').innerHTML = html;
        });
}

function getInstruments() {
    fetch('https://miu-club-backend.onrender.com/instruments')
        .then(res => res.json())
        .then(data => {
            const isAdmin = localStorage.getItem('user_role') === 'Admin';
            let html = `<table><tr><th>ID</th><th>Name</th><th>Qty</th><th>Condition</th>${isAdmin ? '<th>Action</th>' : ''}</tr>`;
            data.forEach(i => {
                let actionBtn = isAdmin ? `<td><button onclick="deleteInstrument(${i.instrument_id})" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px; margin:0;"><i class="fa fa-trash"></i></button></td>` : '';
                html += `<tr><td>${i.instrument_id}</td><td><strong>${i.name}</strong></td><td>${i.quantity}</td><td>${i.condition_status}</td>${actionBtn}</tr>`;
            });
            html += `</table>`;
            document.getElementById('instruments-container').innerHTML = html;
        });
}

function handlePost(url, data, formId, reloadFunc) {
    const role = localStorage.getItem('user_role');
    if (role === 'Member' && (formId === 'addAccountForm' || formId === 'addInstrumentForm')) {
        alert("Permission Denied: Members cannot modify Accounts or Instruments.");
        return;
    }
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        document.getElementById(formId).reset();
        if(reloadFunc) reloadFunc();
        updateOverviewStats();
    })
    .catch(err => alert("Error processing request"));
}

function addMember(e) { 
    e.preventDefault(); 
    let role = document.getElementById('dashboard_role').value; 
    let desig = document.getElementById('dashboard_designation').value; 
    if (role === 'Member') desig = 'General Member'; 
    let data = { 
        student_id: document.getElementById('dashboard_student_id').value, 
        first_name: document.getElementById('dashboard_first_name').value, 
        last_name: document.getElementById('dashboard_last_name').value, 
        email: document.getElementById('dashboard_email').value, 
        cf_handle: document.getElementById('dashboard_cf_handle').value, 
        role: role, 
        designation: desig,
        mentor_id: document.getElementById('dashboard_mentor_id').value 
    }; 
    handlePost('https://miu-club-backend.onrender.com/add-member', data, 'addMemberForm', getMembers); 
}
function addTeam(e) { e.preventDefault(); handlePost('https://miu-club-backend.onrender.com/add-team', { team_name: document.getElementById('team_name').value }, 'addTeamForm', getTeams); }
function assignTeamMember(e) { e.preventDefault(); let data = { student_id: document.getElementById('assign_student_id').value, team_id: document.getElementById('assign_team_id').value }; handlePost('https://miu-club-backend.onrender.com/assign-team', data, 'assignTeamForm', getTeamMembers); }
function addEvent(e) { e.preventDefault(); let data = { title: document.getElementById('event_title').value, description: document.getElementById('event_desc').value, event_date: document.getElementById('event_date').value, location: document.getElementById('event_location').value }; handlePost('https://miu-club-backend.onrender.com/add-event', data, 'addEventForm', getEvents); }
function registerTeamEvent(e) { e.preventDefault(); let data = { team_id: document.getElementById('reg_team_id').value, event_id: document.getElementById('reg_event_id').value, participate_date: document.getElementById('reg_date').value }; handlePost('https://miu-club-backend.onrender.com/register-event', data, 'registerEventForm', getEventRegistrations); }
function addAccount(e) { e.preventDefault(); let data = { transaction_type: document.getElementById('acc_type').value, amount: document.getElementById('acc_amount').value, purpose: document.getElementById('acc_purpose').value, transaction_date: document.getElementById('acc_date').value, handled_by: document.getElementById('acc_handled_by').value }; handlePost('https://miu-club-backend.onrender.com/add-account', data, 'addAccountForm', getAccounts); }
function addInstrument(e) { e.preventDefault(); let data = { name: document.getElementById('inst_name').value, quantity: document.getElementById('inst_quantity').value, condition_status: document.getElementById('inst_condition').value, maintained_by: document.getElementById('inst_maintained_by').value }; handlePost('https://miu-club-backend.onrender.com/add-instrument', data, 'addInstrumentForm', getInstruments); }

function deleteRecord(url, reloadFunc) {
    if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;
    
    fetch(url, { method: 'DELETE' })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        if(reloadFunc) reloadFunc();
        updateOverviewStats();
    })
    .catch(err => alert("Error deleting record"));
}

function deleteMember(id) { deleteRecord(`https://miu-club-backend.onrender.com/delete-member/${id}`, getMembers); }
function deleteTeam(id) { deleteRecord(`https://miu-club-backend.onrender.com/delete-team/${id}`, getTeams); }
function deleteEvent(id) { deleteRecord(`https://miu-club-backend.onrender.com/delete-event/${id}`, getEvents); }
function deleteAccount(id) { deleteRecord(`https://miu-club-backend.onrender.com/delete-account/${id}`, getAccounts); }
function deleteInstrument(id) { deleteRecord(`https://miu-club-backend.onrender.com/delete-instrument/${id}`, getInstruments); }
function deleteEventRegistration(teamId, eventId) { deleteRecord(`https://miu-club-backend.onrender.com/delete-event-registration/${teamId}/${eventId}`, getEventRegistrations); }