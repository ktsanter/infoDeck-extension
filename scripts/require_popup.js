define(function (require) {
  //require('clipboard_copy'); 

  require('create_element');  
  require('utilitykts');
  require('standard_notice'); 
  require('sqldbinterface'); 
  require('paramstorage');  

  require('popup');

  document.addEventListener('DOMContentLoaded', app.init());
});
