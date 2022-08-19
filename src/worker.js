const browserInstances = [];
const messages = [];

onconnect = function(e) {
  const port = e.ports[0]
  browserInstances.push(port)
  port.onmessage = function(event) {
    messages = [...messages, event.data];
    browserInstances.forEach(instance => {
      instance.postMessage(messages.length);
    });
  }
}
