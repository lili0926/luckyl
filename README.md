# luckyl

可嵌入聊天应用的**虚拟刮刮乐**模块：货架选票、刮开、票根、钱包扣款与兑奖。

> 使用宿主提供的**虚拟货币**，不连接真实彩票销售或兑奖。概率为项目内模拟设定，**不是**官方彩票概率。

## 快速预览

需要 Node.js 18+，无额外依赖：

```sh
node serve.cjs
```

打开 http://127.0.0.1:4346/ （可用 `PORT` 改端口）。

预览自带假钱包，默认货币为「积分」，可加余额、清空票根。

## 接入宿主

加载：

1. `frontend/doodle/lottery.css`
2. `frontend/parts/27_lucky_ticket.js`

宿主需提供：

| 接口 | 作用 |
|------|------|
| `state` | 页面状态（模块使用 `subPage: "lottery"` 等） |
| `render()` | 刷新 UI |
| `ensureWallet()` | `{ balance }` |
| `walletUnit()` | 货币显示名（积分 / 金币 / 小鱼干…） |
| `walletEntry(n)` | 增减余额，不足时抛错 |
| `showToast?(msg)` | 可选 |
| `subHeader?()` | 可选顶栏 |
| `buildMainChatRequest` / `callOneAgentReply` | 可选，刮开旁白 |

全局对象：**`LuckyTicket`**。存储键默认 `luckyl-ticket-v1`。流水角色：`player` / `operator`。

票面文案里的「小鱼干」是占位符，展示时会替换成 `walletUnit()` 的返回值。

## 调爆率

见 `frontend/parts/27_lucky_ticket.js` 顶部 `PAYOUT`。保持 `jackpotRate + regularRate ≤ 1`。

## 测试

```sh
node frontend/tests/lucky_ticket.test.cjs
```

## 分享说明

适合作为**可嵌入模块**源码分享，不是独立上架的完整 App。公开时请保留「虚拟娱乐、非真实彩票」说明。
