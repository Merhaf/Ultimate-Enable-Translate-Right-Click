// ==UserScript==
// @name         Enable Translate & Right-Click Only (v1.5)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  contenteditable은 유지하되, 우클릭/번역 제한만 해제 (스마트 텍스트 언랩 제거됨)
// @author       ChatGPT
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // ─── 1) PreventDefault 훅 복원 & contextmenu 캡처 단계 해제 ───
    try {
        const _pd = Event.prototype.preventDefault;
        Event.prototype.preventDefault = function() { return _pd.call(this); };
        document.addEventListener('contextmenu', e => e.stopImmediatePropagation(), { capture: true });
    } catch (e) { console.error(e); }

    // ─── 2) 번역 차단 메타/속성/클래스 제거 ───
    function removeTranslateBlockers(root = document) {
        const html = root.documentElement || root.querySelector('html');
        if (html && html.hasAttribute('translate')) html.removeAttribute('translate');
        root.querySelectorAll('meta[name="google"][content="notranslate"]').forEach(m => m.remove());
        root.querySelectorAll('.notranslate, [translate="no"]').forEach(el => {
            el.classList.remove('notranslate');
            el.removeAttribute('translate');
        });
    }

    function processAll() {
        removeTranslateBlockers(document);
    }

    // ─── 3) 초기 실행 & 동적 로딩 대응 ───
    window.addEventListener('DOMContentLoaded', processAll);
    new MutationObserver(muts => {
        muts.forEach(m => {
            m.addedNodes.forEach(n => {
                if (n.nodeType === 1) processAll();
            });
        });
    }).observe(document, { childList: true, subtree: true });
})();
