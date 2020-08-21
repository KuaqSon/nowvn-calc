// you will see this log in console log of current tab in Chrome when the script is injected
console.log("content_script.js");

chrome.runtime.onMessage.addListener(function (cmd, sender, sendResponse) {
  console.log("chrome.runtime.onMessage: " + cmd);
  switch (cmd) {
    case "getHtml":
      // retrieve document HTML and send to popup.js
      sendResponse({
        title: document.title,
        url: window.location.href,
        html: document.documentElement.innerHTML,
      });
      break;
    case "getHeadTitle":
      // retrieve title HTML and send to popup.js
      sendResponse(document.getElementsByTagName("title")[0].innerHTML);
      break;
    case "dumpMoney":
      console.log("dumpMoney");
      dumpMoney();
      sendResponse(null);
      break;
    case "dumpOrders":
      dumpOrders();
      sendResponse(null);
      break;
    default:
      sendResponse(null);
  }
});

async function dumpMoney() {
  var rows = [...document.querySelectorAll("div.history-table-row a[data-toggle='modal']")];

  var dues = [];

  for (let index = 0; index < rows.length; index++) {
    const btt = rows[index];
    const checkbox = document.querySelector(`input#order_row__${index}[type="checkbox"]:checked`);
    if (!checkbox) {
      continue;
    }

    btt.click();

    await asyncWait(2000);

    var cost = document.querySelector("div.modal-body div.history-table-row[style^='background'] strong.text-danger");
    console.log("dumpMoney -> cost", cost);

    if (cost) {
      var mo = cost.innerText;
      dues.push(mo);
    }
  }
  var money = calculateMoney(dues);

  var closeBtn = document.querySelector("div.modal-content button.btn.btn-danger.btn-width-long[data-dismiss='modal']");
  if (closeBtn) {
    closeBtn.click();
  }

  const display = document.querySelector("h1.block-title.mb-4.text-center");
  if (!display) {
    return;
  }

  display.innerHTML = `<h1 style="color: red;">Số tiền phải thanh toán: ${formatMoney(money)}</h1>`;

  return;
}

function formatMoney(money) {
  return `${money}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + " đ";
}

function calculateMoney(dues) {
  var due = 0;

  for (var moneyText of dues) {
    moneyText = moneyText.replace(/,/g, "");
    moneyText = moneyText.replace(/đ/g, "");
    try {
      due += Number(moneyText);
    } catch (e) {
      console.log("calculateMoney -> e", e);
      return 0;
    }
  }

  return due;
}

function asyncWait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function dumpOrders() {
  var rows = [...document.querySelectorAll("div.history-table-row:not(.history-table-heading)")];

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];

    var className = `order_row__${index}`;

    row.className = row.className + " " + className;

    var check = document.createElement("div");
    check.innerHTML = `<div style="padding: 12px;"><input style="width: 20px; height: 20px;" type="checkbox" id="${className}" name="${className}" checked /></div>`;
    row.append(check);
  }
}
