const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/wpu',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});


// menambah 1 data
// const contact1 = new Contact({
//     nama: "dodddy",
//     nohp: "08645666532",
//     email: "doddy@gmail.com"
// })

// // simpan collection
// contact1.save().then((contact) => console.log(contact))