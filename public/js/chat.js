const socket = io()

socket.on("countUpdated", (count) => {
  console.log(`The count has been updated! Now it is ${count}!`)
})

document.querySelector("#increment").addEventListener("click", () => {
  console.log("Clicked!")
  socket.emit("increment")
})