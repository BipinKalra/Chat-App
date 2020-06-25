const socket = io()

socket.on("welcomeMessage", () => {
  console.log("Welcome!")
})

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault()

  const message = document.querySelector("input").value

  socket.emit("textMessage", message)
})

socket.on("message", (message) => {
  console.log(message)
})

// DEPRECATED CODE FOR LEARNING

// socket.on("countUpdated", (count) => {
//   console.log(`The count has been updated! Now it is ${count}!`)
// })

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("Clicked!")
//   socket.emit("increment")
// })