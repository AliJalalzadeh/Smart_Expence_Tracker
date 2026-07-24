// let cost = 0
let inc = 0
let budget = 0
let costs = []
let data = {}
let sh_co = false
let sh_i = false
const prompt = require('prompt-sync')();
const fs = require("fs");

function getdata() {
    data = JSON.parse(
        fs.readFileSync("./data.json", "utf8")
    );
    budget = data.budget
    costs = data.costs
    inc = data.income
}
function def_log(sh_i, sh_co) {
    console.clear()
    console.log('                           ');
    console.log('                           ');
    console.log('                           ');
    console.log(`          WELCOME ✋`);
    console.log('          Smart Expence Tracker 📊');
    console.log('--------------------------------------');
    console.log('          your budget - ' + budget + ' ₼');
    if (sh_i) {
        console.log(`          your income -\x1b[32m  ${inc} ₼ \x1b[0m`);
    }
    if (sh_co) {
        console.log('--------------------------------------');
        console.log('                           ');
        if (!costs || costs.length == 0) {
            console.log('           \x1b[31mThere is not any cost yet. \x1b[0m')
        } else {
            costs.map((d, i) => {
                // console.log(`          ${i + 1}.${d.name}--${d.price}₼`);
                console.log(`           ${i + 1}.${d.name} -- \x1b[31m${d.price}₼ \x1b[0m`);
            })
        }
        console.log('                           ');
    }
    console.log('--------------------------------------');
    console.log('          you can see these:');
    console.log(`          1-${sh_i ? 'hide' : 'show'} income`);
    console.log(`          2-${sh_co ? 'hide' : 'show'} costs`);
    console.log(`          3-add cost`);
    console.log(`          4-refresh`);
    const n = prompt('          select number: ');
    switch (n) {
        case '1':
            sh_i = sh_i ? false : true
            break;
        case '2':
            sh_co = sh_co ? false : true
            break;
        case '3':
            const EnteredName = prompt('          if you cancel then press - c    enter cost name:')
            if (EnteredName == 'c') {
                break;
            }
            const EnteredPrice = prompt('           enter cost price:')
            if (!Number(EnteredPrice)) {
                break;
            }
            data.costs.push({
                "name": EnteredName,
                "price": Number(EnteredPrice),
            })
            data.budget = data.budget + Number(EnteredPrice)
            budget += Number(EnteredPrice)
            fs.writeFileSync("./data.json", JSON.stringify(data))
            break;
        case '4':
            getdata()
            break;
    }
    console.clear()
    def_log(sh_i, sh_co)
}
getdata()
def_log(sh_i, sh_co)