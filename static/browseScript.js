document.addEventListener("DOMContentLoaded", initPage);

function initAddButton(event){
   event.preventDefault();
   var payload = {"add":1}; 
   payload.title = document.getElementById("exerciseName").value;
   if(payload.title == ""){
      alert("Exercise must be titled");
      return;
   }
   payload.artist = document.getElementById("exerciseReps").value;
   payload.medium = document.getElementById("exerciseWeight").value;
   payload.date = document.getElementById("exerciseDate").value;
   payload.lbs = document.getElementById("exerciseUnits").value;
   var req = new XMLHttpRequest();
   req.open("POST", "/", true);
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
   payload.title = document.getElementById("titleEdit").value;
   payload.artist = document.getElementById("artistEdit").value;
   payload.medium = document.getElementById("mediumEdit").value;
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
   var title = document.createElement("td");
   var titleField = document.createElement("input");
   titleField.id = "titleEdit";
   titleField.type = "text";
   titleField.value = document.getElementById("title"+id).textContent;
   title.appendChild(titleField);
   var artist = document.createElement("td");
   var artistField = document.createElement("input");
   artistField.id = "artistEdit";
   artistField.type = "number";
   artistField.value = document.getElementById("artist"+id).textContent;
   artist.appendChild(artistField);
   var medium = document.createElement("td");
   var mediumField = document.createElement("input");
   mediumField.id = "mediumEdit";
   mediumField.type = "number";
   mediumField.value = document.getElementById("medium"+id).textContent;
   medium.appendChild(mediumField);
   var date = document.createElement("td");
   var dateField = document.createElement("input");
   dateField.id = "dateEdit";
   dateField.type = "date";
   var dateParsed = document.getElementById("date"+id).textContent;
   dateParsed = dateParsed.substring(6, 10) + "-" + dateParsed.substring(0, 2) + "-" + dateParsed.substring(3, 5);
   dateField.value = dateParsed;
   date.appendChild(dateField);
   var wing = document.createElement("td");
   var wingField = document.createElement("select");
   wingField.id = "lbsEdit";
   var lbsOption = document.createElement("option");
   lbsOption.value = "1";
   lbsOption.textContent = "lbs";
   var kgOption = document.createElement("option");
   kgOption.value = "0";
   kgOption.textContent = "kg";
   if (document.getElementById("wing"+id).textContent == "lbs"){
      lbsOption.selected = "selected";
   } else {
      kgOption.selected = "selected";
   }
   wingField.appendChild(lbsOption);
   wingField.appendChild(kgOption);
   wing.appendChild(wingField);


   submitEditButton = document.createElement("button");
   submitEditButton.textContent = "update";
   submitEditButton.addEventListener("click", function(){submitEdit(id)});


   form.appendChild(title);
   form.appendChild(artist);
   form.appendChild(medium);
   form.appendChild(origin);
   form.appendChild(style);
   form.appendChild(date);
   form.appendChild(wing);
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
   var headerTitles = ["Title", "Artist(s)", "Medium(s)", "Origin", "Style", "Date", "Wing"];
   for(var i = 0; i < 7; i++) {
      var header = document.createElement("th");
      header.textContent = headerTitles[i];
      row.appendChild(header);
   }

   //fill data rows

   var req = new XMLHttpRequest();
   req.open("POST", "/browse", true);
   req.setRequestHeader("Content-Type", "application/json");
   req.send(JSON.stringify({"init":1}));
   req.addEventListener("load", function(){
      if(req.status >= 200 && req.status < 400) {
         var response = JSON.parse(req.responseText);
         console.log(response);
         for(var i in response) {
            var row = document.createElement("tr");
            var title = document.createElement("td");
            title.textContent = response[i].Title;
            title.id = "title"+response[i].id;
            row.appendChild(title);
            var artist = document.createElement("td");
            artist.textContent = response[i].Artist;
            artist.id = "artist"+response[i].id;
            row.appendChild(artist);
            var medium = document.createElement("td");
            medium.textContent = response[i].Medium;
            medium.id = "medium"+response[i].id;
            row.appendChild(medium);
            var origin = document.createElement("td");
            origin.textContent = response[i].Origin;
            origin.id = "origin"+response[i].id;
            row.appendChild(origin);
            var style = document.createElement("td");
            style.textContent = response[i].Style;
            style.id = "style"+response[i].id;
            row.appendChild(style);
            var date = document.createElement("td");
            date.textContent = response[i].date_completed;
            date.id = "date"+response[i].id;
            row.appendChild(date);
            var wing = document.createElement("td");
            wing.textContent = response[i].wing_name;
            wing.id = "wing"+response[i].id;
            row.appendChild(wing);

            //create edit and delete buttons
            var commandButtons = document.createElement("td");
            var labels = ["Edit", "Delete"];
            for(var j = 0; j < 2; j++) {
               var button = document.createElement("button");
               button.textContent = labels[j];
               button.title = labels[j].toLowerCase() + "Button";
               button.id = labels[j].toLowerCase() + "_" +  response[i].id;
               //fixing closure in loop to add label title as function title
               (function(x) {
                  //converting label to function title
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
         var newTable = document.getElementById("artList");
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
