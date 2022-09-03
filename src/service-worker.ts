import { build, files, prerendered, version } from '$service-worker'

// echo worker
var clients = []
onconnect = function(e) {
    var port = e.ports[0]
    clients.push(port)
    port.addEventListener('message', function(e) {
        for (var i = 0; i < clients.length; i++) {
            var eElement = clients[i]
            eElement.postMessage(e.data)
        }
    })
    port.start()
} 
