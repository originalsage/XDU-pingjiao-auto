# 🎓 西电评教一键完成脚本（Tampermonkey）

> 适用于西安电子科技大学 [ehall 评教系统](https://ehall.xidian.edu.cn/jwapp/sys/wspjyyapp/)  
> ✅ 自动勾选 **"非常满意"**  
> ✅ 自动填写评语 **"老师辛苦了"**  
> ✅ 兼容新版伪单选框（基于 `data-x-dafxsm` 精准识别）  
> ✅ 无需手动操作，1 秒完成整页评教 🚀

## 🛠 使用前提

- 浏览器：Chrome / Edge / Firefox  
- 已安装 [Tampermonkey 扩展](https://www.tampermonkey.net/)  
- 已登录西电统一身份认证（进入评教页面）
- 注意：脚本通过关键词识别单选框选项，如果无法正确识别请参考脚本源码中的 `RADIO_KEYWORDS` 数组，并根据实际情况添加相应的关键词或完整语句

---

## 🔧 安装步骤

1. 点击 → [**安装脚本**](https://github.com/lilongsheng/xidian-pingjiao/raw/main/xidian-pingjiao.user.js)（需先保存 `.user.js` 文件到本项目）
   > 或手动新建脚本：  
   > - Tampermonkey 图标 → “创建新脚本”  
   > - 粘贴下方 [脚本源码](#-脚本源码)

2. 打开评教页面：  