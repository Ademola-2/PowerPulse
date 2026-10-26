import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


        let isSignUp = false;

        window.addEventListener('DOMContentLoaded', () => {
            if (sessionStorage.getItem('openSigninOnLoad') === 'true') {
                sessionStorage.removeItem('openSigninOnLoad');
                openAuthModal('signin');
            }
        });

        // Escape untrusted text before placing it inside HTML markup.
        window.escapeHTML = function(value) {
            return String(value ?? '').replace(/[&<>"']/g, function(char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        };

        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
            menu.classList.toggle('flex');
        }

        function openAuthModal(mode) {
            isSignUp = (mode === 'signup');
            updateModalUI();
            document.getElementById('auth-modal').classList.remove('hidden');
            document.getElementById('auth-modal').classList.add('flex');
        }

        function closeAuthModal() {
            document.getElementById('auth-modal').classList.remove('flex');
            document.getElementById('auth-modal').classList.add('hidden');
            document.getElementById('auth-error').classList.add('hidden');
        }

        function openProfilesModal() {
            document.getElementById('profiles-modal').classList.remove('hidden');
            document.getElementById('profiles-modal').classList.add('flex');
            if (window.fetchSavedProfiles) {
                window.fetchSavedProfiles();
            }
        }

        function closeProfilesModal() {
            document.getElementById('profiles-modal').classList.remove('flex');
            document.getElementById('profiles-modal').classList.add('hidden');
        }

        function toggleAuthMode() {
            isSignUp = !isSignUp;
            updateModalUI();
        }

        function updateModalUI() {
            const title = document.getElementById('modal-title');
            const submitBtn = document.getElementById('auth-submit-btn');
            const switchText = document.getElementById('auth-switch-text');
            const switchBtn = document.getElementById('auth-switch-btn');
            const nicknameContainer = document.getElementById('nickname-container');

            if (isSignUp) {
                title.textContent = "Create an Account";
                submitBtn.textContent = "Sign Up";
                switchText.textContent = "Already have an account?";
                switchBtn.textContent = "Sign In";
                nicknameContainer.classList.remove('hidden');
                document.getElementById('auth-nickname').required = true;
            } else {
                title.textContent = "Sign In to PowerPulse";
                submitBtn.textContent = "Sign In";
                switchText.textContent = "Don't have an account?";
                switchBtn.textContent = "Sign Up";
                nicknameContainer.classList.add('hidden');
                document.getElementById('auth-nickname').required = false;
            }
        }
    
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
const firebaseConfig = {
            apiKey: "AIzaSyB3uSx_XIxNKbVVgZwEhgUCvkeja-rG_GI",
            authDomain: "powerpulse-71b6f.firebaseapp.com",
            projectId: "powerpulse-71b6f",
            storageBucket: "powerpulse-71b6f.firebasestorage.app",
            messagingSenderId: "950111284695",
            appId: "1:950111284695:web:5fc85221a37d931889ef92"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const googleProvider = new GoogleAuthProvider();

        let currentUser = null;
        let editingProfileId = null;

        window.handleAuthSubmit = async function(e) {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            const nickname = document.getElementById('auth-nickname').value;
            const errorEl = document.getElementById('auth-error');
            errorEl.classList.add('hidden');

            try {
                if (isSignUp) {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    if (nickname) {
                        await updateProfile(userCredential.user, { displayName: nickname });
                    }
                } else {
                    await signInWithEmailAndPassword(auth, email, password);
                }
                closeAuthModal();
            } catch (error) {
                errorEl.textContent = error.message;
                errorEl.classList.remove('hidden');
            }
        }

        window.handleGoogleSignIn = async function() {
            const errorEl = document.getElementById('auth-error');
            errorEl.classList.add('hidden');
            try {
                await signInWithPopup(auth, googleProvider);
                closeAuthModal();
            } catch (error) {
                errorEl.textContent = error.message;
                errorEl.classList.remove('hidden');
            }
        }

        window.logoutUser = async function() {
            await signOut(auth);
            if (window.clearAllAppliances) window.clearAllAppliances();
            sessionStorage.setItem('openSigninOnLoad', 'true');
            window.location.reload();
        }

        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            const navContainer = document.getElementById('auth-nav-container');
            if (user) {
                const displayName = user.displayName || user.email.split('@')[0];
                const safeDisplayName = window.escapeHTML(displayName);
                navContainer.innerHTML = `
                    <div class="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                        <div class="w-6 h-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">${window.escapeHTML(displayName.charAt(0).toUpperCase())}</div>
                        <span class="text-xs font-bold text-slate-800 hidden sm:inline">Hi, ${safeDisplayName}</span>
                    </div>
                    <button onclick="logoutUser()" class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1">
                        <span>Log Out</span>
                    </button>
                `;
            } else {
                navContainer.innerHTML = `
                    <button onclick="openAuthModal('signin')" class="text-slate-700 hover:text-emerald-600 text-sm font-semibold transition">Sign In</button>
                    <button onclick="openAuthModal('signup')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm shadow-emerald-600/20">Get Started</button>
                `;
            }
        });

        window.saveProfileToCloud = async function() {
            if (!currentUser) {
                alert("Please sign in to save your energy profile to the cloud!");
                openAuthModal('signin');
                return;
            }

            if (!window.appliancesList || window.appliancesList.length === 0) {
                alert("Please add at least one appliance before saving.");
                return;
            }

            const statusEl = document.getElementById('save-status');
            const btnEl = document.getElementById('save-cloud-btn');
            const defaultButtonText = "💾 Save Load Profile (Cloud)";
            const isEditing = Boolean(editingProfileId);

            try {
                btnEl.textContent = isEditing ? "Updating Profile..." : "Saving...";
                btnEl.disabled = true;

                if (isEditing) {
                    await updateDoc(doc(db, "energy_profiles", editingProfileId), {
                        appliances: window.appliancesList,
                        updatedAt: serverTimestamp()
                    });
                } else {
                    await addDoc(collection(db, "energy_profiles"), {
                        userId: currentUser.uid,
                        userEmail: currentUser.email,
                        userNickname: currentUser.displayName || currentUser.email.split('@')[0],
                        appliances: window.appliancesList,
                        createdAt: serverTimestamp()
                    });
                }

                editingProfileId = null;
                btnEl.textContent = defaultButtonText;
                btnEl.disabled = false;
                statusEl.textContent = isEditing ? "Profile updated successfully!" : "Profile saved successfully!";
                statusEl.classList.remove('hidden');
                setTimeout(() => statusEl.classList.add('hidden'), 4000);
            } catch (error) {
                alert((isEditing ? "Error updating profile: " : "Error saving profile: ") + (error?.message || "Please try again."));
                btnEl.textContent = editingProfileId ? "Update Saved Profile" : defaultButtonText;
                btnEl.disabled = false;
            }
        };

        window.fetchSavedProfiles = async function() {
            const listEl = document.getElementById('profiles-list');
            listEl.replaceChildren();

            if (!currentUser) {
                const message = document.createElement('p');
                message.className = "text-slate-500 text-sm text-center py-6";
                message.textContent = "Please sign in to view your saved profiles.";
                listEl.appendChild(message);
                return;
            }

            const loadingMessage = document.createElement('p');
            loadingMessage.className = "text-slate-400 text-sm italic text-center py-6";
            loadingMessage.textContent = "Loading profiles...";
            listEl.appendChild(loadingMessage);

            try {
                const q = query(collection(db, "energy_profiles"), where("userId", "==", currentUser.uid));
                const querySnapshot = await getDocs(q);
                listEl.replaceChildren();

                if (querySnapshot.empty) {
                    const emptyMessage = document.createElement('p');
                    emptyMessage.className = "text-slate-500 text-sm text-center py-6";
                    emptyMessage.textContent = "No saved profiles found yet. Save a load profile to see it here!";
                    listEl.appendChild(emptyMessage);
                    return;
                }

                querySnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const appliances = Array.isArray(data.appliances) ? data.appliances : [];
                    const dateStr = data.createdAt?.seconds
                        ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
                        : 'Recent';
                    const totalItems = appliances.length;
                    const totalWh = appliances.reduce((sum, item) => sum + (Number(item.dailyWh) || 0), 0);
                    const totalKwh = (totalWh / 1000).toFixed(2);

                    const card = document.createElement('div');
                    card.className = "bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3";

                    const details = document.createElement('div');
                    details.className = "min-w-0";
                    const dateLabel = document.createElement('span');
                    dateLabel.className = "text-xs font-semibold text-emerald-600 block";
                    dateLabel.textContent = dateStr;

                    const applianceLabel = document.createElement('h4');
                    applianceLabel.className = "font-bold text-slate-900 text-sm";
                    applianceLabel.textContent = `${totalItems} Appliance(s)`;

                    const energyLabel = document.createElement('span');
                    energyLabel.className = "text-xs text-slate-500";
                    energyLabel.textContent = `Total: ${totalKwh} kWh/day`;
                    details.append(dateLabel, applianceLabel, energyLabel);

                    const actions = document.createElement('div');
                    actions.className = "flex flex-wrap gap-2 shrink-0";

                    const loadButton = document.createElement('button');
                    loadButton.type = 'button';
                    loadButton.className = "bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition";
                    loadButton.textContent = 'Load';
                    loadButton.addEventListener('click', () => window.loadProfileData(appliances));

                    const editButton = document.createElement('button');
                    editButton.type = 'button';
                    editButton.className = "bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition";
                    editButton.textContent = 'Edit';
                    editButton.addEventListener('click', () => window.loadProfileData(appliances, docSnap.id));

                    const deleteButton = document.createElement('button');
                    deleteButton.type = 'button';
                    deleteButton.className = "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-2 rounded-xl text-xs font-semibold transition";
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', async () => {
                        if (!window.confirm("Delete this saved energy profile? This cannot be undone.")) return;
                        deleteButton.disabled = true;
                        deleteButton.textContent = 'Deleting...';
                        try {
                            await deleteDoc(doc(db, "energy_profiles", docSnap.id));
                            await window.fetchSavedProfiles();
                        } catch (error) {
                            alert("Error deleting profile: " + (error?.message || "Please try again."));
                            deleteButton.disabled = false;
                            deleteButton.textContent = 'Delete';
                        }
                    });

                    actions.append(loadButton, editButton, deleteButton);
                    card.append(details, actions);
                    listEl.appendChild(card);
                });
            } catch (error) {
                listEl.replaceChildren();
                const errorMessage = document.createElement("p");
                errorMessage.className = "text-red-500 text-xs text-center py-6";
                errorMessage.textContent = `Error loading profiles: ${error?.message || "Please try again."}`;
                listEl.appendChild(errorMessage);
            }
        };

        window.loadProfileData = function(appliancesArray, profileId = null) {
            if (window.setAppliancesList) {
                window.setAppliancesList(appliancesArray);
            }
            editingProfileId = profileId;
            const saveButton = document.getElementById('save-cloud-btn');
            if (saveButton) {
                saveButton.textContent = profileId ? "Update Saved Profile" : "💾 Save Load Profile (Cloud)";
            }
            const statusEl = document.getElementById('save-status');
            if (statusEl) statusEl.classList.add('hidden');
            closeProfilesModal();
        }
    

        let appliances = [];
        window.appliancesList = appliances;

        window.setAppliancesList = function(newList) {
            appliances = newList;
            window.appliancesList = appliances;
            renderTable();
        }

        const form = document.getElementById('appliance-form');
        const tableBody = document.getElementById('appliance-table-body');
        const totalWattsEl = document.getElementById('total-watts');
        const totalKwhEl = document.getElementById('total-kwh');
        const headerTotalKwhEl = document.getElementById('header-total-kwh');
        const recInverterEl = document.getElementById('rec-inverter');
        const recBatteryEl = document.getElementById('rec-battery');

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const watts = parseFloat(document.getElementById('watts').value);
            const qty = parseInt(document.getElementById('qty').value);
            const hours = parseFloat(document.getElementById('hours').value);

            const newItem = {
                id: Date.now(),
                name,
                watts,
                qty,
                hours,
                dailyWh: watts * qty * hours
            };

            appliances.push(newItem);
            window.appliancesList = appliances;
            form.reset();
            document.getElementById('qty').value = '1';
            document.getElementById('hours').value = '5';
            renderTable();
        });

        function clearAll() {
            appliances = [];
            window.appliancesList = appliances;
            renderTable();
        }
        window.clearAllAppliances = clearAll;

        function deleteItem(id) {
            appliances = appliances.filter(item => item.id !== id);
            window.appliancesList = appliances;
            renderTable();
        }

        function renderTable() {
            tableBody.innerHTML = '';

            if (appliances.length === 0) {
                tableBody.innerHTML = `<tr id="empty-row"><td colspan="6" class="p-8 text-center text-slate-400 italic">No appliances added yet. Add items above to begin estimation.</td></tr>`;
                totalWattsEl.textContent = '0 W';
                totalKwhEl.textContent = '0.00 kWh';
                headerTotalKwhEl.textContent = '0.00 kWh';
                recInverterEl.textContent = '0 kVA / kW';
                recBatteryEl.textContent = '0 Ah';
                return;
            }

            let totalWatts = 0;
            let totalWh = 0;

            appliances.forEach(item => {
                totalWatts += (item.watts * item.qty);
                totalWh += item.dailyWh;

                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50/80 transition";
                tr.innerHTML = `
                    <td class="p-4 font-semibold text-slate-900 flex items-center space-x-2">
                        <span>🔌</span>
                        <span>${window.escapeHTML(item.name)}</span>
                    </td>
                    <td class="p-4 text-slate-700">${item.watts} W</td>
                    <td class="p-4 text-slate-700">${item.qty}</td>
                    <td class="p-4 text-slate-700">${item.hours} hrs</td>
                    <td class="p-4 font-bold text-slate-900">${item.dailyWh.toFixed(1)} Wh</td>
                    <td class="p-4 text-center no-print">
                        <button onclick="deleteItem(${item.id})" class="text-red-600 hover:text-white hover:bg-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm">Remove</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            const totalKwh = totalWh / 1000;
            totalWattsEl.textContent = `${totalWatts} W`;
            totalKwhEl.textContent = `${totalKwh.toFixed(2)} kWh`;
            headerTotalKwhEl.textContent = `${totalKwh.toFixed(2)} kWh`;

            const inverterKw = (totalWatts * 1.25) / 1000;
            recInverterEl.textContent = `${inverterKw.toFixed(2)} kVA / kW`;

            const batteryAh = totalWh / 12 / 0.5;
            recBatteryEl.textContent = `${batteryAh.toFixed(0)} Ah @ 12V`;
        }
    

// Expose functions used by inline HTML event handlers.
window.toggleMobileMenu = toggleMobileMenu;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.openProfilesModal = openProfilesModal;
window.closeProfilesModal = closeProfilesModal;
window.toggleAuthMode = toggleAuthMode;
window.clearAll = clearAll;
window.deleteItem = deleteItem;
window.renderTable = renderTable;
