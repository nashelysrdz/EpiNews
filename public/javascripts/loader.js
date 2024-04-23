setTimeout(mostrarCarga, 40000);

function mostrarCarga() {
    //document.getElementById("divLoader").style.display = 'none';
    //document.getElementById("divContenido").style.display = 'block';
}

function cambiarIdioma(){
    var select = document.getElementById("selectIdioma"), //El <select>
        value = select.value, //El valor seleccionado
        text = select.options[select.selectedIndex].innerText; //El texto de la opción seleccionada 
    document.getElementById("opIdioma").value = text;
}

function enviarBoton(valor) {
    var id = valor.id;

    document.getElementById("divBtnDescarga_" + id).style.display = 'none';
    document.getElementById("divBtnCarga_" + id).style.display = 'block';

    var titulo = document.getElementById("hdTitle_" + id).value;
    var url = document.getElementById("hdUrl_" + id).value;
    var fecha = new Date(document.getElementById("hdPublishedAt_" + id).value);

    const fechaN = fecha.toLocaleString("es-MX", { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: "America/Monterrey" });
    const fechaNu = fechaN.split(/[-/]/).reverse().join("-");

    var parametros = {
        "titulo": titulo,
        "url": url,
        "fecha": fechaNu
    }

    $.ajax({
        data: parametros,
        url: "/downloadFile",
        type: "post",
        timeout: 5000,
        success: function (response) {
            setTimeout(() => {
                const downloadInstance = document.createElement('a');
                downloadInstance.href = '/files/New.docx';
                downloadInstance.target = '_blank';
                downloadInstance.download = 'New.docx';

                document.body.appendChild(downloadInstance);
                downloadInstance.click();
                document.body.removeChild(downloadInstance);


                document.getElementById("divBtnDescarga_" + id).style.display = 'block';
                document.getElementById("divBtnCarga_" + id).style.display = 'none';
            }, 5000);
            console.log(response);
        }, error: function (xhr, textStatus, errorThrown) {
            console.log("error");
        }
    });
}

function descargarArchivos() {
    var url = document.getElementById("txtUrl").value;
    var titulos = document.getElementById("txtTitulo").value;
    var fecha = new Date();

    const fechaN = fecha.toLocaleString("es-MX", { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: "America/Monterrey" });
    const fechaNu = fechaN.split(/[-/]/).reverse().join("-");

    document.getElementById("divBtnDescargar").style.display = 'none';
    document.getElementById("divBtnDescargarHidden").style.display = 'block';

    //separar el titulo de 

    var parametros = {
        "titulos":titulos, 
        "url": url,
        "fecha": fechaNu
    }

    $.ajax({
        data: parametros,
        url: "/downloadFiles",
        type: "post",
        timeout: 40000,
        success: function (response) {
            setTimeout(() => {
                const downloadInstance = document.createElement('a');
                downloadInstance.href = '/files/News.docx';
                downloadInstance.target = '_blank';
                downloadInstance.download = 'News.docx';

                document.body.appendChild(downloadInstance);
                downloadInstance.click();
                document.body.removeChild(downloadInstance);

                document.getElementById("divBtnDescargarHidden").style.display = 'none';
                document.getElementById("divBtnDescargar").style.display = 'block';

            }, 40000);
            console.log(response);
        }, error: function (xhr, textStatus, errorThrown) {
            console.log("error");
        }
    });
    
}