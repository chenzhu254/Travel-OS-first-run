> 2026-10-09 最新基準：僅 Spark 免費設定、免 Key 地圖與路線；完整移除天氣，舊付費 API 驗證不再適用。見 ADR-006。

# 第一次使用者設定實測紀錄

依官方文件與瀏覽器畫面操作，只把親自完成且核對結果的步驟標為通過。為了不改動既有 Travel-OS，這次使用獨立的公開範本 repository、獨立的 Firebase 專案；既有登入帳戶不能算成「新帳戶註冊通過」。

| 步驟 | 實際結果 | 發現與修正 |
| --- | --- | --- |
| GitHub 註冊 | 未建立新帳戶；使用瀏覽器已登入的另一個 GitHub 帳戶 | 新帳戶的密碼、電子郵件驗證及可能的安全驗證仍需真人完成。精靈與文件提供官方註冊入口。 |
| 從範本建立 repository | 已在另一個帳戶建立獨立範本 repository，啟用 Pages；Actions 的 CI 與 Pages 部署均通過，公開網站可開啟 | GitHub 範本複製的是原 repository 預設分支，不會帶入未合併的 PR；須檢查新網站版本。 |
| Firebase／Google Cloud 專案 | 已用現有 Google 帳戶建立新的獨立 Firebase 專案，並確認 Spark 免費方案 | 建立流程中的 Gemini in Firebase 和 Google Analytics 可能預設開啟；精靈與文件改為提醒可關閉。Firebase 專案會有對應的 Google Cloud 專案。 |
| Web App、Authentication、Realtime Database | 已註冊獨立 Web App、啟用電子郵件／密碼登入，並以鎖定模式建立 Realtime Database；使用者已自行建立登入帳號並發布 Travel OS Rules，控制台確認帳號及規則可見 | 網站登入與本人範圍的診斷讀寫已通過；CI 的 Firebase Emulator 規則測試也通過。這些結果不等於完整安全稽核。 |
| Google Maps | 初次實測僅驗證免 Key 外部導航；後續已補回選填 Places Browser Key 與 Functions 的 Routes／Geocoding／Weather | Step 3 現在區分免 Key 導航、Browser Key 與 Server Key；真實付費 API 尚待驗證，最新結果見[驗證報告](VERIFICATION_REPORT.zh-TW.md)。 |
| 網站設定精靈 Steps 1–6 | 已在獨立 GitHub Pages 網站確認網址、貼入新專案 Web config 和 Realtime Database URL，通過格式檢查、免 Key 導航、登入、連線診斷，並進入旅程工作區 | 控制台顯示的設定片段含 databaseURL；精靈可接受它與另外貼上的相同資料庫 URL。帳號密碼由使用者在網站親自輸入。 |
| 端到端建立旅程 | 已建立獨立的三日測試旅程；開啟新分頁、重新登入後可讀回旅程；新增景點與群組後，網站顯示已同步至自己的 Firebase | 首次建立旅程曾因程式讀取尚未授權的新旅程節點而失敗，改為讀取本人旅程索引；新增景點曾因交易首次收到空快取而衝突，依 Firebase 官方交易行為修正並增加規則整合測試。 |
| 下一站資訊 | 已新增含備註、Google Maps 連結、主要停車場及停車備註的測試景點；下一站卡片與當日時間線均顯示這些資訊 | 部署後舊分頁一度仍載入快取中的舊版 JavaScript；在載入最新資源的新分頁重新測試後通過。 |

以上測試只使用獨立測試專案與示例旅程；沒有對原作者的正式 Firebase 專案寫入。跨帳號的實際拒絕情境由 CI 的 Firebase Emulator 規則測試覆蓋，尚未以第二個真人帳號在正式雲端重測。Google 帳戶與 GitHub 帳戶均沿用已登入帳戶，因此「從零註冊帳戶」仍不能標為通過。

參考官方文件：[GitHub 註冊](https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github)、[GitHub 範本](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)、[Google 帳戶](https://support.google.com/accounts/answer/27441?hl=zh-hant)、[Firebase 專案與 Google Cloud 的關係](https://firebase.google.com/docs/projects/learn-more)、[Firebase 交易](https://firebase.google.com/docs/database/web/read-and-write)、[Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)。
