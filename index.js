// Smart Expense Tracker - improved CLI UI
const prompt = require('prompt-sync')();
const fs = require('fs');

let data = { budget: 0, income: 0, costs: [] };
let showIncome = false;
let showCosts = false;

function loadData() {
  try {
    const raw = fs.readFileSync('./data.json', 'utf8');
    data = JSON.parse(raw);
    // ensure structure
    data.budget = Number(data.budget) || 0;
    data.income = Number(data.income) || 0;
    data.costs = Array.isArray(data.costs) ? data.costs : [];
  } catch (err) {
    // if file missing or invalid, initialize with defaults and write file
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
  }
}

function saveData() {
  fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
}

function formatAmount(n) {
  return `${n.toFixed(2)} ₼`;
}

function totalCosts() {
  return data.costs.reduce((s, c) => s + Number(c.price || 0), 0);
}

function clear() {
  console.clear();
}

function drawHeader() {
  console.log('╔' + '═'.repeat(38) + '╗');
  console.log('║' + centerText('SMART EXPENSE TRACKER', 38) + '║');
  console.log('╠' + '═'.repeat(38) + '╣');
}

function centerText(txt, width) {
  const pad = Math.max(0, Math.floor((width - txt.length) / 2));
  return ' '.repeat(pad) + txt + ' '.repeat(width - pad - txt.length);
}

function drawSummary() {
  const costsSum = totalCosts();
  const balance = data.budget + data.income - costsSum;

  console.log(`║ Budget : \x1b[33m${formatAmount(data.budget)}\x1b[0m` + ' '.repeat(12) + `║`);
  console.log(`║ Income : \x1b[32m${formatAmount(data.income)}\x1b[0m` + ' '.repeat(12) + `║`);
  console.log(`║ Spent  : \x1b[31m${formatAmount(costsSum)}\x1b[0m` + ' '.repeat(12) + `║`);
  console.log(`║ Balance: ${balance >= 0 ? '\x1b[32m' : '\x1b[31m'}${formatAmount(balance)}\x1b[0m` + ' '.repeat(11) + `║`);
}

function drawFooter() {
  console.log('╠' + '═'.repeat(38) + '╣');
  console.log('║' + centerText('Commands', 38) + '║');
  console.log('╠' + '═'.repeat(38) + '╣');
  console.log('║ 1) Toggle Income  2) Toggle Costs        ║');
  console.log('║ 3) Add Cost       4) Add Income         ║');
  console.log('║ 5) Remove Cost    6) Refresh            ║');
  console.log('║ 7) Exit                                   ║');
  console.log('╚' + '═'.repeat(38) + '╝');
}

function showCostsList() {
  if (data.costs.length === 0) {
    console.log('\n-- No costs recorded --\n');
    return;
  }
  console.log('\nCosts:');
  data.costs.forEach((c, i) => {
    console.log(` ${i + 1}. ${c.name} - \x1b[31m${formatAmount(Number(c.price))}\x1b[0m`);
  });
  console.log('');
}

function promptNumber(promptText) {
  const v = prompt(promptText);
  if (!v) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return n;
}

function mainLoop() {
  while (true) {
    clear();
    drawHeader();
    drawSummary();

    if (showIncome) {
      console.log('\n' + 'Income details:');
      console.log(`  + ${formatAmount(data.income)}`);
    }

    if (showCosts) {
      showCostsList();
    }

    drawFooter();

    const choice = prompt('\nSelect a command (1-7): ');
    switch (choice) {
      case '1':
        showIncome = !showIncome;
        break;
      case '2':
        showCosts = !showCosts;
        break;
      case '3': { // add cost
        const name = prompt('Enter cost name (or c to cancel): ');
        if (!name || name.toLowerCase() === 'c') break;
        const price = promptNumber('Enter cost amount: ');
        if (price === null || price < 0) {
          console.log('Invalid amount. Press Enter to continue.');
          prompt('');
          break;
        }
        data.costs.push({ name: name.trim(), price: Number(price) });
        saveData();
        console.log('Cost added. Press Enter to continue.');
        prompt('');
        break;
      }
      case '4': { // add income
        const amount = promptNumber('Enter income amount (or blank to cancel): ');
        if (amount === null) break;
        data.income = Number(data.income) + Number(amount);
        saveData();
        console.log('Income updated. Press Enter to continue.');
        prompt('');
        break;
      }
      case '5': { // remove cost
        if (data.costs.length === 0) {
          console.log('No costs to remove. Press Enter to continue.');
          prompt('');
          break;
        }
        showCostsList();
        const idx = promptNumber('Enter cost number to remove (or 0 to cancel): ');
        if (!idx) break;
        if (idx <= 0 || idx > data.costs.length) {
          console.log('Invalid selection. Press Enter to continue.');
          prompt('');
          break;
        }
        const removed = data.costs.splice(idx - 1, 1)[0];
        saveData();
        console.log(`Removed \"${removed.name}\" (${formatAmount(Number(removed.price))}). Press Enter to continue.`);
        prompt('');
        break;
      }
      case '6':
        loadData();
        console.log('Data reloaded. Press Enter to continue.');
        prompt('');
        break;
      case '7':
        console.log('\nGoodbye 👋\n');
        process.exit(0);
        break;
      default:
        console.log('Unknown command. Press Enter to continue.');
        prompt('');
    }
  }
}

// Start
loadData();
mainLoop();
