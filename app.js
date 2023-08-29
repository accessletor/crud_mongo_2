const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
require('./utils/db');
const Contact = require('./model/contact');
const { body, validationResult, check, cookie } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const app = express();
const port = 3000;

// set up method override
app.use(methodOverride('_method'));

// set up ejs
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));

// halaman home
app.get('/', (req, res) => {
  const mahasiswa = [
    {
      nama: "asep",
      email: "asepsan@gmail.com"
    },
    {
      nama: "doddy",
      email: "doddysan@gmail.com"
    },
    {
      nama: "rapih",
      email: "rapihsan@gmail.com"
    }
  ];

  res.render('index', {
    nama: 'asep san',
    layout: 'layouts/main-layouts',
    title: 'mahasiswa',
    mahasiswa: mahasiswa
  });
});

// about
app.get('/about', (req, res) => {
  res.render('about', { layout: 'layouts/main-layouts', title: 'halaman about' });
});

// contact  
app.get('/contact', async (req, res) => {
  const contacts = await Contact.find();
  res.render('contact', { layout: 'layouts/main-layouts', title: 'halaman contact', contacts });
});

// tambah contact
app.get('/contact/add', async (req, res) => {
  const contacts = await Contact.find();
  const contact = null; // Initialize contact variable as null
  res.render('add', { layout: 'layouts/main-layouts', title: 'halaman tambah kontak', contacts, contact });
});

// process tambah data
app.post('/contact', [
  check('nama')
    .notEmpty().withMessage('Nama tidak boleh kosong')
    .custom(async (value) => {
      const validasi = await Contact.findOne({ nama: value });
      if (validasi) {
        throw new Error('nama tersebut sudah ada silahkan gunakan nama lain');
      }
      return true;
    }),
  check('email', 'format email salah').isEmail(),
  check('nohp', 'format nomor hp harus indonesia').isMobilePhone('id-ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const contacts = await Contact.find();
    res.render('add', { layout: 'layouts/main-layouts', title: 'halaman tambah kontak', contacts, errors: errors.array() });
  } else {
    const contact = new Contact(req.body);
    contact.save(async (error, result) => {
      const successMessage = "Data Telah berhasil di tambahkan";
      const contacts = await Contact.find();
      res.render('contact', { layout: 'layouts/main-layouts', title: 'halaman contact', contacts, successMessage });
    });
  }
});

// hapus kontak
app.delete('/contact', async (req, res) => {
  await Contact.deleteOne({ nama: req.body.nama });
  const successMessage = "Data Contact berhasil dihapus";
  const contacts = await Contact.find();
  res.render('contact', { layout: 'layouts/main-layouts', title: 'halaman tambah kontak', contacts, successMessage });
});

// edit data
app.get('/contact/edit/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  const contacts = await Contact.find();
  res.render('edit-contact', { layout: 'layouts/main-layouts', title: 'form ubah data', contact, contacts });
});

// process ubah data
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama contact sudah digunakan");
      }
      return true;
    }),
    check("email", "Email tidak valid").isEmail(),
    check("noHP", "No HP tidak valid").isMobilePhone("id-ID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Ubah Data",
        layout: "layouts/main-layouts",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      await Contact.updateOne({ _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp
          }
        });
      req.flash("msg", "Data contact berhasil diubah!");
      res.redirect("/contact");
    }
  }
);

// detail
app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render('detail', { layout: 'layouts/main-layouts', title: 'halaman detail', contact });
});

app.listen(port, () => {
  console.log(`mongo contact app | listening at http://localhost:${port}`);
});