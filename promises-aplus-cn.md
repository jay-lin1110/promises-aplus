# 【譯文】Promises/A+ 規範

【原文】：[Promises/A+](https://promisesaplus.com/)

**這是一個健全的、可交互的 JavaScript promises 的公開規範——源於開發者，服務開發者。**

一個 Promise 對象一般表示一個異步操作的最終結果。和一個 Promise 對象進行交互的主要方式是通過它的 then 方法，該方法註冊了一些回調函數，用于接收 Promise 對象自己的最終返回值或者 Promise 對象自己執行失敗的原因。

本規範詳細說明了 then 方法的機制，規定了一個所有遵循 Promises/A+ 規範實現的 Promise 都能參照的可交互基準。因此，本規範十分穩定。雖然 Promises/A+ 組織可能偶爾會對本規範進行
