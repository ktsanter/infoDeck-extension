//-------------------------------------------------------------------
// MentorViewer
//-------------------------------------------------------------------
// TODO:
//-------------------------------------------------------------------
class MentorViewer {
  constructor(config) {
    this.config = config;
    this.settings = {};
    this.data = null;
  }
  
  //--------------------------------------------------------------
  // public methods
  //--------------------------------------------------------------
  render() {}
  
  update(mentorData) {
    this.data = mentorData;
    
    UtilityKTS.removeChildren(this.config.container);
    this.config.container.appendChild(this._renderMentorsBySection());
  }

  //--------------------------------------------------------------
  // private methods
  //--------------------------------------------------------------   
  _renderMentorsBySection() {
    var container = CreateElement.createDiv(null, null, 'no available mentor information');
    
    if (!this.data || !this.data.hasOwnProperty('mentorsBySection')) return container;
    container.innerHTML = '';
    
    var firstSection = true;
    for (var section in this.data.mentorsBySection) {
      var sectionInfo = this.data.mentorsBySection[section];
      this._renderSection(section, sectionInfo, container, firstSection);
      firstSection = false;
    }
    
    return container;
  }
    
  _renderSection(section, sectionItem, container, firstSection) {    
    var sectionClasses = 'section-label';
    if (!firstSection) sectionClasses += ' not-first';
    var sectionLabel = CreateElement.createDiv(null, sectionClasses, section);
    container.appendChild(sectionLabel);
    
    var headerFields = ['name', 'email', 'phone'];
    var headerNames = ['name', 'email', 'phone'];

    var sortedMentors = this._sortMentorsForSection(sectionItem);
      var emailsForSection = '';
    for (var m = 0; m < sortedMentors.length; m++) {
      var mentor = sortedMentors[m];
      var row = CreateElement.createDiv(null, 'mentor-row');
      container.appendChild(row);
      
      for (var i = 0; i < headerFields.length; i++) {
        var name = headerNames[i];
        var value = mentor[headerFields[i]];
        var classes = 'cell-label cell-' + name;
        var elem = CreateElement.createDiv(null, classes, value);
        
        if (name == 'email') {
          elem.title = 'copy email';
          elem.addEventListener('click', (e) => { this._handleEmailClick(e); })
          emailsForSection += value + ';'; 
        }
        
        row.appendChild(elem);
      }
    }

    sectionLabel.title = 'copy all emails for section';
    sectionLabel.setAttribute("section-emails", emailsForSection);
    sectionLabel.addEventListener('click', (e) => { this._handleSectionClick(e); });
  }
  
  _sortMentorsForSection(sectionItem) {
    var mentorList = [];
    for (var mentor in sectionItem) {
      mentorList.push(sectionItem[mentor]);
    }
    
    mentorList = mentorList.sort(function(a,b) {
      return a.name.localeCompare(b.name);
    });
    
    return mentorList;
  }
  
  //--------------------------------------------------------------
  // handlers
  //--------------------------------------------------------------   
  _handleEmailClick(e) {
    this._copyToClipboard(e.target.innerHTML);
    this.config.message('email copied');
  }
  
  _handleSectionClick(e) {
    var sectionEmails = e.target.getAttribute('section-emails');
    this._copyToClipboard(sectionEmails);
    this.config.message('section emails copied');
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

}
