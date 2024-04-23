var express = require('express');
var router = express.Router();
let googleNewsAPI = require('google-news-json');

const fs = require('fs');
const pkg = require('docx');
const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } = pkg;
// we need axios to make HTTP requests
const axios = require('axios');

// and we need jsdom and Readability to parse the article HTML
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

var array = [];
var resultado = [];

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Epi - News' });
});

router.get('/searchNews', function (req, res, next) {
  res.render('searchNews', { title: 'Epi - Buscador' });
});

/*---------- POST searchNews -----------------------------------------------*/
router.post('/searchNews', function (req, res, next) {
  //asignamos la busqueda para el idioma seleccionado
  const language = req.body.selectIdioma;

  //validar la busqueda y concatenar en caso de que sea necesario
  let busqueda = "Salud";
  let categoria = req.body.selectCategoria;

  //revisar el lenguaje del formulario
  if (language == "en-GB") {
    switch (categoria) {
      case "Ciencia":
        categoria = "Science";
        break;
      case "Deportes":
        categoria = "Sports";
        break;
      case "Entretenimiento":
        categoria = "Entertainment";
        break;
      case "General":
        categoria = "General";
        break;
      case "Negocios":
        categoria = "Business";
        break;
      case "Salud":
        categoria = "Health";
        break;
      case "Tecnología":
        categoria = "Technology";
        break;
      default:
        categoria = "Health";
        break;
    }
  }

  //si tiene categoria pero no tiene palabra busco por la categoria
  if (categoria != "" && req.body.txtPalabra == "") {
    busqueda = categoria;
  } else if (categoria == "" && req.body.txtPalabra != "") {
    //si no tiene categoria pero tiene palabra busco por la palabra
    busqueda = req.body.txtPalabra;
  } else if (categoria != "" && req.body.txtPalabra != "") {
    //si tiene palabra y categoria busco por las dos (salud: covid)
    busqueda = categoria + ": " + req.body.txtPalabra;
  } else {
    //si no tiene categoria ni palabra por default muestra salud
    busqueda = categoria;
  }

  googleNewsAPI.getNews(googleNewsAPI.SEARCH, busqueda, language, (err, response) => {
    //ciclo for para mostrar las noticias del dia de hoy
    resultado = response.items;
    //enviar a la siguiente pagina
    const toDay = new Date();
    const fecha = toDay.toLocaleDateString('en-us', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit', timeZone: "America/Monterrey" })
    const fecha2 = fecha.replaceAll(',', '').split(' ');
    const fechaActual = fecha2[0] + ", " + fecha2[2] + " " + fecha2[1] + " " + fecha2[3];

    //separar solo por la fecha del dia de hoy y realizar otro arreglo con la nueva informacions
    console.log(fechaActual);
    res.render('searchNews', { title: 'Epi - Buscador', opIdioma: req.body.opIdioma, opCategoria: req.body.selectCategoria, opTexto: req.body.txtPalabra, resultados: resultado, fecha: fechaActual });
  });
  //
});

/*----------END POST searchNews -----------------------------------------------*/

/*---------- POST downloadFile -----------------------------------------------*/
router.post('/downloadFile', function (req, res, next) {
  //console.log(req.body);
  //crear el archivo

  //console.log(req.body);
  const tituloFile = req.body.titulo;
  const urlFile = req.body.url;
  const fechaFile = req.body.fecha;

  //// ...and download the HTML for it, again with axios
  axios.get(urlFile).then(function (r2) {
    //// We now have the article HTML, but before we can use Readability to locate the article content we need jsdom to convert it into a DOM object
    let dom = new JSDOM(r2.data, {
      url: urlFile
    });

    //// now pass the DOM document into readability to parse
    let article = new Readability(dom.window.document).parse();

    //create the file
    //console.log(article.textContent.trim());


    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [

            createParagraphTitle(tituloFile),
            createParagraphUrl(urlFile),
            createParagraphFecha(fechaFile),
            createParagraphResumen(article.textContent.trim().slice(0, 150) + "..."),
            createParagraphContenido(article.textContent.trim()),

          ],
        },
      ],
    });

    // Used to export the file into a .docx file
    Packer.toBuffer(doc).then((buffer) => {

      try {
        if (!fs.existsSync('public/files')) {
          console.log("no existe");
          fs.mkdirSync('public/files');
        } else {
          console.log("existe");
        }
        fs.writeFileSync("public/files/New.docx", buffer);
      } catch (err) {

        console.log(err);
      }


    });
  }).catch(function (error) {
    //-------------------------------------------------------------------------------------
    // Documents contain sections, you can have multiple sections per document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [

            createParagraphTitle(tituloFile),
            createParagraphUrl(urlFile),
            createParagraphFecha(fechaFile),
            createParagraphResumen(""),
          ],
        },
      ],
    });

    // Used to export the file into a .docx file
    Packer.toBuffer(doc).then((buffer) => {
      try {
        if (!fs.existsSync('public/files')) {
          console.log("no existe");
          fs.mkdirSync('public/files');
        } else {
          console.log("existe");
        }
        fs.writeFileSync("public/files/New.docx", buffer);
      } catch (err) {
        console.log(err);
      }
    });
    //--------------------------------------------------------------------------------------------------
  })
  res.send("creado");
});
/*----------END POST downloadFile -----------------------------------------------*/

/****************************POST downloadFiles************************************************************** */

router.post('/downloadFiles', function (req, res, next) {
  //console.log(req.body);
  //console.log(req.body.url);
  var datos = [];
  datos = req.body.url.split('_;_');
  var datosTitulo = [];
  datosTitulo = req.body.titulos.split('_;_');
  let firstResult;
  let encabezado;
  array = [];

  for (let i = 0; i < datos.length; i++) {
    firstResult = datos[i];
    encabezado = datosTitulo[i];

    axios.get(firstResult).then(function (r2) {
      //// We now have the article HTML, but before we can use Readability to locate the article content we need jsdom to convert it into a DOM object
      let dom = new JSDOM(r2.data, {
        url: firstResult
      });

      //// now pass the DOM document into readability to parse
      let article = new Readability(dom.window.document).parse();
      // we create a array with all information
      titulo = {
        'titulo': datosTitulo[i], 'url': datos[i], 'fecha': req.body.fecha,
        'resumen': article.textContent.trim().slice(0, 150) + "...", 'contenido': article.textContent.trim()
      };

      array.push(titulo);
      //console.log(array);
      //console.log("ingreso");
    }).catch(function (error) {
      titulo = {
        'titulo': datosTitulo[i], 'url': datos[i], 'fecha': req.body.fecha,
        'resumen': "", 'contenido': 'ERROR_LOG ' + error
      };
    })
  }

  setTimeout(generarDocumento, 30000);

  //console.log(array.length);
  res.send("noticas creadas");
});

/****************************END POST downloadFiles************************************************************** */

//************************Funcion para crear documento********************************** */
function generarDocumento() {
  //console.log("arreglo------------------------------------------------------------------------------");
  // console.log(array);
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...array.map((artl) => {
            const arr = [];

            arr.push(createParagraphTitle(artl.titulo));
            arr.push(createParagraphUrl(artl.url));
            arr.push(createParagraphFecha(artl.fecha));
            arr.push(createParagraphResumen(artl.resumen));
            arr.push(createParagraphContenido(artl.contenido));

            return arr;
          })
            .reduce((prev, curr) => prev.concat(curr), []),
        ],
      },
    ],
  });

  // Used to export the file into a .docx file
  Packer.toBuffer(doc).then((buffer) => {

    try {
      if (!fs.existsSync('public/files')) {
        console.log("no existe");
        fs.mkdirSync('public/files');
      } else {
        console.log("existe");
      }
      fs.writeFileSync("public/files/News.docx", buffer);
    } catch (err) {

      console.log(err);
    }
  });
}

//**********************END funcion para crear documento****************************************************** */

//functions to add a new paragraph
function createParagraphTitle(encabezado) {
  return new Paragraph({
    children: [
      new TextRun({
        text: encabezado,
      }),
    ],
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.JUSTIFIED,
    spacing: {
      before: 240,
    },
  });
}

function createParagraphUrl(url) {
  return new Paragraph({
    children: [
      new TextRun({
        text: url,
        italics: true,
        bold: true,
      }),
    ],
    alignment: AlignmentType.JUSTIFIED,
  });
}

function createParagraphFecha(fecha) {
  return new Paragraph({
    children: [
      new TextRun({
        text: "FECHA: ",
        bold: true,
      }),
      new TextRun({
        text: fecha,
      }),
    ],
    alignment: AlignmentType.JUSTIFIED,
  });
}

function createParagraphResumen(resumen) {
  return new Paragraph({
    children: [
      new TextRun({
        text: "RESUMEN: ",
        bold: true,
      }),
      new TextRun({
        text: resumen,
      }),
    ],
    alignment: AlignmentType.JUSTIFIED,
  });
}

function createParagraphContenido(contenido) {
  return new Paragraph({
    children: [
      new TextRun({
        text: "CONTENIDO: ",
        bold: true,
      }),
      new TextRun({
        text: contenido,
      }),
    ],
    alignment: AlignmentType.JUSTIFIED,
  });
}


module.exports = router;