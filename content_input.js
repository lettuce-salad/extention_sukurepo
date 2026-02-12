// content_input.js - コメント自動保存

// 2026/02/12 作成 

function setupInput(page, textarea) {
    const lessonKey = getLessonKey();
    if (!lessonKey) return;

    // --- textarea 入力時の自動保存（debounce） ---
    if (!textarea.dataset.extAutoSave) {
        textarea.dataset.extAutoSave = "true";

        let timer;
        textarea.addEventListener("input", () => {
            clearTimeout(timer);
            timer = setTimeout(async () => {
                const value = textarea.value;
                if (!value.trim()) return;

                const lessonHash = await hashString(lessonKey);
                safeStorageSet({
                    lastComment: { lessonHash, value }
                });
            }, 500);
        });
    }

    // --- ボタンクリック時の保存 ---
    const buttons = page.querySelectorAll(
        'a[href*="teachers_report/t_daily_report#dialog1"]'
    );
    if (!buttons.length) return;

    buttons.forEach((button) => {
        if (button.dataset.extBound) return;
        button.dataset.extBound = "true";

        button.addEventListener("click", async () => {
            const value = textarea.value;
            if (!value.trim()) return;

            const lessonHash = await hashString(lessonKey);
            safeStorageSet({
                lastComment: { lessonHash, value }
            });

            // ここに追記していく
        });
    });
}

function initInput(page) {
    if (!isTargetPage(page)) return;

    // 既に textarea があればすぐセットアップ
    const textarea = page.querySelector("#com_teacher");
    if (textarea) {
        setupInput(page, textarea);
        return;
    }

    // まだなければ MutationObserver で待つ
    const observer = new MutationObserver(() => {
        const ta = page.querySelector("#com_teacher");
        if (ta) {
            observer.disconnect();
            setupInput(page, ta);
        }
    });
    observer.observe(page, { childList: true, subtree: true });
}

// 今後の pagecreate に対応
document.addEventListener("pagecreate", (e) => initInput(e.target));

// 既に存在するページにも対応
document.querySelectorAll('[data-role="page"]').forEach(initInput);