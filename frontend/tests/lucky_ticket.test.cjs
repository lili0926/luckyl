const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const store = new Map(), wallet = {balance:1000,ledger:[]};
let walletDisk='', failWalletSave=false;
let now='2026-10-21T04:00:00Z', seed=6917;
let forcedRoll=null;
const random=()=>forcedRoll===null
  ? ((seed=(seed*1664525+1013904223)>>>0)/4294967296)
  : ((value)=>{forcedRoll=null;return value;})(forcedRoll);
class TestDate extends Date {
  constructor(...args){ super(...(args.length?args:[now])); }
  static now(){ return Date.parse(now); }
}
const document = {addEventListener(){},getElementById(){return null;},createElement(){return {};},head:{appendChild(){}}};
const context = {
  localStorage:{getItem:k=>store.get(k)||null,setItem:()=>{throw Object.assign(Error('quota'),{name:'QuotaExceededError'});}},
  document,window:{},state:{subPage:'lottery',chatLoading:false,agents:[{id:'a1'}]},render(){},showToast(){},
  ensureWallet:()=>wallet,walletUnit:()=> '小鱼干',
  walletSave:()=>{if(failWalletSave)throw Error('wallet save failed');walletDisk=JSON.stringify(wallet);},
  walletEntry:(n,note)=>{wallet.balance+=n;wallet.ledger.unshift({amount:n,note});context.walletSave();},
  postAppEvent(){},subHeader:()=>'<header></header>',setTimeout,Date:TestDate,
  Math:Object.assign(Object.create(Math),{random}),
  buildMainChatRequest(_agent,hint){context.lastScratchHint=hint;return {apiMsgs:[],sys:hint};},
  async callOneAgentReply(_agent,_messages,sys){context.lastScratchRequest=sys;},
};
vm.runInNewContext(fs.readFileSync(__dirname+'/../parts/27_lucky_ticket.js','utf8')+'\nthis.ticket=LuckyTicket;',context);
const t=context.ticket;
const specs=[
  ['egg',15,'砸彩蛋'],['day',31,'幸运日'],['chineseRed',20,'中国红'],
  ['reunion',25,'喜相逢'],['tenfold',10,'十倍幸运'],['big7',20,'大7'],
];
function expected(record){
  const f=record.face, sum=f.items.reduce((a,v)=>a+v.amount,0);
  return f.items.reduce((total,v)=>{
    if(record.gameId==='egg'||record.gameId==='day') return total+v.amount;
    if(record.gameId==='reunion') return total+v.amount*(v.label==='喜'?1:v.label==='囍'?2:0);
    if(record.gameId==='big7') return total+v.amount*(v.label==='7'?1:v.label==='77'?2:v.label==='777'?3:0);
    if(record.gameId==='chineseRed') return total+(f.winningNumbers.includes(v.label)?v.amount:
      v.label==='红'?v.amount*2:v.label==='灯笼'?v.amount*5:v.label==='中国结'?sum:0);
    if(record.gameId==='tenfold') return total+(v.numbers.includes('双鱼')?v.amount*10:
      v.numbers.includes(f.winningNumber)?v.amount:0);
  },f.lucky?.amount||0);
}
async function run(){
  assert.equal(t.stock().length,24,'only six reference games are stocked');
  failWalletSave=true;
  const failed=t.buy('egg','',{id:'a1'},'failed-save');
  failWalletSave=false;
  assert.equal(failed.ok,false);
  assert.equal(wallet.balance,1000,'a failed wallet write must not charge the player');
  assert.equal(wallet.ledger.length,0);
  assert.equal(t.stock().length,24,'a failed wallet write must not sell the ticket');
  assert.equal(t.stock().filter((v,i,a)=>a.findIndex(x=>x.game.id===v.game.id)===i).map(x=>x.game.id).join(','),specs.map(x=>x[0]).join(','));
  assert.match(t.page(),/左右滑动 · 6 款/);
  assert.equal((t.page().match(/class="lt-cover"/g)||[]).length,6);
  assert.doesNotMatch(t.page(),/lt-receipt-art/,'stubs stay on a separate page');
  for(const [id,count,name] of specs){
    const available=t.stock().find(x=>x.game.id===id);
    const marker='⟪刮刮乐:'+id+'|'+available.serial+'⟫';
    assert.match(t.handle(marker,{id:'a1'},'turn-'+id),/票面已经刮开/);
    const r=t.latest();
    assert.equal(r.name,name);
    assert.equal(r.face.items.length,count);
    assert.equal(r.prize,expected(r),'payout must match revealed cells and this game\'s rules');
    assert.ok(r.prize<=available.game.maxPrize);
    assert.equal(t.scratchPacket(r).cells.length,count);
    assert.equal('prize' in t.scratchPacket(r),false);
    assert.match(t.chatCardHtml(r.id,true),new RegExp('lt-scratch--'+id));
    assert.match(t.chatCardHtml(r.id,true),/正在读票/);
    assert.doesNotMatch(t.chatCardHtml(r.id,true),/data-lt-redeem=/);
    const queued=t.takePendingNarration();
    await t.autoNarrate(queued);
    assert.match(context.lastScratchRequest,/cells/);
    if(r.prize){
      const before=wallet.balance;
      assert.equal(t.redeem(r.id),true);
      assert.equal(wallet.balance,before+r.prize,'virtual prize credits fish 1:1');
      assert.equal(t.redeem(r.id),false,'no duplicate payout');
    }
  }
  const red=t.snapshot().records.find(r=>r.gameId==='chineseRed');
  assert.equal(red.face.winningNumbers.length,5);
  assert.ok(red.face.lucky);
  assert.equal(t.snapshot().records.find(r=>r.gameId==='tenfold').face.items.every(x=>x.numbers.length===6),true);
  assert.match(t.page(),/票根册 · 6 张/);
  if(process.env.LT_PREVIEW){
    const cards=[...t.snapshot().records].reverse().filter(r=>!process.env.LT_PREVIEW_GAME||r.gameId===process.env.LT_PREVIEW_GAME).map(r=>t.chatCardHtml(r.id,true).replace('<details>','<details open>')).join('');
    fs.writeFileSync(process.env.LT_PREVIEW,'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><title>六款票面预览</title><link rel="stylesheet" href="frontend/doodle/lottery.css"><main class="lt-page" style="width:360px;max-width:100%;margin:auto"><h1>刮开区预览</h1>'+cards+'</main>');
  }
  for(const ticket of t.stock()){
    const bought=t.buy(ticket.game.id,ticket.serial,{id:'a1'},'extra-'+ticket.id);
    assert.equal(bought.ok,true);
    assert.equal(bought.record.prize,expected(bought.record),'all remaining stock follows its printed rule');
    assert.ok(bought.record.prize<=ticket.game.maxPrize);
  }
  assert.equal(t.stock().length,0);
  assert.equal(JSON.parse(walletDisk).luckyTickets.records.length,24,'tickets survive without localStorage writes');
  const restoredWallet=JSON.parse(walletDisk);
  const reloaded={...context,state:{...context.state,wallet:restoredWallet},ensureWallet:()=>restoredWallet,
    walletEntry:(n,note)=>{restoredWallet.balance+=n;restoredWallet.ledger.unshift({amount:n,note});}};
  vm.runInNewContext(fs.readFileSync(__dirname+'/../parts/27_lucky_ticket.js','utf8')+'\nthis.ticket=LuckyTicket;',reloaded);
  assert.equal(reloaded.ticket.snapshot().records.length,24,'tickets reload from persisted wallet');
  now='2026-10-22T04:00:00Z';
  assert.equal(t.dailyLimit(),Infinity);
  wallet.balance=10000;
  for(const [id] of specs){
    assert.equal(t.restock(id),true);
    assert.match(t.prompt(),/想抽的时候可以自己决定/);
    for(const [roll,prize] of [[0.009,500],[0.01,'ordinary'],[0.699,'ordinary'],[0.70,0]]){
      forcedRoll=roll;
      const bought=t.buy(id,'',{id:'a1'},'odds-'+id+'-'+roll);
      assert.equal(bought.ok,true);
      const record=bought.record;
      assert.equal(record.prize,expected(record),'the printed ticket determines the payout');
      assert.ok(record.prize<=500,'all new tickets cap at 500 fish');
      if(prize==='ordinary') assert.ok(record.prize>0 && record.prize<500);
      else assert.equal(record.prize,prize);
    }
  }
  const oldStore=new Map([['luckyl-ticket-v1',JSON.stringify({batches:{},sold:[],records:[{id:'old-ticket',gameId:'egg',prize:0,status:'lost'}],processed:[]})]]);
  const oldWallet={balance:100,ledger:[]};
  const migrated={...context,localStorage:{getItem:k=>oldStore.get(k)||null},ensureWallet:()=>oldWallet,
    walletSave(){},walletEntry:n=>{oldWallet.balance+=n;}};
  vm.runInNewContext(fs.readFileSync(__dirname+'/../parts/27_lucky_ticket.js','utf8')+'\nthis.ticket=LuckyTicket;',migrated);
  assert.equal(migrated.ticket.latest().id,'old-ticket','existing ticket stubs remain readable');
  assert.equal(migrated.ticket.buy('egg','',{id:'a1'},'legacy-migration').ok,true);
  assert.equal(oldWallet.luckyTickets.records.length,2,'old ticket stubs migrate into wallet storage');
  console.log('six distinct ticket layouts, rules, payout, narration and redemption passed');
}
run().catch(e=>{console.error(e);process.exitCode=1;});

