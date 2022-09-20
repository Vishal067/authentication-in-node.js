// disable right click
document.getElementById("formSubmit").disabled = true;
document.getElementById("formSubmit").style.cursor = "not-allowed";
document.addEventListener("contextmenu", (event) => event.preventDefault());
// disable F12
document.onkeydown = function (e) {
  e = e || window.event;
  if (e.key == 123) {
    return false;
  }
  if (e.ctrlKey && e.shiftKey && e.key == "I".charCodeAt(0)) {
    return false;
  }
};
//disable view page source
document.onkeydown = function (e) {
  e = e || window.event;
  if (e.key == 123) {
    return false;
  }
  if (e.ctrlKey && e.shiftKey && e.key == "I".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.shiftKey && e.key == "C".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.shiftKey && e.key == "J".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.key == "U".charCodeAt(0)) {
    return false;
  }
};
document.getElementById("pswrd-1").addEventListener("input", validate);
document.getElementById("pswrd-2").addEventListener("input", validate);
var regex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

let check = function () {
  if (
    document.getElementById("pswrd-1").value ==
    document.getElementById("pswrd-2").value
  ) {
    document.getElementById("formSubmit").disabled = false;
    document.getElementById("formSubmit").style.background =
      "rgb(51, 162, 181)";
    document.getElementById("message").style.color = "green";
    document.getElementById("formSubmit").style.cursor = "pointer";
    document.getElementById("message").innerHTML = "Password Matched";
  } else {
    document.getElementById("formSubmit").disabled = true;
    document.getElementById("formSubmit").style.background = "grey";
    document.getElementById("message").style.color = "red";
    document.getElementById("formSubmit").style.cursor = "not-allowed";
    document.getElementById("message").innerHTML = "Password not matching";
  }
};
function validate() {
  if (!regex.test(document.getElementById("pswrd-1").value)) {
    document.getElementById("pwd-length-1").innerHTML =
      "Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character";
  } else {
    document.getElementById("pwd-length-1").innerHTML = "";
    check();
  }
}

var icon_1 = document.getElementById("icon");
var icon_2 = document.getElementById("icon2");
icon_2.addEventListener("click", function () {
  showPwd("pswrd-2", "icon2");
});

// document.getElementById("icon-2").addEventListener("click", showPwd('pswrd-2', "icon-2"));
icon_1.addEventListener("click", function () {
  showPwd("pswrd-1", "icon");
});

function showPwd(id, el) {
  let x = document.getElementById(id);
  if (x.type === "password") {
    x.type = "text";
    document.getElementById(el).className = "fa fa-eye-slash showpwd";
  } else {
    x.type = "password";
    document.getElementById(el).className = "fa fa-eye showpwd";
  }
}
