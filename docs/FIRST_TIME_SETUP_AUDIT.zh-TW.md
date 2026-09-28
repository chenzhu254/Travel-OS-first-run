# 第一次使用者設定實測紀錄

依官方文件與瀏覽器畫面操作，只把親自完成且核對結果的步驟標為通過。為了不改動既有 Travel-OS，這次使用獨立的公開範本 repository、獨立的 Firebase 專案；既有登入帳戶不能算成「新帳戶註冊通過」。

| 步驟 | 實際結果 | 發現與修正 |
| --- | --- | --- |
| GitHub 註冊 | 未建立新帳戶；使用瀏覽器已登入的另一個 GitHub 帳戶 | 新帳戶的密碼、電子郵件驗證及可能的安全驗證仍需真人完成。精靈與文件提供官方註冊入口。 |
| 從範本建立 repository | 已在另一個帳戶建立獨立範本 repository，啟用 Pages；Actions 的 CI 與 Pages 部署均通過，公開網站可開啟 | GitHub 範本複製的是原 repository 預設分支，不會帶入未合併的 PR；須檢查新網站版本。 |
| Firebase／Google Cloud 專案 | 已用現有 Google 帳戶建立新的獨立 Firebase 專案，並確認 Spark 免費方案 | 建立流程中的 Gemini in Firebase 和 Google Analytics 可能預設開啟；精靈與文件改為提醒可關閉。Firebase 專案會有對應的 Google Cloud 專案。 |
| Web App、Authentication、Realtime Database | 已註冊獨立 Web App、啟用電子郵件／密碼登入，並以鎖定模式建立 Realtime Database | 新登入帳號需要設定密碼，由真人操作；Rules 的發布與登入後實測另行記錄，不以建庫成功代替。 |
| Google Maps | 依官方 Maps URLs 文件，目前的外部導航不需要 API Key | Step 3 採免 Key 說明，不要求新手建立付費 Maps API。 |
| 端到端連線與建立旅程 | 尚未通過 | 等待新 Firebase 登入帳號與 Rules 設定完成後，仍需在網站完成 Steps 3–6、連線診斷、建立旅程、重新整理後讀回，以及權限驗證。 |

參考官方文件：[GitHub 註冊](https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github)、[GitHub 範本](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)、[Google 帳戶](https://support.google.com/accounts/answer/27441?hl=zh-hant)、[Firebase 專案與 Google Cloud 的關係](https://firebase.google.com/docs/projects/learn-more)、[Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)。
