function socketMain(io, socket){
    console.log("A socket connectd!", socket.id)

    socket.on('clientAuth',(key)=>{
        if(key === '5t78yuhgirekjaht32i3'){
            // valid nodeClient
            socket.join('clients');
        }else if(key === 'uihjt3refvdsadf'){
            // valid ui client has joined
            socket.join('ui');
            console.log("A react client has joined!");
            Machine.find({}, (err,docs)=>{
                docs.forEach((aMachine)=>{
                    // on load, assume that all machines are offline
                    aMachine.isActive = false;
                    io.to('ui').emit('data',aMachine);
                })
            })
        }else{
            // an invalid client has joined. Goodbye
            socket.disconnect(true);
        }
    })

    socket.on('perfData',(data)=>{
        console.log(data)
    });
}

module.exports = socketMain;