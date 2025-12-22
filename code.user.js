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
    // 文本框自动填写的评语池（每次随机选择一条）
    const COMMENT_POOL = [
        '教学内容充分详实，老师辛苦了',
        '授课条理清晰，知识点讲解到位',
        '积极互动，能引导学生思考',
        '作业与考试覆盖合理，帮助巩固',
        '课堂氛围好，满意度高，感谢老师',
        '讲解深入浅出，案例丰富，易于理解',
        '板书规范，结构清晰，逻辑性强',
        '能把复杂问题拆解成简单步骤，受益良多',
        '课件准备充分，资料更新及时',
        '课堂氛围活跃，鼓励学生提问和讨论',
        '作业反馈及时且有建设性意见',
        '评分标准公平，能反映学习成果',
        '教学方法多样，兼顾不同层次学生',
        '答疑耐心细致，能够针对性解决问题',
        '授课节奏把握好，知识点突出重点明确',
        '注重能力培养，注重实践与理论结合',
        '课堂示范与互动结合，提升学习效果',
        '有责任心，备课充分，表现专业',
        '鼓励创新思维，拓展学习视野',
        '与学生沟通顺畅，关注学习进展',
        '引入现实案例，增强课程实用性',
        '讲评作业时指出典型问题并给出建议',
        '课程难度适中，兼顾基础与拓展',
        '教学态度认真，教学效果明显'
    ];
    // 单选框匹配的关键字 （单选框识别的是关键词，如果无法识别，请加入对应关键字或整个语句）
    const RADIO_KEYWORDS = ['非常满意', '5分', '★★★★★', '5 星', '很满意',
        '效果显著', '能够及时解决', '清晰易懂', '非常积极',
        '有效解决', '逻辑清晰', '符合预期', '完全理解',
        '作用极强', '积极且深远', '比较合理，以结果考核为主，过程性评价有涉及但权重不足，但总体能接受',
        '遇到问题时老师能快速回应并针对性指导，同学协作中能互补学习，共同解决问题 ',
        '批改细致，反馈针对性强，能明确指出问题并提供改进方向 ',
        '指导非常及时，能主动巡视并发现问题，讲解清晰，能彻底解决疑问 ',
        '能操作课程要求的基础仪器，但对精密或复杂设备仍不熟悉',
        '实验实践内容能精准呼应理论知识',
        '设施完善且安全，能保障实验顺利开展，提升实验体验',
        '非常符合，难度适中，既能巩固理论知识',
        '能独立、快速且规范完成所有操作，还能发现步骤中的优化空间'];
    //---------------------------下面代码不用动----------------------
    // 从评论池随机选择一条（抽象函数，便于复用和单元测试）
    function getRandomComment(pool, fallback = '教学内容充分详实，老师辛苦了') {
        if (Array.isArray(pool) && pool.length)
            return pool[Math.floor(Math.random() * pool.length)];
        return fallback;
    }
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
                // 随机从评论池选一条
                const comment = getRandomComment(COMMENT_POOL);

                // 第一层：标准写法
                ta.value = comment;
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
                        descriptor.set.call(ta, comment);
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
