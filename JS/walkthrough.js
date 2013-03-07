/** 
 * @module WalkthroughJS 
 * @version 1
 * @author: Tom Marra. 10-24-2012. � Lamar Advertising.
 */


//=##=================================================================================================##=//
//=##= GLOBALS =======================================================================================##=//
//=##=================================================================================================##=//
var stepData = {};
var nextStepId = "";
//var added_tmpl = jQuery.Event("added_tmpl");
var added_step = jQuery.Event("update");
var firstRun = true;
var cache = {}; // caching inputs for the visited steps

//=##=================================================================================================##=//
//=##= Main ==========================================================================================##=//
//=##=================================================================================================##=//
$(document)
    .ready(function () {
    initialize();
});


//=##=================================================================================================##=//
//=##= Initialize ====================================================================================##=//
//=##=================================================================================================##=//

function initialize() {
    //gets the JSON and assigns it to the currentStepData var
    util.getStep("aeinfo");
    setup();
}


//=##=================================================================================================##=//
//=##= SET UP ========================================================================================##=//
//=##=================================================================================================##=//
function setup() {
    //binds update function to update event
    $('body')
        .bind('update', function () {
        update();
    });

    //reroutes Next button Proxy to build step before hitting next
    $("#nextProxy")
        .bind("onclick", function () {
        util.next();
    });
    
        //hides loader and shows app
    $('#circularG').fadeOut("slow", function(){
        $('#contentFrame').fadeIn("slow");
    });
    
    //Hides Navigation if JSON value for current Step item "showNav" is false
    $("#ispotForm").bind("before_step_shown", function(event, data){
	if(!data.isLastStep){
                var stepname = data.currentStep;
                console.log(stepData);
                if(stepData[stepname].showNav === false){
                    $("#nextProxy").hide();
                }else $("#nextProxy").show();
        }
                
    });
    
    //Makes the final step a verrify step
    $("#ispotForm").bind("step_shown", function(event, data){	
            if(data.isLastStep){ // if this is the last step...then
                console.log(data);
                    $("#summaryContainer").empty(); // empty the container holding the 
                    $.each(data.activatedSteps, function(i, id){ // for each of the activated steps...do
                            if(id === "summary") return; // if it is the summary page then just return
                            if(id === "ispotselection") return;
                            cache[id] = $("#" + id).contents(); // else, find the div:s with class="input" and cache them with a key equal to the current step id
                            cache[id].detach().appendTo('#summaryContainer').show().find(":input").removeAttr("disabled"); // detach the cached inputs and append them to the summary container, also show and enable them
                            $(".descrip").hide();
                    });
            }else if(data.previousStep === "summary"){ // if we are movin back from the summary page
                    $.each(cache, function(id, inputs){ // for each of the keys in the cache...do
                            var i = inputs.detach().appendTo("#" + id);  // put the input divs back into their normal step
                            if(id === data.currentStep){ // (we are moving back from the summary page so...) if enable inputs on the current step
                                     i.removeAttr("disabled");
                            }else{ // disable the inputs on the rest of the steps
                                    i.attr("disabled","disabled");
                            }
                            $(".descrip").show();
                    });
                    cache = {}; // empty the cache again
            }
    });
    
    //creates final step
    //$.tmpl("summaryTemplate").appendTo('#fieldWrapper');
        
};


//=##=================================================================================================##=//
//=##= Update ========================================================================================##=//
//=##=================================================================================================##=//

function update(eventdata) {
    console.log("update complete");
//    console.log($("#ispotForm")
//        .formwizard("state"));
    $("#ispotForm")
        .formwizard("update_steps");
};

//=##=================================================================================================##=//
//=##= Templates =====================================================================================##=//
//=##=================================================================================================##=//

/*Templates go here*/
var stepTemplate = '<div class=\"step\" id=\"${id}\">' +
    '<div class=\"container\">' +
    '<br/>' +
    '<h4 class=\"descrip\">${description}<h4 />' +
    '<br/>' +
//cascade goes here
    '</div>' +
'</div>';

var textareaTemplate = '<div class=\"textfieldContainer\">${label}' +
        '<textarea form="ispotForm" ' +
        'name=\"{{if (name)}}${name}{{else}}${label}{{/if}}\"' +
        'rows=\"${rows}\ ' +
        'cols=\"${cols}\">' +
        '</textarea></div>';

var btnTemplate = '{{if (label)}}<div class=\"buttonContainer\">{{/if}}' +
    '<input type=\"button\" class=\"${xclass}\"'+ 
    '{{if (value)}}value=\"${value}\"{{/if}}' +
    '{{if (onclick)}}onclick=\"util.clickSelect(\'${link}\',\'${target}\',${completeStep});\"{{/if}}>' +
    '{{if (label)}}<br/><label>${label}</label>' +
    '</div>{{/if}}';

var selectTemplate = '{{if (hidden)}}<div style=\"display : none\">{{/if}}' +
    '<select class=\"${xclass}\" name=\"${name}\" id=\"${id}\">' +
    '{{tmpl(options) "optionsTemplate" }}' +
    '</select>' +
    '{{if (hidden)}}</div>{{/if}}';

var optionsTemplate = '<option value=\"${option}\">${name}</option>';

var inputTemplate = '<div class=\"textfieldContainer\">${label}' + 
        '<input type=\"${type}\"' + 
        'name=\"{{if (name)}}${name}{{else}}${label}{{/if}}\"' + 
        'class=\"${xclass}\" '+ 
        '${special}></input></div>';

var labelTemplate = '<h4>${label}</h4></br>'; //ToDo add options and conditionals as needed

var inputgroupTemplate = '<div id=\"${id}\" class=\"${xclass}\">'+
        '<h4>${groupDescription}:</h4>'+
        '{{tmpl(input) "inputTemplate" }}' +
        '<div class=\"${xclass}\">'+
        '</div>';

//var summaryTemplate = '<div id=\"summary\" class=\"step\">' +
//        '<span class=\"font_normal_07em_black\">Summary page</span><br />' +
//        '<p>Please verify your information below.</p>' +
//        '<div id=\"summaryContainer\"></div>' +
//        '</div>';

/*Make them jQury templates*/
$.template("btnTemplate", btnTemplate);
$.template("selectTemplate", selectTemplate);
$.template("optionsTemplate", optionsTemplate);
$.template("stepTemplate", stepTemplate);
$.template("inputTemplate", inputTemplate);
$.template("inputgroupTemplate", inputgroupTemplate);
$.template("textareaTemplate", textareaTemplate);
//$.template("summaryTemplate", summaryTemplate);


//=##=================================================================================================##=//
//=##= UTIL ==========================================================================================##=//
//=##=================================================================================================##=//

var util = {

    //custom function allowing a button element to trigger a branch then go to that step
    clickSelect: function clickSelect(valx, id, next) {
        //valx = selectionName 
        //id=from element to set value of 
        //next= bool go to next step if true
        console.log("clickSelect Fired : "+ valx + ", " + id+ ", " + next);
        $(id).val(valx);
        console.log($(id).val());
        if (next === true) {
            if($("#" + valx).length === 0){
                console.log("get the "+ valx +" step");
                util.getStep(valx);
                //delays function until 'update' event is complete
                $('body').one('update', function(){
                    _setStepandGo();
                });
                
            }else{
                _setStepandGo();
            }
            
        }
        function _setStepandGo(){
            nextStepId = valx;
                console.log("_setStepandGo next step = "+valx);
            util.next();
        }
    },

    //Step Creator Function
    stepCreator: function stepCreator(id) {
        data = stepData[id];
        //console.log(id + ":");
        //console.log(data);
        var createNext = false; //tells function to create the next step on completion
        util.createItem("stepTemplate", data, "#fieldWrapper");

        if (data.linnear) { //if there are no conditionals the next step is set here
            nextStepId = data.linnear.nextStepId;
            createNext = true;            
        }

        $.each(data, function (key, value) { //loop through and generate items
            //console.log(data);
            
            var append_to_node = "#" + data.id;

            if (value.appendToNode) {
                append_to_node = "#" + value.appendToNode; //allows overide of appended node
            }

            switch (key.replace(/\d+/g, '')) {
                case "button":
                    util.createItem("btnTemplate", value, append_to_node);
                    break;
                case "input":
                    util.createItem("inputTemplate", value, append_to_node);
                    break;
                case "select":
                    util.createItem("selectTemplate", value, append_to_node);
                    break;
                case "label":
                    util.createItem("labelTemplate", value, append_to_node);
                    break;
                case "inputgroup":
                    util.createItem("inputgroupTemplate", value, append_to_node);
                    break;
                case "textarea":
                    util.createItem("textareaTemplate", value, append_to_node);
                    break;
                
            }
        });

        //Runs update method if it is not the first Run
        if (!firstRun) {
            $('body')
                .trigger('update');
        } else {
            util.wizardSetup();
            firstRun = false;
        }

        //Creates Next step for linnear Steps
        if (createNext === true) {
            nextStepId = data.linnear.nextStep;
            util.getStep(nextStepId);
        };

    },

    //Item Creator Function
    createItem: function CreateItem(template, value, append_to_node) {
        //console.log(template, value, append_to_node);
        if(append_to_node === "#fieldWrapper"){
            $('#summary').before($.tmpl(template,value));
        }else{
            $.tmpl(template, value).appendTo(append_to_node);
        }
        //.trigger("added_tmpl"); can fire a template added event
    },

    //prevent Default function
    preventDefault: function preventDefault(event) {
        event.preventDefault();
    },
    
    //invokes Forumwizard step function to allow for custom transitions between steps
    next: function next() {
        console.log("next function target:" + nextStepId);
        $("#ispotForm").formwizard("show", nextStepId);
    },

    getStep: function getStep(id) {
        var itemId = "";
        $.getJSON('Data/' + id + '.json', function (json) {
            itemId = json.id;
            stepData[itemId] = json;
        })
            .success(function () {
            util.stepCreator(itemId);
        })
            .error(function (jqXHR, textStatus, errorThrown) {
            alert("There was an Error setting up the Wizard, please reload the page");
            console.error("error " + textStatus);
            console.error("incoming Text " + jqXHR.responseText);
        });
    },

    wizardSetup: function wizardSetup() {
        $("#ispotForm")
            .formwizard({
            historyEnabled: true,
            formPluginEnabled: true,
            validationEnabled: true,
            focusFirstInput: true,
            inAnimation: {
                width: "fadein"
            },
            outAnimation: {
                width: "fadeout"
            },
//            validationOptions : {
//                rules: {
//                    Email: {
//                        required: true,
//                        email: true
//                    },
//                    Confirm: {
//                        equalTo: "#xmail"
//                    },
//                    plant_number: {
//                        required: true,
//                        minlength: 3,
//                        maxlength: 3,
//                        digits: true
//                    }
//                },
//                wrapper: "div",
//                highlight: function(element, errorClass, validClass) {
//                    $(element).addClass(errorClass).removeClass(validClass);
//                    $(element).parent().addClass(errorClass);
//                 },
//                 unhighlight: function(element, errorClass, validClass) {
//                    $(element).removeClass(errorClass).addClass(validClass);
//                    $(element).parent().removeClass(errorClass);
//                 }
//            },
            formOptions: {
                success: function (data) {
                    $("#status")
                        .fadeTo(500, 1, function () {
                        $(this)
                            .html("You are now registered!")
                            .fadeTo(5000, 0);
                    });
                },
                beforeSubmit: function (data) {
                    $("#data")
                        .html("data sent to the server: " + $.param(data));
                },
                dataType: 'json',
                resetForm: true
            }
            
        });
        console.log("form Wizzard initialized");

    }

};