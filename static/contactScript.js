document.addEventListener("DOMContentLoaded", bindSubmit); 

function bindSubmit(){
   document.getElementById("formButton").addEventListener("click", function(event){
      event.preventDefault();
      document.getElementsByTagName("form")[0].checkValidity();
      document.getElementsByTagName("form")[0].reportValidity();
      document.getElementsByTagName("form")[0].submit();
      document.getElementsByTagName("form")[0].reset();
   })
}
