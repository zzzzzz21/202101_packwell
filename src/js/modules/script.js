'use strict'

/**
 * ページ内スクロール
 */
const scrollTrigger = document.querySelectorAll('a[href^="#"]');

for (let i = 0; i < scrollTrigger.length; i++) {
    scrollTrigger[i].addEventListener('click', (e) => {
        e.preventDefault();
        let href = scrollTrigger[i].getAttribute('href');
        let targetElement = document.getElementById(href.replace('#', ''));
        const rect = targetElement.getBoundingClientRect().top;
        const offset = window.pageYOffset;
        // ヘッダーがトップ固定の場合はヘッダーの高さを入れる。
        const gap = 0;
        // 目的の要素の位置
        const target = rect + offset - gap;
        // behaviorでスピードを調整する。
        window.scrollTo({
            top: target,
            behavior: 'smooth',
        });
    })
}