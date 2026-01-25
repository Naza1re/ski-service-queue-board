const tabs = document.querySelectorAll(".tab");
const blocks = document.querySelectorAll(".queue-block");
const forms = document.querySelectorAll(".form-block");


tabs.forEach(tab => {
tab.addEventListener("click", () => {
// Активная вкладка
tabs.forEach(t => t.classList.remove("active"));
tab.classList.add("active");


const target = tab.dataset.target;


// Переключаем блок очереди
blocks.forEach(block => {
block.classList.toggle("active", block.id === target);
});


// Переключаем форму
forms.forEach(form => {
form.classList.toggle("active", form.classList.contains(target));
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

        $.ajax(
            {
            url: 'http://localhost:8080/api/v0.1/queue/'+ queue + '/next',
            method: "POST",
            success: function(response) {
                $(".current").text(response.current)
                $(".next").text(response.next)
                $("#"+queue + "TicketNumber").val(response.current)
            }
            }
        )
    });
});


fetchQueuesSequentially();

$("#clientForm").on("submit", function (e) {
e.preventDefault();


const client = {
fullName: $("#fullName").val(),
height: Number($("#height").val()),
weight: Number($("#weight").val()),
shoeSize: Number($("#shoeSize").val()),
skillLevel: $("#skillLevel").val(),
ticketNumber: Number($("#registrationTicketNumber").val())
};


$.ajax({
url: "http://localhost:8080/api/v0.1/clients",
method: "POST",
contentType: "application/json",
data: JSON.stringify(client),


success: function (response) {
console.log(response);


$("#clientForm")[0].reset();
},


error: function (err) {
console.error(err);
alert("Ошибка");
}
});
});
