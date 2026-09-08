# Zeabur 部署診斷紀錄

## 2026-09-09

Zeabur 的 `Tarotnumber` 專案中，`tarot-annual-reading` 服務為 `tn.richseedl.com` 對應服務，來源分支為 `main`。

上一版部署的運作紀錄確認：資料庫既已有 `subscriptionStart`，但 Drizzle migration 紀錄尚未包含 `0007_fine_chimera.sql`。啟動時執行一般 `ADD subscriptionStart` 產生重複欄位錯誤，migration 因而在 `0007` 停止，後續 `0008` 與 `0009` 的註冊審核欄位未能套用，造成登入 API 回傳 500。

修正版將 `0007` 的 `subscriptionStart` 與 `subscriptionStatus` 改為 `ADD COLUMN IF NOT EXISTS`；`0008` 與 `0009` 同樣維持冪等。Zeabur 已自動觸發包含此修正的最新部署，建置進行中，待運作紀錄顯示 migration 成功後，再以管理員帳號驗證登入與待審核申請清單 API。
