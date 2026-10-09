# 免費 Google Maps 導航（不需要 Google Cloud）

Travel OS 全流程以 Firebase **Spark** 為基準。不建立 Google API 金鑰、不連結計費帳戶、不部署 Cloud Functions。天氣功能已移除，包含自動預報與外部查詢入口。

## 設定精靈 Step 3

直接按「下一步」。Google Maps URL 不需要 API key：[Google 官方文件](https://developers.google.com/maps/documentation/urls/get-started)。

1. 新增安排時手動輸入名稱、地址。
2. 可從 Google Maps 複製分享連結，貼到「Google Maps 連結」，精確指定目的地。
3. 主要及備用停車場分別設定名稱、地圖連結及備註。
4. 每日行程與下一個安排顯示目的地、備註及停車資訊。
5. 相鄰安排提供「Google Maps 開車路線」與「Google Maps 步行路線」；在 Google Maps 查看時間、距離與導航。

網站不嵌入 Maps JavaScript API、不提供 Places 自動完成、不自動呼叫地址解析或路線計算 API。連結只在使用者點擊後開啟外部網站；使用者輸入的起點、目的地會傳給 Google Maps。

## 免費的範圍與限制

程式採 MIT 授權；GitHub Pages 公開 repo 與 Firebase Spark 可不用付款資料完成部署、Email／密碼登入及旅程同步。Spark 有容量、連線與流量等額度限制，並非無限使用；達到服務限制時可能無法同步。保留本機模式與 JSON 備份，無需升級 Blaze。

請在 Firebase 控制台確認方案為 Spark；前端不能可靠查證帳單方案。若原本已連結 Billing，必須由專案擁有者檢查方案與既有雲端資源；此網站不會變更計費、刪除帳戶或取消既有服務。

[Firebase 官方 Spark 說明](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) · [Firebase 官方配額與定價](https://firebase.google.com/pricing)
