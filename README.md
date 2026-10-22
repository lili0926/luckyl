# luckyl

可嵌入应用的虚拟刮刮乐模块，包含六款票的货架、刮开区、独立玩法、票根、钱包扣款与兑奖。票面奖金使用宿主应用提供的虚拟货币，不连接真实彩票销售或兑奖；概率是本项目的模拟设定，并非官方彩票概率。

## 使用许可

本项目采用 [PolyForm Noncommercial License 1.0.0](LICENSE.md)：允许非商业目的使用、复制、修改和分发；商业用途需要另行取得许可。分发时须附上许可证或其链接。这是**非商业源码可用**许可，不是 OSI 定义的开源许可证。票种名称不表示与彩票发行机构存在合作或授权关系。

## 六款现票

砸彩蛋、幸运日、中国红、喜相逢、十倍幸运、大 7。每款有自己的刮开格数和判奖规则。未上架的旧票型代码仅用于读取既有票根。

## 自己调整爆率和金额

打开 [`frontend/parts/27_lucky_ticket.js`](frontend/parts/27_lucky_ticket.js) 顶部的 `PAYOUT`：

```js
const PAYOUT = {
  jackpotRate: 0.01,       // 500 虚拟货币大奖的概率：1%
  regularRate: 0.69,       // 普通中奖概率：69%；其余 30% 未中奖
  jackpot: 500,            // 单张新票最高奖
  lowPricePrizes: [5, 5, 10, 10, 20, 20],
  highPricePrizes: [10, 20, 20, 30, 40, 50, 60],
  dayLuckyPrize: 60,
};
```

重复的金额代表更高权重。例如低价票的 `5` 出现两次，抽到它的机会就是只出现一次的金额的两倍。票价在 `GAMES` 中设置：10 及以下使用 `lowPricePrizes`，更高票价使用 `highPricePrizes`。调整时让 `jackpotRate + regularRate ≤ 1`，奖金保持非负整数；`幸运日`的幸运图符金额应包含在高价档位中。其余概率自然是未中奖概率。最高奖改动后，六款现票显示的上限会一起更新。

当前配置下，每张票独立抽奖：1% 中 500、69% 中普通奖金、30% 未中奖。没有固定每日次数；购买受钱包余额和现货限制，聊天标记一轮只处理一张。中奖金额由实际刮开的格子按该款票的规则计算，不能脱离票面单独改结果。

## 接入已有前端

这是一份嵌入式模块，不要求另建钱包或 App。先让宿主提供以下接口，再加载 `frontend/parts/27_lucky_ticket.js`，在彩票路由渲染 `LuckyTicket.page()`：

| 宿主接口 | 模块需要的行为 |
| --- | --- |
| `ensureWallet()` | 返回同一个钱包对象，至少有整数 `balance`；模块会在其上保存 `luckyTickets`。 |
| `walletEntry(amount, note, by)` | 同步更新余额并持久化整个钱包；负数是购票，正数是兑奖。写入失败应抛错，模块才能撤回本次购票或兑奖。 |
| `walletSave()` | 同步保存整个钱包，包括 `luckyTickets`；不能只保存余额。 |
| `walletUnit()` | 返回虚拟货币的显示名。 |
| `state`、`render()`、`subHeader(title)` | 提供页面状态、重绘函数和返回 HTML 的页头函数；打开彩票页时设置 `state.subPage = "lottery"`。 |

页面需要 `document` 和一个 `#app` 容器。模块会自动加载相对于页面的 `doodle/lottery.css`；如果宿主把 CSS 放在别处，调整源码底部的 `link.href`。`showToast()` 和 `postAppEvent()` 可选。旧版票据只在迁移时读取 `localStorage`，新票据跟随钱包保存。

宿主可调用 `LuckyTicket.stock()` 显示现货，调用 `LuckyTicket.buy(gameId, serial, agent, requestId)` 购票，调用 `LuckyTicket.redeem(recordId)` 兑奖；购票结果是 `{ok, record}` 或 `{ok:false, reason}`。`serial` 可留空以取该款第一张现票；`requestId` 建议使用一次操作一个唯一值，以免重复扣款。默认货架不替宿主创建购买按钮；聊天应用也可用 `LuckyTicket.handle()` 解析购票标记。本仓库只在票根册展示刮开的票面，不把它发到聊天，也不自动续聊。

## 文件与验证

- `frontend/parts/27_lucky_ticket.js`：票型、概率、结算、状态和交互。
- `frontend/doodle/lottery.css`：货架与票面样式。
- `frontend/tests/lucky_ticket.test.cjs`：六款票的规则、概率边界和兑奖测试。

需要 Node.js，无需安装依赖：

```sh
node frontend/tests/lucky_ticket.test.cjs
```

钱包流水的角色标识是 `player` 和 `operator`，接入时可映射为自己的角色。默认旧版存储键为 `luckyl-ticket-v1`。单独打开脚本文件不是完整应用。

