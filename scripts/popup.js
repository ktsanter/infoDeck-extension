//------------------------------------------------------------------------------
// infoDeck popup (Chrome extension)
//------------------------------------------------------------------------------
// TODO:
//------------------------------------------------------------------------------
var __USELOCALHOST__ = false;

const app = function () {
	const page = {};
  
	const settings = {
    hideClass: 'hide-me',
    info: null,
    accesskeydispatch: {"target": {"id": "accesskey"}, "dummy": true}
	};
  
	//---------------------------------------
	// get things going
	//----------------------------------------
	async function init () {
    page.body = document.getElementsByTagName('body')[0];
    page.errorContainer = page.body.getElementsByClassName('error-container')[0];
    page.messageContainer = page.body.getElementsByClassName('message')[0];
    
    page.notice = new StandardNotice(page.errorContainer, page.errorContainer);
    page.notice.setNotice('initializing...', true);
    
    renderPage();
    mainNavbarEnable(false);
    
    await loadUserSettings();
    configureBasedOnUserSettings();
    if (!userSettings.accesskey) {
      navDispatch(settings.accesskeydispatch);
      return;
    }
    
    var initialLoad = await getDBData();
    if (!initialLoad.success) return;
    
    mainNavbarEnable(true);
    showContents('students');
  }

  function configureBasedOnUserSettings() {
    __USELOCALHOST__ = userSettings.uselocal;

    var host = 'https://aardvark-studios.com';
    if (userSettings.uselocal) host = 'http://localhost:8000';
    
    settings.rosterManagerURL = host + '/roster-manager';
    settings.endDateManagerURL = host + '/enddate-manager/manager';
    settings.helpURL = host + '/rostermanager/extension-help';   
    
    var elemLogo = page.body.getElementsByClassName('navbar-logo')[0];
    if (userSettings.uselocal) elemLogo.innerHTML += ' (local)';
  }    
	//--------------------------------------------------------------
	// page rendering
	//--------------------------------------------------------------
  function renderPage() {
    renderNavbar();
    renderStudents();
    renderMentors();
    renderAccessKeyDialog();
  }
  
  function renderNavbar() {
    page.navContainer = page.body.getElementsByClassName('nav-container')[0];
    var elemDropdown = page.navContainer.getElementsByClassName('dropdown')[0];
    
    elemDropdown.getElementsByClassName('item-rostermanager')[0].addEventListener('click', (e) => { openRosterManager(e); });
    elemDropdown.getElementsByClassName('item-enddatemanager')[0].addEventListener('click', (e) => { openEndDateManager(e); });
    elemDropdown.getElementsByClassName('item-accesskey')[0].addEventListener('click', () => { navDispatch(settings.accesskeydispatch); });
    elemDropdown.getElementsByClassName('item-help')[0].addEventListener('click', (e) => { openHelp(e); });
    
    var navbarItems = page.navContainer.getElementsByClassName('navbar-item');
    for (var i = 0; i < navbarItems.length; i++) {
      navbarItems[i].addEventListener('click', (e) => { navDispatch(e); });
    }
  }
  
  function renderStudents() {
    page.studentsContainer = page.body.getElementsByClassName('content-container students')[0];
    settings.studentViewer = new StudentViewer({
      "container": page.studentsContainer,
      "message": message,
      "callbackPropertyChange": handleStudentPropertyChange
    });
    settings.studentViewer.render();
  }
  
  function renderMentors() {
    page.mentorsContainer = page.body.getElementsByClassName('content-container mentors')[0];
    settings.mentorViewer = new MentorViewer({
      "container": page.mentorsContainer,
      "message": message,
      "callbackPropertyChange": handleMentorPropertyChange
    });
    settings.mentorViewer.render();  
  }
  
  function renderAccessKeyDialog() {
    page.accesskeyDialog = page.body.getElementsByClassName('accesskey-dialog')[0];
    page.accesskeyInput = page.accesskeyDialog.getElementsByClassName('input-accesskey')[0];    
    
    page.accesskeyDialog.getElementsByClassName('button-accesskey')[0].addEventListener('click', (e) => { handleAccessKeySubmit(e); });
  }
    
	//--------------------------------------------------------------
	// updating
	//--------------------------------------------------------------
  async function getDBData(skipDisplayUpdate) {
    var dbResult = await getInfoDeckData();

    if (dbResult.success) {
      await saveUserSettings();
      settings.rawinfo = dbResult.data;
      settings.studentinfo = DataPackager.packageStudentInfo(settings.rawinfo.rosterinfo, settings.rawinfo.studentproperties);
      settings.mentorinfo = DataPackager.packageMentorInfo(settings.rawinfo.rosterinfo, settings.rawinfo.mentorproperties);

      if (!skipDisplayUpdate) updateDisplay();
      
    } else {
      console.log('getDBData: fail', dbResult);
      message('failed to fetch data');
    }
    
    return dbResult;
  }
  
  function openAccessKeyDialog() {    
    UtilityKTS.setClass(page.accesskeyDialog, settings.hideClass, false);
    page.accesskeyInput.value = '';
    if (userSettings.accesskey) page.accesskeyInput.value = userSettings.accesskey;
  }
  
  function showContents(viewName) {
    message('');
    var containers = page.body.getElementsByClassName('content-container');
    for (var i = 0; i < containers.length; i++) {
      var id = containers[i].id;
      UtilityKTS.setClass(containers[i], settings.hideClass, id != 'content-' + viewName);
    }
    UtilityKTS.setClass(page.errorContainer, settings.hideClass, true);
    
    var routeMap = {
      "students": showStudents,
      "mentors": showMentors,
      "accesskey": openAccessKeyDialog
    }
    
    settings.currentView = viewName;    
    emphasizeNavbarItem();
    
    if (routeMap.hasOwnProperty(viewName)) routeMap[viewName]();
  }
  
  function showStudents() {
    settings.studentViewer.focusOnInput();
  }
  
  function showMentors() {}
  
  function mainNavbarEnable(enable) {
    var navbarItems = page.navContainer.getElementsByClassName('navbar-item');
    for (var i = 0; i < navbarItems.length; i++) {
      UtilityKTS.setClass(navbarItems[i], 'disabled', !enable);
    }
  }

  function emphasizeNavbarItem() {
    var items = page.navContainer.getElementsByClassName('navbar-item');
    for (var i = 0; i < items.length; i++) {
      UtilityKTS.setClass(items[i], 'emphasized', items[i].id == settings.currentView);
    }
  }
  
  function updateDisplay() {
    settings.studentViewer.update(settings.studentinfo);
    settings.mentorViewer.update(settings.mentorinfo);
  }    
  
	//--------------------------------------------------------------
	// handlers
	//--------------------------------------------------------------
  function navDispatch(e) {
    if (!e.dummy && e.target.classList.contains('disabled')) return;
    
    var dispatchMap = {
      "accesskey": function() { showContents('accesskey'); },
      "students": function() {showContents('students'); },
      "mentors": function() {showContents('mentors'); }
    }

    var dispatchTarget = e.target.id;
    dispatchMap[dispatchTarget]();
  }
  
  async function handleAccessKeySubmit(e) {
    var originalKey = userSettings.accesskey;
    var proposedKey = page.accesskeyInput.value;

    if (proposedKey && proposedKey.length > 0) {
      userSettings.accesskey = proposedKey;
      var result = await getDBData();
      if ( result.success ) {
        showContents('students');
        mainNavbarEnable(true);
      } else {
        userSettings.accesskey = originalKey;
        message('invalid access key');
      }
    }
  }
  
  function openRosterManager(e) {
    window.open(settings.rosterManagerURL, '_blank');
  }
  
  function openEndDateManager(e) {
    window.open(settings.endDateManagerURL, '_blank');
  }
  
  function openHelp(e) {
    window.open(settings.helpURL, '_blank');
  }
  
  //---------------------------------------
  // local storage
  //---------------------------------------
  async function loadUserSettings() {
    page.notice.setNotice('loading user settings...', true);
    var paramList = [
      {paramkey: 'infodeck-accesskey', resultkey: 'accesskey', defaultval: null},
      {paramkey: 'infodeck-uselocal', resultkey: 'uselocal', defaultval: false},
    ];
    
    userSettings = await ParamStorage.load(paramList);
    console.log('environment: ' + (userSettings.uselocal ? 'local' : 'prod'));
    page.notice.setNotice('');
  }
  
  async function saveUserSettings() {
    var paramList = [
      {paramkey: 'infodeck-accesskey', value: userSettings.accesskey} 
    ];
    
    await ParamStorage.store(paramList);
  }

	//---------------------------------------
	// DB interface
	//---------------------------------------
  async function getInfoDeckData() {
    var dbResult = await SQLDBInterface.doPostQuery('infodeck/query', 'infodeck-data', {"accesskey": userSettings.accesskey}, page.notice);

    if (!dbResult.success) {
      console.log('failed to read roster info', dbResult.details);
    }

    return dbResult;
  }
  
  async function handleStudentPropertyChange(params) {
    var result = {success: false, details: 'unrecognized action', data: null};
    
    var queryType, dbparams;
    
    if (params.action == 'update-preferredname') {
      queryType = 'infodeck-preferredname';
      dbparams = {
        "accesskey": userSettings.accesskey,
        "student": params.studentdata.enrollments[0].student,
        "preferredname": params.value
      }        
      
    }  else if (params.action == 'update-pronouns') {
      queryType = 'infodeck-pronouns';      
      dbparams = {
        "accesskey": userSettings.accesskey,
        "student": params.studentdata.enrollments[0].student,
        "pronouns": params.value
      }        
      
    }  else if (params.action == 'add-note') {
      queryType = 'infodeck-addnote';      
      dbparams = {
        "accesskey": userSettings.accesskey,
        "student": params.studentdata.enrollments[0].student,
        "notetext": params.value,
        "datestamp": params.datestamp
      }        
      
    } else if (params.action == 'update-note') {
      queryType = 'infodeck-updatenote'; 
      dbparams = {
        "accesskey": userSettings.accesskey,
        "student": params.studentdata.enrollments[0].student,
        "noteid": params.notedata.noteid,
        "notetext": params.value,
        "datestamp": params.datestamp
      }        
      
    } else if (params.action == 'delete-note') {
      queryType = 'infodeck-deletenote';      
      dbparams = {
        "accesskey": userSettings.accesskey,
        "student": params.studentdata.enrollments[0].student,
        "noteid": params.notedata.noteid
      }
      
    } else {
      return result;
    }
    
    result = await SQLDBInterface.doPostQuery('infodeck/query', queryType, dbparams, page.notice);

    if (!result.success) {
      message('update failed');
      console.log('failed to update student property', result.details);
    }
    
    await getDBData(true);

    return result;
  }
  
  async function handleMentorPropertyChange(params) {
    var dbParams = {
      "accesskey": userSettings.accesskey,
      ...params
    };
    
    result = await SQLDBInterface.doPostQuery('infodeck/query', 'infodeck-mentorwelcome', dbParams, page.notice);

    if (!result.success) {
      message('update failed');
      console.log('failed to update mentor property', result.details);
    }
    
    await getDBData(true);

    return result;
  }
  
	//---------------------------------------
	// utility
	//---------------------------------------
  function message(msg) {
    page.messageContainer.innerHTML = msg;
  }
  
	//---------------------------------------
	// initialization
	//---------------------------------------
	return {
		init: init
 	};
}();
