const socket = io();

// Elements

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

// Templates

const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationTemplate = document.querySelector("#location-template")
  .innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options

// This is one of the imported JS files that helps in parsing query strings
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  $newMessage = $messages.lastElementChild;

  // New message total height
  newMessageHeight =
    $newMessage.offsetHeight +
    parseInt(getComputedStyle($newMessage).marginBottom);

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Messages container height
  const containerHeight = $messages.scrollHeight;

  // How far has user scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
};

socket.on("message", (message) => {
  // console.log(message);

  const html = Mustache.render($messageTemplate, {
    username: message.username,
    text: message.text,
    createdAt: moment(message.createdAt).format("h:mm A"),
  });
  $messages.insertAdjacentHTML("beforeend", html);

  autoscroll();
});

socket.on("locationMessage", (location) => {
  // console.log(location);

  const html = Mustache.render($locationTemplate, {
    username: location.username,
    url: location.url,
    createdAt: moment(location.createdAt).format("h:mm A"),
  });
  $messages.insertAdjacentHTML("beforeend", html);

  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
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

socket.emit(
  "join",
  {
    username,
    room,
  },
  (error) => {
    if (error) {
      alert(error);
      location.href = "/";
    }
  }
);

// DEPRECATED CODE FOR LEARNING

// socket.on("countUpdated", (count) => {
//   console.log(`The count has been updated! Now it is ${count}!`)
// })

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("Clicked!")
//   socket.emit("increment")
// })
