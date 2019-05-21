document.addEventListener("DOMContentLoaded", initPage);

function initAddButton(event){
   event.preventDefault();
   var payload = {"add":1}; 
   payload.name = document.getElementById("name").value;
   if(payload.name == ""){
      alert("Medium name  must be named");
      return;
   }
   payload.description = document.getElementById("description").value;
   var req = new XMLHttpRequest();
   req.open("POST", "/mediums", true);
   req.setRequestHeader("Content-Type", "application/json");
   req.send(JSON.stringify(payload));
   req.addEventListener("load",function(){
      if(req.status >= 200 && req.status < 400){
         //document.getElementById("addButton").removeEventListener("click", initAddButton);
         buildTable();
      }
      else {
         console.log("Error: " + req.statusText);
      }
   });

};

function initDeleteButtons(button){
   button.addEventListener("click",function(event){
      event.preventDefault();
      var req = new XMLHttpRequest();
      var payload = {"del":button.parentElement.parentElement.id};
      req.open("POST", "/", true);
      req.setRequestHeader("Content-Type", "application/json");
      req.send(JSON.stringify(payload));
      req.addEventListener("load",function(){
         if(req.status >= 200 && req.status < 400){
            buildTable();
         }
         else {
            console.log("Error: " + req.statusText);
         }
      });
   });
};

function submitEdit(id){
   event.preventDefault();
   var req = new XMLHttpRequest();
   var payload = {"edit":id}
   payload.name = document.getElementById("nameEdit").value;
   payload.reps = document.getElementById("repsEdit").value;
   payload.weight = document.getElementById("weightEdit").value;
   payload.date = document.getElementById("dateEdit").value;
   payload.lbs = document.getElementById("lbsEdit").value;
   req.open("POST", "/", true);
   req.setRequestHeader("Content-Type", "application/json");
   req.send(JSON.stringify(payload));
   req.addEventListener("load",function(){
      if(req.status >= 200 && req.status < 400){
         buildTable();
      }
      else {
         console.log("Error: " + req.statusText);
      }
   });
};


function buildForm(id){
   var form = document.createElement("tr");
   form.id = id;
   var name = document.createElement("td");
   var nameField = document.createElement("input");
   nameField.id = "nameEdit";
   nameField.type = "text";
   nameField.value = document.getElementById("name"+id).textContent;
   name.appendChild(nameField);
   var reps = document.createElement("td");
   var repsField = document.createElement("input");
   repsField.id = "repsEdit";
   repsField.type = "number";
   repsField.value = document.getElementById("reps"+id).textContent;
   reps.appendChild(repsField);
   var weight = document.createElement("td");
   var weightField = document.createElement("input");
   weightField.id = "weightEdit";
   weightField.type = "number";
   weightField.value = document.getElementById("weight"+id).textContent;
   weight.appendChild(weightField);
   var date = document.createElement("td");
   var dateField = document.createElement("input");
   dateField.id = "dateEdit";
   dateField.type = "date";
   var dateParsed = document.getElementById("date"+id).textContent;
   dateParsed = dateParsed.substring(6, 10) + "-" + dateParsed.substring(0, 2) + "-" + dateParsed.substring(3, 5);
   dateField.value = dateParsed;
   date.appendChild(dateField);
   var units = document.createElement("td");
   var unitsField = document.createElement("select");
   unitsField.id = "lbsEdit";
   var lbsOption = document.createElement("option");
   lbsOption.value = "1";
   lbsOption.textContent = "lbs";
   var kgOption = document.createElement("option");
   kgOption.value = "0";
   kgOption.textContent = "kg";
   if (document.getElementById("units"+id).textContent == "lbs"){
      lbsOption.selected = "selected";
   } else {
      kgOption.selected = "selected";
   }
   unitsField.appendChild(lbsOption);
   unitsField.appendChild(kgOption);
   units.appendChild(unitsField);


   submitEditButton = document.createElement("button");
   submitEditButton.textContent = "update";
   submitEditButton.addEventListener("click", function(){submitEdit(id)});


   form.appendChild(name);
   form.appendChild(reps);
   form.appendChild(weight);
   form.appendChild(date);
   form.appendChild(units);
   form.appendChild(submitEditButton);
   return form;

}

function initEditButtons(button){
   button.addEventListener("click", function(event){
      event.preventDefault();
      rowToEdit = button.parentElement.parentElement;
      var form = buildForm(rowToEdit.id);
      rowToEdit.parentElement.replaceChild(form ,rowToEdit);
   });
};



function initPage(){

   buildTable();
   bindButtons();
};


function bindButtons(){
   document.getElementById("addButton").addEventListener("click", initAddButton);

   var editButtons = document.getElementsByName("editButton");
   editButtons.forEach(initEditButtons);

   var deleteButtons = document.getElementsByName("deleteButton");
   deleteButtons.forEach(initDeleteButtons);
};


function buildTable(){
   //create table
   var table = document.createElement("table");
   table.id = "exerciseTable";
   var row = document.createElement("tr");
   table.appendChild(row);

   //create header row
   var row = table.firstElementChild;
   var headerTitles = ["Exercise", "Reps", "Weight", "Date", "Units"];
   for(var i = 0; i < 5; i++) {
      var header = document.createElement("th");
      header.textContent = headerTitles[i];
      row.appendChild(header);
   }

   //fill data rows

   var req = new XMLHttpRequest();
   req.open("POST", "/", true);
   req.setRequestHeader("Content-Type", "application/json");
   req.send(JSON.stringify({"init":1}));
   req.addEventListener("load", function(){
      if(req.status >= 200 && req.status < 400) {
         var response = JSON.parse(req.responseText);
         for(var i in response) {
            var row = document.createElement("tr");
            //row = row.nextElementSibling;
            var name = document.createElement("td");
            name.textContent = response[i].name;
            name.id = "name"+response[i].id;
            row.appendChild(name);
            var reps = document.createElement("td");
            reps.textContent = response[i].reps;
            reps.id = "reps"+response[i].id;
            row.appendChild(reps);
            var weight = document.createElement("td");
            weight.textContent = response[i].weight;
            weight.id = "weight"+response[i].id;
            row.appendChild(weight);
            var date = document.createElement("td");
            var dateConverted =  new Date(response[i].date);
            if (dateConverted != "Invalid Date"){
               var month = (1+dateConverted.getMonth()).toString();
               month = month.length > 1 ? month : "0" + month;
               var day = dateConverted.getDate().toString();
               day = day.length > 1 ? day : "0" + day;
               var year = dateConverted.getFullYear();
               date.textContent = month + "-" + day + "-" + year;
            } else {
               date.textContent = "";
            }
            date.id = "date"+response[i].id;
            row.appendChild(date);
            var units = document.createElement("td");
            units.textContent = (response[i].lbs) ? "lbs" : "kg";
            units.id = "units"+response[i].id;
            row.appendChild(units);

            //create edit and delete buttons
            var commandButtons = document.createElement("td");
            var labels = ["Edit", "Delete"];
            for(var j = 0; j < 2; j++) {
               var button = document.createElement("button");
               button.textContent = labels[j];
               button.name = labels[j].toLowerCase() + "Button";
               button.id = labels[j].toLowerCase() + "_" +  response[i].id;
               //fixing closure in loop to add label name as function title
               (function(x) {
                  //converting label to function name
                  var Action = window[labels[x]];
                  function takeAction() { take(Action); }
                  button.addEventListener("click", takeAction);
               }) (j);
               commandButtons.appendChild(button);
            }
            row.appendChild(commandButtons);
            row.id = response[i].id;
            table.appendChild(row);

         }


         //add table to html page body
         var exerciseLog = document.getElementById("exerciseLog");
         var oldTable = document.getElementById("exerciseLog");
         exerciseLog.replaceChild(table, exerciseLog.firstChild);
         bindButtons();

      }
      else {
         console.log("Error: " + res.statusText);
      }
   });
};

//Edit and Delete actions
function take(Action) {
   Action();
}

function Edit() {
}

function Delete() {
}
