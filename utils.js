// utils.js - 共通ユーティリティ

// 2026/02/12 作成 

function normalizeName(name) {
    return name
        .replace(/さん$/, "")
        .normalize("NFKC")
        .replace(/\s+/g, "")
        .toLowerCase();
}

async function hashString(str) {
    const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(str)
    );
    return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

function getTableValue(label) {
    const table = document.getElementById("names");
    if (!table) return null;

    for (const row of table.querySelectorAll("tr")) {
        const cells = row.querySelectorAll("td");
        if (cells.length < 2) continue;
        if (cells[0].textContent.trim() === label) {
            return cells[1].textContent.trim();
        }
    }
    return null;
}

function getStudentName() {
    return getTableValue("生徒名");
}

// 名前+授業日+授業時間 を結合してハッシュ用キーを生成
function getLessonKey() {
    const name = getStudentName();
    const date = getTableValue("授業日");
    const time = getTableValue("授業時間");
    if (!name || !date || !time) return null;
    return normalizeName(name) + date + time;
}

function isTargetPage(page) {
    return !!page.closest('#MAIN_FRAME[data-role="content"]');
}

// chrome.storage のラッパー（Extension context invalidated 対策）
function safeStorageSet(data) {
    try {
        chrome.storage.local.set(data);
    } catch (e) {
        console.debug("[スクレポ拡張] storage書き込み失敗。ページをリロードしてください。", e);
    }
}

function safeStorageGet(key, callback) {
    try {
        chrome.storage.local.get(key, callback);
    } catch (e) {
        console.debug("[スクレポ拡張] storage読み込み失敗。ページをリロードしてください。", e);
    }
}