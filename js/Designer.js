/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global GlobalDatePicker, EnvironmentData */

/*******************************************************************************
 * 
 * @returns {undefined}
 * Se obtiene la estructura de generada por el usuario
 * 
 * 
 *******************************************************************************/
function GeStructure(TypeStructure)
{
    var xml = undefined;
    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        type: 'POST',
        url: "php/DesignerForms.php",
        data: "opcion=GetStructure&TypeStructure=" + TypeStructure,
        success: function (respuesta) {
            if ($.parseXML(respuesta) === null) {
                errorMessage(respuesta);
                return 0;
            } else
                xml = $.parseXML(respuesta);

            $(xml).find('Error').each(function ()
            {
                var Mensaje = $(this).find('Mensaje').text();
                errorMessage(Mensaje);
                xml = undefined;
            });
        },
        error: function (objXMLHttpRequest) {
            errorMessage(objXMLHttpRequest);
        }
    });
    return xml;
}

function GetAllStructure(TypeStructure)
{


    var xml;
    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        type: 'POST',
        url: "php/DesignerForms.php",
        data: "opcion=GetAllStructure&TypeStructure=" + TypeStructure,
        success: function (respuesta) {
            if ($.parseXML(respuesta) === null) {
                errorMessage(respuesta);
                return 0;
            } else
                xml = $.parseXML(respuesta);
        },
        beforeSend: function () {
        },
        error: function (objXMLHttpRequest) {
            errorMessage(objXMLHttpRequest);
        }
    });
    return xml;
}


/*
 * /********************************************************************************
 * Obtiene la estructura de la tabla del repositorio seleccionado
 * @param {type} NombreRepositorio,Detalle
 * Detalle= (1/0) 1= dibuja en la tabla de presentacion de datos al usuario el detalle de cada campo 
 *              (Log, type, required). 0=muestra solo el nombre del campo y los forms para el llenado de datos
 *              
 * @param {type} NombreRepositorio
 * @param {type} tabla
 * @param {type} Detalle
 * @returns {Estructuraxmlseleccionada|undefined|XMLDocument}
 */
function SetTableStructura(NombreRepositorio, tabla, Detalle)
{
    var xml = GeStructure(NombreRepositorio);

    if (xml === 0 || xml === null || xml === 'undefined')
        return;

    $(xml).find("Campo").each(function ()
    {
        var $Campo = $(this);
        var tipo = $Campo.find("tipo").text();
        if (tipo.length > 0) {
            $('.P_TipoCatalogo').remove();
            $('#' + tabla).append('<td class="P_TipoCatalogo">Tipo de Catálogo </td><td><b>' + tipo + '</b></td>');
            return;
        }/* Cuando es un catálogo */

        var name = $Campo.find("name").text();
        var type = $Campo.find("type").text();
        var length = $Campo.find("long").text();
        var required = $Campo.find("required").text();

        var Required = '';
        if (required === "true" || required === true)
            Required = " Si";
        else
            Required = " No";

        var id = '_' + name;   /* Id que contendrá cada elemento recuperado */
        if (Detalle == 1)
        {
            $('#' + tabla).append('<tr><td>' + name + '</td>\n\
                <td>' + type + '</td>\n\
                <td>' + length + '</td>\n\
                <td>' + Required + '</td>\n\
                </tr>');
            if (type === 'DATE') {
                $('#' + id).datepicker(GlobalDatePicker);
            }
            if (type === 'date') {
                $('#' + id).datepicker(GlobalDatePicker);
            }
        }
        else
        {
            $('#' + tabla).append('<tr><td>' + name + '</td><td><input type="text" id="' + id + '" class = "FormStandart" FieldType = "' + type + '" FieldLength = "' + length + '"></td></tr>');
            if (type === 'DATE') {
                $('#' + id).datepicker(GlobalDatePicker);
            }
            if (type === 'date') {
                $('#' + id).datepicker(GlobalDatePicker);
            }

            if (required === "true" || required === true)
            {
                $('#' + id).addClass('required');
            }
//               console.log($('#'+id));
        }

    });

    $(xml).find("Error").each(function ()
    {
        var $Instancias = $(this);
        var estado = $Instancias.find("Estado").text();
        var mensaje = $Instancias.find("Mensaje").text();
        errorMessage(mensaje);
    });

    return xml;
}

function BuildFullStructureTable(NombreRepositorio, tabla, Detalle)
{
    var xml = GetAllStructure(NombreRepositorio);

    if (xml === 0 || xml === null || xml === undefined)
        return 0;

    $(xml).find("Campo").each(function () {
        var $Campo = $(this);
        var tipo = $Campo.find("tipo").text();

        if (tipo.length > 0) {
            $('.P_TipoCatalogo').remove();
            $('#' + tabla).append('<td class="P_TipoCatalogo">Tipo de Catálogo </td><td><b>' + tipo + '</b></td>');
            return;
        }/* Cuando es un catálogo */

        var name = $Campo.find("name").text();
        var type = $Campo.find("type").text();
        var length = $Campo.find("long").text();
        var required = $Campo.find("required").text();

        var Required = '';

        if (required === "true" || required === true)
            Required = " Si";
        else
            Required = " No";

        var id = tabla + '_' + name;   /* Id que contendrá cada elemento recuperado */

        if (Detalle === 1) {
            $('#' + tabla).append('<tr><td>' + name + '</td>\n\
                <td>' + type + '</td>\n\
                <td>' + length + '</td>\n\
                <td>' + Required + '</td>\n\
                </tr>');

            if (type === 'DATE')
                $('#' + id).datepicker(GlobalDatePicker);
            if (type === 'date')
                $('#' + id).datepicker(GlobalDatePicker);
        }
        else {
            var inputType = "text";

            if (String(name.toLowerCase()) === "password")
                inputType = "password";

            $('#' + tabla).append('<tr><td>' + name + '</td><td><input type="' + inputType + '" id="' + id + '" name = "' + name + '" class = "FormStandart" FieldType = "' + type + '" FieldLength = "' + length + '"></td></tr>');

            if (type === 'DATE')
                $('#' + id).datepicker(GlobalDatePicker);

            if (type === 'date')
                $('#' + id).datepicker(GlobalDatePicker);

            if (required === "true" || required === true)
                $('#' + id).addClass('required');

//               console.log($('#'+id));
        }

    });

    $(xml).find("Error").each(function ()
    {
        var $Instancias = $(this);
        var estado = $Instancias.find("Estado").text();
        var mensaje = $Instancias.find("Mensaje").text();
        errorMessage(mensaje);
    });

    return xml;
}


/*******************************************************************************
 *  Función que ingresa una rejilla de formularios sobre un dialog o div
 * 
 * @param {type} selector       "Selector donde se ingresara la cuadricula de formularios"
 * @param {type} structure      "Estructura a partir de la cual se construye la cuadricula"
 * @returns {undefined}
 *******************************************************************************/
function buildFormsGrid(selector, structure) {

    $(structure).find("Campo").each(function () {

        var $Campo = $(this);
        var name = $Campo.find("name").text();
        var type = $Campo.find("type").text();
        var length = $Campo.find("long").text();
        var required = $Campo.find("required").text();
        var id = selector + '_' + name;   /* Id que contendrá cada elemento recuperado */

        var formType = "text";

        if (String(name.toLowerCase()) === "password")
            formType = "password";

        if (String(required.toLowerCase()) === "true")
            required = "required";
        else
            required = "";


        var form = $('<input>', {type: formType, id: id, name: name, class: "form-control " + required, FieldType: type, FieldLength: length});
        var label = '<label>' + name + '<label>';

        var $formGroup = $('<div>', {class: "form-group col-xs-12 col-sm-8"});

        $formGroup.append(label);
        $formGroup.append(form);

        $('#' + selector).append($formGroup);

    });
}

var Designer = function () {
    /**
     * @description Construye un grid de formularios a través de una estructura definida por el usuario.
     * @param {object} content Div contenedor, deberá contener un atributo id. 
     * @param {object} structure Estructura tipo objeto que deberá contener su descripción de cada campo.
     * @returns {undefined}
     */
    this.buildFormsStructure = function (content, structure) {
        $(structure).find("Campo").each(function () {
            var name = $(this).find("name").text();
            var type = $(this).find("type").text();
            var length = $(this).find("long").text();
            var required = $(this).find("required").text();

            var id = $(content).attr('id');

            if (id === undefined)
                id = "field_"+name;
            else
                id = id+"_"+name;
            
            var inputType = "text";

            if (String(name.toLowerCase()) === "password")
                inputType = "password";
            
            var formGroup = $('<div>',{class:"form-group"});
            var label = $('<label>').append(name);
            var form = $('<input>', {type: inputType, id: id, name: name, class:"form-control", FieldType:type, FieldLength: length });
            
            formGroup.append(label);
            formGroup.append(form);
            
            content.append(formGroup);
            
            if (String(type).toLowerCase() === 'date')
                $(form).datepicker(GlobalDatePicker);

            if (String(required).toLowerCase() === "true")
                $(form).addClass('required');


        });
    };
};