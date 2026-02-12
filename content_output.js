// content_output.js - 保存済みコメントの復元

// 2026/02/12 作成 

async function restoreComment(textarea) {
    // 多重実行防止
    if (textarea.dataset.extRestored) return;
    textarea.dataset.extRestored = "true";

    const lessonKey = getLessonKey();
    if (!lessonKey) return;

    const lessonHash = await hashString(lessonKey);

    safeStorageGet("lastComment", ({ lastComment }) => {
        if (!lastComment) return;
        if (lastComment.lessonHash !== lessonHash) return;

        // サイト側のJSが textarea を設定し終わるのを待ってから復元
        // 段階的にリトライ（500ms, 1000ms, 2000ms）
        const delays = [500, 1000, 2000];
        let attempt = 0;

        function tryRestore() {
            // サイト側が値を設定済みならスキップ
            if (textarea.value.trim()) return;

            textarea.value = lastComment.value;
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
            textarea.dispatchEvent(new Event("change", { bubbles: true }));

            // 復元後にサイト側に上書きされたかチェック
            if (attempt < delays.length) {
                setTimeout(() => {
                    if (textarea.value !== lastComment.value && !textarea.value.trim()) {
                        attempt++;
                        tryRestore();
                    }
                }, delays[attempt]);
            }
        }

        // 初回は少し待ってから実行
        setTimeout(tryRestore, delays[attempt]);
    });
}

function initOutput(page) {
    if (!isTargetPage(page)) return;

    // 既に textarea があればすぐ復元
    const textarea = page.querySelector("#com_teacher");
    if (textarea) {
        restoreComment(textarea);
        return;
    }

    // まだなければ MutationObserver で待つ
    const observer = new MutationObserver(() => {
        const ta = page.querySelector("#com_teacher");
        if (ta) {
            observer.disconnect();
            restoreComment(ta);
        }
    });
    observer.observe(page, { childList: true, subtree: true });
}

// 今後の pagecreate に対応
document.addEventListener("pagecreate", (e) => initOutput(e.target));

// 既に存在するページにも対応
document.querySelectorAll('[data-role="page"]').forEach(initOutput);