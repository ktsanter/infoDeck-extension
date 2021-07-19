define(function (require) {
  //require('clipboard_copy'); 
  //require('paramstorage');  

  require('create_element');  
  require('utilitykts');
  require('standard_notice'); 
  require('sqldbinterface'); 

  require('popup');

  document.addEventListener('DOMContentLoaded', app.init());
});
