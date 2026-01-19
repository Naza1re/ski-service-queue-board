const tabs = document.querySelectorAll(".tab");
const blocks = document.querySelectorAll(".queue-block");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const target = tab.dataset.target;
        blocks.forEach(block => {
            block.classList.toggle("active", block.id === target);
        });
    });
});

const socket = new SockJS("http://localhost:8080/ws");
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    console.log("Connected: " + frame);

    const queues = ["registration", "rental", "payment"];
    queues.forEach(queue => {
        stompClient.subscribe(`/topic/queue/${queue}`, function(message) {
            const data = JSON.parse(message.body);
            const block = document.getElementById(queue);
            block.querySelector(".current").textContent = data.current ?? "-";
            block.querySelector(".next").textContent = data.next ?? "-";
        });
    });
});

const queues = ["registration", "rental", "payment"];
async function fetchQueuesSequentially() {
    for (const queue of queues) {
        try {
            const res = await fetch(`http://localhost:8080/api/v0.1/queue/${queue}`);
            const data = await res.json();
            const block = document.getElementById(queue);
            block.querySelector(".current").textContent = data.current ?? "-";
            block.querySelector(".next").textContent = data.next ?? "-";
        } catch(err) {
            console.error(`Error fetching queue ${queue}:`, err);
        }
    }
}

document.querySelectorAll(".next-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
        const block = e.target.closest(".queue-block");
        const queue = block.id;

        try {
            const res = await fetch(`http://localhost:8080/api/v0.1/queue/${queue}/next`, {
                method: "POST"
            });
            const data = await res.json();
            block.querySelector(".current").textContent = data.current ?? "-";
            block.querySelector(".next").textContent = data.next ?? "-";
        } catch(err) {
            console.error(`Error moving queue ${queue}:`, err);
        }
    });
});


fetchQueuesSequentially();
