document.addEventListener("DOMContentLoaded", initPage);

function initDeleteButtons(button){
   button.addEventListener("click",function(event){
      event.preventDefault();
      var req = new XMLHttpRequest();
      var payload = {"del":button.parentElement.parentElement.id};
      req.open("POST", "/wings", true);
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
   payload.open = document.getElementById("openEdit").value;
   payload.close = document.getElementById("closeEdit").value;
   req.open("POST", "/wings", true);
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
   var open = document.createElement("td");
   var openField = document.createElement("input");
   openField.id = "openEdit";
   openField.type = "time";
   openField.value = document.getElementById("open"+id).textContent;
   open.appendChild(openField);
   var close = document.createElement("td");
   var closeField = document.createElement("input");
   closeField.id = "closeEdit";
   closeField.type = "time";
   closeField.value = document.getElementById("close"+id).textContent;
   close.appendChild(closeField);

   submitEditButton = document.createElement("button");
   submitEditButton.id = "updateButton";
   submitEditButton.textContent = "update";
   submitEditButton.addEventListener("click", function(){submitEdit(id)});

   form.appendChild(name);
   form.appendChild(open);
   form.appendChild(close);
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
   // bindButtons();
};


function bindButtons(){
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
   var headerTitles = ["Name", "Opening Time", "Closing Time"];
   for(var i = 0; i < 3; i++) {
      var header = document.createElement("th");
      header.textContent = headerTitles[i];
      row.appendChild(header);
   }

   //fill data rows

   var req = new XMLHttpRequest();
   req.open("POST", "/wings", true);
   req.setRequestHeader("Content-Type", "application/json");
   req.send(JSON.stringify({"init":1}));
   req.addEventListener("load", function(){
      if(req.status >= 200 && req.status < 400) {
         var response = JSON.parse(req.responseText);
         for(var i in response) {
            var row = document.createElement("tr");
            var name = document.createElement("td");
            name.textContent = response[i].name;
            name.id = "name"+response[i].id;
            row.appendChild(name);
            var open = document.createElement("td");
            open.textContent = response[i].open_time;
            open.id = "open"+response[i].id;
            row.appendChild(open);
            var close = document.createElement("td");
            close.textContent = response[i].close_time;
            close.id = "close"+response[i].id;
            row.appendChild(close);

            //create edit and delete buttons
            var commandButtons = document.createElement("td");
            var labels = ["Edit", "Delete"];
            for(var j = 0; j < 2; j++) {
               var button = document.createElement("button");
               button.textContent = labels[j];
               button.name = labels[j].toLowerCase() + "Button";
               button.id = labels[j].toLowerCase() + "_" +  response[i].id;
               //fixing closure in loop to add label name as function name
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
         var newTable = document.getElementById("wingList");
         //var oldTable = document.getElementById("artList");
         newTable.replaceChild(table, newTable.firstChild);
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
