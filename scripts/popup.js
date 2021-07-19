//------------------------------------------------------------------------------
// infoDeck popup (Chrome extension)
//------------------------------------------------------------------------------
// TODO:
//------------------------------------------------------------------------------
var __USELOCALHOST__ = true;

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
    var result = await getDBData();
    if (!result.success) return;
    
    page.notice.setNotice('');
    
    _debugMessage('so far, so good');
  }
  
	//--------------------------------------------------------------
	// page rendering
	//--------------------------------------------------------------
  function renderPage() {
  }
    
	//--------------------------------------------------------------
	// updating
	//--------------------------------------------------------------
  async function getDBData() {
    var result = {success: false, details: 'failed to get DB data', data: null};
    
    var dbResult = await getDBRosterInfo();
    if (!dbResult.success) {
      result.details = dbResult.details;
      return result
    }
    var rosterInfo = dbResult.data;

    dbResult = await getDBStudentProperties();
    if (!dbResult.success) {
      result.details = dbResult.details;
      return result;
    }
    var extraStudentInfo = dbResult.data;

    return result;
  }
  
	//--------------------------------------------------------------
	// handlers
	//--------------------------------------------------------------
  
  //---------------------------------------
  // local storage
  //---------------------------------------
  
	//---------------------------------------
	// DB interface
	//---------------------------------------
  async function getDBRosterInfo() {
    var dbResult = await SQLDBInterface.doGetQuery('roster-manager/query', 'rosterinfo', page.notice);
    console.log('getDBRosterInfo', dbResult);

    if (!dbResult.success) {
      console.log('failed to read roster info', dbResult.details);
    }

    return dbResult;
  }
  
  async function getDBStudentProperties() {
    return {success: false, details: 'testing...', data: null};
  }  

	//---------------------------------------
	// utility
	//---------------------------------------
  function _debugMessage(msg) {
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
