document.addEventListener("DOMContentLoaded", initPage);

function initDeleteButtons(button){
   button.addEventListener("click",function(event){
      event.preventDefault();
      var req = new XMLHttpRequest();
      var payload = {"del":button.parentElement.parentElement.id};
      req.open("POST", "/artists", true);
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
   payload.fname = document.getElementById("fnameEdit").value;
   payload.lname = document.getElementById("lnameEdit").value;
   payload.born = document.getElementById("bornEdit").value;
   payload.died = document.getElementById("diedEdit").value;
   payload.bio = document.getElementById("bioEdit").value;
   req.open("POST", "/artists", true);
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
   var fname = document.createElement("td");
   var fnameField = document.createElement("input");
   fnameField.id = "fnameEdit";
   fnameField.type = "text";
   fnameField.value = document.getElementById("fname"+id).textContent;
   fname.appendChild(fnameField);
   var lname = document.createElement("td");
   var lnameField = document.createElement("input");
   lnameField.id = "lnameEdit";
   lnameField.type = "text";
   lnameField.value = document.getElementById("lname"+id).textContent;
   lname.appendChild(lnameField);
   var born = document.createElement("td");
   var bornField = document.createElement("input");
   bornField.id = "bornEdit";
   bornField.type = "date";
   bornField.value = document.getElementById("born"+id).textContent;
   born.appendChild(bornField);
   var died = document.createElement("td");
   var diedField = document.createElement("input");
   diedField.id = "diedEdit";
   diedField.type = "date";
   diedDate = new Date(document.getElementById("died"+id).textContent).toISOString();
   diedField.value = new Date(document.getElementById("died"+id).textContent);
   console.log(diedDate);
   console.log(typeof(diedDate));
   died.appendChild(diedField);
   var bio = document.createElement("td");
   var bioField = document.createElement("input");
   bioField.id = "bioEdit";
   bioField.type = "text";
   bioField.value = document.getElementById("bio"+id).textContent;
   bio.appendChild(bioField);


   submitEditButton = document.createElement("button");
   submitEditButton.id = "updateButton";
   submitEditButton.textContent = "update";
   submitEditButton.addEventListener("click", function(){submitEdit(id)});


   form.appendChild(fname);
   form.appendChild(lname);
   form.appendChild(born);
   form.appendChild(died);
   form.appendChild(bio);
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
   var headerTitles = ["First Name", "Last Name", "Born", "Died", "Bio"];
   for(var i = 0; i < 5; i++) {
      var header = document.createElement("th");
      header.textContent = headerTitles[i];
      row.appendChild(header);
   }

   //fill data rows

   var req = new XMLHttpRequest();
   req.open("POST", "/artists", true);
   req.setRequestHeader("Content-Type", "application/json");
   req.send(JSON.stringify({"init":1}));
   req.addEventListener("load", function(){
      if(req.status >= 200 && req.status < 400) {
         var response = JSON.parse(req.responseText);
         console.log(response);
         for(var i in response) {
            var row = document.createElement("tr");
            var fname = document.createElement("td");
            fname.textContent = response[i].first_name;
            fname.id = "fname"+response[i].id;
            row.appendChild(fname);
            var lname = document.createElement("td");
            lname.textContent = response[i].last_name;
            lname.id = "lname"+response[i].id;
            row.appendChild(lname);
            var born = document.createElement("td");
            born.textContent = response[i].born;
            born.id = "born"+response[i].id;
            row.appendChild(born);
            var died = document.createElement("td");
            died.textContent = response[i].died;
            died.id = "died"+response[i].id;
            row.appendChild(died);
            var bio = document.createElement("td");
            bio.textContent = response[i].bio;
            bio.id = "bio"+response[i].id;
            row.appendChild(bio);

            //create edit and delete buttons
            var commandButtons = document.createElement("td");
            var labels = ["Edit", "Delete"];
            for(var j = 0; j < 2; j++) {
               var button = document.createElement("button");
               button.textContent = labels[j];
               button.name = labels[j].toLowerCase() + "Button";
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
         var newTable = document.getElementById("artistList");
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
