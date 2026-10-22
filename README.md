# luckyl

可嵌入聊天应用的虚拟刮刮乐模块，包含六款票的货架、刮开区、独立玩法、票根、钱包扣款与兑奖。票面奖金使用宿主应用提供的虚拟货币，不连接真实彩票销售或兑奖；概率是本项目的模拟设定，并非官方彩票概率。

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

当前配置下，每张票独立抽奖：1% 中 500、69% 中普通奖金、30% 未中奖。没有固定每日次数；购买仍受钱包余额、现货和每轮最多一张的限制。中奖金额由实际刮开的格子按该款票的规则计算，不能脱离票面单独改结果。

## 文件与验证

- `frontend/parts/27_lucky_ticket.js`：票型、概率、结算、状态和交互。
- `frontend/doodle/lottery.css`：货架与票面样式。
- `frontend/tests/lucky_ticket.test.cjs`：六款票的规则、概率边界和兑奖测试。

需要 Node.js，无需安装依赖：

```sh
node frontend/tests/lucky_ticket.test.cjs
```

模块通过全局 `LuckyTicket` 接入宿主页面，使用宿主提供的 `state`、`render`、`subHeader`、`ensureWallet`、`walletUnit`、`walletEntry`、`walletSave`、聊天请求函数和 `localStorage`。购票与票根随钱包一起持久化；旧版独立存储的票根会在首次操作时迁入钱包。钱包流水的角色标识是 `player` 和 `operator`，接入时可映射为自己的角色。默认存储键为 `luckyl-ticket-v1`。单独打开脚本文件不是完整应用。

