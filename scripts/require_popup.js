define(function (require) {
  require('create_element');  
  require('utilitykts');
  require('standard_notice'); 
  require('sqldbinterface'); 
  require('paramstorage'); 
  require('clipboard_copy');   
  require('classDataPackager');
  require('classMentorViewer');
  require('classStudentViewer');
  require('fuzzyinputcontrol');

  require('popup');

  document.addEventListener('DOMContentLoaded', app.init());
});
