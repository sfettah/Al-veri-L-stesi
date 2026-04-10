/**
 * Alışveriş Listesi - app.js
 * Gerçek zamanlı senkronizasyon ve Vanilla JS ile geliştirilmiştir.
 */

// Firebase SDK Modülleri
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    onSnapshot, 
    updateDoc, 
    arrayUnion, 
    arrayRemove, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- FIREBASE YAPILANDIRMASI ---
const firebaseConfig = {
    apiKey: "AIzaSyAAEFic0nHrRZ4ACpqAkYH_4WZnIkSIMmk",
    authDomain: "project-2654166144994017526.firebaseapp.com",
    projectId: "project-2654166144994017526",
    storageBucket: "project-2654166144994017526.firebasestorage.app",
    messagingSenderId: "496498326322",
    appId: "1:496498326322:web:f151b249973f273318352b"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- DURUM YÖNETİMİ ---
let currentListId = null;
let unsubscribe = null;

// --- DOM ELEMENTLERİ ---
const screens = {
    home: document.getElementById('home-screen'),
    create: document.getElementById('create-screen'),
    detail: document.getElementById('detail-screen')
};

const homeElements = {
    btnCreateNew: document.getElementById('btn-create-new'),
    joinCodeInput: document.getElementById('join-code'),
    btnJoin: document.getElementById('btn-join'),
    recentListsSection: document.getElementById('recent-lists-section'),
    recentListsContainer: document.getElementById('recent-lists-container')
};

const createElements = {
    newListNameInput: document.getElementById('new-list-name'),
    btnSubmitCreate: document.getElementById('btn-submit-create'),
    btnBack: document.querySelector('#create-screen .btn-back')
};

const detailElements = {
    btnBack: document.querySelector('#detail-screen .btn-back'),
    displayListName: document.getElementById('display-list-name'),
    displayListCode: document.getElementById('display-list-code'),
    btnCopyCode: document.getElementById('btn-copy-code'),
    btnShareList: document.getElementById('btn-share-list'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    itemNameInput: document.getElementById('item-name'),
    itemQtyInput: document.getElementById('item-qty'),
    btnAddItem: document.getElementById('btn-add-item'),
    activeItemsList: document.getElementById('active-items-list'),
    historyContainer: document.getElementById('history-container'),
    emptyActiveMsg: document.getElementById('empty-active-msg'),
    emptyHistoryMsg: document.getElementById('empty-history-msg')
};

const toast = document.getElementById('toast');

// --- BAŞLANGIÇ ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Event Listeners
    homeElements.btnCreateNew.onclick = () => showScreen('create');
    homeElements.btnJoin.onclick = handleJoinList;
    createElements.btnBack.onclick = () => showScreen('home');
    createElements.btnSubmitCreate.onclick = handleCreateList;
    detailElements.btnBack.onclick = () => {
        if (unsubscribe) unsubscribe();
        showScreen('home');
        loadRecentLists();
    };
    detailElements.btnCopyCode.onclick = copyCode;
    detailElements.btnShareList.onclick = shareList;
    detailElements.btnAddItem.onclick = handleAddItem;

    // Tab switching
    detailElements.tabBtns.forEach(btn => {
        btn.onclick = () => {
            const tabId = btn.dataset.tab;
            detailElements.tabBtns.forEach(b => b.classList.remove('active'));
            detailElements.tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        };
    });

    // Enter key support
    homeElements.joinCodeInput.onkeypress = (e) => e.key === 'Enter' && handleJoinList();
    createElements.newListNameInput.onkeypress = (e) => e.key === 'Enter' && handleCreateList();
    detailElements.itemNameInput.onkeypress = (e) => e.key === 'Enter' && handleAddItem();

    loadRecentLists();

    // URL'de kod varsa otomatik aç
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('list');
    if (code && code.length === 6) {
        openDetail(code);
    }
}

// --- EKRAN YÖNETİMİ ---
function showScreen(screenId) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenId].classList.add('active');
    
    // Clear inputs
    if (screenId === 'create') {
        createElements.newListNameInput.value = '';
    }
    if (screenId === 'home') homeElements.joinCodeInput.value = '';
}

// --- LİSTE İŞLEMLERİ ---

// Yeni Liste Oluştur
async function handleCreateList() {
    let name = createElements.newListNameInput.value.trim();
    
    // Eğer isim boşsa varsayılan isim ata
    if (!name) name = "Yeni Liste";

    showToast('Liste oluşturuluyor...', 0);
    
    try {
        const code = await generateUniqueCode();
        const listRef = doc(db, "lists", code);
        
        const newList = {
            name: name,
            createdAt: serverTimestamp(),
            activeItems: [],
            history: []
        };

        await setDoc(listRef, newList);
        saveToRecent(code, name);
        openDetail(code);
    } catch (error) {
        console.error("Hata Detayı:", error);
        if (error.code === 'permission-denied') {
            showToast('Hata: Firestore izinleri reddedildi. Lütfen kuralları kontrol edin.');
        } else {
            showToast('Bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
        }
    }
}

// Koda Göre Katıl
async function handleJoinList() {
    const code = homeElements.joinCodeInput.value.trim();
    if (code.length !== 6) return showToast('Lütfen 6 haneli kodu girin.');

    showToast('Liste aranıyor...', 0);

    try {
        const listRef = doc(db, "lists", code);
        const listSnap = await getDoc(listRef);

        if (listSnap.exists()) {
            saveToRecent(code, listSnap.data().name);
            openDetail(code);
        } else {
            showToast('Liste bulunamadı. Kodu kontrol edin.');
        }
    } catch (error) {
        console.error("Hata:", error);
        showToast('Bir hata oluştu.');
    }
}

// Detay Sayfasını Aç ve Dinle
function openDetail(code) {
    currentListId = code;
    showScreen('detail');
    
    // URL'yi güncelle (sayfa yenilendiğinde kalması için)
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?list=' + code;
    window.history.pushState({path:newUrl},'',newUrl);

    // Gerçek zamanlı dinleme
    if (unsubscribe) unsubscribe();
    
    unsubscribe = onSnapshot(doc(db, "lists", code), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            renderList(data, code);
        } else {
            showToast('Bu liste artık mevcut değil.');
            showScreen('home');
        }
    }, (error) => {
        console.error("Snapshot hatası:", error);
        showToast('Bağlantı hatası.');
    });
}

// --- UI RENDER ---
function renderList(data, code) {
    detailElements.displayListName.textContent = data.name;
    detailElements.displayListCode.textContent = code;

    // Aktif Ürünler
    detailElements.activeItemsList.innerHTML = '';
    if (data.activeItems.length === 0) {
        detailElements.emptyActiveMsg.classList.remove('hidden');
    } else {
        detailElements.emptyActiveMsg.classList.add('hidden');
        data.activeItems.sort((a, b) => b.addedAt - a.addedAt).forEach(item => {
            const li = document.createElement('li');
            li.className = 'item-row';
            li.innerHTML = `
                <div class="item-checkbox" onclick="markAsPurchased('${item.id}')">
                    <span></span>
                </div>
                <div class="item-info">
                    <div class="name">${item.name}</div>
                    ${item.quantity ? `<div class="qty">${item.quantity}</div>` : ''}
                </div>
                <div class="btn-delete" onclick="deleteItem('${item.id}')">🗑️</div>
            `;
            detailElements.activeItemsList.appendChild(li);
        });
    }

    // Geçmiş
    renderHistory(data.history);
}

function renderHistory(history) {
    detailElements.historyContainer.innerHTML = '';
    if (history.length === 0) {
        detailElements.emptyHistoryMsg.classList.remove('hidden');
        return;
    }
    detailElements.emptyHistoryMsg.classList.add('hidden');

    // Tarihe göre grupla
    const groups = {};
    history.sort((a, b) => b.purchasedAt - a.purchasedAt).forEach(item => {
        const date = new Date(item.purchasedAt);
        const dateStr = formatDateGroup(date);
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(item);
    });

    for (const [dateLabel, items] of Object.entries(groups)) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'history-group';
        groupDiv.innerHTML = `<div class="history-date">${dateLabel}</div>`;
        
        items.forEach(item => {
            const time = new Date(item.purchasedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            const itemDiv = document.createElement('div');
            itemDiv.className = 'history-item';
            itemDiv.innerHTML = `
                <span class="name">${item.name} ${item.quantity ? `(${item.quantity})` : ''}</span>
                <span class="time">${time}</span>
            `;
            groupDiv.appendChild(itemDiv);
        });
        detailElements.historyContainer.appendChild(groupDiv);
    }
}

// --- ÜRÜN İŞLEMLERİ ---

async function handleAddItem() {
    const name = detailElements.itemNameInput.value.trim();
    const qty = detailElements.itemQtyInput.value.trim();
    
    if (!name) return;

    const newItem = {
        id: Date.now().toString(),
        name: name,
        quantity: qty,
        addedAt: Date.now()
    };

    try {
        await updateDoc(doc(db, "lists", currentListId), {
            activeItems: arrayUnion(newItem)
        });
        detailElements.itemNameInput.value = '';
        detailElements.itemQtyInput.value = '';
        detailElements.itemNameInput.focus();
    } catch (error) {
        showToast('Ekleme başarısız.');
    }
}

window.markAsPurchased = async (itemId) => {
    const listRef = doc(db, "lists", currentListId);
    const snap = await getDoc(listRef);
    const data = snap.data();
    const item = data.activeItems.find(i => i.id === itemId);

    if (!item) return;

    const purchasedItem = {
        ...item,
        purchasedAt: Date.now()
    };

    try {
        await updateDoc(listRef, {
            activeItems: arrayRemove(item),
            history: arrayUnion(purchasedItem)
        });
    } catch (error) {
        showToast('İşlem başarısız.');
    }
};

window.deleteItem = async (itemId) => {
    const listRef = doc(db, "lists", currentListId);
    const snap = await getDoc(listRef);
    const data = snap.data();
    const item = data.activeItems.find(i => i.id === itemId);

    if (!item) return;

    try {
        await updateDoc(listRef, {
            activeItems: arrayRemove(item)
        });
    } catch (error) {
        showToast('Silme başarısız.');
    }
};

// --- YARDIMCI FONKSİYONLAR ---

async function generateUniqueCode() {
    let code;
    let exists = true;
    while (exists) {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        const snap = await getDoc(doc(db, "lists", code));
        exists = snap.exists();
    }
    return code;
}

function formatDateGroup(date) {
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay && now.getDate() === date.getDate()) return 'Bugün';
    if (diff < oneDay * 2) return 'Dün';
    
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function showToast(msg, duration = 3000) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    if (duration > 0) {
        setTimeout(() => toast.classList.add('hidden'), duration);
    }
}

function copyCode() {
    const code = detailElements.displayListCode.textContent;
    navigator.clipboard.writeText(code).then(() => showToast('Kod kopyalandı!'));
}

function shareList() {
    const code = currentListId;
    const url = window.location.href;
    if (navigator.share) {
        navigator.share({
            title: 'Alışveriş Listesi',
            text: `Alışveriş listeme katıl! Kod: ${code}`,
            url: url
        });
    } else {
        copyCode();
    }
}

// --- LOCAL STORAGE ---
function saveToRecent(code, name) {
    let recent = JSON.parse(localStorage.getItem('recent_lists') || '[]');
    // Varsa çıkar (en başa eklemek için)
    recent = recent.filter(l => l.code !== code);
    recent.unshift({ code, name, date: Date.now() });
    // Son 5 listeyi tut
    recent = recent.slice(0, 5);
    localStorage.setItem('recent_lists', JSON.stringify(recent));
}

function loadRecentLists() {
    const recent = JSON.parse(localStorage.getItem('recent_lists') || '[]');
    if (recent.length === 0) {
        homeElements.recentListsSection.classList.add('hidden');
        return;
    }

    homeElements.recentListsSection.classList.remove('hidden');
    homeElements.recentListsContainer.innerHTML = '';
    
    recent.forEach(list => {
        const card = document.createElement('div');
        card.className = 'list-card';
        card.onclick = () => openDetail(list.code);
        card.innerHTML = `
            <div class="info">
                <h4>${list.name}</h4>
                <p>${new Date(list.date).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="code">${list.code}</div>
        `;
        homeElements.recentListsContainer.appendChild(card);
    });
}
