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
    console.log('studentData',  studentData);

    UtilityKTS.setClass(this.iconIEP, 'hide-me', !studentData.iep);
    UtilityKTS.setClass(this.icon504, 'hide-me', !studentData["504"]);
    UtilityKTS.setClass(this.iconHomeSchooled , 'hide-me', !studentData.homeschooled);

    UtilityKTS.removeChildren(this.studentDataContainer);
    
    this.studentDataContainer.appendChild(this._displayPreferredName(studentData));
    this.studentDataContainer.appendChild(CreateElement.createDiv(null, null, studentData.enrollments[0].email));
    this.studentDataContainer.appendChild(CreateElement.createDiv(null, null, studentData.enrollments[0].affiliation));
    
    this.studentDataContainer.appendChild(this._displayEnrollments(studentData.enrollments));
    this.studentDataContainer.appendChild(this._displayMentors(studentData.mentors));
    this.studentDataContainer.appendChild(this._displayGuardians(studentData.guardians));
  }
  
  _displayPreferredName(studentData) {
    var container = CreateElement.createDiv(null, null);
    
    var icon = CreateElement.createIcon(null, 'icon icon-preferredname fas fa-edit');
    icon.title = 'edit preferred name';
    icon.setAttribute("studentdata", JSON.stringify(studentData));
    icon.addEventListener('click', (e) => { this._handlePreferredNameEdit(e); });
    container.appendChild(icon);
    
    container.appendChild(CreateElement.createSpan(null, null, studentData.preferredname));
    
    return container;
  }
  
  _displayEnrollments(enrollments) {
    var container = CreateElement.createDiv(null, 'enrollments');
    container.appendChild(CreateElement.createDiv(null, 'enrollments-label', 'enrollments'));
    
    for (var i = 0; i < enrollments.length; i++) {
      var termContainer = CreateElement.createDiv(null, null);
      container.appendChild(termContainer);
      
      var elemSection = CreateElement.createDiv(null, 'enrollmentcell cell-section', enrollments[i].section);
      elemSection.title = enrollments[i].term;
      var elemStartDate = CreateElement.createDiv(null, 'enrollmentcell cell-startdate', enrollments[i].startdate);
      var elemEndDate = CreateElement.createDiv(null, 'enrollmentcell cell-enddate', enrollments[i].enddate);

      termContainer.appendChild(elemSection);
      termContainer.appendChild(elemStartDate);
      termContainer.appendChild(elemEndDate);
    }
    
    return container;
  }
  
  _displayMentors(mentors) {
    var container = CreateElement.createDiv(null, 'mentors');
    container.appendChild(CreateElement.createDiv(null, 'mentors-label', 'mentors'));
    
    if (mentors.length == 0) {
      container.appendChild(CreateElement.createDiv(null, 'no-mentors', 'no mentor data available'));
      return container;
    }
    
    for (var i = 0; i < mentors.length; i++) {
      var termContainer = CreateElement.createDiv(null, null);
      container.appendChild(termContainer);
      
      var elemName = CreateElement.createDiv(null, 'mentorcell cell-name', mentors[i].name);
      var elemEmail = CreateElement.createDiv(null, 'mentorcell cell-email', mentors[i].email);
      var elemPhone = CreateElement.createDiv(null, 'mentorcell cell-phone', mentors[i].phone);

      termContainer.appendChild(elemName);
      termContainer.appendChild(elemEmail);
      termContainer.appendChild(elemPhone);
    }
    
    return container;
  }
    
  _displayGuardians(guardians) {
    var container = CreateElement.createDiv(null, 'guardians');
    container.appendChild(CreateElement.createDiv(null, 'guardians-label', 'guardians'));
    
    if (guardians.length == 0) {
      container.appendChild(CreateElement.createDiv(null, 'no-guardians', 'no guardian data available'));
      return container;
    }
    
    for (var i = 0; i < guardians.length; i++) {
      var termContainer = CreateElement.createDiv(null, null);
      container.appendChild(termContainer);
      
      var elemName = CreateElement.createDiv(null, 'guardiancell cell-name', guardians[i].name);
      var elemEmail = CreateElement.createDiv(null, 'guardiancell cell-email', guardians[i].email);
      var elemPhone = CreateElement.createDiv(null, 'guardiancell cell-phone', guardians[i].phone);

      termContainer.appendChild(elemName);
      termContainer.appendChild(elemEmail);
      termContainer.appendChild(elemPhone);
    }
    
    return container;
  }
  
  _editPreferredName(studentData) {
    var currentValue = studentData.preferredname;

    var msg = 'Please enter the preferred name for the student';
    var result = prompt(msg, currentValue);
    if (!result || result == currentValue) return;
    result = this._sanitizeText(result);
    
    var studentFullName = studentData.enrollments[0].student;
    console.log('save "' + result + '" as the preferred name for ' + studentFullName);
  }
    
  //--------------------------------------------------------------
  // handlers
  //-------------------------------------------------------------- 
  _handleSelection(selection) {
    this._displayStudentInfo(selection);
  }
  
  _handlePreferredNameEdit(e) {
    this._editPreferredName(JSON.parse(e.target.getAttribute("studentdata")));
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
  
  _sanitizeText(str) {
    var sanitized = str;
    
    sanitized = sanitized.replace(/[^A-Za-z\s'\.]/g, '');
    
    return sanitized;
  }
  
}
