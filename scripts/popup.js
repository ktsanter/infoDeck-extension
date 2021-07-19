//------------------------------------------------------------------------------
// infoDeck popup (Chrome extension)
//------------------------------------------------------------------------------
// TODO:
//------------------------------------------------------------------------------
var __USELOCALHOST__ = false;

const app = function () {
	const page = {};
  
	const settings = {
    hideClass: 'hide-me'
	};
  
	//---------------------------------------
	// get things going
	//----------------------------------------
	async function init () {
    page.body = document.getElementsByTagName('body')[0];
    page.errorContainer = page.body.getElementsByClassName('error-container')[0];
    
    page.notice = new StandardNotice(page.errorContainer, page.errorContainer);
    page.notice.setNotice('loading...', true);
    
    renderPage();
    
    await loadUserSettings();
    __USELOCALHOST__ = userSettings.uselocal;
    if (userSettings.uselocal) console.log('popup.js: using localhost');
    
    if (!userSettings.accesskey) {
      openAccessKeyDialog();
      page.notice.setNotice('');
      return;
    }
    
    var result = await getDBData();
    console.log('getDBData result', result);
    if (!result.success) return;
    
    debugMessage(JSON.stringify(result));
    
    page.notice.setNotice('');
  }
  
	//--------------------------------------------------------------
	// page rendering
	//--------------------------------------------------------------
  function renderPage() {
    renderAccessKeyDialog();
  }
  
  function renderAccessKeyDialog() {
    page.accesskeyDialog = page.body.getElementsByClassName('accesskey-dialog')[0];
    page.accesskeyInput = page.accesskeyDialog.getElementsByClassName('input-accesskey')[0];    
    
    page.accesskeyDialog.getElementsByClassName('button-accesskey')[0].addEventListener('click', (e) => { handleAccessKeySubmit(e); });
  }
    
	//--------------------------------------------------------------
	// updating
	//--------------------------------------------------------------
  async function getDBData() {
    var dbResult = await getInfoDeckData();

    if (dbResult.success) {
      await saveUserSettings();
      console.log('collate data');
    }
    
    return dbResult;
  }

  function openAccessKeyDialog() {    
    UtilityKTS.setClass(page.accesskeyDialog, settings.hideClass, false);
    page.accesskeyInput.value = '';
    if (userSettings.accesskey) page.accesskeyInput.value = userSettings.accesskey;
  }
  
	//--------------------------------------------------------------
	// handlers
	//--------------------------------------------------------------
  async function handleAccessKeySubmit(e) {
    var proposedKey = page.accesskeyInput.value;

    if (proposedKey && proposedKey.length > 0) {
      userSettings.accesskey = proposedKey;
      if ( (await getDBData()) ) {
        UtilityKTS.setClass(page.accesskeyDialog, settings.hideClass, true);
      }
    }
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
  
	//---------------------------------------
	// utility
	//---------------------------------------
  function debugMessage(msg) {
    var elem = page.body.getElementsByClassName('debug')[0];
    elem.innerHTML = msg;
  }
  
	//---------------------------------------
	// initialization
	//---------------------------------------
	return {
		init: init
 	};
}();
