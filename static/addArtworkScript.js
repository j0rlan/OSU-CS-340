document.addEventListener("DOMContentLoaded", initPage);

var artists = [];
var mediums = [];
var styles = [];
var wings = [];
var req = new XMLHttpRequest();
var payload = {"init":1};
req.open("POST", "/addArtwork", true);
req.setRequestHeader("Content-Type", "application/json");
req.send(JSON.stringify(payload));
req.addEventListener("load", function(){
   if(req.status >= 200 && req.status < 400){
      var list = JSON.parse(req.response);
      for (e in list.artists) { artists.push(list.artists[e].first_name + " " + list.artists[e].last_name); }

      for (e in list.mediums) { mediums.push(list.mediums[e].medium_name); }

      for (e in list.styles) { styles.push(list.styles[e].style_name); }

      for (e in list.wings) { wings.push(list.wings[e].name); }
  }
   else {
      console.log("Error: " + req.statusText);
   }
});

function initAddButton(event){
   event.preventDefault();
   var mediumResult = document.getElementById("medium").checkValidity();
   var styleResult = document.getElementById("style").checkValidity();
   var wingResult = document.getElementById("wing").checkValidity();
   if (mediumResult == false || styleResult == false || wingResult == false) {
      alert("please ensure that medium, style, and wing are filled out");
      return;
   }
   var payload = {"add":1}; 
   payload.title = document.getElementById("title").value;
   payload.artist = document.getElementById("artist").value;
   if (artists.includes(payload.artist) == 0 && payload.artist != "") {
      alert(payload.artist + " is a new artist. please update on manage page.");
   }
   payload.medium = document.getElementById("medium").value;
   if (mediums.includes(payload.medium) == 0) {
      alert(payload.medium + " is a new medium. please update on manage page.");
   }
   payload.style = document.getElementById("style").value;
   if (styles.includes(payload.style) == 0) {
      alert(payload.style + " is a new style. please update on manage page.");
   }
   payload.wing = document.getElementById("wing").value;
   if (wings.includes(payload.wing) == 0) {
      alert(payload.wing + " is a new wing. please update on manage page.");
   }
   payload.date = document.getElementById("completed").value;
   payload.city = document.getElementById("city").value;
   payload.country = document.getElementById("country").value;
   payload.description = document.getElementById("description").value;
   var req = new XMLHttpRequest();
   req.open("POST", "/addArtwork", true);
   req.setRequestHeader("Content-Type", "application/json");
   req.send(JSON.stringify(payload));
   req.addEventListener("load",function(){
      if(req.status >= 200 && req.status < 400){
         // FIXME 
         // what to do with add request response
         console.log(req.response);
      }
      else {
         console.log("Error: " + req.statusText);
      }
   });
};

function initPage(){
   bindAddButton();
   addAutocomplete();
};

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}

function bindAddButton(){
   try {
   document.getElementById("addButton").addEventListener("click", initAddButton);
   }
   catch(err) {
      console.log(err);
   }
};

function addAutocomplete(){
   autocomplete(document.getElementById("artist"), artists);
   autocomplete(document.getElementById("style"), styles);
   autocomplete(document.getElementById("medium"), mediums);
   autocomplete(document.getElementById("wing"), wings);
}
