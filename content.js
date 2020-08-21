$(function () {
  $("#get_head_title").click(function () {
    checkCurrentTab();
  });

  $("#get_html").click(function () {
    getHtml();
  });

  $("#dump_money").click(function () {
    $(".main_img").addClass("shaking");

    setTimeout(function () {
      $(".main_img").removeClass("shaking");
    }, 3000);

    dumpMoney();
  });

  $("#dump_orders").click(function () {
    dumpOrders();
  });
});

function dumpMoney() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, "dumpMoney", null, function (text) {});
  });
}

function dumpOrders() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, "dumpOrders", null, function (text) {});
  });
}

function getHtml() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    var url = tabs[0].url;
    console.log("checkCurrentTab: " + url);
    $(".pg_url").text(url);

    // request content_script to retrieve title element innerHTML from current tab
    chrome.tabs.sendMessage(tabs[0].id, "getHtml", null, function (obj) {
      console.log("getHeadTitle.from content_script:", obj);
      log("from content_script:" + obj.url);
    });
  });
}

function checkCurrentTab() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    var url = tabs[0].url;
    console.log("checkCurrentTab: " + url);
    $(".pg_url").text(url);

    // request content_script to retrieve title element innerHTML from current tab
    chrome.tabs.sendMessage(tabs[0].id, "getHeadTitle", null, function (obj) {
      console.log("getHeadTitle.from content_script:", obj);
      log("from content_script:" + obj);
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  chrome.windows.getCurrent(function (currentWindow) {
    chrome.tabs.query({ active: true, windowId: currentWindow.id }, function (activeTabs) {
      // inject content_script to current tab
      chrome.tabs.executeScript(activeTabs[0].id, {
        file: "content_script.js",
        allFrames: false,
      });
    });
  });
});

function log(txt) {
  var h = $("#log").html();
  $("#log").html(h + "<br>" + txt);
}
