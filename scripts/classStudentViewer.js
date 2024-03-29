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
    this.iconCoach = CreateElement.createImage(null, 'icon icon-image icon-coach hide-me', 'https://res.cloudinary.com/ktsanter/image/upload/v1636133393/Roster%20Manager/coach3.png', 'student has coach' );
    
    iconContainer.appendChild(this.iconIEP);
    iconContainer.appendChild(this.icon504);
    iconContainer.appendChild(this.iconHomeSchooled);
    iconContainer.appendChild(this.iconCoach);
  }
  
  update(studentData) {
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
    console.log('StudentViewer._displayStudentInfo', studentData);

    UtilityKTS.setClass(this.iconIEP, 'hide-me', !studentData.iep);
    UtilityKTS.setClass(this.icon504, 'hide-me', !studentData["504"]);
    UtilityKTS.setClass(this.iconHomeSchooled , 'hide-me', !studentData.homeschooled);
    UtilityKTS.setClass(this.iconCoach, 'hide-me', !studentData.hascoach);

    UtilityKTS.removeChildren(this.studentDataContainer);
    
    this.studentDataContainer.appendChild(CreateElement.createDiv(null, null, studentData.enrollments[0].email));
    this.studentDataContainer.appendChild(CreateElement.createDiv(null, null, studentData.enrollments[0].affiliation));
    this.studentDataContainer.appendChild(this._displayPreferredName(studentData));
    this.studentDataContainer.appendChild(this._displayPronouns(studentData));
    
    this.studentDataContainer.appendChild(this._displayEnrollments(studentData.enrollments, studentData.enddateoverride));
    this.studentDataContainer.appendChild(this._displayMentors(studentData.mentors));
    this.studentDataContainer.appendChild(this._displayGuardians(studentData.guardians));
    this.studentDataContainer.appendChild(this._displayNotes(studentData));
  }
  
  _displayPreferredName(studentData) {
    var container = CreateElement.createDiv(null, 'preferred-name');

    if (studentData.preferredname.length == 0) {
      container.innerHTML = 'no preferred name';
      container.classList.add('no-preferredname');
    } else {
      container.innerHTML = studentData.preferredname;
    }

    container.title = 'edit preferred name';
    container.setAttribute("studentdata", JSON.stringify(studentData));
    container.addEventListener('click', (e) => { this._handlePreferredNameEdit(e); });
    
    return container;
  }
  
  _displayPronouns(studentData) {
    var container = CreateElement.createDiv(null, 'pronouns');

    if (studentData.pronouns.length == 0) {
      container.innerHTML = 'not specified';
      container.classList.add('no-preferredname');
    } else {
      container.innerHTML = studentData.pronouns;
    }

    container.title = 'edit pronouns';
    container.setAttribute("studentdata", JSON.stringify(studentData));
    container.addEventListener('click', (e) => { this._handlePronounsEdit(e); });
    
    return container;
  }
  
  _displayEnrollments(enrollments, enddateOverrides) {
    var container = CreateElement.createDiv(null, 'enrollments');
    container.appendChild(CreateElement.createDiv(null, 'enrollments-label', 'enrollments'));
    
    for (var i = 0; i < enrollments.length; i++) {
      var enrollmentContainer = CreateElement.createDiv(null, null);
      container.appendChild(enrollmentContainer);
      
      var elemSection = CreateElement.createDiv(null, 'enrollmentcell cell-section', enrollments[i].section);
      elemSection.title = enrollments[i].term;
      var elemStartDate = CreateElement.createDiv(null, 'enrollmentcell cell-startdate', enrollments[i].startdate);
      var elemEndDate = CreateElement.createDiv(null, 'enrollmentcell cell-enddate', enrollments[i].enddate);
      var override = this._findEnddateOverride(enrollments[i], enddateOverrides);
      if (override) {
        elemEndDate.innerHTML = override;
        elemEndDate.appendChild(CreateElement.createIcon(null, 'icon icon-info far fa-calendar-alt', 'original end date: ' + enrollments[i].enddate));
      }

      enrollmentContainer.appendChild(elemSection);
      enrollmentContainer.appendChild(elemStartDate);
      enrollmentContainer.appendChild(elemEndDate);
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
  
  _displayNotes(studentData) {
    var container = CreateElement.createDiv(null, 'notes');
    var notes = studentData.notes;

    var elemLabel = CreateElement.createDiv(null, 'notes-label', 'notes')
    container.appendChild(elemLabel);
    var icon = CreateElement.createIcon(null, 'icon icon-addnote far fa-plus-square', 'add note');
    icon.setAttribute('studentdata', JSON.stringify(studentData));
    icon.addEventListener('click', (e) => { this._handleNoteAdd(e); });
    elemLabel.appendChild(icon);
    
    for (var i = 0; i < notes.length; i++) {
      var noteContainer = CreateElement.createDiv(null, 'noterow');
      container.appendChild(noteContainer);
      
      var elemDateStamp = CreateElement.createDiv(null, 'notecell cell-datestamp', notes[i].datestamp);
      var elemNoteText = CreateElement.createDiv(null, 'notecell cell-notetext', notes[i].notetext);
      elemNoteText.setAttribute('studentdata', JSON.stringify(studentData));
      elemNoteText.setAttribute('notedata', JSON.stringify(notes[i]));
      elemNoteText.addEventListener('click', (e) => { this._handleNoteEdit(e); });

      var elemControls = CreateElement.createDiv(null, 'notecell cell-controls');
      icon = CreateElement.createIcon(null, 'icon icon-deletenote far fa-trash-alt', 'delete note');
      icon.setAttribute('studentdata', JSON.stringify(studentData));
      icon.setAttribute('notedata', JSON.stringify(notes[i]));
      icon.addEventListener('click', (e) => { this._handleNoteDelete(e); });
      elemControls.appendChild(icon);

      noteContainer.appendChild(elemDateStamp);
      noteContainer.appendChild(elemNoteText);
      noteContainer .appendChild(elemControls);
    }
    
    return container;
  }
    
  _findEnddateOverride(enrollment, overrides) {
    var found = null;
    
    for (var i = 0; i < overrides.length && !found; i++) {
      if (enrollment.section == overrides[i].section) {
        found = overrides[i].enddate;
      }
    }
    
    return found;
  }
  
  async _editPreferredName(studentData) {
    var currentValue = studentData.preferredname;

    var msg = 'Please enter the preferred name for the student';
    var result = prompt(msg, currentValue);
    if (result == null || result == currentValue) return;
    result = this._sanitizeText(result);
         
    var callbackResult = await this.config.callbackPropertyChange({
      "action": 'update-preferredname',
      "studentdata": studentData,
      "value": result
    });

    if (callbackResult.success) this._updatePreferredName(callbackResult.data);
  }
    
  async _editPronouns(studentData) {
    var currentValue = studentData.pronouns;

    var msg = 'Please enter the preferred name for the student';
    var result = prompt(msg, currentValue);
    if (result == null || result == currentValue) return;
    result = this._sanitizeText(result);
         
    var callbackResult = await this.config.callbackPropertyChange({
      "action": 'update-pronouns',
      "studentdata": studentData,
      "value": result
    });

    if (callbackResult.success) this._updatePronouns(callbackResult.data);
  }
    
  async _editNote(studentData, noteData) {
    var currentValue = '';
    if (noteData) currentValue = noteData.notetext;
    var msg = 'Please enter the note text';
    var result = prompt(msg, currentValue);
    if (!result || result == currentValue) return;
    result = this._sanitizeText(result);
    var callbackResult = null;
    
    if (noteData) {
      callbackResult = await this.config.callbackPropertyChange({
        "action": 'update-note',
        "studentdata": studentData,
        "notedata": noteData,
        "value": result,
        "datestamp": this._shortDateStamp()
      });

    } else {
      callbackResult = await this.config.callbackPropertyChange({
        "action": 'add-note',
        "studentdata": studentData,
        "value": result,
        "datestamp": this._shortDateStamp()
      });
    }

    if (callbackResult.success) this._updateNotes(callbackResult.data);
  }
    
  async _deleteNote(studentData, noteData) {
    var msg = 'The note ';
    msg += '\n"' + noteData.notetext + '" ';
    msg += '\n will be deleted.';
    msg += '\n\n Choose OK to continue.';
    var confirmed = confirm(msg);
    if (!confirmed) return;
    
    var callbackResult = await this.config.callbackPropertyChange({
      "action": 'delete-note',
      "studentdata": studentData,
      "notedata": noteData
    });
    
    if (callbackResult.success) this._updateNotes(callbackResult.data);
  }
  
  _updatePreferredName(preferredNameData) {
    var currentContainer = this.config.container.getElementsByClassName('preferred-name')[0];
    var studentData = JSON.parse(currentContainer.getAttribute('studentdata'));
    studentData.preferredname = preferredNameData.preferredname;

    var newContainer = this._displayPreferredName(studentData);
    currentContainer.parentNode.replaceChild(newContainer, currentContainer);
    
    this._updateStudentData(studentData);
  }
  
  _updatePronouns(pronounsData) {
    var currentContainer = this.config.container.getElementsByClassName('pronouns')[0];
    var studentData = JSON.parse(currentContainer.getAttribute('studentdata'));
    studentData.pronouns = pronounsData.pronouns;    

    var newContainer = this._displayPronouns(studentData);
    currentContainer.parentNode.replaceChild(newContainer, currentContainer);
    
    this._updateStudentData(studentData);
  }
  
  _updateNotes(noteData) {
    var currentContainer = this.config.container.getElementsByClassName('notes')[0];
    var icon = currentContainer.getElementsByClassName('icon-addnote')[0];
    var studentData = JSON.parse(icon.getAttribute('studentdata'));
    studentData.notes = noteData;
    
    var newContainer = this._displayNotes(studentData);
    currentContainer.parentNode.replaceChild(newContainer, currentContainer);
    
    this._updateStudentData(studentData);
  }

  _updateStudentData(studentData) {
    var studentName = studentData.enrollments[0].student;
    this.data.students[studentName] = studentData;
  }
  
  //--------------------------------------------------------------
  // handlers
  //-------------------------------------------------------------- 
  _handleSelection(selection) {
    this._displayStudentInfo(selection);
  }
  
  async _handlePreferredNameEdit(e) {
    await this._editPreferredName(JSON.parse(e.target.getAttribute("studentdata")));
  }
  
  async _handlePronounsEdit(e) {
    await this._editPronouns(JSON.parse(e.target.getAttribute("studentdata")));
  }
  
  async _handleNoteAdd(e) {
    await this._editNote(JSON.parse(e.target.getAttribute("studentdata")));
  }
  
  async _handleNoteEdit(e) {
    await this._editNote(
      JSON.parse(e.target.getAttribute("studentdata")),
      JSON.parse(e.target.getAttribute("notedata"))
    );
  }
  
  async _handleNoteDelete(e) {
    await this._deleteNote(
      JSON.parse(e.target.getAttribute("studentdata")),
      JSON.parse(e.target.getAttribute("notedata"))
    );
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
    
    sanitized = sanitized.replace(/[^A-Za-z0-9\s'\.\/\-]/g, '');
    
    return sanitized;
  }
  
  _shortDateStamp() {
     var now = new Date();
     var y = String(now.getFullYear()).padStart(4, '0');
     var m = String(now.getMonth() + 1).padStart(2, '0');
     var d = String(now.getDate()).padStart(2, '0');
     
     return y + '-' + m + '-' + d;
  }  
}
