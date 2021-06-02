
console.log("asd")

console.log(response);

})

window.onload = () => {

    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
      }

    if(Notification.permission !== "denied"){
        Notification.requestPermission();
    }


}

function sendNotification(text){
    var notification = new Notification(text);
   
}

