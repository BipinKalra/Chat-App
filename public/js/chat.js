const socket = io();

// Elements

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates

const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationTemplate = document.querySelector("#location-template")
  .innerHTML;

socket.on("message", (message) => {
  // console.log(message);

  const html = Mustache.render($messageTemplate, {
    message,
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (url) => {
  console.log(url);

  const html = Mustache.render($locationTemplate, {
    url,
  });
  $messages.insertAdjacentHTML("beforeend", html)
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  // Alterntive way to get form elements
  const message = e.target.elements.message.value;

  // The last arguument is the acknowledgement function
  socket.emit("textMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log("Message Delivered!");
  });
});

document.querySelector("#send-location").addEventListener("click", () => {
  // navigator.geolocation contains value only if the browser that you are using supports geolocation

  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser!");
  }

  $locationButton.setAttribute("disabled", "disabled");

  // This is an async function but doesn't support async-await or promises
  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position)
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $locationButton.removeAttribute("disabled");
        console.log("Location Shared!");
      }
    );
    // console.log(position.coords)
  });
});

// DEPRECATED CODE FOR LEARNING

// socket.on("countUpdated", (count) => {
//   console.log(`The count has been updated! Now it is ${count}!`)
// })

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("Clicked!")
//   socket.emit("increment")
// })
