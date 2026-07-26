# Zeabur 部署指南

## 必要環境變數

在 Zeabur 的 Service → Variables 中設定以下環境變數：

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `DATABASE_URL` | MySQL 連線字串（由 Zeabur MySQL 服務自動注入） | `mysql://user:pass@host:3306/dbname` |
| `JWT_SECRET` | Session cookie 簽名密鑰（任意隨機字串） | `your-random-secret-here` |
| `NODE_ENV` | 執行環境 | `production` |

> **注意**：`VITE_APP_ID`、`OAUTH_SERVER_URL`、`VITE_OAUTH_PORTAL_URL` 等 Manus OAuth 變數目前不需要設定（登入功能暫時停用）。未來若要啟用登入，再補充這些變數。

## 部署步驟

### 1. 建立 MySQL 服務
在 Zeabur 專案中新增 MySQL 服務，Zeabur 會自動注入 `DATABASE_URL`。

### 2. 初始化資料庫 Schema
部署完成後，在 Zeabur 的 Service → Commands 執行：
```
pnpm db:push
```

### 3. 匯入塔羅牌資料
在 Zeabur 的 Service → Commands 執行：
```
node scripts/seed-zeabur.mjs
```

## Build & Start 指令
- **Build**: `pnpm install && pnpm build`
- **Start**: `pnpm start`
- **Port**: 由 `PORT` 環境變數控制（Zeabur 自動設定）
