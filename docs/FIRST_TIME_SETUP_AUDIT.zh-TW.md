# 第一次使用者設定實測紀錄

依官方文件與瀏覽器畫面操作，只把親自完成且核對結果的步驟標為通過。為了不改動既有 Travel-OS，這次使用獨立的公開範本 repository、獨立的 Firebase 專案；既有登入帳戶不能算成「新帳戶註冊通過」。

| 步驟 | 實際結果 | 發現與修正 |
| --- | --- | --- |
| GitHub 註冊 | 未建立新帳戶；使用瀏覽器已登入的另一個 GitHub 帳戶 | 新帳戶的密碼、電子郵件驗證及可能的安全驗證仍需真人完成。精靈與文件提供官方註冊入口。 |
| 從範本建立 repository | 已在另一個帳戶建立獨立範本 repository，啟用 Pages；Actions 的 CI 與 Pages 部署均通過，公開網站可開啟 | GitHub 範本複製的是原 repository 預設分支，不會帶入未合併的 PR；須檢查新網站版本。 |
| Firebase／Google Cloud 專案 | 已用現有 Google 帳戶建立新的獨立 Firebase 專案，並確認 Spark 免費方案 | 建立流程中的 Gemini in Firebase 和 Google Analytics 可能預設開啟；精靈與文件改為提醒可關閉。Firebase 專案會有對應的 Google Cloud 專案。 |
| Web App、Authentication、Realtime Database | 已註冊獨立 Web App、啟用電子郵件／密碼登入，並以鎖定模式建立 Realtime Database；使用者已自行建立登入帳號並發布 Travel OS Rules，控制台確認帳號及規則可見 | 登入後的實際讀寫與權限測試尚未完成；不能把規則已發布當作安全驗證通過。 |
| Google Maps | 依官方 Maps URLs 文件，目前的外部導航不需要 API Key | Step 3 採免 Key 說明，不要求新手建立付費 Maps API。 |
| 網站設定精靈 Steps 1–3 | 已在獨立 GitHub Pages 網站確認網址、貼入新專案 Web config 和 Realtime Database URL，通過格式檢查及免 Key 導航步驟 | 控制台顯示的設定片段含 databaseURL；精靈可接受它與另外貼上的相同資料庫 URL。 |
| 端到端連線與建立旅程 | 尚未通過，目前停在 Step 4 登入 | 帳號密碼由使用者在網站親自輸入；之後仍需完成 Step 5 診斷、建立旅程、重新整理後讀回，以及權限驗證。 |

參考官方文件：[GitHub 註冊](https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github)、[GitHub 範本](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)、[Google 帳戶](https://support.google.com/accounts/answer/27441?hl=zh-hant)、[Firebase 專案與 Google Cloud 的關係](https://firebase.google.com/docs/projects/learn-more)、[Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)。
