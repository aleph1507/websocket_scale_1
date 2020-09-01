window.onload = function() {
    let ws = [];
    for (let i  = 0; i<200; i++) {
        ws[i] = new WebSocket("ws://localhost:8082");
        ws[i].onopen = param => {
            console.log(`param: ${JSON.stringify(param)}`);
            // ws[i].send('Hello from WebScocket client ' + i);
            ws[i].send(i);
        }
        ws[i].onmessage = message => console.log(`Received: ${message.data}`);
    }

}

// let sock = new WebSocket('ws://localhost:8082');
