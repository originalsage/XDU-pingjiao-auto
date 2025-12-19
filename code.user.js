// ==UserScript==
// @name         西电评教-单选框+文本框
// @namespace    https://github.com/lilongsheng
// @version      1.3.1
// @description  延续原版单选框逻辑，增强 textarea 填写稳定性
// @author       cursor
// @match        https://ehall.xidian.edu.cn/jwapp/sys/wspjyyapp/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';
    //-------------------------根据需要修改下面内容------------------
    // 文本框自动填写的评语
    const COMMENT = '教学内容充分详实，老师辛苦了';
    // 单选框匹配的关键字 （单选框识别的是关键词，如果无法识别，请加入对应关键字或整个语句）
    const RADIO_KEYWORDS = ['非常满意', '5分', '★★★★★', '5 星', '很满意',
                            '效果显著','能够及时解决','清晰易懂','非常积极',
                            '有效解决','逻辑清晰','符合预期','完全理解',
                            '作用极强','积极且深远'];
    //---------------------------下面代码不用动----------------------
    function fillForm(doc = document) {
        let radioCount = 0, inputCount = 0;

        //单选框逻辑
        doc.querySelectorAll('input[type="radio"]').forEach(radio => {
            let text = '';
            const label = doc.querySelector(`label[for="${radio.id}"]`);
            if (label) {
                text = label.textContent.trim();
            } else {
                const parent = radio.parentElement;
                text = (parent ? parent.innerText : '') + (radio.nextElementSibling ? radio.nextElementSibling.textContent : '');
            }

            if (RADIO_KEYWORDS.some(kw => text.includes(kw)) && !radio.checked) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                radioCount++;
                console.log('已选 radio：', text.trim());
            }
        });

        //增强版 textarea
        doc.querySelectorAll('textarea[name="YLCS"]').forEach(ta => {
            if (!ta.disabled && ta.value.trim() === '') {
                // 第一层：标准写法
                ta.value = COMMENT;
                ta.dispatchEvent(new Event('input', { bubbles: true }));

                // 第二层：触发 change（应对 v-model.lazy）
                ta.dispatchEvent(new Event('change', { bubbles: true }));

                // 第三层：强制 blur（确保失焦更新）
                setTimeout(() => {
                    ta.blur();
                }, 100);

                // 第四层：终极兜底 —— 直接调用 Vue 的 setter（如果存在）
                try {
                    const descriptor = Object.getOwnPropertyDescriptor(ta, 'value');
                    if (descriptor && descriptor.set) {
                        descriptor.set.call(ta, COMMENT);
                    }
                } catch (e) {
                    console.debug('[debug] textarea setter not accessible');
                }

                inputCount++;
                console.log('已填写 YLCS textarea');
            }
        });

        console.log(`[西电评教助手] 完成 勾选 ${radioCount} 项，填写 ${inputCount} 条意见`);
        return { radioCount, inputCount };
    }

    // 主执行
    function runAll() {
        let totalRadio = 0, totalInput = 0;
        const res1 = fillForm();
        totalRadio += res1.radioCount;
        totalInput += res1.inputCount;

        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                const res2 = fillForm(iframe.contentDocument || iframe.contentWindow.document);
                totalRadio += res2.radioCount;
                totalInput += res2.inputCount;
            } catch (e) {
                console.warn('[评教助手] iframe 访问失败', e);
            }
        });

        if (totalRadio === 0 && totalInput === 0) {
            setTimeout(runAll, 800);
        } else {
            setTimeout(() => {
                document.documentElement.scrollTop = document.documentElement.scrollHeight;
            }, 1000);
        }
    }

    setTimeout(runAll, 1000);
    const observer = new MutationObserver(() => {
        if (document.querySelector('input[type="radio"], textarea[name="YLCS"]')) {
            runAll();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();