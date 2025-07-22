// ==UserScript==
// @name         Ultimate Enable Translate & Right-Click (v1.4)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  완전 무력화: contenteditable, 데이터 속성, 이벤트 훅, translate 차단 모두 제거
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
        // html[translate], meta[name=google][content=notranslate]
        const html = root.documentElement || root.querySelector('html');
        if (html && html.hasAttribute('translate')) html.removeAttribute('translate');
        root.querySelectorAll('meta[name="google"][content="notranslate"]').forEach(m => m.remove());
        // 클래스 notranslate, 속성 translate="no"
        root.querySelectorAll('.notranslate, [translate="no"]').forEach(el => {
            el.classList.remove('notranslate');
            el.removeAttribute('translate');
        });
    }

    // ─── 3) 스마트 컨텐츠 일반 텍스트화 ───
    function sanitize(el) {
        if (el.hasAttribute('contenteditable')) el.removeAttribute('contenteditable');
        if (el.hasAttribute('data-content-editable-leaf')) el.removeAttribute('data-content-editable-leaf');
        el.oncontextmenu = null;
        el.style.userSelect = 'auto';
        el.style.pointerEvents = 'auto';
        el.style.webkitUserSelect = 'auto';
        // divider → 스페이스
        el.querySelectorAll('i[data-type="sc-text-divider"]').forEach(i => {
            i.replaceWith(document.createTextNode(' '));
        });
        // token span 언랩
        el.querySelectorAll('span[data-type="string-token"]').forEach(span => {
            span.replaceWith(document.createTextNode(span.textContent));
        });
    }

    function processAll() {
        removeTranslateBlockers(document);
        document.querySelectorAll(
            '[inputmode="text"], [contenteditable], [data-content-editable-leaf], .notranslate, [translate="no"]'
        ).forEach(el => sanitize(el));
    }

    // ─── 4) 초기 실행 & 동적 로딩 대응 ───
    window.addEventListener('DOMContentLoaded', processAll);
    new MutationObserver(muts => {
        muts.forEach(m => {
            m.addedNodes.forEach(n => {
                if (n.nodeType === 1) processAll();
            });
        });
    }).observe(document, { childList: true, subtree: true });
})();
