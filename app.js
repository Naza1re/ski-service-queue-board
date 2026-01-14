
const currentEl = document.getElementById("current");
const nextEl = document.getElementById("next");


const socket = new SockJS("http://localhost:8080/ws");
const stompClient = Stomp.over(socket);


stompClient.connect({}, function(frame) {
    console.log("Connected: " + frame);

    stompClient.subscribe("/topic/queue", function(message) {
        const data = JSON.parse(message.body);
        currentEl.textContent = data.current;
        nextEl.textContent = data.next;
    });
});
