const LuckyTicket = (() => {
// Virtual payout settings. Rates apply to each newly purchased ticket.
const PAYOUT = {
  jackpotRate:0.01,
  regularRate:0.45,
  jackpot:500,
  lowPricePrizes:[5,5,10,10,20,20],
  highPricePrizes:[10,20,20,30,40,50,60],
  dayLuckyPrize:60,
};
// Keep old tickets readable and redeemable; only the six reference tickets are sold now.
const LEGACY_GAMES = [
  {
    id:'shuangxi', name:'双喜临门', em:'🧧', motif:'囍', price:5, winRate:0.80, rule:'count',
    cols:4, rows:3, c:'#c8102e', cd:'#8f0b20',
    tagline:'刮出囍字就中奖，越多越大',
    symbols:[
      {icon:'囍', name:'囍', prize:30, weight:9, key:true},
      {icon:'🏮', name:'灯笼', prize:0, weight:8},
      {icon:'🎊', name:'彩球', prize:0, weight:8},
      {icon:'🧨', name:'爆竹', prize:0, weight:7},
      {icon:'🥟', name:'饺子', prize:0, weight:6},
      {icon:'🪙', name:'铜钱', prize:0, weight:6},
    ],
    rules:['每刮出 1 个「囍」字即中 30 小鱼干。','同一票刮满 4 个「囍」字，额外送 100 小鱼干。','其余符号为普通票面，不计奖。'],
    bonusText:'集满 4 个囍 +100 小鱼干',
    maxPrize:4*30+100,
  },
  {
    id:'triple', name:'幸运三连', em:'🎰', motif:'777', price:10, winRate:0.80, rule:'rowTriple',
    cols:3, rows:3, c:'#d97706', cd:'#92400e',
    tagline:'横排三个相同，奖金直接累加',
    symbols:[
      {icon:'💎', name:'钻石', prize:10000, weight:1},
      {icon:'7️⃣', name:'幸运7', prize:5000, weight:2},
      {icon:'🍀', name:'四叶草', prize:1000, weight:3},
      {icon:'💰', name:'金袋', prize:500, weight:5},
      {icon:'⭐', name:'星星', prize:100, weight:8},
      {icon:'🔔', name:'铃铛', prize:50, weight:10},
      {icon:'🍋', name:'柠檬', prize:20, weight:12},
    ],
    rules:['横向任意一行 3 个符号相同即中奖。','中奖奖金按该行符号对应金额计算。','同时命中多行时，奖金按行累加。'],
    maxPrize:10000,
  },
  {
    id:'lucky7', name:'幸运大 7', em:'7️⃣', motif:'7', price:20, winRate:0.80, rule:'lucky7',
    cols:3, rows:3, c:'#1d4ed8', cd:'#1e3a8a',
    tagline:'每个 7 都计奖，三连 7 拿头奖',
    symbols:[
      {icon:'7️⃣', name:'幸运7', prize:200, weight:6, key:true},
      {icon:'🎲', name:'骰子', prize:0, weight:7},
      {icon:'🃏', name:'鬼牌', prize:0, weight:7},
      {icon:'🍒', name:'樱桃', prize:0, weight:7},
      {icon:'🍉', name:'西瓜', prize:0, weight:6},
      {icon:'🔔', name:'铃铛', prize:0, weight:6},
    ],
    rules:['每刮出 1 个「7」即中 200 小鱼干。','三个「7」出现在同一行，额外中头奖 3000 小鱼干。','头奖与单字奖金可叠加。'],
    jackpotText:'三连 7 +3000 小鱼干',
    maxPrize:3*200+3000,
  },
  {
    id:'season', name:'四季发财', em:'🌸', motif:'四季', price:20, winRate:0.80, rule:'set',
    cols:4, rows:3, c:'#0f766e', cd:'#115e59',
    tagline:'集齐春夏秋冬，另计重复花牌',
    symbols:[
      {icon:'🌸', name:'春', prize:60, weight:5, key:true},
      {icon:'🌻', name:'夏', prize:60, weight:5, key:true},
      {icon:'🍁', name:'秋', prize:60, weight:5, key:true},
      {icon:'❄️', name:'冬', prize:60, weight:5, key:true},
      {icon:'🪔', name:'花灯', prize:0, weight:8},
      {icon:'🍵', name:'清茶', prize:0, weight:8},
      {icon:'🎋', name:'竹枝', prize:0, weight:7},
    ],
    rules:['集齐春、夏、秋、冬各至少 1 张，中全套奖 600 小鱼干。','集齐后票面上每多出 1 张花牌，再计 60 小鱼干。','未集齐四季则不中奖。'],
    bonusText:'全套 600 小鱼干 + 每张花牌 60 小鱼干',
    maxPrize:600+8*60,
  },
  {
    id:'koi', name:'好运锦鲤', em:'🎏', motif:'锦鲤', price:30, winRate:0.80, rule:'koi',
    cols:4, rows:3, c:'#0e7490', cd:'#155e75',
    tagline:'锦鲤逐条计奖，遇龙门翻三倍',
    symbols:[
      {icon:'🎏', name:'锦鲤', prize:80, weight:6, key:true},
      {icon:'🏯', name:'龙门', prize:0, weight:3, bonus:true},
      {icon:'🌊', name:'海浪', prize:0, weight:8},
      {icon:'🪝', name:'钓钩', prize:0, weight:6},
      {icon:'🐚', name:'贝壳', prize:0, weight:7},
      {icon:'⛵', name:'小船', prize:0, weight:6},
    ],
    rules:['每刮出 1 条锦鲤中 80 小鱼干，4 条及以上再送 600 小鱼干。','刮出「龙门」时，本票全部奖金翻 3 倍。','龙门单独出现不计奖，需搭配锦鲤。'],
    bonusText:'4 条锦鲤 +600 小鱼干 · 龙门 ×3',
    maxPrize:(4*80+600)*3,
  },
  {
    id:'diamond', name:'钻石豪门', em:'👑', motif:'888', price:50, winRate:0.80, rule:'line',
    cols:4, rows:4, c:'#26212f', cd:'#100e16',
    tagline:'大票面 4×4，行列斜线都算奖',
    symbols:[
      {icon:'💎', name:'钻石', prize:20000, weight:2},
      {icon:'👑', name:'皇冠', prize:8000, weight:3},
      {icon:'⌚', name:'名表', prize:3000, weight:5},
      {icon:'🪙', name:'金条', prize:1500, weight:7},
      {icon:'🏎️', name:'跑车', prize:800, weight:9},
      {icon:'📮', name:'邮票', prize:400, weight:11},
    ],
    rules:['横线、竖线、斜线上连续 3 个相同符号即中奖。','每条连线奖金 = 符号金额 ×(连续个数 − 2)× 3 倍。','4 个连成一线按 6 倍计，多条连线累加。'],
    maxPrize:20000*6,
  },
  {
    id:'lucky66', name:'幸运66', em:'6', motif:'66', price:15, winRate:0.80, rule:'count',
    cols:3, rows:3, c:'#365b83', cd:'#365b83', bonusAt:3, bonusPrize:66,
    tagline:'刮到 6 就计奖，三个 6 再加奖',
    symbols:[
      {icon:'6', name:'数字6', prize:66, weight:7, key:true},
      {icon:'8', name:'数字8', prize:0, weight:9},
      {icon:'9', name:'数字9', prize:0, weight:9},
      {icon:'○', name:'圆环', prize:0, weight:8},
      {icon:'◇', name:'菱形', prize:0, weight:8},
      {icon:'△', name:'三角', prize:0, weight:8},
    ],
    rules:['每刮出 1 个「6」中 66 小鱼干。','同一票刮满 3 个「6」，再加 66 小鱼干。'],
    bonusText:'三个 6 +66 小鱼干', maxPrize:3*66+66,
  },
  {
    id:'goodluck10', name:'好运十倍', em:'10', motif:'×10', price:25, winRate:0.80, rule:'rowTriple',
    cols:3, rows:3, c:'#365b83', cd:'#365b83', rowMultiplier:10,
    tagline:'横排三连相同，基础奖翻十倍',
    symbols:[
      {icon:'◈', name:'幸运星', prize:100, weight:2},
      {icon:'◇', name:'钻石', prize:50, weight:4},
      {icon:'○', name:'圆环', prize:25, weight:7},
      {icon:'△', name:'三角', prize:10, weight:8},
      {icon:'□', name:'方块', prize:5, weight:10},
      {icon:'≈', name:'波纹', prize:3, weight:12},
    ],
    rules:['横向任意一行出现 3 个相同图案即中奖。','每行按图案基础奖金 ×10 计奖，多行可累加。'],
    maxPrize:100*10,
  },
];
const GAMES = [
  {id:'egg',name:'砸彩蛋',price:10,real:true,cols:5,rows:3,chances:15,maxPrize:PAYOUT.jackpot,c:'#8eaa42',cd:'#6d8533',tagline:'15次机会 · 刮出奖金即中'},
  {id:'day',name:'幸运日',price:20,real:true,cols:7,rows:5,chances:31,maxPrize:PAYOUT.jackpot,c:'#d79699',cd:'#b46b80',tagline:'31天日历 · 奖金或幸运图符'},
  {id:'chineseRed',name:'中国红',price:20,real:true,cols:5,rows:4,chances:21,maxPrize:PAYOUT.jackpot,c:'#b84530',cd:'#873727',tagline:'对号码 · 红字双倍 · 灯笼五倍'},
  {id:'reunion',name:'喜相逢',price:20,real:true,cols:5,rows:5,chances:25,maxPrize:PAYOUT.jackpot,c:'#c54435',cd:'#243c76',tagline:'喜字中奖 · 囍字双倍'},
  {id:'tenfold',name:'十倍幸运',price:10,real:true,cols:1,rows:10,chances:10,maxPrize:PAYOUT.jackpot,c:'#6caa43',cd:'#3f742d',tagline:'十局对号码 · 双鱼十倍'},
  {id:'big7',name:'大7',price:20,real:true,cols:5,rows:4,chances:20,maxPrize:PAYOUT.jackpot,c:'#aa253b',cd:'#691428',tagline:'7中奖 · 77双倍 · 777三倍'},
];
const GAME_MAP = Object.fromEntries([...LEGACY_GAMES,...GAMES].map(g=>[g.id,g]));
const STOCK_PER_GAME = 4;
const TICKET_SKINS = {
  egg:['砸彩蛋','蛋'],
  day:['幸运日','日'],
  chineseRed:['中国红','红'],
  reunion:['喜相逢','囍'],
  tenfold:['十倍幸运','10'],
  big7:['大7','7'],
  shuangxi:['双喜','囍'],
  triple:['好运来','福'],
  lucky7:['大7','7'],
  season:['四季发财','四'],
  koi:['好运锦鲤','鲤'],
  diamond:['幸运88','88'],
  lucky66:['幸运66','66'],
  goodluck10:['好运十倍','10'],
};

/* SECTION: rule engine */
function weightedPick(list){
  const total = list.reduce((a,s)=>a+s.weight,0);
  let r = Math.random()*total;
  for(const s of list){ r -= s.weight; if(r<=0) return s; }
  return list[list.length-1];
}
function pickOf(game, exclude){
  const usable = game.symbols.filter(s => !exclude || !exclude.includes(s));
  return weightedPick(usable.length ? usable : game.symbols);
}
function blankGrid(game){
  const n = game.cols*game.rows;
  return Array.from({length:n}, ()=>pickOf(game));
}
function keySymbols(game){ return game.symbols.filter(s=>s.key); }
function fillers(game){ const f = game.symbols.filter(s=>!s.key && !s.bonus); return f.length?f:game.symbols; }
function cellsOf(g, game, pred){
  const out=[]; g.forEach((s,i)=>{ if(pred(s,i,game)) out.push(i); }); return out;
}
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}
function linesOf(game){
  const C=game.cols, R=game.rows, L=[];
  for(let r=0;r<R;r++){ const a=[]; for(let c=0;c<C;c++) a.push(r*C+c); L.push(a); }
  for(let c=0;c<C;c++){ const a=[]; for(let r=0;r<R;r++) a.push(r*C+c); L.push(a); }
  const d1=[],d2=[]; const m=Math.min(C,R);
  for(let i=0;i<m;i++){ d1.push(i*C+i); d2.push(i*C+(m-1-i)); }
  L.push(d1,d2);
  return L;
}

const RULES = {
  // 数关键符号兑奖
  count:{
    settle(g,game){
      const keys = keySymbols(game), cells = [];
      g.forEach((s,i)=>{ if(keys.includes(s)) cells.push(i); });
      if(!cells.length) return {prize:0,winCells:[],bonus:0};
      const unit = keys[0].prize;
      const bonus = cells.length >= (game.bonusAt || 4) ? (game.bonusPrize || 100) : 0;
      return {prize: cells.length*unit + bonus, winCells:cells, bonus};
    },
    make(game){
      const g = Array.from({length:game.cols*game.rows}, ()=>weightedPick(fillers(game)));
      const k = Math.random()<0.15?(game.bonusAt || 4):Math.random()<0.4?2:1;
      const idx = shuffle(Array.from({length:g.length},(_,i)=>i)).slice(0,k);
      idx.forEach(i=>g[i]=keySymbols(game)[0]);
      return g;
    },
    makeLose(game){
      return Array.from({length:game.cols*game.rows}, ()=>weightedPick(fillers(game)));
    },
  },
  // 3x3 横排三连
  rowTriple:{
    settle(g,game){
      let prize=0; const winCells=[];
      for(let r=0;r<game.rows;r++){
        const t=[g[r*3],g[r*3+1],g[r*3+2]];
        if(t[0]===t[1]&&t[1]===t[2]&&t[0].prize>0){
          prize+=t[0].prize*(game.rowMultiplier || 1); winCells.push(r*3,r*3+1,r*3+2);
        }
      }
      return {prize,winCells,bonus:0};
    },
    make(game){
      const g=blankGrid(game);
      const row=Math.floor(Math.random()*game.rows);
      const sym=Math.random()<0.25 ? game.symbols[Math.floor(Math.random()*3)] : weightedPick(game.symbols);
      g[row*3]=g[row*3+1]=g[row*3+2]=sym;
      for(let r=0;r<game.rows;r++) if(r!==row){
        for(let k=0;k<20 && g[r*3]===g[r*3+1]&&g[r*3+1]===g[r*3+2];k++) g[r*3+2]=weightedPick(game.symbols);
      }
      return g;
    },
    makeLose(game){
      const g=blankGrid(game);
      for(let k=0;k<40;k++){
        const bad=[]; for(let r=0;r<game.rows;r++) if(g[r*3]===g[r*3+1]&&g[r*3+1]===g[r*3+2]) bad.push(r*3+2);
        if(!bad.length) break;
        bad.forEach(i=>g[i]=weightedPick(game.symbols));
      }
      return g;
    },
  },
  // 每个 7 计奖 + 三连 7 头奖
  lucky7:{
    settle(g,game){
      const key=keySymbols(game)[0], cells=[];
      g.forEach((s,i)=>{ if(s===key) cells.push(i); });
      let prize=cells.length*key.prize, bonus=0;
      for(let r=0;r<game.rows;r++){
        const row=[r*3,r*3+1,r*3+2];
        if(row.every(i=>g[i]===key)){ bonus=3000; prize+=bonus; }
      }
      return {prize,winCells:cells,bonus};
    },
    make(game){
      const g=Array.from({length:9}, ()=>weightedPick(fillers(game)));
      const key=keySymbols(game)[0];
      if(Math.random()<0.22){ const row=Math.floor(Math.random()*3); g[row*3]=g[row*3+1]=g[row*3+2]=key; }
      else{ const k=Math.random()<0.3?3:Math.random()<0.6?2:1;
        shuffle(Array.from({length:9},(_,i)=>i)).slice(0,k).forEach(i=>g[i]=key); }
      return g;
    },
    makeLose(game){ return Array.from({length:9}, ()=>weightedPick(fillers(game))); },
  },
  // 集齐全套
  set:{
    settle(g,game){
      const keys=keySymbols(game);
      const present=keys.filter(k=>g.includes(k));
      if(present.length<keys.length){
        // 未集齐：只算重复花牌奖（需先集齐才计奖）
        return {prize:0,winCells:[],bonus:0};
      }
      const cells=[];
      g.forEach((s,i)=>{ if(keys.includes(s)) cells.push(i); });
      // 全套 600 + 集齐后每张花牌 60
      return {prize:600+(cells.length-keys.length)*60, winCells:cells, bonus:600};
    },
    make(game){
      const keys=keySymbols(game);
      const g=Array.from({length:game.cols*game.rows}, ()=>weightedPick(fillers(game)));
      const idx=shuffle(Array.from({length:g.length},(_,i)=>i));
      keys.forEach((k,i)=>g[idx[i]]=k);
      const extra = Math.random()<0.4 ? Math.floor(Math.random()*4)+1 : 0;
      for(let e=0;e<extra;e++) g[idx[keys.length+e]]=weightedPick(keys);
      return g;
    },
    makeLose(game){
      const keys=keySymbols(game);
      const skip=Math.floor(Math.random()*keys.length);
      const allowed=keys.filter((_,i)=>i!==skip);
      const g=Array.from({length:game.cols*game.rows}, ()=>{
        return (allowed.length && Math.random()<0.2) ? weightedPick(allowed) : weightedPick(fillers(game));
      });
      return g;
    },
  },
  // 锦鲤：逐条计奖 + 龙门翻倍
  koi:{
    settle(g,game){
      const key=keySymbols(game)[0], gate=game.symbols.find(s=>s.bonus);
      const cells=[]; g.forEach((s,i)=>{ if(s===key) cells.push(i); });
      const hasGate=g.includes(gate);
      if(!cells.length) return {prize:0,winCells:[],bonus:0};
      const orig=cells.length*key.prize + (cells.length>=4?600:0);
      const base=hasGate ? orig*3 : orig;
      const winCells=hasGate ? cells.concat(g.map((s,i)=>s===gate?i:-1).filter(i=>i>=0)) : cells;
      return {prize:base,winCells,bonus:hasGate?base-orig:0};
    },
    make(game){
      const key=keySymbols(game)[0], gate=game.symbols.find(s=>s.bonus);
      const g=Array.from({length:12}, ()=>weightedPick(fillers(game)));
      const idx=shuffle(Array.from({length:12},(_,i)=>i));
      const k = Math.random()<0.12?4:Math.random()<0.35?3:Math.random()<0.7?2:1;
      idx.slice(0,k).forEach(i=>g[i]=key);
      if(Math.random()<0.4) g[idx[k]]=gate;
      return g;
    },
    makeLose(game){ return Array.from({length:12}, ()=>weightedPick(fillers(game))); },
  },
  // 行列斜线连续 3+ 计奖
  line:{
    settle(g,game){
      let prize=0; const winCells=new Set();
      linesOf(game).forEach(line=>{
        let run=1;
        for(let i=1;i<=line.length;i++){
          const same = i<line.length && g[line[i]]===g[line[i-1]];
          if(same) run++;
          else{
            if(run>=3){ const s=g[line[i-1]]; if(s.prize>0){ prize += s.prize*(run-2)*3; for(let j=i-run;j<i;j++) winCells.add(line[j]); } }
            run=1;
          }
        }
      });
      return {prize,winCells:[...winCells],bonus:0};
    },
    make(game){
      const g=blankGrid(game);
      const lines=linesOf(game);
      const line=lines[Math.floor(Math.random()*lines.length)];
      const len=Math.random()<0.25 ? line.length : 3;
      const start=len<line.length ? Math.floor(Math.random()*(line.length-len+1)) : 0;
      const sym = Math.random()<0.4 ? game.symbols[Math.floor(Math.random()*3)] : weightedPick(game.symbols);
      const chosen=new Set();
      for(let i=start;i<start+len;i++){ g[line[i]]=sym; chosen.add(line[i]); }
      // 其余格用同符号以外的池子填，降低误加奖
      const others=game.symbols.filter(s=>s!==sym);
      for(let i=0;i<g.length;i++) if(!chosen.has(i)) g[i]=weightedPick(others);
      // 二次清洗：清掉非预期连线
      for(let k=0;k<40;k++){
        const res=RULES.line.settle(g,game);
        const extra=res.winCells.filter(i=>!chosen.has(i));
        if(!extra.length) break;
        extra.forEach(i=>g[i]=weightedPick(others));
      }
      return g;
    },
    makeLose(game){
      const g=blankGrid(game);
      for(let k=0;k<60;k++){
        const res=RULES.line.settle(g,game);
        if(!res.winCells.length) break;
        res.winCells.forEach(i=>g[i]=weightedPick(game.symbols));
      }
      return g;
    },
  },
};

// Virtual draw: ticket mechanics follow the six printed references. The virtual
// prize distribution is deliberately separate from any official print run.
const randomNumber = (max) => Math.floor(Math.random()*max);
const number = () => String(randomNumber(49)+1).padStart(2,"0");
const smallPrize = () => [5,5,10,10,10,20,20,30][randomNumber(8)];
function drawPrize(game){
  const roll=Math.random();
  if(roll<PAYOUT.jackpotRate) return PAYOUT.jackpot;
  if(roll>=PAYOUT.jackpotRate+PAYOUT.regularRate) return 0;
  const prizes=game.price<=10 ? PAYOUT.lowPricePrizes : PAYOUT.highPricePrizes;
  return prizes[randomNumber(prizes.length)];
}
function ruleLines(game){
  switch(game.id){
    case "egg": return ["15个彩蛋中，刮出奖金金额即得该金额。","多处中奖，奖金相加。"];
    case "day": return ["31格对应一个月的31天；刮出金额即得该金额。","刮出幸运图符中"+PAYOUT.dayLuckyPrize+unit()+"，多处中奖相加。"];
    case "chineseRed": return ["你的号码与中奖号码之一相同，获得该格金额。","红字为该格金额×2，灯笼为×5，中国结为20格金额之和。","幸运奖区刮出金额也计奖；各奖兼中兼得。"];
    case "reunion": return ["刮出喜字得该格金额；刮出囍字得该格金额×2。","25格各自独立，奖金相加。"];
    case "tenfold": return ["每局任一号码等于中奖号码，获得该局右侧金额。","出现双鱼图符，该局右侧金额×10。"];
    case "big7": return ["刮出7得该格金额；77得×2；777得×3。","20格各自独立，奖金相加。"];
    default: return (game.rules||[]).map(u);
  }
}
function makeRealTicket(game){
  const target=drawPrize(game);
  const winner=target ? randomNumber(game.chances) : -1;
  const face={type:game.id,items:[]};
  if(game.id==="egg" || game.id==="day"){
    const signs=game.id==="egg"?["蛋","星","花","云","叶","锤"]:["花","书","云","咖","猫","月","信"];
    for(let i=0;i<game.chances;i++){
      const amount=i===winner?target:0;
      face.items.push({label:amount?(game.id==="day" && amount===PAYOUT.dayLuckyPrize?"幸运":"¥"+amount):signs[randomNumber(signs.length)],amount,day:game.id==="day"?i+1:undefined});
    }
  }else if(game.id==="reunion" || game.id==="big7"){
    const signs=game.id==="reunion"?["花","灯","云","礼","福","金","玉"]:["08","13","21","32","40","06","24"];
    for(let i=0;i<game.chances;i++){
      const label=i===winner
        ? game.id==="reunion"?(target%2===0 && Math.random()<.25?"囍":"喜"):(target%3===0 && Math.random()<.15?"777":target%2===0 && Math.random()<.3?"77":"7")
        : signs[randomNumber(signs.length)];
      const multiplier=label==="囍"||label==="77"?2:label==="777"?3:1;
      const amount=i===winner?target/multiplier:smallPrize();
      face.items.push({label,amount});
    }
  }else if(game.id==="chineseRed"){
    const nums=new Set();
    while(nums.size<5) nums.add(number());
    face.winningNumbers=[...nums];
    for(let i=0;i<20;i++){
      let label=number();
      while(nums.has(label)) label=number();
      if(i===winner){
        const kind=randomNumber(4);
        label=kind===0 && target===PAYOUT.jackpot && target%20===0?"中国结":kind===1 && target%5===0?"灯笼":kind===2 && target%2===0?"红":face.winningNumbers[randomNumber(5)];
      }
      const multiplier=label==="灯笼"?5:label==="红"?2:1;
      const amount=label==="中国结"?target/20:i===winner?target/multiplier:smallPrize();
      face.items.push({label,amount});
    }
    if(face.items.some(item=>item.label==="中国结")) face.items.forEach(item=>item.amount=target/20);
    face.lucky={label:"幸运奖",amount:winner===20?target:0};
  }else if(game.id==="tenfold"){
    face.winningNumber=number();
    for(let i=0;i<10;i++){
      const numbers=[];
      for(let j=0;j<6;j++){
        let value=number();
        while(value===face.winningNumber || numbers.includes(value)) value=number();
        numbers.push(value);
      }
      if(i===winner) numbers[randomNumber(6)]=target%10===0 && Math.random()<.25?"双鱼":face.winningNumber;
      face.items.push({numbers,amount:i===winner?target/(numbers.includes("双鱼")?10:1):smallPrize()});
    }
  }
  return face;
}
function settleRealTicket(face,game){
  let prize=0;
  const winCells=[];
  const sum=face.items.reduce((total,item)=>total+(Number(item.amount)||0),0);
  face.items.forEach((item,i)=>{
    let amount=0;
    if(game.id==="egg" || game.id==="day") amount=item.amount||0;
    if(game.id==="reunion") amount=(item.label==="喜"?1:item.label==="囍"?2:0)*item.amount;
    if(game.id==="big7") amount=(item.label==="7"?1:item.label==="77"?2:item.label==="777"?3:0)*item.amount;
    if(game.id==="chineseRed") amount=face.winningNumbers.includes(item.label)?item.amount
      :item.label==="红"?item.amount*2:item.label==="灯笼"?item.amount*5
      :item.label==="中国结"?sum:0;
    if(game.id==="tenfold") amount=item.numbers.includes("双鱼")?item.amount*10
      :item.numbers.includes(face.winningNumber)?item.amount:0;
    if(amount){prize+=amount;winCells.push(i);}
  });
  if(game.id==="chineseRed" && face.lucky.amount){
    prize+=face.lucky.amount;
    winCells.push(20);
  }
  return {prize,winCells,bonus:0};
}

// One ledger per host installation. Ticket numbers belong to
// batches, so a sold ticket cannot be bought again until it is restocked.
const STORE = "luckyl-ticket-v1";
const DAY_LIMIT = Infinity;
const escapeText = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
})[c]);
const dayKey = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
};
const dailyLimit = () => DAY_LIMIT;
const fresh = () => ({batches:{},sold:[],records:[],processed:[]});
function load(){
  try{
    const parsed = JSON.parse(localStorage.getItem(STORE) || "null");
    if(!parsed || typeof parsed !== "object") return fresh();
    return {
      batches:parsed.batches && typeof parsed.batches==="object" ? parsed.batches : {},
      sold:Array.isArray(parsed.sold) ? parsed.sold : [],
      records:Array.isArray(parsed.records) ? parsed.records : [],
      processed:Array.isArray(parsed.processed) ? parsed.processed : [],
    };
  }catch(_){ return fresh(); }
}
let ledger = load();
let narratingId = "";
let queuedNarration = null;
function save(next){
  localStorage.setItem(STORE, JSON.stringify(next));
  ledger = next;
}
function stock(){
  const sold = new Set(ledger.sold);
  const items = [];
  GAMES.forEach((game,index) => {
    const batch = Math.max(1, Number(ledger.batches[game.id]) || 1);
    for(let slot=1;slot<=STOCK_PER_GAME;slot++){
      const id = game.id+"-"+batch+"-"+String(slot).padStart(2,"0");
      if(sold.has(id)) continue;
      items.push({
        id, game, batch,
        serial:String(index+1).padStart(2,"0")+String(batch).padStart(2,"0")+"-"+String(slot).padStart(2,"0")
      });
    }
  });
  return items;
}
function todaysCount(){
  const today = dayKey();
  return ledger.records.filter(r=>r.day===today).length;
}
function balance(){
  try{return Math.max(0, Math.round(Number(ensureWallet().balance)||0));}
  catch(_){return 0;}
}
function unit(){
  try{return walletUnit();}catch(_){return "积分";}
}
function u(s){ return String(s==null?"":s).split("小鱼干").join(unit()); 
}
function available(){ return stock().filter(t=>t.game.price<=balance()); }
function pending(){ return ledger.records.filter(r=>r.prize>0 && r.status==="pending"); }
function describeRecord(record){
  const game=GAME_MAP[record.gameId];
  if(!game) return "";
  if(game.real && record.face){
    const face=record.face;
    const shown=face.items.map((item,i)=>{
      const label=item.numbers?item.numbers.join("·"):item.label;
      return (game.id==="day"?(i+1)+"日":"第"+(i+1)+"格")+":"+label+(item.amount?"／"+item.amount:"");
    }).join("、");
    const extra=face.winningNumbers?"；中奖号码："+face.winningNumbers.join("、"):"";
    const ten=face.winningNumber?"；中奖号码："+face.winningNumber:"";
    const lucky=face.lucky?"；幸运奖区："+(face.lucky.amount||"未中"):"";
    return "最近刮的「"+record.name+"」票号"+record.serial+"；票面："+shown+extra+ten+lucky
      +"；本票规则："+ruleLines(game).join(" ")
      +"；"+(record.prize?"共中"+record.prize+unit()+"，"+(record.status==="redeemed"?"已兑奖":"待 用户 确认兑奖"):"未中奖")+".";
  }
  const cells=(record.cells||[]).map(i=>game.symbols[i]);
  const rows=[];
  for(let r=0;r<game.rows;r++) rows.push(cells.slice(r*game.cols,(r+1)*game.cols).map(s=>s?s.name:"?").join("、"));
  let near="";
  if(!record.prize){
    if(game.rule==="set"){
      const missing=keySymbols(game).filter(s=>!cells.includes(s)).map(s=>s.name);
      near=missing.length===1 ? "只差「"+missing[0]+"」就凑齐四季" : "还缺「"+missing.join("、")+"」";
    }else if(game.rule==="rowTriple" || game.rule==="line"){
      const lines=game.rule==="rowTriple"
        ? Array.from({length:game.rows},(_,r)=>Array.from({length:game.cols},(_,c)=>r*game.cols+c))
        : linesOf(game);
      const close=lines.some(line=>line.some((i,k)=>k>0 && cells[i]===cells[line[k-1]]));
      near=close ? "出现过一对相同图案，还差一个才连成奖" : "没有凑成三连图案";
    }else near="没有刮到这款票的中奖图案";
  }
  return "最近刮的「"+record.name+"」票号"+record.serial+"；从上到下每行图案："+rows.join(" / ")
    +"；规则："+game.tagline+"；"+(record.prize?"中了"+record.prize+unit()+"，"+(record.status==="redeemed"?"已兑奖入账":"等 用户 确认兑奖"):"没中，"+near)
    +"；本款最高奖"+game.maxPrize+unit()+"。";
}
function recentContext(hours){
  const record=ledger.records[0];
  return record && record.narrated!==false && record.id!==narratingId && Date.now()-Date.parse(record.time)<hours*3600000 ? describeRecord(record) : "";
}
function brief(){
  const due=pending().filter(r=>r.narrated!==false && r.id!==narratingId);
  const reminder=due.length ? "你有 "+due.length+" 张中奖票待找 用户 兑奖。" : "";
  const last=recentContext(2);
  if(!available().length)
    return reminder || last ? "\n【幸运票局】"+[reminder,last].filter(Boolean).join(" ") : "";
  const names=GAMES.filter(g=>stock().some(t=>t.game.id===g.id) && g.price<=balance())
    .map(g=>TICKET_SKINS[g.id][0]+"("+g.id+"/"+g.price+unit()+"/最高"+g.maxPrize+unit()+")").join("、");
  return "\n【幸运票局】你想抽的时候可以自己花"+unit()+"挑一张虚拟刮刮乐，不必等 用户 提醒；可选款式："+names
    +"。想买时写 ⟪刮刮乐:款式ID⟫；先别编刮开的图案或结果，系统会给出真实票面。"
    +"一轮最多一张，按钱包和现货决定；没中就算了，中奖找 用户 兑奖。"
    +[reminder,last].filter(Boolean).map(s=>" "+s).join("");
}
function prompt(){
  const due = pending().filter(r=>r.narrated!==false && r.id!==narratingId);
  const last = ledger.records[0] && ledger.records[0].narrated!==false && ledger.records[0].id!==narratingId ? ledger.records[0] : null;
  const dueLine = due.length
    ? "你有"+due.length+"张中奖票还没兑，最高一张 "+Math.max(...due.map(r=>r.prize))+unit()+"。可以自然地找 用户 兑奖。"
    : "";
  if(!available().length)
    return dueLine || last ? "\n【幸运票局】"+[dueLine,last&&describeRecord(last)].filter(Boolean).join(" ") : "";
  const choices = GAMES.map(g=>{
    const tickets=stock().filter(t=>t.game.id===g.id);
    return tickets.length ? TICKET_SKINS[g.id][0]+"("+g.id+"，"+g.price+" "+unit()+"，最高"+g.maxPrize+unit()+"，"+g.tagline+"，票号 "+tickets.map(t=>t.serial).join("/")+")" : "";
  }).filter(Boolean).join("；");
  return "\n【幸运票局】你想抽的时候可以自己决定花"+unit()+"买一张虚拟刮刮乐，不必等 用户 提醒，也不必每次醒来都买。"
    +" 今天已刮 "+todaysCount()+" 张；钱包有 "+balance()+" "+unit()+"。"
    +" 现票："+choices+"。想买并亲自刮开时，在回复末尾写 ⟪刮刮乐:款式ID|票号⟫，一轮最多一张。"
    +" 系统会扣款、刮开并记录结果；这张票的格子和规则会在购买后单独交给你。刮开前不要编结果。中奖后你再找 用户 兑奖，未中就算了。"
    +(dueLine ? " "+dueLine : "")
    +(last ? " "+describeRecord(last) : "");
}
function outcome(game){
  if(game.real){
    const face=makeRealTicket(game);
    return {cells:[],face,...settleRealTicket(face,game)};
  }
  const symbols = Math.random()<game.winRate ? RULES[game.rule].make(game) : RULES[game.rule].makeLose(game);
  const settled = RULES[game.rule].settle(symbols,game);
  return {
    cells:symbols.map(s=>game.symbols.indexOf(s)),
    winCells:settled.winCells,
    prize:settled.prize,
    bonus:settled.bonus||0,
  };
}
function buy(gameId,serial,agent,requestId){
  const same = requestId && ledger.processed.find(p=>p.id===requestId);
  if(same){
    const record=ledger.records.find(r=>r.id===same.recordId);
    return record ? {ok:true,record,duplicate:true} : {ok:false,reason:"这一轮已经处理过"};
  }
  const game=GAMES.find(g=>g.id===gameId || TICKET_SKINS[g.id][0]===gameId);
  if(!game) return {ok:false,reason:"没有这款票"};
  const tickets=stock().filter(t=>t.game.id===game.id);
  const ticket=tickets.find(t=>t.serial===serial) || (!serial ? tickets[0] : null);
  if(!ticket) return {ok:false,reason:"这张票已经卖完，等 用户 补货"};
  if(balance()<game.price) return {ok:false,reason:"钱包余额不足"};
  const draw=outcome(game);
  const record={
    id:"lot-"+Date.now()+"-"+ticket.id,
    ticketId:ticket.id,serial:ticket.serial,gameId:game.id,
    name:TICKET_SKINS[game.id][0],price:game.price,
    prize:draw.prize,bonus:draw.bonus,cells:draw.cells,face:draw.face,
    winCells:draw.winCells,status:draw.prize>0?"pending":"lost",narrated:false,
    agentId:agent && agent.id || "", day:dayKey(), time:new Date().toISOString(),
  };
  const next={
    ...ledger,
    sold:ledger.sold.concat(ticket.id),
    records:[record].concat(ledger.records),
    processed:requestId ? [{id:requestId,recordId:record.id}].concat(ledger.processed).slice(0,200) : ledger.processed,
  };
  let debited=false;
  try{
    walletEntry(-game.price, "刮刮乐 "+record.name+" "+record.serial, "player");
    debited=true;
    save(next);
  }catch(e){
    if(debited) try{ walletEntry(game.price, "刮刮乐购票失败退回", "system"); }catch(_){}
    return {ok:false,reason:"记录失败，请稍后再试"};
  }
  try{ if(typeof postAppEvent==="function") postAppEvent("lottery_scratch",{name:record.name,prize:record.prize}); }catch(_){}
  return {ok:true,record};
}
function resultText(record){
  return "〔"+record.name+" "+record.serial+"：票面已经刮开，先读完图案。〕\n[lottery:"+record.id+"]";
}
function takePendingNarration(){
  const queued=queuedNarration;
  queuedNarration=null;
  return queued;
}
function scratchPacket(record){
  const game=GAME_MAP[record.gameId];
  if(!game) return null;
  if(game.real && record.face){
    const face=record.face;
    return {
      ticket:record.name,serial:record.serial,layout:game.chances+"次机会",
      winningNumbers:face.winningNumbers||face.winningNumber||undefined,
      cells:face.items.map((item,i)=>({
        position:game.id==="day"?(i+1)+"日":"第"+(i+1)+"格",
        symbol:item.numbers?item.numbers.join("、"):item.label,
        amount:item.amount||undefined,
      })),
      luckyArea:face.lucky||undefined,
      rules:ruleLines(game),
    };
  }
  return {
    ticket:record.name, serial:record.serial,
    rows:game.rows, columns:game.cols,
    cells:(record.cells||[]).map((index,i)=>({
      row:Math.floor(i/game.cols)+1,column:i%game.cols+1,
      symbol:game.symbols[index]?.name||"?",
    })),
    rules:(game.rules||[]).map(u),
  };
}
async function autoNarrate(queued){
  if(!queued || typeof window==="undefined" || window.__ltNarrationLock) return;
  const record=ledger.records.find(r=>r.id===queued.recordId);
  if(!record || record.narrated!==false) return;
  window.__ltNarrationLock=true;
  let ownedLoading=false;
  try{
    for(let i=0;i<40 && state.chatLoading;i++) await new Promise(resolve=>setTimeout(resolve,250));
    if(state.chatLoading) return;
    const agent=(state.agents||[]).find(a=>a.id===queued.agentId);
    if(!agent || typeof callOneAgentReply!=="function") return;
    const packet=scratchPacket(record);
    if(!packet) return;
    narratingId=record.id;
    const extra="\n\n【系统·刚刮开的这一张票】下面是票面数据，不含中奖结论。按这款票自己的刮法阅读格子、号码和奖区；先说刮开过程中看到了什么，再按本票规则自己判断。自然地对 用户 说两三句，不要复述 JSON、不要宣称调用过逐格工具，也不要再买一张。\n"+JSON.stringify(packet);
    const req=buildMainChatRequest(agent,extra);
    state.chatLoading=true;
    ownedLoading=true;
    render();
    await callOneAgentReply(agent,req.apiMsgs,req.sys);
  }catch(e){
    try{console.warn("lottery narration",e);}catch(_){}
  }finally{
    narratingId="";
    const current=ledger.records.find(r=>r.id===queued.recordId);
    if(current && current.narrated===false)
      try{save({...ledger,records:ledger.records.map(r=>r.id===queued.recordId?{...r,narrated:true}:r)});}catch(_){}
    if(ownedLoading) state.chatLoading=false;
    window.__ltNarrationLock=false;
    render();
  }
}
function handle(body,agent,requestId){
  const source=String(body||"");
  const marks=[...source.matchAll(/⟪刮刮乐\s*[:：]\s*([^|⟫\n]+)(?:\|([^⟫\n]+))?⟫/g)];
  if(!marks.length) return source;
  if(narratingId) return source.replace(/⟪刮刮乐\s*[:：][^⟫]*⟫/g,"").trim();
  const clean=source.replace(/⟪刮刮乐\s*[:：][^⟫]*⟫/g,"").trim();
  const id=String(marks[0][1]||"").trim();
  const serial=String(marks[0][2]||"").trim();
  const bought=buy(id,serial,agent,requestId);
  if(!bought.ok) return (clean+"〔这张没买成："+bought.reason+"。〕").trim();
  if(!bought.duplicate) queuedNarration={recordId:bought.record.id,agentId:agent&&agent.id||""};
  return (clean+"\n\n"+resultText(bought.record)).trim();
}
function restock(gameId){
  const game=GAME_MAP[gameId];
  if(!game) return false;
  if(stock().some(t=>t.game.id===gameId)) return false;
  const next={...ledger,batches:{...ledger.batches,[gameId]:(Number(ledger.batches[gameId])||1)+1}};
  save(next);return true;
}
function redeem(recordId){
  const record=ledger.records.find(r=>r.id===recordId);
  if(!record || record.status!=="pending") return false;
  const prize=Math.round(Number(record.prize)||0);
  if(prize<=0) return false;
  let credited=false;
  try{
    walletEntry(prize,"刮刮乐兑奖 "+record.name+" "+record.serial,"operator");
    credited=true;
    save({...ledger,records:ledger.records.map(r=>r.id===recordId?{...r,status:"redeemed",fishPaid:prize,redeemedAt:new Date().toISOString()}:r)});
  }catch(_){
    if(credited) try{walletEntry(-prize,"刮刮乐兑奖失败冲正","system");}catch(_){}
    return false;
  }
  return true;
}
let selectedRecord = null;
let view = "shelf";
function renderAtTop(){
  render();
  const scroller=document.querySelector("#app > .lt-page");
  if(scroller) scroller.scrollTop=0;
}
function chatCardHtml(recordId,clickable){
  const record=ledger.records.find(r=>r.id===recordId);
  if(!record) return "";
  const revealed=record.narrated!==false;
  const status=!revealed ? "正在读票" : record.prize ? "中奖 "+record.prize+" "+unit()+" · "+(record.status==="redeemed"?"已入账":"待兑奖") : "未中奖";
  return '<div class="lt-chat-card"><strong>票号 '+escapeText(record.serial)+' · '+escapeText(record.name)+'</strong><span>'+status+'</span>'
    +'<details><summary>翻开刮开的票面</summary>'+ticketHtml(record,!revealed)+'</details>'
    +(clickable && revealed && record.status==="pending"?'<button type="button" data-lt-redeem="'+escapeText(record.id)+'">确认兑奖</button>':"")
    +'</div>';
}
const GLYPHS = [
  '<circle cx="24" cy="24" r="15"/><circle cx="24" cy="24" r="5"/>',
  '<path d="M24 7 41 24 24 41 7 24Z"/>',
  '<path d="M24 7 42 39H6Z"/>',
  '<rect x="9" y="9" width="30" height="30" rx="2"/>',
  '<path d="M24 5v38M5 24h38M10 10l28 28M38 10 10 38"/>',
  '<path d="M5 16c7-8 13-8 19 0s12 8 19 0M5 32c7-8 13-8 19 0s12 8 19 0"/>',
  '<path d="m24 6 5.3 12.7L43 20l-10.4 9 3.1 13L24 35l-11.7 7 3.1-13L5 20l13.7-1.3Z"/>',
];
function symbolGlyph(index){
  return '<svg class="lt-symbol" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'
    +GLYPHS[index % GLYPHS.length]+'</svg>';
}
function realTicketHtml(record,game,hideOutcome){
  const face=record.face;
  const cell=(item,i)=>{
    const won=!hideOutcome && (record.winCells||[]).includes(i);
    const label=escapeText(item.label||"");
    const amount=item.amount?(game.id==="egg"||game.id==="day"?"<small>奖金</small>":"<small>¥"+item.amount+"</small>"):"";
    return '<div class="lt-scratch-cell'+(won?' lt-win':'')+'">'
      +(game.id==="day"?'<em>'+String(i+1).padStart(2,"0")+'</em>':"")
      +'<strong>'+label+'</strong>'+amount+'</div>';
  };
  let header="";
  let board="";
  if(game.id==="chineseRed"){
    header='<div class="lt-scratch-rule">中奖号码 <b>'+face.winningNumbers.map(escapeText).join("　")+'</b></div>';
    board='<div class="lt-scratch-grid" style="--lt-cols:5">'+face.items.map(cell).join("")+'</div>'
      +'<div class="lt-scratch-lucky">幸运奖区 <b>'+(face.lucky.amount?'¥'+face.lucky.amount:'未中')+'</b></div>';
  }else if(game.id==="tenfold"){
    header='<div class="lt-scratch-rule">中奖号码 <b>'+escapeText(face.winningNumber)+'</b></div>';
    board='<div class="lt-scratch-rows">'+face.items.map((item,i)=>{
      const won=!hideOutcome && (record.winCells||[]).includes(i);
      return '<div class="lt-scratch-row'+(won?' lt-win':'')+'"><em>'+String(i+1).padStart(2,"0")+'</em>'
        +'<span>'+item.numbers.map(escapeText).join(' · ')+'</span><b>'+item.amount+'</b></div>';
    }).join("")+'</div>';
  }else{
    board='<div class="lt-scratch-grid" style="--lt-cols:'+game.cols+'">'+face.items.map(cell).join("")+'</div>';
  }
  return '<div class="lt-scratch lt-scratch--'+escapeText(game.id)+'">'
    +'<div class="lt-scratch-heading"><span>刮开区</span><b>'+game.chances+' 次机会</b></div>'
    +header+board
    +'<p class="lt-scratch-rules">'+ruleLines(game).map(escapeText).join('　')+'</p></div>';
}
function ticketHtml(record,hideOutcome=false){
  const game=GAME_MAP[record.gameId];
  if(!game) return "";
  if(game.real && record.face){
    return '<div class="lt-receipt">'
      +'<div class="lt-receipt-art"><span class="lt-receipt-eyebrow">LUCKY TICKET / '+escapeText(record.gameId.toUpperCase())+'</span>'
      +'<div class="lt-receipt-title">'+escapeText(record.name)+'</div>'
      +'<div class="lt-receipt-meta">'+escapeText(game.tagline)+'</div><b>'+record.price+' '+escapeText(unit())+'</b></div>'
      +realTicketHtml(record,game,hideOutcome)
      +'<div class="lt-receipt-foot"><span>票号 '+escapeText(record.serial)+'</span><strong>'
      +(hideOutcome?'等读完票面':record.prize?'中奖 '+record.prize+' '+unit():'未中奖')+'</strong></div></div>';
  }
  const cells=(record.cells||[]).map((index,i)=>{
    const symbol=game.symbols[index];
    return '<div class="lt-cell'+(!hideOutcome && (record.winCells||[]).includes(i)?' lt-win':'')+'"><span>'
      +symbolGlyph(index)+'</span><small>'
      +escapeText(symbol?symbol.name:"")+'</small></div>';
  }).join("");
  return '<div class="lt-receipt">'
    +'<div class="lt-receipt-art"><span class="lt-receipt-eyebrow">LUCKY TICKET / '+escapeText(record.gameId.toUpperCase())+'</span>'
    +'<div class="lt-receipt-title">'+escapeText(record.name)+'</div>'
    +'<div class="lt-receipt-meta">'+escapeText(game.tagline)+'</div><b>'+record.price+' '+escapeText(unit())+'</b></div>'
    +'<div class="lt-grid" style="grid-template-columns:repeat('+game.cols+',1fr)">'+cells+'</div>'
    +'<div class="lt-receipt-foot"><span>票号 '+escapeText(record.serial)+'</span><strong>'
    +(hideOutcome ? '等读完票面' : record.prize ? '中奖 '+record.prize+' '+unit() : '未中奖')+'</strong></div>'
    +'</div>';
}
function page(){
  const items=stock();
  const latest=ledger.records.find(r=>r.id===selectedRecord)||ledger.records[0];
  if(view==="receipts"){
    const due=pending().map(r=>'<div class="lt-claim">'
    +'<span>'+escapeText(r.name)+' · '+escapeText(r.serial)+'<br><b>待兑奖 '+r.prize+' '+unit()</b></span>'
      +'<button type="button" data-lt-redeem="'+escapeText(r.id)+'">确认兑奖</button></div>').join("");
    const history=ledger.records.map(r=>'<button type="button" class="lt-history" data-lt-view="'+escapeText(r.id)+'">'
      +'<span>'+escapeText(r.name)+' <small>'+escapeText(r.serial)+'</small></span>'
      +'<b>'+(r.prize ? r.status==="redeemed"?'已兑 '+r.prize:'待兑 '+r.prize:'未中奖')+'</b></button>').join("");
    return '<div class="page lt-page"><div class="sub-header"><button class="back-btn" type="button" data-lt-back>←</button><h2 class="page-title" style="margin:0">票根册</h2></div>'
      +(due?'<section class="lt-section"><h3>等你兑奖</h3>'+due+'</section>':'')
      +'<section class="lt-section"><h3>票面</h3>'+(latest?ticketHtml(latest):'<p class="lt-empty">还没有票根。</p>')+'</section>'
      +'<section class="lt-section"><h3>全部票根 · '+ledger.records.length+'</h3>'+(history||'<p class="lt-empty">还没有记录</p>')+'</section></div>';
  }
  const shelf=GAMES.slice().sort((a,b)=>a.price-b.price).map(g=>{
    const count=items.filter(t=>t.game.id===g.id).length;
    const skin=TICKET_SKINS[g.id];
    return '<div class="lt-slot">'
      +'<div class="lt-cover" role="img" aria-label="'+escapeText(skin[0]+'，'+g.price+' '+unit()+'，'+(count?count+'张现票':'已售罄'))+'">'
      +'<div class="lt-cover-head"><span>LUCKY TICKET</span><span>NO. '+String(GAMES.indexOf(g)+1).padStart(2,'0')+'</span></div>'
      +'<div class="lt-cover-center"><i aria-hidden="true">'+escapeText(skin[1])+'</i><strong>'+escapeText(skin[0])+'</strong><small>'+escapeText(g.tagline)+'</small></div>'
      +'<div class="lt-cover-grid" aria-hidden="true"><span></span><span></span><span></span></div>'
      +'<div class="lt-cover-foot"><span>'+g.price+' '+escapeText(unit())+'</span><span>'+(count?count+' 张现票':'已售罄')+'</span></div></div>'
      +(count?'':'<button type="button" data-lt-restock="'+g.id+'">补货 4 张</button>')
      +'</div>';
  }).join("");
  return '<div class="page lt-page">'+subHeader("幸运票局")
    +'<div class="lt-heading"><div><b>一人选票，一人兑奖</b>'
    +'<span>玩家自己买、自己刮；你只管补货和兑奖。</span></div>'
    +'<div class="lt-balance">'+balance()+' '+escapeText(unit())+'</div></div>'
    +'<div class="lt-limit">今天已刮 '+todaysCount()+' 张 · 想抽就可以自己抽</div>'
    +'<div class="lt-shelf-caption"><strong>选一张看看</strong><span>左右滑动 · '+GAMES.length+' 款</span></div>'
    +'<div class="lt-shelf">'+shelf+'</div>'
    +'<button type="button" class="lt-book-link" data-lt-book>票根册 · '+ledger.records.length+' 张'+(pending().length?'　待兑奖 '+pending().length+' 张':'')+'　→</button>'
    +'<p class="lt-note">虚拟票。中奖后由用户确认兑奖，奖金进入玩家钱包。</p></div>';
}
document.addEventListener("click",e=>{
  if(e.target.closest("#sub-back")){ view="shelf";selectedRecord=null;return; }
  const bookButton=e.target.closest("[data-lt-book]");
  if(bookButton){
    selectedRecord=null;
    view="receipts";state.tab="home";state.subPage="lottery";renderAtTop();return;
  }
  const backButton=e.target.closest("[data-lt-back]");
  if(backButton && state.subPage==="lottery"){
    view="shelf";selectedRecord=null;renderAtTop();return;
  }
  const restockButton=e.target.closest("[data-lt-restock]");
  if(restockButton && state.subPage==="lottery"){
    if(restock(restockButton.dataset.ltRestock)){
      if(typeof showToast==="function") showToast("补了 4 张新票");
      render();
    }
    return;
  }
  const redeemButton=e.target.closest("[data-lt-redeem]");
  if(redeemButton){
    if(redeem(redeemButton.dataset.ltRedeem)){
      if(typeof showToast==="function") showToast("中奖奖金已入账");
      render();
    }
    return;
  }
  const viewButton=e.target.closest("[data-lt-view]");
  if(viewButton && state.subPage==="lottery"){
    selectedRecord=viewButton.dataset.ltView;
    renderAtTop();
  }
});
if(!document.getElementById("lt-style")){
  const link=document.createElement("link");
  link.id="lt-style";link.rel="stylesheet";link.href="doodle/lottery.css";
  document.head.appendChild(link);
}
return {page,prompt,brief,handle,buy,stock,restock,redeem,chatCardHtml,scratchPacket,takePendingNarration,autoNarrate,latest:()=>ledger.records[0]||null,
  snapshot:()=>JSON.parse(JSON.stringify(ledger)),dayKey,DAY_LIMIT,dailyLimit};
})();
