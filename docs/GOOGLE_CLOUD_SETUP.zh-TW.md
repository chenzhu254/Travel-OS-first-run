# Google Maps 與 Google Cloud 設定

設定精靈 Step 3 分成三種能力。**外部導航**免 Key；**Google 地點搜尋**可選填 Browser Key；**路程、地址解析、天氣**需將 Server Key 放在自己部署的 Firebase Functions。Browser Key 和 Server Key 不能互換，請勿把 Server Key 貼進網站、GitHub 或網址。

## A. 免 Key：外部導航

不用設定 Google Cloud。新增安排時手動填名稱、地址或 Google Maps 分享連結；在每日行程與「下一個安排」點 Google Maps 即可開啟目的地或停車場。[Maps URL 官方文件](https://developers.google.com/maps/documentation/urls/get-started)

## B. 選填：Google 地點自動完成

1. 在你自己的 [Google Cloud 專案](https://console.cloud.google.com/)中確認 Billing，並於 [API 程式庫](https://console.cloud.google.com/apis/library)啟用 **Maps JavaScript API** 與 **Places API (New)**。若要讓 Firebase 繼續保持 Spark，可用另一個自有 Cloud 專案處理 Maps 計費。各 API 可能收費，請先看[官方定價與配額](https://developers.google.com/maps/billing-and-pricing/overview)。
2. 到 **API 和服務 → 憑證 → 建立憑證 → API 金鑰**。在「應用程式限制」選**網站**，只允許你自己的 Pages 網域或自訂網域；在「API 限制」只選 Maps JavaScript API 與 Places API (New)。依[官方金鑰安全說明](https://developers.google.com/maps/api-security-best-practices)檢查 HTTP referrer，勿加入官方公開體驗站網址。
3. 在自己部署的 Travel OS → **設定 → Step 3** 貼上 Browser Key，Step 5 按驗證。網站只會嘗試載入 Places；這不等於 API 額度與 Billing 全部正確。請新增安排，實際搜尋並選取一個地點。選取後名稱、地址及 Google Maps 連結會自動填入，備註與停車場仍可自己補。
4. 若選了「記住這台裝置」，Browser Key 與 Firebase Web config 會留在**這台裝置的瀏覽器儲存空間**；不保存密碼，不上傳到 Travel OS 作者的資料庫，也不提交到 repository。換 Key 後要重新整理頁面，因為 Maps JavaScript API 每頁只載入一次。

沒有 Key、Key 失效、未啟用 API、網站限制不符或額度不足時，可繼續手動輸入地點；免 Key 外部導航不受影響。[Places 自動完成官方文件](https://developers.google.com/maps/documentation/javascript/place-autocomplete-new) · [錯誤訊息](https://developers.google.com/maps/documentation/javascript/error-messages)

## C. 進階選填：路程、地址解析、天氣

這三個功能呼叫你自己 Firebase 專案的 Cloud Functions；Functions 再使用保存在 Firebase Secret Manager 的 **Server Key** 呼叫 Routes API、Geocoding API 與 Weather API。需要 [Firebase Blaze 方案](https://firebase.google.com/docs/functions/get-started)，Google APIs 也可能產生費用。**僅在你自願啟用、設好預算與配額之後才部署。**

1. 在同一個自有 Google Cloud 專案啟用 **Routes API、Geocoding API、Weather API**，建立**另一把** API Key，API 限制只允許這三項服務；不要拿 Browser Key 作為 Server Key。
2. 在自己的電腦安裝 Node.js 與 Firebase CLI，登入**自己的** Firebase 帳號，在自己建立的 Travel OS repository 執行 `npm ci --prefix functions`。
3. 用 `npx firebase-tools functions:secrets:set GOOGLE_MAPS_SERVER_KEY --project <自己的專案ID>` 輸入 Server Key。互動提示中輸入，不要把 Key 寫入指令、檔案或聊天。依 [Firebase secret 官方文件](https://firebase.google.com/docs/functions/config-env#secret-manager)確認設定。
4. 先執行 `npm run firebase:rules:configure -- --project <自己的專案ID>` 核准唯一部署目標；再執行 `npm run firebase:functions:deploy`。這個指令只部署 `functions`，會再次檢查核准目標；不會操作作者的 Firebase 專案。
5. 返回網站的設定精靈 Step 5 驗證。若顯示 Functions 已部署，在雲端旅程的每日行程按「開車」「步行」或「查看當日天氣」實測。Google Weather 預報只涵蓋未來 10 天；太早或過去的旅程會顯示超出範圍。

伺服器呼叫需 Firebase Authentication 登入，且設有每名使用者與全站的每日呼叫上限；仍須自行在 Google Cloud 設定費用預算、API 配額與監控。沒有部署 Functions 時，網站仍可儲存行程、手動輸入地點及開啟 Google Maps 導航；不會假裝已算出路程或天氣。[Firebase callable Functions 官方文件](https://firebase.google.com/docs/functions/callable) · [Routes API](https://developers.google.com/maps/documentation/routes/compute_route_directions) · [Geocoding API](https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-geocoding) · [Weather API](https://developers.google.com/maps/documentation/weather/daily-forecast)
