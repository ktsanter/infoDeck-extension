//-------------------------------------------------------------------
// StudentViewer
//-------------------------------------------------------------------
// TODO:
//-------------------------------------------------------------------
class StudentViewer {
  constructor(config) {
    this.config = config;
    this.settings = {};
    this.data = null;
  }
  
  //--------------------------------------------------------------
  // public methods
  //--------------------------------------------------------------
  render() {
    this.selectionContainer = CreateElement.createDiv(null, 'student-selection-container');
    this.studentDataContainer = CreateElement.createDiv(null, 'student-data-container');
    this.config.container.appendChild(this.selectionContainer);
    this.config.container.appendChild(this.studentDataContainer);
    
    var iconContainer = CreateElement.createDiv(null, 'icon-container');
    this.selectionContainer.appendChild(iconContainer);

    this.iconIEP = CreateElement.createImage(null, 'icon icon-image icon-iep hide-me', 'https://res.cloudinary.com/ktsanter/image/upload/v1625677834/Roster%20Manager/iep_standardized.png', 'student has IEP' );
    this.icon504 = CreateElement.createImage(null, 'icon icon-image icon-iep hide-me', 'https://res.cloudinary.com/ktsanter/image/upload/v1625677834/Roster%20Manager/504_standardized.png', 'student has 504' );
    this.iconHomeSchooled = CreateElement.createIcon(null, 'icon icon-homeschooled fas fa-home hide-me', 'student is homeschooled');
    
    iconContainer.appendChild(this.iconIEP);
    iconContainer.appendChild(this.icon504);
    iconContainer.appendChild(this.iconHomeSchooled);
  }
  
  update(studentData) {
    console.log('StudentViewer.update', studentData);
    this.data = studentData;

    this._updateStudentList();
  }
  
  focusOnInput() {
    this.fuzzyInput.focusOnInput();
  }

  //--------------------------------------------------------------
  // private methods
  //--------------------------------------------------------------   
  _updateStudentList() {
    this.fuzzyInput = new FuzzyInputControl(
      this.data.studentList,
      (selection) => { this._handleSelection(selection); },
      this._isFuzzyEqual,
      ''
    );
    
    var elem = this.fuzzyInput.render()
    elem.classList.add('decklayout-select-control');
    this.selectionContainer.insertBefore(elem, this.selectionContainer.childNodes[0]);
  }
  
  _displayStudentInfo(studentName) {
    var studentData = this.data.students[studentName];

    UtilityKTS.setClass(this.iconIEP, 'hide-me', !studentData.iep);
    UtilityKTS.setClass(this.icon504, 'hide-me', !studentData["504"]);
    UtilityKTS.setClass(this.iconHomeSchooled , 'hide-me', !studentData.homeschooled);

    var temp = '';
    temp += JSON.stringify(studentData.enrollments);
    temp += '<br><br>';
    temp += JSON.stringify(studentData.mentors);
    temp += '<br><br>';
    temp += JSON.stringify(studentData.guardians);
    temp += '<br><br>';
    temp += JSON.stringify(studentData);
    this.studentDataContainer.innerHTML = temp;
  }
  
  //--------------------------------------------------------------
  // handlers
  //-------------------------------------------------------------- 
  _handleSelection(selection) {
    this._displayStudentInfo(selection);
  }    
  
  //---------------------------------------
  // clipboard functions
  //----------------------------------------
  _copyToClipboard(txt) {
    if (!this.settings.clipboard) this.settings.clipboard = new ClipboardCopy(this.config.container, 'plain');

    this.settings.clipboard.copyToClipboard(txt);
	}	 
  
  //--------------------------------------------------------------
  // utility
  //--------------------------------------------------------------
  _isFuzzyEqual(fullValue, enteredValue) {
    var lowerFull = fullValue.toLowerCase();
    var lowerEntered = enteredValue.toLowerCase();
    
    var found = lowerFull.indexOf( lowerEntered );
    var markedEqualText = '';
    if (found >= 0) {
      var left = fullValue.substring(0, found);
      var mid = fullValue.substring(found, found + enteredValue.length);
      var right = fullValue.substring(found + enteredValue.length);
      markedEqualText = left + '<strong>' + mid + '</strong>' + right;
    }
    
    return {
      "isEqual": found >= 0,
      "markedEqualText": markedEqualText
    };
  }
}
